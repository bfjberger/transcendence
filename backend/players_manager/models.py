from django.db import models
from django.utils import timezone

# Create your models here.

class Player(models.Model):
	class status(models.TextChoices):
		ONLINE = "ONLINE"
		OFFLINE = "OFFLINE"
		PLAYING = "PLAYING"
	owner = models.OneToOneField('auth.User', related_name='Player', on_delete=models.CASCADE)
	nickname = models.CharField(max_length=20)
	status = models.CharField(max_length=200, choices=status.choices, default=status.OFFLINE)
	last_activity = models.DateTimeField(auto_now_add=True)
	avatar = models.ImageField(max_length=200, default="staticfiles/avatars/avatar.png", upload_to='staticfiles/avatars/')

	def set_offline_if_inactive(self, threshold):
		if self.status == 'ONLINE' and (timezone.now() - self.last_activity).total_seconds() > threshold:
			self.status = 'OFFLINE'
			self.save()

	def __str__(self):
		return self.owner.username

	def check_inactive_players():
		threshold = 60 * 5  # 5 minutes
		for player in Player.objects.filter(status='ONLINE'):
			player.set_offline_if_inactive(threshold)
