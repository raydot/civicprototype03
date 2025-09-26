"""
Health check endpoints for Railway deployment
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
from ...config import settings
from ...utils.logging import structured_logger

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """
    Basic health check endpoint
    Railway uses this to determine if the service is running
    """
    structured_logger.info(
        "health_check",
        endpoint="/health",
        status="healthy"
    )
    
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.version,
        "environment": settings.environment,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/ready")
async def readiness_check():
    """
    Readiness check endpoint
    Verifies that the service is ready to handle requests
    """
    try:
        # TODO: Add database connectivity check when database is set up
        # TODO: Add model loading check when AI models are implemented
        
        structured_logger.info(
            "readiness_check",
            endpoint="/ready",
            status="ready"
        )
        
        return {
            "status": "ready",
            "service": settings.app_name,
            "version": settings.version,
            "environment": settings.environment,
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {
                "database": "pending",  # Will be updated when DB is connected
                "ai_models": "pending"  # Will be updated when models are loaded
            }
        }
        
    except Exception as e:
        structured_logger.error(
            "readiness_check_failed",
            endpoint="/ready",
            error=str(e)
        )
        
        raise HTTPException(
            status_code=503,
            detail={
                "status": "not_ready",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )
