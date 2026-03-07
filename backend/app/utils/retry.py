"""
Retry utility with exponential backoff for API calls
Provides resilience for transient failures
"""
import time
import asyncio
from typing import TypeVar, Callable, Optional, Tuple, Type
from functools import wraps
from openai import (
    APIError, 
    APIConnectionError, 
    RateLimitError, 
    APITimeoutError,
    InternalServerError,
    APIStatusError
)
from ..utils.logging import structured_logger

logger = structured_logger

T = TypeVar('T')

# Exceptions that should trigger a retry
RETRYABLE_EXCEPTIONS = (
    APIConnectionError,  # Network issues
    RateLimitError,      # Rate limit (429)
    APITimeoutError,     # Timeout
    InternalServerError, # 5xx errors
)


def should_retry(exception: Exception) -> bool:
    """
    Determine if an exception should trigger a retry
    
    Args:
        exception: The exception to check
        
    Returns:
        True if the exception is retryable
    """
    # Check if it's a known retryable exception
    if isinstance(exception, RETRYABLE_EXCEPTIONS):
        return True
    
    # Check for specific status codes in APIStatusError
    if isinstance(exception, APIStatusError):
        # Retry on 5xx server errors and 429 rate limit
        if exception.status_code >= 500 or exception.status_code == 429:
            return True
    
    return False


def calculate_delay(attempt: int, base_delay: float = 1.0, max_delay: float = 60.0) -> float:
    """
    Calculate exponential backoff delay with jitter
    
    Args:
        attempt: Current attempt number (0-indexed)
        base_delay: Base delay in seconds
        max_delay: Maximum delay in seconds
        
    Returns:
        Delay in seconds
    """
    # Exponential backoff: base_delay * 2^attempt
    delay = base_delay * (2 ** attempt)
    
    # Cap at max_delay
    delay = min(delay, max_delay)
    
    # Add jitter (±25%) to avoid thundering herd
    import random
    jitter = delay * 0.25 * (random.random() * 2 - 1)
    delay = delay + jitter
    
    return max(0, delay)


def retry_with_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exceptions: Optional[Tuple[Type[Exception], ...]] = None
):
    """
    Decorator for synchronous functions with retry logic and exponential backoff
    
    Args:
        max_retries: Maximum number of retry attempts
        base_delay: Initial delay in seconds
        max_delay: Maximum delay in seconds
        exceptions: Tuple of exception types to retry on (default: RETRYABLE_EXCEPTIONS)
        
    Usage:
        @retry_with_backoff(max_retries=3, base_delay=1.0)
        def my_api_call():
            return client.embeddings.create(...)
    """
    if exceptions is None:
        exceptions = RETRYABLE_EXCEPTIONS
    
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> T:
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                    
                except Exception as e:
                    last_exception = e
                    
                    # Check if we should retry
                    if not should_retry(e):
                        logger.warning(f"{func.__name__} failed with non-retryable error: {type(e).__name__}: {str(e)}")
                        raise
                    
                    # Don't retry if we've exhausted attempts
                    if attempt >= max_retries:
                        logger.error(f"{func.__name__} failed after {max_retries + 1} attempts: {type(e).__name__}: {str(e)}")
                        raise
                    
                    # Calculate delay and wait
                    delay = calculate_delay(attempt, base_delay, max_delay)
                    logger.warning(
                        f"{func.__name__} attempt {attempt + 1}/{max_retries + 1} failed: {type(e).__name__}: {str(e)}. "
                        f"Retrying in {delay:.2f}s..."
                    )
                    time.sleep(delay)
            
            # Should never reach here, but just in case
            if last_exception:
                raise last_exception
            
        return wrapper
    return decorator


def async_retry_with_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exceptions: Optional[Tuple[Type[Exception], ...]] = None
):
    """
    Decorator for async functions with retry logic and exponential backoff
    
    Args:
        max_retries: Maximum number of retry attempts
        base_delay: Initial delay in seconds
        max_delay: Maximum delay in seconds
        exceptions: Tuple of exception types to retry on (default: RETRYABLE_EXCEPTIONS)
        
    Usage:
        @async_retry_with_backoff(max_retries=3, base_delay=1.0)
        async def my_async_api_call():
            return await client.embeddings.create(...)
    """
    if exceptions is None:
        exceptions = RETRYABLE_EXCEPTIONS
    
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> T:
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                    
                except Exception as e:
                    last_exception = e
                    
                    # Check if we should retry
                    if not should_retry(e):
                        logger.warning(f"{func.__name__} failed with non-retryable error: {type(e).__name__}: {str(e)}")
                        raise
                    
                    # Don't retry if we've exhausted attempts
                    if attempt >= max_retries:
                        logger.error(f"{func.__name__} failed after {max_retries + 1} attempts: {type(e).__name__}: {str(e)}")
                        raise
                    
                    # Calculate delay and wait
                    delay = calculate_delay(attempt, base_delay, max_delay)
                    logger.warning(
                        f"{func.__name__} attempt {attempt + 1}/{max_retries + 1} failed: {type(e).__name__}: {str(e)}. "
                        f"Retrying in {delay:.2f}s..."
                    )
                    await asyncio.sleep(delay)
            
            # Should never reach here, but just in case
            if last_exception:
                raise last_exception
            
        return wrapper
    return decorator
