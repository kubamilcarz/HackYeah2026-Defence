from rest_framework import serializers
from .models import ShelterPoint


class HouseholdSnapshotSerializer(serializers.Serializer):
    adults = serializers.IntegerField(min_value=0)
    children = serializers.IntegerField(min_value=0)
    seniors = serializers.IntegerField(min_value=0)
    contacts_count = serializers.IntegerField(min_value=0)
    has_primary_contact = serializers.BooleanField()
    has_primary_meeting_place = serializers.BooleanField()
    has_backup_meeting_place = serializers.BooleanField()
    has_communication_plan = serializers.BooleanField()
    has_roles_and_documents = serializers.BooleanField()
    health_support_counts = serializers.DictField(child=serializers.IntegerField(min_value=0))
    readiness = serializers.DictField(child=serializers.JSONField())
    supply_gaps = serializers.ListField(child=serializers.CharField(), allow_empty=True)
    backpack = serializers.DictField(child=serializers.IntegerField(min_value=0))


class PersonalizedPlanRequestSerializer(serializers.Serializer):
    locale = serializers.ChoiceField(choices=["en", "pl"])
    consent = serializers.BooleanField()
    household = HouseholdSnapshotSerializer()

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError("Consent is required to generate a personalized plan.")
        return value


class PlanActionSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    detail = serializers.CharField()
    target = serializers.ChoiceField(choices=["contacts", "meetingPlace", "supportInformation", "waterAndFood", "kitAndPower", "rolesAndDocuments", "supplies", "backpack"])


class PersonalizedPlanResponseSerializer(serializers.Serializer):
    version = serializers.CharField()
    generated_at = serializers.DateTimeField()
    title = serializers.CharField()
    summary = serializers.CharField()
    priorities = PlanActionSerializer(many=True)
    sections = serializers.ListField(child=serializers.DictField())
    questions_to_resolve = serializers.ListField(child=serializers.CharField())


class PlaceQuerySerializer(serializers.Serializer):
    lat = serializers.FloatField(min_value=-90, max_value=90)
    lon = serializers.FloatField(min_value=-180, max_value=180)
    radius_km = serializers.FloatField(required=False, default=5.0, min_value=0.1, max_value=50)
    types = serializers.CharField(required=False, default="shelter,hospital,pharmacy")
    query = serializers.CharField(required=False, allow_blank=True, max_length=120)
    locale = serializers.ChoiceField(choices=["en", "pl"], required=False, default="pl")


class ShelterPointSerializer(serializers.ModelSerializer):
    """
    Serializer for shelter points (punkty schronienia).
    Includes optional distance_km when queried via geo-search.
    """
    distance_km = serializers.FloatField(required=False, read_only=True, allow_null=True)

    class Meta:
        model = ShelterPoint
        fields = [
            "id",
            "name",
            "object_type",
            "voivodeship",
            "county",
            "commune",
            "address",
            "accessibility",
            "latitude",
            "longitude",
            "distance_km",
        ]


class LLMProcessRequestSerializer(serializers.Serializer):
    """
    Request payload for the OpenAI structured data endpoint.
    """
    prompt = serializers.CharField(
        required=True,
        help_text="The main prompt, text, or query to be processed by the LLM.",
    )
    context = serializers.DictField(
        required=False,
        default=dict,
        help_text="Optional additional contextual data or parameters.",
    )
    system_instruction = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        help_text="Optional override for the system instructions.",
    )


class LLMStructuredResponseSerializer(serializers.Serializer):
    """
    Structured response schema returned from the endpoint.
    This can be easily modified to match specific domain needs.
    """
    title = serializers.CharField(
        help_text="A concise headline or title summarizing the result."
    )
    summary = serializers.CharField(
        help_text="A clear summary of the core information or answer."
    )
    key_points = serializers.ListField(
        child=serializers.CharField(),
        help_text="List of extracted points, actionable insights, or features.",
    )
    confidence_score = serializers.FloatField(
        help_text="Confidence or relevance score between 0.0 and 1.0."
    )
    tags = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
        help_text="Tags or category classifications.",
    )
