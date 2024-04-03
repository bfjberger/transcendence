from django.contrib import admin

from friends_manager.models import Friend

class FriendsAdmin(admin.ModelAdmin):
    list_display = ('id', 'player_1', 'player_2', 'accept')

admin.site.register(Friend, FriendsAdmin)
