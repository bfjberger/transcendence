from django.contrib.auth.models import User

from rest_framework import serializers

from .models import TwoPlayersGame, FourPlayersGame

class UserSerializerSpe(serializers.ModelSerializer):
	class Meta :
		model = User
		fields = ("username",)


class TwoPlayersGameSerializer(serializers.ModelSerializer):
	user1 = UserSerializerSpe(read_only=True)
	user2 = UserSerializerSpe(read_only=True)
	win_player = UserSerializerSpe(read_only=True)
	class Meta:
		model = TwoPlayersGame
		fields = ["user1", "user2", "score_user1", "score_user2", "score_max", "win_player", "id_tournament", "id_name", "level", "date"]


class FourPlayersGameSerializer(serializers.ModelSerializer):
	user1 = UserSerializerSpe(read_only=True)
	user2 = UserSerializerSpe(read_only=True)
	user3 = UserSerializerSpe(read_only=True)
	user4 = UserSerializerSpe(read_only=True)
	win_player = UserSerializerSpe(read_only=True)
	class Meta:
		model = FourPlayersGame
		fields = ["user1", "user2", "user3", "user4", "score_user1", "score_user2", "score_user3", "score_user4", "score_max", "win_player", "date"]
