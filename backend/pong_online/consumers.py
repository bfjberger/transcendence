import json
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer

from asgiref.sync import async_to_sync
from asgiref.sync import sync_to_async

from django.contrib.auth.models import User

from .gamelogic import GameState

from players_manager.models import Player
from games_manager.models import TwoPlayersGame

tick_rate = 60
tick_duration = 1 / tick_rate

class GameManager:
	"""
	Class representing a game manager that handles game rooms and players.

	Attributes:
		game_rooms (dict): A dictionary with the name of the game room as the key and as value
			another dictionary with two keys: the list of players and game state of the room.

	Methods:
		find_or_create_game_room(): Finds an available game room or creates a new one.
		add_player_to_room(room_name, player_id): Adds a player to a game room.
		remove_player_from_room(room_name, player_id): Removes a player from a game room.
		room_players(room_name): Returns a list of players in a game room.
		room_players_nb(room_name): Returns the number of players in a game room.
		display_all_rooms(): Displays information about all game rooms.
	"""

	def __init__(self):
		self.game_rooms = {}

	def find_or_create_game_room(self):
		"""
		Finds an available game room or creates a new one.

		In the for loop, 'room_name' is the key and 'room_data' is the value in the dictionary.

		Returns:
			str: The name of the game room.
		"""
		print('checking for available room ...')
		for room_name, room_data in self.game_rooms.items():
			if len(room_data['players']) < 2:
				print('Room available')
				return room_name
		print('no available room, creating one...')
		new_room = f"room_{len(self.game_rooms) + 1}"
		self.game_rooms[new_room] = {
			'players': [],
			'game_state': GameState()
		}
		print(new_room, 'created')
		return new_room

	def add_player_to_room(self, room_name, player):
		"""
		Adds a player to a game room.

		Args:
			room_name (str): The name of the game room.
			player (str): The Player instance.
		"""
		if room_name in self.game_rooms:
			if self.room_players_nb(room_name) < 2:
				print('---PLAYER :', player.nickname, 'IS JOINING', room_name)
				self.game_rooms[room_name]['players'].append(player)

	def remove_player_from_room(self, room_name, player_id):
		"""
		Removes a player from a game room.
		Delete the game room if it is empty.

		Args:
			room_name (str): The name of the game room.
			player_id (str): The ID of the player.

		Returns:
			bool: True if the player was successfully removed and the room is now empty, False otherwise.
		"""
		if room_name in self.game_rooms:
			if player_id in self.game_rooms[room_name]['players']:
				print('---PLAYER :', player_id, 'REMOVED FROM', room_name)
				self.game_rooms[room_name]['players'].remove(player_id)
				if self.room_players_nb(room_name) == 0:
					del self.game_rooms[room_name]
					return True
		return False

	def room_players(self, room_name):
		"""
		Returns a list of players in a game room.

		Args:
			room_name (str): The name of the game room.

		Returns:
			list: A list of player IDs in the game room.
		"""
		if room_name in self.game_rooms:
			return self.game_rooms[room_name]['players']
		return []

	def room_players_nb(self, room_name):
		"""
		Returns the number of players in a game room.

		Args:
			room_name (str): The name of the game room.

		Returns:
			int: The number of players in the game room.
		"""
		if room_name in self.game_rooms:
			return len(self.game_rooms[room_name]['players'])
		return 0

	def display_all_rooms(self):
		"""
		Displays information about all game rooms.
		"""
		for room, data in self.game_rooms.items():
			players = ', '.join(data['players'])
			print('-----GAME MANAGER------', f"Room: {room}, Players: {players}")


