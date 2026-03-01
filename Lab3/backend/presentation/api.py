from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from infrastructure.database import get_db
from infrastructure.repositories import TradeRepositorySQL
from infrastructure.messaging import KafkaPublisher
from application.services import TradeService
from domain.models import TradeCreate, TradeResponse

router = APIRouter()

def get_trade_service(db: Session = Depends(get_db)) -> TradeService:
    # Dependency Injection (DIP)
    repo = TradeRepositorySQL(db)
    publisher = KafkaPublisher()  # или DummyPublisher для тестов
    return TradeService(repo, publisher)

@router.post("/trades", response_model=TradeResponse, status_code=201)
def create_trade(
    data: TradeCreate,
    service: TradeService = Depends(get_trade_service)
):
    try:
        return service.create_trade(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))