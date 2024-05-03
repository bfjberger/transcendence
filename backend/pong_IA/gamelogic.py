import random, math

from asgiref.sync import sync_to_async


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

	def __init__(self, name):
		self.room_name = name
		self.ball = self.Ball()
		self.player = None
		self.bot = None
		self.is_running = False
		self.winning_score = 2

	def add_player(self):
		self.player = self.GameState_player("player_left")
		self.bot = self.GameState_player("player_right")

	def remove_player_from_dict(self):
		del self.player

	async def get_winner_pos(self):
		if self.is_running == False:
			if self.player.score >= self.winning_score:
				return "player_left"
			else:
				return "player_right"

	async def set_player_movement(self, player_pos, is_moving, direction_v):
		if player_pos == "player_left" :
			self.player.is_moving = is_moving
			self.player.vertical = direction_v
		else:
			self.bot.is_moving = is_moving
			self.bot.vertical = direction_v

	async def handle_scores(self):
		if self.ball.x - (self.ball.radius / 2) <= 0:
			await self.bot.score_point()
			await self.ball.reset()
		elif self.ball.x + (self.ball.radius / 2) >= GAME_AREA_WIDTH:
			await self.player.score_point()
			await self.ball.reset()

		if self.player.score >= self.winning_score or self.bot.score >= self.winning_score:
				self.is_running = False

	async def update(self):
		await self.player.move()
		await self.bot.move()	
		await self.ball.move(self.player, self.bot)
		await self.handle_scores()

	class GameState_player:
		def __init__(self, position):
			if position == 'player_left':
				self.x = PADDLE_WIDTH
			else:
				self.x = GAME_AREA_WIDTH - PADDLE_WIDTH - 10

			self.y = PLAYER_START_POS_Y
			self.score = 0
			self.is_moving = False
			self.vertical = False

		def check_bounds(self, y_position):
			return y_position < 0 or y_position > GAME_AREA_HEIGHT - PADDLE_HEIGHT

		async def move(self):
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
		def __init__(self):
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
						self.x_vel *= -1 * self.speed_multiplier_x
						middle_y = player_left.y + PADDLE_HEIGHT / 2
						difference_in_y = middle_y - self.y
						reduction_factor = PADDLE_HEIGHT / 2
						new_y_vel = difference_in_y / reduction_factor
						self.y_vel = -1 * new_y_vel
			elif self.x_vel > 0:
				if (self.y <= player_right.y + PADDLE_HEIGHT and
					self.y >= player_right.y and self.x < player_right.x and
					self.x + self.radius >= player_right.x):
						self.x_vel *= -1 * self.speed_multiplier_x
						middle_y = player_right.y + PADDLE_HEIGHT / 2
						difference_in_y = middle_y - self.y
						reduction_factor = PADDLE_HEIGHT / 2
						new_y_vel = difference_in_y / reduction_factor
						self.y_vel = -1 * new_y_vel

		async def move(self, player_left, player_right):
			self.handle_collision(player_left, player_right)
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