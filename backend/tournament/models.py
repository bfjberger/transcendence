from django.db import models
from players_manager.models import Player
from django.utils import timezone

# Create your models here.

class TournamentRoom(models.Model):
	name = models.CharField(max_length=100)
	players = models.ManyToManyField(Player, related_name='tournaments')
	started = models.BooleanField(default=False)
	time_created = models.DateTimeField(default=timezone.now)

	def __str__(self):
		return self.name

	def add_player(self, player):
		self.players.add(player)

	def remove_player(self, player):
		self.players.remove(player)

	def is_player_in_tournament(self, player):
		return self.players.filter(id=player.id).exists()

	def get_players(self):
		return self.players.all()

	# print players in the instance of the tournament
	def print_players(self):
		for player in self.players.all():
			print(player)

	def delete_if_empty(self, timer=600):
		if self.players.count() == 0 and (timezone.now() - self.time_created).seconds > timer:
			self.delete()

	def delete_if_timer(self, timer=1200):
		if (timezone.now() - self.time_created).seconds > timer:
			self.delete()


class TournamentStat(models.Model):
	tournament_name = models.CharField(max_length=200, null=True, blank=True)
	winner = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='won_tournaments', null=True, blank=True)
	losers = models.ManyToManyField(Player, related_name='lost_tournaments')
	# TwoPlayersGame = models.ForeignKey('games_manager.TwoPlayersGame', on_delete=models.SET_NULL, null=True, blank=True)

	def __str__(self):
		return f"{self.tournament_name} (ID: {self.id})"