from django.db import models
import uuid


"""
# The Catergory model represents  a service catergory.
# Example include Catering etc.
# Each category must have a unique name.
"""
class CategoryModel(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    name = models.CharField(unique=True, max_length=155, blank=False)
    class Meta:
        #sort categories alphabetically
        ordering = ["name"]
        verbose_name_plural = "categories"

    def __str__(self):
        return f"{self.name}"



"""
service provider Model
""" 
class ProviderModel(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    name = models.CharField(max_length=255)

    """ implementation choice to avoid accidentary deleting providers when removing catergory""" 
    category = models.ForeignKey(CategoryModel, on_delete=models.PROTECT, related_name="providers")

    city = models.CharField(max_length=155)
    price_range = models.CharField(max_length=200)
    description = models.TextField(blank=False)
    phone = models.IntegerField(unique=True, blank=False)
    whatsapp = models.CharField(max_length=100, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        #sort  providers alphabetically
        ordering = ["name"] 
        verbose_name_plural="providers"


    def __string__(self):
        return f"{self.name}"

    
