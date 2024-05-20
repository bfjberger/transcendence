import random, math, time

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

	def add_player(self, player_model):
		self.player = self.GameState_player(player_model)
		self.bot = self.GameState_bot()

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
			self.bot.flag = True
			self.bot.future_ball_y = GAME_AREA_HEIGHT / 2
		elif self.ball.x + (self.ball.radius / 2) >= GAME_AREA_WIDTH:
			await self.player.score_point()
			await self.ball.reset()
			self.bot.flag = True
			self.bot.future_ball_y = GAME_AREA_HEIGHT / 2

		if self.player.score >= self.winning_score or self.bot.score >= self.winning_score:
			self.is_running = False
			self.player.player_model.status = "ONLINE"
			await sync_to_async(self.player.player_model.save)()

	async def update(self):
		await self.player.move()
		await self.ball.move(self.player, self.bot)
		await self.bot.move(self.ball, self.player)
		await self.handle_scores()

	class GameState_player:
		def __init__(self, player_model):
			self.x = PADDLE_WIDTH
			self.y = PLAYER_START_POS_Y
			self.score = 0
			self.is_moving = False
			self.vertical = False
			self.hits = 0
			self.player_model = player_model

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

	class GameState_bot:
		def __init__(self):
			self.x = GAME_AREA_WIDTH - PADDLE_WIDTH - 10
			self.y = PLAYER_START_POS_Y
			self.score = 0
			self.is_moving = False
			self.vertical = False
			self.hits = 0
			self.future_ball_y = GAME_AREA_HEIGHT / 2
			self.flag = True
			self.timer_ai = time.time()

		def check_bounds(self, y_position):
			return y_position < 0 or y_position > GAME_AREA_HEIGHT - PADDLE_HEIGHT

		# Predictive model to define the bally when it reaches the bot paddle x
		def future_ball_y_calcul(self, ball, player):
			if time.time() - self.timer_ai >= 1:
				self.future_ball_y = ball.y + ball.y_vel * (610/ball.x_vel) #610 = 650 - (10 + 10)*2, 650 wind lenght, 10 paddle length, 10 space between paddle and win, two times because two paddles
				self.flag = False
				self.timer_ai = time.time()

		async def move(self, ball, player):
			# Predictive movement when the ball start on ai side
			x_vel = ball.x_vel
			if x_vel > 0 and self.flag == True:
				self.future_ball_y = ball.y + ball.y_vel * (305/ball.x_vel) #295 = 650/2 - 10 - 10, screen width/2 - space between paddle and window limit - paddle width
				self.flag = False
			# management of future_ball_y, while the is touching the selling or the floor
			while self.future_ball_y < 0 or self.future_ball_y > GAME_AREA_HEIGHT:
				if self.future_ball_y < 0:
					self.future_ball_y *= -1
				elif self.future_ball_y > GAME_AREA_HEIGHT:
					self.future_ball_y = GAME_AREA_HEIGHT - self.future_ball_y + GAME_AREA_HEIGHT


			if self.future_ball_y < self.y :
				self.move_paddle(up=True)
			elif self.future_ball_y > (self.y + 70): # the origin of paddle is top left, though +70 pixels
				self.move_paddle(up=False)

		# check if the paddle is in the window and calls its derive
		def move_paddle(self, up=True):
			if up and self.y - PLAYER_SPEED < 0:
				return False
			if not up and self.y + PLAYER_SPEED > GAME_AREA_HEIGHT:
				return False
			self.move_prime(up)
		# move paddle derive
		def move_prime(self, up=True):
			if up:
				self.y -= PLAYER_SPEED
			else:
				self.y += PLAYER_SPEED

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

		def handle_collision(self, player_left, bot):
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
					self.x - self.radius <= player_left.x + PADDLE_WIDTH ):
						if (self.x_vel <= -20):
							self.x_vel *= -1
							middle_y = player_left.y + PADDLE_HEIGHT / 2
							difference_in_y = middle_y - self.y
							reduction_factor = PADDLE_HEIGHT / 2
							new_y_vel = difference_in_y / reduction_factor * self.speed
							self.y_vel = -1 * new_y_vel
						else:
							self.x_vel *= -1 * self.speed_multiplier_x
							middle_y = player_left.y + PADDLE_HEIGHT / 2
							difference_in_y = middle_y - self.y
							reduction_factor = PADDLE_HEIGHT / 2
							new_y_vel = difference_in_y / reduction_factor * self.speed
							self.y_vel = -1 * new_y_vel
						player_left.hits += 1
						bot.future_ball_y_calcul(self, player_left)
			else:
				if (self.y <= bot.y + PADDLE_HEIGHT and
					self.y >= bot.y and self.x < bot.x and
					self.x + self.radius >= bot.x):
						if (self.x_vel >= 20):
							self.x_vel *= -1
							middle_y = bot.y + PADDLE_HEIGHT / 2
							difference_in_y = middle_y - self.y
							reduction_factor = PADDLE_HEIGHT / 2
							new_y_vel = difference_in_y / reduction_factor * self.speed
							self.y_vel = -1 * new_y_vel
						else:
							self.x_vel *= -1 * self.speed_multiplier_x
							middle_y = bot.y + PADDLE_HEIGHT / 2
							difference_in_y = middle_y - self.y
							reduction_factor = PADDLE_HEIGHT / 2
							new_y_vel = difference_in_y / reduction_factor * self.speed
							self.y_vel = -1 * new_y_vel
						bot.hits += 1

		async def move(self, player_left, bot):
			self.handle_collision(player_left, bot)
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