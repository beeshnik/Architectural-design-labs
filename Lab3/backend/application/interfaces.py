from typing import Protocol, List, Optional
from domain.models import TradeResponse, TradeCreate

class ITradeRepository(Protocol):
    def create(self, trade: TradeCreate) -> TradeResponse: ...
    def get_by_journal(self, journal_id: int) -> List[TradeResponse]: ...

class IEventPublisher(Protocol):
    def publish(self, event_type: str, payload: dict) -> None: ...

