from django.contrib import admin

# Register your models here.

from .models import TournamentRoom, TournamentStat
from players_manager.models import Player
from django.contrib.auth.models import User

class TournamentAdmin(admin.ModelAdmin):
	list_display = ("name", "players_list", "started")

	def players_list(self, obj):
		return ", ".join([str(player.id) for player in obj.players.all()])
		# return ", ".join([player.nickname for player in obj.players.all()])
	players_list.short_description = "Players"

admin.site.register(TournamentRoom, TournamentAdmin)

class TournamentStatsAdmin(admin.ModelAdmin):
	list_display = ("tournament_name", "winner", "losers_list")

	def losers_list(self, obj):
		return ", ".join([str(player.owner.username) for player in obj.losers.all()])
	losers_list.short_description = "Losers"

admin.site.register(TournamentStat, TournamentStatsAdmin)
