"""Service layer for algorithms."""
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.algorithms.models import Algorithm
from src.modules.algorithms.repository import AlgorithmRepository
from src.modules.algorithms.schemas import AlgorithmCreate, AlgorithmUpdate


class AlgorithmService:
    """Service for algorithm business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self.repository = AlgorithmRepository(session)

    async def get_algorithm(self, algorithm_id: str) -> Algorithm:
        """Get algorithm by ID with error handling."""
        algorithm = await self.repository.get_by_id(algorithm_id)
        if not algorithm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Algorithm with ID {algorithm_id} not found",
            )
        return algorithm

    async def list_algorithms(
        self, skip: int = 0, limit: int = 100
    ) -> tuple[list[Algorithm], int]:
        """List all algorithms with pagination."""
        algorithms = await self.repository.get_all(skip=skip, limit=limit)
        total = await self.repository.count_all()
        return algorithms, total

    async def create_algorithm(self, data: AlgorithmCreate) -> Algorithm:
        """Create a new algorithm."""
        algorithm = Algorithm(
            name=data.name,
            body=data.body,
        )
        return await self.repository.create(algorithm)

    async def update_algorithm(
        self, algorithm_id: str, data: AlgorithmUpdate
    ) -> Algorithm:
        """Update an existing algorithm."""
        algorithm = await self.get_algorithm(algorithm_id)

        if data.name is not None:
            algorithm.name = data.name
        if data.body is not None:
            algorithm.body = data.body

        return await self.repository.update(algorithm)

    async def delete_algorithm(self, algorithm_id: str) -> None:
        """Delete an algorithm and unlink from trades."""
        algorithm = await self.get_algorithm(algorithm_id)
        await self.repository.delete(algorithm)

    async def get_algorithms_by_ids(self, algorithm_ids: list[str]) -> list[Algorithm]:
        """Get multiple algorithms by IDs."""
        return await self.repository.get_by_ids(algorithm_ids)
