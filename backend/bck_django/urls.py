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

from django.conf.urls.static import static
from django.conf import settings

from rest_framework import routers

from players_manager.views import (LoginView, ProfileView, RegisterAction,
								    IndexAction, TwoPlayers, FourPlayers,
									Tournament, LogoutView, ProfileUpdateAvatarView,
									UpdateStatus, Statistiques, ProfileUpdatePassword)
from tournament.views import TournamentOnline

from login_api_42.views import Accounts_view, Callback

from games_manager.views import ListTwoPlayersGamesAPIView, CreateTwoPlayersGamesAPIView, ListFourPlayersGamesAPIView

from tournament.views import TournamentViewSet, PlayerViewSet

from pong_online.views import TwoPlayersOnlineView, FourPlayersOnlineView


from friends_manager.views import ListFriendAPIView, CreateFriendAPIView, AcceptFriendAPIView, RefuseFriendAPIView, DeleteFriendAPIView, GetUserNameAPI


from pong_IA.views import Pong_IAView
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

router = routers.DefaultRouter()
router.register(r'tournaments', TournamentViewSet, basename='tournaments')

urlpatterns = [

    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('api/index/', IndexAction.as_view()),
    path('api/login/', LoginView.as_view()),
    path('api/logout/', LogoutView.as_view()),
    path('api/register/', RegisterAction.as_view()),
    path('api/profile/', ProfileView.as_view()),
	path('api/updatepassword/', ProfileUpdatePassword.as_view()),
    # path('api/index/', IndexView.as_view()),
    # path('staticfiles/AuthenticateChoice/', ),
    path('api/twoplayer/', TwoPlayers.as_view()),
    path('api/fourplayer/', FourPlayers.as_view()),
    path('api/tournament/', Tournament.as_view()),
    path('api/stats/', Statistiques.as_view()),

    path('api/friends/', ListFriendAPIView.as_view()),
    path('api/friends/create/', CreateFriendAPIView.as_view()),
    path('api/friends/accept/', AcceptFriendAPIView.as_view()),
    path('api/friends/refuse/', RefuseFriendAPIView.as_view()),
    path('api/friends/delete/', DeleteFriendAPIView.as_view()),
    path('api/friends/getUserName/', GetUserNameAPI.as_view()),

    path('api/logout/', LogoutView.as_view()),
    path('api/updateavatar/', ProfileUpdateAvatarView.as_view()),

    path('api/gamehistory/', ListTwoPlayersGamesAPIView.as_view()),
    path('api/gametwoplayercreate/', CreateTwoPlayersGamesAPIView.as_view()),
    path('api/gamehistoryfour/', ListFourPlayersGamesAPIView.as_view()),

    path('api/call_back/', Callback.as_view(), name='callback'),
    path('api/accounts/', Accounts_view.as_view(), name='accounts'),
    path('api/', include(router.urls)),
    path('api/tournaments/<str:tournament_name>/players/', PlayerViewSet.as_view({'get': 'list'}), name='tournament-players'),

    path('api/twoplayeronline/', TwoPlayersOnlineView.as_view()),
    path('api/fourplayeronline/', FourPlayersOnlineView.as_view()),

    path('api/tournamentOnline/', TournamentOnline.as_view()),

    path('api/changestatus/', UpdateStatus.as_view()),

    path('api/pong_IA/', Pong_IAView.as_view()),



]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
