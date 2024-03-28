from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated


from rest_framework import status
from rest_framework.authtoken.models import Token
# from django.contrib.auth.models import User
from .models import Player
from django.shortcuts import get_object_or_404


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
	

@api_view(['POST'])
def login(request):
	user = get_object_or_404(Player, username=request.data['username'])
	if not user.check_password(request.data['password']):
		return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
	token, created = Token.objects.get_or_create(user=user)
	serializer = PlayerSerializer(instance=user)
	return Response({"token": token.key, "user": serializer.data})

@api_view(['POST'])
def signup(request):
	serializer = PlayerSerializer(data=request.data)

	if serializer.is_valid():
		serializer.save()
		user = Player.objects.get(username=request.data['username'])
		# check if password is a hached password for obvious security reason
		user.set_password(request.data['password'])
		user.save()
		token = Token.objects.create(user=user)
		return Response({"token": token.key, "user": serializer.data})
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def test_token(request):
	return Response("passed for {}".format(request.user.email))