import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bck_django.settings")
django.setup()

from players_manager.models import Player

def main();
	player1 = Player.objects.create(login='bberger', nickname='Benoit', score=100, status='offline', avatar=None)
	player2 = Player.objects.create(login='pvong', nickname='PH', score=957, status='offline', avatar=None)
	player3 = Player.objects.create(login='fcoindre', nickname='FX', score=2, status='offline', avatar=None)
	player4 = Player.objects.create(login='kmorin', nickname='Killian', score=1, status='offline', avatar=None)

	player1.save()
	player2.save()
	player3.save()
	player4.save()

if __name__ == '__main__':
	main()