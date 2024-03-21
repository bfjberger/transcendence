from django.contrib import admin

# Register your models here.
from four_players_games_manager.models import Four_Player

class Four_PlayerAdmin(admin.ModelAdmin):
    list_display = ('id', 'player1', 'player2', 'player3', 'player4', 'score_player1', 'score_player2', 'score_player3', 'score_player4', 'score_max', 'win_player')

admin.site.register(Four_Player, Four_PlayerAdmin)