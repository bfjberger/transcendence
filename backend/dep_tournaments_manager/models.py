from django.db import models

from players_manager.models import Player

class Tournament(models.Model):
	class nbr_players(models.IntegerChoices):
		FOUR = 4
		EIGHT = 8
	title = models.CharField(max_length=200, default='Tournament')
	player_1 = models.ForeignKey(Player, on_delete=models.SET_NULL, null = True, related_name='tournament_player_1')
	player_2 = models.ForeignKey(Player, on_delete=models.SET_NULL, null = True, related_name='tournament_player_2')
	player_3 = models.ForeignKey(Player, on_delete=models.SET_NULL, null = True, related_name='tournament_player_3')
	player_4 = models.ForeignKey(Player, on_delete=models.SET_NULL, null = True, related_name='tournament_player_4')
	player_5 = models.ForeignKey(Player, on_delete=models.SET_NULL, null = True, blank=True, related_name='tournament_player_5')
	player_6 = models.ForeignKey(Player, on_delete=models.SET_NULL, null = True, blank=True, related_name='tournament_player_6')
	player_7 = models.ForeignKey(Player, on_delete=models.SET_NULL, null = True, blank=True, related_name='tournament_player_7')
	player_8 = models.ForeignKey(Player, on_delete=models.SET_NULL, null = True, blank=True, related_name='tournament_player_8')
	nbr_players = models.IntegerField(choices=nbr_players.choices, default=nbr_players.FOUR)
