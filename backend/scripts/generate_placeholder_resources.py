#!/usr/bin/env python3
"""
Generate placeholder educational resources for all political categories
Works directly with Railway production database via API
"""
import requests
import json
from typing import List, Dict
import sys
from pathlib import Path

# Railway production API
BACKEND_URL = "https://voter-mambo-production.up.railway.app"
ADMIN_USERNAME = "T0pS33k5"
ADMIN_PASSWORD = "VPVPrim32025!bana7"

def get_all_categories() -> List[Dict]:
    """Fetch all categories from Railway database"""
    print("📥 Fetching categories from Railway database...")
    
    url = f"{BACKEND_URL}/category-admin/categories"
    response = requests.get(url, auth=(ADMIN_USERNAME, ADMIN_PASSWORD))
    
    if response.status_code != 200:
        print(f"❌ Failed to fetch categories: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    data = response.json()
    categories = data.get("categories", [])
    print(f"✅ Found {len(categories)} categories")
    return categories


def generate_placeholders(categories: List[Dict]) -> List[Dict]:
    """Generate 3 placeholder resources for each category"""
    print(f"\n🔨 Generating placeholder resources...")
    
    placeholders = []
    resource_types = ["article", "video", "podcast"]
    
    for category in categories:
        cat_id = category["id"]
        cat_name = category["name"]
        
        # Generate 3 placeholders per category
        for idx, resource_type in enumerate(resource_types, 1):
            placeholder = {
                "category_id": cat_id,
                "title": f"[PLACEHOLDER] Understanding {cat_name}",
                "source": "TBD - Educational Institution",
                "type": resource_type,
                "duration": "TBD" if resource_type in ["video", "podcast"] else None,
                "description": f"Placeholder {resource_type} resource for {cat_name}. Content to be curated.",
                "url": "https://example.com/placeholder",
                "display_order": idx,
                "is_active": False,  # Inactive until curated
                "created_by": "placeholder_generation_script"
            }
            placeholders.append(placeholder)
    
    print(f"✅ Generated {len(placeholders)} placeholder resources")
    return placeholders


def bulk_import_to_railway(placeholders: List[Dict]) -> Dict:
    """Import placeholders to Railway database via bulk-import API"""
    print(f"\n📤 Importing {len(placeholders)} placeholders to Railway...")
    
    url = f"{BACKEND_URL}/educational-resources/bulk-import"
    response = requests.post(url, json=placeholders)
    
    if response.status_code not in [200, 201]:
        print(f"❌ Failed to import: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    result = response.json()
    print(f"✅ Import complete!")
    print(f"   - Imported: {result.get('imported', 0)}/{result.get('total', 0)}")
    
    if result.get('errors'):
        print(f"   - Errors: {len(result['errors'])}")
        for error in result['errors'][:5]:  # Show first 5 errors
            print(f"     • {error}")
    
    return result


def main():
    """Main execution"""
    print("=" * 60)
    print("🎓 VoterPrime Educational Resources Placeholder Generator")
    print("=" * 60)
    
    # Step 1: Get all categories from Railway
    categories = get_all_categories()
    
    # Step 2: Generate placeholders
    placeholders = generate_placeholders(categories)
    
    # Step 3: Import to Railway
    result = bulk_import_to_railway(placeholders)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print(f"Categories processed: {len(categories)}")
    print(f"Placeholders created: {len(placeholders)}")
    print(f"Successfully imported: {result.get('imported', 0)}")
    errors = result.get('errors') or []
    print(f"Errors: {len(errors)}")
    print("\n✅ All placeholders are set to is_active=false")
    print("   Use the admin UI to activate and curate them:")
    print(f"   {BACKEND_URL}/educational-resources/admin")
    print("=" * 60)


if __name__ == "__main__":
    main()
