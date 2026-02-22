# Database Schema Issue - Test Failures

## Problem

Tests are failing with error: `column "first_seen" of relation "user_sessions" does not exist`

## Root Cause

The Railway production database is missing the `first_seen` column in the `user_sessions` table. This column is defined in the Alembic migration `31d1af6c6930_create_feedback_tables.py` but may not have been applied to the Railway database.

## Migration Schema

The migration defines `user_sessions` table with:

- `id` (String, primary key)
- `first_seen` (DateTime, NOT NULL, default NOW())
- `last_seen` (DateTime, NOT NULL, default NOW())
- `interaction_count` (Integer, NOT NULL, default 0)
- `session_metadata` (JSON, nullable)

## Solution

Run Alembic migrations on Railway database:

```bash
# From backend directory
env $(grep -v '^#' .env | xargs) alembic upgrade head
```

Or manually add the column if migration fails:

```sql
ALTER TABLE user_sessions
ADD COLUMN IF NOT EXISTS first_seen TIMESTAMP NOT NULL DEFAULT NOW();
```

## Affected Tests

- `test_user_session_service`
- `test_interaction_tracker_service`
- `test_full_workflow`

## Workaround for Local Testing

Set `ENVIRONMENT=development` and use local database, or update the Railway database schema.
