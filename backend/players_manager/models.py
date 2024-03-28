from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

#class PlayerSuperUserCreator(BaseUserManager):

#	def create_user(self, email, password=None, **extra_fields):
#			email = self.normalize_email(email)
#		user = self.model(email=email, **extra_fields)
#			user.set_password(password)
#			user.save(using=self._db)
#			return user

#	def create_superuser(self, username, password, **extra_fields):
#		extra_fields.setdefault('is_staff', True)
#		extra_fields.setdefault('is_superuser', True)
#		extra_fields.setdefault('is_active', True)
#		extra_fields.setdefault('is_admin', True)
#		return self.create_user(username, password, **extra_fields)


# creating a models Player, which inherite dj User class (AbstractUser)


	
class PlayerSuperUser(BaseUserManager):
    def get_by_natural_key(self, username):
        return self.get(username=username)

    def create_user(self, username, password=None, **extra_fields):
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        user = self.create_user(username, password, **extra_fields)
        user.save(using=self._db)
        return user
	

class Player(AbstractBaseUser, PermissionsMixin):
	USERNAME_FIELD = 'username'
	REQUIRED_FIELDS = []
	
	username = models.CharField(max_length=200, unique=True)
	
	first_name = None
	last_name = None
	groups = None
	is_staff = models.BooleanField(default=False)
	is_active = models.BooleanField(default=False)
	is_superuser = models.BooleanField(default=False)
	user_permissions = None

	objects = PlayerSuperUser()

	class status(models.TextChoices):
		ONLINE = "ONLINE"
		OFFLINE = "OFFLINE"
		PLAYING = "PLAYING"
	nickname = models.CharField(max_length=200)
	nb_games_2p = models.IntegerField(default=0)
	nb_games_2p_won = models.IntegerField(default=0, null=True, blank=True)
	nb_games_2p_lost = models.IntegerField(default=0)
	nb_games_4p = models.IntegerField(default=0)
	nb_games_4p_won = models.IntegerField(default=0)
	nb_games_4p_lost = models.IntegerField(default=0)
	score = models.IntegerField(default=0)
	status = models.CharField(max_length=200, choices=status.choices, default=status.OFFLINE)
	avatar = models.ImageField(max_length=200, null=True, blank=True, upload_to='avatars/')


# class Player (models.Model):
	# class status(models.TextChoices):
	# 	ONLINE = "ONLINE"
	# 	OFFLINE = "OFFLINE"
	# 	PLAYING = "PLAYING"
	# login = models.CharField(max_length=200)
	# password = models.CharField(max_length=200)
	# nickname = models.CharField(max_length=200)
	# nb_games_2p = models.IntegerField(default=0)
	# nb_games_2p_won = models.IntegerField(default=0)
	# nb_games_2p_lost = models.IntegerField(default=0)
	# nb_games_4p = models.IntegerField(default=0)
	# nb_games_4p_won = models.IntegerField(default=0)
	# nb_games_4p_lost = models.IntegerField(default=0)
	# score = models.IntegerField(default=0)
	# status = models.CharField(max_length=200, choices=status.choices, default=status.OFFLINE)
	# avatar = models.ImageField(max_length=200, null=True, blank=True, upload_to='avatars/')
	# # def set_password(self, password):
	# # 	self.password = password