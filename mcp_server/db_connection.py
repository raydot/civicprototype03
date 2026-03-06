"""
Database connection manager for MCP server
Ensures database is connected before queries
"""
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / 'backend'
sys.path.insert(0, str(backend_path))

from app.db.database import database

_connected = False

async def ensure_connected():
    """Ensure database is connected"""
    global _connected
    
    if database is None:
        return False
    
    if not _connected:
        try:
            await database.connect()
            _connected = True
        except Exception as e:
            print(f"Failed to connect to database: {e}")
            return False
    
    return True

async def disconnect():
    """Disconnect from database"""
    global _connected
    
    if database is not None and _connected:
        await database.disconnect()
        _connected = False

def get_database():
    """Get database instance"""
    return database
