"""
Configuration settings for the AI Recommendation Service
Railway-optimized configuration with environment variables
"""
import os
from typing import Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application settings
    app_name: str = "AI Recommendation Service"
    version: str = "1.0.0"
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = environment == "development"
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = Field(default=8000, env="PORT")
    
    # Database settings
    database_url: Optional[str] = os.getenv("DATABASE_URL")
    supabase_url: Optional[str] = os.getenv("SUPABASE_URL")
    supabase_key: Optional[str] = os.getenv("SUPABASE_KEY")
    
    # AI Model settings - using smaller model for testing
    ai_model_name: str = "paraphrase-MiniLM-L3-v2"
    vector_dimension: int = int(os.getenv("VECTOR_DIMENSION", "384"))
    confidence_threshold: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.7"))
    max_categories: int = int(os.getenv("MAX_CATEGORIES", "5"))
    
    # Redis settings (for session management)
    redis_url: Optional[str] = os.getenv("REDIS_URL")
    
    # Security settings
    secret_key: Optional[str] = None
    
    # External API settings
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
    
    # Logging settings
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Documentation settings
    # Pydantic will read DOO_DOCZ from .env file and convert to boolean
    doo_docz: str = "true"  # This will be read from .env
    
    @property
    def enable_docs(self) -> bool:
        """Convert doo_docz string to boolean"""
        return self.doo_docz.lower() in ("true", "1", "yes", "on")
    
    # CORS settings
    allowed_origins: list = [
        "http://localhost:3000",  # Local frontend
        "https://*.netlify.app",  # Netlify deployments
        "https://*.netlify.com",  # Netlify deployments
    ]
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
        "protected_namespaces": (),  # Disable protected namespaces to allow model_name
        "extra": "ignore"  # Ignore extra fields from .env file
    }


# Global settings instance
settings = Settings()
