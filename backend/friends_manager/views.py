from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from friends_manager.models import Friend
from friends_manager.serializers import FriendSerializer

class FriendViewSet(ModelViewSet):
	serializer_class = FriendSerializer
	#queryset = Friend.objects.all()
	def get_queryset(self):
		queryset = Friend.objects.all()

		player = self.request.GET.get('player')
		accept = self.request.GET.get('accept')
		test = self.request.GET.get('test')

		if player is not None:
			queryset = queryset.filter(player_1=player) | queryset.filter(player_2=player)

		if accept is not None:
			queryset = queryset.filter(accept=accept)

		#if test is not None:
		#	essai = Friend.objects.get(id=test)
		#	print(essai.player_1.login)
			# return essai.player_1
		#	queryset = queryset.filter(player_1=1)
		#	n = queryset.player_1.all()
		#	return n

		# queryset = queryset.filter(player_1=player)
		#player_1 = self.request.query_params.get('player_1', None)
		return queryset

