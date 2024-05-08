import json
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer

from asgiref.sync import sync_to_async

from players_manager.models import Player

from .gamelogic_four import GameStateFour

TICK_RATE = 60
TICK_DURATION = 1 / TICK_RATE

class RoomManagerFour:
	"""
	Manages the online game rooms, connections, deconnections,
	redirects the message received from the front to the right room and
	dispatches the message sent by a room to the front.

	Attributes:
		rooms (dict): A dictionary with the room names as keys and GameState objects as values.

	Methods:
		room_available(): Return the name of the first available room or create one.
		create_room(room_name): Create a new online game room with the given name.
		delete_room(room_name): Delete the online game room with the given name.
		save_room(room_name, winner, losers): Call the GameState method responsible for saving the room
	"""
	def __init__(self):
		self.rooms = {}

	def room_available(self):
		"""
		Return the name of the first available room or create one.

		Returns:
			str: The name of the first available room or the name of one newly created room.
		"""
		for room_name in self.rooms:
			if len(self.rooms[room_name].players) < 4:
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
		self.rooms[room_name] = GameStateFour(room_name)

	def delete_room(self, room_name):
		"""
		Delete the online game room with the given name.

		Args:
			room_name (str): The name of the room to delete.
		"""
		if room_name in self.rooms.keys():
			del self.rooms[room_name]

	async def save_room(self, room_name, winner, losers):
		"""
		Save the online game room with the given name.

		If the room_name is not in the rooms dictionary,
		it means that it's the second time we call this function and the room was already saved and deleted.

		Args:
			room_name (str): The name of the room to save.
			winner (str): The position of the winning player.
			losers (list): List with the positions of the losing players.
		"""
		if room_name in self.rooms.keys():
			await self.rooms[room_name].record_game_result(winner, losers)

