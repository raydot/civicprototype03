"""
Admin endpoint to manually run database migrations
ONE-TIME USE ONLY - for emergency migration execution
"""
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import text
import os
import json
from pathlib import Path

from ...db.database import database
from ...utils.logging import structured_logger

router = APIRouter(prefix="/admin/migration", tags=["Admin Migration"])
logger = structured_logger


def verify_admin_token(token: str = Query(..., description="Admin authentication token")):
    """Simple admin authentication"""
    expected_token = os.getenv("ADMIN_TOKEN", "voterPrime_admin_2024")
    if token != expected_token:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    return True


@router.post("/run-cost-tracking")
async def run_cost_tracking_migration(admin_auth: bool = Query(default=verify_admin_token)):
    """
    ONE-TIME migration to create openai_usage table
    
    Example:
    POST /admin/migration/run-cost-tracking?token=voterPrime_admin_2024
    """
    if database is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    statements = [
        # Create table
        """
        CREATE TABLE IF NOT EXISTS openai_usage (
            id SERIAL PRIMARY KEY,
            timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
            model VARCHAR(100) NOT NULL,
            operation VARCHAR(50) NOT NULL,
            endpoint VARCHAR(200),
            prompt_tokens INTEGER,
            completion_tokens INTEGER,
            total_tokens INTEGER NOT NULL,
            estimated_cost_usd NUMERIC(10, 6) NOT NULL,
            user_session VARCHAR(100),
            request_id VARCHAR(100),
            metadata JSONB
        )
        """,
        # Create indexes
        "CREATE INDEX IF NOT EXISTS idx_openai_usage_timestamp ON openai_usage(timestamp)",
        "CREATE INDEX IF NOT EXISTS idx_openai_usage_model ON openai_usage(model)",
        "CREATE INDEX IF NOT EXISTS idx_openai_usage_operation ON openai_usage(operation)",
        "CREATE INDEX IF NOT EXISTS idx_openai_usage_endpoint ON openai_usage(endpoint)",
        # Create view
        """
        CREATE OR REPLACE VIEW openai_cost_summary AS
        SELECT 
            DATE(timestamp) as date,
            model,
            operation,
            COUNT(*) as call_count,
            SUM(total_tokens) as total_tokens,
            SUM(estimated_cost_usd) as total_cost_usd
        FROM openai_usage
        GROUP BY DATE(timestamp), model, operation
        ORDER BY date DESC, total_cost_usd DESC
        """
    ]
    
    try:
        for stmt in statements:
            await database.execute(text(stmt))
        
        logger.info("✅ Successfully created openai_usage table via admin endpoint")
        
        return {
            "status": "success",
            "message": "Cost tracking table created successfully",
            "tables_created": ["openai_usage"],
            "views_created": ["openai_cost_summary"],
            "indexes_created": 4
        }
        
    except Exception as e:
        logger.error(f"Failed to create cost tracking table: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Migration failed: {str(e)}")


@router.post("/load-categories")
async def load_categories_from_json(admin_auth: bool = Query(default=verify_admin_token)):
    """
    Load all categories from political_categories.json into the database
    
    Example:
    POST /admin/migration/load-categories?token=voterPrime_admin_2024
    """
    if database is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        # Load JSON file
        categories_file = Path(__file__).parent.parent.parent / "data" / "political_categories.json"
        
        if not categories_file.exists():
            raise HTTPException(status_code=404, detail=f"Categories file not found: {categories_file}")
        
        with open(categories_file) as f:
            data = json.load(f)
        
        categories = data.get("categories", [])
        logger.info(f"Found {len(categories)} categories in JSON file")
        
        # Insert/update categories
        insert_query = """
            INSERT INTO political_categories 
            (id, name, type, description, keywords, success_count, total_usage_count,
             terminology_source, terminology_sections, metadata, created_by, updated_by)
            VALUES (:id, :name, :type, :description, :keywords, :success_count, :total_usage_count,
                    :terminology_source, :terminology_sections, :metadata, :created_by, :updated_by)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                type = EXCLUDED.type,
                description = EXCLUDED.description,
                keywords = EXCLUDED.keywords,
                terminology_source = EXCLUDED.terminology_source,
                terminology_sections = EXCLUDED.terminology_sections,
                metadata = EXCLUDED.metadata,
                updated_at = NOW(),
                updated_by = EXCLUDED.updated_by
        """
        
        migrated = 0
        errors = []
        
        for category in categories:
            try:
                await database.execute(insert_query, {
                    "id": category["id"],
                    "name": category["name"],
                    "type": category["type"],
                    "description": category.get("description", ""),
                    "keywords": json.dumps(category.get("keywords", [])),
                    "success_count": category.get("success_count", 0),
                    "total_usage_count": category.get("total_usage_count", 0),
                    "terminology_source": category.get("terminology_source", "manual"),
                    "terminology_sections": json.dumps(category.get("terminology_sections", [])),
                    "metadata": json.dumps(category.get("metadata", {})),
                    "created_by": "json_migration",
                    "updated_by": "json_migration"
                })
                migrated += 1
            except Exception as e:
                errors.append(f"{category['id']} - {category['name']}: {str(e)}")
        
        logger.info(f"✅ Migration complete: {migrated}/{len(categories)} categories migrated")
        
        return {
            "status": "success",
            "message": f"Loaded {migrated} categories from JSON",
            "total_in_file": len(categories),
            "migrated": migrated,
            "errors": errors if errors else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to load categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Migration failed: {str(e)}")
