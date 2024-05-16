import random, math

from asgiref.sync import sync_to_async

from games_manager.models import TwoPlayersGame

# Constants for the game area and paddles
GAME_AREA_WIDTH = 650
GAME_AREA_HEIGHT = 480
PADDLE_WIDTH = 10
PADDLE_HEIGHT = 70
PLAYER_SPEED = GAME_AREA_HEIGHT / 100
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
		winner (str): The position of the player who won the game either by having the winning score or by deconnection
		is_running (bool): Indicates whether the game is currently running.
		winning_score (int): The score required to win the game.
		game_history (TwoPlayersGame): The game history object to record the results of the games.

	Methods:
		add_player_to_dict(player_pos, player_model): Add a player to the game state dictionary.
		remove_player_from_dict(player_pos): Remove a player from the game state dictionary.
		get_winner_pos(): Get the winner of the game.
		set_player_movement(player_pos, is_moving, direction_v): Set the movement of a player based on the input received from the client.
		handle_scores(): Handle scoring and check for a winner.
		update(): Update the game state by moving the players and the ball.
		record_game_result(winner_pos, loser_pos): Record the result of the game in the database.
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
		Get the position of the winner of the game.
		If there is only one player, the other player wins by default (case for deconnection).

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
			if self.players['player_left'].score >= self.winning_score:
				return "player_left"
			elif self.players['player_right'].score >= self.winning_score:
				return "player_right"
			else:
				return None

	async def set_player_movement(self, player_pos, is_moving, direction_v):
		"""
		Set the movement of a player based on the input received from the client.

		Args:
			player_pos (str): position of the player ('player_left' or 'player_right')
			is_moving (bool): indicates if the player is moving
			direction_v (bool): vertical direction of the player's movement (True for up, False for down)
		"""
		self.players[player_pos].is_moving = is_moving
		self.players[player_pos].vertical = direction_v

	async def handle_scores(self):
		"""
		Handle scoring and check for a winner.

		If the ball goes out of bounds on the left side, 'player_right' scores a point.
		If the ball goes out of bounds on the right side, 'player_left' scores a point.
		If either player reaches the winning score, stop the game.
		"""
		if self.ball.x - (self.ball.radius / 2) <= 0:
			await self.players['player_right'].score_point()
			await self.ball.reset()
		elif self.ball.x + (self.ball.radius / 2) >= GAME_AREA_WIDTH:
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
		await self.ball.move(self.players["player_left"], self.players["player_right"])
		await self.handle_scores()

	async def record_game_result(self, winner_pos, loser_pos):
		"""
		Record the result of the game in the database.
		The checks are necessary to avoid recording a game result of a player who was removed from the game.

		Args:
			winner_pos (str): position of the winner ('player_left' or 'player_right')
			loser_pos (str): position of the loser ('player_left' or 'player_right')
		"""
		if winner_pos is not None:
			winner = self.players[winner_pos].player_model
			await sync_to_async(winner.record_win)('2p', self.players[winner_pos].score)
			winner.status = "ONLINE"
			await sync_to_async(winner.save)()
		if loser_pos is not None:
			loser = self.players[loser_pos].player_model
			await sync_to_async(loser.record_loss)('2p', self.players[loser_pos].score)
			loser.status = "ONLINE"
			await sync_to_async(loser.save)()
		if winner_pos is not None and loser_pos is not None:
			winner = self.players[winner_pos].player_model
			await sync_to_async(self.game_history.result)(winner, self.players["player_left"].score,
															self.players["player_right"].score)

	class Player:
		"""
		Represents a player in the game.

		Attributes:
			x (int): x-coordinate of the player's position
			y (int): y-coordinate of the player's position
			score (int): player's score
			is_moving (bool): indicates if the player is currently moving
			vertical (bool): vertical direction of the player's movement (True for up, False for down)
			player_model (Player model instance): instance of the model Player associated with the player

		Methods:
			check_bounds(velocity_y): Check if the player is within the bounds of the game area.
			move(): Move the player based on the current direction.
			score_point(): Increment the player's score by 1.
		"""
		def __init__(self, position, player_model):
			if position == 'player_left':
				self.x = PADDLE_WIDTH
			else:
				self.x = GAME_AREA_WIDTH - PADDLE_WIDTH - 10
			self.y = PLAYER_START_POS_Y
			self.score = 0
			self.is_moving = False
			self.vertical = False
			self.horizontal = False
			self.player_model = player_model

		def check_bounds(self, y_position):
			"""
			Check if the player is within the bounds of the game area.

			Args:
				y_position (int): sum of the y-coordinate and the velocity i.e. the possible new y-coordinate

			Returns:
				True if the player is out of bounds, False otherwise
			"""
			return y_position < 0 or y_position > GAME_AREA_HEIGHT - PADDLE_HEIGHT

		async def move(self):
			"""
			Move the player based on the current direction.

			If the player is moving up, decrease the y-coordinate by the player speed.
			If the player is moving down, increase the y-coordinate by the player speed.

			Checks if the player is within the bounds of the game area before doing the move.
			"""
			if self.is_moving:
				if self.vertical:
					velocity_y = -PLAYER_SPEED
				elif not self.vertical:
					velocity_y = PLAYER_SPEED
				if self.check_bounds(velocity_y + self.y) == 0:
					self.y += velocity_y

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
			color (tuple): color of the ball (RGB values)
			speed_multiplier_x (float): multiplier for the x-velocity after a collision
			speed_multiplier_y (float): multiplier for the y-velocity after a collision
			x_vel (int): velocity of the ball in the x-direction
			y_vel (int): velocity of the ball in the y-direction

		Methods:
			handle_collision(): Handle collisions with the walls and the paddles.
			move(): Move the ball based on its velocity.
			reset(): Reset the ball to its initial position and velocity.
		"""
		def __init__(self):
			"""
			The ball y-coordinate is randomly set between 200 and GAME_AREA_HEIGHT - 200.

			The direction of the ball is randomly set to the left or right using a ternary operator.

			The angle of the ball is randomly set within the range defined by MIN_START_ANGLE and MAX_START_ANGLE.
			MIN_START_ANGLE & MAX_START_ANGLE (radian) define a range of angles in which the ball can start moving.
			~2.79rad & ~3.49 that corresponds to 160° & 200°, so the ball can start in a cone of 20° centered on 180°.
			"""
			self.x = GAME_AREA_WIDTH / 2
			self.y = random.randint(200, GAME_AREA_HEIGHT - 200)
			self.radius = 10
			self.speed = GAME_AREA_WIDTH / 250
			self.color = "white"
			self.speed_multiplier_x = 1.1
			self.speed_multiplier_y = 1.05
			random_angle = random.uniform(MIN_START_ANGLE, MAX_START_ANGLE)
			direction = -1 if random.choice([0, 1]) < 0.5 else 1
			self.x_vel = (math.cos(random_angle) * self.speed) * direction
			self.y_vel = math.sin(random_angle) * self.speed

		def handle_collision(self, player_left, player_right):
			"""
			Handle collisions with the walls and the paddles.

			If the ball hits the top or bottom wall, reverse the y-velocity and augment the x-velocity.
			If the ball hits the bottom wall, set the y-coordinate to the ball radius.
			If the ball hits the top wall, set the y-coordinate to the game area height minus the ball radius.

			Checks for the collision with the left paddle if the ball is moving left.
			Checks for the collision with the right paddle if the ball is moving right.

			The ball will get a different y-velocity based on the position of the ball on the paddle.

			Args:
				player_left (Player): Player object from the GameState object.
				player_right (Player): Player object from the GameState object.
			"""
			if self.y - self.radius <= 0 or self.y + self.radius >= GAME_AREA_HEIGHT:
				self.y_vel *= -1 * self.speed_multiplier_y
				if (abs(self.x_vel) <= 20):
					self.x_vel *= self.speed_multiplier_x
			if self.y - self.radius <= 0:
				self.y = self.radius
			if self.y + self.radius >= GAME_AREA_HEIGHT:
				self.y = GAME_AREA_HEIGHT - self.radius

			if self.x_vel < 0:
				if (self.y <= player_left.y + PADDLE_HEIGHT and
					self.y >= player_left.y and self.x > player_left.x and
					self.x - self.radius <= player_left.x + PADDLE_WIDTH):
						if (abs(self.x_vel) >= 20):
							self.x_vel *= -1
						else :
							self.x_vel *= -1 * self.speed_multiplier_x
						middle_y = player_left.y + PADDLE_HEIGHT / 2
						difference_in_y = middle_y - self.y
						reduction_factor = PADDLE_HEIGHT / 2
						new_y_vel = difference_in_y / reduction_factor * self.speed
						self.y_vel = -1 * new_y_vel
			else:
				if (self.y <= player_right.y + PADDLE_HEIGHT and
					self.y >= player_right.y and self.x < player_right.x and
					self.x + self.radius >= player_right.x):
						if (abs(self.x_vel) >= 20):
							self.x_vel *= -1 
						else:
							self.x_vel *= -1 * self.speed_multiplier_x
						middle_y = player_right.y + PADDLE_HEIGHT / 2
						difference_in_y = middle_y - self.y
						reduction_factor = PADDLE_HEIGHT / 2
						new_y_vel = difference_in_y / reduction_factor * self.speed
						self.y_vel = -1 * new_y_vel

		async def move(self, player_left, player_right):
			"""
			Move the ball based on its velocity.

			Update the x and y coordinates of the ball by adding the velocity components.

			Args:
				players (list): List of Player objects from the GameState object.
			"""
			self.handle_collision(player_left, player_right)
			self.x += self.x_vel
			self.y += self.y_vel
			# print("ball x: ", self.x, "  |  ball y: ", self.y)

		async def reset(self):
			"""
			Reset the ball to a random position and velocity.
			See the constructor for more details on the random.
			"""
			self.x = GAME_AREA_WIDTH / 2
			self.y = random.randint(200, GAME_AREA_HEIGHT - 200)
			random_angle = random.uniform(MIN_START_ANGLE, MAX_START_ANGLE)
			direction = -1 if random.choice([0, 1]) < 0.5 else 1
			self.x_vel = (math.cos(random_angle) * self.speed) * direction
			self.y_vel = math.sin(random_angle) * self.speed