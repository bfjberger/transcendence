from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response

from players_manager.models import Player
from players_manager.serializers import PlayerSerializer

# Create your views here.

class PlayerAPIViews(APIView):
    def get(self, request):
        players = Player.objects.all()
        serializer = PlayerSerializer(players, many=True)
        return Response(serializer.data)