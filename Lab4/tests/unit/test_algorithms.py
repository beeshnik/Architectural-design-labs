"""Unit tests for algorithms module."""
import pytest
from unittest.mock import AsyncMock, MagicMock

from src.modules.algorithms.models import Algorithm
from src.modules.algorithms.schemas import AlgorithmCreate, AlgorithmUpdate
from src.modules.algorithms.service import AlgorithmService


@pytest.fixture
def mock_session():
    """Create mock database session."""
    return MagicMock()


@pytest.fixture
def algorithm_service(mock_session):
    """Create algorithm service with mock session."""
    return AlgorithmService(mock_session)


@pytest.mark.asyncio
async def test_create_algorithm(algorithm_service, mock_session):
    """Test algorithm creation."""
    # Arrange
    data = AlgorithmCreate(name="Test Algorithm", body="Test body")
    mock_session.flush = AsyncMock()
    mock_session.refresh = AsyncMock()
    
    # Act
    algorithm = await algorithm_service.create_algorithm(data)
    
    # Assert
    assert algorithm.name == "Test Algorithm"
    assert algorithm.body == "Test body"


@pytest.mark.asyncio
async def test_get_algorithm_not_found(algorithm_service):
    """Test getting non-existent algorithm raises 404."""
    # Arrange
    algorithm_service.repository.get_by_id = AsyncMock(return_value=None)
    
    # Act & Assert
    with pytest.raises(Exception) as exc_info:
        await algorithm_service.get_algorithm("non-existent-id")
    
    assert "404" in str(exc_info.value)
