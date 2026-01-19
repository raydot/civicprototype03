"""add pattern learning tables

Revision ID: pattern_learning_001
Revises: create_policy_terms_table
Create Date: 2026-01-18

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'pattern_learning_001'
down_revision = 'create_policy_terms'
branch_labels = None
depends_on = None


def upgrade():
    # Create term_co_occurrences table
    # Tracks which terms users accept together in the same session
    op.create_table(
        'term_co_occurrences',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('term_id_1', sa.Integer(), nullable=False),
        sa.Column('term_id_2', sa.Integer(), nullable=False),
        sa.Column('co_occurrence_count', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('last_occurred_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['term_id_1'], ['policy_terms.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['term_id_2'], ['policy_terms.id'], ondelete='CASCADE')
    )
    
    # Create unique constraint to prevent duplicate pairs
    op.create_index(
        'idx_term_co_occurrences_unique',
        'term_co_occurrences',
        ['term_id_1', 'term_id_2'],
        unique=True
    )
    
    # Create index for fast lookups
    op.create_index(
        'idx_term_co_occurrences_term1',
        'term_co_occurrences',
        ['term_id_1']
    )
    
    op.create_index(
        'idx_term_co_occurrences_term2',
        'term_co_occurrences',
        ['term_id_2']
    )
    
    # Create rejection_patterns table
    # Tracks which terms get rejected for which query patterns
    op.create_table(
        'rejection_patterns',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('term_id', sa.Integer(), nullable=False),
        sa.Column('query_pattern', sa.String(500), nullable=False),
        sa.Column('rejection_count', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('last_rejected_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['term_id'], ['policy_terms.id'], ondelete='CASCADE')
    )
    
    # Create index for fast lookups by term
    op.create_index(
        'idx_rejection_patterns_term',
        'rejection_patterns',
        ['term_id']
    )
    
    # Create index for query pattern searches
    op.create_index(
        'idx_rejection_patterns_query',
        'rejection_patterns',
        ['query_pattern']
    )
    
    # Create feedback_adjustments table
    # Tracks algorithmic adjustments to similarity scores based on feedback
    op.create_table(
        'feedback_adjustments',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('term_id', sa.Integer(), nullable=False),
        sa.Column('adjustment_factor', sa.Float(), nullable=False, server_default='1.0'),
        sa.Column('positive_feedback_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('negative_feedback_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['term_id'], ['policy_terms.id'], ondelete='CASCADE')
    )
    
    # Create unique index on term_id
    op.create_index(
        'idx_feedback_adjustments_term',
        'feedback_adjustments',
        ['term_id'],
        unique=True
    )


def downgrade():
    op.drop_index('idx_feedback_adjustments_term', 'feedback_adjustments')
    op.drop_table('feedback_adjustments')
    
    op.drop_index('idx_rejection_patterns_query', 'rejection_patterns')
    op.drop_index('idx_rejection_patterns_term', 'rejection_patterns')
    op.drop_table('rejection_patterns')
    
    op.drop_index('idx_term_co_occurrences_term2', 'term_co_occurrences')
    op.drop_index('idx_term_co_occurrences_term1', 'term_co_occurrences')
    op.drop_index('idx_term_co_occurrences_unique', 'term_co_occurrences')
    op.drop_table('term_co_occurrences')
