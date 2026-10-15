from django.urls import path
from .views import APIHealthCheck, CategoryList, MeView, ProviderDetail, ProviderList, RegisterView, TokenObtainPairView, TokenRefreshView, VerifyProvider

urlpatterns=[
    path("health/", APIHealthCheck.as_view(), name="api-health"),
    path("categories/", CategoryList.as_view(), name="category-list"),
    path("providers/", ProviderList.as_view(), name="provider-list"),
    path("providers/<uuid:pk>/", ProviderDetail.as_view(), name="provider-detail"),
    path("providers/<uuid:pk>/verify/", VerifyProvider.as_view(), name="provider-verify"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token-obtain"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
]