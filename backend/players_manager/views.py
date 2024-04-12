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
			return Response(data={"player" : serializer_player.data, "user" : serializer_user.data}, status=status.HTTP_202_ACCEPTED)

		# print(status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)
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

		print(serializer.errors)
		return Response(serializer.errors, status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)


class LoginView(APIView):
	permission_classes = (permissions.AllowAny,)

	def post(self, request, format=None):
		# print("request.data : ", request.data)
		try:
			serializer = LoginSerializer(data=request.data, context = {'request': request})
			serializer.is_valid(raise_exception=True)
		except serializers.ValidationError:
			return Response(serializer.errors, status=status.HTTP_202_ACCEPTED)
		user = serializer.validated_data['user']
		# print("user from LoginView : ", user)
		login(request, user)
		return Response(None, status=status.HTTP_202_ACCEPTED)


# class ProfileView(generics.RetrieveAPIView):
# 	permission_classes = (permissions.IsAuthenticated,)
# 	serializer_class = PlayerSerializer
# 	def get_object(self):
# 		print("\n\nHello from ProfileView : ", self.request.user)
# 		player = Player.objects.get(owner=self.request.user)
# 		print("player from ProfileView : ", player)
# 		return player

# 	def put_object(self):
# 		print("\nHello from put_object : \n", self.request.user)
# 		return "put_object"


class ProfileView(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = PlayerSerializer

	def get(self, request):
		player = Player.objects.get(owner=self.request.user)
		serializer_player = PlayerSerializer(player)
		serializer_user = UserSerializer(self.request.user)
		return Response(data=serializer_player.data, status=status.HTTP_200_OK)

	# @transaction.atomic
	# @method_decorator()
	@method_decorator(csrf_exempt, name='dispatch')
	def patch(self, request):
		try :
			player = Player.objects.get(owner=self.request.user)
		except :
			return Response(None, status=status.HTTP_400_BAD_REQUEST)

		serializer_player = PlayerSerializer(player, data=self.request.data, partial=True)
		#serializer_player.is_valid()
		#return Response(data=serializer_player.data, status=status.HTTP_200_OK)
		# serializer_user = UserSerializer(self.request.user, data=self.request.data)

		if serializer_player.is_valid():
			serializer_player.save()
			return Response(data=serializer_player.data, status=status.HTTP_200_OK)
		return Response(data={"errors" : serializer_player.errors, "player" : serializer_player.data}, status=status.HTTP_400_BAD_REQUEST)



class TwoPlayers(APIView):
	permission_classes = (permissions.IsAuthenticated,)
	pass

class FourPlayers(APIView):
	permission_classes = (permissions.IsAuthenticated,)
	pass

class Tournament(APIView):
	permission_classes = (permissions.IsAuthenticated,)
	pass

class Friends(APIView):
	permission_classes = (permissions.IsAuthenticated,)
	pass
