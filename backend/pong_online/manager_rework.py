import json
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.layers import get_channel_layer

from asgiref.sync import sync_to_async
# from asgriref.sync import async_to_sync

# from django.contrib.auth.models import User

from players_manager.models import Player
from games_manager.models import TwoPlayersGame

from .gamelogic_rework import GameState

TICK_RATE = 60
TICK_DURATION = 1 / TICK_RATE

class RoomManager:
	"""
	Manages the online game rooms, connections, deconnections,
	redirects the message received from the front to the right room and
	dispatches the message sent by a room to the front.

	Attributes:
		rooms (dict): A dictionary with the room names as keys and GameState objects as values.

	Methods:
		room_available(): Return the name of the first available room.
		create_room(room_name): Create a new online game room with the given name.
		delete_room(room_name): Delete the online game room with the given name.
	"""

	def __init__(self):
		self.rooms = {}

	def room_available(self):
		"""
		Return the name of the first available room.

		Returns:
			str: The name of the first available room or the name of one newly created room.
		"""
		for room_name in self.rooms:
			if len(self.rooms[room_name].players) < 2:
				return room_name
		new_room_name = f"room_{len(self.rooms) + 1}"
		self.create_room(new_room_name)
		return new_room_name

	def create_room(self, room_name):
		"""
		Create a new online game room with the given name.

		Args:
			room_name (str): The name of the room to create.
		"""
		self.rooms[room_name] = GameState(room_name)

	def delete_room(self, room_name):
		"""
		Delete the online game room with the given name.

		Args:
			room_name (str): The name of the room to delete.
		"""
		del self.rooms[room_name]

	async def save_room(self, room_name, winner, loser):
		"""
		Save the online game room with the given name.

		If the room_name is not in the rooms dictionary,
		it means that it's the second time we call this function and the room was already saved and deleted.
		Args:
			room_name (str): The name of the room to save.
		"""
		if room_name in self.rooms.keys():
			await self.rooms[room_name].record_game_result(winner, loser)
			if len(self.rooms[room_name].players) == 0:
				self.delete_room(room_name)

