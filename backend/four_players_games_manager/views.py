from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

# Create your views here.
from four_players_games_manager.models import Four_Player
from four_players_games_manager.serializers import Four_PlayerSerializer


class Four_PlayerViewSet(ModelViewSet):
    serializer_class = Four_PlayerSerializer
    def get_queryset(self):
        queryset = Four_Player.objects.all()

        player = self.request.GET.get('player')
        player1 = self.request.GET.get('player1')
        player2 = self.request.GET.get('player2')
        player3 = self.request.GET.get('player3')
        player4 = self.request.GET.get('player4')
        score_player1 = self.request.GET.get('score_player1')
        score_player2 = self.request.GET.get('score_player2')
        score_player3 = self.request.GET.get('score_player3')
        score_player4 = self.request.GET.get('score_player4')
        score_max = self.request.GET.get('score_max')
        win_player = self.request.GET.get('win_player')
        
       
        if player is not None:
            queryset = queryset.filter(player1 = player) | queryset.filter(player2= player) | queryset.filter(player3 = player) | queryset.filter(player4 = player)

        if player1 is not None:
            queryset = queryset.filter(player1 = player1)

        if player2 is not None:
            queryset = queryset.filter(player2 = player2)

        if player3 is not None:
            queryset = queryset.filter(player3 = player3)

        if player4 is not None:
            queryset = queryset.filter(player4 = player4)


        if score_player1 is not None:
            queryset = queryset.filter(score_player1 = score_player1)

        if score_player2 is not None:
            queryset = queryset.filter(score_player2 = score_player2)

        if score_player3 is not None:
            queryset = queryset.filter(score_player3 = score_player3)

        if score_player4 is not None:
            queryset = queryset.filter(score_player4 = score_player4)

        if score_max is not None:
            queryset = queryset.filter(score_max = score_max) 

        if win_player is not None:
            queryset = queryset.filter(win_player = win_player) 
        
        
        return queryset
