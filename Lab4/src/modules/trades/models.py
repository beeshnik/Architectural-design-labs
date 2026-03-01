"""SQLAlchemy models for trades module."""
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base


class TradePosition(Base):
    """Individual position within a trade (partial open/close)."""

    __tablename__ = "trade_positions"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    trade_id: Mapped[str] = mapped_column(
        ForeignKey("trades.id", ondelete="CASCADE"),
        nullable=False,
    )
    price: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    volume: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    # Positive = adding position (buy for long, sell for short)
    # Negative = reducing position (sell for long, buy for short)
    position_type: Mapped[str] = mapped_column(String(10), nullable=False)  # "add" or "reduce"
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # Relationships
    trade: Mapped["Trade"] = relationship("Trade", back_populates="positions")


class Trade(Base):
    """Trade model with positions."""

    __tablename__ = "trades"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    journal_id: Mapped[str] = mapped_column(
        ForeignKey("journals.id", ondelete="CASCADE"),
        nullable=False,
    )
    algorithm_id: Mapped[str | None] = mapped_column(
        ForeignKey("algorithms.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Timestamps
    opened_at: Mapped[datetime] = mapped_column(nullable=False)
    closed_at: Mapped[datetime] = mapped_column(nullable=False)

    # Instrument
    ticker: Mapped[str] = mapped_column(String(50), nullable=False)

    # Direction: "long" or "short"
    direction: Mapped[str] = mapped_column(String(10), nullable=False)

    # Initial values
    initial_volume: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    open_price: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    close_price: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)

    # Commission
    commission: Mapped[Decimal] = mapped_column(
        Numeric(18, 8),
        nullable=False,
        default=Decimal("0"),
    )

    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationships
    journal: Mapped["Journal"] = relationship("Journal", back_populates="trades")  # type: ignore # noqa: F821
    algorithm: Mapped["Algorithm"] = relationship("Algorithm", back_populates="trades")  # type: ignore # noqa: F821
    positions: Mapped[list[TradePosition]] = relationship(
        "TradePosition",
        back_populates="trade",
        cascade="all, delete-orphan",
        order_by="TradePosition.created_at",
        lazy="selectin",
    )

    def calculate_pnl(self) -> Decimal:
        """Calculate profit/loss for this trade."""
        if self.direction == "long":
            gross_pnl = (self.close_price - self.open_price) * self.initial_volume
        else:  # short
            gross_pnl = (self.open_price - self.close_price) * self.initial_volume
        return gross_pnl - self.commission

    def get_total_added_volume(self) -> Decimal:
        """Get total volume added via positions."""
        total = Decimal("0")
        for pos in self.positions:
            if pos.position_type == "add":
                total += pos.volume
        return total

    def get_total_reduced_volume(self) -> Decimal:
        """Get total volume reduced via positions."""
        total = Decimal("0")
        for pos in self.positions:
            if pos.position_type == "reduce":
                total += pos.volume
        return total

    def get_current_volume(self) -> Decimal:
        """Get current open volume after all position changes."""
        return self.initial_volume + self.get_total_added_volume() - self.get_total_reduced_volume()
