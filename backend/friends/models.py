from django.db import models

from users.models import MyUser


class Friend(models.Model):
		user_initiated = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='user_initiated')
		user_received = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='user_received')
		accept = models.BooleanField(default=False)