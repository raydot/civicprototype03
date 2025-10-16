"""
AI-Assisted Category Administration
Allows creating and enhancing political categories using AI
Now uses PostgreSQL database instead of JSON file
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel
from typing import List, Optional
import json
import secrets
from pathlib import Path
from openai import OpenAI
from datetime import datetime

from ...config import settings
from ...utils.logging import structured_logger
from ...db.database import database

logger = structured_logger
router = APIRouter(prefix="/category-admin", tags=["category-admin"])
security = HTTPBasic()

# Admin credentials - in production, use environment variables
ADMIN_USERNAME = settings.admin_username if hasattr(settings, 'admin_username') else "admin"
ADMIN_PASSWORD = settings.admin_password if hasattr(settings, 'admin_password') else "meatspace"


def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    """Verify admin credentials using HTTP Basic Auth"""
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# Keep JSON file path for backward compatibility / export
CATEGORIES_FILE = Path(__file__).parent.parent.parent / "data" / "political_categories.json"


class CategoryRequest(BaseModel):
    description: str


class SimilarityWarning(BaseModel):
    type: str
    message: str
    recommendation: str


class CategoryPreview(BaseModel):
    name: str
    description: str
    keywords: List[str]
    type: str
    political_spectrum: str
    policy_areas: List[str]
    similarity_warnings: List[SimilarityWarning]


class EnhanceRequest(BaseModel):
    additional_context: str


async def load_categories():
    """Load categories from database"""
    if database is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    query = """
        SELECT id, name, type, description, keywords, success_count, 
               total_usage_count, terminology_source, terminology_sections, metadata
        FROM political_categories
        WHERE is_active = true
        ORDER BY id
    """
    rows = await database.fetch_all(query)
    
    return {
        "categories": [
            {
                "id": row["id"],
                "name": row["name"],
                "type": row["type"],
                "description": row["description"],
                "keywords": json.loads(row["keywords"]) if isinstance(row["keywords"], str) else (row["keywords"] or []),
                "success_count": row["success_count"],
                "total_usage_count": row["total_usage_count"],
                "terminology_source": row["terminology_source"],
                "terminology_sections": json.loads(row["terminology_sections"]) if isinstance(row["terminology_sections"], str) else (row["terminology_sections"] or []),
                "metadata": json.loads(row["metadata"]) if isinstance(row["metadata"], str) else (row["metadata"] or {})
            }
            for row in rows
        ]
    }


async def save_category(category_data: dict, created_by: str = "ai_admin"):
    """Save a new category to database"""
    if database is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    query = """
        INSERT INTO political_categories 
        (id, name, type, description, keywords, success_count, total_usage_count,
         terminology_source, terminology_sections, metadata, created_by, updated_by)
        VALUES (:id, :name, :type, :description, :keywords, :success_count, :total_usage_count,
                :terminology_source, :terminology_sections, :metadata, :created_by, :updated_by)
        RETURNING id
    """
    
    result = await database.fetch_one(query, {
        "id": category_data["id"],
        "name": category_data["name"],
        "type": category_data["type"],
        "description": category_data["description"],
        "keywords": json.dumps(category_data["keywords"]),
        "success_count": category_data.get("success_count", 0),
        "total_usage_count": category_data.get("total_usage_count", 0),
        "terminology_source": category_data.get("terminology_source", "ai_generated"),
        "terminology_sections": json.dumps(category_data.get("terminology_sections", [])),
        "metadata": json.dumps(category_data.get("metadata", {})),
        "created_by": created_by,
        "updated_by": created_by
    })
    
    return result["id"]


@router.post("/generate-preview", response_model=CategoryPreview)
async def generate_category_preview(request: CategoryRequest, admin: str = Depends(verify_admin)):
    """
    Generate a category preview from natural language description.
    AI checks for redundancy and suggests complete category definition.
    """
    try:
        # Initialize OpenAI client with API key from settings
        if not settings.openai_api_key:
            raise HTTPException(
                status_code=500, 
                detail="OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
            )
        
        client = OpenAI(api_key=settings.openai_api_key)
        
        # Load existing categories
        data = await load_categories()
        existing_categories = data["categories"]
        
        # Create context for AI - show existing categories
        existing_summary = "\n".join([
            f"- ID {cat['id']}: {cat['name']} - {cat['description'][:80]}..."
            for cat in existing_categories[:15]  # Show sample
        ])
        
        prompt = f"""You are a political category expert for a voter recommendation system. Generate a new political category definition.

EXISTING CATEGORIES (sample):
{existing_summary}

USER REQUEST: "{request.description}"

TASK:
1. Check if this request is redundant with existing categories
2. If redundant, identify which category(ies) it overlaps with
3. If new, generate a comprehensive category definition

Return JSON with this exact structure:
{{
  "is_redundant": boolean,
  "redundant_with": ["category names"] or null,
  "recommendation": "create_new" or "enhance_existing",
  "category": {{
    "name": "Short, clear category name (3-5 words)",
    "description": "2-3 sentences explaining the issue/policy. Be specific and policy-focused.",
    "keywords": ["15-25 relevant keywords including synonyms, phrases, and common terms"],
    "type": "issue" or "policy",
    "political_spectrum": "progressive" or "conservative" or "bipartisan" or "polarized",
    "policy_areas": ["2-3 specific policy areas"]
  }}
}}

KEYWORD GUIDELINES:
- Include formal terms AND informal/colloquial phrases
- Add terms from both progressive and conservative perspectives
- Include common misspellings or variations
- Add related concepts and synonyms
- Think about how real voters talk about this issue

DESCRIPTION GUIDELINES:
- Be neutral and informative
- Explain why this matters to voters
- Mention key policy debates or tensions
- Keep it concise but meaningful

Example good keywords for "Climate & Environment":
["climate change", "global warming", "renewable energy", "carbon emissions", "green energy", "climate denial", "climate hoax", "paris agreement", "solar", "wind", "electric vehicles"]
"""
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3  # Lower temp for consistency
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # Build similarity warnings
        warnings = []
        if result.get("is_redundant"):
            warnings.append(SimilarityWarning(
                type="redundancy",
                message=f"Similar to existing: {', '.join(result['redundant_with'])}",
                recommendation=result["recommendation"]
            ))
        
        category_data = result["category"]
        
        logger.info(f"Generated category preview: {category_data['name']}")
        
        return CategoryPreview(
            name=category_data["name"],
            description=category_data["description"],
            keywords=category_data["keywords"],
            type=category_data["type"],
            political_spectrum=category_data["political_spectrum"],
            policy_areas=category_data["policy_areas"],
            similarity_warnings=warnings
        )
        
    except Exception as e:
        logger.error(f"Error generating category preview: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate preview: {str(e)}")


@router.post("/create-category")
async def create_category(preview: CategoryPreview, admin: str = Depends(verify_admin)):
    """
    Create a new category from approved AI preview.
    Saves to PostgreSQL database
    """
    try:
        if database is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        # Find next available ID
        query = "SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM political_categories"
        result = await database.fetch_one(query)
        next_id = result["next_id"]
        
        new_category = {
            "id": next_id,
            "name": preview.name,
            "type": preview.type,
            "description": preview.description,
            "keywords": preview.keywords,
            "success_count": 0,
            "total_usage_count": 0,
            "terminology_source": "ai_generated",
            "terminology_sections": [],
            "metadata": {
                "priority_level": "medium",
                "political_spectrum": preview.political_spectrum,
                "policy_areas": preview.policy_areas
            }
        }
        
        await save_category(new_category, created_by="ai_admin")
        
        logger.info(f"Created new category in database: ID {next_id} - {preview.name}")
        
        return {
            "status": "success",
            "category_id": next_id,
            "message": f"Category '{preview.name}' created successfully"
        }
        
    except Exception as e:
        logger.error(f"Error creating category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create category: {str(e)}")


@router.get("/categories")
async def list_categories(admin: str = Depends(verify_admin)):
    """Get all categories for review"""
    try:
        data = await load_categories()
        return {
            "total": len(data["categories"]),
            "categories": data["categories"]
        }
    except Exception as e:
        logger.error(f"Error listing categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list categories: {str(e)}")


@router.get("/categories/{category_id}")
async def get_category(category_id: int, admin: str = Depends(verify_admin)):
    """Get a specific category by ID"""
    try:
        if database is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        query = """
            SELECT id, name, type, description, keywords, success_count,
                   total_usage_count, terminology_source, terminology_sections, metadata
            FROM political_categories
            WHERE id = :category_id AND is_active = true
        """
        row = await database.fetch_one(query, {"category_id": category_id})
        
        if not row:
            raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
        
        return {
            "id": row["id"],
            "name": row["name"],
            "type": row["type"],
            "description": row["description"],
            "keywords": json.loads(row["keywords"]) if isinstance(row["keywords"], str) else (row["keywords"] or []),
            "success_count": row["success_count"],
            "total_usage_count": row["total_usage_count"],
            "terminology_source": row["terminology_source"],
            "terminology_sections": json.loads(row["terminology_sections"]) if isinstance(row["terminology_sections"], str) else (row["terminology_sections"] or []),
            "metadata": json.loads(row["metadata"]) if isinstance(row["metadata"], str) else (row["metadata"] or {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get category: {str(e)}")


@router.post("/categories/{category_id}/update-keywords")
async def update_category_keywords(category_id: int, request: dict, admin: str = Depends(verify_admin)):
    """
    Update keywords for an existing category (manual editing)
    """
    try:
        if database is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        keywords = request.get("keywords", [])
        
        # Update database
        query = """
            UPDATE political_categories 
            SET keywords = :keywords, updated_at = NOW(), updated_by = 'admin'
            WHERE id = :category_id AND is_active = true
            RETURNING id
        """
        result = await database.fetch_one(query, {
            "keywords": json.dumps(keywords),
            "category_id": category_id
        })
        
        if not result:
            raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
        
        logger.info(f"Updated keywords for category {category_id}")
        
        return {
            "status": "success",
            "category_id": category_id,
            "total_keywords": len(keywords)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating keywords: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update keywords: {str(e)}")


@router.post("/categories/{category_id}/enhance")
async def enhance_category_keywords(category_id: int, request: EnhanceRequest, admin: str = Depends(verify_admin)):
    """
    Use AI to suggest additional keywords for an existing category.
    Useful when a category isn't matching well.
    """
    try:
        # Initialize OpenAI client with API key from settings
        if not settings.openai_api_key:
            raise HTTPException(
                status_code=500, 
                detail="OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
            )
        
        client = OpenAI(api_key=settings.openai_api_key)
        
        if database is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        # Get category from database
        query = "SELECT id, name, description, keywords FROM political_categories WHERE id = :category_id AND is_active = true"
        category = await database.fetch_one(query, {"category_id": category_id})
        
        if not category:
            raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
        
        current_keywords = category["keywords"] or []
        
        prompt = f"""Enhance this political category with better keywords based on additional context.

