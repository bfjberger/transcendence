from django.shortcuts import render
from django.http import HttpResponseBadRequest
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from .models import Tournament
from players_manager.models import Player
from .serializers import TournamentSerializer, PlayerInTournamentSerializer
from players_manager.serializers import PlayerSerializer
from django.contrib.auth.models import User
from players_manager.serializers import UserSerializer, PlayerSerializer
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework import serializers




# Ok currently kinda working after checking the following error:
# AttributeError: 'TournamentViewSet' object has no attribute 'get_object' (in the join_tournament method)
# I think it's because of the get_object method in the TournamentViewSet class was not defined properly
# And also because pk was expecting an int but it was a string
# Either change the pk to an int or change the get_object method to accept a string


class TournamentViewSet(viewsets.ViewSet):
	queryset = Tournament.objects.all()
	serializer_class = TournamentSerializer

	def get_queryset(self):
		return Tournament.objects.all()

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

		if Tournament.objects.count() >= MAX_TOURNAMENTS:
			return HttpResponseBadRequest('Maximum number of tournaments reached')
		# Check if there is a space in the name
		if ' ' in request.data['name']:
			return Response({'success': False, 'detail': 'Tournament name should not contain spaces.'}, status=status.HTTP_400_BAD_REQUEST)
		serializer = TournamentSerializer(data=request.data)
		if serializer.is_valid():
			name = serializer.validated_data.get('name')
			if Tournament.objects.filter(name=name).exists():
				return Response({'detail': 'A tournament with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
			# Check for special characters in the name
			if not name.isalnum():
				return Response({'detail': 'Tournament name should only contain alphanumeric characters.'}, status=status.HTTP_400_BAD_REQUEST)

			# Set the owner of the tournament to the current user
			player = Player.objects.get(owner=request.user)
			serializer.save(owner=player)
			print("Tournament created:", name)
			return Response({'success': True})
		else:
			return Response({'success': False, 'errors': serializer.errors})
		
	@action(detail=True, methods=['delete'])
	def delete_tournament(self, request, pk=None):
		tournament = self.get_object()
		tournament.delete()
		return Response({'success': True})
 
	@action(detail=True, methods=['post'])
	def join_tournament(self, request, pk=None):
		tournament = self.get_object()
		player = Player.objects.get(owner=request.user)
		if tournament.is_player_in_tournament(player):
			return Response({'success': False, 'detail': 'You are already in this tournament.'})
		tournament.add_player(player)
		return Response({'success': True})

	@action(detail=False, methods=['get'])
	def load_tournaments(self, request):
		tournaments = Tournament.objects.all()
		serializer = TournamentSerializer(tournaments, many=True)
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
			return Response({'success': False, 'detail': 'You are not in this tournament.'})
		tournament.remove_player(player)
		return Response({'success': True})

class PlayerViewSet(viewsets.ModelViewSet):
	"""
	API endpoint that allows players in a tournament to be viewed.
	"""
	def get_queryset(self):
		tournament_name = self.kwargs['tournament_name']
		tournament = Tournament.objects.get(name=tournament_name)
		return Player.objects.filter(tournament=tournament)

	serializer_class = PlayerSerializer

class TournamentOnline(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		user_data = request.user
		serializer_data = PlayerInTournamentSerializer(user_data)
		return Response(data=serializer_data.data, status=status.HTTP_200_OK)
