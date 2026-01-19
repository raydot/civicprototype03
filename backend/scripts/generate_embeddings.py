"""
Generate OpenAI embeddings for all policy terms in the database

This script:
1. Loads all policy terms from PostgreSQL
2. Generates embeddings using OpenAI text-embedding-3-small
3. Updates the database with embeddings
4. Tracks progress and costs
"""
import sys
from pathlib import Path
from sqlalchemy import create_engine, text
from openai import OpenAI
import time

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
from app.utils.logging import structured_logger


def generate_embeddings_batch(terms: list, openai_client: OpenAI) -> dict:
    """
    Generate embeddings for a batch of policy terms
    
    Returns dict mapping term_id to embedding vector
    """
    # Prepare input texts (term + description for better context)
    texts = [
        f"{term['term']}. {term['description']}"
        for term in terms
    ]
    
    try:
        response = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=texts,
            encoding_format="float"
        )
        
        # Map embeddings back to term IDs
        embeddings = {}
        for i, term in enumerate(terms):
            embeddings[term['id']] = response.data[i].embedding
        
        return embeddings
        
    except Exception as e:
        structured_logger.error(f"Error generating embeddings: {str(e)}")
        raise


def update_embeddings_in_db(embeddings: dict, engine):
    """Update policy_terms table with generated embeddings"""
    
    with engine.begin() as conn:
        for term_id, embedding in embeddings.items():
            conn.execute(
                text("""
                    UPDATE policy_terms 
                    SET embedding = :embedding,
                        updated_at = NOW()
                    WHERE id = :id
                """),
                {
                    'id': term_id,
                    'embedding': embedding  # Pass as Python list, SQLAlchemy handles ARRAY conversion
                }
            )


def main():
    """Main embedding generation process"""
    
    structured_logger.info("Starting embedding generation for all policy terms...")
    
    # Initialize OpenAI client
    openai_client = OpenAI(api_key=settings.openai_api_key)
    
    # Create database connection
    engine = create_engine(settings.database_url)
    
    # Get all policy terms without embeddings
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT id, term, description 
            FROM policy_terms 
            WHERE embedding IS NULL
            ORDER BY id
        """))
        
        terms = [
            {'id': row[0], 'term': row[1], 'description': row[2]}
            for row in result
        ]
    
    total_terms = len(terms)
    structured_logger.info(f"Found {total_terms} policy terms needing embeddings")
    
    if total_terms == 0:
        structured_logger.info("All policy terms already have embeddings!")
        return
    
    # Calculate estimated cost
    # text-embedding-3-small: $0.00002 per 1K tokens
    # Rough estimate: ~100 tokens per term (term + description)
    estimated_tokens = total_terms * 100
    estimated_cost = (estimated_tokens / 1000) * 0.00002
    structured_logger.info(f"Estimated cost: ${estimated_cost:.4f}")
    
    # Process in batches of 100 (OpenAI limit is 2048)
    batch_size = 100
    total_batches = (total_terms + batch_size - 1) // batch_size
    
    start_time = time.time()
    
    for i in range(0, total_terms, batch_size):
        batch_num = (i // batch_size) + 1
        batch = terms[i:i + batch_size]
        
        structured_logger.info(f"Processing batch {batch_num}/{total_batches} ({len(batch)} terms)...")
        
        try:
            # Generate embeddings for batch
            embeddings = generate_embeddings_batch(batch, openai_client)
            
            # Update database
            update_embeddings_in_db(embeddings, engine)
            
            structured_logger.info(f"✅ Batch {batch_num}/{total_batches} complete")
            
            # Small delay to avoid rate limits
            if batch_num < total_batches:
                time.sleep(0.5)
                
        except Exception as e:
            structured_logger.error(f"Failed on batch {batch_num}: {str(e)}")
            structured_logger.error("Progress saved. You can re-run this script to continue.")
            sys.exit(1)
    
    elapsed_time = time.time() - start_time
    
    # Verify completion
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT 
                COUNT(*) as total,
                COUNT(embedding) as with_embeddings
            FROM policy_terms
        """))
        row = result.fetchone()
        total = row[0]
        with_embeddings = row[1]
    
    structured_logger.info("=" * 60)
    structured_logger.info("✅ EMBEDDING GENERATION COMPLETE!")
    structured_logger.info("=" * 60)
    structured_logger.info(f"Total policy terms: {total}")
    structured_logger.info(f"Terms with embeddings: {with_embeddings}")
    structured_logger.info(f"Time elapsed: {elapsed_time:.1f} seconds")
    structured_logger.info(f"Average: {elapsed_time/total:.2f} seconds per term")
    structured_logger.info("=" * 60)
    structured_logger.info("Next step: Update CategoryLoader to load from database")


if __name__ == "__main__":
    main()
