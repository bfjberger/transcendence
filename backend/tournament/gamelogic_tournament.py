import asyncio
import random, math

# Variables for the game area and paddles
GAME_AREA_WIDTH = 650
GAME_AREA_HEIGHT = 480
PADDLE_WIDTH = 10
PADDLE_HEIGHT = 70
PLAYER_SPEED = GAME_AREA_HEIGHT / 100
PLAYER_START_POS_Y = (GAME_AREA_HEIGHT - PADDLE_HEIGHT) / 2
MIN_START_ANGLE = math.pi - (math.pi / 9)
MAX_START_ANGLE = math.pi + (math.pi / 9)

class GameState:

	# ----------------------------- GameState methods ---------------------------- #
	
	def __init__(self):
		self.ball = self.Ball()
		self.players = [self.Player(1), self.Player(2)]
		self.is_running = False
		self.winning_score = 3
		self.someone_won = None
		self.start_time = None
		self.time_elapsed = None

	async def set_player_movement(self, player_pos, is_moving, direction):
		if player_pos == 'player_one' :
			self.players[0].is_moving = is_moving
			self.players[0].up = direction
		elif player_pos == 'player_two' :
			self.players[1].is_moving = is_moving
			self.players[1].up = direction

	async def reset_players_pos(self):
		self.players[0].y = PLAYER_START_POS_Y
		self.players[1].y = PLAYER_START_POS_Y

	async def handle_scores(self):
		if self.ball.x <= 0 - (self.ball.radius / 2) :
			await self.players[1].score_point()
			await self.ball.reset()
		elif self.ball.x >= GAME_AREA_WIDTH + (self.ball.radius / 2) :
			await self.players[0].score_point()
			await self.ball.reset()

		if self.players[0].score >= self.winning_score or self.players[1].score >= self.winning_score :
			self.is_running = False
			self.someone_won = True

	async def update(self):
		await self.players[0].move()
		await self.players[1].move()
		await self.ball.move(self.players[0], self.players[1])
		await self.handle_scores()

	# -------------------------------- CLASS PLAYER -------------------------------- #

	class Player:
		def __init__(self, position):
			if position == 1:
				self.x = 0 + PADDLE_WIDTH
			else:
				self.x = GAME_AREA_WIDTH - PADDLE_WIDTH - 10
			self.y = PLAYER_START_POS_Y
			self.score = 0
			self.is_moving = False
			self.up = False

		def __str__(self):
			return f"Player position: ({self.x}, {self.y}), Paddle size: {PADDLE_WIDTH}x{PADDLE_HEIGHT}, Score: {self.score}"

		def check_bounds(self, y_position):
			return y_position < 0 or y_position > GAME_AREA_HEIGHT - PADDLE_HEIGHT

		async def move(self):
			if self.is_moving:
				if self.up:
					velocity_y = -PLAYER_SPEED
				elif not self.up:
					velocity_y = PLAYER_SPEED
				if self.check_bounds(self.y + velocity_y) == 0:
					self.y += velocity_y

		async def reset(self):
			self.y = GAME_AREA_HEIGHT / 2

		async def score_point(self):
			self.score += 1

	# -------------------------------- CLASS BALL -------------------------------- #

	class Ball:
		def __init__(self):
			self.x = GAME_AREA_WIDTH / 2
			# self.y = GAME_AREA_HEIGHT / 2
			self.y = random.randint(200, GAME_AREA_HEIGHT - 200)
			self.radius = 10
			self.speed = GAME_AREA_WIDTH / 100
			self.color = 0xFFFFFF
			self.speed_multiplier_x = 1.1
			self.speed_multiplier_y = 1.05
			random_angle = random.uniform(MIN_START_ANGLE, MAX_START_ANGLE)
			direction = -1 if random.choice([0, 1]) < 0.5 else 1
			self.x_vel = (math.cos(random_angle) * self.speed) * direction
			self.y_vel = math.sin(random_angle) * self.speed


		def __str__(self):
			return f"Ball position: ({self.x}, {self.y}), Ball vel: {self.x_vel}x{self.y_vel}, Color: {self.color}"

		def handle_ball_collision(self, player_left, player_right):
			if self.y - self.radius <= 0 or self.y + self.radius >= GAME_AREA_HEIGHT:
				self.y_vel *= -1 * self.speed_multiplier_y
				self.x_vel *= self.speed_multiplier_x
			if self.y - self.radius <= 0:
				self.y = self.radius
			if self.y + self.radius >= GAME_AREA_HEIGHT:
				self.y = GAME_AREA_HEIGHT - self.radius

			if self.x_vel < 0:
				if (self.y <= player_left.y + PADDLE_HEIGHT and
					self.y >= player_left.y and self.x > player_left.x and
					self.x - self.radius <= player_left.x + PADDLE_WIDTH):
						if (abs(self.x_vel) <= 20):
							self.x_vel *= self.speed_multiplier_x
						middle_y = player_left.y + PADDLE_HEIGHT / 2
						difference_in_y = middle_y - self.y
						reduction_factor = PADDLE_HEIGHT / 2
						new_y_vel = difference_in_y / reduction_factor * self.speed
						self.y_vel = -1 * new_y_vel
						self.x_vel *= -1
			else:
				if (self.y <= player_right.y + PADDLE_HEIGHT and
					self.y >= player_right.y and self.x < player_right.x and
					self.x + self.radius >= player_right.x):
						if (abs(self.x_vel) <= 20):
							self.x_vel *= self.speed_multiplier_x
						self.x_vel *= -1
						middle_y = player_right.y + PADDLE_HEIGHT / 2
						difference_in_y = middle_y - self.y
						reduction_factor = PADDLE_HEIGHT / 2
						new_y_vel = difference_in_y / reduction_factor * self.speed
						self.y_vel = -1 * new_y_vel

		async def move(self, player_left, player_right):
			self.handle_ball_collision(player_left, player_right)
			self.x += self.x_vel
			self.y += self.y_vel
			# print("ball x: ", self.x, "  |  ball y: ", self.y)

		async def reset(self):
			self.x = GAME_AREA_WIDTH / 2
			self.y = random.randint(200, GAME_AREA_HEIGHT - 200)
			random_angle = random.uniform(MIN_START_ANGLE, MAX_START_ANGLE)
			direction = -1 if random.choice([0, 1]) < 0.5 else 1
			self.x_vel = (math.cos(random_angle) * self.speed) * direction
			self.y_vel = math.sin(random_angle) * self.speed

