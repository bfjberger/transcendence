from django.db import models

from django.contrib.auth.models import User

class Friend(models.Model):
		user_initiated = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_initiated')
		user_received = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_received')
		accept = models.BooleanField(default=False)