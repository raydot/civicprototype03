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
from ...models.category_matcher import get_category_matcher

logger = structured_logger
router = APIRouter(prefix="/category-admin", tags=["category-admin"])
security = HTTPBasic()

# Admin credentials - in production, use environment variables
ADMIN_USERNAME = settings.admin_username if hasattr(settings, 'admin_username') else "admin"
ADMIN_PASSWORD = settings.admin_password if hasattr(settings, 'admin_password') else "meatspace"
GUEST_USERNAME = settings.guest_username if hasattr(settings, 'guest_username') else "guest"
GUEST_PASSWORD = settings.guest_password if hasattr(settings, 'guest_password') else "viewonly"


class AuthenticatedUser:
    """Represents an authenticated user with role information"""
    def __init__(self, username: str, role: str):
        self.username = username
        self.role = role  # "admin" or "guest"
    
    def is_admin(self) -> bool:
        return self.role == "admin"
    
    def can_write(self) -> bool:
        return self.is_admin()


def verify_credentials(credentials: HTTPBasicCredentials = Depends(security)) -> AuthenticatedUser:
    """Verify user credentials and return authenticated user with role"""
    # Check admin credentials
    is_admin = (
        secrets.compare_digest(credentials.username, ADMIN_USERNAME) and
        secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    )
    
    if is_admin:
        return AuthenticatedUser(username=credentials.username, role="admin")
    
    # Check guest credentials
    is_guest = (
        secrets.compare_digest(credentials.username, GUEST_USERNAME) and
        secrets.compare_digest(credentials.password, GUEST_PASSWORD)
    )
    
    if is_guest:
        return AuthenticatedUser(username=credentials.username, role="guest")
    
    # Invalid credentials
    raise HTTPException(
        status_code=401,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Basic"},
    )


def require_admin(user: AuthenticatedUser = Depends(verify_credentials)) -> AuthenticatedUser:
    """Require admin role (write access)"""
    if not user.is_admin():
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required. Guest users have read-only access."
        )
    return user


def require_auth(user: AuthenticatedUser = Depends(verify_credentials)) -> AuthenticatedUser:
    """Require any authenticated user (read-only OK)"""
    return user


# Legacy compatibility - maps to require_admin
def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    """Legacy admin verification - use require_admin instead"""
    user = verify_credentials(credentials)
    if not user.is_admin():
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required"
        )
    return user.username

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


class TransformRequest(BaseModel):
    transform_instructions: str
    source_category_ids: List[int]  # Can be one (split) or multiple (merge)


