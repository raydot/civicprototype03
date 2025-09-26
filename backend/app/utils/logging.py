"""
Logging configuration optimized for Railway deployment
All logs go to stdout for container platform compatibility
"""
import logging
import sys
import json
from datetime import datetime
from typing import Dict, Any
from ..config import settings


def setup_logging():
    """Configure logging for Railway deployment"""
    
    # Configure root logger to output to stdout
    logging.basicConfig(
        stream=sys.stdout,
        level=getattr(logging, settings.log_level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Disable uvicorn access logs in production to reduce noise
    if settings.environment == "production":
        logging.getLogger("uvicorn.access").disabled = True
    
    return logging.getLogger(__name__)


class StructuredLogger:
    """Structured logger for analytics and monitoring"""
    
    def __init__(self, service_name: str = "ai_recommendation"):
        self.logger = logging.getLogger(service_name)
        self.service_name = service_name
    
    def _log_structured(self, level: str, event_type: str, data: Dict[str, Any]):
        """Log structured data as JSON"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "service": self.service_name,
            "level": level,
            "event_type": event_type,
            "environment": settings.environment,
            **data
        }
        
        log_method = getattr(self.logger, level.lower())
        log_method(json.dumps(log_entry))
    
    def info(self, event_type: str, **kwargs):
        """Log info level structured event"""
        self._log_structured("INFO", event_type, kwargs)
    
    def error(self, event_type: str, **kwargs):
        """Log error level structured event"""
        self._log_structured("ERROR", event_type, kwargs)
    
    def warning(self, event_type: str, **kwargs):
        """Log warning level structured event"""
        self._log_structured("WARNING", event_type, kwargs)


# Global structured logger instance
structured_logger = StructuredLogger()
