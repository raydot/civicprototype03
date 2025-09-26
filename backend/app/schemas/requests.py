"""
Pydantic models for API requests
"""
from typing import List, Optional
from pydantic import BaseModel, Field, validator


class UserInputRequest(BaseModel):
    """Request model for user text input analysis"""
    text_inputs: List[str] = Field(
        ..., 
        min_items=1, 
        max_items=6,
        description="1-6 text entries from user"
    )
    session_id: Optional[str] = Field(
        None,
        description="Session ID for tracking user interactions"
    )
    
    @validator('text_inputs')
    def validate_text_inputs(cls, v):
        """Validate that text inputs are not empty"""
        for text in v:
            if not text.strip():
                raise ValueError("Text inputs cannot be empty")
        return v


class CategoryRefinementRequest(BaseModel):
    """Request model for category refinement"""
    session_id: str = Field(..., description="Session ID")
    rejected_categories: List[str] = Field(
        ...,
        description="List of category names that user rejected"
    )
    additional_context: Optional[str] = Field(
        None,
        description="Additional context from user for refinement"
    )


class FeedbackRequest(BaseModel):
    """Request model for user feedback"""
    session_id: str = Field(..., description="Session ID")
    category_id: int = Field(..., description="Category ID")
    response: str = Field(
        ..., 
        regex="^(accepted|rejected|refined)$",
        description="User response: accepted, rejected, or refined"
    )
    confidence_score: Optional[float] = Field(
        None,
        ge=0.0,
        le=1.0,
        description="Confidence score of the match"
    )


class RecommendationRequest(BaseModel):
    """Request model for getting recommendations"""
    session_id: str = Field(..., description="Session ID")
    accepted_categories: List[int] = Field(
        ...,
        description="List of accepted category IDs"
    )
