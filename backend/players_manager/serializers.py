from rest_framework import serializers

from rest_framework.validators import UniqueValidator

from django.contrib.auth.models import User

from players_manager.models import Player

from django.contrib.auth import authenticate

from django.contrib.auth.password_validation import validate_password

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = "__all__"

    # def update(self, instance, validated_data):
    #     instance.nickname = validated_data.get("nickname", instance.nickname)        
    #     instance.avatar = validated_data.get("avatar", instance.avatar)
    #     instance.save()
    #     return instance
    

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
        fields = "__all__"
    
    def update(self, instance, validated_data):
        instance.password = validated_data.get('password', instance.password)
        instance.save()
        return instance

class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True, validators=[UniqueValidator(queryset=User.objects.all())])
    email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=User.objects.all())])
    password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    # password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        player = Player.objects.create(owner=user)
        return user

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

# class UpdateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Player
#         fields = ("avatar")
    
#     def update(self, instance, validated_data):
