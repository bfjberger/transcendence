from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics

from rest_framework.reverse import reverse_lazy

from rest_framework import serializers

from players_manager.models import Player, Friend

from django.contrib.auth import login, logout

from django.contrib.auth.models import User

from players_manager.serializers import LoginSerializer, UserSerializer, PlayerSerializer, RegisterSerializer, FriendSerializer, AvatarSerializer, DataSerializer

from rest_framework.authentication import SessionAuthentication, BasicAuthentication


from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


class IndexAction(APIView):
	permission_classes = (permissions.AllowAny,)

	def get(self, request):
		if self.request.user.is_authenticated:
			player = Player.objects.get(owner=self.request.user)
			serializer_player = PlayerSerializer(player)
			serializer_user = UserSerializer(self.request.user)
			return Response(data={"player" : serializer_player.data, "user" : serializer_user.data}, status=status.HTTP_202_ACCEPTED)

		# print(status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)
		return Response(data="Not connected", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)


class RegisterAction(APIView):
	queryset = User.objects.all()
	permission_classes = (permissions.AllowAny,)
	serializer_class = RegisterSerializer

	def post(self, request):
		serializer = RegisterSerializer(data=request.data)

		if serializer.is_valid():
			user = serializer.save()
			if user:
				return Response(serializer.data, status=status.HTTP_201_CREATED)

		return Response(serializer.errors, status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)


class LoginView(APIView):
	permission_classes = (permissions.AllowAny,)

	def post(self, request, format=None):
		# print("request.data : ", request.data)
		try:
			serializer = LoginSerializer(data=request.data, context = {'request': request})
			serializer.is_valid(raise_exception=True)
		except serializers.ValidationError:
			return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
		user = serializer.validated_data['user']
		# print("user from LoginView : ", user)
		login(request, user)
		# serializer.update_status()

		player = Player.objects.get(owner=user)
		player.status = "ONLINE"
		player.save()

		# serializer_player = PlayerSerializer(player)

		user_data = request.user
		serializer_data = DataSerializer(user_data)
		return Response(data=serializer_data.data, status=status.HTTP_202_ACCEPTED)


class LogoutView(APIView):
		authentication_classes = [SessionAuthentication, BasicAuthentication]
		permission_classes = [permissions.IsAuthenticated]

		def patch(self, request):
			player = Player.objects.get(owner=self.request.user)
			player.status = "OFFLINE"
			player.save()

			logout(request)

			return Response("Logout success", status=status.HTTP_200_OK)

# class ProfileView(generics.RetrieveAPIView):
# 	permission_classes = (permissions.IsAuthenticated,)
# 	serializer_class = PlayerSerializer
# 	def get_object(self):
# 		print("\n\nHello from ProfileView : ", self.request.user)
# 		player = Player.objects.get(owner=self.request.user)
# 		print("player from ProfileView : ", player)
# 		return player

# 	def put_object(self):
# 		print("\nHello from put_object : \n", self.request.user)
# 		return "put_object"


