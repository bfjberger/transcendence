from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from players_manager.models import Player
from players_manager.serializers import PlayerSerializer, PlayerDetailsSerializer

class PlayerViewSet(ModelViewSet):

    serializer_class = PlayerSerializer
    detail_serializer_class = PlayerDetailsSerializer

    def get_queryset(self):
        return Player.objects.all()

    #REDIFINITION DE LA METHODE GET_SERIALIZER_CLASS
    def get_serializer_class(self):
        print("get_serializer_class", self.action)
        if self.action =='retrieve':
            return self.detail_serializer_class
        return self.serializer_class
