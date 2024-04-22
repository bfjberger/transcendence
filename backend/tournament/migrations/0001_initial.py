# Generated by Django 5.0.4 on 2024-04-22 13:50

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('visibility', models.CharField(choices=[('public', 'Public'), ('private', 'Private')], max_length=20)),
                ('password', models.CharField(blank=True, max_length=100, null=True)),
            ],
        ),
    ]
