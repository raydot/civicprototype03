"""
Cost Resource Handlers
Provides access to OpenAI cost tracking data
"""
import json
import logging
from typing import Any, Dict, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class CostResources:
    """Handler for cost-related resources"""
    
    async def handle(self, uri: str) -> str:
        """Handle cost resource requests"""
        
        if uri == "voterprime://costs/today":
            return await self._get_today_costs()
        elif uri == "voterprime://costs/week":
            return await self._get_week_costs()
        elif uri == "voterprime://costs/by-model":
            return await self._get_costs_by_model()
        else:
            return json.dumps({"error": f"Unknown cost resource: {uri}"})
    
    async def _get_today_costs(self) -> str:
        """Get today's OpenAI costs"""
        try:
            import sys
            from pathlib import Path
            sys.path.insert(0, str(Path(__file__).parent.parent))
            from db_connection import ensure_connected, get_database
            
            if not await ensure_connected():
                return json.dumps({"error": "Database not available"})
            
            database = get_database()
            query = """
                SELECT 
                    endpoint,
                    model,
                    SUM(estimated_cost_usd) as total_cost,
                    SUM(total_tokens) as total_tokens,
                    COUNT(*) as request_count
                FROM openai_usage
                WHERE DATE(timestamp) = CURRENT_DATE
                GROUP BY endpoint, model
                ORDER BY total_cost DESC
            """
            
            rows = await database.fetch_all(query)
            
            by_endpoint = {}
            total_cost = 0
            total_tokens = 0
            total_requests = 0
            
            for row in rows:
                endpoint = row["endpoint"] or "unknown"
                if endpoint not in by_endpoint:
                    by_endpoint[endpoint] = {
                        "cost": 0,
                        "tokens": 0,
                        "requests": 0,
                        "models": {}
                    }
                
                by_endpoint[endpoint]["cost"] += float(row["total_cost"])
                by_endpoint[endpoint]["tokens"] += row["total_tokens"]
                by_endpoint[endpoint]["requests"] += row["request_count"]
                by_endpoint[endpoint]["models"][row["model"]] = {
                    "cost": float(row["total_cost"]),
                    "tokens": row["total_tokens"],
                    "requests": row["request_count"]
                }
                
                total_cost += float(row["total_cost"])
                total_tokens += row["total_tokens"]
                total_requests += row["request_count"]
            
            return json.dumps({
                "date": str(datetime.now().date()),
                "total_cost_usd": round(total_cost, 4),
                "total_tokens": total_tokens,
                "total_requests": total_requests,
                "by_endpoint": by_endpoint,
                "alert_level": "critical" if total_cost > 50 else "warning" if total_cost > 25 else "normal"
            }, indent=2)
        
        except Exception as e:
            logger.error(f"Error fetching today's costs: {str(e)}")
            return json.dumps({"error": str(e)})
    
    async def _get_week_costs(self) -> str:
        """Get 7-day cost summary"""
        try:
            import sys
            from pathlib import Path
            sys.path.insert(0, str(Path(__file__).parent.parent))
            from db_connection import ensure_connected, get_database
            
            if not await ensure_connected():
                return json.dumps({"error": "Database not available"})
            
            database = get_database()
            query = """
                SELECT 
                    DATE(timestamp) as date,
                    SUM(estimated_cost_usd) as daily_cost,
                    SUM(total_tokens) as daily_tokens,
                    COUNT(*) as daily_requests
                FROM openai_usage
                WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY DATE(timestamp)
                ORDER BY date DESC
            """
            
            rows = await database.fetch_all(query)
            
            daily_breakdown = [
                {
                    "date": str(row["date"]),
                    "cost_usd": round(float(row["daily_cost"]), 4),
                    "tokens": row["daily_tokens"],
                    "requests": row["daily_requests"]
                }
                for row in rows
            ]
            
            total_cost = sum(d["cost_usd"] for d in daily_breakdown)
            total_tokens = sum(d["tokens"] for d in daily_breakdown)
            avg_daily_cost = total_cost / len(daily_breakdown) if daily_breakdown else 0
            
            return json.dumps({
                "period": "7 days",
                "start_date": str((datetime.now() - timedelta(days=7)).date()),
                "end_date": str(datetime.now().date()),
                "total_cost_usd": round(total_cost, 4),
                "total_tokens": total_tokens,
                "average_daily_cost_usd": round(avg_daily_cost, 4),
                "daily_breakdown": daily_breakdown
            }, indent=2)
        
        except Exception as e:
            logger.error(f"Error fetching week costs: {str(e)}")
            return json.dumps({"error": str(e)})
    
    async def _get_costs_by_model(self) -> str:
        """Get cost breakdown by model"""
        try:
            import sys
            from pathlib import Path
            sys.path.insert(0, str(Path(__file__).parent.parent))
            from db_connection import ensure_connected, get_database
            
            if not await ensure_connected():
                return json.dumps({"error": "Database not available"})
            
            database = get_database()
            query = """
                SELECT 
                    model,
                    operation,
                    SUM(estimated_cost_usd) as total_cost,
                    SUM(total_tokens) as total_tokens,
                    COUNT(*) as request_count
                FROM openai_usage
                WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY model, operation
                ORDER BY total_cost DESC
            """
            
            rows = await database.fetch_all(query)
            
            by_model = {}
            for row in rows:
                model = row["model"]
                if model not in by_model:
                    by_model[model] = {
                        "total_cost": 0,
                        "total_tokens": 0,
                        "total_requests": 0,
                        "operations": {}
                    }
                
                by_model[model]["total_cost"] += float(row["total_cost"])
                by_model[model]["total_tokens"] += row["total_tokens"]
                by_model[model]["total_requests"] += row["request_count"]
                by_model[model]["operations"][row["operation"]] = {
                    "cost": float(row["total_cost"]),
                    "tokens": row["total_tokens"],
                    "requests": row["request_count"]
                }
            
            return json.dumps({
                "period": "7 days",
                "by_model": by_model
            }, indent=2)
        
        except Exception as e:
            logger.error(f"Error fetching costs by model: {str(e)}")
            return json.dumps({"error": str(e)})
    
    async def query_costs(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        group_by: str = "day"
    ) -> Dict[str, Any]:
        """Query costs with flexible filters"""
        try:
            import sys
            from pathlib import Path
            sys.path.insert(0, str(Path(__file__).parent.parent))
            from db_connection import ensure_connected, get_database
            
            if not await ensure_connected():
                return {"error": "Database not available"}
            
            database = get_database()
            
            # Default to last 7 days if no dates provided
            if not start_date:
                start_date = str((datetime.now() - timedelta(days=7)).date())
            if not end_date:
                end_date = str(datetime.now().date())
            
            # Build query based on group_by
            if group_by == "day":
                group_field = "DATE(timestamp)"
            elif group_by == "model":
                group_field = "model"
            elif group_by == "endpoint":
                group_field = "endpoint"
            else:
                group_field = "DATE(timestamp)"
            
            query = f"""
                SELECT 
                    {group_field} as group_key,
                    SUM(estimated_cost_usd) as total_cost,
                    SUM(total_tokens) as total_tokens,
                    COUNT(*) as request_count
                FROM openai_usage
                WHERE DATE(timestamp) BETWEEN :start_date AND :end_date
                GROUP BY {group_field}
                ORDER BY total_cost DESC
            """
            
            rows = await database.fetch_all(query, {
                "start_date": start_date,
                "end_date": end_date
            })
            
            results = [
                {
                    "group": str(row["group_key"]),
                    "cost_usd": round(float(row["total_cost"]), 4),
                    "tokens": row["total_tokens"],
                    "requests": row["request_count"]
                }
                for row in rows
            ]
            
            total_cost = sum(r["cost_usd"] for r in results)
            
            return {
                "filters": {
                    "start_date": start_date,
                    "end_date": end_date,
                    "group_by": group_by
                },
                "total_cost_usd": round(total_cost, 4),
                "result_count": len(results),
                "results": results
            }
        
        except Exception as e:
            logger.error(f"Error querying costs: {str(e)}")
            return {"error": str(e)}
