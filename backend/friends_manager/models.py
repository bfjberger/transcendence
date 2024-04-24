from django.db import models

from django.contrib.auth.models import User

class Friend(models.Model):
		user_initiated = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_initiate')
		user_received = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_receive')
		accept = models.BooleanField(default=False)
