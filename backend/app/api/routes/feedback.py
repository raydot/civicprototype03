"""
Feedback Collection API Routes
Handles user feedback submission and learning analytics
"""
from fastapi import APIRouter, HTTPException, Request, Depends, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import time

from ...services.feedback_service import (
    UserSession, 
    get_feedback_collector, 
    get_interaction_tracker,
    get_feedback_analytics
)
from ...utils.logging import structured_logger
from ..routes.admin import verify_admin_token

router = APIRouter(prefix="/feedback", tags=["User Feedback"])
logger = structured_logger


# Request/Response Models
class CategoryFeedbackItem(BaseModel):
    """Individual category feedback item."""
    category_id: int = Field(..., description="ID of the category being rated")
    feedback_type: str = Field(..., description="Type of feedback: accept, reject, maybe, irrelevant")
    user_rating: Optional[int] = Field(None, ge=1, le=5, description="User rating 1-5 stars")
    feedback_reason: Optional[str] = Field(None, description="Optional reason for the feedback")

    class Config:
        schema_extra = {
            "example": {
                "category_id": 1,
                "feedback_type": "accept",
                "user_rating": 4,
                "feedback_reason": "This matches my priorities well"
            }
        }


class FeedbackSubmissionRequest(BaseModel):
    """Request model for submitting feedback."""
    interaction_id: str = Field(..., description="ID of the interaction being rated")
    category_feedbacks: List[CategoryFeedbackItem] = Field(..., description="Feedback for each category")
    overall_satisfaction: Optional[int] = Field(None, ge=1, le=5, description="Overall satisfaction rating")
    additional_comments: Optional[str] = Field(None, description="Additional user comments")

    class Config:
        schema_extra = {
            "example": {
                "interaction_id": "123e4567-e89b-12d3-a456-426614174000",
                "category_feedbacks": [
                    {
                        "category_id": 1,
                        "feedback_type": "accept",
                        "user_rating": 4,
                        "feedback_reason": "Good match for my climate priorities"
                    },
                    {
                        "category_id": 2,
                        "feedback_type": "reject",
                        "user_rating": 2,
                        "feedback_reason": "Not relevant to my interests"
                    }
                ],
                "overall_satisfaction": 4,
                "additional_comments": "The matching was pretty good overall"
            }
        }


class FeedbackSubmissionResponse(BaseModel):
    """Response model for feedback submission."""
    status: str
    feedback_count: int
    interaction_id: str
    feedback_ids: List[str]
    message: str


class SessionResponse(BaseModel):
    """Response model for session creation."""
    session_id: str
    status: str


# API Endpoints

@router.post("/session/create", response_model=SessionResponse)
async def create_session(request: Request):
    """
    Create or update user session for tracking interactions.
    
    This should be called at the start of a user's interaction session
    to enable proper feedback collection and learning.
    """
    try:
        user_session = UserSession(request)
        session_id = await user_session.create_or_update_session()
        
        logger.info(f"Session created/updated: {session_id}")
        
        return SessionResponse(
            session_id=session_id,
            status="success"
        )
        
    except Exception as e:
        logger.error(f"Session creation failed: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to create session"
        )


