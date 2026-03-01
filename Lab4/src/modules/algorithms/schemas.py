"""Pydantic schemas for algorithms module."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AlgorithmBase(BaseModel):
    """Base algorithm schema."""

    name: str = Field(..., min_length=1, max_length=255)
    body: str = Field(default="")


class AlgorithmCreate(AlgorithmBase):
    """Schema for creating an algorithm."""

    pass


class AlgorithmUpdate(BaseModel):
    """Schema for updating an algorithm."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    body: str | None = None


class AlgorithmResponse(AlgorithmBase):
    """Schema for algorithm response."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime


class AlgorithmListResponse(BaseModel):
    """Schema for list of algorithms."""

    items: list[AlgorithmResponse]
    total: int
