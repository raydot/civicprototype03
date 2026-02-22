"""
Health Resource Handlers
Provides system health and status information
"""
import json
import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)


class HealthResources:
    """Handler for health-related resources"""
    
    async def handle(self, uri: str) -> str:
        """Handle health resource requests"""
        
        if uri == "voterprime://health/status":
            return await self._get_system_status()
        else:
            return json.dumps({"error": f"Unknown health resource: {uri}"})
    
    async def _get_system_status(self) -> str:
        """Get overall system health status"""
        try:
            status = {
                "database": await self._check_database(),
                "categories": await self._check_categories(),
                "overall": "healthy"
            }
            
            # Determine overall status
            if status["database"]["status"] == "error":
                status["overall"] = "degraded"
            
            return json.dumps(status, indent=2)
        
        except Exception as e:
            logger.error(f"Error checking system status: {str(e)}")
            return json.dumps({"error": str(e)})
    
    async def _check_database(self) -> Dict[str, Any]:
        """Check database connectivity"""
        try:
            from ...app.db.database import database
            
            if database is None:
                return {
                    "status": "unavailable",
                    "message": "DATABASE_URL not configured"
                }
            
            # Try a simple query
            query = "SELECT 1 as test"
            result = await database.fetch_one(query)
            
            if result and result["test"] == 1:
                return {
                    "status": "healthy",
                    "message": "Database connection successful"
                }
            else:
                return {
                    "status": "error",
                    "message": "Database query failed"
                }
        
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def _check_categories(self) -> Dict[str, Any]:
        """Check category system status"""
        try:
            from ...app.db.database import database
            
            if database is None:
                return {
                    "status": "unavailable",
                    "message": "Database not available"
                }
            
            query = """
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active
                FROM political_categories
            """
            
            result = await database.fetch_one(query)
            
            return {
                "status": "healthy",
                "total_categories": result["total"],
                "active_categories": result["active"],
                "message": f"{result['active']} active categories loaded"
            }
        
        except Exception as e:
            logger.error(f"Category health check failed: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def check_database(self) -> Dict[str, Any]:
        """Tool: Run database connectivity tests"""
        return await self._check_database()
