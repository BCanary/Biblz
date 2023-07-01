from django.contrib import admin
from .models import Writer, Book

# Register your models here.
admin.site.register(Writer)
admin.site.register(Book)