class RoomConsumer(AsyncWebsocketConsumer):
	"""
	Represents an online game room.

	Attributes:
		manager (RoomManager): The room manager object that manages the room.
		game_state_obj (GameState): The game state object for the room.
		room_name (str): The name of the room.
		update_lock (asyncio.Lock): A lock to prevent concurrent updates to the game state.

	A lock is a synchronization primitive that can be used to limit access to a shared resource.
	Like a semaphore, a lock is a counter that is used to control access to a shared resource.
	A lock is in one of two states: locked or unlocked.

	Methods:
		connect(): Connect to the websocket. Overload.
		disconnect(close_code): Disconnect from the websocket. Overload.
		receive(text_data): Receive a message from the websocket, redispatch to the destination room. Overload.

		handle_new_connection(user): Handle a connection to the websocket that was accepted.
		start_game(): Start the game in the room.
		end_game(): End the game in the room.

		game_loop(): The game loop for the room.

		game_start(event): Send a 'game start' event to the WebSocket connection.
		? USED ? player_key_down(event): Send a 'player key down' event to the WebSocket connection.
		? USED ? player_key_up(event): Send a 'player key up' event to the WebSocket connection.
		? USED ? ball_update(event): Send a 'ball update' event to the WebSocket connection.

		send_game_start(): Send the game start message to all connected clients.
		send_game_state(): Send the game state to all connected clients.
		send_game_end(winner): Send the game end message to all connected clients with the winner position.
	"""

	manager = RoomManager()
	game_state_obj = None
	room_name = None
	# update_lock = asyncio.Lock()
	update_lock = None

	async def connect(self):
		"""
		Connect to the websocket.
		Overload of the connect method from the AsyncWebsocketConsumer class.

		The accept() method accepts the WebSocket connection and is necessary.
		"""
		user = self.scope['user']

		if user.is_authenticated:
			await self.accept()
			await self.handle_new_connection(user)
		else:
			await self.close()

	async def disconnect(self, close_code):
		"""
		Disconnect from the websocket.
		Overload of the disconnect method from the AsyncWebsocketConsumer class.

		Args:
			close_code (int): The code indicating the reason for the disconnection.
		"""
		await self.channel_layer.group_send(self.room_name,
			{
				'type': 'player_disconnect',
				'player_pos': self.position
			})

	async def receive(self, text_data):
		"""
		Receive a message from the websocket.
		Overload of the receive method from the AsyncWebsocketConsumer class.

		Args:
			text_data (str): The message received from the websocket.
		"""
		data = json.loads(text_data)
		type = data['type']
		if type == 'set_player_movement':
			await self.game_state_obj.set_player_movement(data['player'], data['is_moving'], data['direction_v'])
		elif type == 'player_disconnect':
			print("received disconnect message", self.position)
			# if self.game_state_obj.is_running == True:
			if data["player_pos"] == 'player_left':
				await self.end_game('player_right')
			elif data["player_pos"] == 'player_right':
				await self.end_game('player_left')
			# 4 Joueurs await self.game_state_obj.set_player_movement(message['player_pos'], message['is_moving'], message['direction_v'], message['direction_h'])

	async def handle_new_connection(self, user):
		"""
		Handle a connection to the websocket that was accepted.

		Get the name of the room where the user will connect. Get the GameState instance of the room.
		Get the Player instance of the user. Add the player to the GameState instance.

		Send the position of the player to the client.
		Add the channel to the group of the room.

		Starts the game if there are two players in the room.

		Args:
			user (User): The user object representing the player that connected.
		"""
		self.room_name = self.manager.room_available()
		self.game_state_obj = self.manager.rooms.get(self.room_name)
		player = await sync_to_async(Player.objects.get)(owner=user)

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
		Start the game in the room.
		"""
		self.game_state_obj.is_running = True
		await self.channel_layer.group_send(self.room_name,
			{
				'type': 'game_start',
				'player_left': self.game_state_obj.players['player_left'].player_model.nickname,
				'player_right': self.game_state_obj.players['player_right'].player_model.nickname,
			})
		await sync_to_async(self.game_state_obj.game_history.create)(self.game_state_obj.players['player_left'].player_model, self.game_state_obj.players['player_right'].player_model)
		asyncio.create_task(self.game_loop())

	async def end_game(self, winner):
		"""
		End the game in the room.
		"""
		self.game_state_obj.is_running = False
		if winner == 'player_left':
			await self.manager.save_room(self.room_name, winner, "player_right")
			# await self.game_state_obj.record_game_result(winner, "player_right")
			# await sync_to_async(self.game_history.result)(self.game_state_obj.players['player_left'].player_model, self.game_state_obj.players['player_left'].score, self.game_state_obj.players['player_right'].score)
			await self.send_game_end(winner)
		elif winner == 'player_right':
			await self.manager.save_room(self.room_name, winner, "player_left")
			# await self.game_state_obj.record_game_result(winner, "player_left")
			# await sync_to_async(self.game_history.result)(self.game_state_obj.players['player_right'].player_model, self.game_state_obj.players['player_left'].score, self.game_state_obj.players['player_right'].score)
			await self.send_game_end(winner)
		else:
			winner = await self.game_state_obj.get_winner_pos()
			loser = "player_left" if winner == "player_right" else "player_right"
			await self.manager.save_room(self.room_name, winner, loser)
			# await self.game_state_obj.record_game_result(winner, loser)
			# await sync_to_async(self.game_history.result)(self.game_state_obj.players[winner].player_model, self.game_state_obj.players['player_left'].score, self.game_state_obj.players['player_right'].score)
			await self.send_game_end(winner)

	async def get_update_lock(self):
		if self.update_lock is None:
			self.update_lock = asyncio.Lock()
		return self.update_lock

	async def game_loop(self):
		"""
		The game loop for the room.
		"""
		# async with self.update_lock:
		async with await self.get_update_lock():
			while self.game_state_obj.is_running == True:
				await self.game_state_obj.update()
				await self.send_game_state()
				await asyncio.sleep(TICK_DURATION)
			await self.end_game(None)

	async def game_start(self, event):
		"""
		Sends a 'game start' event to the WebSocket connection.
		The content of the message is the names of the players in the game room.

		Args:
			event (dict): The event data received from the channel layer.
		"""
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'player_left': event['player_left'],
			'player_right': event['player_right']
		}))

	async def game_state(self, event):
		"""
		Sends a 'game state' event to the WebSocket connection.
		The content of the message is the game state:
			- the players positions and scores
			- the ball position, velocity and color

		Args:
			event (dict): The event data received from the channel layer.
		"""
		await self.send(text_data=json.dumps({
			'type': event.get('type'),
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

	async def game_end(self, event):
		"""
		Sends a 'game end' event to the WebSocket connection.
		The content of the message is the position of the winning player.

		Args:
			event (dict): The event data received from the channel layer.
		"""
		await self.send(text_data=json.dumps({
			'type': event.get('type'),
			'winner': event.get('winner')
		}))

	# async def player_key_down(self, event):
	# 	"""
	# 	Sends a 'player key down' event to the WebSocket connection.
	# 	The content of the message is the position of the player and the key that was pressed.

	# 	Args:
	# 		event (dict): The event data received from the channel layer.
	# 	"""
	# 	print("\nplayer_key_down event:", event, "\n")
	# 	await self.send(text_data=json.dumps({
	# 		'type': event.get('type'),
	# 		'player_pos': event.get('player_pos'),
	# 		'key': event.get('key')
	# 	}))

	# async def player_key_up(self, event):
	# 	"""
	# 	Sends a 'player key up' event to the WebSocket connection.
	# 	The content of the message is the position of the player and the key that was released.

	# 	Args:
	# 		event (dict): The event data received from the channel layer.
	# 	"""
	# 	print("\nplayer_key_up event:", event, "\n")
	# 	await self.send(text_data=json.dumps({
	# 		'type': event.get('type'),
	# 		'player': event.get('position'),
	# 		'key': event.get('value')
	# 	}))

	# async def ball_update(self, event):
	# 	"""
	# 	Sends a 'ball update' event to the WebSocket connection.
	# 	The content of the message is the new position of the ball.

	# 	Args:
	# 		event (dict): The event data received from the channel layer.
	# 	"""
	# 	print("\nball_update event:", event, "\n")
	# 	await self.send(text_data=json.dumps({
	# 		'type': event.get('type'),
	# 		'x': event.get('x'),
	# 		'y': event.get('y')
	# 	}))

	async def send_game_state(self):
		"""
		Send the game state to all connected clients.
		The message contains:
			- the type of the message
			- the game state:
				- the ball position, velocity and color
				- the players positions and scores
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
		Send the game end message to all connected clients with the winner position.

		Args:
			winner (str): The position of the winning player.
		"""
		await self.channel_layer.group_send(self.room_name,
			{
				'type': 'game_end',
				'winner': winner
			})
		self.channel_layer.group_discard(self.room_name, self.channel_name)