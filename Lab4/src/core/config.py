"""Application configuration."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application
    app_name: str = "Trading Journal API"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://user:password@localhost/trading_journal"

    # Security
    encryption_key: str = "your-32-byte-secret-key-here-1234567890abcdef"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
