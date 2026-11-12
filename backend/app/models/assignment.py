import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class DepartmentAssignment(Base):
    __tablename__ = "department_assignments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    grievance_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("grievances.id"), nullable=False)
    department_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("departments.id"), nullable=False)
    officer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    assigned_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)

    assignment_remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    investigation_remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    action_taken: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolution_details: Mapped[str | None] = mapped_column(Text, nullable=True)

    cmo_review_status: Mapped[str | None] = mapped_column(String(20), nullable=True)  # pending, approved, rejected, further_action
    cmo_remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    assigned_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    grievance = relationship("Grievance", back_populates="assignments")
    department = relationship("Department")
    officer = relationship("User", foreign_keys=[officer_id])
    assigner = relationship("User", foreign_keys=[assigned_by])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    attachments = relationship("Attachment", back_populates="assignment")

