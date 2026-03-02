"""Integration tests for API endpoints."""
import pytest
from httpx import AsyncClient, ASGITransport

from src.main import app
from src.core.database import get_db_session, AsyncSessionLocal
from src.core.database import Base, engine


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(autouse=True)
async def setup_database():
    """Create tables before tests, drop after."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def async_client():
    """Create async test client."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        yield client


class TestHealthEndpoint:
    """Test health check endpoint."""

    async def test_health_check(self, async_client):
        """Test health endpoint returns OK."""
        response = await async_client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestAlgorithmsAPI:
    """Test algorithms endpoints."""

    async def test_create_algorithm(self, async_client):
        """Test creating an algorithm."""
        response = await async_client.post(
            "/api/v1/algorithms",
            json={"name": "RSI Strategy", "body": "Buy when RSI < 30"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "RSI Strategy"
        assert "id" in data

    async def test_list_algorithms(self, async_client):
        """Test listing algorithms."""
        # Create first
        await async_client.post(
            "/api/v1/algorithms",
            json={"name": "Test Algo", "body": "Test"}
        )
        
        response = await async_client.get("/api/v1/algorithms")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data

    async def test_get_algorithm_not_found(self, async_client):
        """Test getting non-existent algorithm."""
        response = await async_client.get("/api/v1/algorithms/non-existent")
        assert response.status_code == 404


class TestJournalsAPI:
    """Test journals endpoints."""

    async def test_create_journal(self, async_client):
        """Test creating a journal."""
        response = await async_client.post(
            "/api/v1/journals",
            json={"name": "My Journal", "deposit_balance": "10000"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "My Journal"
        assert data["has_api_keys"] is False

    async def test_journal_with_calculated_balance(self, async_client):
        """Test journal with calculated balance."""
        # Create journal
        response = await async_client.post(
            "/api/v1/journals",
            json={"name": "Test Journal", "deposit_balance": "5000"}
        )
        journal_id = response.json()["id"]
        
        # Get with calculated balance
        response = await async_client.get(f"/api/v1/journals/{journal_id}")
        assert response.status_code == 200
        data = response.json()
        assert "calculated_balance" in data
        assert "balance_difference" in data


class TestTradesAPI:
    """Test trades endpoints."""

    async def test_create_trade(self, async_client):
        """Test creating a trade."""
        # Create journal first
        journal_resp = await async_client.post(
            "/api/v1/journals",
            json={"name": "Trade Test Journal", "deposit_balance": "10000"}
        )
        journal_id = journal_resp.json()["id"]
        
        # Create trade
        response = await async_client.post(
            "/api/v1/trades",
            json={
                "journal_id": journal_id,
                "opened_at": "2024-01-15T10:30:00",
                "closed_at": "2024-01-15T14:45:00",
                "ticker": "BTCUSDT",
                "direction": "long",
                "initial_volume": "0.5",
                "open_price": "42000",
                "close_price": "43500",
                "commission": "10.50",
                "positions": []
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["ticker"] == "BTCUSDT"
        assert data["pnl"] is not None

    async def test_trade_validation_dates(self, async_client):
        """Test trade validation - closed_at must be after opened_at."""
        journal_resp = await async_client.post(
            "/api/v1/journals",
            json={"name": "Validation Test", "deposit_balance": "1000"}
        )
        journal_id = journal_resp.json()["id"]
        
        response = await async_client.post(
            "/api/v1/trades",
            json={
                "journal_id": journal_id,
                "opened_at": "2024-01-15T14:45:00",
                "closed_at": "2024-01-15T10:30:00",  # Before opened_at!
                "ticker": "BTCUSDT",
                "direction": "long",
                "initial_volume": "1",
                "open_price": "100",
                "close_price": "110",
                "commission": "0",
                "positions": []
            }
        )
        assert response.status_code == 422  # Validation error

    async def test_trade_with_positions(self, async_client):
        """Test creating trade with positions."""
        journal_resp = await async_client.post(
            "/api/v1/journals",
            json={"name": "Positions Test", "deposit_balance": "10000"}
        )
        journal_id = journal_resp.json()["id"]
        
        response = await async_client.post(
            "/api/v1/trades",
            json={
                "journal_id": journal_id,
                "opened_at": "2024-01-15T10:00:00",
                "closed_at": "2024-01-15T15:00:00",
                "ticker": "ETHUSDT",
                "direction": "long",
                "initial_volume": "1",
                "open_price": "2000",
                "close_price": "2100",
                "commission": "5",
                "positions": [
                    {"price": "2050", "volume": "0.5", "position_type": "add"}
                ]
            }
        )
        assert response.status_code == 201
        assert len(response.json()["positions"]) == 1
