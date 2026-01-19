"""
Import Congress.gov taxonomy from ULTIMATE-policy-database.json into PostgreSQL

This script:
1. Reads the Congress.gov taxonomy from voterprime-fresh
2. Flattens the hierarchical structure into policy terms
3. Imports all 1,085 terms into the policy_terms table
4. Preserves enriched descriptions from voterprime-fresh
"""
import json
import sys
from pathlib import Path
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
from app.utils.logging import structured_logger


def load_congress_taxonomy(json_path: str) -> dict:
    """Load the ULTIMATE-policy-database.json file"""
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def flatten_to_policy_terms(taxonomy_data: dict) -> list:
    """
    Flatten the hierarchical taxonomy into a list of policy terms
    
    Returns list of dicts with:
    - term: Subject term name
    - policy_area: Parent policy area
    - description: Enriched description
    - keywords: List of keywords (derived from term)
    - last_enriched: Date when description was generated
    """
    policy_terms = []
    term_id = 1
    
    for policy_area in taxonomy_data.get('policyAreas', []):
        area_name = policy_area['name']
        subject_terms = policy_area.get('subjectTerms', [])
        enriched_terms = policy_area.get('enrichedTerms', [])
        
        # Create lookup for enriched descriptions
        enriched_lookup = {
            et['term']: et for et in enriched_terms
        }
        
        for term in subject_terms:
            # Get enriched description if available
            enriched = enriched_lookup.get(term, {})
            description = enriched.get('description', f"Policies and legislation related to {term.lower()}.")
            last_enriched = enriched.get('lastUpdated')
            
            # Generate basic keywords from the term
            keywords = [
                word.lower() 
                for word in term.replace('-', ' ').split() 
                if len(word) > 3
            ]
            
            policy_terms.append({
                'id': term_id,
                'term': term,
                'policy_area': area_name,
                'description': description,
                'keywords': keywords,
                'last_enriched': last_enriched
            })
            
            term_id += 1
    
    return policy_terms


def import_to_database(policy_terms: list, engine):
    """Import policy terms into PostgreSQL"""
    
    structured_logger.info(f"Importing {len(policy_terms)} policy terms into database...")
    
    with engine.begin() as conn:
        # Clear existing data
        conn.execute(text("DELETE FROM policy_terms"))
        
        # Track seen terms to handle duplicates in source data
        seen_terms = set()
        imported_count = 0
        skipped_count = 0
        
        # Insert policy terms
        for term_data in policy_terms:
            term_name = term_data['term']
            
            # Skip duplicates in source data
            if term_name in seen_terms:
                structured_logger.warning(f"Skipping duplicate term in source data: {term_name}")
                skipped_count += 1
                continue
            
            seen_terms.add(term_name)
            
            conn.execute(
                text("""
                    INSERT INTO policy_terms 
                    (id, term, policy_area, description, keywords, last_enriched, is_active, created_at, updated_at)
                    VALUES 
                    (:id, :term, :policy_area, :description, CAST(:keywords AS jsonb), :last_enriched, true, NOW(), NOW())
                """),
                {
                    'id': term_data['id'],
                    'term': term_name,
                    'policy_area': term_data['policy_area'],
                    'description': term_data['description'],
                    'keywords': json.dumps(term_data['keywords']),
                    'last_enriched': term_data['last_enriched']
                }
            )
            imported_count += 1
        
        if skipped_count > 0:
            structured_logger.warning(f"Skipped {skipped_count} duplicate terms from source data")
        
        # Verify import
        result = conn.execute(text("SELECT COUNT(*) FROM policy_terms"))
        count = result.scalar()
        
        structured_logger.info(f"Successfully imported {count} policy terms")
        
        # Show breakdown by policy area
        result = conn.execute(text("""
            SELECT policy_area, COUNT(*) as term_count 
            FROM policy_terms 
            GROUP BY policy_area 
            ORDER BY term_count DESC
        """))
        
        structured_logger.info("Policy terms by area:")
        for row in result:
            structured_logger.info(f"  {row[0]}: {row[1]} terms")


def main():
    """Main import process"""
    
    # Path to ULTIMATE-policy-database.json in voterprime-fresh
    json_path = Path(__file__).parent.parent.parent.parent / "voterprime-fresh" / "ULTIMATE-policy-database.json"
    
    if not json_path.exists():
        structured_logger.error(f"Could not find ULTIMATE-policy-database.json at {json_path}")
        structured_logger.error("Make sure voterprime-fresh is in the same parent directory as voterPrime03")
        sys.exit(1)
    
    structured_logger.info(f"Loading Congress.gov taxonomy from {json_path}")
    
    # Load and flatten taxonomy
    taxonomy_data = load_congress_taxonomy(str(json_path))
    policy_terms = flatten_to_policy_terms(taxonomy_data)
    
    structured_logger.info(f"Flattened {len(policy_terms)} policy terms from {len(taxonomy_data['policyAreas'])} policy areas")
    
    # Create database connection
    engine = create_engine(settings.database_url)
    
    # Import to database
    import_to_database(policy_terms, engine)
    
    structured_logger.info("✅ Congress.gov taxonomy import complete!")
    structured_logger.info("Next step: Run generate_embeddings.py to create embeddings for all terms")


if __name__ == "__main__":
    main()
