"""API router for trades."""
from typing import Annotated
from decimal import Decimal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db_session
from src.modules.trades.schemas import (
    AddPositionRequest,
    TradeCreate,
    TradeDetailResponse,
    TradeFilters,
    TradeListResponse,
    TradePositionResponse,
    TradeResponse,
    TradeUpdate,
)
from src.modules.trades.service import TradeService

router = APIRouter(prefix="/trades", tags=["trades"])


def get_trade_service(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> TradeService:
    """Dependency for trade service."""
    return TradeService(session)


def trade_to_response(trade) -> TradeResponse:
    """Convert trade model to response schema."""
    return TradeResponse(
        id=trade.id,
        journal_id=trade.journal_id,
        algorithm_id=trade.algorithm_id,
        opened_at=trade.opened_at,
        closed_at=trade.closed_at,
        ticker=trade.ticker,
        direction=trade.direction,
        initial_volume=trade.initial_volume,
        open_price=trade.open_price,
        close_price=trade.close_price,
        commission=trade.commission,
        positions=[
            TradePositionResponse.model_validate(p) for p in trade.positions
        ],
        pnl=trade.calculate_pnl(),
        current_volume=trade.get_current_volume(),
        created_at=trade.created_at,
        updated_at=trade.updated_at,
    )


def trade_to_detail_response(trade) -> TradeDetailResponse:
    """Convert trade model to detailed response schema."""
    return TradeDetailResponse(
        id=trade.id,
        journal_id=trade.journal_id,
        algorithm_id=trade.algorithm_id,
        opened_at=trade.opened_at,
        closed_at=trade.closed_at,
        ticker=trade.ticker,
        direction=trade.direction,
        initial_volume=trade.initial_volume,
        open_price=trade.open_price,
        close_price=trade.close_price,
        commission=trade.commission,
        positions=[
            TradePositionResponse.model_validate(p) for p in trade.positions
        ],
        pnl=trade.calculate_pnl(),
        current_volume=trade.get_current_volume(),
        total_added_volume=trade.get_total_added_volume(),
        total_reduced_volume=trade.get_total_reduced_volume(),
        created_at=trade.created_at,
        updated_at=trade.updated_at,
    )


@router.get("", response_model=TradeListResponse)
async def list_trades(
    service: Annotated[TradeService, Depends(get_trade_service)],
    journal_id: Annotated[str | None, Query()] = None,
    algorithm_id: Annotated[str | None, Query()] = None,
    ticker: Annotated[str | None, Query()] = None,
    direction: Annotated[str | None, Query(pattern="^(long|short)$")] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> TradeListResponse:
    """List all trades with optional filters and pagination."""
    filters = TradeFilters(
        journal_id=journal_id,
        algorithm_id=algorithm_id,
        ticker=ticker,
        direction=direction,
    )
    trades, total = await service.list_trades(filters=filters, skip=skip, limit=limit)
    return TradeListResponse(
        items=[trade_to_response(t) for t in trades],
        total=total,
    )


@router.post("", response_model=TradeResponse, status_code=status.HTTP_201_CREATED)
async def create_trade(
    data: TradeCreate,
    service: Annotated[TradeService, Depends(get_trade_service)],
) -> TradeResponse:
    """Create a new trade."""
    trade = await service.create_trade(data)
    return trade_to_response(trade)


@router.get("/{trade_id}", response_model=TradeDetailResponse)
async def get_trade(
    trade_id: str,
    service: Annotated[TradeService, Depends(get_trade_service)],
) -> TradeDetailResponse:
    """Get trade by ID with detailed information."""
    trade = await service.get_trade(trade_id)
    return trade_to_detail_response(trade)


@router.patch("/{trade_id}", response_model=TradeResponse)
async def update_trade(
    trade_id: str,
    data: TradeUpdate,
    service: Annotated[TradeService, Depends(get_trade_service)],
) -> TradeResponse:
    """Update an existing trade."""
    trade = await service.update_trade(trade_id, data)
    return trade_to_response(trade)


@router.delete("/{trade_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trade(
    trade_id: str,
    service: Annotated[TradeService, Depends(get_trade_service)],
) -> None:
    """Delete a trade."""
    await service.delete_trade(trade_id)


@router.post(
    "/{trade_id}/positions",
    response_model=TradePositionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_position(
    trade_id: str,
    data: AddPositionRequest,
    service: Annotated[TradeService, Depends(get_trade_service)],
) -> TradePositionResponse:
    """Add a position to an existing trade."""
    position = await service.add_position(trade_id, data)
    return TradePositionResponse.model_validate(position)
