from django.db import models

# Create your models here.

class Player(models.Model):
	class status(models.TextChoices):
		ONLINE = "ONLINE"
		OFFLINE = "OFFLINE"
		PLAYING = "PLAYING"
	owner = models.OneToOneField('auth.User', related_name='Player', on_delete=models.CASCADE)
	nickname = models.CharField(max_length=20, default="Anonymous")
	nb_games_2p = models.IntegerField(default=0)
	nb_games_2p_won = models.IntegerField(default=0)
	nb_games_2p_lost = models.IntegerField(default=0)
	nb_games_4p = models.IntegerField(default=0)
	nb_games_4p_won = models.IntegerField(default=0)
	nb_games_4p_lost = models.IntegerField(default=0)
	score = models.IntegerField(default=0)
	status = models.CharField(max_length=200, choices=status.choices, default=status.OFFLINE)
	avatar = models.ImageField(max_length=200, default="avatar.png", upload_to='avatars/')

	def record_win(self, game_type):
		if game_type == '2p':
			self.nb_games_2p += 1
			self.nb_games_2p_won += 1
		elif game_type == '4p':
			self.nb_games_4p += 1
			self.nb_games_4p_won += 1
		self.score += 1
		self.save()
	
	def record_loss(self, game_type):
		if game_type == '2p':
			self.nb_games_2p += 1
			self.nb_games_2p_lost += 1
		elif game_type == '4p':
			self.nb_games_4p += 1
			self.nb_games_4p_lost += 1
		self.score -= 1
		self.save()

	def print_records(self):
		print("nb_games_2p : ", self.nb_games_2p)
		print("nb_games_2p_won : ", self.nb_games_2p_won)
		print("nb_games_2p_lost : ", self.nb_games_2p_lost)
		print("nb_games_4p : ", self.nb_games_4p)
		print("nb_games_4p_won : ", self.nb_games_4p_won)
		print("nb_games_4p_lost : ", self.nb_games_4p_lost)
		print("score : ", self.score)


class Friend(models.Model):
		player_initiated = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player_initiate')
		player_received = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player_receive')
		accept = models.BooleanField(default=False)