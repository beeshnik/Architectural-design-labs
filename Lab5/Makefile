# Trading Journal - Makefile

.PHONY: build up down logs test clean dev install

# Development commands
dev:
	npm run dev

install:
	npm ci --legacy-peer-deps

# Docker commands
build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

down-volumes:
	docker-compose down -v

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

# Testing
test:
	npm run test -- --run

test-watch:
	npm run test

test-integration:
	docker-compose -f docker-compose.yml -f docker-compose.test.yml up --abort-on-container-exit

# Linting and formatting
lint:
	npm run lint

tsc:
	npx tsc --noEmit

# Docker cleanup
clean:
	docker-compose down -v --rmi all --remove-orphans

docker-prune:
	docker system prune -f

# CI/CD simulation
ci-build:
	docker build -t trading-journal:$(shell git rev-parse --short HEAD) .

ci-test: ci-build
	docker run --rm trading-journal:$(shell git rev-parse --short HEAD) npm run test -- --run

# Health check
health:
	curl http://localhost:8000/health

# Database
db-shell:
	docker-compose exec db psql -U postgres -d trading_journal

# Help
help:
	@echo "Доступные команды:"
	@echo "  make dev          - Запуск dev сервера"
	@echo "  make install      - Установка зависимостей"
	@echo "  make build        - Сборка Docker образов"
	@echo "  make up           - Запуск всех сервисов"
	@echo "  make down         - Остановка сервисов"
	@echo "  make logs         - Просмотр логов"
	@echo "  make test         - Запуск unit тестов"
	@echo "  make test-integration - Запуск интеграционных тестов"
	@echo "  make clean        - Полная очистка Docker"
	@echo "  make health       - Проверка здоровья сервисов"
