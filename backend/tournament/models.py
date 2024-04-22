from django.db import models

# Create your models here.

class Tournament(models.Model):
	VISIBILITY_CHOICES = (
		('public', 'Public'),
		('private', 'Private'),
	)
	
	name = models.CharField(max_length=100)
	visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES)
	password = models.CharField(max_length=100, blank=True, null=True)  # Only required for private tournaments
	# Add other fields as needed
	
	def __str__(self):
		return self.name