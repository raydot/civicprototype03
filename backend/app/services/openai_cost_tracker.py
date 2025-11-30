"""
OpenAI Cost Tracking Service
Tracks API usage and estimates costs for all OpenAI API calls
"""
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from decimal import Decimal
import logging

from ..db.database import database

logger = logging.getLogger(__name__)


# OpenAI Pricing (as of Nov 2025)
# https://openai.com/pricing
PRICING = {
    "text-embedding-3-small": {
        "input": 0.00002,  # $0.02 per 1M tokens
    },
    "text-embedding-3-large": {
        "input": 0.00013,  # $0.13 per 1M tokens
    },
    "gpt-3.5-turbo": {
        "input": 0.0005,   # $0.50 per 1M tokens
        "output": 0.0015,  # $1.50 per 1M tokens
    },
    "gpt-4o": {
        "input": 0.0025,   # $2.50 per 1M tokens
        "output": 0.01,    # $10.00 per 1M tokens
    },
    "gpt-4o-mini": {
        "input": 0.00015,  # $0.15 per 1M tokens
        "output": 0.0006,  # $0.60 per 1M tokens
    }
}


class OpenAICostTracker:
    """
    Tracks OpenAI API usage and costs
    """
    
    @staticmethod
    async def track_usage(
        model: str,
        operation: str,  # 'embedding', 'chat', 'completion'
        total_tokens: int,
        prompt_tokens: Optional[int] = None,
        completion_tokens: Optional[int] = None,
        endpoint: Optional[str] = None,
        user_session: Optional[str] = None,
        request_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Track an OpenAI API call and estimate cost
        
        Args:
            model: OpenAI model name
            operation: Type of operation (embedding, chat, completion)
            total_tokens: Total tokens used
            prompt_tokens: Input tokens (for chat/completion)
            completion_tokens: Output tokens (for chat/completion)
            endpoint: API endpoint that triggered this call
            user_session: User session ID
            request_id: OpenAI request ID
            metadata: Additional metadata
            
        Returns:
            Dictionary with usage details and cost
        """
        if database is None:
            logger.warning("Database not available - skipping cost tracking")
            return {"status": "skipped", "reason": "database_unavailable"}
        
        try:
            # Calculate cost
            cost = OpenAICostTracker._calculate_cost(
                model, operation, total_tokens, prompt_tokens, completion_tokens
            )
            
            # Store in database
            query = """
                INSERT INTO openai_usage 
                (model, operation, endpoint, prompt_tokens, completion_tokens, 
                 total_tokens, estimated_cost_usd, user_session, request_id, metadata)
                VALUES 
                (:model, :operation, :endpoint, :prompt_tokens, :completion_tokens,
                 :total_tokens, :cost, :user_session, :request_id, :metadata)
                RETURNING id, timestamp
            """
            
            result = await database.fetch_one(query, {
                "model": model,
                "operation": operation,
                "endpoint": endpoint,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": total_tokens,
                "cost": cost,
                "user_session": user_session,
                "request_id": request_id,
                "metadata": metadata
            })
            
            logger.info(
                f"Tracked OpenAI usage: {model} ({operation}) - "
                f"{total_tokens} tokens, ${cost:.6f}"
            )
            
            return {
                "id": result["id"],
                "timestamp": result["timestamp"].isoformat(),
                "model": model,
                "operation": operation,
                "total_tokens": total_tokens,
                "estimated_cost_usd": float(cost),
                "status": "tracked"
            }
            
        except Exception as e:
            logger.error(f"Failed to track OpenAI usage: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    @staticmethod
    def _calculate_cost(
        model: str,
        operation: str,
        total_tokens: int,
        prompt_tokens: Optional[int] = None,
        completion_tokens: Optional[int] = None
    ) -> Decimal:
        """
        Calculate estimated cost for an OpenAI API call
        
        Returns:
            Cost in USD as Decimal
        """
        if model not in PRICING:
            logger.warning(f"Unknown model '{model}', using default pricing")
            # Default to GPT-3.5 pricing as fallback
            model = "gpt-3.5-turbo"
        
        pricing = PRICING[model]
        
        if operation == "embedding":
            # Embeddings only have input tokens
            cost = Decimal(str(total_tokens)) * Decimal(str(pricing["input"]))
        else:
            # Chat/completion has input and output tokens
            if prompt_tokens is None or completion_tokens is None:
                # Fallback: assume 50/50 split if not provided
                prompt_tokens = total_tokens // 2
                completion_tokens = total_tokens - prompt_tokens
            
            input_cost = Decimal(str(prompt_tokens)) * Decimal(str(pricing["input"]))
            output_cost = Decimal(str(completion_tokens)) * Decimal(str(pricing["output"]))
            cost = input_cost + output_cost
        
        return cost
    
    @staticmethod
    async def get_usage_summary(
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        group_by: str = "day"  # 'day', 'model', 'operation', 'endpoint'
    ) -> Dict[str, Any]:
        """
        Get usage summary for a date range
        
        Args:
            start_date: Start date (default: 30 days ago)
            end_date: End date (default: now)
            group_by: How to group results
            
        Returns:
            Usage summary with costs
        """
        if database is None:
            return {"error": "Database not available"}
        
        if start_date is None:
            start_date = datetime.utcnow() - timedelta(days=30)
        if end_date is None:
            end_date = datetime.utcnow()
        
        try:
            # Get summary data
            if group_by == "day":
                query = """
                    SELECT 
                        DATE(timestamp) as date,
                        COUNT(*) as call_count,
                        SUM(total_tokens) as total_tokens,
                        SUM(estimated_cost_usd) as total_cost
                    FROM openai_usage
                    WHERE timestamp >= :start_date AND timestamp <= :end_date
                    GROUP BY DATE(timestamp)
                    ORDER BY date DESC
                """
            elif group_by == "model":
                query = """
                    SELECT 
                        model,
                        COUNT(*) as call_count,
                        SUM(total_tokens) as total_tokens,
                        SUM(estimated_cost_usd) as total_cost
                    FROM openai_usage
                    WHERE timestamp >= :start_date AND timestamp <= :end_date
                    GROUP BY model
                    ORDER BY total_cost DESC
                """
            elif group_by == "operation":
                query = """
                    SELECT 
                        operation,
                        COUNT(*) as call_count,
                        SUM(total_tokens) as total_tokens,
                        SUM(estimated_cost_usd) as total_cost
                    FROM openai_usage
                    WHERE timestamp >= :start_date AND timestamp <= :end_date
                    GROUP BY operation
                    ORDER BY total_cost DESC
                """
            elif group_by == "endpoint":
                query = """
                    SELECT 
                        endpoint,
                        COUNT(*) as call_count,
                        SUM(total_tokens) as total_tokens,
                        SUM(estimated_cost_usd) as total_cost
                    FROM openai_usage
                    WHERE timestamp >= :start_date AND timestamp <= :end_date
                    GROUP BY endpoint
                    ORDER BY total_cost DESC
                """
            else:
                return {"error": f"Invalid group_by: {group_by}"}
            
            rows = await database.fetch_all(query, {
                "start_date": start_date,
                "end_date": end_date
            })
            
            # Get totals
            total_query = """
                SELECT 
                    COUNT(*) as total_calls,
                    SUM(total_tokens) as total_tokens,
                    SUM(estimated_cost_usd) as total_cost
                FROM openai_usage
                WHERE timestamp >= :start_date AND timestamp <= :end_date
            """
            
            totals = await database.fetch_one(total_query, {
                "start_date": start_date,
                "end_date": end_date
            })
            
            return {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "group_by": group_by,
                "summary": [
                    {
                        **dict(row),
                        "total_cost": float(row["total_cost"]) if row["total_cost"] else 0.0
                    }
                    for row in rows
                ],
                "totals": {
                    "total_calls": totals["total_calls"],
                    "total_tokens": totals["total_tokens"],
                    "total_cost": float(totals["total_cost"]) if totals["total_cost"] else 0.0
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get usage summary: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    async def get_cost_alerts(threshold_usd: float = 100.0) -> Dict[str, Any]:
        """
        Check if costs exceed thresholds and generate alerts
        
        Args:
            threshold_usd: Daily cost threshold in USD
            
        Returns:
            Alert information
        """
        if database is None:
            return {"error": "Database not available"}
        
        try:
            # Get today's costs
            today_query = """
                SELECT SUM(estimated_cost_usd) as today_cost
                FROM openai_usage
                WHERE DATE(timestamp) = CURRENT_DATE
            """
            
            today_result = await database.fetch_one(today_query)
            today_cost = float(today_result["today_cost"]) if today_result["today_cost"] else 0.0
            
            # Get this month's costs
            month_query = """
                SELECT SUM(estimated_cost_usd) as month_cost
                FROM openai_usage
                WHERE DATE_TRUNC('month', timestamp) = DATE_TRUNC('month', CURRENT_DATE)
            """
            
            month_result = await database.fetch_one(month_query)
            month_cost = float(month_result["month_cost"]) if month_result["month_cost"] else 0.0
            
            # Generate alerts
            alerts = []
            
            if today_cost > threshold_usd:
                alerts.append({
                    "level": "warning",
                    "message": f"Today's costs (${today_cost:.2f}) exceed threshold (${threshold_usd:.2f})",
                    "cost": today_cost,
                    "threshold": threshold_usd
                })
            
            # Projected monthly cost
            days_in_month = 30
            current_day = datetime.utcnow().day
            projected_monthly = (month_cost / current_day) * days_in_month if current_day > 0 else 0
            
            if projected_monthly > threshold_usd * 30:
                alerts.append({
                    "level": "info",
                    "message": f"Projected monthly cost: ${projected_monthly:.2f}",
                    "cost": projected_monthly,
                    "threshold": threshold_usd * 30
                })
            
            return {
                "today_cost": today_cost,
                "month_cost": month_cost,
                "projected_monthly_cost": projected_monthly,
                "threshold_daily": threshold_usd,
                "alerts": alerts
            }
            
        except Exception as e:
            logger.error(f"Failed to get cost alerts: {str(e)}")
            return {"error": str(e)}


# Global instance
_cost_tracker_instance: Optional[OpenAICostTracker] = None


def get_cost_tracker() -> OpenAICostTracker:
    """Get or create the global cost tracker instance"""
    global _cost_tracker_instance
    
    if _cost_tracker_instance is None:
        _cost_tracker_instance = OpenAICostTracker()
    
    return _cost_tracker_instance
