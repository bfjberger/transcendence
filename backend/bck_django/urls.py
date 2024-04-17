"""
URL configuration for bck_django project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

# from rest_framework import routers

from players_manager.views import LoginView, ProfileView, RegisterAction, IndexAction, test, TwoPlayers, FourPlayers, Tournament, Friends, LogoutView
from login_api_42 import views
# from players_manager.views import PlayerViewSet
# from players_manager.views import AdminPlayerViewSet
# from friends_manager.views import FriendViewSet
# from two_players_games_manager.views import Two_PlayerViewSet
# from tournaments_manager.views import TournamentViewSet
# from four_players_games_manager.views import Four_PlayerViewSet

# router = routers.SimpleRouter()
# router.register('players', PlayerViewSet, basename='players')
# router.register('friends', FriendViewSet, basename='friends')
# router.register('two_player', Two_PlayerViewSet, basename='two_player')
# router.register('tournaments', TournamentViewSet, basename='tournaments')
# router.register('four_player', Four_PlayerViewSet, basename='four_player')
# router.register('admin/players', AdminPlayerViewSet, basename='admin_players')

urlpatterns = [

    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('api/index/', IndexAction.as_view()),
    path('api/login/', LoginView.as_view()),
    path('api/register/', RegisterAction.as_view()),
    path('api/profile/', ProfileView.as_view()),
    # path('api/index/', IndexView.as_view()),
    path('api/test/', test.as_view()),
    # path('staticfiles/AuthenticateChoice/', ),
    path('api/twoplayer/', TwoPlayers.as_view()),
    path('api/fourplayer/', FourPlayers.as_view()),
    path('api/tournament/', Tournament.as_view()),
    path('api/friends/', Friends.as_view()),
    path('accounts/', views.accounts_view, name='accounts'),
    path('call_back/', views.callback, name='callback'),
    path('api/logout/', LogoutView.as_view()),
]
