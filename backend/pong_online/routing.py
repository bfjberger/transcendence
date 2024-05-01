from django.urls import re_path
from .consumers import GameConsumer
from .consumers_four import GameConsumerFour

websocket_urlpatterns = [
	re_path(r"ws/game/$", GameConsumer.as_asgi()),
	re_path(r"ws/gameFour/$", GameConsumerFour.as_asgi()),
]
