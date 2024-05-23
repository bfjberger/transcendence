from django.shortcuts import render
from django.http import HttpResponseBadRequest
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from .models import TournamentRoom
from players_manager.models import Player
from .serializers import TournamentSerializer, PlayerInTournamentSerializer
from players_manager.serializers import PlayerSerializer
from django.contrib.auth.models import User
from players_manager.serializers import UserSerializer, PlayerSerializer
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework import serializers


class TournamentViewSet(viewsets.ViewSet):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	queryset = TournamentRoom.objects.all()
	serializer_class = TournamentSerializer

	def get_queryset(self):
		return TournamentRoom.objects.all()

	def get_object(self):
		queryset = self.get_queryset()
		# Handle both integer and string primary keys
		pk = self.kwargs['pk']
		try:
			obj = queryset.get(pk=pk)
		except (ValueError, queryset.model.DoesNotExist):
			# If the pk is not an integer, try using it as a string
			obj = queryset.get(name=pk)
		return obj

	def create(self, request):
		MAX_TOURNAMENTS = 10

		if TournamentRoom.objects.count() >= MAX_TOURNAMENTS:
			return Response({'success': False, 'detail':"Le nombre de tournoi maximum à été atteint."}, status=status.HTTP_400_BAD_REQUEST)
		# Check if there is a space in the name
		if ' ' in request.data['name']:
			return Response({'success': False, 'detail':"Un nom de tournoi ne peut pas contenir d\'espaces."}, status=status.HTTP_400_BAD_REQUEST)
		serializer = TournamentSerializer(data=request.data)
		if serializer.is_valid():
			print("Creating tournament")
			name = serializer.validated_data.get('name')
			if TournamentRoom.objects.filter(name=name).exists():
				return Response({'success': False, 'detail':'Un tournoi avec ce nom existe déjà.'}, status=status.HTTP_400_BAD_REQUEST)
			# Check for special characters in the name
			if not name.isalnum():
				return Response({'success': False, 'detail':'Un nom de tournoi doit seulement contenir des caractères alphanumériques.'}, status=status.HTTP_400_BAD_REQUEST)
			serializer.save()
			print("Tournament created:", name)
			return Response({'success': True, 'detail': 'Tournoi créé avec succès.'}, status=status.HTTP_200_OK)
		else:
			return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	@action(detail=True, methods=['delete'])
	def delete_tournament(self, request, pk=None):
		tournament = self.get_object()
		tournament.delete()
		return Response({'success': True})

	@action(detail=True, methods=['post'])
	def join_tournament(self, request, pk=None):
		tournament = TournamentRoom.objects.filter(name=pk).first()
		if (not tournament):
			return Response({'success': False, 'detail': f"{pk} n\'existe plus."}, status=status.HTTP_400_BAD_REQUEST)
		tournament = self.get_object()
		player = Player.objects.get(owner=request.user)
		if tournament.started == True:
			return Response({'success': False, 'detail': f"{pk} a débuté."}, status=status.HTTP_400_BAD_REQUEST)
		if tournament.get_players().count() >= 8:
			return Response({'success': False, 'detail': f"{pk} est complet."}, status=status.HTTP_400_BAD_REQUEST)
		tournament.add_player(player)
		return Response({'success': True, 'detail': 'Vous avez rejoint ce tournoi.'}, status=status.HTTP_200_OK)

	@action(detail=False, methods=['get'])
	def load_tournaments(self, request):
		# Get all the tournaments that have started and delete them
		tournaments_started = TournamentRoom.objects.filter(started=True)
		for tournament in tournaments_started:
			tournament.delete_if_timer(1200)
		tournaments_not_started = TournamentRoom.objects.filter(started=False)
		for tournament in tournaments_not_started:
			tournament.delete_if_empty(600)
		serializer = TournamentSerializer(tournaments_not_started, many=True)
		return Response(serializer.data)

	@action(detail=True, methods=['get'])
	def load_players(self, request, pk=None):
		tournament = self.get_object()
		players = tournament.get_players()
		serializer = PlayerSerializer(players, many=True)
		return Response(serializer.data)

	@action(detail=True, methods=['post'])
	def leave_tournament(self, request, pk=None):
		tournament = self.get_object()
		player = Player.objects.get(owner=request.user)
		if not tournament.is_player_in_tournament(player):
			return Response(data="Tu n'es pas dans ce tournoi.", status=status.HTTP_401_UNAUTHORIZED)
		tournament.remove_player(player)
		return Response(data="Tu as quitté ce tournoi.", status=status.HTTP_200_OK)


class PlayerViewSet(viewsets.ModelViewSet):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	"""
	API endpoint that allows players in a tournament to be viewed.
	"""
	def get_queryset(self):
		tournament_name = self.kwargs['tournament_name']
		tournament = TournamentRoom.objects.get(name=tournament_name)
		return Player.objects.filter(tournament=tournament)

	serializer_class = PlayerSerializer


class TournamentOnline(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		user_data = request.user
		serializer_data = PlayerInTournamentSerializer(user_data)
		return Response(data=serializer_data.data, status=status.HTTP_200_OK)
