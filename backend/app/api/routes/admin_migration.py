"""
Admin endpoint to manually run database migrations
ONE-TIME USE ONLY - for emergency migration execution
"""
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import text
import os

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
