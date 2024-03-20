from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from players_manager.models import Player
from players_manager.serializers import PlayerSerializer

#class PlayerViewSet(ReadOnlyModelViewSet):
class PlayerViewSet(ModelViewSet):
    serializer_class = PlayerSerializer
    #queryset = Player.objects.all()
    def get_queryset(self):
        return Player.objects.all()