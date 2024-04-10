from rest_framework import serializers

from rest_framework.validators import UniqueValidator

from django.contrib.auth.models import User

from players_manager.models import Player

from django.contrib.auth import authenticate

from django.contrib.auth.password_validation import validate_password

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

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=User.objects.all())])
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])


    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
