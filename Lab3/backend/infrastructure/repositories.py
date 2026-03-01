from sqlalchemy.orm import Session, joinedload
from infrastructure.database import TradeOrm, TradePositionOrm  # SQLAlchemy модели
from application.interfaces import ITradeRepository

class TradeRepositorySQL:
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, data: TradeCreate) -> TradeResponse:
        orm_trade = TradeOrm(
            journal_id=data.journal_id,
            instrument_name=data.instrument_name,
            direction=data.direction,
            volume=data.volume,
            # ... mapping other fields
            positions=[TradePositionOrm(price=p.price, volume=p.volume) for p in data.positions]
        )
        self.db.add(orm_trade)
        self.db.commit()
        self.db.refresh(orm_trade)
        return TradeResponse.model_validate(orm_trade)  # SQLAlchemy -> Pydantic

