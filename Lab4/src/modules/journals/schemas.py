"""Pydantic schemas for journals module."""
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from src.core.encryption import decrypt_value, encrypt_value


class JournalBase(BaseModel):
    """Base journal schema."""

    name: str = Field(..., min_length=1, max_length=255)
    deposit_balance: Decimal = Field(default=Decimal("0"), ge=0)


class JournalCreate(JournalBase):
    """Schema for creating a journal."""

    bybit_api_key: str | None = None
    bybit_api_secret: str | None = None


class JournalUpdate(BaseModel):
    """Schema for updating a journal."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    deposit_balance: Decimal | None = Field(default=None, ge=0)
    bybit_api_key: str | None = None
    bybit_api_secret: str | None = None


class JournalResponse(BaseModel):
    """Schema for journal response (without sensitive data)."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    deposit_balance: Decimal
    has_api_keys: bool  # True if API keys are set
    created_at: datetime
    updated_at: datetime


class JournalDetailResponse(JournalResponse):
    """Schema for detailed journal response with calculated balance."""

    calculated_balance: Decimal  # Balance calculated from trades
    balance_difference: Decimal  # Difference between deposit and calculated


class JournalListResponse(BaseModel):
    """Schema for list of journals."""

    items: list[JournalResponse]
    total: int


class DecryptedApiKeys(BaseModel):
    """Schema for decrypted API keys (internal use only)."""

    api_key: str | None
    api_secret: str | None

    @field_validator("api_key", "api_secret", mode="before")
    @classmethod
    def decrypt_value(cls, v: str | None) -> str | None:
        """Decrypt encrypted values."""
        if v is None:
            return None
        return decrypt_value(v)


class EncryptedApiKeys(BaseModel):
    """Schema for encrypted API keys."""

    api_key: str | None
    api_secret: str | None

    @field_validator("api_key", "api_secret", mode="before")
    @classmethod
    def encrypt_value(cls, v: str | None) -> str | None:
        """Encrypt plain values."""
        if v is None:
            return None
        return encrypt_value(v)
