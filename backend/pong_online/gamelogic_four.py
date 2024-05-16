import random, math

from asgiref.sync import sync_to_async

from games_manager.models import FourPlayersGame

# Constants for the game area and paddles
GAME_AREA_WIDTH = 650
GAME_AREA_HEIGHT = 650
PADDLE_WIDTH = 10
PADDLE_HEIGHT = 70
PLAYER_SPEED = GAME_AREA_HEIGHT / 100
MIDDLE_PLAYER_X_POS = (GAME_AREA_WIDTH - PADDLE_HEIGHT) / 2
MIDDLE_PLAYER_Y_POS = (GAME_AREA_HEIGHT - PADDLE_HEIGHT) / 2

class GameStateFour:
	"""
	Represents the state of the game, including the ball, players, and game logic.

	Attributes:
		room_name (str): The name of the room where the game is taking place.
		ball (Ball): The ball object in the game.
		players (dict): A dictionary with the player positions as keys and Player objects as values.
		is_running (bool): Indicates whether the game is currently running.
		winning_score (int): The score required to win the game.
		game_history (FourPlayersGame): The game history object to record the results of the games.

	Methods:
		add_player_to_dict(player_pos, player_model): Add a player to the game state dictionary.
		remove_player_from_dict(player_pos): Remove a player from the game state dictionary.
		get_winner_pos(): Get the winner of the game.
		set_player_movement(player_pos, is_moving, direction_v, direction_h):
			Set the movement of a player based on the input received from the client.
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
		self.game_history = FourPlayersGame()

	def add_player_to_dict(self, player_pos, player_model):
		"""
		Add a player to the game state dictionary.

		Args:
			player_pos (str): position of the player ('player_left', 'player_right', 'player_top' or 'player_bottom')
			player_model (Player model instance): instance of the model Player associated with the player
		"""
		self.players[player_pos] = self.Player(player_pos, player_model)

	def remove_player_from_dict(self, player_pos):
		"""
		Remove a player from the game state dictionary.

		Args:
			player_pos (str): position of the player ('player_left', 'player_right', 'player_top' or 'player_bottom')
		"""
		del self.players[player_pos]

	async def get_winner_pos(self):
		"""
		Get the position of the winner of the game.
		If there is not enough player, a special handling is needed.

		Returns:
			str: position of the winner ('player_left', 'player_right', 'player_top' or 'player_bottom')
				or 'Not enought players' if the room is not full or 'None' if there is no winner yet
		"""
		if len(self.players) < 4:
				return "Not enough players"
		if self.is_running == False:
			if self.players['player_left'].score >= self.winning_score:
				return "player_left"
			elif self.players['player_right'].score >= self.winning_score:
				return "player_right"
			elif self.players['player_top'].score >= self.winning_score:
				return "player_top"
			elif self.players['player_bottom'].score >= self.winning_score:
				return "player_bottom"
			else:
				return None

	async def set_player_movement(self, player_pos, is_moving, direction_v, direction_h):
		"""
		Set the movement of a player based on the input received from the client.

		Args:
			player_pos (str): position of the player ('player_left', 'player_right', 'player_top' or 'player_bottom')
			is_moving (bool): indicates if the player is moving
			direction_v (bool): vertical direction of the player's movement (True for up, False for down)
			direction_h (bool): horizontal direction of the player's movement (True for left, False for right)
		"""
		self.players[player_pos].is_moving = is_moving
		if player_pos == "player_left" or player_pos == "player_right":
			self.players[player_pos].vertical = direction_v
		elif player_pos == "player_top" or player_pos == "player_bottom":
			self.players[player_pos].horizontal = direction_h

	async def handle_scores(self):
		"""
		Handle scoring and check for a winner.

		If the ball goes out of bounds on either side, check if the ball belongs to a player.
		If the ball belongs to a player, increment the player's score by 1
		Reset the ball in all cases.
		"""
		if (self.ball.x - (self.ball.radius / 2) <= 0 or self.ball.x + (self.ball.radius / 2) >= GAME_AREA_WIDTH or
			self.ball.y - (self.ball.radius / 2) <= 0 or self.ball.y + (self.ball.radius / 2) >= GAME_AREA_HEIGHT):
				if self.ball.color == "blue":
					await self.players['player_left'].score_point()
				elif self.ball.color == "orange":
					await self.players['player_right'].score_point()
				elif self.ball.color == "violet":
					await self.players['player_top'].score_point()
				elif self.ball.color == "red":
					await self.players['player_bottom'].score_point()
				await self.ball.reset()

		for player in self.players.values():
			if player.score >= self.winning_score:
				self.is_running = False

	async def update(self):
		"""
		Update the game state by moving the players and the ball.
		"""
		for player_pos, player in self.players.items():
			await player.move(player_pos)
		await self.ball.move(self.players["player_left"], self.players["player_right"],
								self.players["player_top"], self.players["player_bottom"])
		await self.handle_scores()

	async def record_game_result(self, winner_pos, losers_pos):
		"""
		Record the result of the game in the database.
		The checks are necessary to avoid recording a game result of a player who was removed from the game.
		If we weren't able to get the winner, it means that a deconnection occured and we don't record the game.

		Args:
			winner_pos (str): position of the winner ('player_left', 'player_right', 'player_top' or 'player_bottom')
			loser_pos (List): List with the position of the losers ('player_left', 'player_right',
				'player_top' or 'player_bottom')
		"""
		if winner_pos is not None:
			winner = self.players[winner_pos].player_model
			await sync_to_async(winner.record_win)('4p', self.players[winner_pos].score)
			winner.status = "ONLINE"
			await sync_to_async(winner.save)()
			for loser_pos in losers_pos:
				loser = self.players[loser_pos].player_model
				await sync_to_async(loser.record_loss)('4p', self.players[loser_pos].score)
				loser.status = "ONLINE"
				await sync_to_async(loser.save)()
		if winner_pos is not None and loser_pos is not None:
			winner = self.players[winner_pos].player_model
			if winner != "Not enough players":
				await sync_to_async(self.game_history.result)(winner, self.players["player_left"],
															self.players["player_right"],
															self.players["player_top"],
															self.players["player_bottom"])

	class Player:
		"""
		Represents a player in the game.

		Attributes:
			x (int): x-coordinate of the player's position
			y (int): y-coordinate of the player's position
			score (int): player's score
			is_moving (bool): indicates if the player is currently moving
			vertical (bool): vertical direction of the player's movement (True for up, False for down)
			horizontal (bool): horizontal direction of the player's movement (True for left, False for right)
			player_model (Player model instance): instance of the model Player associated with the player

		Methods:
			check_bounds_x(velocity_x): Check if the player is within the left/right bounds of the game area.
			check_bounds_y(velocity_y): Check if the player is within the up/bottom bounds of the game area.
			move(): Move the player based on the current direction.
			score_point(): Increment the player's score by 1.
		"""
		def __init__(self, position, player_model):
			if position == 'player_left':
				self.x = PADDLE_WIDTH
				self.y = MIDDLE_PLAYER_Y_POS
			elif position == 'player_right':
				self.x = GAME_AREA_WIDTH - PADDLE_WIDTH - 10
				self.y = MIDDLE_PLAYER_Y_POS
			elif position == 'player_top':
				self.x = MIDDLE_PLAYER_X_POS
				self.y = PADDLE_WIDTH
			elif position == 'player_bottom':
				self.x = MIDDLE_PLAYER_X_POS
				self.y = GAME_AREA_HEIGHT - PADDLE_WIDTH - 10
			self.score = 0
			self.is_moving = False
			self.vertical = False
			self.horizontal = False
			self.player_model = player_model

		def check_bounds_x(self, x_position):
			"""
			Check if the player is within the left/right bounds of the game area.

			Args:
				x_position (int): sum of the x-coordinate and the velocity i.e. the possible new x-coordinate

			Returns:
				True if the player is out of bounds, False otherwise
			"""
			return x_position < 0 or x_position > GAME_AREA_WIDTH - PADDLE_HEIGHT

		def check_bounds_y(self, y_position):
			"""
			Check if the player is within the up/bottom bounds of the game area.

			Args:
				y_position (int): sum of the y-coordinate and the velocity i.e. the possible new y-coordinate

			Returns:
				True if the player is out of bounds, False otherwise
			"""
			return y_position < 0 or y_position > GAME_AREA_HEIGHT - PADDLE_HEIGHT

		async def move(self, player_pos):
			"""
			Move the player based on the current direction.

			If the player is moving up, decrease the y-coordinate by the player speed.
			If the player is moving down, increase the y-coordinate by the player speed.
			If the player is moving left, the x-coordinate is decreased by the player speed.
			If the player is moving right, the x-coordinate is increased by the player speed.

			Checks if the player is within the bounds of the game area before doing the move.
			"""
			if self.is_moving:
				if player_pos == 'player_left' or player_pos == 'player_right':
					if self.vertical:
						velocity_y = -PLAYER_SPEED
					elif not self.vertical:
						velocity_y = PLAYER_SPEED
					if self.check_bounds_y(velocity_y + self.y) == 0:
						self.y += velocity_y
				if player_pos == 'player_top' or player_pos == 'player_bottom':
					if self.horizontal:
						velocity_x = -PLAYER_SPEED
					elif not self.horizontal:
						velocity_x = PLAYER_SPEED
					if self.check_bounds_x(velocity_x + self.x) == 0:
						self.x += velocity_x

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
			For the random position:
				- we generate a random number between 0 and 1 that is rounded to 0 or 1.
				- if the number is 0, the ball is placed in the upper part of the game area.
				- if the number is 0, the ball is placed in a range of 100px out of the center.
				- if the number is 1, the ball is placed in the right part of the game area.
				- if the number is 1, the ball is placed in a range of 100px out of the center.

			For the random direction (angle in radian):
				- we generate a random number between 0 and 1, multiply it by pi * 2 to get a random angle.
			"""
			random_num = round(random.random())
			if random_num == 0:
				self.x = 250 + random.random() * (GAME_AREA_WIDTH - 500)
				self.y = GAME_AREA_HEIGHT / 2
			else:
				self.x = GAME_AREA_WIDTH / 2
				self.y = 250 + random.random() * (GAME_AREA_HEIGHT - 500)
			self.radius = 10
			self.speed = GAME_AREA_WIDTH / 250
			self.color = "white"
			self.speed_multiplier_x = 1.1
			self.speed_multiplier_y = 1.05
			random_angle = random.random() * math.pi * 2
			self.x_vel = math.cos(random_angle) * self.speed
			self.y_vel = math.sin(random_angle) * self.speed

		def handle_collision(self, player_left, player_right, player_top, player_bottom):
			"""
			Checks for the collision with the left paddle if the ball is moving left.
			Checks for the collision with the right paddle if the ball is moving right.
			Checks for the collision with the top paddle if the ball is moving up.
			Checks for the collision with the bottom paddle if the ball is moving down.

			The ball will get a different y-velocity based on the position of the ball on the paddle.

			Args:
				player_left (Player): Player object from the GameState object.
				player_right (Player): Player object from the GameState object.
				player_top (Player): Player object from the GameState object.
				player_bottom (Player): Player object from the GameState object.
			"""
			if self.x_vel < 0:
				if (self.y <= player_left.y + PADDLE_HEIGHT and
					self.y >= player_left.y and self.x > player_left.x and
					self.x - self.radius <= player_left.x + PADDLE_WIDTH):
						if (abs(self.x_vel) >= 20):
							self.x_vel *= -1
						else :
							self.x_vel *= -1 * self.speed_multiplier_x
						# middle_y = player_left.y + PADDLE_HEIGHT / 2
						# difference_in_y = middle_y - self.y
						# reduction_factor = PADDLE_HEIGHT / 2
						# new_y_vel = difference_in_y / reduction_factor * self.speed
						# self.y_vel = -1 * new_y_vel
						self.y_vel *= -1 * self.speed_multiplier_y
						self.color = "blue"
			else:
				if (self.y <= player_right.y + PADDLE_HEIGHT and
					self.y >= player_right.y and self.x < player_right.x and
					self.x + self.radius >= player_right.x):
						if (abs(self.x_vel) >= 20):
							self.x_vel *= -1
						else:
							self.x_vel *= -1 * self.speed_multiplier_x
						# middle_y = player_right.y + PADDLE_HEIGHT / 2
						# difference_in_y = middle_y - self.y
						# reduction_factor = PADDLE_HEIGHT / 2
						# new_y_vel = difference_in_y / reduction_factor * self.speed
						# self.y_vel = -1 * new_y_vel
						self.y_vel *= -1 * self.speed_multiplier_y
						self.color = "orange"

			if self.y_vel < 0:
				if (self.x <= player_top.x + PADDLE_HEIGHT and
					self.x >= player_top.x and self.y > player_top.y and
					self.y - self.radius <= player_top.y + PADDLE_WIDTH):
						if (abs(self.y_vel) >= 20):
							self.y_vel *= -1
						else:
							self.y_vel *= -1 * self.speed_multiplier_y
						# middle_x = player_top.x + PADDLE_HEIGHT / 2
						# difference_in_x = middle_x - self.x
						# reduction_factor = PADDLE_HEIGHT / 2
						# new_x_vel = difference_in_x / reduction_factor * self.speed
						# self.x_vel = -1 * new_x_vel
						self.x_vel *= -1 * self.speed_multiplier_x
						self.color = "violet"
			else:
				if (self.x <= player_bottom.x + PADDLE_HEIGHT and
					self.x >= player_bottom.x and self.y < player_bottom.y and
					self.y + self.radius >= player_bottom.y):
						if (abs(self.y_vel) >= 20):
							self.y_vel *= -1
						else:
							self.y_vel *= -1 * self.speed_multiplier_y
						# middle_x = player_bottom.x + PADDLE_HEIGHT / 2
						# difference_in_x = middle_x - self.x
						# reduction_factor = PADDLE_HEIGHT / 2
						# new_x_vel = difference_in_x / reduction_factor * self.speed
						# self.x_vel = -1 * new_x_vel
						self.x_vel *= -1 * self.speed_multiplier_x
						self.color = "red"

		async def move(self, player_left, player_right, player_top, player_bottom):
			"""
			Move the ball based on its velocity.

			Update the x and y coordinates of the ball by adding the velocity components.

			Args:
				players (list): List of Player objects from the GameState object.
			"""
			self.handle_collision(player_left, player_right, player_top, player_bottom)
			self.x += self.x_vel
			self.y += self.y_vel

		async def reset(self):
			"""
			Reset the ball to a random position, velocity and its initial color.
			See the constructor for more details on the random.
			"""
			random_num = round(random.random())
			if random_num == 0:
				self.x = 250 + random.random() * (GAME_AREA_WIDTH - 500)
				self.y = GAME_AREA_HEIGHT / 2
			else:
				self.x = GAME_AREA_WIDTH / 2
				self.y = 250 + random.random() * (GAME_AREA_HEIGHT - 500)
			random_angle = random.random() * math.pi * 2
			self.x_vel = math.cos(random_angle) * self.speed
			self.y_vel = math.sin(random_angle) * self.speed
			self.color = "white"