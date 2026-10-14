from django.db import models


"""
# The Catergory model represents  a service catergory.
# Example include Catering etc.
# Each category must have a unique name.
"""
class CategoryModel(models.Models):
    name = models.CharField(primary_key=True, unique=True, max_length=155, blank=False)
    class Meta:
        ordering = ["name"]
        plural_name = "categories"

    def __str__(self):
        return f"{self.name}"



"""
service provider Model
""" 
class ProviderModel(models.Models):
    name = models.CharField(max_length=255)

    """ implementation choice to avoid accidentary deleting providers when removing catergory""" 
    catergory = models.ForeignKey(CategoryModel, on_delete=models.PROTECT, related_name="providers")

    city = models.CharField(max_length=155)
    description = models.TextField(blank=False)
    phone = models.IntegerField(unique=True, blank=False, max_length=14)
    whatsapp = models.CharField(max_length=100, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        #sort categories alphabetically
        ordering = ["name"] 


    def __string__(self):
        return f"{self.name}"

    
