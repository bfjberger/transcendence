from django.utils import timezone
from players_manager.models import Player

class LastActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            player = Player.objects.get(owner=request.user)
            player.last_activity = timezone.now()
            player.save()

        response = self.get_response(request)

        return response