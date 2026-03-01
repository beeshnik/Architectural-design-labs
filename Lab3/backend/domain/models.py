from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class TradePosition(BaseModel):
    price: Decimal = Field(..., decimal_places=8)
    volume: Decimal = Field(..., decimal_places=8)

class TradeCreate(BaseModel):
    journal_id: int
    instrument_name: str = Field(..., min_length=1, max_length=50)
    direction: Direction
    volume: Decimal = Field(..., gt=0)
    open_time: datetime
    close_time: datetime
    open_price: Decimal
    close_price: Decimal
    commission: Decimal = Field(default=0)
    positions: List[TradePosition] = []
    algorithm_id: Optional[int] = None

class TradeResponse(TradeCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

