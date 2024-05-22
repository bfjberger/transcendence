from django.utils import timezone
from players_manager.models import Player

from django.contrib.auth import logout

class LastActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            player = Player.objects.get(owner=request.user)
            if player.status == 'ONLINE' and (timezone.now() - player.last_activity).total_seconds() > 60 * 5:
                player.status = "OFFLINE"
                player.save()
                logout(request)
            else:
                player.last_activity = timezone.now()
                player.save()

        response = self.get_response(request)

        return response