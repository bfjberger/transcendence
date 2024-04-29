import random, math

from asgiref.sync import sync_to_async

from players_manager.models import Player
from games_manager.models import TwoPlayersGame

# Constants for the game area and paddles
GAME_AREA_WIDTH = 650
GAME_AREA_HEIGHT = 480
PADDLE_WIDTH = 10
PADDLE_HEIGHT = 70
PLAYER_SPEED = 3
PLAYER_START_POS_Y = (GAME_AREA_HEIGHT - PADDLE_HEIGHT) / 2
MIN_START_ANGLE = math.pi - (math.pi / 9)
MAX_START_ANGLE = math.pi + (math.pi / 9)

class GameState:
	"""
	Represents the state of the game, including the ball, players, and game logic.

	Attributes:
		room_name (str): The name of the room where the game is taking place.
		ball (Ball): The ball object in the game.
		players (dict): A dictionary with the player positions as keys and Player objects as values.
		is_running (bool): Indicates whether the game is currently running.
		winning_score (int): The score required to win the game.
		game_history (TwoPlayersGame): The game history object to record the results of the games.

	Methods:
		add_player_to_dict(player_pos, player_model): Add a player to the game state dictionary.
		remove_player_from_dict(player_pos): Remove a player from the game state dictionary.
		get_winner_pos(): Get the winner of the game if there is one.
		set_player_movement(player_pos, is_moving, direction_v): Set the movement of a player based on the input received from the client.
		handle_scores(): Handle scoring and check for a winner.
		update(): Update the game state by moving the players and the ball.
	"""
	def __init__(self, name):
		self.room_name = name
		self.ball = self.Ball()
		self.players = {}
		self.is_running = False
		self.winning_score = 3
		self.game_history = TwoPlayersGame()

	def add_player_to_dict(self, player_pos, player_model):
		"""
		Add a player to the game state dictionary.

		Args:
			player_pos (str): position of the player ('player_left' or 'player_right')
			player_model (Player model instance): instance of the model Player associated with the player
		"""
		self.players[player_pos] = self.Player(player_pos, player_model)

	def remove_player_from_dict(self, player_pos):
		"""
		Remove a player from the game state dictionary.

		Args:
			player_pos (str): position of the player ('player_left' or 'player_right')
		"""
		del self.players[player_pos]

	async def get_winner_pos(self):
		"""
		Get the position of the winner of the game if there is one.

		Returns:
			str: position of the winner ('player_left' or 'player_right') or None if there is no winner yet
		"""
		if len(self.players) < 2:
			if "player_left" in self.players.keys():
				return "player_right"
			elif "player_right" in self.players.keys():
				return "player_left"
			else:
				return None
		if self.is_running == False:
			if self.players['player_left'].score > self.players['player_right'].score and self.players['player_left'].score >= self.winning_score:
				return "player_left"
			elif self.players['player_left'].score < self.players['player_right'].score and self.players['player_right'].score >= self.winning_score:
				return "player_right"
			else:
				return None

	async def set_player_movement(self, player_pos, is_moving, direction_v):
		"""
		Set the movement of a player based on the input received from the client.

		Args:
			player_pos (str): position of the player ('player_left' or 'player_right')
			is_moving (bool): indicates if the player is moving
			direction_v (int): vertical direction of the player's movement (1 for up, -1 for down and 0 for no movement)
			4 Joueurs direction_h (int): horizontal direction of the player's movement (1 for left, -1 for right and 0 for no movement)
		"""
		if is_moving == 1 or is_moving == -1:
			self.players[player_pos].is_moving = True
		else:
			self.players[player_pos].is_moving = False
		self.players[player_pos].vertical = direction_v
		# 4 Joueurs player.horizontal = direction_h

	async def handle_scores(self):
		"""
		Handle scoring and check for a winner.

		If the ball goes out of bounds on the left side, 'player_right' scores a point.
		If the ball goes out of bounds on the right side, 'player_left' scores a point.
		If either player reaches the winning score, stop the game.
		"""
		if self.ball.x <= 0 - (self.ball.radius / 2):
			await self.players['player_right'].score_point()
			await self.ball.reset()
		elif self.ball.x >= GAME_AREA_WIDTH + (self.ball.radius / 2):
			await self.players['player_left'].score_point()
			await self.ball.reset()

		for player in self.players.values():
			if player.score >= self.winning_score:
				self.is_running = False

	async def update(self):
		"""
		Update the game state by moving the players and the ball.
		"""
		for player in self.players.values():
			await player.move()
		await self.ball.move()
		await self.handle_scores()

	async def record_game_result(self, winner_pos, loser_pos):
		"""
		Record the result of the game in the database.

		Args:
			winner_pos (str): position of the winner ('player_left' or 'player_right')
			loser_pos (str): position of the loser ('player_left' or 'player_right')
		"""
		if winner_pos is not None:
			winner = self.players[winner_pos].player_model
			await sync_to_async(winner.record_win)('2p', self.players[winner_pos].score)
		if loser_pos is not None:
			loser = self.players[loser_pos].player_model
			await sync_to_async(loser.record_loss)('2p', self.players[loser_pos].score)
		if winner_pos is not None and loser_pos is not None:
			winner = self.players[winner_pos].player_model
			await sync_to_async(self.game_history.result)(winner, self.players["player_left"].score, self.players["player_right"].score)

	class Player:
		"""
		Represents a player in the game.

		Attributes:
			x (int): x-coordinate of the player's position
			y (int): y-coordinate of the player's position
			score (int): player's score
			is_moving (bool): indicates if the player is currently moving
			vertical (bool): vertical direction of the player's movement (True for up, False for down)
			4 JOUEURS horizontal (bool): horizontal direction of the player's movement (True for left, False for right)
			player_model (Player model instance): instance of the model Player associated with the player

		Methods:
			move(): Move the player based on the current direction.
			score_point(): Increment the player's score by 1.
		"""
		def __init__(self, position, player_model):
			if position == 'player_left':
				self.x = 0 + PADDLE_WIDTH
			else:
				self.x = GAME_AREA_WIDTH - PADDLE_WIDTH
			self.y = PLAYER_START_POS_Y
			self.score = 0
			self.is_moving = False
			self.vertical = 0
			self.horizontal = 0
			self.player_model = player_model

		async def move(self):
			"""
			Move the player based on the current direction.

			If the player is moving up, decrease the y-coordinate by the player speed.
			If the player is moving down, increase the y-coordinate by the player speed.
			"""
			if self.is_moving:
				if self.vertical:
					if (self.y + PADDLE_HEIGHT / 2) + PLAYER_SPEED <= GAME_AREA_HEIGHT:
						self.y -= PLAYER_SPEED
				else:
					if (self.y + PADDLE_HEIGHT / 2) - PLAYER_SPEED >= GAME_AREA_HEIGHT * -1:
						self.y += PLAYER_SPEED

		async def score_point(self):
			self.score += 1

	class Ball:
		"""
		Represents the ball object in the game.

		Attributes:
			x (int): x-coordinate of the ball's position
			y (int): y-coordinate of the ball's position
			radius (int): radius of the ball
			speed (int): speed of the ball
			x_vel (int): velocity of the ball in the x-direction
			y_vel (int): velocity of the ball in the y-direction
			color (tuple): color of the ball (RGB values)

		Methods:
			move(): Move the ball based on its velocity.
			handle_collision(): Handle collisions with the walls and the paddles.
			reset(): Reset the ball to its initial position and velocity.
		"""
		def __init__(self):
			self.x = GAME_AREA_WIDTH / 2
			self.y = random.randint(200, GAME_AREA_HEIGHT - 200)
			self.radius = 10
			self.speed = 2
			self.color = "white"
			self.speed_multiplier_x = 1.1
			self.speed_multiplier_y = 1.05
			random_angle = random.uniform(MIN_START_ANGLE, MAX_START_ANGLE)
			direction = random.choice([-1, 1])
			self.x_vel = (math.cos(random_angle) * self.speed) * direction
			self.y_vel = math.sin(random_angle) * self.speed

		async def move(self):
			"""
			Move the ball based on its velocity.

			Update the x and y coordinates of the ball by adding the velocity components.
			"""
			self.handle_collision()
			self.x += self.x_vel * self.speed
			self.y += self.y_vel * self.speed

		async def handle_collision(self):
			"""
			Handle collisions with the walls and the paddles.

			If the ball hits the top or bottom wall, reverse the y-velocity.
			If the ball hits the bottom wall, set the y-coordinate to the ball radius.
			If the ball hits the top wall, set the y-coordinate to the game area height minus the ball radius.
			If the ball hits a paddle, reverse the x-velocity.
			"""
			if self.y - self.radius <= 0 or self.y + self.radius >= GAME_AREA_HEIGHT:
				self.y_vel *= -1 * self.speed_multiplier_y
				self.x_vel *= self.speed_multiplier_x
			if self.y - self.radius <= 0:
				self.y = self.radius
			if self.y + self.radius >= GAME_AREA_HEIGHT:
				self.y = GAME_AREA_HEIGHT - self.radius

			for player in self.players.values():
				if (self.x - self.radius <= player.x + PADDLE_WIDTH and
					self.y >= player.y and self.y <= player.y + PADDLE_HEIGHT):
					self.x_vel *= -1 * self.speed_multiplier_x
					middle_y = player.y + PADDLE_HEIGHT / 2
					difference_in_y = middle_y - self.y
					reduction_factor = (PADDLE_HEIGHT / 2) / self.speed
					new_y_vel = difference_in_y / reduction_factor
					self.y_vel = -1 * new_y_vel * self.speed_multiplier_y

		async def reset(self):
			"""
			Reset the ball to its initial position and velocity.
			"""
			self.x = GAME_AREA_WIDTH / 2
			self.y = random.randint(200, GAME_AREA_HEIGHT - 200)
			random_angle = random.uniform(MIN_START_ANGLE, MAX_START_ANGLE)
			direction = random.choice([-1, 1])
			self.x_vel = (math.cos(random_angle) * self.speed) * direction
			self.y_vel = math.sin(random_angle) * self.speed