from django.db import models

# Create your models here.
from players_manager.models import Player

class Four_Player (models.Model):	
	player1 = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, related_name='Four_player_1')
	player2 = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, related_name='Four_player_2')
	player3 = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, related_name='Four_player_3')
	player4 = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, related_name='Four_player_4')
	score_player1 = models.IntegerField(default=0)
	score_player2 = models.IntegerField(default=0)
	score_player3 = models.IntegerField(default=0)
	score_player4 = models.IntegerField(default=0)
	score_max = models.IntegerField(default=5)
	win_player = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, related_name='win_player_four')
	
