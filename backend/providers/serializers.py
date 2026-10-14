from rest_framework import serializers
from .models import CategoryModel, ProviderModel


"""serializer category records for the SPC API"""
class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model=CategoryModel
        fields = [
            "id",
            "name", 
        ]

        read_only_fields = ["id"]

"""serializer provider records for SPC API"""
class ProviderModel(serializers.ModelSerializer):

    #return nested JSON object 
    category = CategorySerializer(read_only=True)

    #accept a category ID when creating/updating a provide
    category_id = serializers.PrimaryKeyRelatedField(queryset=CategoryModel.objects.all(),
                                                      source="category", read_only=True)
    class Meta:
        model=ProviderModel
        fields=[
            "id",
            "name",
            "category",
            "category_id",
            "city",
            "description",
            "price_range"
            "phone",
            "whatsapp",
            "is_verified",
            "created_at",
        ]

        only_reads_field=[
            "id",
            "is_verified",
            "created_at"
        ]