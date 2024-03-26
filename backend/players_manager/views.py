from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action


from players_manager.models import Player
from players_manager.serializers import PlayerSerializer, PlayerDetailsSerializer, AdminPlayerSerializer

class PlayerViewSet(ModelViewSet):

	serializer_class = PlayerSerializer
	detail_serializer_class = PlayerDetailsSerializer

	def get_queryset(self):
			return Player.objects.all()

	#REDEFINITION DE LA METHODE GET_SERIALIZER_CLASS
	def get_serializer_class(self):
			print("get_serializer_class", self.action)
			if self.action =='retrieve':
					return self.detail_serializer_class
			return self.serializer_class

	@action(methods=['GET'], detail=True)
	def modify_nickname(self, request, pk):
			new_nickname = self.request.GET.get('new_nickname')
			if new_nickname is not None:
					current_player = self.get_object()
					current_player.nickname = new_nickname
					current_player.save()
					return Response(status=200)
			return Response(status=404)
	
	def call_extarnal_api(self, method, url):
		return resquests.request(method, url)	


class AdminPlayerViewSet(ModelViewSet) :
	serializer_class = AdminPlayerSerializer
	def get_queryset(self):
			return Player.objects.all()