# Generated by Django 5.0.6 on 2024-05-13 13:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('games_manager', '0005_fourplayersgame'),
        ('players_manager', '0012_player_nb_points_2p'),
        ('tournament', '0004_remove_tournament_password_and_more'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Tournament',
            new_name='TournamentRoom',
        ),
    ]