@router.post("/submit", response_model=FeedbackSubmissionResponse)
async def submit_feedback(request: FeedbackSubmissionRequest):
    """
    Submit user feedback on category matches.
    
    This endpoint collects user feedback on how well categories matched
    their political priorities, enabling the system to learn and improve.
    
    Feedback types:
    - 'accept': User agrees this category matches their priorities
    - 'reject': User disagrees this category matches their priorities  
    - 'maybe': User is unsure or partially agrees
    - 'irrelevant': Category is not relevant to user's interests
    """
    try:
        feedback_collector = get_feedback_collector()
        
        # Validate feedback types
        valid_feedback_types = {'accept', 'reject', 'maybe', 'irrelevant'}
        for feedback in request.category_feedbacks:
            if feedback.feedback_type not in valid_feedback_types:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid feedback_type: {feedback.feedback_type}. Must be one of: {valid_feedback_types}"
                )
        
        # Submit feedback
        result = await feedback_collector.submit_feedback(
            interaction_id=request.interaction_id,
            category_feedbacks=[feedback.dict() for feedback in request.category_feedbacks],
            overall_satisfaction=request.overall_satisfaction,
            additional_comments=request.additional_comments
        )
        
        return FeedbackSubmissionResponse(
            status=result["status"],
            feedback_count=result["feedback_count"],
            interaction_id=result["interaction_id"],
            feedback_ids=result["feedback_ids"],
            message=f"Successfully submitted feedback for {result['feedback_count']} categories"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Feedback submission failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to submit feedback"
        )


@router.get("/analytics/summary")
async def get_feedback_summary(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    token: str = Depends(verify_admin_token)
):
    """
    Get feedback analytics summary (Admin only).
    
    Provides insights into user feedback patterns, category performance,
    and learning system effectiveness.
    """
    try:
        analytics = get_feedback_analytics()
        
        # Get comprehensive analytics
        category_performance = await analytics.get_category_performance_summary(days)
        feedback_trends = await analytics.get_feedback_trends(days)
        session_activity = await analytics.get_session_activity(days)
        learning_insights = await analytics.get_learning_insights()
        
        return {
            "period_days": days,
            "category_performance": category_performance,
            "feedback_trends": feedback_trends,
            "session_activity": session_activity,
            "learning_insights": learning_insights,
            "summary": {
                "total_categories_with_feedback": len([c for c in category_performance if c['total_feedback'] > 0]),
                "avg_acceptance_rate": sum(c['acceptance_rate'] for c in category_performance if c['total_feedback'] > 0) / max(len([c for c in category_performance if c['total_feedback'] > 0]), 1),
                "total_feedback_items": sum(c['total_feedback'] for c in category_performance),
                "categories_needing_attention": len([c for c in category_performance if c['acceptance_rate'] < 50 and c['total_feedback'] >= 5])
            }
        }
        
    except Exception as e:
        logger.error(f"Analytics retrieval failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve analytics"
        )


@router.get("/analytics/category/{category_id}")
async def get_category_feedback_details(
    category_id: int,
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    token: str = Depends(verify_admin_token)
):
    """
    Get detailed feedback analytics for a specific category (Admin only).
    
    Provides deep insights into how users interact with a specific category,
    including feedback patterns, ratings, and improvement suggestions.
    """
    try:
        from ...db.database import database
        
        # Category feedback details
        feedback_details = await database.fetch_all("""
            SELECT 
                cf.feedback_type,
                cf.user_rating,
                cf.feedback_reason,
                cf.confidence_score,
                cf.similarity_score,
                cf.created_at,
                ui.user_input,
                cf.feedback_metadata
            FROM category_feedback cf
            JOIN user_interactions ui ON cf.interaction_id = ui.id
            WHERE cf.category_id = $1 
            AND cf.created_at > NOW() - INTERVAL '%s days'
            ORDER BY cf.created_at DESC
        """ % days, category_id)
        
        # Category performance metrics
        performance_metrics = await database.fetch_one("""
            SELECT 
                COUNT(*) as total_feedback,
                COUNT(*) FILTER (WHERE feedback_type = 'accept') as accepts,
                COUNT(*) FILTER (WHERE feedback_type = 'reject') as rejects,
                COUNT(*) FILTER (WHERE feedback_type = 'maybe') as maybes,
                COUNT(*) FILTER (WHERE feedback_type = 'irrelevant') as irrelevant,
                AVG(user_rating) as avg_rating,
                AVG(confidence_score) as avg_confidence,
                AVG(similarity_score) as avg_similarity
            FROM category_feedback
            WHERE category_id = $1 
            AND created_at > NOW() - INTERVAL '%s days'
        """ % days, category_id)
        
        # Recent user inputs that matched this category
        recent_matches = await database.fetch_all("""
            SELECT DISTINCT ui.user_input, cf.feedback_type, cf.created_at
            FROM user_interactions ui
            JOIN category_feedback cf ON ui.id = cf.interaction_id
            WHERE cf.category_id = $1
            AND cf.created_at > NOW() - INTERVAL '7 days'
            ORDER BY cf.created_at DESC
            LIMIT 10
        """, category_id)
        
        return {
            "category_id": category_id,
            "period_days": days,
            "performance_metrics": dict(performance_metrics) if performance_metrics else {},
            "feedback_details": [dict(row) for row in feedback_details],
            "recent_matches": [dict(row) for row in recent_matches],
            "insights": _generate_category_insights(performance_metrics, feedback_details)
        }
        
    except Exception as e:
        logger.error(f"Category analytics retrieval failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve category analytics"
        )


