import logging

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.exceptions import AIServiceError, AIProviderError
from app.schemas.draft import FIRDraftSchema, GenerateDraftRequest, GenerateDraftResponse
from app.services.ai.base import AIService
from app.services.ai.factory import get_ai_service
from app.services.ai.prompts import normalize_language

logger = logging.getLogger(__name__)
router = APIRouter(tags=["chat"])


class ApiChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1, max_length=8_000)


class ChatRequest(BaseModel):
    messages: list[ApiChatMessage] = Field(..., min_length=1)
    language: str = "en"


class ChatResponse(BaseModel):
    message: str
    role: str = "assistant"
    is_complete: bool
    language: str


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    ai_service: AIService = Depends(get_ai_service),
) -> ChatResponse:
    language = normalize_language(request.language)
    payload = [
        {"role": message.role, "content": message.content.strip()}
        for message in request.messages
    ]

    try:
        result = await ai_service.chat(payload, language=language)
    except AIServiceError:
        raise
    except Exception as exc:
        logger.exception("Unhandled chat endpoint error")
        raise AIServiceError("Failed to process chat request.", status_code=500) from exc

    return ChatResponse(
        message=result.message,
        is_complete=result.is_complete,
        language=result.language,
    )


@router.post("/chat/generate-draft", response_model=GenerateDraftResponse)
async def generate_draft(
    request: GenerateDraftRequest,
    ai_service: AIService = Depends(get_ai_service),
) -> GenerateDraftResponse:
    language = normalize_language(request.language)
    payload = [
        {"role": message.role, "content": message.content.strip()}
        for message in request.messages
    ]

    try:
        draft = await ai_service.generate_draft(payload, language=language)
    except AIProviderError:
        raise
    except AIServiceError:
        raise
    except Exception as exc:
        logger.exception("Unhandled draft generation error")
        raise AIServiceError("Failed to generate FIR draft.", status_code=500) from exc

    return GenerateDraftResponse(draft=FIRDraftSchema(**draft))
