import math
import logging
from django.db.models import Q, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.pagination import PageNumberPagination
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiParameter, OpenApiTypes
from rest_framework import serializers

from .models import ShelterPoint
from .serializers import (
    LLMProcessRequestSerializer,
    LLMStructuredResponseSerializer,
    ShelterPointSerializer,
)
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


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two points on Earth in kilometers.
    """
    r = 6371.0  # Earth's radius in kilometers
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


class ShelterPointPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 1000


class ShelterPointListView(generics.ListAPIView):
    """
    List shelter points with search, administrative filters, bounding box, or radius proximity search.
    """
    serializer_class = ShelterPointSerializer
    pagination_class = ShelterPointPagination
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        summary="List Shelter Points",
        description=(
            "Retrieve shelter points with optional filtering by location (voivodeship, county, commune), "
            "accessibility, free-text search, map bounding box (min_lat, max_lat, min_lon, max_lon), "
            "or radius proximity search (lat, lon, radius_km)."
        ),
        parameters=[
            OpenApiParameter("search", OpenApiTypes.STR, description="Search across address, commune, county, or ID"),
            OpenApiParameter("voivodeship", OpenApiTypes.STR, description="Filter by voivodeship (e.g. dolnośląskie)"),
            OpenApiParameter("county", OpenApiTypes.STR, description="Filter by county (e.g. pow. wrocławski, Wrocław)"),
            OpenApiParameter("commune", OpenApiTypes.STR, description="Filter by commune (e.g. Wrocław, Otmuchów)"),
            OpenApiParameter("accessibility", OpenApiTypes.STR, description="Filter by accessibility (Całodobowa, Na żądanie, Określone godziny)"),
            OpenApiParameter("lat", OpenApiTypes.FLOAT, description="User latitude for proximity search (requires lon)"),
            OpenApiParameter("lon", OpenApiTypes.FLOAT, description="User longitude for proximity search (requires lat)"),
            OpenApiParameter("radius_km", OpenApiTypes.FLOAT, default=5.0, description="Proximity radius in kilometers (default: 5.0 km, max: 100.0 km)"),
            OpenApiParameter("min_lat", OpenApiTypes.FLOAT, description="Bounding box minimum latitude (for map viewport)"),
            OpenApiParameter("max_lat", OpenApiTypes.FLOAT, description="Bounding box maximum latitude (for map viewport)"),
            OpenApiParameter("min_lon", OpenApiTypes.FLOAT, description="Bounding box minimum longitude (for map viewport)"),
            OpenApiParameter("max_lon", OpenApiTypes.FLOAT, description="Bounding box maximum longitude (for map viewport)"),
        ],
        responses={200: ShelterPointSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        queryset = ShelterPoint.objects.all()

        # Free-text search
        search_query = request.query_params.get("search", "").strip()
        if search_query:
            queryset = queryset.filter(
                Q(address__icontains=search_query)
                | Q(commune__icontains=search_query)
                | Q(county__icontains=search_query)
                | Q(id__icontains=search_query)
            )

        # Administrative filters
        voivodeship = request.query_params.get("voivodeship", "").strip()
        if voivodeship:
            queryset = queryset.filter(voivodeship__iexact=voivodeship)

        county = request.query_params.get("county", "").strip()
        if county:
            queryset = queryset.filter(county__icontains=county)

        commune = request.query_params.get("commune", "").strip()
        if commune:
            queryset = queryset.filter(commune__icontains=commune)

        accessibility = request.query_params.get("accessibility", "").strip()
        if accessibility:
            queryset = queryset.filter(accessibility__iexact=accessibility)

        # Map viewport bounding box filter
        min_lat = request.query_params.get("min_lat")
        max_lat = request.query_params.get("max_lat")
        min_lon = request.query_params.get("min_lon")
        max_lon = request.query_params.get("max_lon")
        if all(v is not None for v in [min_lat, max_lat, min_lon, max_lon]):
            try:
                queryset = queryset.filter(
                    latitude__gte=float(min_lat),
                    latitude__lte=float(max_lat),
                    longitude__gte=float(min_lon),
                    longitude__lte=float(max_lon),
                )
            except ValueError:
                pass

        # Radius proximity search
        lat_param = request.query_params.get("lat")
        lon_param = request.query_params.get("lon")

        if lat_param is not None and lon_param is not None:
            try:
                user_lat = float(lat_param)
                user_lon = float(lon_param)
                radius_km = min(float(request.query_params.get("radius_km", 5.0)), 100.0)

                # Pre-filter with bounding box for fast indexed query
                delta_lat = radius_km / 111.0
                cos_lat = max(0.1, math.cos(math.radians(user_lat)))
                delta_lon = radius_km / (111.0 * cos_lat)

                candidate_queryset = queryset.filter(
                    latitude__gte=user_lat - delta_lat,
                    latitude__lte=user_lat + delta_lat,
                    longitude__gte=user_lon - delta_lon,
                    longitude__lte=user_lon + delta_lon,
                )

                # Calculate exact distance and sort
                nearby_points = []
                for point in candidate_queryset:
                    dist = haversine_distance(user_lat, user_lon, point.latitude, point.longitude)
                    if dist <= radius_km:
                        point.distance_km = round(dist, 2)
                        nearby_points.append(point)

                nearby_points.sort(key=lambda p: p.distance_km)

                page = self.paginate_queryset(nearby_points)
                if page is not None:
                    serializer = self.get_serializer(page, many=True)
                    return self.get_paginated_response(serializer.data)

                serializer = self.get_serializer(nearby_points, many=True)
                return Response(serializer.data)

            except ValueError:
                pass

        # Default query: order by location and paginate
        queryset = queryset.order_by("commune", "address")
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ShelterPointDetailView(generics.RetrieveAPIView):
    """
    Retrieve single shelter point details by identifier.
    """
    queryset = ShelterPoint.objects.all()
    serializer_class = ShelterPointSerializer
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        summary="Get Shelter Point Details",
        description="Retrieve complete details for a single shelter point by its public identifier (e.g. OZO-6D94271C9708).",
        responses={
            200: ShelterPointSerializer,
            404: inline_serializer(
                name="ShelterNotFoundError",
                fields={"detail": serializers.CharField()},
            ),
        },
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ShelterPointStatsView(APIView):
    """
    Provides aggregated statistics and filter values for shelter points.
    """
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        summary="Get Shelter Point Statistics",
        description="Returns total count and distribution breakdown by voivodeship and accessibility.",
        responses={
            200: inline_serializer(
                name="ShelterStatsResponse",
                fields={
                    "total_shelters": serializers.IntegerField(),
                    "by_accessibility": serializers.DictField(),
                    "by_voivodeship": serializers.DictField(),
                },
            )
        },
    )
    def get(self, request):
        total = ShelterPoint.objects.count()
        acc_stats = (
            ShelterPoint.objects.values("accessibility")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        voiv_stats = (
            ShelterPoint.objects.values("voivodeship")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        return Response(
            {
                "total_shelters": total,
                "by_accessibility": {item["accessibility"]: item["count"] for item in acc_stats},
                "by_voivodeship": {item["voivodeship"]: item["count"] for item in voiv_stats},
            },
            status=status.HTTP_200_OK,
        )

