from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Tournament
from .serializers import TournamentSerializer
from django.contrib.auth.models import User
from players_manager.serializers import UserSerializer, PlayerSerializer
from rest_framework.authentication import SessionAuthentication, BasicAuthentication

class TournamentViewSet(viewsets.ViewSet):
	def create(self, request):
		print("request", request.data)
		serializer = TournamentSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response({'success': True})
		else:
			return Response({'success': False, 'errors': serializer.errors})

	@action(detail=False, methods=['get'])
	def load_tournaments(self, request):
		tournaments = Tournament.objects.all()
		serializer = TournamentSerializer(tournaments, many=True)
		return Response(serializer.data)