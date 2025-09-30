-- User Feedback Collection System Database Schema
-- Migration 001: Create feedback and learning tables

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW(),
    total_interactions INTEGER DEFAULT 0,
    session_metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for session lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at);

-- User Interactions Table
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) REFERENCES user_sessions(session_id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- 'category_match', 'refinement', 'feedback'
    user_input TEXT NOT NULL,
    original_query TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processing_time_ms INTEGER,
    interaction_metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for interaction queries
CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id ON user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);

-- Category Feedback Table
CREATE TABLE IF NOT EXISTS category_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interaction_id UUID REFERENCES user_interactions(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('accept', 'reject', 'maybe', 'irrelevant')),
    confidence_score DECIMAL(5,4),
    similarity_score DECIMAL(5,4),
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    feedback_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    feedback_metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for feedback analysis
CREATE INDEX IF NOT EXISTS idx_category_feedback_interaction_id ON category_feedback(interaction_id);
CREATE INDEX IF NOT EXISTS idx_category_feedback_category_id ON category_feedback(category_id);
CREATE INDEX IF NOT EXISTS idx_category_feedback_type ON category_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_category_feedback_created_at ON category_feedback(created_at);

-- Learning Metrics Table
CREATE TABLE IF NOT EXISTS learning_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id INTEGER NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'success_rate', 'confidence_accuracy', 'user_satisfaction'
    metric_value DECIMAL(10,6),
    sample_size INTEGER,
    time_period VARCHAR(20), -- 'daily', 'weekly', 'monthly'
    calculated_at TIMESTAMP DEFAULT NOW(),
    metric_metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for metrics analysis
CREATE INDEX IF NOT EXISTS idx_learning_metrics_category_id ON learning_metrics(category_id);
CREATE INDEX IF NOT EXISTS idx_learning_metrics_type ON learning_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_learning_metrics_calculated_at ON learning_metrics(calculated_at);

-- Create a composite index for efficient metric queries
CREATE INDEX IF NOT EXISTS idx_learning_metrics_category_type_date 
ON learning_metrics(category_id, metric_type, calculated_at);

-- Add some useful views for analytics

-- Note: Category Performance Summary View requires political_categories table
-- This view will be created separately when political_categories table exists

-- Daily Feedback Trends View
CREATE OR REPLACE VIEW daily_feedback_trends AS
SELECT 
    DATE(created_at) as feedback_date,
    COUNT(*) as total_feedback,
    COUNT(*) FILTER (WHERE feedback_type = 'accept') as accepts,
    COUNT(*) FILTER (WHERE feedback_type = 'reject') as rejects,
    COUNT(*) FILTER (WHERE feedback_type = 'maybe') as maybes,
    COUNT(*) FILTER (WHERE feedback_type = 'irrelevant') as irrelevant,
    AVG(user_rating) as avg_rating,
    COUNT(DISTINCT interaction_id) as unique_interactions
FROM category_feedback 
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY feedback_date DESC;

-- Session Activity Summary View
CREATE OR REPLACE VIEW session_activity_summary AS
SELECT 
    DATE(us.created_at) as session_date,
    COUNT(DISTINCT us.session_id) as unique_sessions,
    COUNT(ui.id) as total_interactions,
    AVG(us.total_interactions) as avg_interactions_per_session,
    AVG(ui.processing_time_ms) as avg_processing_time_ms
FROM user_sessions us
LEFT JOIN user_interactions ui ON us.session_id = ui.session_id
WHERE us.created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(us.created_at)
ORDER BY session_date DESC;
