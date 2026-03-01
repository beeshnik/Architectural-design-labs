# Trading Journal API

FastAPI-based API для торгового журнала трейдера с поддержкой сделок, алгоритмов и журналов.

## Структура проекта

```
src/
├── core/              # Общая инфраструктура
│   ├── config.py      # Конфигурация (Pydantic Settings)
│   ├── database.py    # SQLAlchemy 2.0 async engine и сессии
│   └── encryption.py  # Шифрование API-ключей
├── modules/           # Модули (Modular Monolith)
│   ├── algorithms/    # CRUD алгоритмов
│   ├── journals/      # CRUD журналов + баланс
│   └── trades/        # CRUD сделок + позиции
└── main.py            # Точка входа
```

## Технологический стек

- **Framework:** FastAPI 0.109+ с `Annotated` зависимостями
- **DB:** PostgreSQL + asyncpg + SQLAlchemy 2.0
- **Validation:** Pydantic V2
- **Security:** Fernet шифрование для API-ключей

## Установка и запуск

### 1. Создание окружения

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate     # Windows
```

### 2. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 3. Настройка переменных окружения

```bash
cp .env.example .env
# Отредактируй .env файл:
# DATABASE_URL=postgresql+asyncpg://user:password@localhost/trading_journal
# ENCRYPTION_KEY=your-32-byte-secret-key-here
```

### 4. Запуск

```bash
# Режим разработки
uvicorn src.main:app --reload

# Или через main.py
python -m src.main
```

API доступно по адресу: http://localhost:8000
Документация: http://localhost:8000/docs

## API Endpoints

### Algorithms
- `GET    /api/v1/algorithms` - Список алгоритмов
- `POST   /api/v1/algorithms` - Создать алгоритм
- `GET    /api/v1/algorithms/{id}` - Получить алгоритм
- `PATCH  /api/v1/algorithms/{id}` - Обновить алгоритм
- `DELETE /api/v1/algorithms/{id}` - Удалить алгоритм (SET NULL в сделках)

### Journals
- `GET    /api/v1/journals` - Список журналов
- `POST   /api/v1/journals` - Создать журнал
- `GET    /api/v1/journals/{id}` - Получить журнал (с calculated_balance)
- `PATCH  /api/v1/journals/{id}` - Обновить журнал
- `DELETE /api/v1/journals/{id}` - Удалить журнал (CASCADE удаление сделок)

### Trades
- `GET    /api/v1/trades` - Список сделок (с фильтрами)
- `POST   /api/v1/trades` - Создать сделку
- `GET    /api/v1/trades/{id}` - Получить сделку с деталями
- `PATCH  /api/v1/trades/{id}` - Обновить сделку
- `DELETE /api/v1/trades/{id}` - Удалить сделку
- `POST   /api/v1/trades/{id}/positions` - Добавить позицию к сделке

## Особенности реализации

### Позиции в сделке (Trade Positions)
- Каждая сделка имеет список позиций (докупка/продажа частей)
- Валидация: нельзя закрыть больше, чем есть в позиции
- Автоматический расчёт текущего объёма

### Шифрование
- API-ключи Bybit шифруются через Fernet
- При чтении автоматически расшифровываются

### Баланс журнала
- `deposit_balance` - начальный баланс
- `calculated_balance` - пересчитанный на основе всех сделок (PnL)
- `balance_difference` - разница между ними

### Связи
- Trade → Journal: N:1 (обязательная)
- Trade → Algorithm: N:1 (опциональная, SET NULL)
- Journal удаление → CASCADE удаление Trades
- Algorithm удаление → SET NULL в Trades

## Примеры запросов

### Создание журнала
```bash
curl -X POST "http://localhost:8000/api/v1/journals" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Trading Journal",
    "deposit_balance": 10000,
    "bybit_api_key": "your_api_key",
    "bybit_api_secret": "your_api_secret"
  }'
```

### Создание алгоритма
```bash
curl -X POST "http://localhost:8000/api/v1/algorithms" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "RSI Strategy",
    "body": "Buy when RSI < 30, sell when RSI > 70"
  }'
```

### Создание сделки
```bash
curl -X POST "http://localhost:8000/api/v1/trades" \
  -H "Content-Type: application/json" \
  -d '{
    "journal_id": "journal-uuid",
    "algorithm_id": "algorithm-uuid",
    "opened_at": "2024-01-15T10:30:00",
    "closed_at": "2024-01-15T14:45:00",
    "ticker": "BTCUSDT",
    "direction": "long",
    "initial_volume": 0.5,
    "open_price": 42000,
    "close_price": 43500,
    "commission": 10.50,
    "positions": [
      {"price": 42800, "volume": 0.2, "position_type": "add"},
      {"price": 43200, "volume": 0.1, "position_type": "reduce"}
    ]
  }'
```

### Добавление позиции к сделке
```bash
curl -X POST "http://localhost:8000/api/v1/trades/{trade_id}/positions" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 44000,
    "volume": 0.1,
    "position_type": "reduce"
  }'
```

### Фильтрация сделок
```bash
# По журналу
curl "http://localhost:8000/api/v1/trades?journal_id=xxx"

# По направлению
curl "http://localhost:8000/api/v1/trades?direction=long"

# По тикеру
curl "http://localhost:8000/api/v1/trades?ticker=BTC"
```
