"""
Educational Resources API Routes
Provides CRUD operations for managing educational resources
"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from ...db.database import database

router = APIRouter(prefix="/educational-resources", tags=["educational-resources"])


class EducationalResourceCreate(BaseModel):
    """Schema for creating an educational resource"""
    category_id: int
    title: str = Field(..., max_length=255)
    source: str = Field(..., max_length=255)
    type: str = Field(..., pattern="^(article|video|podcast|lesson)$")
    duration: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    url: str
    display_order: int = 0
    is_active: bool = True
    created_by: Optional[str] = None


class EducationalResourceUpdate(BaseModel):
    """Schema for updating an educational resource"""
    title: Optional[str] = Field(None, max_length=255)
    source: Optional[str] = Field(None, max_length=255)
    type: Optional[str] = Field(None, pattern="^(article|video|podcast|lesson)$")
    duration: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None
    updated_by: Optional[str] = None


class EducationalResourceResponse(BaseModel):
    """Schema for educational resource response"""
    id: int
    category_id: int
    title: str
    source: str
    type: str
    duration: Optional[str]
    description: Optional[str]
    url: str
    display_order: int
    is_active: bool
    created_at: datetime
    created_by: Optional[str]
    updated_at: datetime
    updated_by: Optional[str]


class CategoryWithResources(BaseModel):
    """Schema for category with its educational resources"""
    id: int
    name: str
    type: str
    description: Optional[str]
    resources: List[EducationalResourceResponse]


@router.get("/category/{category_id}", response_model=CategoryWithResources)
async def get_category_with_resources(
    category_id: int,
    include_inactive: bool = False
):
    """Get a category with all its educational resources"""
    
    # Get category info
    category_query = """
        SELECT id, name, type, description
        FROM political_categories
        WHERE id = :category_id AND is_active = true
    """
    category = await database.fetch_one(category_query, {"category_id": category_id})
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category {category_id} not found"
        )
    
    # Get resources for this category
    resources_query = """
        SELECT id, category_id, title, source, type, duration, description, url,
               display_order, is_active, created_at, created_by, updated_at, updated_by
        FROM educational_resources
        WHERE category_id = :category_id
    """
    
    if not include_inactive:
        resources_query += " AND is_active = true"
    
    resources_query += " ORDER BY display_order, id"
    
    resources = await database.fetch_all(resources_query, {"category_id": category_id})
    
    return {
        "id": category["id"],
        "name": category["name"],
        "type": category["type"],
        "description": category["description"],
        "resources": [dict(r) for r in resources]
    }


@router.get("/", response_model=List[EducationalResourceResponse])
async def list_resources(
    category_id: Optional[int] = None,
    include_inactive: bool = False
):
    """List all educational resources, optionally filtered by category"""
    
    query = """
        SELECT id, category_id, title, source, type, duration, description, url,
               display_order, is_active, created_at, created_by, updated_at, updated_by
        FROM educational_resources
        WHERE 1=1
    """
    params = {}
    
    if category_id:
        query += " AND category_id = :category_id"
        params["category_id"] = category_id
    
    if not include_inactive:
        query += " AND is_active = true"
    
    query += " ORDER BY category_id, display_order, id"
    
    resources = await database.fetch_all(query, params)
    return [dict(r) for r in resources]


@router.get("/{resource_id}", response_model=EducationalResourceResponse)
async def get_resource(
    resource_id: int
):
    """Get a specific educational resource by ID"""
    
    query = """
        SELECT id, category_id, title, source, type, duration, description, url,
               display_order, is_active, created_at, created_by, updated_at, updated_by
        FROM educational_resources
        WHERE id = :resource_id
    """
    
    resource = await database.fetch_one(query, {"resource_id": resource_id})
    
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource {resource_id} not found"
        )
    
    return dict(resource)


@router.post("/", response_model=EducationalResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(
    resource: EducationalResourceCreate
):
    """Create a new educational resource"""
    
    # Verify category exists
    category_check = await database.fetch_one(
        "SELECT id FROM political_categories WHERE id = :category_id",
        {"category_id": resource.category_id}
    )
    
    if not category_check:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category {resource.category_id} not found"
        )
    
    query = """
        INSERT INTO educational_resources 
        (category_id, title, source, type, duration, description, url, display_order, is_active, created_by)
        VALUES (:category_id, :title, :source, :type, :duration, :description, :url, :display_order, :is_active, :created_by)
        RETURNING id, category_id, title, source, type, duration, description, url,
                  display_order, is_active, created_at, created_by, updated_at, updated_by
    """
    
    new_resource = await database.fetch_one(query, resource.dict())
    return dict(new_resource)


@router.put("/{resource_id}", response_model=EducationalResourceResponse)
async def update_resource(
    resource_id: int,
    resource: EducationalResourceUpdate
):
    """Update an existing educational resource"""
    
    # Check if resource exists
    existing = await database.fetch_one(
        "SELECT id FROM educational_resources WHERE id = :resource_id",
        {"resource_id": resource_id}
    )
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource {resource_id} not found"
        )
    
    # Build update query dynamically based on provided fields
    update_fields = []
    params = {"resource_id": resource_id}
    
    for field, value in resource.dict(exclude_unset=True).items():
        if value is not None:
            update_fields.append(f"{field} = :{field}")
            params[field] = value
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Always update updated_at
    update_fields.append("updated_at = NOW()")
    
    query = f"""
        UPDATE educational_resources
        SET {', '.join(update_fields)}
        WHERE id = :resource_id
        RETURNING id, category_id, title, source, type, duration, description, url,
                  display_order, is_active, created_at, created_by, updated_at, updated_by
    """
    
    updated_resource = await database.fetch_one(query, params)
    return dict(updated_resource)


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: int
):
    """Delete an educational resource"""
    
    result = await database.execute(
        "DELETE FROM educational_resources WHERE id = :resource_id",
        {"resource_id": resource_id}
    )
    
    if result == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource {resource_id} not found"
        )
    
    return None


@router.post("/bulk-import", status_code=status.HTTP_201_CREATED)
async def bulk_import_resources(
    resources: List[EducationalResourceCreate]
):
    """Bulk import educational resources from JSON"""
    
    imported = 0
    errors = []
    
    for idx, resource in enumerate(resources):
        try:
            # Verify category exists (check without is_active filter)
            category_check = await database.fetch_one(
                "SELECT id FROM political_categories WHERE id = :category_id",
                {"category_id": resource.category_id}
            )
            
            if not category_check:
                errors.append(f"Resource {idx}: Category {resource.category_id} not found")
                continue
            
            query = """
                INSERT INTO educational_resources 
                (category_id, title, source, type, duration, description, url, display_order, is_active, created_by)
                VALUES (:category_id, :title, :source, :type, :duration, :description, :url, :display_order, :is_active, :created_by)
            """
            
            await database.execute(query, resource.dict())
            imported += 1
            
        except Exception as e:
            errors.append(f"Resource {idx}: {str(e)}")
    
    return {
        "imported": imported,
        "total": len(resources),
        "errors": errors if errors else None
    }
