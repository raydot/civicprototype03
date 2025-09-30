"""
Database connection and configuration for feedback system
"""
import databases
import os
from ..config import settings

# Create database connection - Railway PostgreSQL only
database_url = os.getenv("DATABASE_URL") or settings.database_url

if not database_url:
    raise ValueError("DATABASE_URL not found. Please set it in Railway or .env file")

if not database_url.startswith("postgresql"):
    raise ValueError(f"Only PostgreSQL databases are supported. Got: {database_url[:20]}...")

print(f"Using PostgreSQL database: {database_url[:30]}...")  # Debug info
database = databases.Database(database_url)
