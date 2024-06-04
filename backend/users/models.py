from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class MyUser(AbstractUser):
	nickname = models.CharField(max_length=20)
	last_activity = models.DateTimeField(auto_now_add=True)
	avatar = models.ImageField(max_length=200, default="staticfiles/avatars/avatar.png", upload_to='staticfiles/avatars/')
	class status(models.TextChoices):
		ONLINE = "ONLINE"
		OFFLINE = "OFFLINE"
		PLAYING = "PLAYING"
	status = models.CharField(max_length=200, choices=status.choices, default=status.OFFLINE)

	def __str__(self):
		return self.username + " " + self.nickname

	def set_offline_if_inactive(self, threshold):
		if self.status == 'ONLINE' and (timezone.now() - self.last_activity).total_seconds() > threshold:
			self.status = 'OFFLINE'
			self.save()

	def check_inactive_players():
		threshold = 60 * 5  # 5 minutes
		for user in MyUser.objects.filter(status='ONLINE'):
			user.set_offline_if_inactive(threshold)