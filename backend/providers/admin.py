from django.contrib import admin
from .models import CatergoryModel, ProviderModel

@admin.register(CatergoryModel)
class CatergoryAdmin(admin.ModelAdmin):
    list_display=("id", "name")
    search_fields=("name",)
    ordering=("name",)

@admin.register(ProviderModel)
class ProviderAdmin(admin.ModelAdmin):
    list_display=(
        "id",
        "name",
        "category",
        "city",
        "is_verified",
        "created_at"
    )

    list_filter=("category", "city", "is_verified")
    search_fields=("name", "city", "description")
    readonly_fields=("created_at")
    ordering=("name")
    list_select_related=("category")