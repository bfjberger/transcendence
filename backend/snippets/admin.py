from django.contrib import admin

# Register your models here.


# Register your models here.
from snippets.models import Snippet

class SnippetAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'code', 'linenos', 'language', 'style')

admin.site.register(Snippet, SnippetAdmin)



