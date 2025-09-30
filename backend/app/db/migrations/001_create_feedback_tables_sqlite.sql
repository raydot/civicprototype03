-- User Feedback Collection System Database Schema (SQLite Version)
-- Migration 001: Create feedback and learning tables

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    session_id TEXT UNIQUE NOT NULL,
    user_ip TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_interactions INTEGER DEFAULT 0,
    session_metadata TEXT DEFAULT '{}'
);

-- Index for session lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at);

-- User Interactions Table
CREATE TABLE IF NOT EXISTS user_interactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    session_id TEXT REFERENCES user_sessions(session_id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL, -- 'category_match', 'refinement', 'feedback'
    user_input TEXT NOT NULL,
    original_query TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processing_time_ms INTEGER,
    interaction_metadata TEXT DEFAULT '{}'
);

-- Indexes for interaction queries
CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id ON user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);

-- Category Feedback Table
CREATE TABLE IF NOT EXISTS category_feedback (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    interaction_id TEXT REFERENCES user_interactions(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL,
    category_name TEXT NOT NULL,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('accept', 'reject', 'maybe', 'irrelevant')),
    confidence_score REAL,
    similarity_score REAL,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    feedback_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    feedback_metadata TEXT DEFAULT '{}'
);

-- Indexes for feedback analysis
CREATE INDEX IF NOT EXISTS idx_category_feedback_interaction_id ON category_feedback(interaction_id);
CREATE INDEX IF NOT EXISTS idx_category_feedback_category_id ON category_feedback(category_id);
CREATE INDEX IF NOT EXISTS idx_category_feedback_type ON category_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_category_feedback_created_at ON category_feedback(created_at);

-- Learning Metrics Table
CREATE TABLE IF NOT EXISTS learning_metrics (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    category_id INTEGER NOT NULL,
    metric_type TEXT NOT NULL, -- 'success_rate', 'confidence_accuracy', 'user_satisfaction'
    metric_value REAL,
    sample_size INTEGER,
    time_period TEXT, -- 'daily', 'weekly', 'monthly'
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    metric_metadata TEXT DEFAULT '{}'
);

-- Indexes for metrics analysis
CREATE INDEX IF NOT EXISTS idx_learning_metrics_category_id ON learning_metrics(category_id);
CREATE INDEX IF NOT EXISTS idx_learning_metrics_type ON learning_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_learning_metrics_calculated_at ON learning_metrics(calculated_at);

-- Create a composite index for efficient metric queries
CREATE INDEX IF NOT EXISTS idx_learning_metrics_category_type_date 
ON learning_metrics(category_id, metric_type, calculated_at);
