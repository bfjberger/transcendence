# Generated by Django 5.0.3 on 2024-03-20 12:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('players_manager', '0002_player_nb_games_4p_player_nb_games_4p_lost_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='status',
            field=models.CharField(choices=[('ONLINE', 'Online'), ('OFFLINE', 'Offline'), ('PLAYING', 'Playing')], default='ONLINE', max_length=200),
        ),
    ]