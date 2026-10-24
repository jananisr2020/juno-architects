"""Add owner-scoped professional review requests."""
from alembic import op
import sqlalchemy as sa

revision = "0002_review_requests"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "professional_review_requests",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("project_id", sa.String(length=36), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("owner_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("note", sa.Text(), nullable=False, server_default=""),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="requested"),
        sa.Column("reviewer_note", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_professional_review_requests_project_id", "professional_review_requests", ["project_id"])
    op.create_index("ix_professional_review_requests_owner_id", "professional_review_requests", ["owner_id"])


def downgrade() -> None:
    op.drop_index("ix_professional_review_requests_owner_id", table_name="professional_review_requests")
    op.drop_index("ix_professional_review_requests_project_id", table_name="professional_review_requests")
    op.drop_table("professional_review_requests")
