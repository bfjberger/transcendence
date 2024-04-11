from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics

from rest_framework import serializers

from players_manager.models import Player

from django.contrib.auth import login, logout

from django.contrib.auth.models import User

from players_manager.serializers import LoginSerializer, UserSerializer, PlayerSerializer, RegisterSerializer

class IndexAction(APIView):
	permission_classes = (permissions.AllowAny,)

	def get(self, request):
		print("FAUT PAS AVOIR DE BARRIERE")
		if self.request.user.is_authenticated:
			player = Player.objects.get(owner=self.request.user)
			serializer = PlayerSerializer(player)
			return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

		print(status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)
		return Response(data="Not connected", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)


class test(APIView):
	def get(self, request):
		return Response(None, status=status.HTTP_202_ACCEPTED, template_name="../../frontend/html/login.html")


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
		else:
			print("J en ai marre de rien comprendre")

		print(serializer.errors)
		return Response(serializer.errors, status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)

class LoginView(APIView):
	print("Hello from LoginView")
	permission_classes = (permissions.AllowAny,)

	def post(self, request, format=None):
		print("request.data : ", request.data)
		try:
			serializer = LoginSerializer(data=request.data, context = {'request': request})
			serializer.is_valid(raise_exception=True)
		except serializers.ValidationError:
			return Response(serializer.errors, status=status.HTTP_202_ACCEPTED)
		user = serializer.validated_data['user']
		print("user from LoginView : ", user)
		login(request, user)
		return Response(None, status=status.HTTP_202_ACCEPTED)


class ProfileView(generics.RetrieveAPIView):
	permission_classes = (permissions.IsAuthenticated,)
	serializer_class = PlayerSerializer
	def get_object(self):
		print("\n\nHello from ProfileView : ", self.request.user)
		player = Player.objects.get(owner=self.request.user)
		print("player from ProfileView : ", player)
		return player

class TwoPlayers(APIView):
	pass

class FourPlayers(APIView):
	pass

class Tournament(APIView):
	pass

class Friends(APIView):
	pass