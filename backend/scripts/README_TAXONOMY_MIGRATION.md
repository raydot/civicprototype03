# Congress.gov Taxonomy Migration Guide

This guide walks through migrating voterPrime03 from 20 custom categories to 1,085 Congress.gov policy terms.

## Overview

**What's changing:**

- From: 20 broad categories in JSON file
- To: 1,085 specific policy terms in PostgreSQL database

**Why:**

- Better matching accuracy (more granular terms)
- Standard taxonomy (works with external APIs)
- Database-backed (easier to update, track usage)

## Migration Steps

### 1. Run Database Migration

Create the `policy_terms` table:

```bash
cd /Users/davekanter/Documents/Clients/shazseitz/voterPrime03/backend
alembic upgrade head
```

This creates the `policy_terms` table with:

- Term metadata (id, term, policy_area, description)
- Embeddings column (vector type for OpenAI embeddings)
- Usage tracking (success_count, total_usage_count)

### 2. Import Congress.gov Taxonomy

Import all 1,085 policy terms from voterprime-fresh:

```bash
python scripts/import_congress_taxonomy.py
```

This script:

- Reads `ULTIMATE-policy-database.json` from voterprime-fresh
- Flattens the hierarchical structure
- Imports all terms with enriched descriptions
- Takes ~10 seconds

**Expected output:**

```
✅ Loaded 25 policy areas
✅ Flattened 1,085 policy terms
✅ Successfully imported 1,085 policy terms
```

### 3. Generate Embeddings

Generate OpenAI embeddings for all policy terms:

```bash
python scripts/generate_embeddings.py
```

This script:

- Loads all policy terms from database
- Generates embeddings using OpenAI text-embedding-3-small
- Updates database with embeddings
- Processes in batches of 100

**Cost:** ~$2-3 one-time
**Time:** ~5-10 minutes

**Expected output:**

```
✅ EMBEDDING GENERATION COMPLETE!
Total policy terms: 1,085
Terms with embeddings: 1,085
Time elapsed: 347.2 seconds
```

### 4. Restart Backend

The CategoryLoader now loads from PostgreSQL automatically:

```bash
# Stop current backend
# Restart backend
```

On startup, you should see:

```
Loading policy terms from PostgreSQL database...
Loaded 1,085 policy terms from database
```

## Verification

Test that matching works with new taxonomy:

```bash
curl -X POST http://localhost:8000/api/match \
  -H "Content-Type: application/json" \
  -d '{"user_input": "Healthcare costs are too high"}'
```

Should return specific terms like:

- "Health care costs and insurance"
- "Medicare"
- "Prescription drug costs"

Instead of generic "Healthcare & Social Services"

## Architecture

**Data Flow:**

1. PostgreSQL stores 1,085 policy terms + embeddings
2. CategoryLoader loads all terms into memory at startup (cached)
3. CategoryMatcher uses in-memory data for fast cosine similarity
4. No database queries during user sessions

**Performance:**

- Startup: One database query to load all terms (~1 second)
- Matching: In-memory cosine similarity (same as before)
- No ongoing API costs (embeddings pre-generated)

## Rollback

If you need to rollback:

```bash
alembic downgrade -1
```

This drops the `policy_terms` table. Your old `political_categories.json` file is unchanged.

## Next Steps

After taxonomy migration is complete:

1. Monitor matching accuracy
2. Track which policy terms match most often
3. Build recommendations engine using policy_area for API queries

## Troubleshooting

**Issue:** "Table policy_terms does not exist"
**Fix:** Run `alembic upgrade head`

**Issue:** "No embeddings found"
**Fix:** Run `python scripts/generate_embeddings.py`

**Issue:** "Cannot find ULTIMATE-policy-database.json"
**Fix:** Ensure voterprime-fresh is in same parent directory as voterPrime03

**Issue:** CategoryLoader still reading from JSON
**Fix:** Restart backend to pick up new CategoryLoader code
