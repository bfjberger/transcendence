from rest_framework import permissions, status

from rest_framework.views import APIView

from rest_framework.authentication import SessionAuthentication, BasicAuthentication

from rest_framework.response import Response

from players_manager.serializers import DataSerializer

class TwoPlayersOnlineView(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		user_data = request.user
		serializer_data = DataSerializer(user_data)
		return Response(data=serializer_data.data, status=status.HTTP_200_OK)

class FourPlayersOnlineView(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		user_data = request.user
		serializer_data = DataSerializer(user_data)
		return Response(data=serializer_data.data, status=status.HTTP_200_OK)