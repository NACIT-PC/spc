from django.contrib.auth.models import User
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
class ProviderSerializer(serializers.ModelSerializer):

    #return nested JSON object 
    category = CategorySerializer(read_only=True)

    #accept a category ID when creating/updating a provide
    category_id = serializers.PrimaryKeyRelatedField(queryset=CategoryModel.objects.all(),
                                                      source="category", write_only=True)
    class Meta:
        model=ProviderModel
        fields=[
            "id",
            "name",
            "category",
            "category_id",
            "city",
            "price_range",
            "description",
            "phone",
            "whatsapp",
            "is_verified",
            "created_at",
        ]

        read_only_fields = ["id", "is_verified", "created_at"]


"""public self-registration; staff flags are never accepted here"""
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, max_length=128)

    class Meta:
        model = User
        fields = ["username", "password"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)