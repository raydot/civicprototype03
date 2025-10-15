"""create political categories table

Revision ID: f76cbde70f0b
Revises: 31d1af6c6930
Create Date: 2025-10-01 17:19:11.589605

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f76cbde70f0b'
down_revision: Union[str, None] = '31d1af6c6930'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create political_categories table
    op.create_table(
        'political_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('keywords', sa.JSON(), nullable=True),
        sa.Column('success_count', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('total_usage_count', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('terminology_source', sa.String(length=100), nullable=True),
        sa.Column('terminology_sections', sa.JSON(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for common queries
    op.create_index('idx_political_categories_name', 'political_categories', ['name'])
    op.create_index('idx_political_categories_type', 'political_categories', ['type'])
    op.create_index('idx_political_categories_active', 'political_categories', ['is_active'])
    op.create_index('idx_political_categories_created', 'political_categories', ['created_at'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_political_categories_created', 'political_categories')
    op.drop_index('idx_political_categories_active', 'political_categories')
    op.drop_index('idx_political_categories_type', 'political_categories')
    op.drop_index('idx_political_categories_name', 'political_categories')
    
    # Drop table
    op.drop_table('political_categories')
