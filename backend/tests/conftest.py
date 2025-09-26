"""
Pytest configuration and shared fixtures
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings


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
