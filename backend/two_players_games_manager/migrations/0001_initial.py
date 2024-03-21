# Generated by Django 5.0.3 on 2024-03-20 16:20

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Two_Players',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player1', models.CharField(max_length=200)),
                ('player2', models.CharField(max_length=200)),
                ('score_player1', models.IntegerField(default=0)),
                ('score_player2', models.IntegerField(default=0)),
                ('score_max', models.IntegerField(default=5)),
                ('win_player', models.CharField(max_length=200)),
                ('id_tournament', models.IntegerField(default=0)),
                ('level', models.IntegerField(default=0)),
            ],
        ),
    ]
