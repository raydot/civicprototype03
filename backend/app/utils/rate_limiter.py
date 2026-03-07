"""
Simple rate limiting for VoterPrime API
Protects endpoints from abuse and controls costs
"""
from typing import Dict, Tuple
from fastapi import Request, HTTPException
from datetime import datetime, timedelta
import time
from collections import defaultdict
from ..config import settings


class SimpleRateLimiter:
    """
    Simple in-memory rate limiter
    Tracks requests per IP address with sliding window
    """
    
    def __init__(self):
        # Store: {ip_address: [(timestamp, endpoint), ...]}
        self.requests: Dict[str, list] = defaultdict(list)
        self.enabled = settings.environment != "development"
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        client_host = request.client.host if request.client else "unknown"
        return client_host
    
    def _clean_old_requests(self, ip: str, window_seconds: int):
        """Remove requests older than the time window"""
        cutoff = time.time() - window_seconds
        self.requests[ip] = [
            (ts, endpoint) for ts, endpoint in self.requests[ip]
            if ts > cutoff
        ]
    
    def check_rate_limit(
        self, 
        request: Request, 
        max_requests: int = 100,
        window_seconds: int = 60
    ) -> None:
        """
        Check if request exceeds rate limit
        
        Args:
            request: FastAPI request object
            max_requests: Maximum requests allowed in window
            window_seconds: Time window in seconds
            
        Raises:
            HTTPException: If rate limit exceeded
        """
        if not self.enabled:
            return
        
        ip = self._get_client_ip(request)
        endpoint = request.url.path
        current_time = time.time()
        
        # Clean old requests
        self._clean_old_requests(ip, window_seconds)
        
        # Count requests in current window
        request_count = len(self.requests[ip])
        
        if request_count >= max_requests:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Maximum {max_requests} requests per {window_seconds} seconds.",
                    "retry_after": window_seconds
                },
                headers={"Retry-After": str(window_seconds)}
            )
        
        # Record this request
        self.requests[ip].append((current_time, endpoint))


# Global rate limiter instance
_rate_limiter = SimpleRateLimiter()


def get_rate_limiter() -> SimpleRateLimiter:
    """Get the global rate limiter instance"""
    return _rate_limiter


# Decorator for easy use
def rate_limit(max_requests: int = 100, window_seconds: int = 60):
    """
    Decorator to add rate limiting to endpoints
    
    Usage:
        @router.post("/endpoint")
        @rate_limit(max_requests=20, window_seconds=60)
        async def my_endpoint(request: Request):
            ...
    """
    def decorator(func):
        async def wrapper(request: Request, *args, **kwargs):
            limiter = get_rate_limiter()
            limiter.check_rate_limit(request, max_requests, window_seconds)
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator
