from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics



from django.contrib.auth import login, logout



from players_manager.serializers import LoginSerializer, UserSerializer

class LoginView(APIView):
	print("Hello from LoginView")
	permission_classes = (permissions.AllowAny,)
	
	def post(self, request, format=None):
		print("request.data : ", request.data)
		serializer = LoginSerializer(data=request.data, context = {'request': request})
		serializer.is_valid(raise_exception=True)
		user = serializer.validated_data['user']
		print("user from LoginView : ", user)
		login(request, user)
		return Response(None, status=status.HTTP_202_ACCEPTED)


class ProfileView(generics.RetrieveAPIView):
	permission_classes = (permissions.IsAuthenticated,)
	serializer_class = UserSerializer
	def get_object(self):
		print("\n\nHello from ProfileView : ", self.request.user)
		return self.request.user