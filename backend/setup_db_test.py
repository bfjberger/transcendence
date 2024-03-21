import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bck_django.settings")
django.setup()

from players_manager.models import Player
from friends_manager.models import Friend

def main():
	player1 = Player.objects.create(login='bberger', nickname='Benoit', score=100, status='offline', avatar=None)
	player2 = Player.objects.create(login='pvong', nickname='PH', score=957, status='offline', avatar=None)
	player3 = Player.objects.create(login='fcoindre', nickname='FX', score=2, status='offline', avatar=None)
	player4 = Player.objects.create(login='kmorin', nickname='Killian', score=1, status='offline', avatar=None)

	player1.save()
	player2.save()
	player3.save()
	player4.save()

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

if __name__ == '__main__':
	main()