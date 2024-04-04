from rest_framework import serializers

from players_manager.models import Player

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ('id', 'owner')


#class LoginSerializer(serializers.Serializer):
#    username = serializers.CharField(label="Username")
#    password = serializers.CharField(label="Password")

#		def validate(self, ):
#			user = authenticate(**data)
#			if user and user.is_active:
#				return user
#			raise serializers.ValidationError("Incorrect Credentials")