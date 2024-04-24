import json
import uuid
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .gamelogic_four import GameState
from django.contrib.auth.models import User
from players_manager.models import Player
from asgiref.sync import sync_to_async

tick_rate = 60
tick_duration = 1 / tick_rate

class GameManager:
	"""
	Class representing a game manager that handles game rooms and players.

	Attributes:
		game_rooms (dict): A dictionary containing the game rooms and their data.

	Methods:
		find_or_create_game_room(): Finds an available game room or creates a new one.
		add_player_to_room(room_name, player_id): Adds a player to a game room.
		remove_player_from_room(room_name, player_id): Removes a player from a game room.
		players_in_room(room_name): Returns a list of players in a game room.
		room_len(room_name): Returns the number of players in a game room.
		display_all_rooms(): Displays information about all game rooms.
	"""

	def __init__(self):
		self.game_rooms = {}

	def find_or_create_game_room(self):
		"""
		Finds an available game room or creates a new one.

		Returns:
			str: The name of the game room.
		"""
		print('checking for available room ...')
		for room, data in self.game_rooms.items():
			if len(data['players']) < 4:
				print('Room available')
				return room
		print('no available room, creating one...')
		new_room = f"room_{len(self.game_rooms) + 1}"
		self.game_rooms[new_room] = {
			'players': [],
			'game_state': GameState()
		}
		print(new_room, 'created')
		return new_room

	def add_player_to_room(self, room_name, player_id):
		"""
		Adds a player to a game room.

		Args:
			room_name (str): The name of the game room.
			player_id (str): The ID of the player.

		Returns:
			None
		"""
		if room_name in self.game_rooms:
			if len(self.game_rooms[room_name]['players']) < 4:
				print('---PLAYER :', player_id, 'IS JOINING', room_name)
				self.game_rooms[room_name]['players'].append(player_id)

	def remove_player_from_room(self, room_name, player_id):
		"""
		Removes a player from a game room.

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
				if self.room_len(room_name) == 0:
					del self.game_rooms[room_name]
					return True
		return False

	def players_in_room(self, room_name):
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

	def room_len(self, room_name):
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

		Returns:
			None
		"""
		for room, data in self.game_rooms.items():
			players = ', '.join(data['players'])
			print('-----GAME MANAGER------', f"Room: {room}, Players: {players}")


def get_player_id(nickname = None):
		if (nickname == None):
			return uuid.uuid4()
		player = Player.objects.get(nickname=nickname)
		return player.id


