from decimal import Decimal

class TradeService:
    def __init__(self, repo: ITradeRepository, publisher: IEventPublisher):
        self.repo = repo
        self.publisher = publisher

    def create_trade(self, data: TradeCreate) -> TradeResponse:
        # Простая бизнес-валидация (KISS)
        if data.open_time >= data.close_time:
            raise ValueError("Время открытия должно быть раньше закрытия")
        if data.direction == Direction.LONG and data.open_price >= data.close_price:
            # Можно добавить логику PnL здесь, но YAGNI - пока только сохраняем
            pass
            
        trade = self.repo.create(data)
        
        # Асинхронное событие (SRP: сервис не знает про Kafka, только про интерфейс)
        self.publisher.publish("TradeCreated", {"trade_id": trade.id, "journal_id": trade.journal_id})
        return trade

