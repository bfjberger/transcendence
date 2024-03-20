from django.db import models

# Create your models here.
class Player (models.Model):
	login = models.CharField(max_length=200)
	password = models.CharField(max_length=200)
	nickname = models.CharField(max_length=200)
	nb_games_2p = models.IntegerField(default=0)
	nb_games_2p_won = models.IntegerField(default=0)
	nb_games_2p_lost = models.IntegerField(default=0)
	nb_games_4p = models.IntegerField(default=0)
	nb_games_4p_won = models.IntegerField(default=0)
	nb_games_4p_lost = models.IntegerField(default=0)
	score = models.IntegerField(default=0)
	avatar = models.ImageField(max_length=200, null=True, blank=True, upload_to='avatars/')