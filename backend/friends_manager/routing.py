from django.urls import re_path
from . import consumers

friends_websocket_urlpatterns = [
    re_path(r'wss/notifications/(?P<username>[a-zA-Z0-9._-]+)/$', consumers.NotificationConsumer.as_asgi()),
]
