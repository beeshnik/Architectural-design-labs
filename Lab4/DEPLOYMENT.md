# Развёртывание Trading Journal API

## Архитектура контейнеров

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │     API     │    │  PostgreSQL │    │    Redis    │ │
│  │   :8000     │◄──►│    :5432    │    │    :6379    │ │
│  │  (FastAPI)  │    │   (Data)    │    │  (Cache)    │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Быстрый старт

### 1. Локальный запуск (Docker Compose)

```bash
# Клонировать репозиторий
git clone <repo-url>
cd Lab4

# Запуск всех сервисов
make up

# Или вручную:
docker-compose up -d
```

### 2. Проверка работоспособности

```bash
# Health check
curl http://localhost:8000/health

# Swagger UI
curl http://localhost:8000/docs
```

### 3. Остановка

```bash
make down
# или
docker-compose down
```

## CI/CD Pipeline

### GitHub Actions Workflow:

1. **Code Quality & Tests** — проверка кода и юнит-тесты
2. **Build & Push** — сборка Docker образа и публикация в GitHub Container Registry
3. **Integration Tests** — запуск интеграционных тестов на собранном образе
4. **Deploy** — развёртывание (staging/production)

### Запуск CI локально (act):

```bash
# Установка act
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Запуск workflow
act push
```

## Интеграционные тесты

### Вариант 1: pytest

```bash
# Запуск через Makefile
make test-integration

# Или напрямую
pytest tests/integration -v
```

### Вариант 2: Postman + Newman (в CI)

```bash
# Установка newman
npm install -g newman

# Запуск коллекции
make test-postman
# или
newman run tests/postman/collection.json -e tests/postman/environment.json
```

### Вариант 3: Postman GUI

1. Открыть Postman
2. Import → `tests/postman/collection.json`
3. Import → `tests/postman/environment.json`
4. Выбрать окружение "Trading Journal Local"
5. Нажать "Run Collection"

## Оценка работы

| Критерий | Баллы | Статус |
|----------|-------|--------|
| Контейнеризация приложения | 4 | ✅ Dockerfile + docker-compose |
| CI/CD (сборка + Docker образы) | 2 | ✅ GitHub Actions |
| Интеграционные тесты в CI | 2 | ✅ pytest + Postman |
| **Итого** | **8** | |

## Команды Makefile

| Команда | Описание |
|---------|----------|
| `make build` | Сборка образов |
| `make up` | Запуск сервисов |
| `make down` | Остановка сервисов |
| `make test` | Юнит-тесты |
| `make test-integration` | Интеграционные тесты |
| `make test-postman` | Тесты Postman |
| `make logs` | Просмотр логов |
| `make clean` | Очистка |

## Переменные окружения

Создай `.env` файл:

```env
POSTGRES_USER=trader
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=trading_journal
ENCRYPTION_KEY=your-32-byte-key-here-12345678
APP_NAME=Trading Journal API
```

## Продакшн развёртывание

```bash
# Сборка для продакшена
docker build -t trading-journal:latest .

# Запуск с production конфигурацией
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```
