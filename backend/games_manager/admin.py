from django.contrib import admin

from .models import Game

class GameAdmin(admin.ModelAdmin):
	list_display = ("players_list", "date")

	def players_list(self, obj):
		return " vs ".join([str(player.id) for player in obj.players.all()])
	players_list.short_description = "Players"

admin.site.register(Game, GameAdmin)
