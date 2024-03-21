from django.test import TestCase
from django.urls import reverse_lazy
from rest_framework.test import APIClient

from players_manager.models import Player


class TestPlayers(TestCase):

	url = '/api/players/'
	url_detail = '/api/players/1/'

	player = Player.objects.get(id=1)

	def setUp(self):
			# Create a Player instance for use in this test case.
			self.player = Player.objects.create(
					login="testplayer",
					password="testpassword",
					nickname="Test Nickname",
					# Set additional fields as necessary
			)
	def test_list_players(self):
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, 200)

	def test_detail_players(self):
		response = self.client.get(self.url_detail)
		self.assertEqual(response.status_code, 200)
