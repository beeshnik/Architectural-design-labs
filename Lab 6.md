## Типовые шаблоны проектирования GoF (Gang of Four)
### Порождающие шаблоны
---
#### 1. Singleton

`src/core/config.py`
```python
@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
```

**Объяснение**: Функция `get_settings()` с декоратором `@lru_cache` гарантирует, что объект `Settings` создаётся только один раз и переиспользуется. Это классическая реализация Singleton в Python — глобальная точка доступа к единственному экземпляру настроек приложения.

```plantuml
@startuml
!theme plain
skinparam classAttributeIconSize 0

class Settings {
  -app_name: str
  -database_url: str
  -encryption_key: str
  --
  +model_config: SettingsConfigDict
}

class "<<module>>\nconfig" as ConfigModule {
  {static} +get_settings(): Settings
  --
  <<note>>
  @lru_cache decorator
  ensures single instance
  end note
}

class Client {
  +use_settings()
}

Settings -- ConfigModule : creates & caches
ConfigModule .. Client : returns single instance

note right of ConfigModule::get_settings
  Singleton Pattern:
  - Single instance via @lru_cache
  - Global access point
  - Lazy initialization
end note

@enduml
```
<img width="506" height="481" alt="image" src="https://github.com/user-attachments/assets/41121f11-2930-47a2-a1f8-f59d048fa0cf" />

#### 2. Factory Method

`src/main.py`:
```python
def create_application() -> FastAPI:
    """Application factory."""
    settings = get_settings()
    app = FastAPI(...)
    ...
    return app
```

**Объяснение**: Функция `create_application()` является фабрикой, которая создаёт и конфигурирует экземпляр FastAPI приложения. Это позволяет отделить логику создания приложения от его использования и облегчает тестирование (можно создать тестовое приложение с другими настройками).

```plantuml
@startuml
!theme plain
skinparam classAttributeIconSize 0

class FastAPI {
  +title: str
  +description: str
  +version: str
}

class "<<module>>\nmain" as MainModule {
  {static} +create_application(): FastAPI
  +init_database()
  --
  <<creates>>
}

class Settings {
  +app_name: str
  +debug: bool
}

class CORSMiddleware
class TradesRouter
class JournalsRouter
class AlgorithmsRouter

MainModule ..> Settings : uses
MainModule ..> FastAPI : <<creates>>
FastAPI ..> CORSMiddleware : configures
FastAPI ..> TradesRouter : includes
FastAPI ..> JournalsRouter : includes
FastAPI ..> AlgorithmsRouter : includes

note right of MainModule::create_application
  Factory Method Pattern:
  - Encapsulates creation logic
  - Configures object before returning
  - Enables test-specific instances
end note

@enduml
```
<img width="826" height="416" alt="image" src="https://github.com/user-attachments/assets/8f9a5863-6d76-4e99-aaec-2b7fd8f5c835" />

#### 3. Builder

Неявно в `TradeService.create_trade()` и `TradePosition`
```python
# В TradeService.create_trade():
trade = Trade(
    journal_id=data.journal_id,
    algorithm_id=data.algorithm_id,
    opened_at=_to_naive_utc(data.opened_at),
    ...
)

# Добавление позиций постепенно:
for pos_data in data.positions:
    position = TradePosition(...)
    trade.positions.append(position)
```

**Объяснение**: Процесс создания сложного объекта `Trade` с вложенными `TradePosition` выполняется пошагово — сначала создаётся базовая сущность, затем постепенно добавляются позиции. Это паттерн Builder, где сложный объект конструируется по частям.

