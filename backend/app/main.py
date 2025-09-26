"""
FastAPI application entry point
Railway-optimized configuration with proper logging and health checks
"""
import signal
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from .config import settings
from .utils.logging import setup_logging, structured_logger
from .utils.exceptions import AIRecommendationException
from .api.routes import health, text_analysis


# Set up logging before anything else
logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager
    Handles startup and shutdown events
    """
    # Startup
    structured_logger.info(
        "application_startup",
        service=settings.app_name,
        version=settings.version,
        environment=settings.environment,
        port=settings.port
    )
    
    # TODO: Initialize AI models here
    # TODO: Initialize database connections here
    
    logger.info(f"🚀 {settings.app_name} v{settings.version} starting up...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Port: {settings.port}")
    
    yield
    
    # Shutdown
    structured_logger.info(
        "application_shutdown",
        service=settings.app_name
    )
    logger.info("👋 Application shutting down...")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="AI-powered recommendation system that learns from user feedback",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Add trusted host middleware for security
if settings.environment == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*.railway.app", "*.netlify.app"]
    )

# Include routers
app.include_router(health.router)
app.include_router(text_analysis.router)


@app.exception_handler(AIRecommendationException)
async def ai_recommendation_exception_handler(request, exc: AIRecommendationException):
    """Handle custom AI recommendation exceptions"""
    structured_logger.error(
        "ai_recommendation_error",
        error_code=exc.error_code,
        message=exc.message,
        path=str(request.url)
    )
    
    return {
        "error": exc.message,
        "error_code": exc.error_code,
        "type": "ai_recommendation_error"
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": settings.app_name,
        "version": settings.version,
        "status": "running",
        "environment": settings.environment,
        "docs_url": "/docs" if settings.debug else "disabled"
    }


def handle_shutdown_signal(signum, frame):
    """Handle shutdown signals gracefully"""
    logger.info(f"Received signal {signum}, shutting down gracefully...")
    structured_logger.info(
        "shutdown_signal_received",
        signal=signum
    )
    sys.exit(0)


# Register signal handlers for graceful shutdown
signal.signal(signal.SIGTERM, handle_shutdown_signal)
signal.signal(signal.SIGINT, handle_shutdown_signal)


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_config=None,  # Use our custom logging configuration
    )
