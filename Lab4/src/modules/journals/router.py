"""API router for journals."""
from typing import Annotated
from decimal import Decimal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db_session
from src.modules.journals.schemas import (
    JournalCreate,
    JournalDetailResponse,
    JournalListResponse,
    JournalResponse,
    JournalUpdate,
)
from src.modules.journals.service import JournalService

router = APIRouter(prefix="/journals", tags=["journals"])


def get_journal_service(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> JournalService:
    """Dependency for journal service."""
    return JournalService(session)


@router.get("", response_model=JournalListResponse)
async def list_journals(
    service: Annotated[JournalService, Depends(get_journal_service)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> JournalListResponse:
    """List all journals with pagination."""
    journals, total = await service.list_journals(skip=skip, limit=limit)
    return JournalListResponse(
        items=[
            JournalResponse(
                id=j.id,
                name=j.name,
                deposit_balance=j.deposit_balance,
                has_api_keys=service.has_api_keys(j),
                created_at=j.created_at,
                updated_at=j.updated_at,
            )
            for j in journals
        ],
        total=total,
    )


@router.post("", response_model=JournalResponse, status_code=status.HTTP_201_CREATED)
async def create_journal(
    data: JournalCreate,
    service: Annotated[JournalService, Depends(get_journal_service)],
) -> JournalResponse:
    """Create a new journal."""
    journal = await service.create_journal(data)
    return JournalResponse(
        id=journal.id,
        name=journal.name,
        deposit_balance=journal.deposit_balance,
        has_api_keys=service.has_api_keys(journal),
        created_at=journal.created_at,
        updated_at=journal.updated_at,
    )


@router.get("/{journal_id}", response_model=JournalDetailResponse)
async def get_journal(
    journal_id: str,
    service: Annotated[JournalService, Depends(get_journal_service)],
) -> JournalDetailResponse:
    """Get journal by ID with calculated balance."""
    journal = await service.get_journal_with_trades(journal_id)
    calculated_balance = service.calculate_balance_from_trades(journal)
    return JournalDetailResponse(
        id=journal.id,
        name=journal.name,
        deposit_balance=journal.deposit_balance,
        has_api_keys=service.has_api_keys(journal),
        created_at=journal.created_at,
        updated_at=journal.updated_at,
        calculated_balance=calculated_balance,
        balance_difference=calculated_balance - journal.deposit_balance,
    )


@router.patch("/{journal_id}", response_model=JournalResponse)
async def update_journal(
    journal_id: str,
    data: JournalUpdate,
    service: Annotated[JournalService, Depends(get_journal_service)],
) -> JournalResponse:
    """Update an existing journal."""
    journal = await service.update_journal(journal_id, data)
    return JournalResponse(
        id=journal.id,
        name=journal.name,
        deposit_balance=journal.deposit_balance,
        has_api_keys=service.has_api_keys(journal),
        created_at=journal.created_at,
        updated_at=journal.updated_at,
    )


@router.delete("/{journal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_journal(
    journal_id: str,
    service: Annotated[JournalService, Depends(get_journal_service)],
) -> None:
    """Delete a journal and all its trades."""
    await service.delete_journal(journal_id)
