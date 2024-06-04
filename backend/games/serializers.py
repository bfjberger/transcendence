from rest_framework import serializers

from .models import Game


class GameSerializer(serializers.ModelSerializer):
	players = serializers.SerializerMethodField()
	scores = serializers.JSONField()
	winner = serializers.SerializerMethodField()

	class Meta:
		model = Game
		fields = ["players", "scores", "winner", "tournament_id", "tournament_name", "tournament_level", "date"]

	def get_players(self, obj):
		return [player.username for player in obj.players.all()]

	def get_winner(self, obj):
		return obj.winner.username
