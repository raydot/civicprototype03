"""
Category matching API routes for VoterPrime political recommendations
"""
from fastapi import APIRouter, HTTPException, Query, Request
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import time

from ...models.category_matcher import get_category_matcher, CategoryMatch
from ...data.category_loader import get_category_loader
from ...services.feedback_service import UserSession, get_interaction_tracker
from ...utils.logging import structured_logger

router = APIRouter(prefix="/category-matching", tags=["Category Matching"])
logger = structured_logger


# Request/Response Models
class CategoryMatchRequest(BaseModel):
    """Request model for category matching"""
    user_input: str = Field(..., description="User's political priority or preference text")
    category_types: Optional[List[str]] = Field(
        None, 
        description="Filter by category types: 'issue', 'candidate_attribute', 'policy', 'attribute'"
    )
    top_k: int = Field(5, ge=1, le=20, description="Number of top matches to return")


class CategoryMatchResponse(BaseModel):
    """Individual category match response"""
    category_id: int
    category_name: str
    category_type: str
    similarity_score: float
    confidence_score: float
    keywords: List[str]
    metadata: Dict[str, Any]


class CategoryMatchingResult(BaseModel):
    """Complete category matching result"""
    user_input: str
    matches: List[CategoryMatchResponse]
    total_categories_searched: int
    processing_time_ms: int
    model_info: Dict[str, Any]
    interaction_id: Optional[str] = Field(None, description="ID for tracking user feedback on this interaction")


class CategoryRefinementRequest(BaseModel):
    """Request model for category refinement"""
    user_input: str = Field(..., description="Original user input")
    rejected_category_ids: List[int] = Field(..., description="IDs of categories user rejected")
    category_types: Optional[List[str]] = Field(None, description="Filter by category types")
    top_k: int = Field(5, ge=1, le=20, description="Number of alternative matches to return")


class CategoryInfoResponse(BaseModel):
    """Category information response"""
    category_id: int
    name: str
    type: str
    description: str
    keywords: List[str]
    success_rate: float
    total_usage: int
    metadata: Dict[str, Any]



@router.post("/find-matches", response_model=CategoryMatchingResult)
async def find_category_matches(request: CategoryMatchRequest, http_request: Request):
    """
    Find political categories that match user's priorities
    
    Example user inputs:
    - "I really care about climate change and environmental protection"
    - "Healthcare access is my top priority"
    - "I want a progressive candidate who supports social justice"
    """
    start_time = time.time()
    
    try:
        logger.info(f"Finding category matches for: '{request.user_input[:50]}...'")
        
        # Create or update user session for feedback tracking
        user_session = UserSession(http_request)
        session_id = await user_session.create_or_update_session()
        
        category_matcher = get_category_matcher()
        
        # Find matches
        matches = category_matcher.find_matches(
            user_input=request.user_input,
            category_types=request.category_types,
            top_k=request.top_k
        )
        
        # Convert to response format
        match_responses = [
            CategoryMatchResponse(
                category_id=match.category_id,
                category_name=match.category_name,
                category_type=match.category_type,
                similarity_score=match.similarity_score,
                confidence_score=match.confidence_score,
                keywords=match.keywords,
                metadata=match.metadata
            )
            for match in matches
        ]
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Track interaction asynchronously (non-blocking with graceful degradation)
        interaction_id = "unknown"
        tracking_warning = None
        
        try:
            interaction_tracker = get_interaction_tracker()
            interaction_id = await interaction_tracker.track_category_matching(
                session_id=session_id,
                user_input=request.user_input,
                matches=[{
                    'category_id': match.category_id,
                    'category_name': match.category_name,
                    'confidence_score': match.confidence_score,
                    'similarity_score': match.similarity_score
                } for match in matches],
                processing_time=processing_time
            )
            logger.info(f"Tracked interaction: {interaction_id}")
        except Exception as tracking_error:
            # Graceful degradation - log error but continue with results
            logger.warning(f"Interaction tracking failed (non-critical): {str(tracking_error)}")
            tracking_warning = "Feedback tracking temporarily unavailable"
            interaction_id = f"untracked-{session_id[:8]}"
        
        result = CategoryMatchingResult(
            user_input=request.user_input,
            matches=match_responses,
            total_categories_searched=len(category_matcher.categories),
            processing_time_ms=processing_time,
            model_info=category_matcher.get_model_info(),
            interaction_id=interaction_id
        )
        
        logger.info(f"Found {len(matches)} matches in {processing_time}ms, interaction_id: {interaction_id}")
        
        # Add warning to response if tracking failed
        if tracking_warning:
            logger.info(f"Returning results with warning: {tracking_warning}")
        
        return result
        
    except Exception as e:
        logger.error(f"Category matching failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Category matching failed: {str(e)}")


