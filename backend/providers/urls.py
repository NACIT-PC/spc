from django.urls import path
from .views import APIHealthCheck

urlpatterns=[
    path("health/", APIHealthCheck.as_view(), name="api-health"),
]