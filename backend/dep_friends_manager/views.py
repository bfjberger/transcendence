from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from friends_manager.models import Friend
from friends_manager.serializers import FriendSerializer

class FriendViewSet(ModelViewSet):
	serializer_class = FriendSerializer

	def get_queryset(self):
		queryset = Friend.objects.all()

		player = self.request.GET.get('player')
		accept = self.request.GET.get('accept')
		test = self.request.GET.get('test')

		if player is not None:
			queryset = queryset.filter(player_1=player) | queryset.filter(player_2=player)

		if accept is not None:
			queryset = queryset.filter(accept=accept)

		return queryset
