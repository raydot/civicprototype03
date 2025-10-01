"""
Pytest configuration and shared fixtures
"""
import pytest
import asyncio
from unittest.mock import Mock
from fastapi import Request
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.db.database import database


@pytest.fixture
def client():
    """Test client for FastAPI application"""
    return TestClient(app)


@pytest.fixture
def test_settings():
    """Test configuration settings"""
    return {
        "environment": "testing",
        "database_url": "sqlite:///./test.db",
        "model_name": "all-MiniLM-L6-v2",
        "vector_dimension": 384,
        "confidence_threshold": 0.7,
        "max_categories": 5
    }


@pytest.fixture
def sample_user_inputs():
    """Sample user inputs for testing"""
    return [
        "I want something innovative and cutting-edge",
        "Looking for traditional approaches that work",
        "Need experimental solutions for testing",
        "Something that combines old and new methods"
    ]


@pytest.fixture
def sample_categories():
    """Sample categories for testing"""
    return [
        {
            "id": 1,
            "name": "Innovative",
            "keywords": ["innovative", "cutting-edge", "novel", "breakthrough"],
            "category_type": "primary"
        },
        {
            "id": 2,
            "name": "Traditional", 
            "keywords": ["traditional", "established", "conventional", "classic"],
            "category_type": "primary"
        },
        {
            "id": 3,
            "name": "Experimental",
            "keywords": ["experimental", "trial", "prototype", "test"],
            "category_type": "primary"
        }
    ]


# Database fixtures for Phase 1 tests
@pytest.fixture
async def db_connection():
    """Database connection fixture - connects and disconnects"""
    if database is None:
        pytest.skip("Database not configured")
    
    await database.connect()
    yield database
    await database.disconnect()


@pytest.fixture
def mock_request():
    """Mock FastAPI Request object for testing"""
    mock_req = Mock(spec=Request)
    mock_req.client.host = "127.0.0.1"
    mock_req.headers.get.return_value = "pytest-test-agent/1.0"
    return mock_req


@pytest.fixture
def test_session_data():
    """Test data for session creation"""
    return {
        "session_id": "test-session-pytest-12345",
        "user_ip": "127.0.0.1",
        "user_agent": "pytest-test-agent/1.0"
    }


@pytest.fixture
def test_interaction_data():
    """Test data for interaction tracking"""
    return {
        "user_input": "I care about climate change and healthcare",
        "matches": [
            {
                "category_id": 1,
                "category_name": "Climate & Environment",
                "confidence_score": 0.85,
                "similarity_score": 0.78
            }
        ],
        "processing_time": 250
    }


@pytest.fixture
def test_feedback_data():
    """Test data for feedback submission"""
    return {
        "category_id": 1,
        "category_name": "Climate & Environment",
        "feedback_type": "accept",
        "user_rating": 5,
        "feedback_reason": "Very relevant",
        "confidence_score": 0.85,
        "similarity_score": 0.78
    }
