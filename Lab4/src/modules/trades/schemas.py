"""Pydantic schemas for trades module."""
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class TradePositionBase(BaseModel):
    """Base trade position schema."""

    price: Decimal = Field(..., gt=0)
    volume: Decimal = Field(..., gt=0)
    position_type: str = Field(..., pattern="^(add|reduce)$")


class TradePositionCreate(TradePositionBase):
    """Schema for creating a trade position."""

    pass


class TradePositionResponse(TradePositionBase):
    """Schema for trade position response."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    trade_id: str
    created_at: datetime


class TradeBase(BaseModel):
    """Base trade schema."""

    opened_at: datetime
    closed_at: datetime
    ticker: str = Field(..., min_length=1, max_length=50)
    direction: str = Field(..., pattern="^(long|short)$")
    initial_volume: Decimal = Field(..., gt=0)
    open_price: Decimal = Field(..., gt=0)
    close_price: Decimal = Field(..., gt=0)
    commission: Decimal = Field(default=Decimal("0"), ge=0)

    @model_validator(mode="after")
    def validate_dates(self) -> "TradeBase":
        """Validate that closed_at is after opened_at."""
        if self.closed_at <= self.opened_at:
            raise ValueError("closed_at must be after opened_at")
        return self


class TradeCreate(TradeBase):
    """Schema for creating a trade."""

    journal_id: str
    algorithm_id: str | None = None
    positions: list[TradePositionCreate] = Field(default_factory=list)


class TradeUpdate(BaseModel):
    """Schema for updating a trade."""

    opened_at: datetime | None = None
    closed_at: datetime | None = None
    ticker: str | None = Field(default=None, min_length=1, max_length=50)
    direction: str | None = Field(default=None, pattern="^(long|short)$")
    initial_volume: Decimal | None = Field(default=None, gt=0)
    open_price: Decimal | None = Field(default=None, gt=0)
    close_price: Decimal | None = Field(default=None, gt=0)
    commission: Decimal | None = Field(default=None, ge=0)
    algorithm_id: str | None = None

    @model_validator(mode="after")
    def validate_dates(self) -> "TradeUpdate":
        """Validate that closed_at is after opened_at if both provided."""
        if self.closed_at and self.opened_at and self.closed_at <= self.opened_at:
            raise ValueError("closed_at must be after opened_at")
        return self


class AddPositionRequest(BaseModel):
    """Schema for adding a position to an existing trade."""

    price: Decimal = Field(..., gt=0)
    volume: Decimal = Field(..., gt=0)
    position_type: str = Field(..., pattern="^(add|reduce)$")


class TradeResponse(TradeBase):
    """Schema for trade response."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    journal_id: str
    algorithm_id: str | None
    positions: list[TradePositionResponse]
    pnl: Decimal
    current_volume: Decimal
    created_at: datetime
    updated_at: datetime


class TradeDetailResponse(TradeResponse):
    """Schema for detailed trade response with additional calculations."""

    total_added_volume: Decimal
    total_reduced_volume: Decimal


class TradeListResponse(BaseModel):
    """Schema for list of trades."""

    items: list[TradeResponse]
    total: int


class TradeFilters(BaseModel):
    """Schema for trade filtering."""

    journal_id: str | None = None
    algorithm_id: str | None = None
    ticker: str | None = None
    direction: str | None = Field(default=None, pattern="^(long|short)$")
    from_date: datetime | None = None
    to_date: datetime | None = None

