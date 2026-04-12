"""create initial tables

Revision ID: 0001
Revises: 
Create Date: 2026-04-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── workers ──────────────────────────────────────────────────────────────
    op.create_table(
        "workers",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(100), nullable=False, index=True),
        sa.Column(
            "role",
            sa.Enum("Potong", "Jahit", "Finishing", name="workerrole"),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum("Working", "Idle", name="workerstatus"),
            nullable=False,
            server_default="Idle",
        ),
        sa.Column("wagePerPiece", sa.Float(), nullable=False, server_default="0"),
        sa.Column("currentTask", sa.String(30), nullable=True),
        sa.Column("weeklyCompleted", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "date_joined",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )

    # ── orders ────────────────────────────────────────────────────────────────
    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("receiptNumber", sa.String(30), unique=True, nullable=False, index=True),
        sa.Column("customerName", sa.String(150), nullable=False),
        sa.Column("customerPhone", sa.String(20), nullable=True),
        sa.Column("garmentType", sa.String(100), nullable=False),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column("measurements", sa.JSON(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("received", "cutting", "sewing", "finishing", "done", name="orderstatus"),
            nullable=False,
            server_default="received",
        ),
        sa.Column(
            "paymentStatus",
            sa.Enum("paid", "unpaid", "partial", name="paymentstatus"),
            nullable=False,
            server_default="unpaid",
        ),
        sa.Column("totalPrice", sa.Float(), nullable=False, server_default="0"),
        sa.Column("paidAmount", sa.Float(), nullable=False, server_default="0"),
        sa.Column("deadline", sa.String(20), nullable=False),
        sa.Column("assignedTo", sa.String(100), nullable=True),
        sa.Column("notes", sa.String(500), nullable=True),
        sa.Column(
            "createdAt",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column("updatedAt", sa.DateTime(timezone=True), nullable=True),
    )

    # ── order_logs ────────────────────────────────────────────────────────────
    op.create_table(
        "order_logs",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("note", sa.String(300), nullable=True),
        sa.Column("employeeName", sa.String(100), nullable=True, server_default="Admin"),
        sa.Column(
            "createdAt",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )

    # ── business_profiles ─────────────────────────────────────────────────────
    op.create_table(
        "business_profiles",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(150), nullable=False, server_default=""),
        sa.Column("slogan", sa.String(300), nullable=True, server_default=""),
        sa.Column("address", sa.String(500), nullable=True, server_default=""),
        sa.Column("phone", sa.String(30), nullable=True, server_default=""),
        sa.Column("email", sa.String(150), nullable=True, server_default=""),
        sa.Column("hours", sa.String(200), nullable=True, server_default=""),
        sa.Column("instagram", sa.String(100), nullable=True, server_default=""),
        sa.Column("logo", sa.String(500), nullable=True),
    )

    # ── portfolio_items ───────────────────────────────────────────────────────
    op.create_table(
        "portfolio_items",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("image", sa.String(500), nullable=True),
        sa.Column("description", sa.String(1000), nullable=True, server_default=""),
        sa.Column(
            "createdAt",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )


def downgrade() -> None:
    op.drop_table("portfolio_items")
    op.drop_table("business_profiles")
    op.drop_table("order_logs")
    op.drop_table("orders")
    op.drop_table("workers")

    # Drop custom enum types (MySQL ignores these, but safe to include)
    op.execute("DROP TYPE IF EXISTS workerrole")
    op.execute("DROP TYPE IF EXISTS workerstatus")
    op.execute("DROP TYPE IF EXISTS orderstatus")
    op.execute("DROP TYPE IF EXISTS paymentstatus")
