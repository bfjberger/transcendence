from django.db import models
from players_manager.models import Player

# Create your models here.

class TournamentRoom(models.Model):
	name = models.CharField(max_length=100)
	players = models.ManyToManyField(Player, related_name='tournaments')
	started = models.BooleanField(default=False)
	
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


class TournamentStat(models.Model):
	tournament_name = models.CharField(max_length=200)
	winner = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='won_tournaments')
	losers = models.ManyToManyField(Player, related_name='lost_tournaments')

	def __str__(self):
		return f"Stats for {self.tournament_name} (ID: {self.id})"