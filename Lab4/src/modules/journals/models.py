"""SQLAlchemy models for journals module."""
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base


class Journal(Base):
    """Trading journal model."""

    __tablename__ = "journals"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    deposit_balance: Mapped[Decimal] = mapped_column(
        Numeric(18, 8),
        nullable=False,
        default=Decimal("0"),
    )
    # Encrypted Bybit API credentials
    bybit_api_key: Mapped[str | None] = mapped_column(Text, nullable=True)
    bybit_api_secret: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationships
    trades: Mapped[list["Trade"]] = relationship(  # type: ignore # noqa: F821
        "Trade",
        back_populates="journal",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
