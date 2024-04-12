import requests
from django.shortcuts import redirect
from django.contrib.auth import login
from django.conf import settings
from urllib.parse import urlencode
from django.http import JsonResponse


def accounts_view(request):
    # Step 1: Redirect user to 42 authorization URL
    authorization_url = 'https://api.intra.42.fr/oauth/authorize' #by def, url where you can loggin ('https://api.intra.42.fr/oauth/authorize')
    redirect_uri = 'http://127.0.0.1:7890/call_back'  # Change to your callback URL
    params = {
        'client_id': settings.SOCIALACCOUNT_PROVIDERS['42']['KEY'],
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        # Add any additional scopes your app requires
        'scope': "public profile"
    }
    auth_url = '{}?{}'.format(authorization_url, urlencode(params))
    return redirect(auth_url)

def callback(request):
    # Step 2: Receive authorization code and exchange for access token
    code = request.GET.get('code')
    print(code)
    redirect_uri = 'http://127.0.0.1:7890/call_back'  # Change to your callback URL 
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
    print(token_data)

    # Step 3: Use access token to access 42 API
    access_token = token_data.get('access_token')
    # Now you can use the access_token to make requests to the 42 API
    print(access_token)
    

    # Make a request to the 42 API to retrieve user details
    response = requests.get('https://api.intra.42.fr/v2/me', headers={'Authorization': f'Bearer {access_token}'})
    print(response)
    if response.status_code == 200:
        user_data = response.json()
        return JsonResponse(user_data)
    
        # maintenat je dois remplir dans la base les infos du user
        # username = user_data.get('login')
        # email = user_data.get('email')
        
        # Check if the user already exists in your database
        # Assuming you have a custom User model named Player
        # User, created = User.objects.get_or_create(username=username, defaults={'email': email})
        
        # Log in the user
        # login(request, user)
        
        # return redirect('home')  # Redirect to the home page after successful login
    else:
        # Handle the case where the request to the 42 API fails
        # You might want to display an error message or redirect to a different page
        return redirect('accounts')  # Redirect to the accounts page with an error message