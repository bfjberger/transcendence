# Generated by Django 5.0.4 on 2024-04-27 18:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('players_manager', '0011_alter_player_nickname'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='nb_points_2p',
            field=models.IntegerField(default=0),
        ),
    ]
