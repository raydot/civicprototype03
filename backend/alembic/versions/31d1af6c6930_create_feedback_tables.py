"""create feedback tables

Revision ID: 31d1af6c6930
Revises: 
Create Date: 2025-10-01 16:52:26.988305

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '31d1af6c6930'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create user_sessions table
    op.create_table(
        'user_sessions',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('first_seen', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('last_seen', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('interaction_count', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('session_metadata', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_user_sessions_last_seen', 'user_sessions', ['last_seen'])
    
    # Create user_interactions table
    op.create_table(
        'user_interactions',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('session_id', sa.String(length=64), nullable=False),
        sa.Column('interaction_type', sa.String(length=50), nullable=False),
        sa.Column('user_input', sa.Text(), nullable=True),
        sa.Column('interaction_metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['session_id'], ['user_sessions.id'], ondelete='CASCADE')
    )
    op.create_index('idx_user_interactions_session', 'user_interactions', ['session_id'])
    op.create_index('idx_user_interactions_created', 'user_interactions', ['created_at'])
    op.create_index('idx_user_interactions_type', 'user_interactions', ['interaction_type'])
    
    # Create category_feedback table
    op.create_table(
        'category_feedback',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('interaction_id', sa.String(length=64), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('category_name', sa.String(length=200), nullable=False),
        sa.Column('feedback_type', sa.String(length=20), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('user_rating', sa.Integer(), nullable=True),
        sa.Column('feedback_reason', sa.Text(), nullable=True),
        sa.Column('overall_satisfaction', sa.Integer(), nullable=True),
        sa.Column('additional_comments', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['interaction_id'], ['user_interactions.id'], ondelete='CASCADE')
    )
    op.create_index('idx_category_feedback_interaction', 'category_feedback', ['interaction_id'])
    op.create_index('idx_category_feedback_category', 'category_feedback', ['category_id'])
    op.create_index('idx_category_feedback_type', 'category_feedback', ['feedback_type'])
    op.create_index('idx_category_feedback_created', 'category_feedback', ['created_at'])
    
    # Create learning_metrics table
    op.create_table(
        'learning_metrics',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('metric_type', sa.String(length=50), nullable=False),
        sa.Column('metric_value', sa.Float(), nullable=False),
        sa.Column('sample_size', sa.Integer(), nullable=False, server_default=sa.text('1')),
        sa.Column('time_period', sa.String(length=20), nullable=False, server_default=sa.text("'daily'")),
        sa.Column('calculated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_learning_metrics_category', 'learning_metrics', ['category_id'])
    op.create_index('idx_learning_metrics_type', 'learning_metrics', ['metric_type'])
    op.create_index('idx_learning_metrics_calculated', 'learning_metrics', ['calculated_at'])
    
    # Create daily_feedback_trends view
    op.execute("""
        CREATE VIEW daily_feedback_trends AS
        SELECT 
            DATE(cf.created_at) as feedback_date,
            cf.category_id,
            cf.category_name,
            COUNT(*) as total_feedback,
            COUNT(*) FILTER (WHERE cf.feedback_type = 'accept') as accepts,
            COUNT(*) FILTER (WHERE cf.feedback_type = 'reject') as rejects,
            COUNT(*) FILTER (WHERE cf.feedback_type = 'maybe') as maybes,
            AVG(cf.confidence_score) as avg_confidence,
            AVG(cf.user_rating) as avg_rating
        FROM category_feedback cf
        GROUP BY DATE(cf.created_at), cf.category_id, cf.category_name
        ORDER BY feedback_date DESC, total_feedback DESC
    """)
    
    # Create session_activity_summary view
    op.execute("""
        CREATE VIEW session_activity_summary AS
        SELECT 
            us.id as session_id,
            us.first_seen,
            us.last_seen,
            us.interaction_count,
            COUNT(DISTINCT ui.id) as total_interactions,
            COUNT(DISTINCT cf.id) as total_feedback,
            AVG(cf.user_rating) as avg_rating
        FROM user_sessions us
        LEFT JOIN user_interactions ui ON us.id = ui.session_id
        LEFT JOIN category_feedback cf ON ui.id = cf.interaction_id
        GROUP BY us.id, us.first_seen, us.last_seen, us.interaction_count
        ORDER BY us.last_seen DESC
    """)


def downgrade() -> None:
    # Drop views first
    op.execute('DROP VIEW IF EXISTS session_activity_summary')
    op.execute('DROP VIEW IF EXISTS daily_feedback_trends')
    
    # Drop tables in reverse order (respecting foreign keys)
    op.drop_index('idx_learning_metrics_calculated', 'learning_metrics')
    op.drop_index('idx_learning_metrics_type', 'learning_metrics')
    op.drop_index('idx_learning_metrics_category', 'learning_metrics')
    op.drop_table('learning_metrics')
    
    op.drop_index('idx_category_feedback_created', 'category_feedback')
    op.drop_index('idx_category_feedback_type', 'category_feedback')
    op.drop_index('idx_category_feedback_category', 'category_feedback')
    op.drop_index('idx_category_feedback_interaction', 'category_feedback')
    op.drop_table('category_feedback')
    
    op.drop_index('idx_user_interactions_type', 'user_interactions')
    op.drop_index('idx_user_interactions_created', 'user_interactions')
    op.drop_index('idx_user_interactions_session', 'user_interactions')
    op.drop_table('user_interactions')
    
    op.drop_index('idx_user_sessions_last_seen', 'user_sessions')
    op.drop_table('user_sessions')
