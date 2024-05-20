from rest_framework import serializers
from .models import TournamentRoom

from rest_framework.validators import UniqueValidator
from django.contrib.auth.models import User
from players_manager.models import Player
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password

class TournamentSerializer(serializers.ModelSerializer):
	players = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
	class Meta:
		model = TournamentRoom
		fields = ['id', 'name', 'players', 'started']

class PlayerInTournamentSerializer(serializers.ModelSerializer):
	
	player = serializers.SerializerMethodField()
	tournaments = serializers.SerializerMethodField()

	class Meta:
		model = User
		fields = ['username', 'player', 'tournaments']

	def get_player(self, obj):
		player = Player.objects.get(owner=obj)
		player_data = {
			'id': player.id,
			'status': player.status,
			'nickname': player.nickname,
		}
		return player_data
	
	def get_tournaments(self, obj):
		player = Player.objects.get(owner=obj)
		tournaments = player.tournaments.all()
		serializer = TournamentSerializer(tournaments, many=True)
		return serializer.data