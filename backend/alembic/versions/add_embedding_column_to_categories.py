"""add embedding column to political_categories

Revision ID: add_embedding_column
Revises: educational_resources_001
Create Date: 2026-03-06 17:24:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_embedding_column'
down_revision: Union[str, None] = 'educational_resources_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add embedding column to political_categories table
    # Using ARRAY type for PostgreSQL to store 1536-dimensional vectors
    op.add_column(
        'political_categories',
        sa.Column('embedding', postgresql.ARRAY(sa.Float), nullable=True)
    )
    
    # Create index on embedding column for faster similarity searches (optional)
    # Note: For production, consider using pgvector extension for better performance
    # op.execute('CREATE INDEX idx_political_categories_embedding ON political_categories USING gin(embedding)')


def downgrade() -> None:
    # Remove embedding column
    op.drop_column('political_categories', 'embedding')
