from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics

from players_manager.models import Player

from django.contrib.auth import login, logout

from players_manager.serializers import LoginSerializer, UserSerializer, PlayerSerializer

class IndexView(APIView):
	print("IndexView : ")
	permission_classes = (permissions.AllowAny,)

	def get(self, request):
		if self.request.user.is_authenticated:
			player = Player.objects.get(owner=self.request.user)
			serializer = PlayerSerializer(player)
			return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
		return Response(None, status=status.HTTP_202_ACCEPTED)
		

class test(APIView):
	def get(self, request):
		return Response(None, status=status.HTTP_202_ACCEPTED, template_name="../../frontend/staticfiles/html/login.html")
		

class RegisterView(APIView):
	permission_classes = (permissions.IsAuthenticated,)
	print("RegisterView")
	pass

class LoginView(APIView):
	print("Hello from LoginView")
	permission_classes = (permissions.AllowAny,)

	def post(self, request, format=None):
		print("request.data : ", request.data)
		serializer = LoginSerializer(data=request.data, context = {'request': request})
		serializer.is_valid(raise_exception=True)
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