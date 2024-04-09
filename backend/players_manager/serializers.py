from rest_framework import serializers


from django.contrib.auth.models import User

from players_manager.models import Player

from django.contrib.auth import authenticate

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ('id', 'owner', 'nickname', 'status')

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(label="username")
    password = serializers.CharField(label="password")

    def validate(self, attrs):
        print("Voici attrs dans serializer : ", attrs)
        user = authenticate(request=self.context.get('request'),username=attrs['username'],password=attrs['password'])
        print("Voici user : ", user)

        if not user:
            raise serializers.ValidationError("Incorrect Credentials")
        else:
            attrs['user'] = user
            return attrs

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password')