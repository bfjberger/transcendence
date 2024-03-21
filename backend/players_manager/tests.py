from django.test import TestCase
from django.urls import reverse_lazy
from rest_framework.test import APIClient

from players_manager.models import Player


class TestPlayers(TestCase):
	#url = reverse_lazy('players-list')
	url = '/api/players/'

	def test_list_players(self):
		print('Testing list players ', self.url)
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, 200)
