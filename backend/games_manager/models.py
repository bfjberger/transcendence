from django.db import models

from django.contrib.auth.models import User

from django.contrib.postgres.fields import ArrayField

from django.utils import timezone

from players_manager.models import Player

from tournament.models import TournamentStat

class TwoPlayersGame(models.Model):
	# user1 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='user1')
	# user2 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='user2')
	players = models.ManyToManyField(Player, related_name='players')
	scores = ArrayField(models.IntegerField(default=0), null=True, blank=True)
	scores_test = models.JSONField(null=True, blank=True)
	# score_user1 = models.IntegerField(default=0)
	# score_user2 = models.IntegerField(default=0)
	# score_max = models.IntegerField(default=3)
	win_player = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, related_name='win_player')
	id_tournament = models.ForeignKey(TournamentStat, on_delete=models.SET_NULL, null=True, blank = True, related_name='id_tournament')
	id_name = models.CharField(max_length=100, null=True, blank=True)
	level = models.CharField(max_length=100, null=True, blank=True)
	date =  models.DateTimeField(default=timezone.now)

	def __str__(self):
		return " vs ".join([str(player.id) for player in self.players.all()])

	def add_player(self, player):
		self.date = timezone.now()
		self.save()
		self.players.add(player)

	def result(self, scores, scores_dict, winner):
		self.scores = scores
		self.scores_test = scores_dict
		self.win_player = winner
		self.date = timezone.now()
		self.save()

	# def create(self, player_1, player_2):
	# 	self.user1 = player_1.owner
	# 	self.user2 = player_2.owner
	# 	self.date = timezone.now()
	# 	self.save()

	# def result(self, winner, score_1, score_2):
	# 	self.score_user1 = score_1
	# 	self.score_user2 = score_2
	# 	self.win_player = winner.owner
	# 	self.date = timezone.now()
	# 	self.save()

class FourPlayersGame(models.Model):
	user1 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='user1_4')
	user2 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='user2_4')
	user3 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='user3_4')
	user4 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='user4_4')
	score_user1 = models.IntegerField(default=0)
	score_user2 = models.IntegerField(default=0)
	score_user3 = models.IntegerField(default=0)
	score_user4 = models.IntegerField(default=0)
	score_max = models.IntegerField(default=3)
	win_player = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='win_player_4')
	date = models.DateTimeField(default=timezone.now)

	def __str__(self):
		return f"{self.user1} vs {self.user2} vs {self.user3} vs {self.user4}"

	def result(self, winner, player_1, player_2, player_3, player_4):
		self.user1 = player_1.player_model.owner
		self.user2 = player_2.player_model.owner
		self.user3 = player_3.player_model.owner
		self.user4 = player_4.player_model.owner
		self.score_user1 = player_1.score
		self.score_user2 = player_2.score
		self.score_user3 = player_3.score
		self.score_user4 = player_4.score
		self.win_player = winner.owner
		self.date = timezone.now()
		self.save()