@router.get("/health")
async def feedback_system_health():
    """
    Check feedback system health and status.
    
    Returns basic health information about the feedback collection system.
    """
    try:
        from ...db.database import database
        
        # Check database connectivity
        db_check = await database.fetch_one("SELECT COUNT(*) as session_count FROM user_sessions WHERE created_at > NOW() - INTERVAL '24 hours'")
        
        # Get recent activity
        recent_feedback = await database.fetch_one("SELECT COUNT(*) as feedback_count FROM category_feedback WHERE created_at > NOW() - INTERVAL '24 hours'")
        
        return {
            "status": "healthy",
            "database_connected": bool(db_check),
            "recent_sessions_24h": db_check['session_count'] if db_check else 0,
            "recent_feedback_24h": recent_feedback['feedback_count'] if recent_feedback else 0,
            "system_info": {
                "feedback_collection": "active",
                "learning_system": "active",
                "analytics": "active"
            }
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "database_connected": False
        }


def _generate_category_insights(performance_metrics: Dict[str, Any], feedback_details: List[Dict[str, Any]]) -> List[str]:
    """Generate insights for a specific category."""
    insights = []
    
    if not performance_metrics or performance_metrics['total_feedback'] == 0:
        insights.append("📊 No feedback data available for this category yet")
        return insights
    
    total = performance_metrics['total_feedback']
    accepts = performance_metrics['accepts'] or 0
    rejects = performance_metrics['rejects'] or 0
    acceptance_rate = (accepts / total) * 100 if total > 0 else 0
    
    if acceptance_rate >= 70:
        insights.append(f"🎉 High acceptance rate ({acceptance_rate:.1f}%) - users find this category very relevant")
    elif acceptance_rate >= 50:
        insights.append(f"👍 Good acceptance rate ({acceptance_rate:.1f}%) - category is generally well-matched")
    elif acceptance_rate >= 30:
        insights.append(f"⚠️ Moderate acceptance rate ({acceptance_rate:.1f}%) - consider reviewing keywords or description")
    else:
        insights.append(f"🔧 Low acceptance rate ({acceptance_rate:.1f}%) - category may need significant improvement")
    
    if performance_metrics['avg_rating'] and performance_metrics['avg_rating'] >= 4.0:
        insights.append(f"⭐ High user rating ({performance_metrics['avg_rating']:.1f}/5) - users are satisfied with matches")
    elif performance_metrics['avg_rating'] and performance_metrics['avg_rating'] < 3.0:
        insights.append(f"📉 Low user rating ({performance_metrics['avg_rating']:.1f}/5) - review matching algorithm for this category")
    
    # Analyze feedback reasons for common patterns
    reject_reasons = [f['feedback_reason'] for f in feedback_details if f['feedback_type'] == 'reject' and f['feedback_reason']]
    if len(reject_reasons) >= 3:
        insights.append(f"💬 {len(reject_reasons)} users provided rejection reasons - review for common themes")
    
    return insights
