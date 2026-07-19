"""rename paidAmount to dpAmount

Revision ID: c1d2e3f4a5b6
Revises: bb17b627fbb6
Create Date: 2026-07-19 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4a5b6'
down_revision: Union[str, None] = 'bb17b627fbb6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ponytail: dpAmount column may already exist from a previous failed migration attempt
    # Copy paidAmount → dpAmount, then drop paidAmount
    op.execute('UPDATE orders SET `dpAmount` = `paidAmount`')
    op.drop_column('orders', 'paidAmount')


def downgrade() -> None:
    op.add_column('orders', sa.Column('paidAmount', sa.Float(), server_default='0'))
    op.execute('UPDATE orders SET `paidAmount` = `dpAmount`')
