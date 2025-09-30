"""
Initialize feedback system database tables
Run this script to set up the learning system database schema
"""
import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to Python path for imports
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.config import settings
from app.db.database import database


async def run_migration(migration_file: str):
    """Run a specific migration file."""
    migration_path = Path(__file__).parent / "migrations" / migration_file
    
    if not migration_path.exists():
        raise FileNotFoundError(f"Migration file not found: {migration_path}")
    
    print(f"Running migration: {migration_file}")
    
    with open(migration_path, 'r') as f:
        sql_content = f.read()
    
    # Split by semicolon and execute each statement
    statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
    
    for statement in statements:
        try:
            await database.execute(statement)
            print(f"✅ Executed: {statement[:50]}...")
        except Exception as e:
            print(f"❌ Failed: {statement[:50]}... - Error: {str(e)}")
            raise


async def init_feedback_system():
    if database is None:
        print("⚠️ DATABASE_URL not available - feedback system not available")
        return
        
    try:
        await database.connect()
        
        # Check if all required tables exist
        required_tables = ['user_sessions', 'user_interactions', 'category_feedback', 'learning_metrics']
        
        for table in required_tables:
            result = await database.fetch_one(f"SELECT COUNT(*) as count FROM {table}")
            print(f"✅ Table '{table}': {result['count']} records")
        
        # Check views (only for PostgreSQL)
        if "postgresql" in str(database.url):
            required_views = ['daily_feedback_trends', 'session_activity_summary']
            
            for view in required_views:
                try:
                    result = await database.fetch_one(f"SELECT COUNT(*) as count FROM {view}")
                    print(f"✅ View '{view}': {result['count']} records")
                except Exception as e:
                    print(f"❌ View '{view}': Error - {str(e)}")
        else:
            print("📊 Views not applicable for SQLite database")
        
        print("\n🎉 Feedback system health check complete!")
        
    except Exception as e:
        print(f"❌ Health check failed: {str(e)}")
        raise
    finally:
        await database.disconnect()


if __name__ == "__main__":
    import sys
    
    # Check for local testing flag
    if len(sys.argv) > 1 and sys.argv[1] == "local":
        # Use local SQLite for testing
        import os
        os.environ["DATABASE_URL"] = "sqlite:///./test_feedback.db"
        print("🧪 Using local SQLite database for testing")
    
    if len(sys.argv) > 1 and sys.argv[1] == "check":
        # Health check mode
        asyncio.run(check_feedback_system_health())
    else:
        # Initialize mode
        asyncio.run(init_feedback_system())
