#!/usr/bin/env python3
"""
One-time script to create the openai_usage table
Run this once on Railway to create the cost tracking table
"""
import os
import sys
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found")
    sys.exit(1)

print(f"Connecting to database...")

engine = create_engine(DATABASE_URL)

sql = """
-- Create OpenAI usage tracking table
CREATE TABLE IF NOT EXISTS openai_usage (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    model VARCHAR(100) NOT NULL,
    operation VARCHAR(50) NOT NULL,
    endpoint VARCHAR(200),
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER NOT NULL,
    estimated_cost_usd NUMERIC(10, 6) NOT NULL,
    user_session VARCHAR(100),
    request_id VARCHAR(100),
    metadata JSONB
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_openai_usage_timestamp ON openai_usage(timestamp);
CREATE INDEX IF NOT EXISTS idx_openai_usage_model ON openai_usage(model);
CREATE INDEX IF NOT EXISTS idx_openai_usage_operation ON openai_usage(operation);
CREATE INDEX IF NOT EXISTS idx_openai_usage_endpoint ON openai_usage(endpoint);

-- Create summary view
CREATE OR REPLACE VIEW openai_cost_summary AS
SELECT 
    DATE(timestamp) as date,
    model,
    operation,
    COUNT(*) as call_count,
    SUM(total_tokens) as total_tokens,
    SUM(estimated_cost_usd) as total_cost_usd
FROM openai_usage
GROUP BY DATE(timestamp), model, operation
ORDER BY date DESC, total_cost_usd DESC;
"""

try:
    with engine.connect() as conn:
        conn.execute(text(sql))
        conn.commit()
    print("✅ Successfully created openai_usage table and indexes!")
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
