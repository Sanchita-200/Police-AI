from fastapi import APIRouter

from app.api import chat, intelligence

api_router = APIRouter()

api_router.include_router(chat.router)
api_router.include_router(intelligence.router)

@api_router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
