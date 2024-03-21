from rest_framework.serializers import ModelSerializer

from players_manager.models import Player

class PlayerSerializer(ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'login']


class PlayerDetailsSerializer(ModelSerializer):
    class Meta:
       model = Player
       fields = '__all__'