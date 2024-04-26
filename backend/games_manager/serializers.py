from django.contrib.auth.models import User

from rest_framework import serializers

from .models import TwoPlayersGame

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
		fields = ["user1", "user2", "score_user1", "score_user2", "score_max", "win_player", "id_tournament", "level", "date"]
