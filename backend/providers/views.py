from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

class APIHealthCheck(APIView):

    permission_classes =[AllowAny]

    def get(self, request):
        return Response({
            "API Status": "Ok",
            "message": "Yokoso, watashi no SPC API "
        })
