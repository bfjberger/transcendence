from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, ValidationError
from players_manager.models import Player

class PlayerSerializer(ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

    owner = serializers.ReadOnlyField(source='owner.username')

    # def validate_login(self, value):
    #    if Player.objects.filter(login=value).exists():
    #        raise ValidationError("This login is already taken.")
    #    return value
    
    def validate (self, data):
        if data['nb_games_2p_won'] + data['nb_games_2p_lost'] != data['nb_games_2p']:
            raise ValidationError("Inconsistency in nb_games_2p_won and nb_games_2p_lost")
        return data

class PlayerDetailsSerializer(ModelSerializer):
    class Meta:
       model = Player
       fields = ['id','nickname', 'score']
       
class AdminPlayerSerializer(ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'
