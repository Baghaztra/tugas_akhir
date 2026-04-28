"""Add assigned worker to order_items

Revision ID: e3450a4007f6
Revises: 5aac38218baf
Create Date: 2026-04-26 14:18:05.909732

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'e3450a4007f6'
down_revision: Union[str, None] = '5aac38218baf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('order_items', sa.Column('assigned_worker_id', sa.Integer(), nullable=True))
    op.add_column('order_items', sa.Column('assigned_worker_name', sa.String(length=100), nullable=True))
    op.create_foreign_key(None, 'order_items', 'workers', ['assigned_worker_id'], ['id'])

def downgrade() -> None:
    op.drop_constraint(None, 'order_items', type_='foreignkey')
    op.drop_column('order_items', 'assigned_worker_name')
    op.drop_column('order_items', 'assigned_worker_id')
