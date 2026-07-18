from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.core.exceptions import AIServiceError

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AIServiceError)
async def ai_service_error_handler(
    _request: Request,
    exc: AIServiceError,
) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )


@app.on_event("startup")
def on_startup():
    from app.db.base import Base
    from app.db.session import engine, SessionLocal
    from app.db.seed import seed_database
    from app.models.fir import FIRModel # Register model metadata
    from app.models.copilot import CopilotFile, CopilotEntity, CopilotDraft, CopilotTimeline
    
    # Create all database tables
    Base.metadata.create_all(bind=engine)
    
    # Run database seed
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


app.include_router(api_router, prefix=settings.api_v1_prefix)

