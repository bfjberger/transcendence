import json
from copy import deepcopy
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import Tournament
from .gamelogic_tournament import GameState
from players_manager.models import Player

tick_rate = 60
tick_duration = 1 / tick_rate

players_size_max = 8

TournamentStage = {
	"LOBBY": "LOBBY",
	"QUARTER_FINALS1": "QUARTER_FINALS1",
	"QUARTER_FINALS2": "QUARTER_FINALS2",
	"QUARTER_FINALS3": "QUARTER_FINALS3",
	"QUARTER_FINALS4": "QUARTER_FINALS4",
	"DEMI_FINALS1": "DEMI_FINALS1",
	"DEMI_FINALS2": "DEMI_FINALS2",
	"FINALS": "FINALS",
}

PlayerState = {
	"PENDING": "PENDING",
	"WINNER": "WINNER",
	"LOSER": "LOSER",
	"LEFT": "LEFT"
}

class TournamentManager():
	def __init__(self):
		self.rooms = {}

	def create_or_join_room(self, room_name, player, alias):
		"""
		Creates a new room or adds a player to an existing room

		Args:
			room_name (str): The name of the room
			player (str): The player's name
			alias (str): The player's alias
		
		Returns:
			bool: True if the player was added to the room, False otherwise
		"""
		current_room = self.rooms.get(room_name, {})

		if current_room and len(current_room.get('players', [])) >= players_size_max:
			print("Room is full")
			return False
	
		if not current_room:
			print("CREATING room")
			current_room = {
				'n_ready': 0,
				'state': TournamentStage["LOBBY"],
				'owner': player,
				'players': [player],
				'aliases': [alias],
				'players_state': [PlayerState["PENDING"], PlayerState["PENDING"],
					PlayerState["PENDING"], PlayerState["PENDING"],
					PlayerState["PENDING"], PlayerState["PENDING"],
					PlayerState["PENDING"], PlayerState["PENDING"]],
				'game_state': GameState()
			}
			self.rooms[room_name] = current_room
		else:
			print("JOINING room")
			if player in current_room['players']:
				print("Player already in room")
				return False
			current_room['players'].append(player)
			current_room['aliases'].append(alias)
			self.rooms[room_name] = current_room
		
		print(f'Room {room_name} has {len(current_room["players"])} players')
		return True
	
	def remove_player(self, room_name, player):
		"""
		Removes a player from a room

		Args:
			room_name (str): The name of the room
			player (str): The player's name
		"""
		current_room = self.rooms.get(room_name, {})
		if not current_room:
			return
		if player in current_room['players']:
			print(f'REMOVING player {player} from room {room_name}')
			index = current_room['players'].index(player)
			current_room['players'].pop(index)
			current_room['aliases'].pop(index)

			if len(current_room['players']) == 0:
				print(f'DELETING room {room_name}')
				self.rooms.pop(room_name)
				return
			elif player == current_room['owner']:
				print(f'New owner is {current_room["players"][0]}')
				current_room['owner'] = current_room['players'][0]
			self.rooms[room_name] = current_room

	def get_room(self, room_name):
		"""
		Returns the room with the given name

		Args:
			room_name (str): The name of the room

		Returns:
			dict: The room with the given name
		"""
		return self.rooms.get(room_name, {})
	
	def remove_room(self, room_name):
		"""
		Removes a room

		Args:
			room_name (str): The name of the room
		"""
		self.rooms.pop(room_name, None)

	def get_printable_room(self, room_name):
		"""
		Returns a printable version of the rooms

		Args:
			room_name (str): The name of the room

		Returns:
			dict: The printable version of the rooms
		"""
		room = deepcopy(self.get_room(room_name))
		if not room:
			return {}
		del room['game_state']
		return room

	def start_tournament(self, room_name):
		room = self.get_room(room_name)
		if not room:
			return False
		if len(room['players']) != players_size_max:
			print("Not enough players")
			return False
		room['state'] = TournamentStage["QUARTER_FINALS1"]
		return True
	
	def get_players_turn(self, room_name):
		players = []
		room = self.get_room(room_name)
		if room['state'] == TournamentStage["QUARTER_FINALS1"]:
			players = [room['aliases'][0], room['aliases'][1]]
		elif room['state'] == TournamentStage["QUARTER_FINALS2"]:
			players = [room['aliases'][2], room['aliases'][3]]
		elif room['state'] == TournamentStage["QUARTER_FINALS3"]:
			players = [room['aliases'][4], room['aliases'][5]]
		elif room['state'] == TournamentStage["QUARTER_FINALS4"]:
			players = [room['aliases'][6], room['aliases'][7]]
		elif room['state'] == TournamentStage["DEMI_FINALS1"]:
			players = []
			for i in range(players_size_max//2):
				if room['players_state'][i] == PlayerState["WINNER"]:
					players.append(room['aliases'][i])
		elif room['state'] == TournamentStage["DEMI_FINALS2"]:
			players = []
			for i in range(players_size_max//2):
				if room['players_state'][i + 4] == PlayerState["WINNER"]:
					players.append(room['aliases'][i + 4])

		elif room['state'] == TournamentStage["FINALS"]:
			players = []
			for i in range(players_size_max):
				if room['players_state'][i] == PlayerState["WINNER"]:
					players.append(room['aliases'][i])
		return players

	def next_turn(self, room_name, winnerIdx, loserIdx):
		room = self.get_room(room_name)
		if not room or room['state'] == TournamentStage["FINALS"]:
			return False

		if room['state'] == TournamentStage["QUARTER_FINALS1"]:
			room['players_state'][winnerIdx] = PlayerState["WINNER"]
			room['players_state'][loserIdx] = PlayerState["LOSER"]
			room['state'] = TournamentStage["QUARTER_FINALS2"]
		elif room['state'] == TournamentStage["QUARTER_FINALS2"]:
			room['players_state'][winnerIdx + 2] = PlayerState["WINNER"]
			room['players_state'][loserIdx + 2] = PlayerState["LOSER"]
			room['state'] = TournamentStage["QUARTER_FINALS3"]
		elif room['state'] == TournamentStage["QUARTER_FINALS3"]:
			room['players_state'][winnerIdx + 4] = PlayerState["WINNER"]
			room['players_state'][loserIdx + 4] = PlayerState["LOSER"]
			room['state'] = TournamentStage["QUARTER_FINALS4"]
		elif room['state'] == TournamentStage["QUARTER_FINALS4"]:
			room['players_state'][winnerIdx + 6] = PlayerState["WINNER"]
			room['players_state'][loserIdx + 6] = PlayerState["LOSER"]
			room['state'] = TournamentStage["DEMI_FINALS1"]
			winners_quarter = []
			for i in range(players_size_max):
				if room['players_state'][i] == PlayerState["WINNER"]:
					winners_quarter.append(i)
			room['winners_quarter'] = winners_quarter
		elif room['state'] == TournamentStage["DEMI_FINALS1"]:
			winnerIdx = room['winners_quarter'][winnerIdx]
			loserIdx = room['winners_quarter'][loserIdx]
			room['players_state'][winnerIdx] = PlayerState["WINNER"]
			room['players_state'][loserIdx] = PlayerState["LOSER"]

			winners_demi = []
			winners_demi.append(winnerIdx)
			room['winners_demi'] = winners_demi
			room['state'] = TournamentStage["DEMI_FINALS2"]

		elif room['state'] == TournamentStage["DEMI_FINALS2"]:
			winnerIdx = room['winners_quarter'][winnerIdx + 2]
			loserIdx = room['winners_quarter'][loserIdx + 2]
			room['players_state'][winnerIdx] = PlayerState["WINNER"]
			room['players_state'][loserIdx] = PlayerState["LOSER"]

			winners_demi = room['winners_demi']
			winners_demi.append(winnerIdx)
			room['winners_demi'] = winners_demi

			# print winners_demi
			print(f'room["winners_demi"] = {room["winners_demi"]}')

			# reset all the players state to loser apart from the winners_demi
			for i in range(players_size_max):
				if i not in winners_demi:
					room['players_state'][i] = PlayerState["LOSER"]
					print(f'room["players_state"][{i}] = {room["players_state"][i]}')
			room['state'] = TournamentStage["FINALS"]

		room['game_state'] = GameState()
		return True
	
	def get_player_index(self, room_name, player):
		try:
			return self.get_room(room_name)['players'].index(player)
		except:
			return -1

class TournamentConsumer(AsyncWebsocketConsumer):
	tournament_manager = TournamentManager()
	update_lock = None

	async def connect(self):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		player = self.scope['user'].username
		# player_obj = Player.objects.get(owner=self.scope['user'])
		player_obj = await sync_to_async(Player.objects.get)(owner=self.scope['user'])
		# alias = player_obj.nickname
		alias = player

		await self.channel_layer.group_add(
			tournament_name,
			self.channel_name
		)

		if self.tournament_manager.create_or_join_room(tournament_name, player, alias):
			await self.accept()
		else:
			await self.close()

		await self.send_players_update()

	async def disconnect(self, close_code):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		player = self.scope['user'].username
		# player_obj = Player.objects.get(owner=self.scope['user'])
		player_obj = await sync_to_async(Player.objects.get)(owner=self.scope['user'])
		# alias = player_obj.nickname
		alias = player
		room = self.tournament_manager.get_room(tournament_name)

		if room:
			if room['state'] == TournamentStage["LOBBY"]:
				self.tournament_manager.remove_player(tournament_name, player)
				await self.send_players_update()
			else:
				idx = self.tournament_manager.get_player_index(tournament_name, player)
				if idx > -1:
					player_state = room['players_state'][idx]
					print(f'Player {player} is in state {player_state}')
					if player_state != PlayerState["LOSER"]:
						room['game_state'].is_running = False
						self.tournament_manager.remove_room(tournament_name)
						await self.send_tournament_end("Tournament ended, missing player")
				else:
					print(f'Player {player} not found in room')
		
		# Leave the room
		await self.channel_layer.group_discard(
			tournament_name,
			self.channel_name
		)
	
	async def receive(self, text_data):
		data = json.loads(text_data)
		await self.parse_receive(data)

	# ------------------------------- Parse events ------------------------------- #
 
	async def parse_receive(self, data):
		if 'event' in data:
			event = data['event']
			if event == 'load_lobby':
				await self.on_load_lobby()
			elif event == 'load_playground':
				await self.on_load_playground()
			elif event == 'tournament_start':
				await self.on_tournament_start()
			elif event == 'game_start':
				await self.on_game_start()
			elif event == 'player_key_down':
				await self.on_player_key_down(data)
			elif event == 'player_key_up':
				await self.on_player_key_up(data)
			else:
				print(f'Unknown event: {event}')
		else:
			print('Event not found in data', data)

	# ------------------------------- Event handlers ------------------------------- #
 
	async def on_load_lobby(self):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		await self.send(text_data=json.dumps({
			'type': 'load_lobby',
			'arg': self.tournament_manager.get_printable_room(tournament_name)
			}))
		
	async def on_load_playground(self):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		if self.tournament_manager.start_tournament(tournament_name):
			await self.send_load_playground()
		else:
			return

	async def on_tournament_start(self):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		user = self.scope['user'].username
		room = self.tournament_manager.get_room(tournament_name)

		room['n_ready'] += 1
		if room['n_ready'] < players_size_max:
			return

		print("All players ready")
		await self.send_tournament_start()
		players = self.tournament_manager.get_players_turn(tournament_name)
		await self.send_set_position(players, room['state'])

	async def on_game_start(self):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		game = self.tournament_manager.get_room(tournament_name)['game_state']
		players = self.tournament_manager.get_players_turn(tournament_name)
		await self.send_game_start(players)

		print("\033[91m" + "ENTER ON GAME START" + "\033[0m")
		game.is_running = True
		game.ball.x_vel = game.ball.speed
		asyncio.create_task(self.game_loop())

	async def on_player_key_down(self, data):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		game = self.tournament_manager.get_room(tournament_name)['game_state']

		await game.set_player_movement(data['player'], True, data['direction'])

	async def on_player_key_up(self, data):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		game = self.tournament_manager.get_room(tournament_name)['game_state']

		await game.set_player_movement(data['player'], False, False)

	# ------------------------------- Send Messages ------------------------------ #

	async def send_players_update(self):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		
		await self.channel_layer.group_send(
			tournament_name,
			{
				'type': 'players_update',
				'arg': self.tournament_manager.get_printable_room(tournament_name)
			}
		)

	async def players_update(self, event):
		await self.send(text_data=json.dumps({
			'type': 'players_update',
			'arg': event['arg']
		}))

	async def send_tournament_start(self):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		
		await self.channel_layer.group_send(
			tournament_name,
			{
				'type': 'tournament_start',
				'arg': self.tournament_manager.get_printable_room(tournament_name)
			}
		)

	async def tournament_start(self, event):
		await self.send(text_data=json.dumps({
			'type': 'tournament_start',
			'arg': event['arg']
		}))

	async def send_tournament_end(self, message):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		
		await self.channel_layer.group_send(
			tournament_name,
			{
				'type': 'tournament_end',
				'arg': message
			}
		)

	async def tournament_end(self, event):
		await self.send(text_data=json.dumps({
			'type': 'tournament_end',
			'arg': event['arg']
		}))
	
	async def send_load_playground(self):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		
		await self.channel_layer.group_send(
			tournament_name,
			{
				'type': 'load_playground',
				'arg': {}
			}
		)

	async def load_playground(self, event):
		await self.send(text_data=json.dumps({
			'type': 'load_playground',
			'arg': event['arg']
		}))

	async def send_set_position(self, players, state):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		
		await self.channel_layer.group_send(
			tournament_name,
			{
				'type': 'set_position',
				'arg': {
					'players': players,
					'state': state
				}
			}
		)

	async def set_position(self, event):
		await self.send(text_data=json.dumps({
			'type': 'set_position',
			'arg': event['arg']
		}))

	async def send_game_start(self, players):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		
		await self.channel_layer.group_send(
			tournament_name,
			{
				'type': 'game_start',
				'arg': {
					'player1': players[0],
					'player2': players[1]
				}
			}
		)
		if len(players) == 2:
			print("Player1: ", players[0] + " Player2: ", players[1])
		else:
			print("Error: ", players)

	async def game_start(self, event):
		await self.send(text_data=json.dumps({
			'type': 'game_start',
			'arg': event['arg']
		}))

	async def send_game_end(self, winner, looser, state):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		
		await self.channel_layer.group_send(
			tournament_name,
			{
				'type': 'game_end',
				'arg': {
					'winner': winner,
					'looser': looser,
					'state': state
				}
			}
		)

	async def game_end(self, event):
		await self.send(text_data=json.dumps({
			'type': 'game_end',
			'arg': event['arg']
		}))
	
	async def send_game_state(self):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		game = self.tournament_manager.get_room(tournament_name)['game_state']
		
		await self.channel_layer.group_send(
			tournament_name,
			{
				'type': 'game_state',
				'arg': {
					'player_one_pos_y': game.players[0].y,
					'player_two_pos_y': game.players[1].y,
					'player_one_score': game.players[0].score,
					'player_two_score': game.players[1].score,
					'ball_x': game.ball.x,
					'ball_y': game.ball.y,
					'ball_x_vel': game.ball.x_vel,
					'ball_y_vel': game.ball.y_vel,
					'ball_color': game.ball.color
				}
			}
		)

	async def game_state(self, event):
		await self.send(text_data=json.dumps({
			'type': 'game_state',
			'arg': event['arg']
		}))

	# ------------------------------- Game handler ------------------------------- #
 
	async def get_update_lock(self):
		if self.update_lock is None:
			self.update_lock = asyncio.Lock()
		return self.update_lock
	
	async def game_loop(self):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		game = self.tournament_manager.get_room(tournament_name)['game_state']

		async with await self.get_update_lock():
			while game.is_running == True:
				await game.update()
				await self.send_game_state()
				await asyncio.sleep(tick_duration)
			if game.someone_won == True:
				await self.end_game()

	async def end_game(self):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		game = self.tournament_manager.get_room(tournament_name)['game_state']
		players = self.tournament_manager.get_players_turn(tournament_name)

		game.is_running = False

		if game.players[0].score >= game.players[1].score:
			await self.send_game_end(players[0], players[1], self.tournament_manager.get_room(tournament_name)['state'])
			keep = self.tournament_manager.next_turn(tournament_name, 0, 1)
		elif game.players[1].score >= game.players[0].score:
			await self.send_game_end(players[1], players[0], self.tournament_manager.get_room(tournament_name)['state'])
			keep = self.tournament_manager.next_turn(tournament_name, 1, 0)
		
		await asyncio.sleep(5)

		if keep:
			players = self.tournament_manager.get_players_turn(tournament_name)
			await self.send_set_position(players, self.tournament_manager.get_room(tournament_name)['state'])
		else:
			self.tournament_manager.remove_room(tournament_name)
			await self.send_tournament_end("Tournament ended")
