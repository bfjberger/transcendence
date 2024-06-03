from rest_framework import serializers

from .models import Friend

from users.models import MyUser

class UserSerializer(serializers.ModelSerializer):
	class Meta :
		model = MyUser
		fields = '__all__'

class UserSerializerForFriend(serializers.ModelSerializer):
	class Meta :
		model = MyUser
		fields = ("username",)

class FriendSerializer(serializers.ModelSerializer):
	user_initiated = UserSerializerForFriend(read_only=True)
	user_received = UserSerializerForFriend(read_only=True)
	class Meta:
		model = Friend
		fields = ["user_initiated", "user_received", "accept"]

class FriendSerializerPOST(serializers.ModelSerializer):
	class Meta:
		model = Friend
		fields = '__all__'