class GameConsumerFour(AsyncWebsocketConsumer):
	"""
	Represents a consumer for handling game-related WebSocket connections.

	Attributes:
		game_manager (GameManager): An instance of the GameManager class.
		game_room (str): The ID of the game room the consumer is connected to.
		game (GameState): The current game state.
		update_lock (asyncio.Lock): A lock used to synchronize game updates.

	Methods:
		get_player_id_in_room(room_name, player_position): Returns the ID of a player in a game room based on their position.
		get_winner(): Returns the ID of the player whose score is equal to the winning score.
		get_losers(): Returns the IDs of the players who are not the winner.
		record_game_result(winner_id, losers_ids): Records the result of a game won by a player to the database.

		connect(): Called when a WebSocket connection is established.
		disconnect(close_code): Called when a WebSocket connection is closed.

		join_game(): Joins the game room and assigns a position to the player.
		receive(text_data): Called when a message is received from the WebSocket connection.

		game_start(event): Sends a game start event to the WebSocket connection.
		player_key_down(event): Sends a player key down event to the WebSocket connection.
		player_key_up(event): Sends a player key up event to the WebSocket connection.
		ball_update(event): Sends a ball update event to the WebSocket connection.
		game_state(event): Sends the current game state to the WebSocket connection.
		game_end(event): Sends a game end event to the WebSocket connection.

		get_update_lock(): Returns the update lock for synchronizing game updates.
		send_game_state(): Sends the current game state to all connected clients.
		send_game_end(winner): Sends a game end event to all connected clients.
		send_game_end_player_left(player): Sends a game end event to all connected clients when a player leaves the game.

		end_game(winner): Ends the game and sends a game end event to all connected clients.
		game_loop(): The main game loop that updates the game state and sends updates to clients.
	"""
	game_manager = GameManager()
	game_room = None
	game = None
	update_lock = None

	def get_player_id_in_room(self, room_name, player_position):
		"""
		Returns the ID of a player in a game room based on their position.

		Args:
			room_name (str): The name of the game room.
			player_position (str): The position of the player in the room.

		Returns:
			str: The ID of the player in the specified position.
			None: if the room does not exist or the player is not in the room.
		"""
		if room_name in self.game_manager.game_rooms:
			if len(self.game_manager.game_rooms[room_name]['players']) == 4:
				if player_position == 'player_one':
					return self.game_manager.game_rooms[room_name]['players'][0]
				elif player_position == 'player_two':
					return self.game_manager.game_rooms[room_name]['players'][1]
				elif player_position == 'player_three':
					return self.game_manager.game_rooms[room_name]['players'][2]
				elif player_position == 'player_four':
					return self.game_manager.game_rooms[room_name]['players'][3]
		return None

	def get_winner(self):
		"""
		Returns the ID of the player whose score is equal to the winning score.

		Returns:
			str: The ID of the winning player.
			None: if no player has reached the winning score.
		"""
		if self.game.players[0].score >= self.game.winning_score:
			return self.get_player_id_in_room(self.game_room, 'player_one')
		elif self.game.players[1].score >= self.game.winning_score:
			return self.get_player_id_in_room(self.game_room, 'player_two')
		elif self.game.players[2].score >= self.game.winning_score:
			return self.get_player_id_in_room(self.game_room, 'player_three')
		elif self.game.players[3].score >= self.game.winning_score:
			return self.get_player_id_in_room(self.game_room, 'player_four')
		return None

	def get_losers(self, winner_id):
		"""
		Returns the IDs of the players who lost the game in a list.

		Args:
			winner_id (str): The ID of the player who won the game.

		Returns:
			list: A list of player IDs who lost the game.
			None: if no player has reached the winning score.
		"""
		losers = []
		if self.game.players[0] == winner_id:
			losers.append(self.get_player_id_in_room(self.game_room, 'player_two'))
			losers.append(self.get_player_id_in_room(self.game_room, 'player_three'))
			losers.append(self.get_player_id_in_room(self.game_room, 'player_four'))
			return losers
		elif self.game.players[1] == winner_id:
			losers.append(self.get_player_id_in_room(self.game_room, 'player_one'))
			losers.append(self.get_player_id_in_room(self.game_room, 'player_three'))
			losers.append(self.get_player_id_in_room(self.game_room, 'player_four'))
			return losers
		elif self.game.players[2] == winner_id:
			losers.append(self.get_player_id_in_room(self.game_room, 'player_one'))
			losers.append(self.get_player_id_in_room(self.game_room, 'player_two'))
			losers.append(self.get_player_id_in_room(self.game_room, 'player_four'))
			return losers
		elif self.game.players[3] == winner_id:
			losers.append(self.get_player_id_in_room(self.game_room, 'player_one'))
			losers.append(self.get_player_id_in_room(self.game_room, 'player_two'))
			losers.append(self.get_player_id_in_room(self.game_room, 'player_three'))
			return losers
		return None

	async def record_game_result(self, winner_id, losers_ids):
		"""
		Records the result of a game won by a player by updating the players' records on the database.

		Args:
			winner_id (str): The ID of the player who won the game.
			losers_ids (list): A list of player IDs who lost the game.

		Returns:
			None
		"""
		winner = await sync_to_async(Player.objects.get)(id=winner_id)
		await sync_to_async(winner.record_win_four)(elo=10, points=self.game.players[winner_id].score)
		for loser_id in losers_ids:
			loser = await sync_to_async(Player.objects.get)(id=loser_id)
			await sync_to_async(loser.record_loss_four)(elo=10, points=self.game.players[loser_id].score)
		# winner.print_records()
		# loser.print_records()

	async def connect(self):
		"""
		Connects the player to the WebSocket and assigns a unique player ID.

		Args:
			None

		Returns:
			None
		"""
		# uuid.uuid4() generates a random UUID
		# A UUID is a 128-bit number represented as a utf8 string of five hexadecimal fields separated by hyphens
		user = self.scope['user']

		if user.is_authenticated:
			self.player = await sync_to_async(Player.objects.get)(owner=user)
			self.player_id = self.player.id
			# self.player_id = user.username

		# self.player_id = str(uuid.uuid4())

		await self.accept()
		await self.join_game()

	async def disconnect(self, close_code):
		"""
		Disconnects the player from the game room and removes them from the room.

		Args:
			close_code (int): The close code for the WebSocket connection.

		Returns:
			None
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

	async def join_game(self):
		"""
		Joins the game by finding or creating a game room, adding the player to the room,
		setting the player's position, and starting the game if the room is full.

		Args:
			None

		Returns:
			None
		"""
		self.game_room = self.game_manager.find_or_create_game_room()
		self.game_manager.add_player_to_room(self.game_room, self.player_id)
		self.game = self.game_manager.game_rooms[self.game_room]['game_state']

		if self.game_manager.room_len(self.game_room) == 1:
			self.position = 1
			await self.send(text_data=json.dumps({
				'type':'set_position',
				'value':'player_one'
			}))
		elif self.game_manager.room_len(self.game_room) == 2:
			self.position = 2
			await self.send(text_data=json.dumps({
				'type':'set_position',
				'value':'player_two'
			}))
		elif self.game_manager.room_len(self.game_room) == 3:
			self.position = 3
			await self.send(text_data=json.dumps({
				'type':'set_position',
				'value':'player_three'
			}))
		elif self.game_manager.room_len(self.game_room) == 4:
			self.position = 4
			await self.send(text_data=json.dumps({
				'type':'set_position',
				'value':'player_four'
			}))

		await self.channel_layer.group_add(
			self.game_room, self.channel_name
		)

		if len(self.game_manager.players_in_room(self.game_room)) == 4:
			self.game.is_running = True
			await self.channel_layer.group_send(
				self.game_room,
				{
					'type': 'game_start',
				}
			)
			print('#GAMECONSUMER# Room', self.game_room, 'full, can start game')
			self.game.ball.x_vel = self.game.ball.speed
			asyncio.create_task(self.game_loop())

	async def receive(self, text_data):
		"""
		Receives a message from the WebSocket connection and processes it.

		Args:
			text_data (str): The message received from the WebSocket connection.

		Returns:
			None
		"""
		data = json.loads(text_data)
		data_type = data.get("type", "")
		data_value = data.get("value", "")
		if data_type == 'player_key_down' and data_value == 'W':
			await self.game.set_player_movement(data.get("player", ""), True, data.get("direction"), None)
		if data_type == 'player_key_down' and data_value == 'J':
			await self.game.set_player_movement(data.get("player", ""), True, None, data.get("direction"))
		if data_type == 'player_key_up':
			await self.game.set_player_movement(data.get("player", ""), False, False, None)
		if data_type == 'player_left':
			if self.game.is_running == True:
				print('PLAYER', data.get("player", ""), 'LEFT')
				await self.end_game_player_left(data.get("player", ""))

# ------------------------- HANDLING CHANNEL MESSAGES ------------------------ #
	async def game_start(self, event):
		"""
		Sends a game start message to the WebSocket connection.

		Args:
			event (dict): The event data.

		Returns:
			None
		"""
		await self.send(text_data=json.dumps({
			'type':'game_start'
		}))

	async def player_key_down(self, event):
		"""
		Sends a player key down message to the WebSocket connection.

		Args:
			event (dict): The event data.

		Returns:
			None
		"""
		await self.send(text_data=json.dumps({
			'type': event.get('type'),
			'player': event.get('position'),
			'key': event.get('value')
		}))

	async def player_key_up(self, event):
		"""
		Sends a player key up message to the WebSocket connection.

		Args:
			event (dict): The event data.

		Returns:
			None
		"""
		await self.send(text_data=json.dumps({
			'type': event.get('type'),
			'player': event.get('position'),
			'key': event.get('value')
		}))

	async def ball_update(self, event):
		"""
		Sends a ball update message to the WebSocket connection.

		Args:
			event (dict): The event data.

		Returns:
			None
		"""
		await self.send(text_data=json.dumps({
			'type': event.get('ball_update'),
			'player': event.get('position'),
			'key': event.get('value')
		}))

	async def game_state(self, event):
		"""
		Sends the current game state to the WebSocket connection.

		Args:
			event (dict): The event data.

		Returns:
			None
		"""
		await self.send(text_data=json.dumps({
			'type': event.get('type'),
			'player_one_pos_y': event.get('player_one_pos_y'),
			'player_two_pos_y': event.get('player_two_pos_y'),
			'player_three_pos_x': event.get('player_three_pos_x'),
			'player_four_pos_x': event.get('player_four_pos_x'),
			'player_one_score': event.get('player_one_score'),
			'player_two_score': event.get('player_two_score'),
			'player_three_score': event.get('player_three_score'),
			'player_four_score': event.get('player_four_score'),
			'ball_x': event.get('ball_x'),
			'ball_y': event.get('ball_y'),
			'ball_x_vel': event.get('ball_x_vel'),
			'ball_y_vel': event.get('ball_y_vel'),
			'ball_color': event.get('ball_color'),
		}))

	async def game_end(self, event):
		"""
		Sends a game end message to the WebSocket connection.

		Args:
			event (dict): The event data.

		Returns:
			None
		"""
		await self.send(text_data=json.dumps({
			'type': event.get('type'),
			'winner': event.get('winner'),
		}))
		await self.channel_layer.group_discard(
			self.game_room, self.channel_name
		)

# ------------------------------- END HANDLERS ------------------------------- #

	async def get_update_lock(self):
			"""
			Returns the update lock for the consumer.

			If the update lock is not yet initialized, it creates a new asyncio.Lock object and assigns it to the update_lock attribute.

			What is a lock ?
			A lock is a synchronization primitive that can be used to limit access to a shared resource.
			Like a semaphore, a lock is a counter that is used to control access to a shared resource.
			A lock is in one of two states: locked or unlocked.

			Args:
				None

			Returns:
				asyncio.Lock: The update lock for the consumer.
			"""
			if self.update_lock is None:
				self.update_lock = asyncio.Lock()
			return self.update_lock

	async def send_game_state(self):
		"""
		Sends the current game state to all connected clients.

		Args:
			None

		Returns:
			None
		"""
		await self.channel_layer.group_send(
			self.game_room,
			{
				'type': 'game_state',
				'player_one_pos_y': self.game.players[0].y,
				'player_two_pos_y': self.game.players[1].y,
				'player_three_pos_x': self.game.players[2].x,
				'player_four_pos_x': self.game.players[3].x,
				'player_one_score': self.game.players[0].score,
				'player_two_score': self.game.players[1].score,
				'player_three_pos_y': self.game.players[2].score,
				'player_four_pos_y': self.game.players[3].score,
				'ball_x': self.game.ball.x,
				'ball_y': self.game.ball.y,
				'ball_x_vel': self.game.ball.x_vel,
				'ball_y_vel': self.game.ball.y_vel,
				'ball_color': self.game.ball.color,
			}
		)

	async def send_game_end(self, winner):
		"""
		Sends a game end message to all connected clients.

		Args:
			winner (str): The ID of the player who won.

		Returns:
			None
		"""
		await self.channel_layer.group_send(self.game_room,
		{
			'type': 'game_end',
			'winner': winner,
		})

	async def send_game_end_player_left(self, player):
		"""
		Sends a game end message to all connected clients when a player leaves the game.

		Args:
			player (str): The ID of the player who left the game.

		Returns:
			None
		"""
		await self.channel_layer.group_send(self.game_room,
		{
			'type': 'game_end_left',
			'player_left': player,
		})

	async def end_game(self, winner):
		"""
		Ends the game and sends the game end message to the clients.

		Args:
			winner: The winner of the game. If None, the winner will be determined based on the scores.

		Returns:
			None
		"""
		self.game.is_running = False
		winner_id = self.get_winner()
		losers_ids = self.get_losers(winner_id)
		await self.record_game_result(winner_id, losers_ids)
		if not winner:
			game_winner = None
			if self.game.players[0].score >= self.game.winning_score:
				game_winner = 'player_one'
			elif self.game.players[1].score >= self.game.winning_score:
				game_winner = 'player_two'
			elif self.game.players[2].score >= self.game.winning_score:
				game_winner = 'player_three'
			elif self.game.players[3].score >= self.game.winning_score:
				game_winner = 'player_four'
			await self.send_game_end(game_winner)
		else:
			await self.send_game_end(winner)

	async def end_game_player_left(self, player):
		"""
		Ends the game when a player leaves the game.
		Sends the game end message to the clients.

		Args:
			player: The player who left the game.

		Returns:
			None
		"""
		self.game.is_running = False
		await self.send_game_end_player_left(player)

	async def game_loop(self):
		"""
		The main game loop that updates the game state and sends updates to clients.

		Args:
			None

		Returns:
			None
		"""
		async with await self.get_update_lock():
			print(self.game_manager.players_in_room(self.game_room))
			while self.game.is_running == True:
				await self.game.update()
				await self.send_game_state()
				await asyncio.sleep(tick_duration)
			await self.end_game(None)