class RoomConsumerFour(AsyncWebsocketConsumer):
	"""
	Represents an online game room.

	Attributes:
		manager (RoomManagerFour): The room manager object that manages the room.
		game_state_obj (GameState): The game state object for the room.
		room_name (str): The name of the room.
		update_lock (asyncio.Lock): A lock to prevent concurrent updates to the game state.

	The messages will be sent to the room group, which is a group of channels that have been added to the same group.
	The 3 send_game_* methods will send a message to the room group using channel_layer.group_send,
	this function call will trigger the corresponding method in the RoomConsumer class:
	game_* that uses the send() method inherited from AsyncWebsocketConsumer,
	the content of the event argument is what was passed in the send_game_* corresponding method.

	Methods:
		connect(): Connect to the websocket. Overload.
		disconnect(close_code): Disconnect from the websocket. Overload.
		receive(text_data): Receive a message from the websocket, redispatch to the destination room. Overload.

		handle_new_connection(user): Handle a connection to the websocket that was accepted.
		start_game(): Start the game in the room.
		end_game(): End the game in the room.

		get_update_lock(): Get the update lock for the room.
		game_loop(): The game loop for the room.

		game_start(event): Send the 'game start' message to the WebSocket connection.
		game_state(event): Send the 'game state' message to the WebSocket connection.
		player_disconnect(event): Send the 'player disconnect' message to the WebSocket connection.
		game_end(event): Send the 'game end' message to the WebSocket connection.

		send_game_start(): Prepare and send the 'game start' message to the channel layer group.
		send_game_state(): Prepare and send the 'game state' message to the channel layer group.
		send_game_end(winner): Prepare and send the 'game end' message to the channel layer group.
	"""
	manager = RoomManagerFour()
	game_state_obj = None
	room_name = None
	update_lock = None

	async def connect(self):
		"""
		Connect to the websocket.
		Overload of the connect method from the AsyncWebsocketConsumer class.

		Get the user object from the scope, i.e. the user that is connecting.
		Check if the user is authenticated.
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

		Send a message to the room group to inform the other players that a player has disconnected.

		Args:
			close_code (int): The code indicating the reason for the disconnection.
		"""
		await self.channel_layer.group_send(self.room_name,
			{
				'type': 'player_disconnect',
				'player_name': self.game_state_obj.players[self.position].player_model.nickname
			})
		await self.end_game(self.position)

	async def receive(self, text_data):
		"""
		Receive a message from the websocket.
		Overload of the receive method from the AsyncWebsocketConsumer class.

		Depending on the type of the message, dispatch the message to the right method.

		For the player_disconnect message, if there is only one player left in the room, it means that we
		already sent the game_end message and the room was saved and deleted.
		Otherwise, we send the game_end message with the position of the winning player, i.e. the one who did not leave.

		Args:
			text_data (str): The message received from the websocket.
		"""
		data = json.loads(text_data)
		type = data['type']
		if type == 'set_player_movement':
			await self.game_state_obj.set_player_movement(data['player'], data['is_moving'],
												 			data['direction_v'], data['direction_h'])
		# elif type == 'player_disconnect':
		# 	if len(self.game_state_obj.players) < 4	:
		# 		self.manager.delete_room(self.room_name)
		elif type == 'start_game':
			await self.start_game()

	async def handle_new_connection(self, user):
		"""
		Handle a connection to the websocket that was accepted.

		Get the name of the room where the user will connect.
		Get the GameState instance of the room.
		Get the Player instance of the user.

		Depending on the room, set the position of the player in the GameState instance and send it to the client.

		Add the current connection to the channel group layer of the room.

		Starts the game if there are four players in the room.

		Args:
			user (User): The user object representing the player that connected.
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
		elif len(self.game_state_obj.players) == 1:
			self.position = 'player_right'
			self.game_state_obj.add_player_to_dict(self.position, player)
			await self.send(text_data=json.dumps({
				'type': 'set_position',
				'position': self.position,
				'name': player.nickname
			}))
		elif len(self.game_state_obj.players) == 2:
			self.position = 'player_top'
			self.game_state_obj.add_player_to_dict(self.position, player)
			await self.send(text_data=json.dumps({
				'type': 'set_position',
				'position': self.position,
				'name': player.nickname
			}))
		elif len(self.game_state_obj.players) == 3:
			self.position = 'player_bottom'
			self.game_state_obj.add_player_to_dict(self.position, player)
			await self.send(text_data=json.dumps({
				'type': 'set_position',
				'position': self.position,
				'name': player.nickname
			}))

		await self.channel_layer.group_add(self.room_name, self.channel_name)

		if len(self.game_state_obj.players) == 4:
			await self.channel_layer.group_send(self.room_name,
				{
					'type': 'ready'
				})

	async def start_game(self):
		"""
		Start the game in the room.
		Send the 'game_start' message to the room group.
		Create a new game history object in the database.
		Start the game loop.
		"""
		self.game_state_obj.is_running = True
		await self.send_game_start()
		asyncio.create_task(self.game_loop())

	async def end_game(self, winner):
		"""
		End the game in the room.

		Save the room in the database with the winner and the loser.
		There are different handling depending on the winner.

		Args:
			winner (str): The position of the winning player.
		"""
		self.game_state_obj.is_running = False
		if len(self.game_state_obj.players) == 4:
			if winner == 'player_left':
				losers = ['player_right', 'player_top', 'player_bottom']
				await self.manager.save_room(self.room_name, winner, losers)
				await self.send_game_end(winner)
			elif winner == 'player_right':
				losers = ['player_left', 'player_top', 'player_bottom']
				await self.manager.save_room(self.room_name, winner, losers)
				await self.send_game_end(winner)
			elif winner == 'player_top':
				losers = ['player_left', 'player_right', 'player_bottom']
				await self.manager.save_room(self.room_name, winner, losers)
				await self.send_game_end(winner)
			elif winner == 'player_bottom':
				losers = ['player_left', 'player_right', 'player_top']
				await self.manager.save_room(self.room_name, winner, losers)
				await self.send_game_end(winner)
			else:
				winner = await self.game_state_obj.get_winner_pos()
				if winner == "Not enough players":
					# do not save the game in the database if there is no winner
					await self.send_game_end("No winner")
				else:
					losers = [pos for pos in self.game_state_obj.players if pos != winner]
					await self.manager.save_room(self.room_name, winner, losers)
					await self.send_game_end(winner)
				self.manager.delete_room(self.room_name)
		if len(self.game_state_obj.players) < 4:
			self.manager.delete_room(self.room_name)

	async def get_update_lock(self):
		"""
		Get the update lock for the room.

		A lock is a synchronization primitive that can be used to limit access to a shared resource.
		Like a semaphore, a lock is a counter that is used to control access to a shared resource.
		A lock is in one of two states: locked or unlocked.
		"""
		if self.update_lock is None:
			self.update_lock = asyncio.Lock()
		return self.update_lock

	async def game_loop(self):
		"""
		The game loop for the room.
		Will update the players and the ball positions and send the game state to the clients.
		"""
		async with await self.get_update_lock():
			while self.game_state_obj.is_running == True:
				await self.game_state_obj.update()
				await self.send_game_state()
				await asyncio.sleep(TICK_DURATION)
			await self.end_game(None)

	async def game_start(self, event):
		"""
		Sends the 'game start' message to the WebSocket connection.
		The content of the message is the names of the players in the game room.

		Args:
			event (dict): The event data received from the channel layer.
		"""
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'player_left': event['player_left'],
			'player_right': event['player_right'],
			'player_top': event['player_top'],
			'player_bottom': event['player_bottom']
		}))

	async def game_state(self, event):
		"""
		Sends the 'game state' message to the WebSocket connection.
		The content of the message is the game state:
			- the players positions and scores
			- the ball position, velocity and color

		Args:
			event (dict): The event data received from the channel layer.
		"""
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'player_left_y': event['player_left_y'],
			'player_right_y': event['player_right_y'],
			'player_top_x': event['player_top_x'],
			'player_bottom_x': event['player_bottom_x'],
			'player_left_score': event['player_left_score'],
			'player_right_score': event['player_right_score'],
			'player_top_score': event['player_top_score'],
			'player_bottom_score': event['player_bottom_score'],
			'ball_x': event['ball_x'],
			'ball_y': event['ball_y'],
			'ball_x_vel': event['ball_x_vel'],
			'ball_y_vel': event['ball_y_vel'],
			'ball_color': event['ball_color']
		}))

	async def player_disconnect(self, event):
		"""
		Sends the 'player disconnect' message to the WebSocket connection.
		The content of the message is the name of the player that disconnected.

		Args:
			event (dict): The event data received from the channel layer.
		"""
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'player_name': event['player_name']
		}))
		self.channel_layer.group_discard(self.room_name, self.channel_name)

	async def ready(self, event):
		"""
		Sends the 'ready' message to the WebSocket connection.
		It serves only as an event to start a countdown on the front and to provide the name of the players.

		Args:
			event (dict): The event data received from the channel layer.
		"""
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'player_left': self.game_state_obj.players['player_left'].player_model.nickname,
			'player_right': self.game_state_obj.players['player_right'].player_model.nickname,
			'player_top': self.game_state_obj.players['player_top'].player_model.nickname,
			'player_bottom': self.game_state_obj.players['player_bottom'].player_model.nickname
		}))

	async def game_end(self, event):
		"""
		Sends the 'game end' message to the WebSocket connection.
		The content of the message is the position of the winning player.

		Args:
			event (dict): The event data received from the channel layer.
		"""
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'winner': event['winner']
		}))

	async def send_game_start(self):
		"""
		Send the game start message to all connected clients.
		The message contains the names of the players in the game room.
		"""
		await self.channel_layer.group_send(self.room_name,
			{
				'type': 'game_start',
				'player_left': self.game_state_obj.players['player_left'].player_model.nickname,
				'player_right': self.game_state_obj.players['player_right'].player_model.nickname,
				'player_top': self.game_state_obj.players['player_top'].player_model.nickname,
				'player_bottom': self.game_state_obj.players['player_bottom'].player_model.nickname
			})

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
				'player_top_x': self.game_state_obj.players['player_top'].x,
				'player_bottom_x': self.game_state_obj.players['player_bottom'].x,
				'player_left_score': self.game_state_obj.players['player_left'].score,
				'player_right_score': self.game_state_obj.players['player_right'].score,
				'player_top_score': self.game_state_obj.players['player_top'].score,
				'player_bottom_score': self.game_state_obj.players['player_bottom'].score,
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