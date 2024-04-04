from rest_framework.serializers import ModelSerializer

from tournaments_manager.models import Tournament

class TournamentSerializer(ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['id', 'title', 'player_1', 'player_2', 'player_3', 'player_4', 'player_5', 'player_6', 'player_7', 'player_8', 'nbr_players']