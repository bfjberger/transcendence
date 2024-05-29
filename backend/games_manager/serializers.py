from django.contrib.auth.models import User

from rest_framework import serializers

from .models import TwoPlayersGame, FourPlayersGame

from .models import Game

class UserSerializerSpe(serializers.ModelSerializer):
	class Meta :
		model = User
		fields = ("username",)


class TwoPlayersGameSerializer(serializers.ModelSerializer):
	players = serializers.SerializerMethodField()
	scores = serializers.JSONField()
	win_player = serializers.SerializerMethodField()

	class Meta:
		model = TwoPlayersGame
		fields = ["players", "scores", "win_player", "id_tournament", "id_name", "level", "date"]

	def get_players(self, obj):
		return [player.owner.username for player in obj.players.all()]

	def get_win_player(self, obj):
		return obj.win_player.owner.username


class FourPlayersGameSerializer(serializers.ModelSerializer):
	user1 = UserSerializerSpe(read_only=True)
	user2 = UserSerializerSpe(read_only=True)
	user3 = UserSerializerSpe(read_only=True)
	user4 = UserSerializerSpe(read_only=True)
	win_player = UserSerializerSpe(read_only=True)
	class Meta:
		model = FourPlayersGame
		fields = ["user1", "user2", "user3", "user4", "score_user1", "score_user2", "score_user3", "score_user4", "score_max", "win_player", "date"]


class GameSerializer(serializers.ModelSerializer):
	players = serializers.SerializerMethodField()
	scores = serializers.JSONField()
	winner = serializers.SerializerMethodField()

	class Meta:
		model = Game
		fields = ["players", "scores", "winner", "tournament_id", "tournament_name", "tournament_level", "date"]

	def get_players(self, obj):
		return [player.owner.username for player in obj.players.all()]

	def get_winner(self, obj):
		return obj.winner.owner.username
