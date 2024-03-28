from rest_framework.serializers import ModelSerializer

from four_players_games_manager.models import Four_Player

class Four_PlayerSerializer(ModelSerializer):
    class Meta:
        model = Four_Player
        fields = '__all__'