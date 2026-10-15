from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

class APIHealthCheck(APIView):

    permission_classes =[AllowAny]

    def get(self, request):
        return Response({
            "API Status": "ok ",
            "message": "Yōkoso, watashi no Sōru Sosaeti e"
        },
        status=status.HTTP_200_OK
        
        )
