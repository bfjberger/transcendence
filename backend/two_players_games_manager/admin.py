from django.contrib import admin

from two_players_games_manager.models import Two_Player

class Two_PlayerAdmin(admin.ModelAdmin):
    list_display = ('id', 'player1', 'player2', 'score_player1', 'score_player2', 'win_player', 'id_tournament', 'level', 'date')

admin.site.register(Two_Player, Two_PlayerAdmin)