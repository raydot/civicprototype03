"""
Show category descriptions from the database
"""
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
from sqlalchemy import create_engine, text

def show_descriptions():
    """Show category descriptions from database"""
    
    engine = create_engine(settings.database_url)
    
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT id, name, type, description 
            FROM political_categories 
            WHERE is_active = true 
            ORDER BY type, name
            LIMIT 10
        """))
        
        print("Sample Category Descriptions:\n")
        print("=" * 100)
        
        for row in result:
            print(f"\nID: {row.id}")
            print(f"Name: {row.name}")
            print(f"Type: {row.type}")
            print(f"Description: {row.description[:200] if row.description else 'No description'}...")
            print("-" * 100)

if __name__ == "__main__":
    show_descriptions()
