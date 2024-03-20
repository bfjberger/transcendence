from rest_framework.serializers import ModelSerializer

from two_players_games_manager.models import Two_Players

class Two_PlayersSerializer(ModelSerializer):
    class Meta:
        model: Two_Players
        fields = '__all__'