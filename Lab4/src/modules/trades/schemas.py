"""Pydantic schemas for trades module with detailed API documentation."""
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class TradePositionBase(BaseModel):
    """Base schema for trade position."""
    
    price: Decimal = Field(
        ...,
        description="Execution price of the position",
        examples=["45000.50"],
        gt=0,
    )
    volume: Decimal = Field(
        ...,
        description="Volume/quantity of the position",
        examples=["0.5"],
        gt=0,
    )
    position_type: str = Field(
        ...,
        description="Type of position operation: 'add' to increase position, 'reduce' to decrease",
        examples=["add", "reduce"],
        pattern="^(add|reduce)$",
    )


class TradePositionCreate(TradePositionBase):
    """Schema for creating a new position within a trade."""
    pass


class TradePositionResponse(TradePositionBase):
    """Schema for position response with system fields."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: str = Field(
        ...,
        description="Unique identifier (UUID) of the position",
        examples=["550e8400-e29b-41d4-a716-446655440000"],
    )
    trade_id: str = Field(
        ...,
        description="ID of the parent trade this position belongs to",
        examples=["550e8400-e29b-41d4-a716-446655440001"],
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when the position was recorded (UTC)",
        examples=["2024-01-15T10:30:00Z"],
    )


class TradeBase(BaseModel):
    """Base schema containing common trade fields."""
    
    ticker: str = Field(
        ...,
        description="Trading pair or instrument symbol (e.g., BTCUSDT, AAPL)",
        examples=["BTCUSDT", "ETHUSDT", "AAPL"],
        min_length=1,
        max_length=50,
    )
    direction: str = Field(
        ...,
        description="Trade direction: 'long' (buy to sell higher) or 'short' (sell to buy lower)",
        examples=["long", "short"],
        pattern="^(long|short)$",
    )
    initial_volume: Decimal = Field(
        ...,
        description="Initial position volume/size at trade opening",
        examples=["1.5", "100"],
        gt=0,
    )
    open_price: Decimal = Field(
        ...,
        description="Entry price per unit at trade opening",
        examples=["42000.00"],
        gt=0,
    )
    close_price: Decimal = Field(
        ...,
        description="Exit price per unit at trade closing",
        examples=["45000.50"],
        gt=0,
    )
    commission: Decimal = Field(
        default=Decimal("0"),
        description="Total commission/fees paid for the trade (in quote currency)",
        examples=["5.25", "0"],
        ge=0,
    )


class TradeCreate(TradeBase):
    """Schema for creating a new trade with nested positions.
    
    Creates a complete trade record including all partial position operations.
    Positions sequence is validated to ensure volume never goes negative.
    """
    
    journal_id: str = Field(
        ...,
        description="ID of the journal this trade belongs to",
        examples=["550e8400-e29b-41d4-a716-446655440002"],
    )
    algorithm_id: str | None = Field(
        default=None,
        description="ID of the algorithm/strategy used (optional, can be null if manual trading)",
        examples=["550e8400-e29b-41d4-a716-446655440003", None],
    )
    opened_at: datetime = Field(
        ...,
        description="Timestamp when the trade was opened (entry time)",
        examples=["2024-01-15T10:00:00Z"],
    )
    closed_at: datetime = Field(
        ...,
        description="Timestamp when the trade was closed (exit time), must be after opened_at",
        examples=["2024-01-15T14:30:00Z"],
    )
    positions: list[TradePositionCreate] = Field(
        default=[],
        description="List of partial position operations (adds/reduces) during the trade lifecycle",
        examples=[[{"price": "42000.00", "volume": "1.0", "position_type": "add"}]],
    )


class TradeUpdate(BaseModel):
    """Schema for updating an existing trade (partial update).
    
    Only provided fields will be updated. Null fields are ignored.
    """
    
    model_config = ConfigDict(from_attributes=True)
    
    opened_at: datetime | None = Field(
        default=None,
        description="New opening timestamp (optional)",
        examples=["2024-01-15T10:00:00Z"],
    )
    closed_at: datetime | None = Field(
        default=None,
        description="New closing timestamp (optional)",
        examples=["2024-01-15T14:30:00Z"],
    )
    ticker: str | None = Field(
        default=None,
        description="New ticker symbol (optional)",
        examples=["BTCUSDT"],
        max_length=50,
    )
    direction: str | None = Field(
        default=None,
        description="New trade direction (optional)",
        examples=["long"],
        pattern="^(long|short)$",
    )
    initial_volume: Decimal | None = Field(
        default=None,
        description="New initial volume (optional)",
        examples=["2.0"],
        gt=0,
    )
    open_price: Decimal | None = Field(
        default=None,
        description="New entry price (optional)",
        examples=["43000.00"],
        gt=0,
    )
    close_price: Decimal | None = Field(
        default=None,
        description="New exit price (optional)",
        examples=["46000.00"],
        gt=0,
    )
    commission: Decimal | None = Field(
        default=None,
        description="New commission value (optional)",
        examples=["6.00"],
        ge=0,
    )
    algorithm_id: str | None = Field(
        default=None,
        description="New algorithm ID or null to unlink (optional)",
        examples=["550e8400-e29b-41d4-a716-446655440003"],
    )


class TradeFilters(BaseModel):
    """Schema for filtering trades list query."""
    
    model_config = ConfigDict(from_attributes=True)
    
    journal_id: str | None = Field(
        default=None,
        description="Filter by specific journal ID",
        examples=["550e8400-e29b-41d4-a716-446655440002"],
    )
    algorithm_id: str | None = Field(
        default=None,
        description="Filter by algorithm ID (use 'null' for manual trades)",
        examples=["550e8400-e29b-41d4-a716-446655440003"],
    )
    ticker: str | None = Field(
        default=None,
        description="Filter by ticker (partial match, case-insensitive)",
        examples=["BTC", "ETH"],
    )
    direction: str | None = Field(
        default=None,
        description="Filter by trade direction",
        examples=["long"],
        pattern="^(long|short)$",
    )
    from_date: datetime | None = Field(
        default=None,
        description="Filter trades opened after this date (inclusive)",
        examples=["2024-01-01T00:00:00Z"],
    )
    to_date: datetime | None = Field(
        default=None,
        description="Filter trades opened before this date (inclusive)",
        examples=["2024-12-31T23:59:59Z"],
    )


class TradeResponse(TradeBase):
    """Standard trade response schema with computed fields."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: str = Field(
        ...,
        description="Unique identifier (UUID) of the trade",
        examples=["550e8400-e29b-41d4-a716-446655440001"],
    )
    journal_id: str = Field(
        ...,
        description="ID of the journal containing this trade",
        examples=["550e8400-e29b-41d4-a716-446655440002"],
    )
    algorithm_id: str | None = Field(
        ...,
        description="ID of the used algorithm, null if manual trading",
        examples=[None],
    )
    positions: list[TradePositionResponse] = Field(
        default=[],
        description="List of position operations included in this trade",
    )
    pnl: Decimal = Field(
        ...,
        description="Profit/Loss calculated from (close_price - open_price) * volume - commission",
        examples=["305.50", "-50.25"],
    )
    current_volume: Decimal = Field(
        ...,
        description="Current open volume after all position adjustments (initial + adds - reduces)",
        examples=["1.5"],
    )
    created_at: datetime = Field(
        ...,
        description="Record creation timestamp (UTC)",
        examples=["2024-01-15T10:00:00Z"],
    )
    updated_at: datetime = Field(
        ...,
        description="Last modification timestamp (UTC)",
        examples=["2024-01-15T14:30:00Z"],
    )


class TradeDetailResponse(TradeResponse):
    """Detailed trade response with additional statistics."""
    
    total_added_volume: Decimal = Field(
        ...,
        description="Sum of all 'add' position volumes",
        examples=["0.5"],
    )
    total_reduced_volume: Decimal = Field(
        ...,
        description="Sum of all 'reduce' position volumes",
        examples=["0.0"],
    )


class TradeListResponse(BaseModel):
    """Paginated list of trades response."""
    
    items: list[TradeResponse] = Field(
        ...,
        description="Array of trade objects for current page",
    )
    total: int = Field(
        ...,
        description="Total count of trades matching the query (for pagination)",
        examples=[150],
        ge=0,
    )


class AddPositionRequest(BaseModel):
    """Schema for adding a new position to existing trade."""
    
    price: Decimal = Field(
        ...,
        description="Execution price of this position operation",
        examples=["44500.00"],
        gt=0,
    )
    volume: Decimal = Field(
        ...,
        description="Volume to add or reduce",
        examples=["0.25"],
        gt=0,
    )
    position_type: str = Field(
        ...,
        description="Operation type: 'add' increases exposure, 'reduce' decreases it",
        examples=["add"],
        pattern="^(add|reduce)$",
    )