"""Repository for algorithms."""
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.algorithms.models import Algorithm


class AlgorithmRepository:
    """Repository for algorithm CRUD operations."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, algorithm_id: str) -> Algorithm | None:
        """Get algorithm by ID."""
        result = await self.session.execute(
            select(Algorithm).where(Algorithm.id == algorithm_id)
        )
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Algorithm]:
        """Get all algorithms with pagination."""
        result = await self.session.execute(
            select(Algorithm)
            .order_by(Algorithm.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def count_all(self) -> int:
        """Count total algorithms."""
        result = await self.session.execute(select(func.count(Algorithm.id)))
        return result.scalar_one()

    async def create(self, algorithm: Algorithm) -> Algorithm:
        """Create a new algorithm."""
        self.session.add(algorithm)
        await self.session.flush()
        await self.session.refresh(algorithm)
        return algorithm

    async def update(self, algorithm: Algorithm) -> Algorithm:
        """Update an existing algorithm."""
        await self.session.flush()
        await self.session.refresh(algorithm)
        return algorithm

    async def delete(self, algorithm: Algorithm) -> None:
        """Delete an algorithm."""
        await self.session.delete(algorithm)
        await self.session.flush()

    async def get_by_ids(self, algorithm_ids: list[str]) -> list[Algorithm]:
        """Get multiple algorithms by IDs."""
        result = await self.session.execute(
            select(Algorithm).where(Algorithm.id.in_(algorithm_ids))
        )
        return list(result.scalars().all())
