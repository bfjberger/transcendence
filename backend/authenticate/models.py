from django.db import models

# Create your models here.
class snippet (models.Model):
	owner = models.ForeignKey('auth.User', related_name='snippet', on_delete=models.CASCADE)