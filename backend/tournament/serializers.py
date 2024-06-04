from rest_framework import serializers

from .models import TournamentRoom

from users.models import MyUser


class TournamentSerializer(serializers.ModelSerializer):
	players = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

	class Meta:
		model = TournamentRoom
		fields = ['id', 'name', 'players', 'started']

class PlayerInTournamentSerializer(serializers.ModelSerializer):
	player = serializers.SerializerMethodField()
	tournaments = serializers.SerializerMethodField()

	class Meta:
		model = MyUser
		fields = ['username', 'player', 'tournaments']

	def get_player(self, obj):
		user = MyUser.objects.get(obj)
		user_data = {
			'id': user.id,
			'status': user.status,
			'nickname': user.nickname,
		}
		return user_data

	def get_tournaments(self, obj):
		user = MyUser.objects.get(obj)
		tournaments = user.tournaments.all()
		serializer = TournamentSerializer(tournaments, many=True)
		return serializer.data