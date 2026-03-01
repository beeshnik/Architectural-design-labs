"""Service layer for trades."""
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.trades.models import Trade, TradePosition
from src.modules.trades.repository import TradeRepository
from src.modules.trades.schemas import (
    AddPositionRequest,
    TradeCreate,
    TradeFilters,
    TradeUpdate,
)


def _to_naive_utc(dt: datetime) -> datetime:
    """Convert timezone-aware datetime to naive UTC."""
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


class TradeService:
    """Service for trade business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self.repository = TradeRepository(session)

    async def get_trade(self, trade_id: str) -> Trade:
        """Get trade by ID with error handling."""
        trade = await self.repository.get_by_id(trade_id)
        if not trade:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trade with ID {trade_id} not found",
            )
        return trade

    async def list_trades(
        self,
        filters: TradeFilters | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[Trade], int]:
        """List all trades with optional filters and pagination."""
        trades = await self.repository.get_all(filters=filters, skip=skip, limit=limit)
        total = await self.repository.count_all(filters=filters)
        return trades, total

    async def create_trade(self, data: TradeCreate) -> Trade:
        """Create a new trade with positions."""
        # Validate positions don't exceed initial volume
        self._validate_positions(data.initial_volume, data.positions)

        trade = Trade(
            journal_id=data.journal_id,
            algorithm_id=data.algorithm_id,
            opened_at=_to_naive_utc(data.opened_at),
            closed_at=_to_naive_utc(data.closed_at),
            ticker=data.ticker,
            direction=data.direction,
            initial_volume=data.initial_volume,
            open_price=data.open_price,
            close_price=data.close_price,
            commission=data.commission,
        )

        # Create trade first to get ID
        trade = await self.repository.create(trade)

        # Add positions
        for pos_data in data.positions:
            position = TradePosition(
                trade_id=trade.id,
                price=pos_data.price,
                volume=pos_data.volume,
                position_type=pos_data.position_type,
            )
            trade.positions.append(position)

        await self.repository.update(trade)
        return trade

    async def update_trade(self, trade_id: str, data: TradeUpdate) -> Trade:
        """Update an existing trade."""
        trade = await self.get_trade(trade_id)

        if data.opened_at is not None:
            trade.opened_at = _to_naive_utc(data.opened_at)
        if data.closed_at is not None:
            trade.closed_at = _to_naive_utc(data.closed_at)
        if data.ticker is not None:
            trade.ticker = data.ticker
        if data.direction is not None:
            trade.direction = data.direction
        if data.initial_volume is not None:
            trade.initial_volume = data.initial_volume
        if data.open_price is not None:
            trade.open_price = data.open_price
        if data.close_price is not None:
            trade.close_price = data.close_price
        if data.commission is not None:
            trade.commission = data.commission
        if data.algorithm_id is not None:
            trade.algorithm_id = data.algorithm_id

        return await self.repository.update(trade)

    async def delete_trade(self, trade_id: str) -> None:
        """Delete a trade."""
        trade = await self.get_trade(trade_id)
        await self.repository.delete(trade)

    async def add_position(
        self, trade_id: str, data: AddPositionRequest
    ) -> TradePosition:
        """Add a position to an existing trade with validation."""
        trade = await self.get_trade(trade_id)

        # Calculate current volume before adding position
        current_volume = trade.get_current_volume()

        if data.position_type == "add":
            # Adding to position is always allowed
            pass
        elif data.position_type == "reduce":
            # Cannot reduce more than current volume
            if data.volume > current_volume:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Cannot reduce volume by {data.volume} "
                        f"when current open volume is only {current_volume}"
                    ),
                )

        position = TradePosition(
            trade_id=trade.id,
            price=data.price,
            volume=data.volume,
            position_type=data.position_type,
        )

        return await self.repository.add_position(position)

    def _validate_positions(
        self,
        initial_volume: Decimal,
        positions: list,
    ) -> None:
        """Validate that positions don't exceed available volume."""
        current_volume = initial_volume

        for pos in positions:
            if pos.position_type == "add":
                current_volume += pos.volume
            elif pos.position_type == "reduce":
                if pos.volume > current_volume:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            f"Invalid position sequence: cannot reduce {pos.volume} "
                            f"when available volume is {current_volume}"
                        ),
                    )
                current_volume -= pos.volume

    async def get_journal_trades(self, journal_id: str) -> list[Trade]:
        """Get all trades for a specific journal."""
        return await self.repository.get_journal_trades(journal_id)
