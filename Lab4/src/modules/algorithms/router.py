"""API router for algorithms."""
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db_session
from src.modules.algorithms.schemas import (
    AlgorithmCreate,
    AlgorithmListResponse,
    AlgorithmResponse,
    AlgorithmUpdate,
)
from src.modules.algorithms.service import AlgorithmService

router = APIRouter(prefix="/algorithms", tags=["algorithms"])


def get_algorithm_service(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> AlgorithmService:
    """Dependency for algorithm service."""
    return AlgorithmService(session)


@router.get("", response_model=AlgorithmListResponse)
async def list_algorithms(
    service: Annotated[AlgorithmService, Depends(get_algorithm_service)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> AlgorithmListResponse:
    """List all algorithms with pagination."""
    algorithms, total = await service.list_algorithms(skip=skip, limit=limit)
    return AlgorithmListResponse(
        items=[AlgorithmResponse.model_validate(a) for a in algorithms],
        total=total,
    )


@router.post("", response_model=AlgorithmResponse, status_code=status.HTTP_201_CREATED)
async def create_algorithm(
    data: AlgorithmCreate,
    service: Annotated[AlgorithmService, Depends(get_algorithm_service)],
) -> AlgorithmResponse:
    """Create a new algorithm."""
    algorithm = await service.create_algorithm(data)
    return AlgorithmResponse.model_validate(algorithm)


@router.get("/{algorithm_id}", response_model=AlgorithmResponse)
async def get_algorithm(
    algorithm_id: str,
    service: Annotated[AlgorithmService, Depends(get_algorithm_service)],
) -> AlgorithmResponse:
    """Get algorithm by ID."""
    algorithm = await service.get_algorithm(algorithm_id)
    return AlgorithmResponse.model_validate(algorithm)


@router.patch("/{algorithm_id}", response_model=AlgorithmResponse)
async def update_algorithm(
    algorithm_id: str,
    data: AlgorithmUpdate,
    service: Annotated[AlgorithmService, Depends(get_algorithm_service)],
) -> AlgorithmResponse:
    """Update an existing algorithm."""
    algorithm = await service.update_algorithm(algorithm_id, data)
    return AlgorithmResponse.model_validate(algorithm)


@router.delete("/{algorithm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_algorithm(
    algorithm_id: str,
    service: Annotated[AlgorithmService, Depends(get_algorithm_service)],
) -> None:
    """Delete an algorithm."""
    await service.delete_algorithm(algorithm_id)
