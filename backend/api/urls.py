from django.urls import path
from .views import (
    HealthCheckView,
    LLMProcessView,
    ShelterPointListView,
    ShelterPointDetailView,
    ShelterPointStatsView,
)

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("llm/process/", LLMProcessView.as_view(), name="llm-process"),
    path("shelters/", ShelterPointListView.as_view(), name="shelter-list"),
    path("shelters/stats/", ShelterPointStatsView.as_view(), name="shelter-stats"),
    path("shelters/<str:pk>/", ShelterPointDetailView.as_view(), name="shelter-detail"),
]

