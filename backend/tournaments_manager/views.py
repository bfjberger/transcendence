from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action

from tournaments_manager.models import Tournament
from tournaments_manager.serializers import TournamentSerializer


class TournamentViewSet(ModelViewSet):
	serializer_class = TournamentSerializer

	@action(methods=['GET'], detail=True)
	def erase_tournament(self, request, pk):
		print("\n\n\n\n\n\n\nerase_tournament", pk)
		return Response(status=200)

	def get_queryset(self):
		print("\n\n self.action = ",self.action, "\n\n")
		queryset = Tournament.objects.all()

		player = self.request.GET.get('player')
		title = self.request.GET.get('title')
		nbr_players = self.request.GET.get('nbr_players')

		if player is not None :
			queryset = queryset.filter(player_1=player) | queryset.filter(player_2=player) | queryset.filter(player_3=player) | queryset.filter(player_4=player) | queryset.filter(player_5=player) | queryset.filter(player_6=player) | queryset.filter(player_7=player) | queryset.filter(player_8=player)

		if title is not None :
			queryset = queryset.filter(title=title)

		if nbr_players is not None :
				queryset = queryset.filter(nbr_players=nbr_players)

		return queryset