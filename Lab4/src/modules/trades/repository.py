"""Repository for trades."""
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.modules.trades.models import Trade, TradePosition
from src.modules.trades.schemas import TradeFilters


class TradeRepository:
    """Repository for trade CRUD operations."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, trade_id: str) -> Trade | None:
        """Get trade by ID with positions."""
        result = await self.session.execute(
            select(Trade)
            .where(Trade.id == trade_id)
            .options(selectinload(Trade.positions))
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        filters: TradeFilters | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Trade]:
        """Get all trades with optional filters and pagination."""
        query = select(Trade).options(selectinload(Trade.positions))

        if filters:
            conditions = []
            if filters.journal_id:
                conditions.append(Trade.journal_id == filters.journal_id)
            if filters.algorithm_id:
                conditions.append(Trade.algorithm_id == filters.algorithm_id)
            if filters.ticker:
                conditions.append(Trade.ticker.ilike(f"%{filters.ticker}%"))
            if filters.direction:
                conditions.append(Trade.direction == filters.direction)
            if filters.from_date:
                conditions.append(Trade.opened_at >= filters.from_date)
            if filters.to_date:
                conditions.append(Trade.closed_at <= filters.to_date)
            if conditions:
                query = query.where(and_(*conditions))

        query = query.order_by(Trade.opened_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count_all(self, filters: TradeFilters | None = None) -> int:
        """Count total trades with optional filters."""
        query = select(func.count(Trade.id))

        if filters:
            conditions = []
            if filters.journal_id:
                conditions.append(Trade.journal_id == filters.journal_id)
            if filters.algorithm_id:
                conditions.append(Trade.algorithm_id == filters.algorithm_id)
            if filters.ticker:
                conditions.append(Trade.ticker.ilike(f"%{filters.ticker}%"))
            if filters.direction:
                conditions.append(Trade.direction == filters.direction)
            if filters.from_date:
                conditions.append(Trade.opened_at >= filters.from_date)
            if filters.to_date:
                conditions.append(Trade.closed_at <= filters.to_date)
            if conditions:
                query = query.where(and_(*conditions))

        result = await self.session.execute(query)
        return result.scalar_one()

    async def create(self, trade: Trade) -> Trade:
        """Create a new trade."""
        self.session.add(trade)
        await self.session.flush()
        await self.session.refresh(trade)
        return trade

    async def update(self, trade: Trade) -> Trade:
        """Update an existing trade."""
        await self.session.flush()
        await self.session.refresh(trade)
        return trade

    async def delete(self, trade: Trade) -> None:
        """Delete a trade."""
        await self.session.delete(trade)
        await self.session.flush()

    async def add_position(self, position: TradePosition) -> TradePosition:
        """Add a position to a trade."""
        self.session.add(position)
        await self.session.flush()
        await self.session.refresh(position)
        return position

    async def get_journal_trades(self, journal_id: str) -> list[Trade]:
        """Get all trades for a journal."""
        result = await self.session.execute(
            select(Trade)
            .where(Trade.journal_id == journal_id)
            .options(selectinload(Trade.positions))
            .order_by(Trade.opened_at.desc())
        )
        return list(result.scalars().all())

    async def unlink_algorithm(self, algorithm_id: str) -> None:
        """Set algorithm_id to NULL for all trades using this algorithm."""
        await self.session.execute(
            Trade.__table__.update()
            .where(Trade.algorithm_id == algorithm_id)
            .values(algorithm_id=None)
        )
