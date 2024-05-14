from django.urls import re_path

from .consumers import RoomConsumer

websocket_IA_urlpatterns = [
	re_path(r"wss/gameIA/$", RoomConsumer.as_asgi()),
]