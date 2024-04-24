from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from .models import Tournament
from players_manager.models import Player
from .serializers import TournamentSerializer
from players_manager.serializers import PlayerSerializer
from django.contrib.auth.models import User
from players_manager.serializers import UserSerializer, PlayerSerializer
from rest_framework.authentication import SessionAuthentication, BasicAuthentication

class TournamentViewSet(viewsets.ViewSet):
	# def create(self, request):
	# 	print("request", request.data)
	# 	serializer = TournamentSerializer(data=request.data)
	# 	if serializer.is_valid():
	# 		serializer.save()
	# 		return Response({'success': True})
	# 	else:
	# 		return Response({'success': False, 'errors': serializer.errors})
		
	def create(self, request):
		serializer = TournamentSerializer(data=request.data)
		if serializer.is_valid():
			name = serializer.validated_data.get('name')
			if Tournament.objects.filter(name=name).exists():
				return Response({'detail': 'A tournament with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
			serializer.save()
			return Response({'success': True})
		else:
			return Response({'success': False, 'errors': serializer.errors})

	@action(detail=False, methods=['post'])
	def join_tournament(self, request, pk=None):
		print("request.data", request.data)
		tournament = Tournament.objects.get(name=request.data['name'])
		player = Player.objects.get(owner=request.user)
		tournament.add_player(player)
		return Response({'success': True})

	@action(detail=False, methods=['get'])
	def load_tournaments(self, request):
		tournaments = Tournament.objects.all()
		serializer = TournamentSerializer(tournaments, many=True)
		return Response(serializer.data)

class PlayerViewSet(viewsets.ModelViewSet):
	"""
	API endpoint that allows players in a tournament to be viewed.
	"""
	def get_queryset(self):
		tournament_name = self.kwargs['tournament_name']
		tournament = Tournament.objects.get(name=tournament_name)
		return Player.objects.filter(tournament=tournament)

	serializer_class = PlayerSerializer
