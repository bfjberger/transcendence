# Generated by Django 5.0.4 on 2024-04-25 08:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('players_manager', '0009_player_nb_points_4p'),
    ]

    operations = [
        migrations.AlterField(
            model_name='player',
            name='nickname',
            field=models.CharField(default='bob', max_length=20),
        ),
    ]
