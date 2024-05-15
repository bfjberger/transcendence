import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from players_manager.models import Player
from .gamelogic import GameState

TICK_RATE = 60
TICK_DURATION = 1 / TICK_RATE

class RoomManager:
	"""
	Gère les salles de jeu en ligne, les connexions, les déconnexions,
	redirige les messages reçus du front vers la bonne salle et
	envoie les messages envoyés par une salle vers le front.

	Attributs:
		rooms (dict): Un dictionnaire avec les noms des salles comme clés et des objets GameState comme valeurs.

	Méthodes:
		room_available(): Renvoie le nom de la première salle disponible ou en crée une.
		create_room(room_name): Crée une nouvelle salle de jeu en ligne avec le nom donné.
		delete_room(room_name): Supprime la salle de jeu en ligne avec le nom donné.
		save_room(room_name, winner, loser): Appelle la méthode GameState responsable de la sauvegarde de la salle
	"""

	def __init__(self):
		self.rooms = {}

	def room_available(self):
		"""
		Renvoie le nom de la première salle disponible ou en crée une.

		Renvoie:
			str: Le nom de la première salle disponible ou le nom d'une nouvelle salle créée.
		"""
		for room_name in self.rooms:
			if len(self.rooms[room_name].players) < 2:
				return room_name
		new_room_name = f"room_{len(self.rooms) + 1}"
		self.create_room(new_room_name)
		return new_room_name

	def create_room(self, room_name):
		"""
		Crée une nouvelle salle de jeu en ligne avec le nom donné.

		Args:
			room_name (str): Le nom de la salle à créer.
		"""
		self.rooms[room_name] = GameState(room_name)

	def delete_room(self, room_name):
		"""
		Supprime la salle de jeu en ligne avec le nom donné.

		Args:
			room_name (str): Le nom de la salle à supprimer.
		"""
		if room_name in self.rooms.keys():
			del self.rooms[room_name]

	async def save_room(self, room_name, winner, loser):
		"""
		Sauvegarde la salle de jeu en ligne avec le nom donné.

		Si le room_name n'est pas dans le dictionnaire des salles,
		cela signifie que nous appelons cette fonction pour la deuxième fois et que la salle a déjà été sauvegardée et supprimée.

		Args:
			room_name (str): Le nom de la salle à sauvegarder.
			winner (str): La position du joueur gagnant.
			loser (str): La position du joueur perdant.
		"""
		if room_name in self.rooms.keys():
			await self.rooms[room_name].record_game_result(winner, loser)
			if len(self.rooms[room_name].players) == 0:
				self.delete_room(room_name)

