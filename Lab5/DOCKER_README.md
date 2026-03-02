# Trading Journal - Docker & CI/CD

## Архитектура микросервисов

```
┌─────────────────┐
│   Nginx (LB)    │  ← Load Balancer (prod)
│     :8080       │
└────────┬────────┘
         │
┌────────▼────────┐
│  Nginx (React)  │  ← Frontend
│      :80        │
└────────┬────────┘
         │
┌────────▼────────┐
│   Backend API   │  ← FastAPI/Python
│    :8000        │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐  ┌──▼────┐
│PostgreSQL│  │ Redis │
│  :5432   │  │ :6379 │
└─────────┘  └───────┘
```

## Быстрый старт

### 1. Локальная разработка

```bash
# Установка зависимостей
make install

# Запуск dev сервера
make dev
```

### 2. Docker Compose

```bash
# Сборка и запуск всех сервисов
make build
make up

# Или одной командой
docker-compose up --build -d

# Проверка статуса
make health

# Логи
make logs

# Остановка
make down
```

### 3. Доступные сервисы

| Сервис   | URL                     | Описание           |
|----------|-------------------------|--------------------|
| Frontend | http://localhost        | React приложение   |
| Backend  | http://localhost:8000   | API документация   |
| API Docs | http://localhost:8000/docs | Swagger UI      |
| Database | localhost:5432          | PostgreSQL         |
| Redis    | localhost:6379          | Cache              |

## CI/CD Pipeline

### GitHub Actions Workflow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Lint &    │───→│    Build    │───→│ Integration │───→│   Deploy    │
│    Test     │    │Docker Image │    │    Tests    │    │  to Staging │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Этапы pipeline:

1. **Lint & Test** - ESLint, TypeScript check, Unit tests
2. **Build** - Сборка Docker образа и пуш в GHCR
3. **Integration Tests** - Postman/Newman тесты API
4. **Security Scan** - Trivy сканирование уязвимостей
5. **Deploy** - Деплой на staging (только main ветка)

### Запуск CI локально (Act):

```bash
# Установка act
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Запуск workflow локально
act push
```

## Интеграционные тесты

### Postman + Newman

Коллекция тестов находится в `postman/trading-journal-api-tests.json`

```bash
# Запуск тестов через Newman (требуется установка)
npm install -g newman newman-reporter-htmlextra

newman run postman/trading-journal-api-tests.json \
  -e postman/local-environment.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export newman/report.html
```

### Тестовые сценарии:

- ✅ Health Check
- ✅ Algorithms CRUD (Create, Read, Update, Delete)
- ✅ Journals CRUD
- ✅ Trades CRUD
- ✅ Фильтрация сделок по журналу/алгоритму
- ✅ Валидация ошибок

## Makefile команды

```bash
make help              # Показать все команды
make dev               # Запуск dev сервера
make build             # Сборка Docker образов
make up                # Запуск всех сервисов
make down              # Остановка сервисов
make test              # Unit тесты
make test-integration  # Интеграционные тесты
make logs              # Просмотр логов
make health            # Health check
make clean             # Очистка Docker
```

## Переменные окружения

### Frontend

| Переменная | Описание              | Значение по умолчанию |
|------------|----------------------|----------------------|
| NODE_ENV   | Режим работы         | production           |
| VITE_API_URL | URL бэкенда API    | http://backend:8000  |

### Backend

| Переменная    | Описание              | Значение по умолчанию |
|---------------|----------------------|----------------------|
| DATABASE_URL  | URL PostgreSQL       | postgresql://...     |
| REDIS_URL     | URL Redis            | redis://redis:6379   |
| ENVIRONMENT   | Окружение            | production           |

## Docker Registry

Образы публикуются в GitHub Container Registry:

```
ghcr.io/{username}/trading-journal:latest
ghcr.io/{username}/trading-journal:{sha}
ghcr.io/{username}/trading-journal:{branch}
```

## Мониторинг и логирование

### Health Checks

```bash
# Проверка здоровья
http://localhost:8000/health

# Готовность сервисов
docker-compose ps
```

### Логи

```bash
# Все сервисы
make logs

# Конкретный сервис
make logs-backend
make logs-frontend
```

## Безопасность

- ✅ Сканирование уязвимостей (Trivy)
- ✅ Минимальные базовые образы (Alpine)
- ✅ Отсутствие root пользователя в контейнерах
- ✅ Secrets management через GitHub Secrets

## Масштабирование

Для production окружения:

```bash
# Запуск с load balancer
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Масштабирование backend
docker-compose up -d --scale backend=3
```
