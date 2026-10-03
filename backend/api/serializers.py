from rest_framework import serializers


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

