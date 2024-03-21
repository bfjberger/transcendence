from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from tournaments_manager.models import Tournament
from tournaments_manager.serializers import TournamentSerializer

class TournamentViewSet(ModelViewSet):
	serializer_class = TournamentSerializer

	def get_queryset(self):
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