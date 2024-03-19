from django.contrib import admin

from players_manager.models import Player

class PlayerAdmin(admin.ModelAdmin):
    list_display = ('id', 'login', 'nickname', 'nb_games_2p', 'nb_games_2p_won', 'nb_games_2p_lost','score', 'avatar')

admin.site.register(Player, PlayerAdmin)

# Register your models here.
