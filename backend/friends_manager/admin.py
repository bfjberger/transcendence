from django.contrib import admin

from friends_manager.models import Friend

class FriendAdmin(admin.ModelAdmin):
	list_display = ("user_initiated", "user_received", "accept")

admin.site.register(Friend, FriendAdmin)
