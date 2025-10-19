"""
Migration script to update political_spectrum values from 4-point to 5-point scale

Old values: progressive, conservative, bipartisan, polarized
New values: progressive, leans_left, bipartisan, leans_right, conservative

Changes:
- progressive → progressive (no change)
- conservative → conservative (no change)
- bipartisan → bipartisan (no change)
- polarized → depends on category:
  - Immigration & Border Policy (ID 5) → leans_right
  - Criminal Justice & Public Safety (ID 6) → bipartisan
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.database import database
from app.utils.logging import structured_logger

logger = structured_logger


async def migrate_spectrum_values():
    """Migrate political spectrum values in the database"""
    
    if database is None:
        logger.error("Database not available")
        return
    
    try:
        # Connect to database
        await database.connect()
        logger.info("Connected to database")
        
        # Get all categories with their current spectrum values
        query = """
            SELECT id, name, metadata
            FROM political_categories
            WHERE is_active = true
        """
        categories = await database.fetch_all(query)
        
        logger.info(f"Found {len(categories)} active categories")
        print(f"\nFound {len(categories)} active categories")
        
        # Track changes
        changes = []
        
        for cat in categories:
            cat_id = cat["id"]
            cat_name = cat["name"]
            metadata = cat["metadata"]
            
            # Parse metadata if it's a string
            import json
            if isinstance(metadata, str):
                metadata = json.loads(metadata)
            
            if not metadata or "political_spectrum" not in metadata:
                logger.warning(f"Category {cat_id} ({cat_name}) has no political_spectrum")
                continue
            
            old_spectrum = metadata["political_spectrum"]
            new_spectrum = old_spectrum  # Default: no change
            
            # Apply migration rules
            if old_spectrum == "polarized":
                # Original categories
                if cat_id == 5:  # Immigration & Border Policy
                    new_spectrum = "leans_right"
                elif cat_id == 6:  # Criminal Justice & Public Safety
                    new_spectrum = "bipartisan"
                # AI-generated categories
                elif cat_id == 301:  # Voting Rights & Election Integrity
                    new_spectrum = "bipartisan"
                elif cat_id == 306:  # Parental Rights in Education
                    new_spectrum = "leans_right"
                elif cat_id == 307:  # Marriage & Family Policy
                    new_spectrum = "leans_right"
                elif cat_id == 309:  # School Choice & Education Alternatives
                    new_spectrum = "leans_right"
                elif cat_id == 312:  # Digital Device Policies in Schools
                    new_spectrum = "bipartisan"
                elif cat_id == 314:  # Government Overreach
                    new_spectrum = "conservative"
                elif cat_id == 318:  # Freedom of Expression
                    new_spectrum = "bipartisan"
                else:
                    # Fallback for any other polarized categories
                    new_spectrum = "bipartisan"
                    logger.warning(f"Unexpected polarized category: {cat_id} ({cat_name})")
            
            # Record change if spectrum value changed
            if old_spectrum != new_spectrum:
                changes.append({
                    "id": cat_id,
                    "name": cat_name,
                    "old": old_spectrum,
                    "new": new_spectrum
                })
        
        # Display changes
        print(f"\nProcessed all categories. Found {len(changes)} changes needed.")
        
        if not changes:
            print("No changes needed - all categories already use correct spectrum values")
            logger.info("No changes needed - all categories already use correct spectrum values")
            return
        
        print(f"\nPlanned changes ({len(changes)}):")
        logger.info(f"\nPlanned changes ({len(changes)}):")
        for change in changes:
            print(f"  ID {change['id']}: {change['name']}")
            print(f"    {change['old']} → {change['new']}")
            logger.info(f"  ID {change['id']}: {change['name']}")
            logger.info(f"    {change['old']} → {change['new']}")
        
        # Confirm before applying
        print("\nApply these changes? (yes/no): ", end="")
        confirmation = input().strip().lower()
        
        if confirmation != "yes":
            logger.info("Migration cancelled by user")
            return
        
        # Apply changes
        print("\nApplying changes...")
        logger.info("\nApplying changes...")
        for change in changes:
            # Use a simpler approach - update the entire metadata JSON
            # First, get the current metadata
            get_query = "SELECT metadata FROM political_categories WHERE id = :category_id"
            result = await database.fetch_one(get_query, {"category_id": change["id"]})
            
            # Parse and update metadata
            import json
            metadata = result["metadata"]
            if isinstance(metadata, str):
                metadata = json.loads(metadata)
            
            metadata["political_spectrum"] = change["new"]
            
            # Update back to database
            update_query = """
                UPDATE political_categories
                SET metadata = :metadata,
                    updated_at = NOW(),
                    updated_by = 'migration_script'
                WHERE id = :category_id
            """
            await database.execute(
                update_query, 
                {"metadata": json.dumps(metadata), "category_id": change["id"]}
            )
            print(f"✓ Updated category {change['id']}: {change['name']}")
            logger.info(f"✓ Updated category {change['id']}: {change['name']}")
        
        logger.info(f"\n✅ Migration complete! Updated {len(changes)} categories.")
        
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        raise
    finally:
        await database.disconnect()
        logger.info("Disconnected from database")


if __name__ == "__main__":
    asyncio.run(migrate_spectrum_values())