class ProfileView(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = PlayerSerializer

	def get(self, request):
		# player = Player.objects.get(owner=self.request.user)
		# serializer_player = PlayerSerializer(player)
		# serializer_user = UserSerializer(self.request.user)
		user_data = request.user
		serializer_data = DataSerializer(user_data)
		return Response(data=serializer_data.data, status=status.HTTP_200_OK)

	# @transaction.atomic
	# @method_decorator()
	@method_decorator(csrf_exempt, name='dispatch')
	def patch(self, request):
		try :
			player = Player.objects.get(owner=self.request.user)
		except :
			return Response(None, status=status.HTTP_400_BAD_REQUEST)

		serializer_player = PlayerSerializer(player, data=self.request.data, partial=True)

		if serializer_player.is_valid():
			serializer_player.save()
			return Response(data=serializer_player.data, status=status.HTTP_200_OK)

		return Response(data=serializer_player.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileUpdateAvatarView(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = AvatarSerializer

	def patch(self, request):
		try :
			player = Player.objects.get(owner=self.request.user)
		except :
			return Response(None, status=status.HTTP_400_BAD_REQUEST)

		serializer = AvatarSerializer(player, data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_200_OK)
		else:
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TwoPlayers(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = PlayerSerializer

	def get(self, request):
		player = Player.objects.get(owner=self.request.user)
		serializer_player = PlayerSerializer(player)
		serializer_user = UserSerializer(self.request.user)
		return Response(data={"player" : serializer_player.data, "user" : serializer_user.data}, status=status.HTTP_200_OK)


class FourPlayers(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = PlayerSerializer

	def get(self, request):
		player = Player.objects.get(owner=self.request.user)
		serializer_player = PlayerSerializer(player)
		serializer_user = UserSerializer(self.request.user)
		return Response(data={"player" : serializer_player.data, "user" : serializer_user.data}, status=status.HTTP_200_OK)


class Tournament(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = PlayerSerializer

	def get(self, request):
		player = Player.objects.get(owner=self.request.user)
		serializer_player = PlayerSerializer(player)
		serializer_user = UserSerializer(self.request.user)
		return Response(data={"player" : serializer_player.data, "user" : serializer_user.data}, status=status.HTTP_200_OK)


class Friends(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = FriendSerializer

	def get(self, request):
		current_player = Player.objects.get(owner=self.request.user)
		serializer_player = PlayerSerializer(current_player)
		serializer_user = UserSerializer(self.request.user)

		friends_as_initiator = Friend.objects.filter(player_initiated=current_player)
		friends_as_receiver = Friend.objects.filter(player_received=current_player)

		list_friends_accepted = []
		list_friends_initiator = []
		for relation in friends_as_initiator :
			user_received = relation.player_received.owner
			if relation.accept == False :
				list_friends_initiator.append(UserSerializer(user_received).data["username"])
			else :
				list_friends_accepted.append({"username" : UserSerializer(user_received).data["username"], "status" : PlayerSerializer(relation.player_received).data["status"]})

		list_friends_received = []
		for relation in friends_as_receiver :
			user_initiator = relation.player_initiated.owner
			if relation.accept == False :
				list_friends_received.append(UserSerializer(user_initiator).data["username"])
			else :
				list_friends_accepted.append({"username" : UserSerializer(user_initiator).data["username"], "status" : PlayerSerializer(relation.player_initiated).data["status"]})

		friends_as_initiator_serializer = FriendSerializer(friends_as_initiator, many=True)
		friends_as_receiver_serializer = FriendSerializer(friends_as_receiver, many=True)

		return Response(data={"friends_accepted" : list_friends_accepted, "friends_initiated" : list_friends_initiator, "friends_received" : list_friends_received ,"player" : serializer_player.data, "user" : serializer_user.data}, status=status.HTTP_200_OK)


	def post(self, request):
		try :
			user_received = User.objects.get(username=request.data['username'])
		except :
			return Response("This member does not exists", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)

		if user_received.id == self.request.user.id :
			return Response("You can not ask yourself as friend", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)


		new_relation_data = {"player_initiated" : self.request.user.id, "player_received" : user_received.id, "accept" : False}
		serializer_new_relation = FriendSerializer(data=new_relation_data)

		if serializer_new_relation.is_valid():
			relation1_already_exists = Friend.objects.filter(player_initiated=new_relation_data["player_initiated"], player_received=new_relation_data["player_received"])
			if relation1_already_exists :
				return Response("Relation already exists", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)
			relation2_already_exists = Friend.objects.filter(player_initiated=new_relation_data["player_received"], player_received=new_relation_data["player_initiated"])
			if relation2_already_exists :
				return Response("Relation already exists", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)
			serializer_new_relation.save()
			return Response("Relation added", status=status.HTTP_201_CREATED)

		return Response("serializer not valid", status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)


	def patch(self, request):
		accept_param = request.query_params.get('accept')

		if (accept_param == "True"):
			try :
				current_player = Player.objects.get(owner=self.request.user)
				user_initiator = User.objects.get(username=self.request.data["username"])
				player_initiator = Player.objects.get(owner=user_initiator)
				relation_to_modify = Friend.objects.filter(player_initiated=player_initiator, player_received=current_player)
			except :
				return Response ("Fatal error", status=status.HTTP_403_FORBIDDEN)

			serializer_relation = FriendSerializer(relation_to_modify.first(), data={"accept" : True}, partial=True)

			if serializer_relation.is_valid() :
				serializer_relation.save()
			else :
				Response("Fatal error", status=status.HTTP_403_FORBIDDEN)

		return Response(serializer_relation.data, status=status.HTTP_200_OK)

	def delete(self, request):

		try :
			current_player = Player.objects.get(owner=self.request.user)
			user_former_friend = User.objects.get(username=self.request.data["username"])
			player_former_friend = Player.objects.get(owner=user_former_friend)
		except :
			return Response ("Fatal error", status=status.HTTP_400_BAD_REQUEST)


		relation_to_delete = Friend.objects.filter (player_initiated=player_former_friend, player_received=current_player).first()
		if not relation_to_delete:
			relation_to_delete = Friend.objects.filter (player_initiated=current_player, player_received=player_former_friend).first()

		relation_to_delete.delete()


		return Response("Test delete method", status=status.HTTP_200_OK)
