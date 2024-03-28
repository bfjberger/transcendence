import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bck_django.settings")
django.setup()

from players_manager.models import Player
from friends_manager.models import Friend
from two_players_games_manager.models import Two_Player
from tournaments_manager.models import Tournament

def main():
	player1 = Player.objects.create(login='bberger', nickname='Benoit', score=100, status='offline', avatar=None)
	player2 = Player.objects.create(login='pvong', nickname='PH', score=957, status='offline', avatar=None)
	player3 = Player.objects.create(login='fcoindre', nickname='FX', score=2, status='offline', avatar=None)
	player4 = Player.objects.create(login='kmorin', nickname='Killian', score=1, status='offline', avatar=None)

	player5 = Player.objects.create(login='myanez-p', nickname='Melanie', score=54, status='offline', avatar=None)
	player6 = Player.objects.create(login='rrouille', nickname='Raphael', score=5, status='offline', avatar=None)
	player7 = Player.objects.create(login='ckarl', nickname='Christina', score=202, status='offline', avatar=None)
	player8 = Player.objects.create(login='jdefayes', nickname='Julie', score=178, status='offline', avatar=None)

	player1.save()
	player2.save()
	player3.save()
	player4.save()
	player5.save()
	player6.save()
	player7.save()
	player8.save()

	friend1 = Friend.objects.create(player_1=player1, player_2=player2, accept=True)
	friend2 = Friend.objects.create(player_1=player1, player_2=player3, accept=False)
	friend3 = Friend.objects.create(player_1=player1, player_2=player4, accept=True)
	friend4 = Friend.objects.create(player_1=player2, player_2=player3, accept=False)
	friend5 = Friend.objects.create(player_1=player2, player_2=player4, accept=True)
	friend6 = Friend.objects.create(player_1=player3, player_2=player4, accept=False)

	friend1.save()
	friend2.save()
	friend3.save()
	friend4.save()

	tournament1 = Tournament.objects.create(title='tournament1', player_1=player1, player_2=player2, player_3=player3, player_4=player4, player_5=player5, player_6=player6, player_7=player7, player_8=player8, nbr_players=8)
	tournament2 = Tournament.objects.create(title='tournament2', player_1=player1, player_2=player2, player_3=player3, player_4=player4, player_5=player5, player_6=player6, player_7=player7, player_8=player8, nbr_players=8)
	tournament1.save()
	tournament2.save()

	game_2p1 = Two_Player.objects.create(player1=player1, player2=player2, score_player1=2, score_player2=3, score_max=5, win_player=player2, id_tournament=tournament1, level=1, date='2024-03-05T19:31:00Z')
	game_2p2 = Two_Player.objects.create(player1=player1, player2=player3, score_player1=2, score_player2=3, score_max=5, win_player=player3, id_tournament=tournament1, level=2, date='2024-03-05T19:31:00Z')
	game_2p3 = Two_Player.objects.create(player1=player1, player2=player4, score_player1=2, score_player2=3, score_max=5, win_player=player4, id_tournament=tournament1, level=3, date='2024-03-05T19:31:00Z')
	game_2p4 = Two_Player.objects.create(player1=player2, player2=player3, score_player1=2, score_player2=3, score_max=5, win_player=player3, id_tournament=tournament2, level=2, date='2021-03-05T19:31:00Z')

	game_2p1.save()
	game_2p2.save()
	game_2p3.save()
	game_2p4.save()

if __name__ == '__main__':
	main()