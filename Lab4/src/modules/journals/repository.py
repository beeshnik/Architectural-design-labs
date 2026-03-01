"""Repository for journals."""
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.modules.journals.models import Journal


class JournalRepository:
    """Repository for journal CRUD operations."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, journal_id: str) -> Journal | None:
        """Get journal by ID."""
        result = await self.session.execute(
            select(Journal).where(Journal.id == journal_id)
        )
        return result.scalar_one_or_none()

    async def get_by_id_with_trades(self, journal_id: str) -> Journal | None:
        """Get journal by ID with trades loaded."""
        result = await self.session.execute(
            select(Journal)
            .where(Journal.id == journal_id)
            .options(selectinload(Journal.trades))
        )
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Journal]:
        """Get all journals with pagination."""
        result = await self.session.execute(
            select(Journal)
            .order_by(Journal.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def count_all(self) -> int:
        """Count total journals."""
        result = await self.session.execute(select(func.count(Journal.id)))
        return result.scalar_one()

    async def create(self, journal: Journal) -> Journal:
        """Create a new journal."""
        self.session.add(journal)
        await self.session.flush()
        await self.session.refresh(journal)
        return journal

    async def update(self, journal: Journal) -> Journal:
        """Update an existing journal."""
        await self.session.flush()
        await self.session.refresh(journal)
        return journal

    async def delete(self, journal: Journal) -> None:
        """Delete a journal."""
        await self.session.delete(journal)
        await self.session.flush()
