from django.db.models import Q
from django.contrib.auth.models import User
from players_manager.models import Player
import datetime



from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework.views import APIView

from .models import Friend
from .serializers import FriendSerializer, UserSerializer, FriendSerializerPOST


from players_manager.models import Player
from players_manager.serializers import PlayerSerializer


class ListFriendAPIView(ListAPIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = FriendSerializer

	def get(self, request):
		Player.check_inactive_players()
		param = self.request.query_params.get('type')
		if param == "initiated" :
			initiated_serialized = FriendSerializer(Friend.objects.filter(user_initiated = self.request.user, accept = False), many =True)
			return Response(initiated_serialized.data, status=status.HTTP_200_OK)
		elif param == "received" :
			received_serialized = FriendSerializer(Friend.objects.filter(user_received = self.request.user, accept = False), many = True)
			return Response(received_serialized.data, status=status.HTTP_200_OK)
		elif param == "initiated_accpeted" :
			initiated_accepted = Friend.objects.filter(user_initiated = self.request.user.id , accept = True)
			result = []
			for o in initiated_accepted :
				player_received = Player.objects.filter(owner=o.user_received.id).first()
				result.append({"username" : o.user_received.username, "status" : player_received.status, "avatar" : player_received.avatar.url})
			return Response(result, status=status.HTTP_200_OK)
		elif param == "received_accepted" :
			received_accepted = Friend.objects.filter(user_received = self.request.user.id , accept = True)
			result = []
			for o in received_accepted :
				player_initiated = Player.objects.filter(owner=o.user_initiated.id).first()
				result.append({"username" : o.user_initiated.username, "status" : player_initiated.status, "avatar" : player_initiated.avatar.url})
			return Response(result, status=status.HTTP_200_OK)
		return Response("Missing parameter", status=status.HTTP_400_BAD_REQUEST)


class CreateFriendAPIView(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = FriendSerializerPOST

	def post(self, request):
		try :
			user_received = User.objects.get(username=request.data['username'])
		except User.DoesNotExist:
			return Response("Ce membre n'existe pas.", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)

		if user_received.id == self.request.user.id :
			return Response("Vous ne pouvez pas vous demander vous même en ami.", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)

		new_relation_data = {"user_initiated" : self.request.user.id, "user_received" : user_received.id, "accept" : False}

		serializer_new_relation = FriendSerializerPOST(data=new_relation_data)

		if serializer_new_relation.is_valid():
			relation1_already_exists = Friend.objects.filter(user_initiated=new_relation_data["user_initiated"], user_received=new_relation_data["user_received"])
			if relation1_already_exists :
				return Response("Le lien d'amitié existe déjà.", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)
			relation2_already_exists = Friend.objects.filter(user_initiated=new_relation_data["user_received"], user_received=new_relation_data["user_initiated"])
			if relation2_already_exists :
				return Response("Vous êtes déjà ami.", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)
			serializer_new_relation.save()
			return Response("Demande envoyée", status=status.HTTP_201_CREATED)

		return Response(serializer_new_relation.errors, status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)


class AcceptFriendAPIView(APIView) :
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = FriendSerializerPOST

	def patch(self, request):
		try :
			user_initiator = User.objects.get(username=self.request.data["username"])
		except User.DoesNotExist:
			return Response("Ce user n'existe pas.", status=status.HTTP_400_BAD_REQUEST)

		friendship_to_modify = Friend.objects.filter(user_initiated=user_initiator, user_received=self.request.user).first()
		if not friendship_to_modify :
			return Response("Cette relation d'amitié n'existe pas.", status=status.HTTP_400_BAD_REQUEST)

		serializer_relation = FriendSerializerPOST(friendship_to_modify, data={"accept" : True}, partial=True)
		if serializer_relation.is_valid() :
			serializer_relation.save()
		return Response ("Ami ajouté.", status=status.HTTP_200_OK)


class RefuseFriendAPIView(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = FriendSerializerPOST

	def patch(self, request):
		try :
			user_initator = User.objects.get(username=self.request.data["username"])
		except User.DoesNotExist:
			return Response("Ce user n'existe pas.", status=status.HTTP_400_BAD_REQUEST)

		friendship_refused = Friend.objects.filter(user_initiated=user_initator, user_received = self.request.user).first()
		if not friendship_refused:
			return Response("Cette relation d'amitié n'existe pas.", status=status.HTTP_400_BAD_REQUEST)

		friendship_refused.delete()
		return Response ("Lien d'amitié refusé", status=status.HTTP_200_OK)


class DeleteFriendAPIView(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = FriendSerializerPOST

	def delete(self, request) :
		try :
			former_friend = User.objects.get(username=self.request.data["username"])
		except User.DoesNotExist:
			return Response("Ce user n'existe pas.", status=status.HTTP_400_BAD_REQUEST)

		relation_to_delete = Friend.objects.filter(user_initiated = former_friend , user_received = self.request.user).first()

		if not relation_to_delete :
			relation_to_delete = Friend.objects.filter(user_initiated = self.request.user , user_received = former_friend).first()

		if not relation_to_delete :
			return Response("Aucun lien d'amitié trouvé", status=status.HTTP_400_BAD_REQUEST)
		relation_to_delete.delete()
		return Response ("Lien d'amitié supprimé", status=status.HTTP_200_OK)


class GetUserNameAPI(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = UserSerializer

	def get(self, request):
		username = self.request.user.username
		if not username :
			return Response("User issue", status=status.HTTP_400_BAD_REQUEST)
		return Response(data=username, status=status.HTTP_200_OK)