from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import (
    TokenObtainPairView as _TokenObtainPairView,
    TokenRefreshView as _TokenRefreshView,
)

from .models import CategoryModel, ProviderModel
from .serializers import CategorySerializer, ProviderSerializer, RegisterSerializer

class APIHealthCheck(APIView):

    permission_classes =[AllowAny]

    def get(self, request):
        return Response({
            "API Status": "ok ",
            "message": "Yōkoso, watashi no Sōru Sosaeti e"
        },
        status=status.HTTP_200_OK

        )


class CategoryList(generics.ListAPIView):
    queryset = CategoryModel.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProviderList(generics.ListCreateAPIView):
    serializer_class = ProviderSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = ProviderModel.objects.select_related("category").all()
        category = self.request.query_params.get("category")
        city = self.request.query_params.get("city")
        q = self.request.query_params.get("q")
        if category:
            qs = qs.filter(category__name__iexact=category.strip())
        if city:
            qs = qs.filter(city__iexact=city.strip())
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(description__icontains=q))
        return qs


class ProviderDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProviderModel.objects.select_related("category").all()
    serializer_class = ProviderSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class RegisterView(generics.CreateAPIView):
    # ponytail: open registration for demo; close or add approval when public
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


# ponytail: same 10/min "auth" throttle as register; closes password-guessing
class TokenObtainPairView(_TokenObtainPairView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


class TokenRefreshView(_TokenRefreshView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "username": request.user.username,
            "is_staff": request.user.is_staff,
        })


class VerifyProvider(APIView):
    # ponytail: staff-only flip; no unverify endpoint until moderation needs it
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        provider = get_object_or_404(ProviderModel.objects.select_related("category"), pk=pk)
        provider.is_verified = True
        provider.save(update_fields=["is_verified"])
        return Response(ProviderSerializer(provider).data)
