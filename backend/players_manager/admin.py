from django.contrib import admin

from players_manager.models import Player

class PlayerAdmin(admin.ModelAdmin):
    list_display = ('id', 'nickname', 'score', 'status', 'avatar')

admin.site.register(Player, PlayerAdmin)

