"""Quick test to check embedding similarity calculations"""
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine, text
from app.config import settings
from openai import OpenAI

# Get a few policy terms from database
engine = create_engine(settings.database_url)
with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT id, term, description, embedding 
        FROM policy_terms 
        WHERE embedding IS NOT NULL 
        LIMIT 5
    """))
    
    terms = []
    for row in result:
        terms.append({
            'id': row[0],
            'term': row[1],
            'description': row[2],
            'embedding': np.array(row[3])
        })

print(f"\nLoaded {len(terms)} terms from database")
print("\nTerms:")
for term in terms:
    print(f"  - {term['term']}")

# Check embedding shapes and values
print("\nEmbedding info:")
for term in terms:
    emb = term['embedding']
    print(f"  {term['term'][:30]:30s} - shape: {emb.shape}, norm: {np.linalg.norm(emb):.4f}, mean: {emb.mean():.6f}")

# Test query
test_query = "I'm worried about healthcare costs"
print(f"\nTest query: '{test_query}'")

# Generate embedding for test query
openai_client = OpenAI(api_key=settings.openai_api_key)
response = openai_client.embeddings.create(
    model="text-embedding-3-small",
    input=[test_query]
)
query_embedding = np.array(response.data[0].embedding)
print(f"Query embedding - shape: {query_embedding.shape}, norm: {np.linalg.norm(query_embedding):.4f}")

# Calculate similarities
category_embeddings = np.array([term['embedding'] for term in terms])
similarities = cosine_similarity(
    query_embedding.reshape(1, -1),
    category_embeddings
)[0]

print("\nSimilarity scores:")
for i, term in enumerate(terms):
    print(f"  {term['term'][:40]:40s} - {similarities[i]:.4f}")
