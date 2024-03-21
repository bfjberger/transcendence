from django.contrib import admin

from tournaments_manager.models import Tournament

class TournamentAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'nbr_players')

admin.site.register(Tournament, TournamentAdmin)
