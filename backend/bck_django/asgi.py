"""
ASGI config for bck_django project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os


from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application

from pong_online.routing import websocket_urlpatterns
from tournament.routing import tournament_websocket_urlpatterns
from friends_manager.routing import friends_websocket_urlpatterns
from pong_IA.routing import  websocket_IA_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bck_django.settings')

# application = get_asgi_application()
application = ProtocolTypeRouter(
	{
		"http": get_asgi_application(),
		"websocket": AuthMiddlewareStack(
			URLRouter(websocket_urlpatterns
						 + tournament_websocket_urlpatterns
						 + websocket_IA_urlpatterns
						 + friends_websocket_urlpatterns)
			),
	}
)
