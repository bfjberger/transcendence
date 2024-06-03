from django.db import models
from django.utils import timezone

from users.models import MyUser

from tournament.models import TournamentStat

class Game(models.Model):
	players = models.ManyToManyField(MyUser, related_name='players')
	scores = models.JSONField(null=True, blank=True)
	winner = models.ForeignKey(MyUser, on_delete=models.SET_NULL, null=True, related_name='winner')
	tournament_id = models.ForeignKey(TournamentStat, on_delete=models.SET_NULL, null=True, blank=True, related_name='tournament_id')
	tournament_name = models.CharField(max_length=100, null=True, blank=True)
	tournament_level = models.CharField(max_length=100, null=True, blank=True)
	date = models.DateTimeField(default=timezone.now)

	def __str__(self):
		return " vs ".join([str(player.username) for player in self.players.all()])

	def add_player(self, player):
		self.date = timezone.now()
		self.save()
		self.players.add(player)

	def result(self, scores, winner):
		self.scores = scores
		self.winner = winner
		self.date = timezone.now()
		self.save()
