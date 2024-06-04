# Generated by Django 5.0.6 on 2024-05-13 14:13

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('players_manager', '0012_player_nb_points_2p'),
        ('tournament', '0005_rename_tournament_tournamentroom'),
    ]

    operations = [
        migrations.CreateModel(
            name='TournamentStats',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tournament_name', models.CharField(max_length=200)),
                ('losers', models.ManyToManyField(related_name='lost_tournaments', to='players_manager.player')),
                ('winner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='won_tournaments', to='players_manager.player')),
            ],
        ),
    ]