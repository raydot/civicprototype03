#!/usr/bin/env python3
"""
Railway deployment startup script
Initializes database and starts the FastAPI application
"""
import asyncio
import os
import sys
import subprocess
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.db.init_feedback_system import init_feedback_system


async def initialize_database():
    """Initialize database tables if DATABASE_URL is available."""
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("⚠️ No DATABASE_URL found - skipping database initialization")
        return False
    
    try:
        print("🔄 Initializing feedback system database...")
        await init_feedback_system()
        print("✅ Database initialization complete!")
        return True
    except Exception as e:
        print(f"❌ Database initialization failed: {str(e)}")
        print("⚠️ Continuing without database initialization...")
        return False


def start_application():
    """Start the FastAPI application using uvicorn."""
    print("🚀 Starting FastAPI application...")
    
    # Use the conda environment path as per successful deployment memory
    python_path = "/opt/conda/envs/ai-recommendation-service/bin/python"
    
    # Check if conda python exists, fallback to system python
    if not os.path.exists(python_path):
        python_path = sys.executable
        print(f"⚠️ Conda python not found, using system python: {python_path}")
    
    # Start uvicorn
    cmd = [
        python_path, "-m", "uvicorn", 
        "app.main:app", 
        "--host", "0.0.0.0", 
        "--port", str(os.getenv("PORT", "8000"))
    ]
    
    print(f"📝 Running command: {' '.join(cmd)}")
    
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start application: {e}")
        sys.exit(1)


async def main():
    """Main startup sequence."""
    print("🎯 VoterPrime Backend - Railway Deployment Startup")
    print("=" * 50)
    
    # Initialize database (non-blocking)
    await initialize_database()
    
    # Start the application
    start_application()


if __name__ == "__main__":
    asyncio.run(main())
