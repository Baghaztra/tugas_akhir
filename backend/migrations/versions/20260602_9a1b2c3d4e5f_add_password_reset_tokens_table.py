"""add_password_reset_tokens_table

Revision ID: 9a1b2c3d4e5f
Revises: 8b2143cecc5f
Create Date: 2026-06-02 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9a1b2c3d4e5f'
down_revision: Union[str, None] = '8b2143cecc5f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('password_reset_tokens',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('otp_code', sa.String(length=6), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_password_reset_tokens_id'), 'password_reset_tokens', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_password_reset_tokens_id'), table_name='password_reset_tokens')
    op.drop_table('password_reset_tokens')
