"""add category_id to user_interactions

Revision ID: add_category_id_001
Revises: add_original_query
Create Date: 2026-01-19

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_category_id_001'
down_revision = 'add_original_query'
branch_labels = None
depends_on = None


def upgrade():
    # Add category_id column to user_interactions
    op.add_column('user_interactions', 
        sa.Column('category_id', sa.Integer(), nullable=True)
    )
    
    # Add feedback_type column to user_interactions
    op.add_column('user_interactions',
        sa.Column('feedback_type', sa.String(20), nullable=True)
    )
    
    # Add processing_time_ms column to user_interactions
    op.add_column('user_interactions',
        sa.Column('processing_time_ms', sa.Integer(), nullable=True)
    )
    
    # Create index on category_id for faster lookups
    op.create_index('idx_user_interactions_category', 'user_interactions', ['category_id'])
    
    # Create index on feedback_type
    op.create_index('idx_user_interactions_feedback_type', 'user_interactions', ['feedback_type'])


def downgrade():
    op.drop_index('idx_user_interactions_feedback_type', 'user_interactions')
    op.drop_index('idx_user_interactions_category', 'user_interactions')
    op.drop_column('user_interactions', 'processing_time_ms')
    op.drop_column('user_interactions', 'feedback_type')
    op.drop_column('user_interactions', 'category_id')
