"""create educational resources table

Revision ID: educational_resources_001
Revises: add_category_id_001
Create Date: 2026-01-19 15:35:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'educational_resources_001'
down_revision = 'add_category_id_001'
branch_labels = None
depends_on = None


def upgrade():
    # Create educational_resources table
    op.execute("""
        CREATE TABLE IF NOT EXISTS educational_resources (
            id SERIAL PRIMARY KEY,
            category_id INTEGER NOT NULL REFERENCES political_categories(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            source VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL CHECK (type IN ('article', 'video', 'podcast', 'lesson')),
            duration VARCHAR(50),
            description TEXT,
            url TEXT NOT NULL,
            display_order INTEGER NOT NULL DEFAULT 0,
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            created_by VARCHAR(255),
            updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            updated_by VARCHAR(255)
        );
    """)
    
    # Create indexes
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_educational_resources_category 
        ON educational_resources(category_id);
    """)
    
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_educational_resources_active 
        ON educational_resources(is_active);
    """)
    
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_educational_resources_order 
        ON educational_resources(category_id, display_order);
    """)


def downgrade():
    op.drop_table('educational_resources')
