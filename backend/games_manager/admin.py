from django.contrib import admin

from games_manager.models import TwoPlayersGame

class TwoPlayersGameAdmin(admin.ModelAdmin):
	list_display = ("user1", "user2", "date")

admin.site.register(TwoPlayersGame, TwoPlayersGameAdmin)