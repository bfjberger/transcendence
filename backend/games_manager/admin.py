from django.contrib import admin

from games_manager.models import TwoPlayersGame, FourPlayersGame

class TwoPlayersGameAdmin(admin.ModelAdmin):
	list_display = ("players_list", "date")

	def players_list(self, obj):
		return " vs ".join([str(player.id) for player in obj.players.all()])
	players_list.short_description = "Players"

class FourPlayersGameAdmin(admin.ModelAdmin):
	list_display = ("user1", "user2", "user3", "user4", "date")

admin.site.register(TwoPlayersGame, TwoPlayersGameAdmin)
admin.site.register(FourPlayersGame, FourPlayersGameAdmin)