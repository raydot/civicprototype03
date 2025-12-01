"""create openai usage tracking

Revision ID: openai_usage_001
Revises: 
Create Date: 2025-11-30

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'openai_usage_001'
down_revision = 'f76cbde70f0b'  # Points to create_political_categories_table
branch_labels = None
depends_on = None


def upgrade():
    # Create openai_usage table for tracking API calls and costs
    op.create_table(
        'openai_usage',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('model', sa.String(100), nullable=False),
        sa.Column('operation', sa.String(50), nullable=False),  # 'embedding', 'chat', 'completion'
        sa.Column('endpoint', sa.String(200), nullable=True),  # Which API endpoint triggered this
        sa.Column('prompt_tokens', sa.Integer(), nullable=True),
        sa.Column('completion_tokens', sa.Integer(), nullable=True),
        sa.Column('total_tokens', sa.Integer(), nullable=False),
        sa.Column('estimated_cost_usd', sa.Numeric(10, 6), nullable=False),
        sa.Column('user_session', sa.String(100), nullable=True),
        sa.Column('request_id', sa.String(100), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for common queries
    op.create_index('idx_openai_usage_timestamp', 'openai_usage', ['timestamp'])
    op.create_index('idx_openai_usage_model', 'openai_usage', ['model'])
    op.create_index('idx_openai_usage_operation', 'openai_usage', ['operation'])
    op.create_index('idx_openai_usage_endpoint', 'openai_usage', ['endpoint'])
    
    # Create cost summary view for quick analytics
    op.execute("""
        CREATE VIEW openai_cost_summary AS
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
    """)


def downgrade():
    op.execute("DROP VIEW IF EXISTS openai_cost_summary")
    op.drop_index('idx_openai_usage_endpoint', table_name='openai_usage')
    op.drop_index('idx_openai_usage_operation', table_name='openai_usage')
    op.drop_index('idx_openai_usage_model', table_name='openai_usage')
    op.drop_index('idx_openai_usage_timestamp', table_name='openai_usage')
    op.drop_table('openai_usage')
