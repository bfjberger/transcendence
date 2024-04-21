from django.db import models

from django.db import models
from django.contrib.auth.models import User

from django.utils import timezone

class TwoPlayersGame (models.Model):	
	player1 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='Two_player_1')
	player2 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='Two_player_2')
	score_player1 = models.IntegerField(default=0)
	score_player2 = models.IntegerField(default=0)
	score_max = models.IntegerField(default=5)
	win_player = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='win_player')
	# id_tournament = models.ForeignKey(Tournament, on_delete=models.SET_NULL, null=True, blank = True, related_name='id_tournament')
	level = models.IntegerField(default=0)
	date =  models.DateTimeField(default=timezone.now)