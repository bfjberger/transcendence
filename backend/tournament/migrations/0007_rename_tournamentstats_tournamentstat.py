# Generated by Django 5.0.6 on 2024-05-13 14:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('players_manager', '0012_player_nb_points_2p'),
        ('tournament', '0006_tournamentstats'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='TournamentStats',
            new_name='TournamentStat',
        ),
    ]
