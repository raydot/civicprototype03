"""
Custom exceptions for the AI Recommendation Service
"""
from typing import Optional


class AIRecommendationException(Exception):
    """Base exception for AI recommendation service"""
    
    def __init__(self, message: str, error_code: Optional[str] = None):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)


class DatabaseConnectionError(AIRecommendationException):
    """Raised when database connection fails"""
    pass


class ModelLoadError(AIRecommendationException):
    """Raised when AI model fails to load"""
    pass


class CategoryMatchError(AIRecommendationException):
    """Raised when category matching fails"""
    pass


class ValidationError(AIRecommendationException):
    """Raised when input validation fails"""
    pass


class ConfigurationError(AIRecommendationException):
    """Raised when configuration is invalid"""
    pass
