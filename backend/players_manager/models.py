from django.db import models

# Create your models here.

class Player(models.Model):
	owner = models.OneToOneField('auth.User', related_name='Player', on_delete=models.CASCADE)