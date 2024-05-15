import json
from copy import deepcopy
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import TournamentRoom, TournamentStat
from .gamelogic_tournament import GameState
import random
from players_manager.models import Player

TIMER = 60
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

async def end_game_add_stats(winner, losers, tournament_name):
	"""
	Add stats to the database at the end of a game in a tournament.

	Args:
		winner (str): The nickname of the winner.
		losers (list): A list of nicknames of the losers.
		tournament_name (str): The name of the tournament.
	"""
	stats = TournamentStat(tournament_name=tournament_name, winner=winner)
	await sync_to_async(stats.save)()
	losers_objs = await sync_to_async(Player.objects.filter)(nickname__in=losers)
	losers_ids = await sync_to_async(lambda: [loser.id for loser in losers_objs])()
	await sync_to_async(stats.losers.add)(*losers_ids)
	await sync_to_async(stats.save)()
	

class TournamentManager():
	def __init__(self):
		self.rooms = {}

	def create_or_join_room(self, room_name, player, nickname):
		"""
		Creates a new room or adds a player to an existing room

		Args:
			room_name (str): The name of the room
			player (str): The player's name
			nickname (str): The player's nickname
		
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
				'players_list': [player],
				'nicknames': [nickname],
				'players_and_nicknames': {player: nickname},
				'players_state': [PlayerState["PENDING"]],
				'rounds': {},
				'winners': [],
				'losers': [],
				'round_number': 1,
				'match_number': 1,
				'game_state': GameState()
			}
			self.rooms[room_name] = current_room
		else:
			print("JOINING room")
			if player in current_room['players']:
				print("Player already in room")
				return False
			current_room['players'].append(player)
			current_room['players_list'].append(player)
			current_room['nicknames'].append(nickname)
			current_room['players_and_nicknames'][player] = nickname
			current_room['players_state'].append(PlayerState["PENDING"])
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
			current_room['players_list'].pop(index)
			current_room['nicknames'].pop(index)

			if len(current_room['players']) == 0:
				print(f'DELETING room {room_name}')
				self.rooms.pop(room_name)
				return
			elif player == current_room['owner']:
				print(f'New owner is {current_room["players"][0]}')
				current_room['owner'] = current_room['players'][0]
			self.rooms[room_name] = current_room

	def get_room(self, room_name):
		return self.rooms.get(room_name, {})
	
	def remove_room(self, room_name):
		self.rooms.pop(room_name, None)

	def get_printable_room(self, room_name):
		room = deepcopy(self.get_room(room_name))
		if not room:
			return {}
		del room['game_state']
		return room

	def start_tournament(self, room_name):
		room = self.get_room(room_name)
		if not room:
			return False
		
		if len(room['players']) == 8:
			room['state'] = TournamentStage['QUARTER_FINALS1']
			print("Tournament with 8 players started")
		elif len(room['players']) == 4:
			room['state'] = TournamentStage['DEMI_FINALS1']
			print("Tournament with 4 players started")
		else:
			print("Invalid number of players: ", len(room['players']))
			print("Expected: ", 4 , " or ", 8)
			return False
		return True
	
	def get_players_turn(self, room_name):
		room = self.get_room(room_name)

		if len(room['players']) <= 1 and len(room['winners']) <= 1:
			return []
		elif len(room['players']) <= 1:
			room['players'] = room['winners']
			room['winners'] = []
			room['round_number'] += 1


		player1 = room.get('players', [])[0]
		player2 = room.get('players', [])[1]
		players = [player1, player2]
		return players

	def change_room_state(self, room):
		if room['state'] == TournamentStage["QUARTER_FINALS1"]:
			room['state'] = TournamentStage["QUARTER_FINALS2"]
		elif room['state'] == TournamentStage["QUARTER_FINALS2"]:
			room['state'] = TournamentStage["QUARTER_FINALS3"]
		elif room['state'] == TournamentStage["QUARTER_FINALS3"]:
			room['state'] = TournamentStage["QUARTER_FINALS4"]
		elif room['state'] == TournamentStage["QUARTER_FINALS4"]:
			room['state'] = TournamentStage["DEMI_FINALS1"]
		elif room['state'] == TournamentStage["DEMI_FINALS1"]:
			room['state'] = TournamentStage["DEMI_FINALS2"]
		elif room['state'] == TournamentStage["DEMI_FINALS2"]:
			room['state'] = TournamentStage["FINALS"]


	def add_match_info(self, room, game, winner):
		"""
		Add match information to the room's rounds dictionary.

		Args:
			room (dict): The room dictionary containing information about the room.
			game (Game): The game object containing information about the game.
			winner (str): The winner of the match.
		"""
		round_number = room.get('round_number', 1)
		match_number = room.get('match_number', 1)
		player1 = room.get('players', [])[0]
		player2 = room.get('players', [])[1]
		score = [game.players[0].score, game.players[1].score]

		match = {
			"players": [player1, player2],
			"winner": winner,
			"round": round_number,
			"match": match_number,
			"score": score
		}

		if not room['rounds'].get(room['state'], None):
			room['rounds'][room['state']] = []

		room['rounds'][room['state']] = match

	def update_for_next_match(self, room, winner):
		"""
		Updates the room game state for the next match,
		adjust the players list by popping the first 2 players,
		increment the match_number.

		Args:
			room (dict): The room object containing the current state.
			winner: The winner of the current match.
		"""
		room['match_number'] += 1
		room['winners'].append(winner)
		room['players'] = room['players'][2:]  # remove the first two players from the list
		room['game_state'] = GameState()


	def next_turn(self, room_name, winnerIdx, loserIdx):
		"""
		Process the next turn in the tournament.

		Args:
			room_name (str): The name of the room.
			winnerIdx (int): The index of the winner player in the room's players list, the player list is [0, 1].
			loserIdx (int): The index of the loser player in the room's players list. 

		Returns:
			bool: True if the next turn was processed successfully, False otherwise.
		"""
		room = self.get_room(room_name)
		game = room['game_state']

		if len(room['players']) <= 1 and len(room['winners']) <= 1:
			return False

		winner = room.get('players', [])[winnerIdx]
		self.add_match_info(room, game, winner)
		self.update_for_next_match(room, winner)

		if len(room['players']) <= 1 and len(room['winners']) <= 1:
			return False
		elif len(room['players']) <= 1:
			room['players'] = room['winners']
			room['winners'] = []
			room['round_number'] += 1
			room['match_number'] = 1

		self.change_room_state(room)
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
		self.tournament = await sync_to_async(TournamentRoom.objects.get)(name=tournament_name)
		player = self.scope['user'].username
		# player_obj = Player.objects.get(owner=self.scope['user'])
		player_obj = await sync_to_async(Player.objects.get)(owner=self.scope['user'])
		nickname = player_obj.nickname
		# nickname = player

		await self.channel_layer.group_add(
			tournament_name,
			self.channel_name
		)

		if self.tournament_manager.create_or_join_room(tournament_name, player, nickname):
			await self.accept()
		else:
			await self.close()

		await self.send_players_update()

	async def disconnect(self, close_code):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		player = self.scope['user'].username
		# player_obj = Player.objects.get(owner=self.scope['user'])
		player_obj = await sync_to_async(Player.objects.get)(owner=self.scope['user'])
		nickname = player_obj.nickname
		# nickname = player
		room = self.tournament_manager.get_room(tournament_name)

		if room:
			if room['state'] == TournamentStage["LOBBY"]:
				self.tournament_manager.remove_player(tournament_name, player)
				await self.send_players_update()
			else:
				idx = self.tournament_manager.get_player_index(tournament_name, player)
				if idx > -1:
					player_state = room['players_state'][idx]
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
			elif event == 'load_game':
				await self.on_load_game()
			elif event == 'tournament_start':
				await self.on_tournament_start()
			elif event == 'game_start':
				await self.on_game_start()
			elif event == 'player_key_down':
				await self.on_player_key_down(data)
			elif event == 'player_key_up':
				await self.on_player_key_up(data)
			elif event == 'tournament_end':
				await self.send_tournament_end("Tournament ended")
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
		
	async def on_load_game(self):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		if self.tournament_manager.start_tournament(tournament_name):
			await self.send_load_game()
		else:
			return

	async def on_tournament_start(self):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		user = self.scope['user'].username
		room = self.tournament_manager.get_room(tournament_name)

		room['n_ready'] += 1
		if room['n_ready'] < len(room['players']):
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

		game.is_running = True
		game.start_time = asyncio.get_event_loop().time()
		game.time_elapsed = 0
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
	
	async def send_load_game(self):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		
		await self.channel_layer.group_send(
			tournament_name,
			{
				'type': 'load_game',
				'arg': {}
			}
		)

	async def load_game(self, event):
		await self.send(text_data=json.dumps({
			'type': 'load_game',
			'arg': event['arg']
		}))

	async def send_set_position(self, players, state):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		print("Players: ", players, " State: ", state)
		nicknames = [ self.tournament_manager.get_room(tournament_name)['players_and_nicknames'][player] for player in players ]
		await self.channel_layer.group_send(
			tournament_name,
			{
				'type': 'set_position',
				'arg': {
					'players': players,
					'nicknames': nicknames,
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
	
	async def send_matchs_info(self):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		room = self.tournament_manager.get_room(tournament_name)
		matchs = room['rounds']
		await self.channel_layer.group_send(
			tournament_name,
			{
				'type': 'matchs_info',
				'arg': matchs
			}
		)
	
	async def matchs_info(self, event):
		await self.send(text_data=json.dumps({
			'type': 'matchs_info',
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
					'ball_color': game.ball.color,
					'game_time': game.time_elapsed
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
				game.time_elapsed = asyncio.get_event_loop().time() - game.start_time
				if game.time_elapsed > TIMER:
					game.is_running = False
					game.someone_won = True
				await game.update()
				await self.send_game_state()
				await asyncio.sleep(tick_duration)
			if game.someone_won == True:
				await self.end_game()

	async def end_game(self):
		tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		room = self.tournament_manager.get_room(tournament_name)
		game = self.tournament_manager.get_room(tournament_name)['game_state']
		players = self.tournament_manager.get_players_turn(tournament_name)
		game.is_running = False
		loser = None

		if game.players[0].score > game.players[1].score:
			loser = players[1]
			await self.send_game_end(players[0], players[1], self.tournament_manager.get_room(tournament_name)['state'])
			keep = self.tournament_manager.next_turn(tournament_name, 0, 1)
		elif game.players[1].score > game.players[0].score:
			loser = players[0]
			await self.send_game_end(players[1], players[0], self.tournament_manager.get_room(tournament_name)['state'])
			keep = self.tournament_manager.next_turn(tournament_name, 1, 0)
		elif game.players[0].score == game.players[1].score:
			winner = players[1] if random.choice([0, 1]) < 0.5 else players[0]
			loser = players[0] if winner == players[1] else players[1]
			winnerIdx = 1 if winner == players[1] else 0
			loserIdx = 0 if loser == players[1] else 1
			await self.send_game_end(winner, loser, self.tournament_manager.get_room(tournament_name)['state'])
			keep = self.tournament_manager.next_turn(tournament_name, winnerIdx, loserIdx)

		await self.send_matchs_info()
		if loser:
			room['losers'].append(loser)

		await asyncio.sleep(5)


		if keep:
			players = self.tournament_manager.get_players_turn(tournament_name)
			await self.send_set_position(players, self.tournament_manager.get_room(tournament_name)['state'])
		else:
			# print room round matches
			print(room['rounds'])
			winner_nickname = room['players_and_nicknames'][room['winners'][0]]
			winner_obj = await sync_to_async(Player.objects.get)(nickname=winner_nickname)
			await end_game_add_stats(winner_obj, room['losers'], tournament_name)
			self.tournament_manager.remove_room(tournament_name)
			await self.send_tournament_end("Tournament ended")

			# Delete the tournament from the database
			await sync_to_async(self.tournament.delete)()

