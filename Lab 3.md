
### Диаграмма последовательностей (Добавление новой сделки в торговый журнал вручную через веб-интерфейс.)

```plantUML
@startuml
!theme cerulean-outline
skinparam backgroundColor #FEFEFF
skinparam sequenceMessageAlign center

actor "Трейдер" as Trader
participant "Клиент\nReact PWA" as Client
participant "API Gateway\nNginx" as Gateway
box "Journal Service (Container)"
    participant "TradeController\nFastAPI Router" as Controller
    participant "TradeService\n[Component]" as Service
    participant "TradeRepository\n[Component]" as Repository
    participant "EventPublisher\n[Component]" as Publisher
end box
database "PostgreSQL\n[Container]" as DB
queue "Kafka\nMessages broker" as Kafka

== Добавление сделки ==
Trader -> Client: Вводит данные сделки\n(инструмент, направление, цены, позиции)
activate Client
Client -> Gateway: POST /api/v1/journals/{id}/trades\nContent-Type: application/json
activate Gateway

Gateway -> Controller: Route(request)
activate Controller

Controller -> Service: create_trade(trade_dto, journal_id)
activate Service

Service -> Repository: save(trade_entity)
activate Repository

Repository -> DB: BEGIN; INSERT INTO trades...; INSERT INTO trade_positions...; COMMIT;
activate DB
DB --> Repository: TradeModel (with ID)
deactivate DB

Repository --> Service: trade_model
deactivate Repository

Service -> Publisher: publish(TradeCreatedEvent(trade_id))
activate Publisher

Publisher -> Kafka: Send to topic 'trades.created'
activate Kafka
Kafka --> Publisher: ack
deactivate Kafka
deactivate Publisher

Service --> Controller: TradeResponseDTO
deactivate Service

Controller --> Gateway: HTTP 201 Created\nBody: TradeResponseDTO
deactivate Controller

Gateway --> Client: JSON response
deactivate Gateway

Client --> Trader: Отображение подтверждения\n"Сделка сохранена"
deactivate Client

@enduml
```

<img width="2039" height="933" alt="image" src="https://github.com/user-attachments/assets/c823697b-7ca6-48c1-b9a7-2c9a8fe79d23" />


### Модель БД

```plantUML
@startuml
!theme cerulean-outline
skinparam classBackgroundColor #F0F8FF
skinparam classBorderColor #2F4F4F

class User {
  -id: INT <<PK>>
  -email: VARCHAR
  -password_hash: VARCHAR
  -created_at: TIMESTAMP
  --
  +authenticate()
}

class Journal {
  -id: INT <<PK>>
  -user_id: INT <<FK>>
  -name: VARCHAR
  -deposit_balance: DECIMAL
  -exchange_api_key: VARCHAR
  -exchange_api_secret: VARCHAR
  -created_at: TIMESTAMP
  --
  +update_balance(amount: DECIMAL)
}

class Trade {
  -id: INT <<PK>>
  -journal_id: INT <<FK>>
  -algorithm_id: INT <<FK>> {nullable}
  -instrument_name: VARCHAR
  -direction: Direction
  -volume: DECIMAL
  -open_time: TIMESTAMP
  -close_time: TIMESTAMP
  -open_price: DECIMAL
  -close_price: DECIMAL
  -commission: DECIMAL
  -created_at: TIMESTAMP
  --
  +calculate_pnl(): DECIMAL
  +get_duration(): INTERVAL
}

class TradePosition {
  -id: INT <<PK>>
  -trade_id: INT <<FK>>
  -price: DECIMAL
  -volume: DECIMAL
}

class Algorithm {
  -id: INT <<PK>>
  -user_id: INT <<FK>>
  -name: VARCHAR
  -body: TEXT
  -created_at: TIMESTAMP
}

enum Direction {
  LONG
  SHORT
}

' Relationships
User "1" -- "*" Journal : owns >
User "1" -- "*" Algorithm : creates >
Journal "1" -- "*" Trade : contains >
Trade "*" -- "0..1" Algorithm : uses_strategy >
Trade "1" -- "*" TradePosition : has_positions >
Trade::direction .. Direction : <<enum>>
@enduml
```

<img width="537" height="1266" alt="image" src="https://github.com/user-attachments/assets/b5ac1cfa-04ce-4fae-87cb-5eb977805a7e" />


### Анализ принципов разработки

#### BDUF (Big Design Up Front)
Определение: Масштабное проектирование всей системы (архитектура, БД, UI) перед началом кодирования.

Применимость: Отказ (частичный).
Обоснование: Для торгового журнала как продукта (MVP) требования могут быстро меняться (трейдеры могут попросить интеграцию с новой биржей или изменить логику расчета комиссий). Полное проектирование «вплоть до последнего класса» приведет к потере времени. Однако легкое проектирование upfront (C4 Level 1-2) необходимо, чтобы определить границы сервисов (Journal vs Statistics) и выбрать стек (FastAPI/React). Таким образом, мы используем Just Enough Design Up Front (JEDUF), а не BDUF.

#### SoC (Separation of Concerns)
Определение: Разделение ответственности между различными частями системы.

Применимость: Применение строгое.
Обоснование: Реализовано на трех уровнях:

1. Системный: Frontend (React) отвечает за UI/UX, Backend (FastAPI) — за бизнес-логику и данные, БД — за персистентность.
2. Внутренний (Backend): Router (HTTP-контекст) ↔ Service (бизнес-логика) ↔ Repository (доступ к данным) ↔ ORM (маппинг).
3. Предметный: Trade, Journal, Algorithm — отдельные сущности со своими репозиториями. Это позволяет изменять логику журналов, не трогая алгоритмы.

#### MVP (Minimum Viable Product)
Определение: Минимально жизнеспособный продукт — версия с минимальным функционалом, достаточным для получения обратной связи от пользователей.

Применимость: Применение.
Обоснование: В рамках работы MVP включает:

1. Ручное добавление сделки с обязательными полями (a-i из ТЗ).
2. Просмотр списка сделок в журнале.
3. Расчет простой статистики (PnL).
Не включено в MVP (YAGNI): автоматический импорт из MT5 (требует сложной интеграции MQL5), система уведомлений в реальном времени (WebSockets), сложное управление рисками (Risk Management). Это позволит выпустить продукт быстро и проверить, удобно ли трейдерам вести журнал именно так.

#### PoC (Proof of Concept)
Определение: Доказательство концепции — небольшой эксперимент для проверки технической возможности реализации сложной функции.

Применимость: Применение перед реализацией интеграций.
Обоснование: Перед тем как писать полноценный «Советник МТ5» (MQL5), который будет автоматически пушить сделки в API, нужно сделать PoC:

1. Может ли MQL5-скрипт отправить HTTP POST на наш API Gateway (может)?
2. Как происходит авторизация (API-keys) при такой передаче (генерация ключа в личном кабинете для советника, его копирование и использование в советнике)?
3. Хватает ли у нас latency соединения для realtime-обновлений (хватает)?

Если PoC покажет, что MT5 терминал блокирует исходящие HTTP-запросы или требует сложных DLL, мы откажемся от автоматического импорта в пользу CSV-импорта, не потратив ресурсы на полную разработку.
