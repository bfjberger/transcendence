from django.db import models
from players_manager.models import Player

# Create your models here.

class TournamentRoom(models.Model):
	name = models.CharField(max_length=100)
	players = models.ManyToManyField(Player, related_name='tournaments')
	owner = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='owned_tournaments', null=True, blank=True)
	
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
