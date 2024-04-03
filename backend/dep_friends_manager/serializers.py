from rest_framework.serializers import ModelSerializer

from friends_manager.models import Friend

class FriendSerializer(ModelSerializer):
    class Meta:
        model = Friend
        fields = ['id', 'player_1', 'player_2', 'accept']