```plantuml
@startuml
!theme plain
skinparam classAttributeIconSize 0

class Trade {
  +id: str
  +journal_id: str
  +algorithm_id: str
  +opened_at: datetime
  +closed_at: datetime
  +ticker: str
  +direction: str
  +initial_volume: Decimal
  +open_price: Decimal
  +close_price: Decimal
  +commission: Decimal
  +positions: List~TradePosition~
}

class TradePosition {
  +id: str
  +trade_id: str
  +price: Decimal
  +volume: Decimal
  +position_type: str
}

class TradeService {
  +create_trade(data: TradeCreate): Trade
  --
  -_validate_positions()
  -_to_naive_utc(dt)
}

class TradeCreate {
  +journal_id: str
  +algorithm_id: str
  +positions: List~PositionData~
  ...
}

Trade "1" *-- "*" TradePosition : contains
TradeService ..> Trade : <<builds step by step>>
TradeService ..> TradePosition : <<creates and appends>>
TradeService ..> TradeCreate : uses

note right of TradeService::create_trade
  Builder Pattern (implicit):
  1. Create base Trade object
  2. Iterate positions
  3. Create TradePosition objects
  4. Append to trade.positions
  5. Update trade in DB
end note

@enduml
```
<img width="747" height="646" alt="image" src="https://github.com/user-attachments/assets/812717da-f277-4f10-882d-f2b5e57ea41c" />


### Структурные шаблоны
---
#### 1. Repository

`src/modules/*/repository.py`
```python
class TradeRepository:
    """Repository for trade CRUD operations."""
    
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, trade_id: str) -> Trade | None:
        ...
    
    async def create(self, trade: Trade) -> Trade:
        ...
```

**Объяснение**: Паттерн Repository абстрагирует доступ к данным, предоставляя коллекцию-подобный интерфейс для работы с доменными объектами. Каждый модуль имеет свой Repository (`TradeRepository`, `JournalRepository`, `AlgorithmRepository`), что изолирует логику доступа к БД от бизнес-логики.

```plantuml
@startuml
!theme plain
skinparam classAttributeIconSize 0

interface IRepository~T~ {
  +get_by_id(id): T | None
  +get_all(filters, skip, limit): List~T~
  +count_all(filters): int
  +create(entity): T
  +update(entity): T
  +delete(entity): void
}

class TradeRepository {
  -session: AsyncSession
  +get_by_id(trade_id): Trade
  +get_all(filters, skip, limit): List~Trade~
  +count_all(filters): int
  +create(trade): Trade
  +update(trade): Trade
  +delete(trade): void
  +add_position(position): TradePosition
  +unlink_algorithm(algorithm_id): void
}

class JournalRepository {
  -session: AsyncSession
  +get_by_id(journal_id): Journal
  +get_by_id_with_trades(journal_id): Journal
  ...
}

class AlgorithmRepository {
  -session: AsyncSession
  +get_by_id(algorithm_id): Algorithm
  +get_by_ids(ids): List~Algorithm~
  ...
}

class AsyncSession {
  +execute(query): Result
  +add(entity): void
  +flush(): void
  +commit(): void
  +rollback(): void
}

IRepository <|-- TradeRepository
IRepository <|-- JournalRepository
IRepository <|-- AlgorithmRepository

TradeRepository ..> AsyncSession : uses
JournalRepository ..> AsyncSession : uses
AlgorithmRepository ..> AsyncSession : uses

note right of TradeRepository
  Repository Pattern:
  - Abstracts data access
  - Collection-like interface
  - Hides SQLAlchemy details
  - Enables testing with mocks
end note

@enduml
```
<img width="1208" height="613" alt="image" src="https://github.com/user-attachments/assets/bb024377-00d8-4fd9-b59a-e124b0527c2c" />


#### 2. Facade

`src/core/database.py`
```python
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async database sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

**Объяснение**: Функция `get_db_session()` предоставляет упрощённый интерфейс для работы с сложной подсистемой SQLAlchemy (engine, session factory, commit/rollback логика). Роутеры используют этот "фасад" через FastAPI Depends, не зная деталей реализации.

```plantuml
@startuml
!theme plain
skinparam classAttributeIconSize 0

package "SQLAlchemy Subsystem" as SQLAlchemy {
  class AsyncEngine {
    +begin(): AsyncContextManager
  }
  
  class async_sessionmaker {
    +__call__(): AsyncSession
  }
  
  class AsyncSessionLocal {
    +create_session(): AsyncSession
  }
  
  class AsyncSession {
    +execute()
    +commit()
    +rollback()
    +close()
  }
}

class "<<module>>\ndatabase" as DatabaseModule {
  +get_db_session(): AsyncGenerator~AsyncSession~
  +get_db_context(): AsyncContextManager~AsyncSession~
}

