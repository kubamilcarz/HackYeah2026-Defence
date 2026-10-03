from django.urls import path
from .views import HealthCheckView, LLMProcessView

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("llm/process/", LLMProcessView.as_view(), name="llm-process"),
]

