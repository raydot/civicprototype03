"""
Learning API Routes - Endpoints for accessing learning insights and metrics

Provides access to:
- Category performance metrics
- Underperforming category identification
- Rejection pattern analysis
- Missing category suggestions
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ...services.learning_service import get_learning_service, get_feedback_analyzer
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/learning", tags=["learning"])


class CategoryPerformanceResponse(BaseModel):
    """Response model for category performance data"""
    category_id: int
    period_days: int
    total_feedback: int
    breakdown: dict
    success_rate: float
    avg_confidence: float
    avg_rating: Optional[float]
    rejection_reasons: list
    status: str
    recommendations: list


@router.get("/underperforming-categories")
async def get_underperforming_categories(
    success_threshold: float = Query(default=0.3, ge=0.0, le=1.0, description="Minimum acceptable success rate"),
    min_samples: int = Query(default=10, ge=1, description="Minimum feedback samples required"),
    days: int = Query(default=30, ge=1, le=365, description="Time window in days")
):
    """
    Get list of categories that are performing below threshold.
    
    Identifies categories that need attention based on:
    - Low success rate (acceptance rate)
    - Sufficient sample size to be statistically meaningful
    
    Returns:
        List of underperforming categories with metrics and recommendations
    """
    try:
        learning_service = get_learning_service()
        
        underperforming = await learning_service.identify_underperforming_categories(
            success_threshold=success_threshold,
            min_samples=min_samples,
            days=days
        )
        
        return {
            "success_threshold": success_threshold,
            "min_samples": min_samples,
            "period_days": days,
            "count": len(underperforming),
            "categories": underperforming
        }
        
    except Exception as e:
        logger.error(f"Failed to get underperforming categories: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve underperforming categories"
        )


@router.get("/category-performance/{category_id}", response_model=CategoryPerformanceResponse)
async def get_category_performance(
    category_id: int,
    days: int = Query(default=30, ge=1, le=365, description="Time window in days")
):
    """
    Get comprehensive performance summary for a specific category.
    
    Returns:
        Detailed metrics, trends, and recommendations for improvement
    """
    try:
        learning_service = get_learning_service()
        
        performance = await learning_service.get_category_performance_summary(
            category_id=category_id,
            days=days
        )
        
        if "error" in performance:
            raise HTTPException(status_code=404, detail=performance["error"])
        
        return performance
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get category performance: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve category performance"
        )


@router.get("/rejection-patterns")
async def get_rejection_patterns(
    category_id: Optional[int] = Query(default=None, description="Specific category ID (optional)"),
    days: int = Query(default=30, ge=1, le=365, description="Time window in days")
):
    """
    Analyze rejection patterns to understand why users reject matches.
    
    Can analyze:
    - All categories (category_id=None)
    - Specific category (category_id=123)
    
    Returns:
        Common rejection reasons and patterns
    """
    try:
        analyzer = get_feedback_analyzer()
        
        patterns = await analyzer.analyze_rejection_patterns(
            category_id=category_id,
            days=days
        )
        
        return patterns
        
    except Exception as e:
        logger.error(f"Failed to analyze rejection patterns: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze rejection patterns"
        )


@router.get("/missing-categories")
async def identify_missing_categories(
    confidence_threshold: float = Query(default=0.5, ge=0.0, le=1.0, description="Max confidence for 'low' matches"),
    frequency_threshold: int = Query(default=5, ge=1, description="Min occurrences to suggest new category"),
    days: int = Query(default=30, ge=1, le=365, description="Time window in days")
):
    """
    Identify potential missing categories based on low-confidence match patterns.
    
    Analyzes user inputs that consistently get low-confidence matches
    to suggest new categories that might be needed.
    
    Returns:
        Suggested new categories with supporting data
    """
    try:
        analyzer = get_feedback_analyzer()
        
        suggestions = await analyzer.identify_missing_categories(
            confidence_threshold=confidence_threshold,
            frequency_threshold=frequency_threshold,
            days=days
        )
        
        return {
            "confidence_threshold": confidence_threshold,
            "frequency_threshold": frequency_threshold,
            "period_days": days,
            "suggestions_count": len(suggestions),
            "suggestions": suggestions
        }
        
    except Exception as e:
        logger.error(f"Failed to identify missing categories: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to identify missing categories"
        )


@router.get("/insights")
async def get_learning_insights(
    days: int = Query(default=30, ge=1, le=365, description="Time window in days")
):
    """
    Get comprehensive learning insights across all categories.
    
    Provides high-level overview of:
    - System-wide performance
    - Categories needing attention
    - Improvement opportunities
    - Trending patterns
    
    Returns:
        Dashboard-ready insights and metrics
    """
    try:
        learning_service = get_learning_service()
        analyzer = get_feedback_analyzer()
        
        # Get underperforming categories
        underperforming = await learning_service.identify_underperforming_categories(
            success_threshold=0.5,
            min_samples=5,
            days=days
        )
        
        # Get rejection patterns
        rejection_patterns = await analyzer.analyze_rejection_patterns(days=days)
        
        # Get missing category suggestions
        missing_categories = await analyzer.identify_missing_categories(
            confidence_threshold=0.5,
            frequency_threshold=3,
            days=days
        )
        
        return {
            "period_days": days,
            "summary": {
                "underperforming_count": len(underperforming),
                "missing_categories_count": len(missing_categories),
                "needs_attention": len(underperforming) > 0 or len(missing_categories) > 0
            },
            "underperforming_categories": underperforming[:5],  # Top 5
            "rejection_patterns": rejection_patterns.get("rejection_patterns", [])[:5],  # Top 5
            "missing_category_suggestions": missing_categories[:5],  # Top 5
            "recommendations": _generate_system_recommendations(underperforming, missing_categories)
        }
        
    except Exception as e:
        logger.error(f"Failed to get learning insights: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve learning insights"
        )


def _generate_system_recommendations(underperforming: list, missing: list) -> list:
    """Generate system-level recommendations based on insights."""
    recommendations = []
    
    if len(underperforming) > 5:
        recommendations.append({
            "priority": "high",
            "action": "review_categories",
            "message": f"{len(underperforming)} categories are underperforming - review and update keywords"
        })
    
    if len(missing) > 3:
        recommendations.append({
            "priority": "medium",
            "action": "add_categories",
            "message": f"Consider adding {len(missing)} new categories based on user patterns"
        })
    
    if not underperforming and not missing:
        recommendations.append({
            "priority": "low",
            "action": "monitor",
            "message": "System is performing well - continue monitoring"
        })
    
    return recommendations