class TradeRouter {
  +list_trades(session: AsyncSession)
  +create_trade(session: AsyncSession)
}

class FastAPI {
  +Depends(dependency)
}

AsyncEngine -- AsyncSessionLocal : creates
AsyncSessionLocal .. AsyncSession : produces

DatabaseModule ..> AsyncSessionLocal : <<hides complexity>>
DatabaseModule ..> AsyncSession : <<manages lifecycle>>

TradeRouter ..> DatabaseModule::get_db_session : uses via\nFastAPI Depends

note bottom of DatabaseModule
  Facade Pattern:
  - Simplifies complex SQLAlchemy API
  - Manages session lifecycle
  - Provides single entry point
  - Hides: engine, sessionmaker, 
    commit/rollback, cleanup
end note

@enduml
```

<img width="1115" height="667" alt="image" src="https://github.com/user-attachments/assets/f4fa649e-ac6d-4202-8e04-0bafd8fe8570" />

#### 3. Dependency Injection

`src/modules/*/router.py`, `src/modules/*/service.py`
```python
# В роутерах:
def get_trade_service(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> TradeService:
    return TradeService(session)

# В сервисах:
class TradeService:
    def __init__(self, session: AsyncSession) -> None:
        self.repository = TradeRepository(session)
```

**Объяснение**: Зависимости (сессии БД, репозитории) внедряются извне через конструкторы. Это позволяет легко заменять реализации (например, моки для тестов) и уменьшает связанность между компонентами.

```plantuml
@startuml
!theme plain
skinparam classAttributeIconSize 0

class TradeRouter {
  +list_trades(service: TradeService)
  +create_trade(service: TradeService)
}

class FastAPIDepends {
  +get_db_session(): AsyncSession
  +get_trade_service(session): TradeService
}

class TradeService {
  -repository: TradeRepository
  +get_trade(id): Trade
  +create_trade(data): Trade
}

class TradeRepository {
  -session: AsyncSession
  +get_by_id(id): Trade
  +create(trade): Trade
}

class AsyncSession {
  +execute(query)
}

class TestTradeService {
  +mock_repository: MockRepository
}

TradeRouter ..> FastAPIDepends : uses

FastAPIDepends::get_trade_service ..> TradeService : <<creates with>>
TradeService ..> TradeRepository : <<injects via constructor>>

TradeService ..> AsyncSession : <<injected>>
TradeRepository ..> AsyncSession : <<uses>>

TradeService <|-- TestTradeService : <<mock for testing>>

note right of FastAPIDepends
  Dependency Injection Pattern:
  - Dependencies injected externally
  - Constructor injection
  - Framework-managed (FastAPI)
  - Enables: testing, flexibility,
    loose coupling
end note

@enduml
```
<img width="722" height="749" alt="image" src="https://github.com/user-attachments/assets/686ba646-54ca-4de7-a04a-b32586bde90d" />


#### 4. Decorator

`src/core/encryption.py`
```python
def encrypt_value(value: str) -> str:
    """Encrypt a string value."""
    if not value:
        return value
    fernet = get_fernet()
    return fernet.encrypt(value.encode()).decode()
```

**Объяснение**: Функции `encrypt_value` и `decrypt_value` являются декораторами (обёртками) для чувствительных данных. Они добавляют функциональность шифрования к строковым значениям без изменения их интерфейса. Также паттерн применяется в `_to_naive_utc()` — обёртка для конвертации datetime.

```plantuml
@startuml
!theme plain
skinparam classAttributeIconSize 0

class Fernet {
  +encrypt(data): bytes
  +decrypt(token): bytes
}

class "<<module>>\nencryption" as EncryptionModule {
  +get_fernet(): Fernet
  +encrypt_value(value: str): str
  +decrypt_value(encrypted: str): str
}

class JournalService {
  +create_journal(data): Journal
}

class Journal {
  +bybit_api_key: str
  +bybit_api_secret: str
}

class ClientData {
  +api_key: str
  +api_secret: str
}

EncryptionModule ..> Fernet : uses
JournalService ..> EncryptionModule::encrypt_value : <<wraps with encryption>>
JournalService ..> ClientData : receives
JournalService ..> Journal : creates

note right of EncryptionModule::encrypt_value
  Decorator Pattern:
  - Wraps original data
  - Adds encryption behavior
  - Preserves interface (str → str)
  - Transparent to clients
end note

note right of EncryptionModule::decrypt_value
  Also: _to_naive_utc() decorator
  wraps datetime conversion
end note

@enduml
```
<img width="903" height="454" alt="image" src="https://github.com/user-attachments/assets/21b1a015-baa6-4f06-a7be-5a22e726d711" />


#### 5. Adapter

`src/modules/trades/router.py`
```python
def trade_to_response(trade) -> TradeResponse:
    """Convert trade model to response schema."""
    return TradeResponse(
        id=trade.id,
        journal_id=trade.journal_id,
        ...
        pnl=trade.calculate_pnl(),
        current_volume=trade.get_current_volume(),
    )
```

**Объяснение**: Функции `trade_to_response` и `trade_to_detail_response` адаптируют внутренние модели SQLAlchemy (Trade) к внешнему API формату (Pydantic схемы). Это преобразование между несовместимыми интерфейсами.

```plantuml
@startuml
!theme plain
skinparam classAttributeIconSize 0

class Trade {
  +id: str
  +ticker: str
  +direction: str
  +calculate_pnl(): Decimal
  +get_current_volume(): Decimal
  --
  SQLAlchemy Model
}

class TradeResponse {
  +id: str
  +ticker: str
  +direction: str
  +pnl: Decimal
  +current_volume: Decimal
  --
  Pydantic Schema
}

class TradeRouter {
  +trade_to_response(trade): TradeResponse
  +trade_to_detail_response(trade): TradeDetailResponse
}

class Client {
  +receives JSON
}

TradeRouter ..> Trade : adapts from
TradeRouter ..> TradeResponse : adapts to
TradeRouter ..> TradeRouter::trade_to_response : <<conversion logic>>

Client ..> TradeResponse : receives

note right of TradeRouter::trade_to_response
  Adapter Pattern:
  - Converts Trade (internal)
    to TradeResponse (external)
  - Bridges incompatible interfaces
  - Adds computed fields (pnl)
  - Hides internal structure
end note

@enduml
```

<img width="859" height="407" alt="image" src="https://github.com/user-attachments/assets/b6db92fc-628c-41b0-b792-a21adb2900d2" />


### Поведенческие шаблоны
---
#### 1. Strategy

`src/modules/trades/models.py` — `calculate_pnl()`
```python
def calculate_pnl(self) -> Decimal:
    """Calculate profit/loss for this trade."""
    if self.direction == "long":
        gross_pnl = (self.close_price - self.open_price) * self.initial_volume
    else:  # short
        gross_pnl = (self.open_price - self.close_price) * self.initial_volume
    return gross_pnl - self.commission
```

**Объяснение**: Разные алгоритмы расчёта PnL для long и short позиций выбираются во время выполнения на основе значения `direction`. Это паттерн Strategy — инкапсуляция семейства алгоритмов.

```plantuml
@startuml
!theme plain
skinparam classAttributeIconSize 0

class Trade {
  +direction: str  { "long" | "short" }
  +open_price: Decimal
  +close_price: Decimal
  +initial_volume: Decimal
  +commission: Decimal
  --
  +calculate_pnl(): Decimal
}

note right of Trade::calculate_pnl
  Strategy Selection:
  if direction == "long":
    gross = (close - open) * volume
  else: # short
    gross = (open - close) * volume
  return gross - commission
end note

class LongStrategy {
  +calculate(open, close, volume): Decimal
  --
  (close - open) * volume
}

class ShortStrategy {
  +calculate(open, close, volume): Decimal
  --
  (open - close) * volume
}

Trade ..> LongStrategy : <<selects at runtime>>
Trade ..> ShortStrategy : <<selects at runtime>>

note bottom of Trade
  Strategy Pattern:
  - Family of algorithms (PnL calc)
  - Selected by direction field
  - Interchangeable at runtime
  - Encapsulates algorithm variants
end note

@enduml
```

<img width="937" height="322" alt="image" src="https://github.com/user-attachments/assets/52deb540-bf8a-44c9-be7c-9c4bf6ba5b89" />


#### 2. Command

`src/modules/trades/schemas.py`
```python
class TradeCreate(BaseModel):
    """Schema for creating a trade."""
    journal_id: str
    algorithm_id: str | None
    opened_at: datetime
    ...

class TradeUpdate(BaseModel):
    """Schema for updating a trade."""
    opened_at: datetime | None = None
    ...
```

**Объяснение**: Pydantic схемы (`TradeCreate`, `TradeUpdate`, `AddPositionRequest`) инкапсулируют запросы как объекты. Они передаются в сервисы как "команды" для выполнения операций, отделяя данные запроса от их обработки.

```plantuml
@startuml
!theme plain
skinparam classAttributeIconSize 0

class TradeCommand {
  <<interface>>
  +journal_id: str
  +algorithm_id: str
  +ticker: str
  +direction: str
  --
  <<invoke>>
}

class TradeCreate {
  +journal_id: str
  +algorithm_id: str | None
  +opened_at: datetime
  +closed_at: datetime
  +ticker: str
  +direction: str
  +initial_volume: Decimal
  +open_price: Decimal
  +close_price: Decimal
  +commission: Decimal
  +positions: List~PositionData~
}

class TradeUpdate {
  +opened_at: datetime | None
  +closed_at: datetime | None
  +ticker: str | None
  +direction: str | None
  ...
}

class AddPositionRequest {
  +price: Decimal
  +volume: Decimal
  +position_type: str
}

class TradeService {
  +create_trade(cmd: TradeCreate): Trade
  +update_trade(id, cmd: TradeUpdate): Trade
  +add_position(id, cmd: AddPositionRequest): TradePosition
}

class Invoker {
  +POST /trades (TradeCreate)
  +PATCH /trades/{id} (TradeUpdate)
  +POST /trades/{id}/positions (AddPositionRequest)
}

TradeCommand <|-- TradeCreate
TradeCommand <|-- TradeUpdate
TradeCommand <|-- AddPositionRequest

Invoker ..> TradeCreate : sends
Invoker ..> TradeUpdate : sends
Invoker ..> AddPositionRequest : sends

TradeService ..> TradeCreate : receives & executes
TradeService ..> TradeUpdate : receives & executes
TradeService ..> AddPositionRequest : receives & executes

note bottom of TradeService
  Command Pattern:
  - Encapsulates request as object
  - Separates sender from receiver
  - Commands: TradeCreate, TradeUpdate, etc.
  - Enables: queuing, logging, undo
end note

@enduml
```

<img width="1157" height="460" alt="image" src="https://github.com/user-attachments/assets/daa96104-a244-465b-8b7f-22c1f4546e46" />


#### 3. Template Method

`src/modules/*/repository.py`
```python
class TradeRepository:
    async def get_by_id(self, trade_id: str) -> Trade | None:
        """Get trade by ID with positions."""
        result = await self.session.execute(
            select(Trade)
            .where(Trade.id == trade_id)
            .options(selectinload(Trade.positions))
        )
        return result.scalar_one_or_none()

    async def create(self, trade: Trade) -> Trade:
        """Create a new trade."""
        self.session.add(trade)
        await self.session.flush()
        await self.session.refresh(trade)
        return trade
```

**Объяснение**: Все Repository классы следуют общему шаблону: `get_by_id`, `get_all`, `create`, `update`, `delete`. Это единый алгоритм (шаблон), который реализуется с вариациями для каждой сущности.

```plantuml
@startuml
!theme plain
skinparam classAttributeIconSize 0

abstract class AbstractRepository {
  +{abstract} get_by_id(id): Entity
  +{abstract} get_all(filters, skip, limit): List~Entity~
  +{abstract} create(entity): Entity
  +{abstract} update(entity): Entity
  +{abstract} delete(entity): void
  --
  Template: CRUD algorithm
}

class TradeRepository {
  +get_by_id(trade_id): Trade
  +get_all(filters, skip, limit): List~Trade~
  +create(trade): Trade
  +update(trade): Trade
  +delete(trade): void
  --
  Specific: Trade + positions
}

class JournalRepository {
  +get_by_id(journal_id): Journal
  +get_by_id_with_trades(journal_id): Journal
  +create(journal): Journal
  +update(journal): Journal
  +delete(journal): void
  --
  Specific: Journal + trades
}

class AlgorithmRepository {
  +get_by_id(algorithm_id): Algorithm
  +get_by_ids(ids): List~Algorithm~
  +create(algorithm): Algorithm
  +update(algorithm): Algorithm
  +delete(algorithm): void
  --
  Specific: Algorithm
}

AbstractRepository <|-- TradeRepository
AbstractRepository <|-- JournalRepository
AbstractRepository <|-- AlgorithmRepository

note right of AbstractRepository
  Template Method Pattern:
  - Common CRUD algorithm structure
  - Steps defined in base (conceptual)
  - Concrete implementations vary
  - Shared: session, flush, refresh
  - Varies: query conditions, 
    eager loading options
end note

@enduml
```

<img width="965" height="361" alt="image" src="https://github.com/user-attachments/assets/3ced2a62-e263-4100-8fd7-4f0b1d6456be" />


#### 4. Iterator

`src/modules/trades/models.py`
```python
def get_total_added_volume(self) -> Decimal:
    """Get total volume added via positions."""
    total = Decimal("0")
    for pos in self.positions:  # Итерация по коллекции
        if pos.position_type == "add":
            total += pos.volume
    return total
```

**Объяснение**: Python коллекции (`list[TradePosition]`) предоставляют итератор для последовательного доступа к элементам. Методы `get_total_added_volume`, `get_total_reduced_volume` используют этот паттерн.

```plantuml
@startuml
!theme plain
skinparam classAttributeIconSize 0

class Trade {
  +positions: List~TradePosition~
  --
  +get_total_added_volume(): Decimal
  +get_total_reduced_volume(): Decimal
  +get_current_volume(): Decimal
}

class TradePosition {
  +id: str
  +position_type: str
  +volume: Decimal
}

class Iterator~TradePosition~ {
  +__iter__()
  +__next__(): TradePosition
}

class Client {
  +iterate positions
}

Trade "1" *-- "*" TradePosition : contains
TradePosition .. Iterator : provides
Trade ..> Iterator : uses internally
Client ..> Iterator : uses

note right of Trade::get_total_added_volume
  Iterator Pattern:
  for pos in self.positions:
      if pos.position_type == "add":
          total += pos.volume
  --
  Collection provides iterator
  Sequential access to elements
  Without exposing internals
end note

@enduml
```

<img width="809" height="441" alt="image" src="https://github.com/user-attachments/assets/f2c1b657-215f-4592-b232-f0d40d437cbb" />


#### 5. Observer

```python
# В Trade:
positions: Mapped[list[TradePosition]] = relationship(
    "TradePosition",
    back_populates="trade",
    cascade="all, delete-orphan",  # Автоматическое обновление
    ...
)
```

**Объяснение**: SQLAlchemy ORM реализует паттерн Observer — при изменении родительского объекта (`Trade`) автоматически обновляются связанные объекты (`TradePosition`). `cascade="all, delete-orphan"` обеспечивает автоматическую синхронизацию.

```plantuml
@startuml
!theme plain
skinparam classAttributeIconSize 0

class Trade {
  +id: str
  +positions: List~TradePosition~
  --
  <<subject>>
}

class TradePosition {
  +id: str
  +trade_id: str
  +trade: Trade
  --
  <<observer>>
}

class SQLAlchemyORM {
  +relationship()
  +cascade: str
  +back_populates: str
}

class "Event System" as Events {
  +INSERT → notify observers
  +UPDATE → notify observers
  +DELETE → notify observers
}

Trade "1" -- "*" TradePosition : observes
TradePosition "1" -- "1" Trade : back_populates

Trade .. SQLAlchemyORM : configures
TradePosition .. SQLAlchemyORM : configures

SQLAlchemyORM .. Events : implements

note right of SQLAlchemyORM
  Observer Pattern:
  - Subject: Trade
  - Observers: TradePosition(s)
  - Cascade: "all, delete-orphan"
  - Automatic sync on change:
    • INSERT → add positions
    • DELETE → remove positions
    • UPDATE → sync state
end note

@enduml
```

<img width="462" height="675" alt="image" src="https://github.com/user-attachments/assets/cda9ee4e-d4d0-4f38-a4ff-7e9b1f9b0ba3" />


#### 6. Mediator

```python
class TradeService:
    def __init__(self, session: AsyncSession) -> None:
        self.repository = TradeRepository(session)
    
    async def create_trade(self, data: TradeCreate) -> Trade:
        # Координация создания trade и positions
        trade = await self.repository.create(trade)
        for pos_data in data.positions:
            position = TradePosition(...)
            trade.positions.append(position)
        await self.repository.update(trade)
        return trade
```

**Объяснение**: Service слой выступает посредником между роутерами (контроллерами) и репозиториями, координируя сложные операции.

```plantuml
@startuml
!theme plain
skinparam classAttributeIconSize 0

class TradeRouter {
  +create_trade(data)
  --
  <<colleague 1>>
}

class TradeRepository {
  +create(trade)
  +update(trade)
  --
  <<colleague 2>>
}

class Trade {
  +positions
  --
  <<colleague 3>>
}

class TradePosition {
  --
  <<colleague 4>>
}

class TradeService {
  -repository: TradeRepository
  --
  +create_trade(data): Trade
  +add_position(trade_id, data): TradePosition
  --
  <<mediator>>
}

class DatabaseSession {
  +flush()
  +commit()
  --
  <<shared resource>>
}

TradeRouter ..> TradeService : calls
TradeService ..> TradeRepository : coordinates
TradeService ..> Trade : creates & manages
TradeService ..> TradePosition : creates & attaches
TradeService ..> DatabaseSession : manages transactions

TradeRepository ..> DatabaseSession : uses
Trade ..> TradePosition : contains

note right of TradeService
  Mediator Pattern:
  - Centralizes complex communication
  - Colleagues don't talk directly
  - TradeService coordinates:
    1. Creates Trade via Repository
    2. Creates TradePositions
    3. Attaches positions to trade
    4. Updates trade in DB
    5. Manages transaction
  - Reduces coupling between
    Router, Repository, Models
end note

@enduml
```

<img width="762" height="687" alt="image" src="https://github.com/user-attachments/assets/629c640b-89f4-4c92-bc89-150a42f5acfb" />


## GRASP Паттерны

### Роли классов
---

| Роль               | Класс                         | Пояснение                                                                     |
| ------------------ | ----------------------------- | ----------------------------------------------------------------------------- |
| Information Expert | Trade                         | Содержит данные о сделке и методы расчёта (calculate_pnl, get_current_volume) |
| Creator            | TradeService                  | Создаёт Trade и TradePosition, знает правила валидации                        |
| Controller         | TradeRouter / FastAPI routers | Принимают запросы и делегируют выполнение сервисам                            |
| Pure Fabrication   | TradeRepository               | Искусственный класс для инкапсуляции доступа к БД, не из доменной области     |
| Coordinator        | TradeService                  | Координирует работу Repository и Models для выполнения use cases              |

### Принципы разработки
---

| Принцип                           | Реализация                                       | Пояснение                                                          |
| --------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| Low Coupling (Низкая связанность) | Модули не импортируют напрямую модели друг друга | trades модуль не зависит от деталей algorithms, только через FK    |
| High Cohesion (Высокая связность) | Каждый модуль имеет чёткую ответственность       | trades: сделки, journals: журналы, algorithms: алгоритмы           |
| Indirection (Косвенность)         | Repository слой между Service и БД               | 	Позволяет заменить SQLAlchemy на другую ORM без изменения Service |

### Свойства программы
---

| Свойство                                   | Реализация                              | Пояснение                                                                                                            |
| ------------------------------------------ | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Protected Variations (Защита от изменений) | Зависимости внедряются через интерфейсы | AsyncSession передаётся в конструкторы — можно заменить на мок для тестов; get_db_session изолирован в core/database |

