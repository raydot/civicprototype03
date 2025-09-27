"""
Admin API routes for VoterPrime category management
Provides CRUD operations and analytics for political categories
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import FileResponse
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import json
import os
from datetime import datetime, timedelta

from ...models.category_matcher import get_category_matcher
from ...data.category_loader import get_category_loader
from ...utils.logging import structured_logger

router = APIRouter(prefix="/admin", tags=["Admin"])
logger = structured_logger

# Request/Response Models
class CategoryUpdateRequest(BaseModel):
    """Request model for updating a category"""
    name: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class CategoryCreateRequest(BaseModel):
    """Request model for creating a new category"""
    name: str = Field(..., description="Category name")
    type: str = Field(..., description="Category type: issue, candidate_attribute, policy, attribute")
    description: str = Field(..., description="Category description")
    keywords: List[str] = Field(..., description="Keywords for matching")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class CategoryPerformanceResponse(BaseModel):
    """Category performance analytics"""
    category_id: int
    category_name: str
    success_rate: float
    total_usage: int
    success_count: int
    trend_7_days: str  # "improving", "declining", "stable"
    last_used: Optional[str]
    avg_confidence_score: float

class CategoryAnalyticsResponse(BaseModel):
    """Overall category analytics"""
    total_categories: int
    avg_success_rate: float
    most_successful_category: str
    least_successful_category: str
    categories_needing_attention: List[str]
    recent_user_feedback: List[Dict[str, Any]]

# Admin Authentication (Simple for MVP)
def verify_admin_token(token: str = Query(..., description="Admin authentication token")):
    """Simple admin authentication - replace with proper auth in production"""
    # For MVP, use a simple token check
    expected_token = os.getenv("ADMIN_TOKEN", "voterPrime_admin_2024")
    if token != expected_token:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    return True

@router.get("/categories/analytics", response_model=CategoryAnalyticsResponse)
async def get_category_analytics(admin_auth: bool = Depends(verify_admin_token)):
    """Get comprehensive analytics for all categories"""
    try:
        category_matcher = get_category_matcher()
        categories = category_matcher.categories
        
        # Calculate overall metrics
        total_categories = len(categories)
        success_rates = []
        category_performances = []
        
        for cat in categories:
            total_usage = cat.get('total_usage_count', 0)
            success_count = cat.get('success_count', 0)
            success_rate = success_count / total_usage if total_usage > 0 else 0
            success_rates.append(success_rate)
            
            category_performances.append({
                'name': cat['name'],
                'success_rate': success_rate,
                'total_usage': total_usage
            })
        
        avg_success_rate = sum(success_rates) / len(success_rates) if success_rates else 0
        
        # Find best and worst performing categories
        best_category = max(category_performances, key=lambda x: x['success_rate'])['name']
        worst_category = min(category_performances, key=lambda x: x['success_rate'])['name']
        
        # Categories needing attention (success rate < 60% and usage > 10)
        needing_attention = [
            cat['name'] for cat in category_performances 
            if cat['success_rate'] < 0.6 and cat['total_usage'] > 10
        ]
        
        return CategoryAnalyticsResponse(
            total_categories=total_categories,
            avg_success_rate=avg_success_rate,
            most_successful_category=best_category,
            least_successful_category=worst_category,
            categories_needing_attention=needing_attention,
            recent_user_feedback=[]  # TODO: Implement feedback collection
        )
        
    except Exception as e:
        logger.error(f"Failed to get category analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analytics failed: {str(e)}")

@router.get("/categories/performance", response_model=List[CategoryPerformanceResponse])
async def get_category_performance(
    admin_auth: bool = Depends(verify_admin_token),
    sort_by: str = Query("success_rate", description="Sort by: success_rate, usage, name"),
    order: str = Query("desc", description="Order: asc, desc")
):
    """Get detailed performance metrics for all categories"""
    try:
        category_matcher = get_category_matcher()
        categories = category_matcher.categories
        
        performance_data = []
        
        for cat in categories:
            total_usage = cat.get('total_usage_count', 0)
            success_count = cat.get('success_count', 0)
            success_rate = success_count / total_usage if total_usage > 0 else 0
            
            # Calculate trend (placeholder - would need historical data)
            trend = "stable"  # TODO: Implement trend calculation
            
            performance_data.append(CategoryPerformanceResponse(
                category_id=cat['id'],
                category_name=cat['name'],
                success_rate=success_rate,
                total_usage=total_usage,
                success_count=success_count,
                trend_7_days=trend,
                last_used=None,  # TODO: Track last usage timestamp
                avg_confidence_score=0.75  # TODO: Track actual confidence scores
            ))
        
        # Sort results
        reverse = order == "desc"
        if sort_by == "success_rate":
            performance_data.sort(key=lambda x: x.success_rate, reverse=reverse)
        elif sort_by == "usage":
            performance_data.sort(key=lambda x: x.total_usage, reverse=reverse)
        elif sort_by == "name":
            performance_data.sort(key=lambda x: x.category_name, reverse=reverse)
        
        return performance_data
        
    except Exception as e:
        logger.error(f"Failed to get category performance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Performance data failed: {str(e)}")

@router.get("/dashboard")
async def admin_dashboard():
    """Serve the admin dashboard HTML page"""
    return FileResponse("app/static/admin.html")

@router.put("/categories/{category_id}")
async def update_category(
    category_id: int,
    update_request: CategoryUpdateRequest,
    admin_auth: bool = Depends(verify_admin_token)
):
    """Update an existing category"""
    try:
        # Load current categories
        category_loader = get_category_loader()
        categories_file = category_loader.categories_file_path
        
        with open(categories_file, 'r') as f:
            data = json.load(f)
        
        # Find and update category
        category_found = False
        for cat in data['categories']:
            if cat['id'] == category_id:
                category_found = True
                
                # Update fields if provided
                if update_request.name:
                    cat['name'] = update_request.name
                if update_request.description:
                    cat['description'] = update_request.description
                if update_request.keywords:
                    cat['keywords'] = update_request.keywords
                if update_request.metadata:
                    cat['metadata'].update(update_request.metadata)
                
                # Add update timestamp
                cat['metadata']['last_updated'] = datetime.now().isoformat()
                break
        
        if not category_found:
            raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
        
        # Save updated categories
        with open(categories_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        # Reload categories in the matcher
        category_matcher = get_category_matcher()
        category_matcher.load_categories(data['categories'])
        
        logger.info(f"Updated category {category_id}: {update_request.name}")
        
        return {"message": f"Category {category_id} updated successfully"}
        
    except Exception as e:
        logger.error(f"Failed to update category {category_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@router.post("/categories")
async def create_category(
    create_request: CategoryCreateRequest,
    admin_auth: bool = Depends(verify_admin_token)
):
    """Create a new category"""
    try:
        # Load current categories
        category_loader = get_category_loader()
        categories_file = category_loader.categories_file_path
        
        with open(categories_file, 'r') as f:
            data = json.load(f)
        
        # Generate new ID
        max_id = max([cat['id'] for cat in data['categories']], default=0)
        new_id = max_id + 1
        
        # Create new category
        new_category = {
            "id": new_id,
            "name": create_request.name,
            "type": create_request.type,
            "description": create_request.description,
            "keywords": create_request.keywords,
            "success_count": 0,
            "total_usage_count": 0,
            "metadata": {
                **create_request.metadata,
                "created_date": datetime.now().isoformat(),
                "created_by": "admin"
            }
        }
        
        # Add to categories
        data['categories'].append(new_category)
        
        # Save updated categories
        with open(categories_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        # Reload categories in the matcher
        category_matcher = get_category_matcher()
        category_matcher.load_categories(data['categories'])
        
        logger.info(f"Created new category: {create_request.name} (ID: {new_id})")
        
        return {"message": f"Category '{create_request.name}' created successfully", "category_id": new_id}
        
    except Exception as e:
        logger.error(f"Failed to create category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Creation failed: {str(e)}")

@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    admin_auth: bool = Depends(verify_admin_token)
):
    """Delete a category (soft delete by marking inactive)"""
    try:
        # Load current categories
        category_loader = get_category_loader()
        categories_file = category_loader.categories_file_path
        
        with open(categories_file, 'r') as f:
            data = json.load(f)
        
        # Find and soft delete category
        category_found = False
        for cat in data['categories']:
            if cat['id'] == category_id:
                category_found = True
                cat['metadata']['is_active'] = False
                cat['metadata']['deleted_date'] = datetime.now().isoformat()
                break
        
        if not category_found:
            raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
        
        # Save updated categories
        with open(categories_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        # Reload active categories only
        active_categories = [cat for cat in data['categories'] if cat['metadata'].get('is_active', True)]
        category_matcher = get_category_matcher()
        category_matcher.load_categories(active_categories)
        
        logger.info(f"Soft deleted category {category_id}")
        
        return {"message": f"Category {category_id} deleted successfully"}
        
    except Exception as e:
        logger.error(f"Failed to delete category {category_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")

@router.post("/categories/{category_id}/keywords")
async def add_keywords_to_category(
    category_id: int,
    keywords: List[str],
    admin_auth: bool = Depends(verify_admin_token)
):
    """Add new keywords to an existing category"""
    try:
        update_request = CategoryUpdateRequest()
        
        # Get current category to merge keywords
        category_loader = get_category_loader()
        categories_file = category_loader.categories_file_path
        
        with open(categories_file, 'r') as f:
            data = json.load(f)
        
        for cat in data['categories']:
            if cat['id'] == category_id:
                # Merge new keywords with existing ones
                existing_keywords = set(cat.get('keywords', []))
                new_keywords = set(keywords)
                merged_keywords = list(existing_keywords.union(new_keywords))
                
                update_request.keywords = merged_keywords
                break
        
        # Use existing update endpoint
        return await update_category(category_id, update_request, admin_auth)
        
    except Exception as e:
        logger.error(f"Failed to add keywords to category {category_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Keyword addition failed: {str(e)}")
