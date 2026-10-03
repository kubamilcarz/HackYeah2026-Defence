from django.contrib import admin
from .models import ShelterPoint


@admin.register(ShelterPoint)
class ShelterPointAdmin(admin.ModelAdmin):
    list_display = ("id", "commune", "county", "voivodeship", "address", "accessibility")
    list_filter = ("voivodeship", "accessibility")
    search_fields = ("id", "address", "commune", "county")
    ordering = ("commune", "address")
