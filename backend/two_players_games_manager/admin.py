from django.contrib import admin

from two_players_games_manager.models import Two_Players

class Two_PlayersAdmin(admin.ModelAdmin):
    list_display = ('id', 'player1', 'player2', 'score_player1', 'score_player2')

admin.site.register(Two_Players, Two_PlayersAdmin)