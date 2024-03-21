from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from two_players_games_manager.models import Two_Player
from two_players_games_manager.serializers import Two_PlayerSerializer


class Two_PlayerViewSet(ModelViewSet):
    serializer_class = Two_PlayerSerializer
    def get_queryset(self):
        return Two_Player.objects.all()