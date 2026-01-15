from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Fraud Detection API"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "fraud_detection"
    DATABASE_URL: Optional[str] = None

    # Security
    SECRET_KEY: str = "CHANGE_THIS_TO_A_STRONG_SECRET_IN_PROD"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        # FALLBACK: Use SQLite for local development (Absolute path to avoid confusion)
        return "sqlite+aiosqlite:///C:/PROJECT/AegisFlow/fraud_detection.db"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
