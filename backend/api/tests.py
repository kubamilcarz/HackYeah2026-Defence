from unittest.mock import MagicMock, patch
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from api.services.llm_service import StructuredOutputSchema


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
