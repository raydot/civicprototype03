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
from .api.routes import health, text_analysis, category_matching, sentiment_analysis, admin, feedback, category_admin, openai_costs, admin_migration


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
    
    # Initialize political categories for matching from database
    try:
        from .models.category_matcher import get_category_matcher
        from .db.database import database
        import json
        
        if database is not None:
            # Load categories from database
            query = """
                SELECT id, name, type, description, keywords, success_count, 
                       total_usage_count, terminology_source, terminology_sections, metadata
                FROM political_categories
                WHERE is_active = true
                ORDER BY created_at DESC
            """
            rows = await database.fetch_all(query)
            
            categories = [
                {
                    "id": row["id"],
                    "name": row["name"],
                    "type": row["type"],
                    "description": row["description"],
                    "keywords": json.loads(row["keywords"]) if isinstance(row["keywords"], str) else (row["keywords"] or []),
                    "success_count": row["success_count"],
                    "total_usage_count": row["total_usage_count"],
                    "terminology_source": row["terminology_source"],
                    "terminology_sections": json.loads(row["terminology_sections"]) if isinstance(row["terminology_sections"], str) else (row["terminology_sections"] or []),
                    "metadata": json.loads(row["metadata"]) if isinstance(row["metadata"], str) else (row["metadata"] or {})
                }
                for row in rows
            ]
            
            category_matcher = get_category_matcher()
            category_matcher.load_categories(categories)
            
            logger.info(f"Loaded {len(categories)} political categories from database for matching")
        else:
            logger.warning("Database not available, skipping category initialization")
        
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
    docs_url="/docs" if settings.enable_docs else None,
    redoc_url="/redoc" if settings.enable_docs else None,
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
app.include_router(category_admin.router)
app.include_router(openai_costs.router)
app.include_router(admin_migration.router)

# Import and include learning router
from .api.routes import learning
app.include_router(learning.router)


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
    response = {
        "service": settings.app_name,
        "version": settings.version,
        "status": "running",
        "environment": settings.environment,
    }
    
    # Only include docs_url if docs are enabled
    if settings.enable_docs:
        response["docs_url"] = "/docs"
        response["redoc_url"] = "/redoc"
    
    return response


@app.get("/admin/cost-dashboard")
async def cost_dashboard():
    """Serve the cost tracking dashboard"""
    from fastapi.responses import FileResponse
    import os
    
    dashboard_path = os.path.join(os.path.dirname(__file__), "static", "cost_dashboard.html")
    return FileResponse(dashboard_path)


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