CATEGORY: {category['name']}
DESCRIPTION: {category['description']}
CURRENT KEYWORDS: {', '.join(current_keywords)}

ADDITIONAL CONTEXT: "{request.additional_context}"

Generate 10-20 NEW keywords that:
1. Aren't already in the current keyword list
2. Capture how people actually talk about this issue
3. Include both progressive and conservative terminology
4. Cover common phrases, synonyms, and related concepts
5. Consider the additional context provided

Return JSON: {{"new_keywords": ["keyword1", "keyword2", ...]}}
"""
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3
        )
        
        result = json.loads(response.choices[0].message.content)
        new_keywords = result["new_keywords"]
        
        # Add to category (avoid duplicates)
        existing = set(k.lower() for k in current_keywords)
        added_keywords = [k for k in new_keywords if k.lower() not in existing]
        
        # Update database
        updated_keywords = current_keywords + added_keywords
        update_query = """
            UPDATE political_categories 
            SET keywords = :keywords, updated_at = NOW(), updated_by = 'ai_admin'
            WHERE id = :category_id
        """
        await database.execute(update_query, {
            "keywords": json.dumps(updated_keywords),
            "category_id": category_id
        })
        
        logger.info(f"Enhanced category {category_id} with {len(added_keywords)} new keywords")
        
        return {
            "status": "success",
            "category_id": category_id,
            "added_keywords": added_keywords,
            "total_keywords": len(updated_keywords)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enhancing category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to enhance category: {str(e)}")


@router.delete("/categories/{category_id}")
async def delete_category(category_id: int, admin: str = Depends(verify_admin)):
    """Soft delete a category (marks as inactive)"""
    try:
        if database is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        # Soft delete - mark as inactive instead of actually deleting
        query = """
            UPDATE political_categories 
            SET is_active = false, updated_at = NOW(), updated_by = 'ai_admin'
            WHERE id = :category_id AND is_active = true
            RETURNING id
        """
        result = await database.fetch_one(query, {"category_id": category_id})
        
        if not result:
            raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
        
        logger.warning(f"Soft deleted category {category_id}")
        
        return {
            "status": "success",
            "message": f"Category {category_id} deactivated"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete category: {str(e)}")
