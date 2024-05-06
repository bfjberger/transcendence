from django.contrib import admin

# Register your models here.

from .models import Tournament

class TournamentAdmin(admin.ModelAdmin):
	list_display = ("name", "players_list")

	def players_list(self, obj):
		return ", ".join([str(player.id) for player in obj.players.all()])
		# return ", ".join([player.nickname for player in obj.players.all()])
	players_list.short_description = "Players"

admin.site.register(Tournament, TournamentAdmin)
