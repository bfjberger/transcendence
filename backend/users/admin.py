from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import MyUser

class CustomUserAdmin(UserAdmin):
	fieldsets =(
		*UserAdmin.fieldsets,
		(
			'Additional fields',
			{
				'fields':(
					'nickname',
					'last_activity',
					'avatar',
					'status',
				)
			}
		)
	)
	readonly_fields = ('last_activity',)

admin.site.register(MyUser, CustomUserAdmin)
