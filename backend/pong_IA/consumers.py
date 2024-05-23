import json
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer

from asgiref.sync import sync_to_async

from players_manager.models import Player

from .gamelogic import GameState

TICK_RATE = 60
TICK_DURATION = 1 / TICK_RATE

class RoomManager:
	def __init__(self):
		self.rooms = {}

	def create_room(self, room_name):
		self.rooms[room_name] = GameState(room_name)

	def room_available(self):
		new_room_name = f"room_{len(self.rooms) + 1}"
		self.create_room(new_room_name)
		return new_room_name

	def delete_room(self, room_name):
		if room_name in self.rooms:
			del self.rooms[room_name]



class RoomConsumer(AsyncWebsocketConsumer):
	manager = RoomManager()
	# room = GameState("Room_IA")
	room = None
	# room_name = "Room_IA"
	room_name = None
	update_lock = None

	async def connect(self):
		user = self.scope['user']
		if user.is_authenticated:
			await self.accept()
			await self.handle_new_connection(user)
		else:
			await self.close()

	async def handle_new_connection(self, user):
		self.room_name = self.manager.room_available()
		self.room = self.manager.rooms.get(self.room_name)
		player = await sync_to_async(Player.objects.get)(owner=user)
		player.status = "PLAYING"
		await sync_to_async(player.save)()
		# print(f"Player {player.nickname} connected to room {self.room_name}") # DEBUG
		self.position = 'player_left'
		self.room.add_player(player)
		await self.send(text_data=json.dumps({
			'type': 'set_position',
			'position': 'player_left',
			'name': player.nickname
		}))

		await self.channel_layer.group_add(self.room_name, self.channel_name)

		await self.start_game()

	async def disconnect(self, close_code):
		self.room.player.player_model.status = "ONLINE"
		await sync_to_async(self.room.player.player_model.save)()
		await self.channel_layer.group_send(self.room_name, {
			'type': 'player_disconnect'
		})
		await self.end_game(None)
		# self.manager.delete_room(self.room_name)
		await self.close()
		await self.channel_layer.group_discard(self.room_name, self.channel_name) # Since we are not using send_game_end

	async def receive(self, text_data):

		data = json.loads(text_data)
		type = data['type']
		if type == 'set_player_movement':
			await self.room.set_player_movement(data['player'], data['is_moving'], data['direction_v'])

	async def start_game(self):
		self.room.is_running = True
		# await self.send_game_start()
		await self.game_start({
			'type': 'game_start'
		})
		asyncio.create_task(self.game_loop())

	async def end_game(self, winner):
		self.room.is_running = False
		winner = await self.room.get_winner_pos()
		loser = "player_left" if winner == "player_right" else "player_right"
		# await self.send_game_end(winner)
		await self.game_end({
			'type': 'game_end',
			'winner': winner
		})

	async def get_update_lock(self):
		if self.update_lock is None:
			self.update_lock = asyncio.Lock()
		return self.update_lock

	async def game_loop(self):
		async with await self.get_update_lock():
			while self.room.is_running == True:
				# await self.room.update()
				await self.room.update()
				# await self.send_game_state()
				await self.game_state({
					'type': 'game_state',
					'player_left_y': self.room.player.y,
					'player_right_y': self.room.bot.y,
					'player_left_score': self.room.player.score,
					'player_right_score': self.room.bot.score,
					'ball_x': self.room.ball.x,
					'ball_y': self.room.ball.y,
					'ball_x_vel': self.room.ball.x_vel,
					'ball_y_vel': self.room.ball.y_vel,
					'ball_color': self.room.ball.color,
				})
				await asyncio.sleep(TICK_DURATION)
			await self.end_game(None)

	async def game_start(self, event):
		await self.send(text_data=json.dumps({
			'type': event['type'],
		}))

	async def game_state(self, event):
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

	async def game_end(self, event):
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
				'player_left_y': self.room.player.y,
				'player_right_y': self.room.bot.y,
				'player_left_score': self.room.player.score,
				'player_right_score': self.room.bot.score,
				'ball_x': self.room.ball.x,
				'ball_y': self.room.ball.y,
				'ball_x_vel': self.room.ball.x_vel,
				'ball_y_vel': self.room.ball.y_vel,
				'ball_color': self.room.ball.color,
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
				'winner': winner,
			})
		self.channel_layer.group_discard(self.room_name, self.channel_name)