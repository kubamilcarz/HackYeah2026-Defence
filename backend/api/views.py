import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers

from .serializers import LLMProcessRequestSerializer, LLMStructuredResponseSerializer
from .services import OpenAIService

logger = logging.getLogger(__name__)


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


class LLMProcessView(APIView):
    """
    Endpoint that processes data via OpenAI LLM and returns structured JSON.
    """
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        summary="Process data with OpenAI Structured Output",
        description=(
            "Accepts input data/prompt and processes it with OpenAI LLM. "
            "Returns strictly validated structured JSON adhering to the target schema."
        ),
        request=LLMProcessRequestSerializer,
        responses={
            200: LLMStructuredResponseSerializer,
            400: inline_serializer(
                name="LLMError400",
                fields={"error": serializers.CharField()},
            ),
            502: inline_serializer(
                name="LLMError502",
                fields={"error": serializers.CharField()},
            ),
            500: inline_serializer(
                name="LLMError500",
                fields={"error": serializers.CharField()},
            ),
        },
    )
    def post(self, request):
        serializer = LLMProcessRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prompt = serializer.validated_data["prompt"]
        context = serializer.validated_data.get("context")
        system_instruction = serializer.validated_data.get("system_instruction")

        try:
            service = OpenAIService()
            result = service.process(
                prompt=prompt,
                context=context,
                system_instruction=system_instruction,
            )
            return Response(result, status=status.HTTP_200_OK)

        except ValueError as exc:
            logger.warning("LLM validation or configuration error: %s", exc)
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except (ConnectionError, PermissionError, RuntimeError) as exc:
            logger.error("LLM upstream error: %s", exc)
            return Response({"error": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as exc:
            logger.exception("Unexpected error in LLMProcessView: %s", exc)
            return Response(
                {"error": "An unexpected error occurred while processing the LLM request."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

