"""SQLAlchemy models for algorithms module."""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base


class Algorithm(Base):
    """Algorithm model for trading strategies."""

    __tablename__ = "algorithms"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationships
    trades: Mapped[list["Trade"]] = relationship(  # type: ignore # noqa: F821
        "Trade",
        back_populates="algorithm",
        lazy="selectin",
    )
