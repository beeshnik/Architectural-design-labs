"""Pydantic schemas for algorithms module with detailed API documentation."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AlgorithmBase(BaseModel):
    """Base schema for trading algorithm/strategy."""
    
    name: str = Field(
        ...,
        description="Name of the trading algorithm or strategy",
        examples=["Breakout Strategy v1", "Mean Reversion Bot", "Manual Discretion"],
        min_length=1,
        max_length=255,
    )
    body: str = Field(
        default="",
        description="Detailed description, code, or rules of the algorithm",
        examples=["Entry: price breaks 20-day high\nExit: trailing stop 2%"],
    )


class AlgorithmCreate(AlgorithmBase):
    """Schema for creating a new trading algorithm."""
    pass


class AlgorithmUpdate(BaseModel):
    """Schema for partial update of algorithm."""
    
    model_config = ConfigDict(from_attributes=True)
    
    name: str | None = Field(
        default=None,
        description="New algorithm name (optional)",
        examples=["Updated Strategy Name"],
        max_length=255,
    )
    body: str | None = Field(
        default=None,
        description="New algorithm description or code (optional)",
        examples=["Updated rules..."],
    )


class AlgorithmResponse(AlgorithmBase):
    """Algorithm response with metadata."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: str = Field(
        ...,
        description="Unique identifier (UUID) of the algorithm",
        examples=["550e8400-e29b-41d4-a716-446655440000"],
    )
    created_at: datetime = Field(
        ...,
        description="Algorithm creation timestamp (UTC)",
        examples=["2024-01-10T08:00:00Z"],
    )
    updated_at: datetime = Field(
        ...,
        description="Last modification timestamp (UTC)",
        examples=["2024-01-15T14:20:00Z"],
    )


class AlgorithmListResponse(BaseModel):
    """Paginated list of algorithms."""
    
    items: list[AlgorithmResponse] = Field(
        ...,
        description="Array of algorithm objects",
    )
    total: int = Field(
        ...,
        description="Total count of algorithms",
        examples=[12],
        ge=0,
    )