async def load_categories(sort_by: str = "created_at", sort_order: str = "desc"):
    """Load categories from database with sorting options
    
    Args:
        sort_by: Field to sort by (id, name, created_at)
        sort_order: Sort direction (asc, desc)
    """
    if database is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    # Validate sort parameters
    valid_sort_fields = ["id", "name", "created_at"]
    valid_sort_orders = ["asc", "desc"]
    
    if sort_by not in valid_sort_fields:
        sort_by = "created_at"
    if sort_order not in valid_sort_orders:
        sort_order = "desc"
    
    query = f"""
        SELECT id, name, type, description, keywords, success_count, 
               total_usage_count, terminology_source, terminology_sections, metadata,
               created_at, updated_at
        FROM political_categories
        WHERE is_active = true
        ORDER BY {sort_by} {sort_order.upper()}
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
                "metadata": json.loads(row["metadata"]) if isinstance(row["metadata"], str) else (row["metadata"] or {}),
                "created_at": row["created_at"].isoformat() if row["created_at"] else None,
                "updated_at": row["updated_at"].isoformat() if row["updated_at"] else None
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


async def reload_category_matcher():
    """Reload all active categories from database into the category matcher
    
    This ensures the live site sees updated categories immediately without server restart.
    """
    try:
        # Load all active categories from database
        data = await load_categories()
        categories = data["categories"]
        
        # Reload into category matcher
        category_matcher = get_category_matcher()
        category_matcher.load_categories(categories)
        
        logger.info(f"Reloaded {len(categories)} categories into category matcher")
        
    except Exception as e:
        logger.error(f"Failed to reload category matcher: {str(e)}")
        # Don't raise - this is a background operation


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
    "political_spectrum": "progressive" or "leans_left" or "bipartisan" or "leans_right" or "conservative",
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
        
        # Reload category matcher so live site sees the new category immediately
        await reload_category_matcher()
        
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
async def list_categories(
    sort_by: str = "created_at",
    sort_order: str = "desc",
    user: AuthenticatedUser = Depends(require_auth)
):
    """Get all categories for review with sorting options
    
    Args:
        sort_by: Field to sort by (id, name, created_at). Default: created_at
        sort_order: Sort direction (asc, desc). Default: desc
    """
    try:
        data = await load_categories(sort_by=sort_by, sort_order=sort_order)
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
        
        # Reload category matcher so live site sees the updated keywords immediately
        await reload_category_matcher()
        
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
        
        # Reload category matcher so live site sees the enhanced keywords immediately
        await reload_category_matcher()
        
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


@router.post("/categories/transform")
async def transform_categories(request: TransformRequest, admin: str = Depends(verify_admin)):
    """
    Transform categories via natural language - handles both split and merge operations.
    Takes one or more source categories and generates new categories based on instructions.
    """
    try:
        if not settings.openai_api_key:
            raise HTTPException(
                status_code=500, 
                detail="OpenAI API key not configured"
            )
        
        client = OpenAI(api_key=settings.openai_api_key)
        
        if database is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        # Get source categories from database
        source_categories = []
        for cat_id in request.source_category_ids:
            query = """
                SELECT id, name, type, description, keywords, metadata
                FROM political_categories 
                WHERE id = :category_id AND is_active = true
            """
            row = await database.fetch_one(query, {"category_id": cat_id})
            if not row:
                raise HTTPException(status_code=404, detail=f"Category {cat_id} not found")
            
            source_categories.append({
                "id": row["id"],
                "name": row["name"],
                "type": row["type"],
                "description": row["description"],
                "keywords": json.loads(row["keywords"]) if isinstance(row["keywords"], str) else (row["keywords"] or []),
                "metadata": json.loads(row["metadata"]) if isinstance(row["metadata"], str) else (row["metadata"] or {})
            })
        
        # Build context for AI
        source_context = "\n\n".join([
            f"SOURCE CATEGORY {cat['id']}: {cat['name']}\n"
            f"Type: {cat['type']}\n"
            f"Description: {cat['description']}\n"
            f"Keywords: {', '.join(cat['keywords'][:20])}...\n"
            f"Political Spectrum: {cat['metadata'].get('political_spectrum', 'unknown')}\n"
            f"Policy Areas: {', '.join(cat['metadata'].get('policy_areas', []))}"
            for cat in source_categories
        ])
        
        # Load existing categories for similarity checking
        all_categories = await load_categories()
        existing_summary = "\n".join([
            f"- ID {cat['id']}: {cat['name']}"
            for cat in all_categories["categories"][:20]
        ])
        
        prompt = f"""You are transforming political categories based on natural language instructions.

SOURCE CATEGORIES TO TRANSFORM:
{source_context}

USER INSTRUCTIONS: "{request.transform_instructions}"

EXISTING CATEGORIES (for similarity checking):
{existing_summary}

TASK:
Interpret the user's instructions and generate the appropriate new categories. This could be:
- SPLIT: Breaking one category into multiple more specific categories
- MERGE: Combining multiple categories into one or more new categories
- REFINE: Adjusting scope while creating new categories

For each new category you create:
1. Distribute keywords from source categories based on semantic relevance
2. Consider the source categories' metadata but make fresh determinations
3. Check for similarity with existing categories
4. Follow the user's specific instructions about keyword distribution

