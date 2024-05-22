from rest_framework import serializers

from rest_framework.validators import UniqueValidator

from django.contrib.auth.models import User

from players_manager.models import Player, Friend

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
		user = authenticate(request=self.context.get('request'),username=attrs['username'],password=attrs['password'])

		if not user:
			raise serializers.ValidationError("Incorrect Credentials")
		else:
			attrs['user'] = user
			return attrs

	# def update_status(self):
	#     self.status = "ONLINE"
	#     self.save()



class UserSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
	class Meta:
		model = User
		fields = ("password",)

	def update(self, instance, validated_data):
		instance.set_password(validated_data["password"])
		instance.save()
		return instance



class RegisterSerializer(serializers.ModelSerializer):
	username = serializers.CharField(required=True, validators=[UniqueValidator(queryset=User.objects.all())])
	email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=User.objects.all())])
	password = serializers.CharField(required=True, write_only=True, validators=[validate_password])

	def create(self, validated_data):
		user = User.objects.create_user(
			username=validated_data['username'],
			email=validated_data['email'],
			password=validated_data['password']
		)
		player = Player.objects.create(owner=user, nickname=validated_data['username'])
		return user

	class Meta:
		model = User
		fields = ('id', 'username', 'email', 'password')



class AvatarSerializer(serializers.ModelSerializer):
	class Meta:
		model = Player
		fields = ['avatar']

	def save(self, *args, **kwargs):
		new_avatar = self.validated_data.get('avatar')
		if new_avatar:
			if self.instance.avatar.name != 'staticfiles/avatars/avatar.png':
				# Delete the old avatar if it's not the default one
				self.instance.avatar.delete()
		return super().save(*args, **kwargs)


class FriendSerializer(serializers.ModelSerializer):
	class Meta:
		model = Friend
		fields = ['id', 'player_initiated', 'player_received', 'accept']


class DataSerializer(serializers.ModelSerializer):
	player = serializers.SerializerMethodField()

	class Meta:
		model = User
		fields = ['username', 'player']

	def get_player(self, obj):
		player = Player.objects.get(owner=obj)
		player_data = {
			'status': player.status,
			'nickname': player.nickname,
			'avatar': player.avatar.url,
		}
		return player_data

class StatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = [
                    'nb_games_2p',
                    'nb_games_2p_lost',
                    'nb_games_2p_won',
                    'nb_points_2p',
                    'nb_games_4p',
                    'nb_games_4p_won',
                    'nb_games_4p_lost',
                    'nb_points_4p',
                    'nb_points_tournament'
                ]
