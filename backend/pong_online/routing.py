from django.urls import re_path

from .consumers import GameConsumer
from .consumers_four import GameConsumerFour

websocket_urlpatterns = [
	re_path(r"wss/gameTwo/$", GameConsumer.as_asgi()),
	re_path(r"wss/gameFour/$", GameConsumerFour.as_asgi()),
]
