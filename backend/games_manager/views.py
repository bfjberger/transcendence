from rest_framework import permissions, status

from rest_framework.authentication import SessionAuthentication, BasicAuthentication

from rest_framework.generics import ListAPIView

from rest_framework.response import Response

from players_manager.models import Player

from .models import Game

from .serializers import GameSerializer

class GameView(ListAPIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		try:
			player = Player.objects.get(owner=self.request.user)
		except:
			return Response(None, status=status.HTTP_400_BAD_REQUEST)

		games_serializer = GameSerializer(Game.objects.filter(players=player), many=True)

		return Response(games_serializer.data, status=status.HTTP_200_OK)
