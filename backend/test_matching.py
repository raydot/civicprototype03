"""
Quick command-line test for policy term matching
Tests the matching algorithm with sample queries
"""
import asyncio
import sys
import os
from pathlib import Path

# Force local database connection
os.environ['DATABASE_URL'] = 'postgresql://voterprime:voterprime_dev@localhost:5432/voterprime_dev'

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.models.category_matcher import get_category_matcher
from app.db.database import database
from app.config import settings
import json


async def test_matching():
    """Test matching with sample queries"""
    
    # Connect to database
    await database.connect()
    
    try:
        # Load policy terms from database
        query = """
            SELECT id, term as name, policy_area, description, keywords, 
                   embedding, success_count, total_usage_count, is_active
            FROM policy_terms
            WHERE is_active = true
            ORDER BY id
        """
        rows = await database.fetch_all(query)
        
        policy_terms = [
            {
                "id": row["id"],
                "name": row["name"],
                "type": "policy_term",
                "policy_area": row["policy_area"],
                "description": row["description"],
                "keywords": json.loads(row["keywords"]) if isinstance(row["keywords"], str) else (row["keywords"] if row["keywords"] else []),
                "embedding": list(row["embedding"]) if row["embedding"] else None,
                "success_count": row["success_count"] or 0,
                "total_usage_count": row["total_usage_count"] or 0,
                "metadata": {
                    "policy_area": row["policy_area"]
                }
            }
            for row in rows
        ]
        
        # Initialize matcher
        matcher = get_category_matcher()
        matcher.load_categories(policy_terms)
        
        print(f"\n✅ Loaded {len(policy_terms)} policy terms from database\n")
        
        # Test queries
        test_queries = [
            "Healthcare costs are too high",
            "Student loans are crushing me",
            "Climate change is destroying our planet",
            "Gun violence in schools",
            "Immigration reform is needed"
        ]
        
        for query in test_queries:
            print(f"{'='*80}")
            print(f"Query: '{query}'")
            print(f"{'='*80}")
            
            # Find matches
            matches = matcher.find_matches(
                user_input=query,
                top_k=5
            )
            
            if not matches:
                print("❌ No matches found\n")
                continue
            
            print(f"\nTop {len(matches)} matches:\n")
            for i, match in enumerate(matches, 1):
                print(f"{i}. {match.category_name}")
                print(f"   Policy Area: {match.metadata.get('policy_area', 'N/A')}")
                print(f"   Similarity: {match.similarity_score:.1%}")
                print(f"   Confidence: {match.confidence_score:.1%}")
                if match.keywords:
                    print(f"   Keywords: {', '.join(match.keywords[:3])}")
                print()
            
            print()
        
    finally:
        await database.disconnect()


if __name__ == "__main__":
    asyncio.run(test_matching())
