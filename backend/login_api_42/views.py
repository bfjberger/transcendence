import requests
from urllib.parse import urlencode

from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.utils.crypto import get_random_string

from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework import status

from players_manager.models import Player
from players_manager.serializers import DataSerializer

class Accounts_view(APIView) :
	permission_classes = (permissions.AllowAny,)

	def get(self, request):
		# Step 1: Redirect user to 42 authorization URL
		authorization_url = 'https://api.intra.42.fr/oauth/authorize' #by def, url where you can loggin ('https://api.intra.42.fr/oauth/authorize')
		redirect_uri = settings.CSRF_TRUSTED_ORIGINS[0] + "/"  # Change to your callback URL
		# redirect_uri = settings.CSRF_TRUSTED_ORIGINS[2] + "/"  # Change to your callback URL
		# print("\n\n", settings.CSRF_TRUSTED_ORIGINS[2] + "/", "\n\n\n")

		params = {
			'client_id': settings.SOCIALACCOUNT_PROVIDERS['42']['KEY'],
			'redirect_uri': redirect_uri,
			'response_type': 'code',

			'scope': "public"
		}
		auth_url = '{}?{}'.format(authorization_url, urlencode(params))

		return Response(auth_url, status=status.HTTP_200_OK)

class Callback(APIView):
	permission_classes = (permissions.AllowAny,)

	def post(self, request):
		# Step 2: Receive authorization code and exchange for access token
		code = request.data["code"]
		# redirect_uri = settings.CSRF_TRUSTED_ORIGINS[2] + "/"
		redirect_uri = settings.CSRF_TRUSTED_ORIGINS[0] + "/"
		token_url = 'https://api.intra.42.fr/oauth/token'
		data = {
			'client_id': settings.SOCIALACCOUNT_PROVIDERS['42']['KEY'],
			'client_secret': settings.SOCIALACCOUNT_PROVIDERS['42']['SECRET'],
			'code': code,
			'redirect_uri': redirect_uri,
			'grant_type': 'authorization_code',
			'scope': "public profile"
		}

		response = requests.post(token_url, data=data)
		token_data = response.json()

		# Step 3: Use access token to access 42 API
		access_token = token_data.get('access_token')

		# Now you can use the access_token to make requests to the 42 API
		# Make a request to the 42 API to retrieve user details
		response = requests.get('https://api.intra.42.fr/v2/me', headers={'Authorization': f'Bearer {access_token}'})

		if response.status_code == 200:
			user_data = response.json()
			username = user_data.get('login')
			avatar = user_data.get('image')["link"]
			email = user_data.get('email')

			user, created = User.objects.get_or_create(username=username,defaults={'email': email})


			if created == True :
				img_resp = requests.get(avatar)

				if img_resp.status_code != 200 :
					img_resp = "staticfiles/avatars/avatar.png"

				new_password = get_random_string(length=12)
				user.set_password(new_password)
				user.save()

				new_player = Player(owner=user)
				new_player.avatar.save(username+'.jpg', ContentFile(img_resp.content), save=False)
				new_player.status = "ONLINE"
				new_player.nickname = username
				new_player.save()
				user_auth = authenticate(username=username, password=new_password)
				r = login(request, user_auth)
				serializer_data = DataSerializer(user_auth)
				return Response(data=serializer_data.data, status=status.HTTP_200_OK)
			else :

				try:
					player = Player.objects.get(owner=user)
				except Player.DoesNotExist:
					return Response("Player does not exist", status=status.HTTP_404_NOT_FOUND)
				except Player.MultipleObjectsReturned:
					return Response("Multiple players found", status=status.HTTP_400_BAD_REQUEST)

				if (player.status == "ONLINE" or player.status == "PLAYING"):
					return Response("L'utilisateur est déjà loggé.", status=status.HTTP_401_UNAUTHORIZED)

				new_password2 = get_random_string(length=12)
				user.set_password(new_password2)
				user.save()

				player.status = "ONLINE"
				player.save()
				user_to_login = authenticate(username=username, password=new_password2)
				r = login(request, user_to_login)
				serializer_data = DataSerializer(user_to_login)
				return Response(serializer_data.data, status=status.HTTP_200_OK)

		return Response ("Error from API 42", status=status.HTTP_401_UNAUTHORIZED)
