from django.urls import re_path
from . import views
from . import consumers

tournament_websocket_urlpatterns = [
	re_path(r'wss/tournament/(?P<tournament_name>\w+)/$', consumers.TournamentConsumer.as_asgi()),
]