@router.post("/refine-matches", response_model=CategoryMatchingResult)
async def refine_category_matches(request: CategoryRefinementRequest):
    """
    Get alternative category matches when user rejects initial suggestions
    
    Use this when user says "No, that's not what I meant" to initial matches
    """
    start_time = time.time()
    
    try:
        logger.info(f"Refining matches, excluding {len(request.rejected_category_ids)} categories")
        
        category_matcher = get_category_matcher()
        
        # Get refined matches
        matches = category_matcher.refine_matches(
            user_input=request.user_input,
            rejected_category_ids=request.rejected_category_ids,
            category_types=request.category_types,
            top_k=request.top_k
        )
        
        # Convert to response format
        match_responses = [
            CategoryMatchResponse(
                category_id=match.category_id,
                category_name=match.category_name,
                category_type=match.category_type,
                similarity_score=match.similarity_score,
                confidence_score=match.confidence_score,
                keywords=match.keywords,
                metadata=match.metadata
            )
            for match in matches
        ]
        
        processing_time = int((time.time() - start_time) * 1000)
        
        result = CategoryMatchingResult(
            user_input=request.user_input,
            matches=match_responses,
            total_categories_searched=len(category_matcher.categories),
            processing_time_ms=processing_time,
            model_info=category_matcher.get_model_info()
        )
        
        logger.info(f"Refined to {len(matches)} alternative matches in {processing_time}ms")
        
        return result
        
    except Exception as e:
        logger.error(f"Category refinement failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Category refinement failed: {str(e)}")


@router.get("/categories", response_model=List[CategoryInfoResponse])
async def get_all_categories(
    category_type: Optional[str] = Query(None, description="Filter by category type"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of categories to return")
):
    """
    Get list of all available political categories
    
    Useful for understanding what categories are available for matching
    """
    try:
        category_matcher = get_category_matcher()
        
        categories = category_matcher.categories
        
        # Filter by type if specified
        if category_type:
            categories = [cat for cat in categories if cat.get('type') == category_type]
        
        # Limit results
        categories = categories[:limit]
        
        # Convert to response format
        category_responses = []
        for cat in categories:
            success_rate = 0.0
            total_usage = cat.get('total_usage_count', 0)
            if total_usage > 0:
                success_rate = cat.get('success_count', 0) / total_usage
            
            category_responses.append(CategoryInfoResponse(
                category_id=cat['id'],
                name=cat['name'],
                type=cat.get('type', 'unknown'),
                description=cat.get('description', ''),
                keywords=cat.get('keywords', []),
                success_rate=success_rate,
                total_usage=total_usage,
                metadata=cat.get('metadata', {})
            ))
        
        logger.info(f"Retrieved {len(category_responses)} categories")
        
        return category_responses
        
    except Exception as e:
        logger.error(f"Failed to get categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get categories: {str(e)}")


@router.get("/categories/{category_id}", response_model=CategoryInfoResponse)
async def get_category_by_id(category_id: int):
    """Get detailed information about a specific category"""
    try:
        category_matcher = get_category_matcher()
        
        category = category_matcher.get_category_by_id(category_id)
        
        if not category:
            raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
        
        success_rate = 0.0
        total_usage = category.get('total_usage_count', 0)
        if total_usage > 0:
            success_rate = category.get('success_count', 0) / total_usage
        
        response = CategoryInfoResponse(
            category_id=category['id'],
            name=category['name'],
            type=category.get('type', 'unknown'),
            description=category.get('description', ''),
            keywords=category.get('keywords', []),
            success_rate=success_rate,
            total_usage=total_usage,
            metadata=category.get('metadata', {})
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get category {category_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get category: {str(e)}")


@router.get("/category-types")
async def get_category_types():
    """Get list of all available category types"""
    try:
        category_loader = get_category_loader()
        types = category_loader.get_category_types()
        
        return {
            "category_types": types,
            "descriptions": {
                "issue": "Political issues and policy areas (e.g., Climate, Healthcare)",
                "candidate_attribute": "Candidate characteristics (e.g., Progressive, Conservative)",
                "policy": "Specific policy proposals (e.g., Universal Healthcare, Green New Deal)",
                "attribute": "General political attributes (e.g., Pro-Business, Environmentalist)"
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get category types: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get category types: {str(e)}")


@router.get("/model-info")
async def get_model_info():
    """Get information about the category matching model"""
    try:
        category_matcher = get_category_matcher()
        return category_matcher.get_model_info()
        
    except Exception as e:
        logger.error(f"Failed to get model info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")


# Example queries for testing
@router.get("/examples")
async def get_example_queries():
    """Get example user queries for testing the category matching"""
    return {
        "example_queries": [
            {
                "query": "I really care about climate change and environmental protection",
                "expected_matches": ["Climate & Environment", "Environmentalist", "Green New Deal"]
            },
            {
                "query": "Healthcare access is my top priority, especially for seniors",
                "expected_matches": ["Healthcare & Social Services", "Universal Healthcare"]
            },
            {
                "query": "I want a progressive candidate who supports social justice",
                "expected_matches": ["Progressive Champion", "Civil Rights & Social Justice", "Social Progressive"]
            },
            {
                "query": "Economic growth and job creation are most important to me",
                "expected_matches": ["Economy & Jobs", "Pro-Business", "Infrastructure Investment"]
            },
            {
                "query": "I'm looking for someone with government experience who can get things done",
                "expected_matches": ["Experienced Veteran", "Moderate Pragmatist"]
            },
            {
                "query": "Border security and immigration enforcement matter to me",
                "expected_matches": ["Immigration & Border Security", "Immigration Reform"]
            }
        ]
    }
