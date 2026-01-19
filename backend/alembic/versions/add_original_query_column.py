"""add original_query column to user_interactions

Revision ID: add_original_query
Revises: pattern_learning_001
Create Date: 2026-01-18

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_original_query'
down_revision = 'pattern_learning_001'
branch_labels = None
depends_on = None


def upgrade():
    # Add original_query column to user_interactions table
    op.add_column(
        'user_interactions',
        sa.Column('original_query', sa.Text(), nullable=True)
    )


def downgrade():
    # Remove original_query column
    op.drop_column('user_interactions', 'original_query')
