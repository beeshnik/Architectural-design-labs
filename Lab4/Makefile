.PHONY: help build up down test test-integration clean logs

# Default target
help:
	@echo "Available targets:"
	@echo "  build          - Build Docker images"
	@echo "  up             - Start all services (detached)"
	@echo "  down           - Stop all services"
	@echo "  logs           - Show logs"
	@echo "  test           - Run unit tests"
	@echo "  test-integration - Run integration tests"
	@echo "  clean          - Remove containers and volumes"
	@echo "  shell          - Open shell in API container"
	@echo "  db-shell       - Open PostgreSQL shell"

# Docker commands
build:
	docker-compose build

up:
	docker-compose up -d
	sleep 5
	@echo "Waiting for services to be ready..."
	@until curl -s http://localhost:8000/health > /dev/null; do \
		echo "Waiting for API..."; \
		sleep 2; \
	done
	@echo "API is ready! Visit http://localhost:8000/docs"

down:
	docker-compose down

logs:
	docker-compose logs -f api

clean:
	docker-compose down -v
	docker rmi trading-journal-api || true

shell:
	docker-compose exec api /bin/sh

db-shell:
	docker-compose exec db psql -U trader -d trading_journal

# Testing
test:
	pytest tests/unit -v --cov=src --cov-report=term-missing

test-integration:
	pytest tests/integration -v

test-postman:
	@echo "Running Postman collection..."
	@which newman >/dev/null 2>&1 || { echo "Install newman: npm install -g newman"; exit 1; }
	newman run tests/postman/collection.json -e tests/postman/environment.json

# CI/CD simulation
ci: build up test-integration
	docker-compose down
