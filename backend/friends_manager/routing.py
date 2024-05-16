from django.urls import re_path
from . import consumers

friends_websocket_urlpatterns = [
    re_path(r'wss/notifications/(?P<username>\w+)/$', consumers.NotificationConsumer.as_asgi()),
]
