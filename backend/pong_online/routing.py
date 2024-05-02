from django.urls import re_path

from .consumers import RoomConsumer
from .consumers_four import RoomConsumerFour

websocket_urlpatterns = [
	re_path(r"ws/gameTwo/$", RoomConsumer.as_asgi()),
	re_path(r"ws/gameFour/$", RoomConsumerFour.as_asgi()),
]