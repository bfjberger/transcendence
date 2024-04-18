from django.contrib import admin

# Register your models here.

from players_manager.models import Player

from players_manager.models import Friend

class PlayerAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner')

admin.site.register(Player, PlayerAdmin)

class FriendsAdmin(admin.ModelAdmin):
    list_display = ('id', 'player_initiated', 'player_received', 'accept')

admin.site.register(Friend, FriendsAdmin)