class RoomConsumer(AsyncWebsocketConsumer):
	"""
	Représente une salle de jeu en ligne.

	Attributs:
		manager (RoomManager): L'objet gestionnaire de salle qui gère la salle.
		game_state_obj (GameState): L'objet d'état de jeu pour la salle.
		room_name (str): Le nom de la salle.
		update_lock (asyncio.Lock): Un verrou pour empêcher les mises à jour concurrentes de l'état de jeu.

	Les messages seront envoyés au groupe de la salle, qui est un groupe de canaux qui ont été ajoutés au même groupe.
	Les 3 méthodes send_game_* enverront un message au groupe de la salle en utilisant channel_layer.group_send,
	cet appel de fonction déclenchera la méthode correspondante dans la classe RoomConsumer :
	game_* qui utilise la méthode send() héritée de AsyncWebsocketConsumer,
	le contenu de l'argument event est ce qui a été passé dans la méthode send_game_* correspondante.

	Méthodes:
		connect(): Se connecte au websocket. Surcharge.
		disconnect(close_code): Se déconnecte du websocket. Surcharge.
		receive(text_data): Reçoit un message du websocket, redispatch vers la salle de destination. Surcharge.

		handle_new_connection(user): Gère une connexion au websocket qui a été acceptée.
		start_game(): Démarre le jeu dans la salle.
		end_game(): Termine le jeu dans la salle.

		get_update_lock(): Récupère le verrou de mise à jour pour la salle.
		game_loop(): La boucle de jeu pour la salle.

		game_start(event): Envoie le message 'début de jeu' à la connexion WebSocket.
		game_state(event): Envoie le message 'état de jeu' à la connexion WebSocket.
		player_disconnect(event): Envoie le message 'déconnexion du joueur' à la connexion WebSocket.
		game_end(event): Envoie le message 'fin de jeu' à la connexion WebSocket.

		send_game_start(): Prépare et envoie le message 'début de jeu' au groupe de la couche de canaux.
		send_game_state(): Prépare et envoie le message 'état de jeu' au groupe de la couche de canaux.
		send_game_end(winner): Prépare et envoie le message 'fin de jeu' au groupe de la couche de canaux.
	"""
	manager = RoomManager()
	game_state_obj = None
	room_name = None
	update_lock = None

	async def connect(self):
		"""
		Se connecte au websocket.
		Surcharge de la méthode connect de la classe AsyncWebsocketConsumer.

		Récupère l'objet utilisateur de la portée, c'est-à-dire l'utilisateur qui se connecte.
		Vérifie si l'utilisateur est authentifié.
		La méthode accept() accepte la connexion WebSocket et est nécessaire.
		"""
		user = self.scope['user']
		if user.is_authenticated:
			await self.accept()
			await self.handle_new_connection(user)
		else:
			await self.close()

	async def disconnect(self, close_code):
		"""
		Se déconnecte du websocket.
		Surcharge de la méthode disconnect de la classe AsyncWebsocketConsumer.

		Envoie un message au groupe de la salle pour informer les autres joueurs qu'un joueur s'est déconnecté.

		Args:
			close_code (int): Le code indiquant la raison de la déconnexion.
		"""
		await self.channel_layer.group_send(self.room_name,
			{
				'type': 'player_disconnect',
				'player_name': self.game_state_obj.players[self.position].player_model.nickname
			})

	async def receive(self, text_data):
		"""
		Reçoit un message du websocket.
		Surcharge de la méthode receive de la classe AsyncWebsocketConsumer.

		En fonction du type de message, redispatche le message vers la méthode appropriée.

		Pour le message player_disconnect, s'il ne reste qu'un joueur dans la salle, cela signifie que nous
		avons déjà envoyé le message game_end et que la salle a été sauvegardée et supprimée.
		Sinon, nous envoyons le message game_end avec la position du joueur gagnant, c'est-à-dire celui qui n'a pas quitté.

		Args:
			text_data (str): Le message reçu du websocket.
		"""
		data = json.loads(text_data)
		type = data['type']
		if type == 'set_player_movement':
			await self.game_state_obj.set_player_movement(data['player'], data['is_moving'], data['direction_v'])
		elif type == 'player_disconnect':
			if len(self.game_state_obj.players) == 1:
				self.manager.delete_room(self.room_name)
			if data["player_pos"] == 'player_left':
				await self.end_game('player_right')
			elif data["player_pos"] == 'player_right':
				await self.end_game('player_left')

	async def handle_new_connection(self, user):
		"""
		Gère une connexion au websocket qui a été acceptée.

		Récupère le nom de la salle où l'utilisateur se connectera.
		Récupère l'instance GameState de la salle.
		Récupère l'instance Player de l'utilisateur.

		En fonction de la salle, définit la position du joueur dans l'instance GameState et l'envoie au client.

		Ajoute la connexion actuelle au groupe de canaux de la salle.

		Démarre le jeu s'il y a deux joueurs dans la salle.

		Args:
			user (User): L'objet utilisateur représentant le joueur qui s'est connecté.
		"""
		self.room_name = self.manager.room_available()
		self.game_state_obj = self.manager.rooms.get(self.room_name)
		player = await sync_to_async(Player.objects.get)(owner=user)
		player.status = "PLAYING"
		await sync_to_async(player.save)()

		if len(self.game_state_obj.players) == 0:
			self.position = 'player_left'
			self.game_state_obj.add_player_to_dict(self.position, player)
			await self.send(text_data=json.dumps({
				'type': 'set_position',
				'position': self.position,
				'name': player.nickname
			}))
		else:
			self.position = 'player_right'
			self.game_state_obj.add_player_to_dict(self.position, player)
			await self.send(text_data=json.dumps({
				'type': 'set_position',
				'position': self.position,
				'name': player.nickname
			}))

		await self.channel_layer.group_add(self.room_name, self.channel_name)

		if len(self.game_state_obj.players) == 2:
			await self.start_game()

	async def start_game(self):
		"""
		Démarre le jeu dans la salle.
		Envoie le message 'game_start' au groupe de la salle.
		Crée un nouvel objet d'historique de jeu dans la base de données.
		Démarre la boucle de jeu.
		"""
		self.game_state_obj.is_running = True
		await self.send_game_start()
		await sync_to_async(self.game_state_obj.game_history.create)(
			self.game_state_obj.players['player_left'].player_model,
			self.game_state_obj.players['player_right'].player_model)
		asyncio.create_task(self.game_loop())

	async def end_game(self, winner):
		"""
		Termine le jeu dans la salle.

		Args:
			winner (str): La position du joueur gagnant.

		Si winner n'est pas nul, cela signifie que le jeu s'est terminé parce qu'un joueur s'est déconnecté.
		Dans ce cas, nous sauvegardons le jeu pour le joueur restant et
			envoyons l'événement 'game end' avec le nom du joueur qui s'est déconnecté.

		Sinon, nous obtenons la position du gagnant et du perdant et sauvegardons le jeu dans la base de données.
		"""
		self.game_state_obj.is_running = False
		if winner == 'player_left':
			await self.manager.save_room(self.room_name, winner, "player_right")
			await self.send_game_end(winner)
		elif winner == 'player_right':
			await self.manager.save_room(self.room_name, winner, "player_left")
			await self.send_game_end(winner)
		else:
			winner = await self.game_state_obj.get_winner_pos()
			loser = "player_left" if winner == "player_right" else "player_right"
			await self.manager.save_room(self.room_name, winner, loser)
			await self.send_game_end(winner)

	async def get_update_lock(self):
		"""
		Récupère le verrou de mise à jour pour la salle.

		Un verrou est une primitive de synchronisation qui peut être utilisée pour limiter l'accès à une ressource partagée.
		Comme un sémaphore, un verrou est un compteur qui est utilisé pour contrôler l'accès à une ressource partagée.
		Un verrou est dans l'un des deux états : verrouillé ou déverrouillé.
		"""
		if self.update_lock is None:
			self.update_lock = asyncio.Lock()
		return self.update_lock

	async def game_loop(self):
		"""
		La boucle de jeu pour la salle.
		Met à jour les positions des joueurs et de la balle et envoie l'état du jeu aux clients.
		"""
		async with await self.get_update_lock():
			while self.game_state_obj.is_running == True:
				await self.game_state_obj.update()
				await self.send_game_state()
				await asyncio.sleep(TICK_DURATION)
			await self.end_game(None)

	async def game_start(self, event):
		"""
		Envoie le message 'game_start' à la connexion WebSocket.
		Le contenu du message est les noms des joueurs dans la salle de jeu.

		Args:
			event (dict): Les données d'événement reçues de la couche de canaux.
		"""
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'player_left': event['player_left'],
			'player_right': event['player_right']
		}))

	async def game_state(self, event):
		"""
		Envoie le message 'game_state' à la connexion WebSocket.
		Le contenu du message est l'état du jeu :
			- les positions et les scores des joueurs
			- la position, la vélocité et la couleur de la balle

		Args:
			event (dict): Les données d'événement reçues de la couche de canaux.
		"""
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'player_left_y': event['player_left_y'],
			'player_right_y': event['player_right_y'],
			'player_left_score': event['player_left_score'],
			'player_right_score': event['player_right_score'],
			'ball_x': event['ball_x'],
			'ball_y': event['ball_y'],
			'ball_x_vel': event['ball_x_vel'],
			'ball_y_vel': event['ball_y_vel'],
			'ball_color': event['ball_color']
		}))

	async def player_disconnect(self, event):
		"""
		Envoie le message 'player_disconnect' à la connexion WebSocket.
		Le contenu du message est le nom du joueur qui s'est déconnecté.

		Args:
			event (dict): Les données d'événement reçues de la couche de canaux.
		"""
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'player_name': event['player_name']
		}))
		self.channel_layer.group_discard(self.room_name, self.channel_name)

	async def game_end(self, event):
		"""
		Envoie le message 'game_end' à la connexion WebSocket.
		Le contenu du message est la position du joueur gagnant.

		Args:
			event (dict): Les données d'événement reçues de la couche de canaux.
		"""
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'winner': event['winner']
		}))

	async def send_game_start(self):
		"""
		Envoie le message de début de jeu à tous les clients connectés.
		Le message contient les noms des joueurs dans la salle de jeu.
		"""
		await self.channel_layer.group_send(self.room_name,
			{
				'type': 'game_start',
				'player_left': self.game_state_obj.players['player_left'].player_model.nickname,
				'player_right': self.game_state_obj.players['player_right'].player_model.nickname,
			})

	async def send_game_state(self):
		"""
		Envoie l'état du jeu à tous les clients connectés.
		Le message contient :
			- le type du message
			- l'état du jeu :
				- les positions et les scores des joueurs
				- la position, la vélocité et la couleur de la balle
		"""
		await self.channel_layer.group_send(self.room_name,
			{
				'type': 'game_state',
				'player_left_y': self.game_state_obj.players['player_left'].y,
				'player_right_y': self.game_state_obj.players['player_right'].y,
				'player_left_score': self.game_state_obj.players['player_left'].score,
				'player_right_score': self.game_state_obj.players['player_right'].score,
				'ball_x': self.game_state_obj.ball.x,
				'ball_y': self.game_state_obj.ball.y,
				'ball_x_vel': self.game_state_obj.ball.x_vel,
				'ball_y_vel': self.game_state_obj.ball.y_vel,
				'ball_color': self.game_state_obj.ball.color,
			})

	async def send_game_end(self, winner):
		"""
		Envoie le message de fin de jeu à tous les clients connectés avec la position du joueur gagnant.

		Args:
			winner (str): La position du joueur gagnant.
		"""
		await self.channel_layer.group_send(self.room_name,
			{
				'type': 'game_end',
				'winner': winner,
			})
		self.channel_layer.group_discard(self.room_name, self.channel_name)
