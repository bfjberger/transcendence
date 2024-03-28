from django.contrib import admin

# Register your models here.
from authenticate.models import snippet

class SnippetAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner' , 'highlighted')

admin.site.register(snippet, SnippetAdmin)
