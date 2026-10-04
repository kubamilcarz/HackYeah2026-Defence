from django.urls import path
from .views import (
    HealthCheckView,
    LLMProcessView,
    PersonalizedPlanView,
    PlacesView,
    ShelterPointListView,
    ShelterPointDetailView,
    ShelterPointStatsView,
)

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("llm/process/", LLMProcessView.as_view(), name="llm-process"),
    path("personalized-plan/", PersonalizedPlanView.as_view(), name="personalized-plan"),
    path("places/", PlacesView.as_view(), name="places"),
    path("shelters/", ShelterPointListView.as_view(), name="shelter-list"),
    path("shelters/stats/", ShelterPointStatsView.as_view(), name="shelter-stats"),
    path("shelters/<str:pk>/", ShelterPointDetailView.as_view(), name="shelter-detail"),
]
