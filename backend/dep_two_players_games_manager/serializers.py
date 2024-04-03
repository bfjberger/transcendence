from rest_framework.serializers import ModelSerializer

from two_players_games_manager.models import Two_Player

class Two_PlayerSerializer(ModelSerializer):
    class Meta:
        model = Two_Player
        fields = '__all__'