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
from fastapi.staticfiles import StaticFiles

from .config import settings
from .utils.logging import setup_logging, structured_logger
from .utils.exceptions import AIRecommendationException
from .api.routes import health, text_analysis, category_matching, sentiment_analysis, admin, feedback


# Set up logging before anything else
logger = setup_logging()


@asynccontextmanager
async def Lifecycle(app: FastAPI):
    """
    Application Lifecycle manager
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
    
    # Initialize and connect to database (only if DATABASE_URL is available)
    try:
        from .db.database import database
        if database is not None:
            # Connect to database for the application lifecycle
            await database.connect()
            logger.info("Database connected for application lifecycle")
            
            from .db.init_feedback_system import init_feedback_system
            await init_feedback_system()
            logger.info("Feedback system database initialized successfully")
        else:
            logger.warning("DATABASE_URL not available - skipping feedback system initialization")
    except Exception as e:
        logger.error(f"Failed to initialize feedback system database: {str(e)}")
        # Don't raise here - let the app start but feedback endpoints may not work
    
    # Initialize political categories for matching
    try:
        from .data.category_loader import get_category_loader
        from .models.category_matcher import get_category_matcher
        
        category_loader = get_category_loader()
        categories = category_loader.load_political_categories()
        
        category_matcher = get_category_matcher()
        category_matcher.load_categories(categories)
        
        logger.info(f"Loaded {len(categories)} political categories for matching")
        
    except Exception as e:
        logger.error(f"Failed to load political categories: {str(e)}")
        # Don't raise here - let the app start but category endpoints will fail gracefully
    
    logger.info(f"{settings.app_name} v{settings.version} starting up...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Port: {settings.port}")
    
    yield
    
    # Shutdown
    structured_logger.info(
        "application_shutdown",
        service=settings.app_name
    )
    logger.info("Application shutting down...")
    
    # Disconnect from database
    try:
        from .db.database import database
        if database is not None:
            await database.disconnect()
            logger.info("Database disconnected")
    except Exception as e:
        logger.error(f"Error disconnecting from database: {str(e)}")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="AI-powered recommendation system that learns from user feedback",
    lifespan=Lifecycle,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins if settings.environment == "development" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")


# Add trusted host middleware for security
if settings.environment == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*.railway.app", "*.netlify.app"]
    )

# Include routers
app.include_router(health.router)
app.include_router(text_analysis.router)
app.include_router(category_matching.router)
app.include_router(sentiment_analysis.router)
app.include_router(admin.router)
app.include_router(feedback.router)


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
        "docs_url": "/docs"
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
