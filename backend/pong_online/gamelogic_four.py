import asyncio

# Variables for the game area and paddles
game_area_width = 650
game_area_height = 650
paddle_width = 10
paddle_height = 70
player_speed = 3
middle_ball_pos = game_area_width / 2
middle_player_y_pos = (game_area_height - paddle_height) / 2
middle_player_x_pos = (game_area_width - paddle_width) / 2

class GameState:
	"""
	Represents the state of the game, including the ball, players, and game logic.

	Attributes:
		ball (Ball): The ball object in the game.
		players (list): A list of Player objects representing the players in the game.
		is_running (bool): Indicates whether the game is currently running.
		winning_score (int): The score required to win the game.

	Methods:
		set_player_movement(player_pos, is_moving, directionV, directionH): Sets the movement of a player based on the direction.
		reset_players_pos(): Resets the position of the players.
		handle_scores(): Handles scoring and checks for a winner.
		update(): Updates the game state by moving the players and the ball.
	"""
	class Ball:
		"""
		Represents a ball in the game.

		Attributes:
			x (float): The x-coordinate of the ball's position.
			y (float): The y-coordinate of the ball's position.
			radius (int): The radius of the ball.
			speed (int): The speed at which the ball moves.
			x_vel (float): The velocity of the ball in the x-direction.
			y_vel (float): The velocity of the ball in the y-direction.
			color (int): The color of the ball.

		Methods:
			__str__(): Returns a string representation of the ball.
			handle_ball_collision(player_one, player_two, player_three, player_four): Handles collisions between the ball and the paddles.
			adjust_y_velocity(player): Adjusts the y-velocity of the ball based on the player's position.
			adjust_x_velocity(player): Adjusts the x-velocity of the ball based on the player's position.
			move(player_one, player_two): Moves the ball based on its velocity and handles collisions.
			reset(): Resets the ball to its initial position and velocity.
		"""

		def __init__(self):
			self.x = game_area_width / 2
			self.y = game_area_height / 2
			self.radius = 10
			self.speed = 10
			self.x_vel = 0
			self.y_vel = 0
			self.color = 0xFFFFFF

		def __str__(self):
			return f"Ball position: ({self.x}, {self.y}), Ball vel: {self.x_vel}x{self.y_vel}, Color: {self.color}"

		def handle_ball_collision(self, player_one, player_two, player_three, player_four):
			"""
			Handles collisions between the ball and the paddles.

			Args:
				player_one (Player): The first player's paddle.
				player_two (Player): The second player's paddle.
				player_three (Player): The third player's paddle.
				player_four (Player): The fourth player's paddle.
			"""
			# Player one collision (left)
			if self.x_vel < 0 and self.y <= player_one.y + paddle_height and self.y >= player_one.y and self.x > player_one.x:
				if self.x - self.radius <= player_one.x + paddle_width / 2:
					self.x_vel *= -1
					self.adjust_y_velocity(player_one)

			# Player two collision (right)
			elif self.x_vel > 0 and self.y <= player_two.y + paddle_height and self.y >= player_two.y and self.x < player_two.x:
				if self.x + self.radius >= player_two.x - paddle_width / 2:
					self.x_vel *= -1
					self.adjust_y_velocity(player_two)

			# Player three collision (top)
			if self.y_vel < 0 and self.x <= player_three.x + paddle_width and self.x >= player_three.x and self.y > player_three.y:
				if self.y - self.radius <= player_three.y + paddle_height / 2:
					self.y_vel *= -1
					self.adjust_x_velocity(player_three)

			# Player four collision (bottom)
			elif self.y_vel > 0 and self.x <= player_four.x + paddle_width and self.x >= player_four.x and self.y < player_four.y:
				if self.y + self.radius >= player_four.y - paddle_height / 2:
					self.y_vel *= -1
					self.adjust_x_velocity(player_four)

		def adjust_y_velocity(self, player):
			middle_y = player.y + paddle_height / 2
			difference_in_y = middle_y - self.y
			reduction_factor = (paddle_height / 2) / self.speed
			new_y_vel = difference_in_y / reduction_factor
			self.y_vel = -1 * new_y_vel

		def adjust_x_velocity(self, player):
			middle_x = player.x + paddle_width / 2
			difference_in_x = middle_x - self.x
			reduction_factor = (paddle_width / 2) / self.speed
			new_x_vel = difference_in_x / reduction_factor
			self.x_vel = -1 * new_x_vel

		async def move(self, player_one, player_two, player_three, player_four):
			"""
			Moves the ball based on its velocity and handles collisions.

			Args:
				player_one (Player): The first player's paddle.
				player_two (Player): The second player's paddle.
			"""
			self.handle_ball_collision(player_one, player_two, player_three, player_four)
			self.x += self.x_vel
			self.y += self.y_vel

		async def reset(self):
			self.color = 0xFFFFFF
			self.x = game_area_width / 2
			self.y = game_area_height / 2
			self.y_vel = 0
			self.x_vel = self.speed

	class Player:
		"""
		Represents a player in the game.

		Attributes:
			x (int): The x-coordinate of the player's position.
			y (int): The y-coordinate of the player's position.
			score (int): The player's score.
			is_moving (bool): Indicates whether the player is currently moving.
			vertical (bool): Indicates whether the player is moving up or down.
			horizontal (bool): Indicates whether the player is moving left or right.

		Methods:
			__str__(): Returns a string representation of the player.
			move(): Moves the player up or down based on the current direction.
			reset(): Resets the player's position.
			score_point(): Increments the player's score.
		"""

		def __init__(self, position):
			if position == 0:
				self.x = game_area_width - 10
				self.y = middle_player_y_pos
			elif position == 1:
				self.x = 0 + 10
				self.y = middle_player_y_pos
			elif position == 2:
				self.x = middle_player_x_pos
				self.y = game_area_height - 10
			elif position == 3:
				self.x = middle_player_x_pos
				self.y = 0 + 10
			self.score = 0
			self.is_moving = False
			self.vertical = False
			self.horizontal = False

		def __str__(self):
			return f"Player position: ({self.x}, {self.y}), Paddle size: {paddle_width}x{paddle_height}, Score: {self.score}"

		async def move(self):
			"""
			Moves the player up or down based on the current direction.

			If the player is moving up, the y-coordinate is decreased by the player speed.
			If the player is moving down, the y-coordinate is increased by the player speed.
			If the player is moving left, the x-coordinate is decreased by the player speed.
			If the player is moving right, the x-coordinate is increased by the player speed.
			"""
			if self.is_moving:
				if self.vertical:
					if ((self.y + paddle_height / 2) + player_speed <= game_area_height):
						self.y -= player_speed
				elif not self.vertical:
					if ((self.y - paddle_height / 2) - player_speed >= game_area_height * -1):
						self.y += player_speed
				if self.horizontal:
					if ((self.x + paddle_width / 2) + player_speed <= game_area_width):
						self.x += player_speed
				elif not self.horizontal:
					if ((self.x - paddle_width / 2) - player_speed >= game_area_width * -1):
						self.x -= player_speed

		async def reset(self):
			self.y = game_area_height / 2

		async def score_point(self):
			self.score += 1

	def __init__(self):
		self.ball = self.Ball()
		self.players = [self.Player(1), self.Player(2), self.Player(3), self.Player(4)]
		self.is_running = False
		self.winning_score = 3

	async def set_player_movement(self, player_pos, is_moving, directionV, directionH):
		if player_pos == 'player_one' :
			self.players[0].is_moving = is_moving
			self.players[0].vertical = directionV
		elif player_pos == 'player_two' :
			self.players[1].is_moving = is_moving
			self.players[1].vertical = directionV
		elif player_pos == 'player_three' :
			self.players[2].is_moving = is_moving
			self.players[2].horizontal = directionH
		elif player_pos == 'player_four' :
			self.players[3].is_moving = is_moving
			self.players[3].horizontal = directionH

	async def reset_players_pos(self):
		self.players[0].y = middle_player_y_pos
		self.players[1].y = middle_player_y_pos
		self.players[2].x = middle_player_x_pos
		self.players[3].x = middle_player_x_pos

	async def handle_scores(self):
		if self.ball.x <= 0 - (self.ball.radius / 2) :
			await self.players[1].score_point()
			await self.ball.reset()
			await self.reset_players_pos()
		elif self.ball.x >= game_area_width + (self.ball.radius / 2) :
			await self.players[0].score_point()
			await self.ball.reset()
			await self.reset_players_pos()
		elif self.ball.y <= 0 - (self.ball.radius / 2) :
			await self.players[2].score_point()
			await self.ball.reset()
			await self.reset_players_pos()
		elif self.ball.y >= game_area_height + (self.ball.radius / 2) :
			await self.players[3].score_point()
			await self.ball.reset()
			await self.reset_players_pos()

		if self.players[0].score >= self.winning_score or self.players[1].score >= self.winning_score or self.players[2].score >= self.winning_score or self.players[3].score >= self.winning_score:
			self.is_running = False

	async def update(self):
		await self.players[0].move()
		await self.players[1].move()
		await self.players[2].move()
		await self.players[3].move()
		await self.ball.move(self.players[0], self.players[1], self.players[2], self.players[3])
		await self.handle_scores()