import requests
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics
from django.conf import settings
import datetime


from rest_framework.reverse import reverse_lazy

from rest_framework import serializers

from players_manager.models import Player

from django.contrib.auth import login, logout

from django.contrib.auth.models import User

from players_manager.serializers import (LoginSerializer, UserSerializer, PlayerSerializer,
										RegisterSerializer, FriendSerializer, AvatarSerializer,
										DataSerializer, StatsSerializer)

from rest_framework.authentication import SessionAuthentication, BasicAuthentication

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from tournament.models import TournamentStat

from games_manager.models import TwoPlayersGame

class IndexAction(APIView):
	permission_classes = (permissions.AllowAny,)

	def get(self, request):
		if self.request.user.is_authenticated:
			player = Player.objects.get(owner=self.request.user)
			data_serializer = DataSerializer(self.request.user)
			return Response(data=data_serializer.data, status=status.HTTP_202_ACCEPTED)

		return Response(data="Not connected", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)


class RegisterAction(APIView):
	queryset = User.objects.all()
	permission_classes = (permissions.AllowAny,)
	serializer_class = RegisterSerializer

	def post(self, request):
		# Verifier si un user 42 existe

		authorization_url = "https://api.intra.42.fr/oauth/token" #by def, url where you can loggin ('https://api.intra.42.fr/oauth/authorize')
		datas = {
			"grant_type" : "client_credentials",
			"client_id" : settings.SOCIALACCOUNT_PROVIDERS['42']['KEY'], #ATTENTION
			"client_secret" : settings.SOCIALACCOUNT_PROVIDERS['42']['SECRET']
		}

		response_post = requests.post(authorization_url, datas)
		token = response_post.json()["access_token"]


		check_url = "https://api.intra.42.fr/v2/users" + "/" + request.data["username"]
		header = {
			"Authorization" : "Bearer" + " " + token
		}

		result = requests.get(check_url, headers=header)

		check_url2 = "https://api.intra.42.fr/v2/users/?filter[email]=" + request.data["email"]

		result2 = requests.get(check_url2, headers=header)

		mail_chk = True if len(result2.json()) == 1 else False

		if '@' in request.data['username'] or '+' in request.data['username']:
			return Response({"username": "Votre username ne peut pas contenir de '@' ou de '+'."}, status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)

		if result.status_code != 200 and mail_chk == False :
			serializer = RegisterSerializer(data=request.data)
			if serializer.is_valid():
				user = serializer.save()
				if user:
					return Response(serializer.data, status=status.HTTP_201_CREATED)
			return Response(serializer.errors, status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)

		return Response({"42 API" : "Pseudo ou mail déjà utilisé par un étudiant de 42."}, status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)



class LoginView(APIView):
	permission_classes = (permissions.AllowAny,)

	def post(self, request, format=None):
		try:
			serializer = LoginSerializer(data=request.data, context = {'request': request})
			serializer.is_valid(raise_exception=True)
		except serializers.ValidationError:
			return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

		user = serializer.validated_data['user']
		# Player.check_inactive_players()
		try:
			player = Player.objects.get(owner=user)
		except Player.DoesNotExist:
			return Response("Utilisateur inexistant.", status=status.HTTP_422_UNPROCESSABLE_ENTITY)

		if (player.status == "ONLINE" or player.status == "PLAYING"):
			return Response({"Erreur" : "Le joueur est deja loggé."}, status=status.HTTP_401_UNAUTHORIZED)
		login(request, user)
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


class ProfileUpdatePassword(APIView) :
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = UserSerializer

	def patch (self, request):
		try :
			user = User.objects.get(username=self.request.user)
		except :
			return Response("Utilisateur inconnu. Contactez le webmaster.", status=status.HTTP_400_BAD_REQUEST)

		serialized_user = UserSerializer(user, data=request.data)

		if serialized_user.is_valid():
			logout(request)
			serialized_user.save()
			login(request, user)
			return Response(data=serialized_user.data, status=status.HTTP_200_OK)

		return Response("Nouveau mot de passe non valide.", status=status.HTTP_400_BAD_REQUEST)

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
	serializer_class = DataSerializer

	def get(self, request):
		try :
			serializer_player = DataSerializer(self.request.user)
		except :
			return Response(None, status=status.HTTP_400_BAD_REQUEST)
		return Response(data=serializer_player.data, status=status.HTTP_200_OK)


class FourPlayers(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = DataSerializer

	def get(self, request):
		try :
			serializer_player = DataSerializer(self.request.user)
		except :
			return Response(None, status=status.HTTP_400_BAD_REQUEST)
		return Response(data=serializer_player.data, status=status.HTTP_200_OK)


class Tournament(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = DataSerializer

	def get(self, request):
		try :
			serializer_player = DataSerializer(self.request.user)
		except :
			return Response(None, status=status.HTTP_400_BAD_REQUEST)
		return Response(data=serializer_player.data, status=status.HTTP_200_OK)


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

		tournament_stats = {}

		nb_win = len(TournamentStat.objects.filter(winner=player))
		tournament_stats.update({"nb_win": nb_win})

		tournament_matchs = TwoPlayersGame.objects.exclude(level__isnull=True)
		tournament_matchs_win = len(tournament_matchs.filter(win_player=self.request.user))

		tournament_stats.update({"match_win": tournament_matchs_win})

		return Response(data={"data": serializer_data.data, "stats": serializer_stats.data, "tournament": tournament_stats}, status=status.HTTP_200_OK)


class UpdateStatus(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]

	def patch(self, request):
		try :
			player = Player.objects.get(owner=self.request.user)
		except :
			return Response(None, status=status.HTTP_400_BAD_REQUEST)

		player.status = request.data.get("status")
		player.save()

		serializer_player = PlayerSerializer(player)
		return Response(data=serializer_player.data, status=status.HTTP_200_OK)
