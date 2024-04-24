from rest_framework import permissions
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status

from .models import TwoPlayersGame
from .serializers import TwoPlayersGameSerializer

class ListTwoPlayersGamesAPIView (ListAPIView) :
	queryset = TwoPlayersGame.objects.all()
	serializer_class = TwoPlayersGameSerializer