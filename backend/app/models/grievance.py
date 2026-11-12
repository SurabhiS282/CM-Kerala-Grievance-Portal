import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Text, Float, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Grievance(Base):
    __tablename__ = "grievances"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    reference_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    citizen_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    subject: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="Submitted")
    priority: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # AI suggestions (separate from official assignment)
    ai_department_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Official assignment
    assigned_department_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("departments.id"), nullable=True)

    # Timeline
    due_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Citizen feedback
    feedback_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    feedback_comments: Mapped[str | None] = mapped_column(Text, nullable=True)
    feedback_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    citizen = relationship("User", back_populates="grievances", foreign_keys=[citizen_id])
    ai_department = relationship("Department", foreign_keys=[ai_department_id])
    assigned_department = relationship("Department", foreign_keys=[assigned_department_id])
    history = relationship("GrievanceHistory", back_populates="grievance", order_by="GrievanceHistory.created_at")
    assignments = relationship("DepartmentAssignment", back_populates="grievance")
    attachments = relationship("Attachment", back_populates="grievance")


class GrievanceHistory(Base):
    __tablename__ = "grievance_history"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    grievance_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("grievances.id"), nullable=False)
    previous_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    new_status: Mapped[str] = mapped_column(String(20), nullable=False)
    changed_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    grievance = relationship("Grievance", back_populates="history")
    user = relationship("User")

