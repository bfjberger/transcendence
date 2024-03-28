from django.db import models

class Player (models.Model):
	class status(models.TextChoices):
		ONLINE = "ONLINE"
		OFFLINE = "OFFLINE"
		PLAYING = "PLAYING"
	nickname = models.CharField(max_length=200)
	nb_games_2p = models.IntegerField(default=0)
	nb_games_2p_won = models.IntegerField(default=0)
	nb_games_2p_lost = models.IntegerField(default=0)
	nb_games_4p = models.IntegerField(default=0)
	nb_games_4p_won = models.IntegerField(default=0)
	nb_games_4p_lost = models.IntegerField(default=0)
	score = models.IntegerField(default=0)
	status = models.CharField(max_length=200, choices=status.choices, default=status.OFFLINE)
	avatar = models.ImageField(max_length=200, null=True, blank=True, upload_to='avatars/')
	owner = models.ForeignKey('auth.User', related_name='Player', on_delete=models.CASCADE)