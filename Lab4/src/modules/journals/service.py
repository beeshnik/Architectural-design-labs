"""Service layer for journals."""
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.encryption import encrypt_value
from src.modules.journals.models import Journal
from src.modules.journals.repository import JournalRepository
from src.modules.journals.schemas import JournalCreate, JournalUpdate


class JournalService:
    """Service for journal business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self.repository = JournalRepository(session)

    async def get_journal(self, journal_id: str) -> Journal:
        """Get journal by ID with error handling."""
        journal = await self.repository.get_by_id(journal_id)
        if not journal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Journal with ID {journal_id} not found",
            )
        return journal

    async def get_journal_with_trades(self, journal_id: str) -> Journal:
        """Get journal with trades by ID."""
        journal = await self.repository.get_by_id_with_trades(journal_id)
        if not journal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Journal with ID {journal_id} not found",
            )
        return journal

    async def list_journals(
        self, skip: int = 0, limit: int = 100
    ) -> tuple[list[Journal], int]:
        """List all journals with pagination."""
        journals = await self.repository.get_all(skip=skip, limit=limit)
        total = await self.repository.count_all()
        return journals, total

    async def create_journal(self, data: JournalCreate) -> Journal:
        """Create a new journal."""
        journal = Journal(
            name=data.name,
            deposit_balance=data.deposit_balance,
            bybit_api_key=encrypt_value(data.bybit_api_key) if data.bybit_api_key else None,
            bybit_api_secret=encrypt_value(data.bybit_api_secret) if data.bybit_api_secret else None,
        )
        return await self.repository.create(journal)

    async def update_journal(self, journal_id: str, data: JournalUpdate) -> Journal:
        """Update an existing journal."""
        journal = await self.get_journal(journal_id)

        if data.name is not None:
            journal.name = data.name
        if data.deposit_balance is not None:
            journal.deposit_balance = data.deposit_balance
        if data.bybit_api_key is not None:
            journal.bybit_api_key = encrypt_value(data.bybit_api_key)
        if data.bybit_api_secret is not None:
            journal.bybit_api_secret = encrypt_value(data.bybit_api_secret)

        return await self.repository.update(journal)

    async def delete_journal(self, journal_id: str) -> None:
        """Delete a journal and all its trades (cascade)."""
        journal = await self.get_journal(journal_id)
        await self.repository.delete(journal)

    def calculate_balance_from_trades(self, journal: Journal) -> Decimal:
        """Calculate balance based on all trades PnL."""
        total_pnl = Decimal("0")
        for trade in journal.trades:
            # Calculate PnL for each trade
            pnl = trade.calculate_pnl()
            total_pnl += pnl
        return journal.deposit_balance + total_pnl

    def has_api_keys(self, journal: Journal) -> bool:
        """Check if journal has API keys configured."""
        return bool(journal.bybit_api_key and journal.bybit_api_secret)