Return JSON with this structure:
{{
  "operation_type": "split" or "merge" or "refine",
  "new_categories": [
    {{
      "name": "Clear category name",
      "description": "2-3 sentences explaining scope and policy focus",
      "keywords": ["15-30 relevant keywords from source + new ones"],
      "type": "issue" or "policy",
      "political_spectrum": "progressive" or "leans_left" or "bipartisan" or "leans_right" or "conservative",
      "policy_areas": ["2-3 policy areas"],
      "keyword_source_notes": "Brief note on which source keywords went here"
    }}
  ],
  "similarity_warnings": [
    {{
      "category_name": "name of new category",
      "warning_type": "too_similar" or "too_broad" or "too_narrow",
      "message": "Description of the issue",
      "similar_to": ["existing category names"] or null
    }}
  ]
}}

GUIDELINES:
- Be specific and focused in category definitions
- Ensure keywords are well-distributed (no category should be empty)
- Include both formal and colloquial terms in keywords
- Make categories distinct enough to be useful for matching
- Consider both progressive and conservative terminology
"""
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3
        )
        
        result = json.loads(response.choices[0].message.content)
        
        logger.info(f"Transform operation '{result['operation_type']}' generated {len(result['new_categories'])} categories")
        
        # Format response for frontend
        return {
            "status": "success",
            "operation_type": result["operation_type"],
            "source_category_ids": request.source_category_ids,
            "new_categories": result["new_categories"],
            "similarity_warnings": result.get("similarity_warnings", [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error transforming categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to transform categories: {str(e)}")


@router.post("/categories/transform/approve")
async def approve_transform(request: dict, admin: str = Depends(verify_admin)):
    """
    Approve a transform operation - creates new categories and deactivates source categories.
    """
    try:
        if database is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        new_categories = request.get("new_categories", [])
        source_category_ids = request.get("source_category_ids", [])
        
        if not new_categories or not source_category_ids:
            raise HTTPException(status_code=400, detail="Missing required data")
        
        created_ids = []
        
        # Create new categories
        for cat_data in new_categories:
            # Find next available ID
            query = "SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM political_categories"
            result = await database.fetch_one(query)
            next_id = result["next_id"]
            
            new_category = {
                "id": next_id,
                "name": cat_data["name"],
                "type": cat_data["type"],
                "description": cat_data["description"],
                "keywords": cat_data["keywords"],
                "success_count": 0,
                "total_usage_count": 0,
                "terminology_source": "ai_transform",
                "terminology_sections": [],
                "metadata": {
                    "priority_level": "medium",
                    "political_spectrum": cat_data["political_spectrum"],
                    "policy_areas": cat_data["policy_areas"],
                    "created_from_transform": True,
                    "source_category_ids": source_category_ids
                }
            }
            
            await save_category(new_category, created_by="ai_admin")
            created_ids.append(next_id)
            logger.info(f"Created transformed category: ID {next_id} - {cat_data['name']}")
        
        # Deactivate source categories
        for cat_id in source_category_ids:
            deactivate_query = """
                UPDATE political_categories 
                SET is_active = false, 
                    updated_at = NOW(), 
                    updated_by = 'ai_admin'
                WHERE id = :category_id
            """
            await database.execute(deactivate_query, {"category_id": cat_id})
            logger.info(f"Deactivated source category: ID {cat_id}")
        
        # Reload category matcher so live site sees the transformed categories immediately
        await reload_category_matcher()
        
        return {
            "status": "success",
            "created_category_ids": created_ids,
            "deactivated_category_ids": source_category_ids,
            "message": f"Created {len(created_ids)} new categories and deactivated {len(source_category_ids)} source categories"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving transform: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to approve transform: {str(e)}")


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
        
        # Reload category matcher so live site no longer shows the deleted category
        await reload_category_matcher()
        
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
