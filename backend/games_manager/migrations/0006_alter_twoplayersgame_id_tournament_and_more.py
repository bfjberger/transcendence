# Generated by Django 5.0.6 on 2024-05-20 12:25

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games_manager', '0005_fourplayersgame'),
        ('tournament', '0008_remove_tournamentroom_owner_tournamentroom_started'),
    ]

    operations = [
        migrations.AlterField(
            model_name='twoplayersgame',
            name='id_tournament',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='id_tournament', to='tournament.tournamentstat'),
        ),
        migrations.AlterField(
            model_name='twoplayersgame',
            name='level',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
