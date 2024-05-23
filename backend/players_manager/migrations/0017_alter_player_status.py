# Generated by Django 5.0.6 on 2024-05-23 12:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('players_manager', '0016_alter_player_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='player',
            name='status',
            field=models.CharField(choices=[('ONLINE', 'Online'), ('OFFLINE', 'Offline'), ('PLAYING', 'Playing')], default='OFFLINE', max_length=200),
        ),
    ]