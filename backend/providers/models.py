from django.db import models


class CatergoryModel(models.Models):
    name = models.CharField(primary_key=True, unique=True, max_length=155)
    class Meta:
        ordering = ["name"]
        plural_name = "categories"

    def __str__(self):
        return f"{self.name}"

#
class ProviderModel(models.Models):
    name = models.CharField(max_length=255)
    catergory = models.ForeignKey(CatergoryModel, on_delete=models.PROTECT, related_name="providers")
    city = models.CharField(max_length=155)
    description = models.TextField(blank=False)
    phone = models.IntegerField(unique=True, blank=False, max_length=14)
    whatsapp = models.CharField(max_length=100, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]


    def __string__(self):
        return f"{self.name}"

    
