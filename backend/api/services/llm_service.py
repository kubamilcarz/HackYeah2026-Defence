import logging
from typing import Any, Dict, List, Optional, Type
from django.conf import settings
from pydantic import BaseModel, Field
import openai
from openai import OpenAI

logger = logging.getLogger(__name__)


class StructuredOutputSchema(BaseModel):
    """
    Default structured output schema for the OpenAI LLM response.
    Can be easily customized or replaced when specific schema requirements are defined.
    """
    title: str = Field(description="A concise title or headline summarizing the processed data.")
    summary: str = Field(description="A clear summary of the core information or result.")
    key_points: List[str] = Field(description="Key bullet points, insights, or structured attributes.")
    confidence_score: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence or relevance score between 0.0 and 1.0.",
    )
    tags: List[str] = Field(
        default_factory=list,
        description="Categorical tags or classifications.",
    )


class OpenAIService:
    """
    Service responsible for interacting with OpenAI API using Structured Outputs.
    """

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or getattr(settings, "OPENAI_API_KEY", "")
        self.model = model or getattr(settings, "OPENAI_MODEL", "gpt-4o-mini")

    def _get_client(self) -> OpenAI:
        if not self.api_key:
            raise ValueError(
                "OPENAI_API_KEY is not configured. "
                "Please set OPENAI_API_KEY in backend/.env."
            )
        return OpenAI(api_key=self.api_key)

    def process(
        self,
        prompt: str,
        context: Optional[Dict[str, Any]] = None,
        system_instruction: Optional[str] = None,
        response_model: Type[BaseModel] = StructuredOutputSchema,
    ) -> Dict[str, Any]:
        """
        Sends user data/prompt to OpenAI and returns validated structured data matching response_model.
        """
        client = self._get_client()

        default_system = (
            "You are an AI assistant specialized in analyzing information and returning "
            "precise, structured data adhering strictly to the requested schema."
        )
        sys_prompt = system_instruction if system_instruction else default_system

        # Build user prompt with optional context
        user_content = prompt
        if context:
            user_content += f"\n\nContext:\n{context}"

        messages = [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": user_content},
        ]

        logger.info("Calling OpenAI model %s with structured schema %s", self.model, response_model.__name__)

        try:
            completion = client.beta.chat.completions.parse(
                model=self.model,
                messages=messages,
                response_format=response_model,
            )

            message = completion.choices[0].message
            if getattr(message, "refusal", None):
                logger.warning("OpenAI model refused request: %s", message.refusal)
                raise ValueError(f"Model refused request: {message.refusal}")

            if not message.parsed:
                raise ValueError("Failed to parse structured response from OpenAI.")

            return message.parsed.model_dump()

        except openai.APIConnectionError as exc:
            logger.error("Failed to connect to OpenAI API: %s", exc)
            raise ConnectionError("Unable to reach OpenAI API. Please check your network connection.") from exc
        except openai.RateLimitError as exc:
            logger.error("OpenAI rate limit exceeded: %s", exc)
            raise PermissionError("OpenAI rate limit exceeded. Please try again later.") from exc
        except openai.APIStatusError as exc:
            logger.error("OpenAI API returned status %s: %s", exc.status_code, exc.message)
            raise RuntimeError(f"OpenAI API error ({exc.status_code}): {exc.message}") from exc
        except openai.OpenAIError as exc:
            logger.error("OpenAI general error: %s", exc)
            raise RuntimeError(f"OpenAI service error: {str(exc)}") from exc

