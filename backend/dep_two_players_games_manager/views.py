from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from two_players_games_manager.models import Two_Player
from two_players_games_manager.serializers import Two_PlayerSerializer


class Two_PlayerViewSet(ModelViewSet):
    serializer_class = Two_PlayerSerializer
    def get_queryset(self):
        queryset = Two_Player.objects.all()

        player = self.request.GET.get('player')
        player1 = self.request.GET.get('player1')
        player2 = self.request.GET.get('player2')
        score_player1 = self.request.GET.get('score_player1')
        score_player2 = self.request.GET.get('score_player2')
        score_max = self.request.GET.get('score_max')
        win_player = self.request.GET.get('win_player')
        id_tournament = self.request.GET.get('id_tournament')
        level = self.request.GET.get('level')
        date = self.request.GET.get('date')
       
        if player is not None:
            queryset = queryset.filter(player1 = player) | queryset.filter(player2= player)
            print("player", queryset)

        if player1 is not None:
            queryset = queryset.filter(player1 = player1)

        if player2 is not None:
            print("player_2", queryset)
            queryset = queryset.filter(player2 = player2)
            print("player_2", queryset)

        if score_player1 is not None:
            queryset = queryset.filter(score_player1 = score_player1)

        if score_player2 is not None:
            queryset = queryset.filter(score_player2 = score_player2)

        if win_player is not None:
            queryset = queryset.filter(win_player = win_player) 
        
        if id_tournament is not None:
            queryset = queryset.filter(id_tournament = id_tournament) 
        
        if level is not None:
            queryset = queryset.filter(level = level) 

        if date is not None:
            queryset = queryset.filter(date = date) 

        return queryset
