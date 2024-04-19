import requests
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

from players_manager.serializers import PlayerSerializer
from players_manager.models import Player


from django.core.files import File
from urllib.request import urlopen
from tempfile import NamedTemporaryFile

class Accounts_view(APIView) :
    
    def get(self, request):
        # Step 1: Redirect user to 42 authorization URL
        authorization_url = 'https://api.intra.42.fr/oauth/authorize' #by def, url where you can loggin ('https://api.intra.42.fr/oauth/authorize')
        redirect_uri = 'http://127.0.0.1:7890/api/call_back/'  # Change to your callback URL
        params = {
            'client_id': settings.SOCIALACCOUNT_PROVIDERS['42']['KEY'],
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            # Add any additional scopes your app requires
            'scope': "public profile"
        }
        auth_url = '{}?{}'.format(authorization_url, urlencode(params))

        # print("auth_url", auth_url)

        return Response(auth_url, status=status.HTTP_200_OK)

class Callback(APIView):

    def get(self, request):
        # Step 2: Receive authorization code and exchange for access token


        code = request.GET.get('code')

        redirect_uri = 'http://127.0.0.1:7890/api/call_back/'  # Change to your callback URL 
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
            # return JsonResponse(user_data)
        
            # maintenat je dois remplir dans la base les infos du user
            username = user_data.get('login')
            avatar = user_data.get('image')["link"]
            email = user_data.get('email')

            print("\n\n\n", avatar, "\n")


            # check if user exists, if not it creates it
            user, created = User.objects.get_or_create(username=username,defaults={'email': email})
            print("User", user, "\n created", created)

            if created == True :
                # img_response = urlopen("https://cdn.intra.42.fr/users/a3eca96cd935a5060ab7df17749561d1/bberger.jpg")
                # img_temp = NamedTemporaryFile(delete=True)
                # img_temp.write(img_response.read())
                # img_temp.flush()

                player_data = {
                    'owner': user.id,
                }

                player_serializer = PlayerSerializer(data=player_data)


                if player_serializer.is_valid() :
                    player_serializer.save()
                else :
                    print("Eh ba non c est pas si simple que ça\n\n\n\n")


            return Response(None, status=status.HTTP_200_OK)
            
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