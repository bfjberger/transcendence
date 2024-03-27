from rest_framework.serializers import ModelSerializer, ValidationError
from players_manager.models import Player
from django.contrib.auth.models import User

class PlayerSerializer(ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

    def validate_username(self, value):
        print("\n\n\n\n!!! validate_login : '", value, "'")
        if Player.objects.filter(username=value).exists():
            raise ValidationError("This login is already taken.")
        return value
    
    # def validate (self, data):
    #    if data['nb_games_2p_won'] + data['nb_games_2p_lost'] != data['nb_games_2p']:
    #        raise ValidationError("Inconsistency in nb_games_2p_won and nb_games_2p_lost")
    #    return data

class PlayerDetailsSerializer(ModelSerializer):
    class Meta:
       model = Player
       fields = ['id', 'username', 'password' ,'nickname', 'score']
       
class AdminPlayerSerializer(ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'


# class UserSerializer(ModelSerializer):
#     class Meta(object):
#         model= User
#         fields = ['id', 'username', 'password', 'email']