class GameConsumer(AsyncWebsocketConsumer):
	"""
	Represents a consumer for handling game-related WebSocket connections.

	Attributes:
		game_manager (GameManager): An instance of the GameManager class.
		game_room (str): The ID of the game room the consumer is connected to.
		game (GameState): The current game state, will be an instance of GameState class.
		update_lock (asyncio.Lock): A lock used to synchronize game updates.

	Methods:
		get_player_in_room(room_name, player_position): Returns the player instance in the room based on the player's position.
		get_winner(): Returns the winner of the game based on the scores.
		get_loser(): Returns the loser of the game based on the scores.

		connect(): Called when a WebSocket connection is established.
		disconnect(close_code): Called when a WebSocket connection is closed.

		receive(text_data): Called when a message is received from the WebSocket connection.

		game_start(event): Sends a game start event to the WebSocket connection.
		player_key_down(event): Sends a player key down event to the WebSocket connection.
		player_key_up(event): Sends a player key up event to the WebSocket connection.
		ball_update(event): Sends a ball update event to the WebSocket connection.
		game_state(event): Sends the current game state to the WebSocket connection.
		game_end(event): Sends a game end event to the WebSocket connection.

		send_game_end(winner): Sends a game end event to all connected clients.
		end_game(winner): Ends the game and sends a game end event to all connected clients.
		record_game_result(winner_id, loser_id): Records the result of the game by updating the player's records in the Players database.

		join_game(): Joins the game room and assigns a position to the player.
		get_update_lock(): Returns the update lock for synchronizing game updates.
		send_game_state(): Sends the current game state to all connected clients.
		game_loop(): The main game loop that updates the game state and sends updates to clients.
	"""
# ------------------------------- ATTRIBUTES ------------------------------- #
	game_manager = GameManager()
	game_room = None
	game = None
	update_lock = None

# ------------------------------- GETTERS ------------------------------- #

	def get_player_in_room(self, room_name, player_position):
		"""
		Returns the player instance in the room based on the player's position.

		Args:
			room_name (str): The name of the game room.
			player_position (str): The position of the player in the room.

		Returns:
			Player: The player instance in the room based on the player's position.
			None: If the room does not exist or the player is not in the room.
		"""
		if room_name in self.game_manager.game_rooms:
			if self.game_manager.room_players_nb(room_name) == 2:
				if player_position == 'player_one':
					return self.game_manager.game_rooms[room_name]['players'][0]
				elif player_position == 'player_two':
					return self.game_manager.game_rooms[room_name]['players'][1]
		return None

	def get_winner(self):
		"""
		Returns the winner of the game based on the scores.
		Search for it in the gameState instance.

		Returns:
			Player: The player instance of the winner.
			None: If there is no winner yet.
		"""
		if self.game.players[0].score >= self.game.winning_score:
			return self.get_player_in_room(self.game_room, 'player_one')
		elif self.game.players[1].score >= self.game.winning_score:
			return self.get_player_in_room(self.game_room, 'player_two')
		return None

	def get_loser(self):
		"""
		Returns the loser of the game based on the scores.
		Search for it in the gameState instance.

		Returns:
			Player: The player instance of the loser.
			None: If there is no loser yet.
		"""
		if self.game.players[0].score >= self.game.winning_score:
			return self.get_player_in_room(self.game_room, 'player_two')
		elif self.game.players[1].score >= self.game.winning_score:
			return self.get_player_in_room(self.game_room, 'player_one')
		return None

# ------------- HANDLING WEBSOCKET CONNECTIONS | COMMUNICATIONS -------------- #

	async def connect(self):
		"""
		Connects the player to the WebSocket. If the player is authenticated, it assigns the player to the consumer.
		The call to the accept() method accepts the WebSocket connection and is necessary.
		"""
		user = self.scope['user']

		if user.is_authenticated:
			self.player = await sync_to_async(Player.objects.get)(owner=user)
			# self.player_id = self.player.id
			self.player_id = user.username

		await self.accept()
		await self.join_game()

	async def disconnect(self, close_code):
		"""
		Disconnects the player from the game room and removes them from the room.
		Sends the 'player_left' message to the other player in the room that the player has left with the position of the player who left.

		Args:
			close_code (int): The close code for the WebSocket connection.
		"""
		if hasattr(self, 'game_room'):
			room_removed = self.game_manager.remove_player_from_room(self.game_room, self.player_id)
			if room_removed:
				await self.channel_layer.group_send(
					self.game_room,
					{
						'type': 'player_left',
						'player': self.position,
					})
				await self.channel_layer.group_discard(self.game_room, self.channel_name)
				self.game_room = None

	async def receive(self, text_data):
		"""
		Receives a message from the WebSocket connection and processes it.

		Args:
			text_data (str): The message received from the WebSocket connection.
		"""
		data = json.loads(text_data)
		data_type = data.get("type", "")
		data_value = data.get("value", "")
		if data_type == 'player_key_down':
			await self.game.set_player_movement(data.get("player", ""), True, data.get("direction"))
		if data_type == 'player_key_up':
			await self.game.set_player_movement(data.get("player", ""), False, False)
		if data_type == 'player_left':
			if self.game.is_running == True:
				print('PLAYER', data.get("player", ""), 'LEFT')
				if data.get("player", "") == 'player_one':
					await self.end_game('player_two')
				elif data.get("player", "") == 'player_two':
					await self.end_game('player_one')


