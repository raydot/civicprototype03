"""
Pydantic models for API responses
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class CategorySuggestion(BaseModel):
    """Model for a single category suggestion"""
    category_id: int = Field(..., description="Unique category ID")
    category_name: str = Field(..., description="Category name")
    confidence_score: float = Field(
        ..., 
        ge=0.0, 
        le=1.0,
        description="Confidence score of the match"
    )
    keywords: List[str] = Field(..., description="Keywords associated with category")
    category_type: str = Field(..., description="Type of category")


class CategoryResponse(BaseModel):
    """Response model for category suggestions"""
    suggestions: List[CategorySuggestion] = Field(
        ...,
        description="List of category suggestions"
    )
    session_id: str = Field(..., description="Session ID for tracking")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Response timestamp"
    )


class FeedbackResponse(BaseModel):
    """Response model for feedback submission"""
    status: str = Field(..., description="Status of feedback processing")
    session_id: str = Field(..., description="Session ID")
    message: str = Field(..., description="Response message")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Response timestamp"
    )


class RecommendationItem(BaseModel):
    """Model for a single recommendation item"""
    id: str = Field(..., description="Recommendation ID")
    title: str = Field(..., description="Recommendation title")
    description: Optional[str] = Field(None, description="Recommendation description")
    category: str = Field(..., description="Category this recommendation belongs to")
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score for this recommendation"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional metadata for the recommendation"
    )


class RecommendationResponse(BaseModel):
    """Response model for recommendations"""
    recommendations: List[RecommendationItem] = Field(
        ...,
        description="List of recommendations"
    )
    session_id: str = Field(..., description="Session ID")
    categories_used: List[str] = Field(
        ...,
        description="Categories used to generate recommendations"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Response timestamp"
    )


class HealthResponse(BaseModel):
    """Response model for health checks"""
    status: str = Field(..., description="Health status")
    service: str = Field(..., description="Service name")
    version: str = Field(..., description="Service version")
    environment: str = Field(..., description="Environment")
    timestamp: datetime = Field(..., description="Check timestamp")


class ReadinessResponse(HealthResponse):
    """Response model for readiness checks"""
    checks: Dict[str, str] = Field(
        ...,
        description="Status of various system components"
    )
