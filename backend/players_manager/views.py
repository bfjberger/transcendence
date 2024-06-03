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

from django.db.models import Count

from players_manager.serializers import *

from rest_framework.authentication import SessionAuthentication, BasicAuthentication

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from tournament.models import TournamentStat

from games_manager.models import Game

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
		# check if the request.data["username"] contains a _42 in the username
		if '_42' in request.data['username']:
			return Response({"username": "Votre username ne peut pas contenir de '_42'."}, status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)

		mail_check = False
		# check if the request.data["email"] contains a 42 in the mail
		if '42' in request.data['email']:
			mail_check = True

		if '@' in request.data['username'] or '+' in request.data['username']:
			return Response({"username": "Votre username ne peut pas contenir de '@' ou de '+'."}, status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)

		if mail_check == False :
			serializer = RegisterSerializer(data=request.data)
			if serializer.is_valid():
				user = serializer.save()
				if user:
					return Response(serializer.data, status=status.HTTP_201_CREATED)
			return Response(serializer.errors, status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)

		return Response({"42 API" : "Pseudo contient _42 ou mail contient 42."}, status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)


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

		# Get all games where 2 players were there
		games_two = Game.objects.annotate(num_players=Count('players')).filter(num_players=2)

		# From the games with 2 players, get the games where the player was present
		games_played_two = games_two.filter(players=player)

		two_players_stats = {}

		two_players_stats.update({"games_2p": games_played_two.count()})

		win_two = games_played_two.filter(winner=player).count()
		if games_played_two.count() == 0:
			two_players_stats.update({"ratio_2p": "N/A"})
		else:
			two_players_stats.update({"ratio_2p": round((win_two / games_played_two.count()) * 100, 2)})

		points_two = 0
		for game in games_played_two:
			points_two += game.scores[str(self.request.user.username)]
		two_players_stats.update({"points_2p": points_two})

		tournament_stats = {}

		# From the games with 2 players and where the player was present, get the games where the field tournament_level is not null
		games_played_tournament = games_played_two.exclude(tournament_level__isnull=True)

		nb_win = TournamentStat.objects.filter(winner=player).count()
		tournament_stats.update({"nb_win": nb_win})

		win_in_tournament = games_played_tournament.filter(winner=player).count()
		tournament_stats.update({"match_win": win_in_tournament})

		points_tournament = 0
		for game in games_played_tournament:
			points_tournament += game.scores[str(self.request.user.username)]
		tournament_stats.update({"points_tournament": points_tournament})

		four_players_stats = {}

		# Get all games where 4 players were there
		games_four = Game.objects.annotate(num_players=Count('players')).filter(num_players=4)

		# From the games with 4 players, get the games where the player was present
		games_played_four = games_four.filter(players=player)

		four_players_stats.update({"games_4p": games_played_four.count()})

		win_four = games_played_four.filter(winner=player).count()
		if games_played_four.count() == 0:
			four_players_stats.update({"ratio_4p": "N/A"})
		else:
			four_players_stats.update({"ratio_4p": round((win_four / games_played_four.count()) * 100, 2)})

		points_four = 0
		for game in games_played_four:
			points_four += game.scores[str(self.request.user.username)]
		four_players_stats.update({"points_4p": points_four})

		return Response(data={"data": serializer_data.data, "twoplayers": two_players_stats, "fourplayers": four_players_stats, "tournament": tournament_stats}, status=status.HTTP_200_OK)


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
