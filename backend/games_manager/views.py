from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.generics import ListAPIView # , CreateAPIView
from rest_framework.response import Response
from rest_framework import status

from .models import TwoPlayersGame, FourPlayersGame
from .serializers import TwoPlayersGameSerializer, FourPlayersGameSerializer

from django.db.models import Q

from players_manager.models import Player


class ListTwoPlayersGamesAPIView (ListAPIView) :
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		try:
			player = Player.objects.get(owner=self.request.user)
		except:
			return Response(None, status=status.HTTP_400_BAD_REQUEST)

		games_serializer = TwoPlayersGameSerializer(TwoPlayersGame.objects.filter(players=player), many=True)

		return Response(games_serializer.data, status=status.HTTP_200_OK)

# class CreateTwoPlayersGamesAPIView (CreateAPIView) :
# 	authentication_classes = [SessionAuthentication, BasicAuthentication]
# 	permission_classes = [permissions.IsAuthenticated]
# 	queryset = TwoPlayersGame.objects.all()
# 	serializer_class = TwoPlayersGameSerializer


class ListFourPlayersGamesAPIView (ListAPIView) :
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = FourPlayersGameSerializer

	def get_queryset(self):
		return FourPlayersGame.objects.filter(Q(user1 = self.request.user) | Q(user2 = self.request.user) | Q(user3 = self.request.user) | Q(user4 = self.request.user))
