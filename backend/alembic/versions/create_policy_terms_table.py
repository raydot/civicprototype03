"""create policy_terms table for Congress.gov taxonomy

Revision ID: create_policy_terms
Revises: openai_usage_001
Create Date: 2026-01-11 18:11:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'create_policy_terms'
down_revision: Union[str, None] = 'openai_usage_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create policy_terms table
    op.create_table(
        'policy_terms',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('term', sa.String(length=255), nullable=False),
        sa.Column('policy_area', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('keywords', sa.JSON(), nullable=True),
        sa.Column('embedding', sa.ARRAY(sa.Float), nullable=True),  # Store as float array instead of vector type
        sa.Column('success_count', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('total_usage_count', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('last_enriched', sa.Date(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('term', name='uq_policy_terms_term')
    )
    
    # Create indexes for common queries
    op.create_index('idx_policy_terms_policy_area', 'policy_terms', ['policy_area'])
    op.create_index('idx_policy_terms_active', 'policy_terms', ['is_active'])
    op.create_index('idx_policy_terms_term', 'policy_terms', ['term'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_policy_terms_term', 'policy_terms')
    op.drop_index('idx_policy_terms_active', 'policy_terms')
    op.drop_index('idx_policy_terms_policy_area', 'policy_terms')
    
    # Drop table
    op.drop_table('policy_terms')
