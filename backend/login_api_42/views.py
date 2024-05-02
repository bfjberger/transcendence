import requests
from django.core.files.base import ContentFile
from django.utils.crypto import get_random_string

from players_manager.models import Player
from players_manager.serializers import DataSerializer

from django.shortcuts import redirect
from django.contrib.auth import login
from django.contrib.auth.models import User

from django.conf import settings
from urllib.parse import urlencode
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework import status

from django.core.files.base import ContentFile
from players_manager.serializers import PlayerSerializer
from players_manager.models import Player

from django.contrib.auth import authenticate


from django.core.files import File
from urllib.request import urlopen
from tempfile import NamedTemporaryFile
from django.core.files.uploadedfile import InMemoryUploadedFile
from io import BytesIO

class Accounts_view(APIView) :

    def get(self, request):
        # Step 1: Redirect user to 42 authorization URL
        authorization_url = 'https://api.intra.42.fr/oauth/authorize' #by def, url where you can loggin ('https://api.intra.42.fr/oauth/authorize')
        redirect_uri = 'https://localhost/'  # Change to your callback URL
        params = {
            'client_id': settings.SOCIALACCOUNT_PROVIDERS['42']['KEY'],
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            # Add any additional scopes your app requires
            'scope': "public"
        }
        auth_url = '{}?{}'.format(authorization_url, urlencode(params))

        return Response(auth_url, status=status.HTTP_200_OK)

class Callback(APIView):

    def post(self, request):
        # Step 2: Receive authorization code and exchange for access token
        code = request.data["code"]
        redirect_uri = 'https://localhost/'
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

            new_password = get_random_string(length=12)
            user.set_password(new_password)
            user.save()

            if created == True :
                img_resp = requests.get(avatar)
                if img_resp.status_code != 200 :
                    print("\n\n\nimage pas downloaded\n\n\n")

                player = Player(owner=user)
                player.avatar.save(username+'.jpg', ContentFile(img_resp.content), save=False)
                player.status = "ONLINE"
                player.save()

                user_auth = authenticate(username=username, password=new_password)
                r = login(request, user_auth)

                serializer_data = DataSerializer(user_auth)
                return Response(data=serializer_data.data, status=status.HTTP_200_OK)

            user_to_login = authenticate(username=username, password=new_password)


            player = Player.objects.get(owner=user)
            player.status = "ONLINE"
            player.save()

            r = login(request, user_to_login)


            serializer_data = DataSerializer(user_to_login)
            return Response(serializer_data.data, status=status.HTTP_200_OK)

        return Response ("Error from API 42", status=status.HTTP_401_UNAUTHORIZED)


# class LoginSerializer(serializers.Serializer):
#     username = serializers.CharField(label="username")
#     password = serializers.CharField(label="password")

#     def validate(self, attrs):
#         user = authenticate(request=self.context.get('request'),username=attrs['username'],password=attrs['password'])

#         if not user:
#             raise serializers.ValidationError("Incorrect Credentials")
#         else:
#             attrs['user'] = user
#             return attrs

# class LoginView(APIView):
# 	permission_classes = (permissions.AllowAny,)

# 	def post(self, request, format=None):
# 		try:
# 			serializer = LoginSerializer(data=request.data, context = {'request': request})
# 			serializer.is_valid(raise_exception=True)
# 		except serializers.ValidationError:
# 			return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
# 		user = serializer.validated_data['user']
# 		login(request, user)

# 		player = Player.objects.get(owner=user)
# 		player.status = "ONLINE"
# 		player.save()

# 		user_data = self.request.user
# 		serializer_data = DataSerializer(user_data)
# 		return Response(data=serializer_data.data, status=status.HTTP_202_ACCEPTED)



            # # Check if the user already exists in your database
            # try:
            #     #  Assuming the current user is authenticated
            #     user = request.user
            #     Player.avatar = avatar
            #     # Save the changes
            #     user.save()
            #     player.save()
            #     # Log in the user
            #     login(request, user)
            #     # Assuming you have a custom User model named Player
            #     # User, created = User.objects.get_or_create(username=username, defaults={'avatar': xxxxxx})
            #     return redirect('login')  # Redirect to the home page after successful login
            # except Player.DoesNotExist:
            #     # Handle the case where the Player object does not exist for the user
            #     return HttpResponse('Player profile not found', status=404)
        # else:
            # Handle the case where the request to the 42 API fails
            # You might want to display an error message or redirect to a different page
            #  return redirect('/api/accounts/')  # Redirect to the accounts page with an error message