# ------------------------- HANDLING CHANNEL MESSAGES ------------------------ #

	async def game_start(self, event):
		"""
		Sends a 'game start' event to the WebSocket connection.
		The content of the message is the names of the players in the game room.

		Args:
			event (dict): The event data received from the channel layer.
		"""
		print(event.get('type'))
		await self.send(text_data=json.dumps({
			'type':'game_start',
			'player_one_name': self.get_player_in_room(self.game_room, 'player_one').nickname,
			'player_two_name': self.get_player_in_room(self.game_room, 'player_two').nickname,
		}))

	async def player_key_down(self, event):
		"""
		Sends a 'player key down' event to the WebSocket connection.
		The content of the message is the position of the player and the key that was pressed.

		Args:
			event (dict): The event data received from the channel layer.
		"""
		print(event.get('type'))
		await self.send(text_data=json.dumps({
			'type': event.get('type'),
			'player': event.get('position'),
			'key': event.get('value')
		}))

	async def player_key_up(self, event):
		"""
		Sends a 'player key up' event to the WebSocket connection.
		The content of the message is the position of the player and the key that was released.

		Args:
			event (dict): The event data received from the channel layer.
		"""
		print(event.get('type'))
		await self.send(text_data=json.dumps({
			'type': event.get('type'),
			'player': event.get('position'),
			'key': event.get('value')
		}))

	async def ball_update(self, event):
		"""
		Sends a 'ball update' event to the WebSocket connection.
		?? The content of the message is the position of the player and the key that was pressed.

		Args:
			event (dict): The event data received from the channel layer.
		"""
		print(event.get('type'))
		await self.send(text_data=json.dumps({
			'type': event.get('ball_update'),
			'player': event.get('position'),
			'key': event.get('value')
		}))

	async def game_state(self, event):
		"""
		Sends the current 'game state' to the WebSocket connection.
		The content of the message is the players positions and scores, the ball position, velocity and color.

		Args:
			event (dict): The event data received from the channel layer.
		"""
		# print('PLAYER', self.player_id, ' | RECEIVING BALL_X:', event.get('ball_x'))
		await self.send(text_data=json.dumps({
			'type': event.get('type'),
			'player_one_pos_y': event.get('player_one_pos_y'),
			'player_two_pos_y': event.get('player_two_pos_y'),
			'player_one_score': event.get('player_one_score'),
			'player_two_score': event.get('player_two_score'),
			'ball_x': event.get('ball_x'),
			'ball_y': event.get('ball_y'),
			'ball_x_vel': event.get('ball_x_vel'),
			'ball_y_vel': event.get('ball_y_vel'),
			'ball_color': event.get('ball_color'),
		}))

	async def game_end(self, event):
		"""
		Sends a 'game end' event to the WebSocket connection.
		The content of the message is the winner of the game.

		Args:
			event (dict): The event data received from the channel layer.
		"""
		print(event.get('type'))
		await self.send(text_data=json.dumps({
			'type': event.get('type'),
			'winner': event.get('winner'),
		}))
		await self.channel_layer.group_discard(
			self.game_room, self.channel_name
		)

