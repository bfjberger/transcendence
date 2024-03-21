from django.db import models

from players_manager.models import Player

# Create your models here.

class Friend(models.Model):
		player_1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player_1')
		player_2 = models.ForeignKey(Player, on_delete=models.CASCADE)
		accept = models.BooleanField(default=False)
