from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers


class HealthCheckView(APIView):
    """
    Health check endpoint to verify backend service status.
    """
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        summary="Service Health Check",
        description="Returns the status of the Django backend service.",
        responses={
            200: inline_serializer(
                name="HealthCheckResponse",
                fields={
                    "status": serializers.CharField(),
                    "service": serializers.CharField(),
                    "version": serializers.CharField(),
                },
            )
        },
    )
    def get(self, request):
        return Response(
            {
                "status": "healthy",
                "service": "Hubmi Backend",
                "version": "1.0.0",
            },
            status=status.HTTP_200_OK,
        )
