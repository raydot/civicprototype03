"""
Migrate political categories from JSON file to PostgreSQL database
Run this once to populate the database with existing categories
"""
import asyncio
import json
from pathlib import Path
import sys
import os

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.db.database import database
from app.utils.logging import structured_logger

logger = structured_logger

CATEGORIES_FILE = Path(__file__).parent / "app" / "data" / "political_categories.json"


async def migrate_categories():
    """Migrate categories from JSON to database"""
    
    if database is None:
        print("❌ DATABASE_URL not set. Please set it and try again.")
        print("Example: export DATABASE_URL='postgresql://voterprime:voterprime_dev@localhost:5432/voterprime_dev'")
        return False
    
    try:
        # Connect to database
        await database.connect()
        print("✅ Connected to database")
        
        # Load JSON file
        with open(CATEGORIES_FILE) as f:
            data = json.load(f)
        
        categories = data.get("categories", [])
        print(f"📁 Found {len(categories)} categories in JSON file")
        
        # Check if any categories already exist
        count_query = "SELECT COUNT(*) as count FROM political_categories"
        result = await database.fetch_one(count_query)
        existing_count = result["count"]
        
        if existing_count > 0:
            print(f"⚠️  Database already has {existing_count} categories")
            response = input("Do you want to continue? This will add duplicates if IDs match. (y/N): ")
            if response.lower() != 'y':
                print("❌ Migration cancelled")
                return False
        
        # Insert categories
        insert_query = """
            INSERT INTO political_categories 
            (id, name, type, description, keywords, success_count, total_usage_count,
             terminology_source, terminology_sections, metadata, created_by, updated_by)
            VALUES (:id, :name, :type, :description, :keywords, :success_count, :total_usage_count,
                    :terminology_source, :terminology_sections, :metadata, :created_by, :updated_by)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                type = EXCLUDED.type,
                description = EXCLUDED.description,
                keywords = EXCLUDED.keywords,
                success_count = EXCLUDED.success_count,
                total_usage_count = EXCLUDED.total_usage_count,
                terminology_source = EXCLUDED.terminology_source,
                terminology_sections = EXCLUDED.terminology_sections,
                metadata = EXCLUDED.metadata,
                updated_at = NOW(),
                updated_by = EXCLUDED.updated_by
        """
        
        migrated = 0
        for category in categories:
            try:
                await database.execute(insert_query, {
                    "id": category["id"],
                    "name": category["name"],
                    "type": category["type"],
                    "description": category.get("description", ""),
                    "keywords": json.dumps(category.get("keywords", [])),
                    "success_count": category.get("success_count", 0),
                    "total_usage_count": category.get("total_usage_count", 0),
                    "terminology_source": category.get("terminology_source", "manual"),
                    "terminology_sections": json.dumps(category.get("terminology_sections", [])),
                    "metadata": json.dumps(category.get("metadata", {})),
                    "created_by": "json_migration",
                    "updated_by": "json_migration"
                })
                migrated += 1
                print(f"  ✓ Migrated: {category['id']} - {category['name']}")
            except Exception as e:
                print(f"  ✗ Failed: {category['id']} - {category['name']}: {str(e)}")
        
        print(f"\n✅ Migration complete: {migrated}/{len(categories)} categories migrated")
        
        # Verify
        final_count_query = "SELECT COUNT(*) as count FROM political_categories WHERE is_active = true"
        final_result = await database.fetch_one(final_count_query)
        print(f"📊 Total active categories in database: {final_result['count']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return False
    finally:
        await database.disconnect()
        print("👋 Disconnected from database")


if __name__ == "__main__":
    print("🚀 Political Categories Migration Tool")
    print("=" * 50)
    
    if not CATEGORIES_FILE.exists():
        print(f"❌ Categories file not found: {CATEGORIES_FILE}")
        sys.exit(1)
    
    # Run migration
    success = asyncio.run(migrate_categories())
    
    if success:
        print("\n✨ Migration successful!")
        print("\nNext steps:")
        print("1. Test the AI Category Admin tool")
        print("2. Verify categories are loading correctly")
        print("3. The JSON file is kept as a backup")
    else:
        print("\n❌ Migration failed. Please check the errors above.")
        sys.exit(1)
