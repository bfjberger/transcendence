from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework import status

from .models import TwoPlayersGame, FourPlayersGame
from .serializers import TwoPlayersGameSerializer, FourPlayersGameSerializer

from django.db.models import Q

class ListTwoPlayersGamesAPIView (ListAPIView) :
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = TwoPlayersGameSerializer

	def get_queryset(self):
		return TwoPlayersGame.objects.filter(Q(user1 = self.request.user) | Q(user2 = self.request.user))

class CreateTwoPlayersGamesAPIView (CreateAPIView) :
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	queryset = TwoPlayersGame.objects.all()
	serializer_class = TwoPlayersGameSerializer


class ListFourPlayersGamesAPIView (ListAPIView) :
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = FourPlayersGameSerializer

	def get_queryset(self):
		return FourPlayersGame.objects.filter(Q(user1 = self.request.user) | Q(user2 = self.request.user) | Q(user3 = self.request.user) | Q(user4 = self.request.user))
