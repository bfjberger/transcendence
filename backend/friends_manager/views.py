from django.db.models import Q
from django.contrib.auth.models import User


from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework.views import APIView

from .models import Friend
from .serializers import FriendSerializer, UserSerializer


class ListFriendAPIView(ListAPIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = FriendSerializer
	
	def get_queryset(self):
		param = self.request.query_params.get('type')
		if param == "initiated" :
			return Friend.objects.filter(user_initiated = self.request.user)
		elif param == "received" :
			return Friend.objects.filter(user_received = self.request.user)
		else :
			return Friend.objects.filter(Q(user_received = self.request.user) | Q(user_received = self.request.user))

class CreateFriendAPIView(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = FriendSerializer

	# def post(self, request):
	# 	user_initiated = self.request.user
	# 	user_received = User.objects.get(username=self.request.data["username"])
	# 	new_friend_data = {"player_initiated" : self.request.user.id, "player_received" : user_received.id}
	# 	new_friend_serializer = FriendSerializer(data=new_friend_data)

	# 	# user_received = User.objects.get(username=self.request.data["username"])
	# 	if new_friend_serializer.is_valid() :
	# 		return Response(new_friend_serializer.data, status=status.HTTP_200_OK)

	# 	return Response(None, status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)
	def post(self, request):
		try :
			user_received = User.objects.get(username=request.data['username'])
		except :
			return Response("This member does not exists", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)

		if user_received.id == self.request.user.id :
			return Response("You can not ask yourself as friend", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)


		new_relation_data = {"user_initiated" : self.request.user.id, "user_received" : user_received.id, "accept" : False}
		serializer_new_relation = FriendSerializer(data=new_relation_data)

		if serializer_new_relation.is_valid():
			relation1_already_exists = Friend.objects.filter(user_initiated=new_relation_data["user_initiated"], user_received=new_relation_data["user_received"])
			if relation1_already_exists :
				return Response("Relation already exists", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)
			relation2_already_exists = Friend.objects.filter(user_initiated=new_relation_data["user_received"], user_received=new_relation_data["user_initiated"])
			if relation2_already_exists :
				return Response("Relation already exists", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)
			serializer_new_relation.save()
			return Response("Relation added", status=status.HTTP_201_CREATED)

		return Response("serializer not valid", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)





class AcceptFriendAPIView(UpdateAPIView) :
	pass

class DeleteFriendAPIView(DestroyAPIView) :
	pass

