"""
Category Resource Handlers
Provides access to political category data
"""
import json
import logging
from typing import Any, Dict, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class CategoryResources:
    """Handler for category-related resources"""
    
    def __init__(self):
        self._cache: Dict[str, Any] = {}
        self._cache_time: Dict[str, datetime] = {}
    
    async def handle(self, uri: str) -> str:
        """Handle category resource requests"""
        
        if uri == "voterprime://categories/all":
            return await self._get_all_categories()
        elif uri == "voterprime://categories/performance":
            return await self._get_category_performance()
        elif uri == "voterprime://categories/underperforming":
            return await self._get_underperforming_categories()
        elif uri.startswith("voterprime://categories/"):
            # Individual category by ID
            category_id = uri.split("/")[-1]
            return await self._get_category_by_id(category_id)
        else:
            return json.dumps({"error": f"Unknown category resource: {uri}"})
    
    async def _get_all_categories(self) -> str:
        """Get all political categories"""
        try:
            from ...app.db.database import database
            
            if database is None:
                return json.dumps({
                    "error": "Database not available",
                    "categories": []
                })
            
            query = """
                SELECT id, name, type, description, keywords,
                       success_count, total_usage_count, is_active
                FROM political_categories
                WHERE is_active = true
                ORDER BY id
            """
            
            rows = await database.fetch_all(query)
            
            categories = [
                {
                    "id": row["id"],
                    "name": row["name"],
                    "type": row["type"],
                    "description": row["description"],
                    "keywords": json.loads(row["keywords"]) if isinstance(row["keywords"], str) else row["keywords"],
                    "success_count": row["success_count"] or 0,
                    "total_usage_count": row["total_usage_count"] or 0,
                    "success_rate": (row["success_count"] / row["total_usage_count"]) if row["total_usage_count"] > 0 else 0
                }
                for row in rows
            ]
            
            return json.dumps({
                "total_categories": len(categories),
                "categories": categories
            }, indent=2)
        
        except Exception as e:
            logger.error(f"Error fetching categories: {str(e)}")
            return json.dumps({"error": str(e)})
    
    async def _get_category_performance(self) -> str:
        """Get category performance metrics"""
        try:
            from ...app.db.database import database
            
            if database is None:
                return json.dumps({"error": "Database not available"})
            
            query = """
                SELECT id, name, type,
                       success_count, total_usage_count,
                       CASE WHEN total_usage_count > 0 
                            THEN success_count::float / total_usage_count 
                            ELSE 0 END as success_rate
                FROM political_categories
                WHERE is_active = true
                ORDER BY success_rate DESC
            """
            
            rows = await database.fetch_all(query)
            
            performance = [
                {
                    "category_id": row["id"],
                    "category_name": row["name"],
                    "type": row["type"],
                    "success_rate": round(row["success_rate"] * 100, 1),
                    "success_count": row["success_count"] or 0,
                    "total_usage": row["total_usage_count"] or 0
                }
                for row in rows
            ]
            
            # Calculate averages
            avg_success_rate = sum(p["success_rate"] for p in performance) / len(performance) if performance else 0
            
            return json.dumps({
                "average_success_rate": round(avg_success_rate, 1),
                "total_categories": len(performance),
                "performance": performance
            }, indent=2)
        
        except Exception as e:
            logger.error(f"Error fetching performance: {str(e)}")
            return json.dumps({"error": str(e)})
    
    async def _get_underperforming_categories(self) -> str:
        """Get categories with <30% success rate"""
        try:
            from ...app.db.database import database
            
            if database is None:
                return json.dumps({"error": "Database not available"})
            
            query = """
                SELECT id, name, type,
                       success_count, total_usage_count,
                       CASE WHEN total_usage_count > 0 
                            THEN success_count::float / total_usage_count 
                            ELSE 0 END as success_rate
                FROM political_categories
                WHERE is_active = true
                  AND total_usage_count > 5
                  AND (success_count::float / NULLIF(total_usage_count, 0)) < 0.3
                ORDER BY success_rate ASC
            """
            
            rows = await database.fetch_all(query)
            
            underperforming = [
                {
                    "category_id": row["id"],
                    "category_name": row["name"],
                    "type": row["type"],
                    "success_rate": round(row["success_rate"] * 100, 1),
                    "success_count": row["success_count"] or 0,
                    "total_usage": row["total_usage_count"] or 0,
                    "needs_attention": True
                }
                for row in rows
            ]
            
            return json.dumps({
                "underperforming_count": len(underperforming),
                "threshold": "30%",
                "categories": underperforming
            }, indent=2)
        
        except Exception as e:
            logger.error(f"Error fetching underperforming categories: {str(e)}")
            return json.dumps({"error": str(e)})
    
    async def _get_category_by_id(self, category_id: str) -> str:
        """Get individual category details"""
        try:
            from ...app.db.database import database
            
            if database is None:
                return json.dumps({"error": "Database not available"})
            
            query = """
                SELECT id, name, type, description, keywords,
                       success_count, total_usage_count, is_active,
                       created_at, updated_at
                FROM political_categories
                WHERE id = :category_id
            """
            
            row = await database.fetch_one(query, {"category_id": int(category_id)})
            
            if not row:
                return json.dumps({"error": f"Category {category_id} not found"})
            
            category = {
                "id": row["id"],
                "name": row["name"],
                "type": row["type"],
                "description": row["description"],
                "keywords": json.loads(row["keywords"]) if isinstance(row["keywords"], str) else row["keywords"],
                "success_count": row["success_count"] or 0,
                "total_usage_count": row["total_usage_count"] or 0,
                "success_rate": (row["success_count"] / row["total_usage_count"]) if row["total_usage_count"] > 0 else 0,
                "is_active": row["is_active"],
                "created_at": str(row["created_at"]) if row.get("created_at") else None,
                "updated_at": str(row["updated_at"]) if row.get("updated_at") else None
            }
            
            return json.dumps(category, indent=2)
        
        except Exception as e:
            logger.error(f"Error fetching category {category_id}: {str(e)}")
            return json.dumps({"error": str(e)})
    
    async def query_categories(
        self,
        keyword: Optional[str] = None,
        type: Optional[str] = None,
        min_success_rate: Optional[float] = None
    ) -> Dict[str, Any]:
        """Query categories with filters"""
        try:
            from ...app.db.database import database
            
            if database is None:
                return {"error": "Database not available"}
            
            # Build dynamic query
            conditions = ["is_active = true"]
            params = {}
            
            if type:
                conditions.append("type = :type")
                params["type"] = type
            
            if min_success_rate is not None:
                conditions.append("(success_count::float / NULLIF(total_usage_count, 0)) >= :min_rate")
                params["min_rate"] = min_success_rate
            
            where_clause = " AND ".join(conditions)
            
            query = f"""
                SELECT id, name, type, keywords,
                       success_count, total_usage_count,
                       CASE WHEN total_usage_count > 0 
                            THEN success_count::float / total_usage_count 
                            ELSE 0 END as success_rate
                FROM political_categories
                WHERE {where_clause}
                ORDER BY success_rate DESC
            """
            
            rows = await database.fetch_all(query, params)
            
            results = [
                {
                    "id": row["id"],
                    "name": row["name"],
                    "type": row["type"],
                    "success_rate": round(row["success_rate"] * 100, 1),
                    "total_usage": row["total_usage_count"] or 0
                }
                for row in rows
            ]
            
            # Filter by keyword if provided
            if keyword:
                keyword_lower = keyword.lower()
                results = [
                    r for r in results
                    if keyword_lower in r["name"].lower()
                ]
            
            return {
                "filters": {
                    "keyword": keyword,
                    "type": type,
                    "min_success_rate": min_success_rate
                },
                "result_count": len(results),
                "results": results
            }
        
        except Exception as e:
            logger.error(f"Error querying categories: {str(e)}")
            return {"error": str(e)}
