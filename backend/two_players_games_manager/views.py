from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from two_players_games_manager.models import Two_Players
from two_players_games_manager.serializers import Two_PlayersSerializer


class Two_PlayersViewSet(ModelViewSet):
    serializer_class = Two_PlayersSerializer
    def get_queryset(self):
        return Two_Players.objects.all()