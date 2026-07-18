class AIServiceError(Exception):
    """Raised when the AI provider fails or is misconfigured."""

    def __init__(self, message: str, status_code: int = 503) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class AIConfigurationError(AIServiceError):
    def __init__(self, message: str = "Gemini API key is not configured") -> None:
        super().__init__(message, status_code=503)


class AIProviderError(AIServiceError):
    def __init__(self, message: str = "AI provider request failed") -> None:
        super().__init__(message, status_code=502)
