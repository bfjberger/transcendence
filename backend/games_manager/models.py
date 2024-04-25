from django.db import models

from django.db import models
from django.contrib.auth.models import User

from tournament.models import Tournament

from django.utils import timezone

class TwoPlayersGame(models.Model):
	user1 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='user1')
	user2 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='user2')
	score_user1 = models.IntegerField(default=0)
	score_user2 = models.IntegerField(default=0)
	score_max = models.IntegerField(default=5)
	win_player = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='win_player')
	id_tournament = models.ForeignKey(Tournament, on_delete=models.SET_NULL, null=True, blank = True, related_name='id_tournament')
	level = models.IntegerField(default=0)
	date =  models.DateTimeField(default=timezone.now)

	def __str__(self):
		return f"{self.user1} vs {self.user2}"

	def record(self, player_1, player_2, winner, score_1, score_2):
		self.user1 = player_1.owner
		self.user2 = player_2.owner
		self.score_user1 = score_1
		self.score_user2 = score_2
		if (winner == player_1):
			self.win_player = player_1.owner
		else:
			self.win_player = player_2.owner
		self.date = timezone.now()
		self.save()