from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from friends_manager.models import Friend


class FriendAdmin(admin.ModelAdmin):
    list_display = ("user_initiated", "user_received", "accept")

admin.site.register(Friend, FriendAdmin)


class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'username', 'email')
    readonly_fields = ('id',)

# Unregister the original User admin
admin.site.unregister(User)

# Register the User model with the new CustomUserAdmin
admin.site.register(User, CustomUserAdmin)
