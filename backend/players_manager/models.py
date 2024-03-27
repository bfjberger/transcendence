from django.db import models
from django.contrib.auth.models import AbstractUser


# creating a models Player, which inherite dj User class (AbstractUser)

class Player(AbstractUser):
	first_name = None
	last_name = None
	groups = None
	is_staff = None
	is_active = None
	user_permissions = None
	class status(models.TextChoices):
		ONLINE = "ONLINE"
		OFFLINE = "OFFLINE"
		PLAYING = "PLAYING"
	username = models.CharField(max_length=200, default='x')
	nickname = models.CharField(max_length=200)
	nb_games_2p = models.IntegerField(default=0)
	nb_games_2p_won = models.IntegerField(default=0)
	nb_games_2p_lost = models.IntegerField(default=0)
	nb_games_4p = models.IntegerField(default=0)
	nb_games_4p_won = models.IntegerField(default=0)
	nb_games_4p_lost = models.IntegerField(default=0)
	score = models.IntegerField(default=0)
	status = models.CharField(max_length=200, choices=status.choices, default=status.OFFLINE)
	avatar = models.ImageField(max_length=200, null=True, blank=True, upload_to='avatars/')
	



# class Player (models.Model):
	# class status(models.TextChoices):
	# 	ONLINE = "ONLINE"
	# 	OFFLINE = "OFFLINE"
	# 	PLAYING = "PLAYING"
	# login = models.CharField(max_length=200)
	# password = models.CharField(max_length=200)
	# nickname = models.CharField(max_length=200)
	# nb_games_2p = models.IntegerField(default=0)
	# nb_games_2p_won = models.IntegerField(default=0)
	# nb_games_2p_lost = models.IntegerField(default=0)
	# nb_games_4p = models.IntegerField(default=0)
	# nb_games_4p_won = models.IntegerField(default=0)
	# nb_games_4p_lost = models.IntegerField(default=0)
	# score = models.IntegerField(default=0)
	# status = models.CharField(max_length=200, choices=status.choices, default=status.OFFLINE)
	# avatar = models.ImageField(max_length=200, null=True, blank=True, upload_to='avatars/')
	# # def set_password(self, password):
	# # 	self.password = password