# ------------------------------- END HANDLERS ------------------------------- #

	async def send_game_end(self, winner):
		"""
		Sends a game end message to all connected clients.

		Args:
			winner: The winner of the game. (If None, the winner will be determined based on the scores.)
		"""
		await self.channel_layer.group_send(self.game_room,
		{
			'type': 'game_end',
			'winner': winner,
		})

	async def end_game(self, winner):
		"""
		Ends the game and sends the game end message to the clients.

		Args:
			winner: The winner of the game. If None, the winner will be determined based on the scores.
		"""
		self.game.is_running = False
		winner_player = self.get_winner()
		loser_player = self.get_loser()
		await self.record_game_result(winner_player, loser_player)
		if not winner:
			game_winner = None
			if self.game.players[0].score >= self.game.winning_score:
				game_winner = 'player_one'
			elif self.game.players[1].score >= self.game.winning_score:
				game_winner = 'player_two'
			await self.send_game_end(game_winner)
		else:
			await self.send_game_end(winner)

	async def record_game_result(self, winner_player, loser_player):
		"""
		Records the result of the game by updating the player's records in the Players database.

		Args:
			winner_player (players_manager.models.Player): The instance of the winner player.
			loser_player (players_manager.models.Player): The instance of the loser player.
		"""

		game_history = TwoPlayersGame()
		# await sync_to_async(game_history.record)(player_1, player_2, winner_player)
		await sync_to_async(winner_player.record_win)('2p')
		await sync_to_async(loser_player.record_loss)('2p')
		# winner.print_records()
		# loser.print_records()

# ------------------------------- GAME LOGIC ------------------------------- #

	async def join_game(self):
		"""
		Joins the game by finding or creating a game room, adding the player to the room,
		setting the player's position, and starting the game if the room is full.
		"""
		self.game_room = self.game_manager.find_or_create_game_room()
		self.game_manager.add_player_to_room(self.game_room, self.player)
		self.game = self.game_manager.game_rooms[self.game_room]['game_state']

		if self.game_manager.room_players_nb(self.game_room) == 1:
			self.position = 1
			await self.send(text_data=json.dumps({
				'type':'set_position',
				'value':'player_one'
			}))
		else:
			self.position = 2
			await self.send(text_data=json.dumps({
				'type':'set_position',
				'value':'player_two'
			}))

		await self.channel_layer.group_add(
			self.game_room, self.channel_name
		)

		if self.game_manager.room_players_nb(self.game_room) == 2:
			self.game.is_running = True
			await self.channel_layer.group_send(
				self.game_room,
				{
					'type': 'game_start',
				}
			)
			print('#GAMECONSUMER# Room', self.game_room, 'full, can start game')
			self.game.ball.x_vel = self.game.ball.speed
			self.game.players[0].name = self.get_player_in_room(self.game_room, 'player_one').nickname
			self.game.players[1].name = self.get_player_in_room(self.game_room, 'player_two').nickname
			asyncio.create_task(self.game_loop())

	async def get_update_lock(self):
			"""
			Returns the update lock for the consumer.

			If the update lock is not yet initialized, it creates a new asyncio.Lock object and assigns it to the update_lock attribute.

			What is a lock ?
			A lock is a synchronization primitive that can be used to limit access to a shared resource.
			Like a semaphore, a lock is a counter that is used to control access to a shared resource.
			A lock is in one of two states: locked or unlocked.

			Returns:
				asyncio.Lock: The update lock for the consumer.
			"""
			if self.update_lock is None:
				self.update_lock = asyncio.Lock()
			return self.update_lock

	async def send_game_state(self):
		"""
		Sends the current game state to all connected clients.
		The message contains the positions and scores of the players, the ball position, velocity and color.
		"""
		await self.channel_layer.group_send(
			self.game_room,
			{
				'type': 'game_state',
				'player_one_pos_y': self.game.players[0].y,
				'player_two_pos_y': self.game.players[1].y,
				'player_one_score': self.game.players[0].score,
				'player_two_score': self.game.players[1].score,
				'ball_x': self.game.ball.x,
				'ball_y': self.game.ball.y,
				'ball_x_vel': self.game.ball.x_vel,
				'ball_y_vel': self.game.ball.y_vel,
				'ball_color': self.game.ball.color,
			}
		)

	async def game_loop(self):
		"""
		The main game loop that updates the game state and sends updates to clients.
		"""
		async with await self.get_update_lock():
			while self.game.is_running == True:
				await self.game.update()
				await self.send_game_state()
				await asyncio.sleep(tick_duration)
			await self.end_game(None)