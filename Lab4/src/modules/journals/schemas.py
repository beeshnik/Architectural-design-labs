"""Pydantic schemas for journals module with detailed API documentation."""
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class JournalBase(BaseModel):
    """Base schema for trading journal."""
    
    name: str = Field(
        ...,
        description="Human-readable name of the trading journal",
        examples=["Main Crypto Journal 2024", "Day Trading Experiments"],
        min_length=1,
        max_length=255,
    )
    deposit_balance: Decimal = Field(
        default=Decimal("0"),
        description="Initial deposit balance in quote currency (e.g., USDT)",
        examples=["10000.00", "5000.50"],
        ge=0,
    )


class JournalCreate(JournalBase):
    """Schema for creating a new trading journal.
    
    Optional API credentials can be provided for automatic synchronization 
    with Bybit exchange. Credentials are encrypted before storage.
    """
    
    bybit_api_key: str | None = Field(
        default=None,
        description="Bybit API key for automated trade sync (optional, will be encrypted)",
        examples=["xxxxx", None],
    )
    bybit_api_secret: str | None = Field(
        default=None,
        description="Bybit API secret for automated trade sync (optional, will be encrypted)",
        examples=["yyyyy", None],
    )


class JournalUpdate(BaseModel):
    """Schema for partial update of journal settings."""
    
    model_config = ConfigDict(from_attributes=True)
    
    name: str | None = Field(
        default=None,
        description="New journal name (optional)",
        examples=["Updated Journal Name"],
        max_length=255,
    )
    deposit_balance: Decimal | None = Field(
        default=None,
        description="New deposit balance (optional, affects PnL calculations)",
        examples=["15000.00"],
        ge=0,
    )
    bybit_api_key: str | None = Field(
        default=None,
        description="New API key or null to remove existing (optional)",
    )
    bybit_api_secret: str | None = Field(
        default=None,
        description="New API secret or null to remove existing (optional)",
    )


class JournalResponse(JournalBase):
    """Journal response schema with system fields."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: str = Field(
        ...,
        description="Unique identifier (UUID) of the journal",
        examples=["550e8400-e29b-41d4-a716-446655440000"],
    )
    has_api_keys: bool = Field(
        ...,
        description="Indicates if Bybit API credentials are configured (true/false)",
        examples=[True, False],
    )
    calculated_balance: Decimal | None = Field(
        default=None,
        description="Current balance calculated as deposit + sum of all trade PnLs (null if no trades)",
        examples=["12500.50"],
    )
    created_at: datetime = Field(
        ...,
        description="Journal creation timestamp (UTC)",
        examples=["2024-01-01T00:00:00Z"],
    )
    updated_at: datetime = Field(
        ...,
        description="Last update timestamp (UTC)",
        examples=["2024-01-15T12:00:00Z"],
    )


class JournalListResponse(BaseModel):
    """Paginated list of journals."""
    
    items: list[JournalResponse] = Field(
        ...,
        description="Array of journal objects",
    )
    total: int = Field(
        ...,
        description="Total count of journals",
        examples=[5],
        ge=0,
    )


class JournalDetailResponse(JournalResponse):
    """Detailed journal response including trades."""
    
    trades: list = Field(
        default=[],
        description="List of trades belonging to this journal (simplified view)",
    )