from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics

from rest_framework.reverse import reverse_lazy

from rest_framework import serializers

from players_manager.models import Player

from django.contrib.auth import login, logout

from django.contrib.auth.models import User

from players_manager.serializers import LoginSerializer, UserSerializer, PlayerSerializer, RegisterSerializer, FriendSerializer, AvatarSerializer, DataSerializer, StatsSerializer

from rest_framework.authentication import SessionAuthentication, BasicAuthentication


from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

class IndexAction(APIView):
	permission_classes = (permissions.AllowAny,)

	def get(self, request):
		if self.request.user.is_authenticated:
			player = Player.objects.get(owner=self.request.user)
			serializer_player = PlayerSerializer(player)
			serializer_user = UserSerializer(self.request.user)
			data_serializer = DataSerializer(self.request.user)
			return Response(data=data_serializer.data, status=status.HTTP_202_ACCEPTED)

		return Response(data="Not connected", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)


class RegisterAction(APIView):
	queryset = User.objects.all()
	permission_classes = (permissions.AllowAny,)
	serializer_class = RegisterSerializer

	def post(self, request):
		serializer = RegisterSerializer(data=request.data)
		if serializer.is_valid():
			user = serializer.save()
			if user:
				return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)


class LoginView(APIView):
	permission_classes = (permissions.AllowAny,)

	def post(self, request, format=None):
		try:
			serializer = LoginSerializer(data=request.data, context = {'request': request})
			serializer.is_valid(raise_exception=True)
		except serializers.ValidationError:
			return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

		user = serializer.validated_data['user']
		login(request, user)

		try:
			player = Player.objects.get(owner=user)
		except Player.DoesNotExist:
			return Response("Player not found.", status=status.HTTP_422_UNPROCESSABLE_ENTITY)

		player.status = "ONLINE"
		player.save()

		user_data = self.request.user
		serializer_data = DataSerializer(user_data)
		return Response(data=serializer_data.data, status=status.HTTP_202_ACCEPTED)


class LogoutView(APIView):
		authentication_classes = [SessionAuthentication, BasicAuthentication]
		permission_classes = [permissions.IsAuthenticated]

		def patch(self, request):
			player = Player.objects.get(owner=self.request.user)
			player.status = "OFFLINE"
			player.save()

			logout(request)

			return Response("Logout success", status=status.HTTP_200_OK)

class ProfileView(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	# serializer_class = PlayerSerializer

	def get(self, request):
		user_data = self.request.user
		serializer_data = DataSerializer(user_data)
		return Response(data=serializer_data.data, status=status.HTTP_200_OK)

	# @transaction.atomic
	# @method_decorator()
	# @method_decorator(csrf_exempt, name='dispatch')
	def patch(self, request):
		try :
			player = Player.objects.get(owner=self.request.user)
		except :
			return Response(None, status=status.HTTP_400_BAD_REQUEST)

		serializer_player = PlayerSerializer(player, data=self.request.data, partial=True)

		if serializer_player.is_valid():
			serializer_player.save()
			return Response(data=serializer_player.data, status=status.HTTP_200_OK)

		return Response(data=serializer_player.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileUpdateAvatarView(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = AvatarSerializer

	def patch(self, request):
		try :
			player = Player.objects.get(owner=self.request.user)
		except :
			return Response(None, status=status.HTTP_400_BAD_REQUEST)

		serializer = AvatarSerializer(player, data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_200_OK)
		else:
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TwoPlayers(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = PlayerSerializer

	def get(self, request):
		serializer_data = DataSerializer(self.request.user)
		return Response(data=serializer_data.data, status=status.HTTP_200_OK)


class FourPlayers(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = PlayerSerializer

	def get(self, request):
		serializer_data = DataSerializer(self.request.user)
		return Response(data=serializer_data.data, status=status.HTTP_200_OK)


class Tournament(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = PlayerSerializer

	def get(self, request):
		player = Player.objects.get(owner=self.request.user)
		serializer_player = PlayerSerializer(player)
		serializer_user = UserSerializer(self.request.user)
		return Response(data={"player" : serializer_player.data, "user" : serializer_user.data}, status=status.HTTP_200_OK)


class Statistiques(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		serializer_data = DataSerializer(self.request.user)
		try :
			player = Player.objects.get(owner=self.request.user)
		except :
			return Response(None, status=status.HTTP_400_BAD_REQUEST)
		serializer_stats = StatsSerializer(player)
		return Response(data={"data": serializer_data.data, "stats": serializer_stats.data}, status=status.HTTP_200_OK)


class UpdateStatus(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]

	def patch(self, request):
		try :
			player = Player.objects.get(owner=self.request.user)
		except :
			return Response(None, status=status.HTTP_400_BAD_REQUEST)

		if player.status == "PLAYING":
			player.status = "ONLINE"
		elif player.status == "ONLINE":
			player.status = "PLAYING"
		player.save()
		serializer_player = PlayerSerializer(player)
		return Response(data=serializer_player.data, status=status.HTTP_200_OK)
