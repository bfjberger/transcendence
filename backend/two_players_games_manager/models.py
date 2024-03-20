from django.db import models


class Two_Players (models.Model):	
	player1 = models.CharField(max_length=200)
	player2 = models.CharField(max_length=200)
	score_player1 = models.IntegerField(default=0)
	score_player2 = models.IntegerField(default=0)
	score_max = models.IntegerField(default=5)
	win_player = models.CharField(max_length=200)
	id_tournament = models.IntegerField(default=0)
	level = models.IntegerField(default=0)
