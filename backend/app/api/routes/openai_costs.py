"""
OpenAI Cost Tracking API Routes
Admin endpoints for monitoring OpenAI API usage and costs
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from ...services.openai_cost_tracker import get_cost_tracker
from ...utils.logging import structured_logger

router = APIRouter(prefix="/admin/openai-costs", tags=["OpenAI Costs"])
logger = structured_logger


# Simple admin token check (reuse from admin.py)
def verify_admin_token(token: str = Query(..., description="Admin authentication token")):
    """Simple admin authentication"""
    import os
    expected_token = os.getenv("ADMIN_TOKEN", "voterPrime_admin_2024")
    if token != expected_token:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    return True


class CostSummaryResponse(BaseModel):
    """Cost summary response"""
    start_date: str
    end_date: str
    group_by: str
    summary: list
    totals: dict


class CostAlertsResponse(BaseModel):
    """Cost alerts response"""
    today_cost: float
    month_cost: float
    projected_monthly_cost: float
    threshold_daily: float
    alerts: list


@router.get("/summary", response_model=CostSummaryResponse)
async def get_cost_summary(
    admin_auth: bool = Depends(verify_admin_token),
    days: int = Query(30, description="Number of days to look back"),
    group_by: str = Query("day", description="Group by: day, model, operation, endpoint")
):
    """
    Get OpenAI usage and cost summary
    
    Examples:
    - /admin/openai-costs/summary?token=xxx&days=7&group_by=day
    - /admin/openai-costs/summary?token=xxx&days=30&group_by=model
    """
    try:
        cost_tracker = get_cost_tracker()
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        summary = await cost_tracker.get_usage_summary(
            start_date=start_date,
            end_date=end_date,
            group_by=group_by
        )
        
        if "error" in summary:
            raise HTTPException(status_code=500, detail=summary["error"])
        
        logger.info(f"Cost summary requested: {days} days, grouped by {group_by}")
        
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get cost summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get cost summary: {str(e)}")


@router.get("/alerts", response_model=CostAlertsResponse)
async def get_cost_alerts(
    admin_auth: bool = Depends(verify_admin_token),
    threshold: float = Query(100.0, description="Daily cost threshold in USD")
):
    """
    Get cost alerts if spending exceeds thresholds
    
    Example:
    - /admin/openai-costs/alerts?token=xxx&threshold=50
    """
    try:
        cost_tracker = get_cost_tracker()
        
        alerts = await cost_tracker.get_cost_alerts(threshold_usd=threshold)
        
        if "error" in alerts:
            raise HTTPException(status_code=500, detail=alerts["error"])
        
        logger.info(f"Cost alerts checked: threshold=${threshold}")
        
        return alerts
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get cost alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get cost alerts: {str(e)}")


@router.get("/today")
async def get_today_costs(admin_auth: bool = Depends(verify_admin_token)):
    """
    Get today's costs - quick summary
    
    Example:
    - /admin/openai-costs/today?token=xxx
    """
    try:
        cost_tracker = get_cost_tracker()
        
        today = datetime.utcnow().date()
        start_date = datetime.combine(today, datetime.min.time())
        end_date = datetime.utcnow()
        
        summary = await cost_tracker.get_usage_summary(
            start_date=start_date,
            end_date=end_date,
            group_by="model"
        )
        
        if "error" in summary:
            raise HTTPException(status_code=500, detail=summary["error"])
        
        return {
            "date": today.isoformat(),
            "total_cost": summary["totals"]["total_cost"],
            "total_calls": summary["totals"]["total_calls"],
            "total_tokens": summary["totals"]["total_tokens"],
            "by_model": summary["summary"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get today's costs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get today's costs: {str(e)}")


@router.get("/month")
async def get_month_costs(admin_auth: bool = Depends(verify_admin_token)):
    """
    Get this month's costs - quick summary
    
    Example:
    - /admin/openai-costs/month?token=xxx
    """
    try:
        cost_tracker = get_cost_tracker()
        
        now = datetime.utcnow()
        start_date = datetime(now.year, now.month, 1)
        end_date = now
        
        summary = await cost_tracker.get_usage_summary(
            start_date=start_date,
            end_date=end_date,
            group_by="model"
        )
        
        if "error" in summary:
            raise HTTPException(status_code=500, detail=summary["error"])
        
        # Calculate projected monthly cost
        days_elapsed = now.day
        days_in_month = 30  # Approximate
        total_cost = summary["totals"]["total_cost"]
        projected_cost = (total_cost / days_elapsed) * days_in_month if days_elapsed > 0 else 0
        
        return {
            "month": f"{now.year}-{now.month:02d}",
            "days_elapsed": days_elapsed,
            "total_cost": total_cost,
            "projected_monthly_cost": projected_cost,
            "total_calls": summary["totals"]["total_calls"],
            "total_tokens": summary["totals"]["total_tokens"],
            "by_model": summary["summary"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get month's costs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get month's costs: {str(e)}")


@router.get("/pricing")
async def get_pricing_info(admin_auth: bool = Depends(verify_admin_token)):
    """
    Get current OpenAI pricing information
    
    Example:
    - /admin/openai-costs/pricing?token=xxx
    """
    from ...services.openai_cost_tracker import PRICING
    
    return {
        "pricing": PRICING,
        "note": "Prices in USD per token. Multiply by 1M for per-million-token pricing.",
        "last_updated": "2025-11-30"
    }
