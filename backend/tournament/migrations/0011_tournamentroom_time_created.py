# Generated by Django 5.0.6 on 2024-05-22 13:01

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0010_tournamentstat_twoplayersgame'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournamentroom',
            name='time_created',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
