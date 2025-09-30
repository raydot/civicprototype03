"""
Database connection and configuration for feedback system
"""
import databases
import os
from ..config import settings

# Create database connection - Railway PostgreSQL only
# Prioritize Railway's DATABASE_URL over local .env file
database_url = os.getenv("DATABASE_URL")

if not database_url:
    # Fallback to settings only if no Railway DATABASE_URL
    database_url = settings.database_url
    print("⚠️ Using local DATABASE_URL from .env file")
else:
    print("✅ Using Railway DATABASE_URL environment variable")

if not database_url:
    print("⚠️ DATABASE_URL not found - database features will be disabled")
    database = None
else:
    if not database_url.startswith("postgresql"):
        raise ValueError(f"Only PostgreSQL databases are supported. Got: {database_url[:20]}...")
    
    print(f"Using PostgreSQL database: {database_url[:30]}...")  # Debug info
    database = databases.Database(database_url)
