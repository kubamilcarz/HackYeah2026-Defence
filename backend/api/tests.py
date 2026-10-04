from unittest.mock import MagicMock, patch
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from api.services.llm_service import StructuredOutputSchema, PersonalizedPlanSchema


class HealthCheckTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check_endpoint(self):
        url = reverse("health-check")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("status"), "healthy")
        self.assertEqual(response.data.get("service"), "Hubmi Backend")

    def test_openapi_schema_endpoint(self):
        url = reverse("schema")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_swagger_ui_endpoint(self):
        url = reverse("swagger-ui")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class LLMProcessTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("llm-process")

    def test_missing_prompt_returns_400(self):
        response = self.client.post(self.url, data={}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("prompt", response.data)

    @override_settings(OPENAI_API_KEY="")
    def test_missing_api_key_returns_400(self):
        payload = {"prompt": "Analyze incoming threat intelligence."}
        response = self.client.post(self.url, data=payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("OPENAI_API_KEY is not configured", response.data.get("error", ""))

    @patch("api.services.llm_service.OpenAI")
    @override_settings(OPENAI_API_KEY="test-api-key")
    def test_successful_structured_process(self, mock_openai_cls):
        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client

        mock_parsed = StructuredOutputSchema(
            title="Cyber Threat Analysis",
            summary="Identified low-level port scanning activity.",
            key_points=["Target port: 443", "Source IP logged", "No intrusion detected"],
            confidence_score=0.95,
            tags=["network", "scan", "low-risk"],
        )

        mock_choice = MagicMock()
        mock_choice.message.refusal = None
        mock_choice.message.parsed = mock_parsed

        mock_completion = MagicMock()
        mock_completion.choices = [mock_choice]
        mock_client.beta.chat.completions.parse.return_value = mock_completion

        payload = {
            "prompt": "Analyze log: 2026-10-03 port scan detected on 443",
            "context": {"source": "firewall_log"},
        }

        response = self.client.post(self.url, data=payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Cyber Threat Analysis")
        self.assertEqual(response.data["confidence_score"], 0.95)
        self.assertEqual(len(response.data["key_points"]), 3)
        self.assertIn("network", response.data["tags"])

    @patch("api.services.llm_service.OpenAI")
    @override_settings(OPENAI_API_KEY="test-api-key")
    def test_upstream_api_failure_returns_502(self, mock_openai_cls):
        from openai import APIConnectionError

        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        mock_client.beta.chat.completions.parse.side_effect = APIConnectionError(request=MagicMock())

        payload = {"prompt": "Test connection failure"}
        response = self.client.post(self.url, data=payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertIn("error", response.data)


class PersonalizedPlanTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("personalized-plan")
        self.payload = {
            "locale": "en", "consent": True,
            "household": {
                "adults": 2, "children": 1, "seniors": 0, "contacts_count": 1,
                "has_primary_contact": True, "has_primary_meeting_place": False,
                "has_backup_meeting_place": False, "has_communication_plan": False,
                "has_roles_and_documents": False,
                "health_support_counts": {"allergies": 0, "chronic_conditions": 0, "medications": 0},
                "readiness": {"completed": 1, "total": 6, "missing": ["meetingPlace"]},
                "supply_gaps": ["water-food"], "backpack": {"packed": 2, "total": 8},
            },
        }

    def test_consent_is_required(self):
        payload = {**self.payload, "consent": False}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("api.services.llm_service.OpenAI")
    @override_settings(OPENAI_API_KEY="test-api-key")
    def test_returns_validated_preparedness_plan(self, mock_openai_cls):
        parsed = PersonalizedPlanSchema(
            title="Prepare together", summary="Start with the missing agreement.",
            priorities=[{"id": "p1", "title": "Agree a meeting place", "detail": "Choose a backup too.", "target": "meetingPlace"}],
            sections=[{"id": "communication", "title": "Communication", "actions": [{"id": "a1", "title": "Choose a contact", "detail": "Confirm one contact path.", "target": "contacts"}]}],
            questions_to_resolve=["Where will you meet?"],
        )
        choice = MagicMock()
        choice.message.refusal = None
        choice.message.parsed = parsed
        completion = MagicMock()
        completion.choices = [choice]
        mock_openai_cls.return_value.beta.chat.completions.parse.return_value = completion
        response = self.client.post(self.url, self.payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["priorities"][0]["target"], "meetingPlace")
        self.assertIn("generated_at", response.data)


class ShelterPointTests(TestCase):
    def setUp(self):
        from api.models import ShelterPoint
        self.client = APIClient()

        # Seed test points
        self.point1 = ShelterPoint.objects.create(
            id="OZO-TEST1",
            name="Miejsce ochronne",
            object_type="Obiekt ochrony ludności",
            voivodeship="dolnośląskie",
            county="Wrocław",
            commune="Wrocław",
            address="ul. Rynek 1, Wrocław",
            accessibility="Całodobowa",
            latitude=51.1097,
            longitude=17.0327,
        )
        self.point2 = ShelterPoint.objects.create(
            id="OZO-TEST2",
            name="Miejsce ochronne",
            object_type="Obiekt ochrony ludności",
            voivodeship="dolnośląskie",
            county="Wrocław",
            commune="Wrocław",
            address="ul. Swobodna 10, Wrocław",
            accessibility="Na żądanie",
            latitude=51.0980,
            longitude=17.0280,
        )
        self.point3 = ShelterPoint.objects.create(
            id="OZO-TEST3",
            name="Miejsce ochronne",
            object_type="Obiekt ochrony ludności",
            voivodeship="mazowieckie",
            county="Warszawa",
            commune="Warszawa",
            address="ul. Marszałkowska 1, Warszawa",
            accessibility="Określone godziny",
            latitude=52.2297,
            longitude=21.0122,
        )

    def test_list_shelters_pagination(self):
        url = reverse("shelter-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 3)
        self.assertEqual(len(response.data["results"]), 3)

    def test_filter_by_voivodeship(self):
        url = reverse("shelter-list")
        response = self.client.get(url, {"voivodeship": "mazowieckie"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], "OZO-TEST3")

    def test_filter_by_accessibility(self):
        url = reverse("shelter-list")
        response = self.client.get(url, {"accessibility": "Całodobowa"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], "OZO-TEST1")

    def test_free_text_search(self):
        url = reverse("shelter-list")
        response = self.client.get(url, {"search": "Marszałkowska"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], "OZO-TEST3")

    def test_proximity_radius_search(self):
        url = reverse("shelter-list")
        # Search 2 km from Wroclaw Rynek (51.1097, 17.0327)
        response = self.client.get(url, {"lat": 51.1097, "lon": 17.0327, "radius_km": 2.0})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        # Point 1 is at 0.0 km, Point 2 is ~1.3 km, Point 3 is in Warsaw (>300 km)
        self.assertEqual(response.data["results"][0]["id"], "OZO-TEST1")
        self.assertEqual(response.data["results"][0]["distance_km"], 0.0)
        self.assertEqual(response.data["results"][1]["id"], "OZO-TEST2")
        self.assertLess(response.data["results"][1]["distance_km"], 2.0)

    def test_bounding_box_filter(self):
        url = reverse("shelter-list")
        # Bounding box covering Wroclaw only
        response = self.client.get(url, {
            "min_lat": 51.05,
            "max_lat": 51.15,
            "min_lon": 17.00,
            "max_lon": 17.10,
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_detail_view(self):
        url = reverse("shelter-detail", kwargs={"pk": "OZO-TEST1"})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["address"], "ul. Rynek 1, Wrocław")

    def test_detail_view_not_found(self):
        url = reverse("shelter-detail", kwargs={"pk": "OZO-NONEXISTENT"})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_stats_view(self):
        url = reverse("shelter-stats")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_shelters"], 3)
        self.assertIn("dolnośląskie", response.data["by_voivodeship"])
        self.assertEqual(response.data["by_voivodeship"]["dolnośląskie"], 2)
        self.assertIn("Całodobowa", response.data["by_accessibility"])

    @override_settings(MAPBOX_SEARCH_TOKEN="")
    def test_places_endpoint_returns_local_shelters_when_mapbox_is_unconfigured(self):
        response = self.client.get(reverse("places"), {"lat": 51.1097, "lon": 17.0327, "types": "shelter,hospital"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["id"], "shelter:OZO-TEST1")
        self.assertIn("hospital", response.data["unavailable_types"])
