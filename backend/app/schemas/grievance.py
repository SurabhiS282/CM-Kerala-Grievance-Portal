from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List


# --- Grievance Schemas ---

class GrievanceCreate(BaseModel):
    district: str
    category: str
    subject: str
    description: str


class GrievanceOut(BaseModel):
    id: UUID
    reference_number: str
    citizen_id: UUID
    district: str
    category: str
    subject: str
    description: str
    status: str
    priority: Optional[str] = None
    ai_department_id: Optional[UUID] = None
    assigned_department_id: Optional[UUID] = None
    ai_summary: Optional[str] = None
    ai_reason: Optional[str] = None
    ai_confidence: Optional[float] = None
    due_at: Optional[datetime] = None
    feedback_rating: Optional[int] = None
    feedback_comments: Optional[str] = None
    feedback_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GrievanceDetail(GrievanceOut):
    citizen_name: Optional[str] = None
    citizen_email: Optional[str] = None
    citizen_mobile: Optional[str] = None
    ai_department_name: Optional[str] = None
    assigned_department_name: Optional[str] = None
    attachments: List["AttachmentOut"] = []
    assignments: List["AssignmentOut"] = []


class GrievanceTrack(BaseModel):
    reference_number: str
    status: str
    district: str
    category: str
    subject: str
    assigned_department_name: Optional[str] = None
    priority: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    history: List["HistoryOut"] = []


# --- History Schemas ---

class HistoryOut(BaseModel):
    id: UUID
    previous_status: Optional[str] = None
    new_status: str
    changed_by_name: Optional[str] = None
    remarks: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Assignment Schemas ---

class AssignGrievance(BaseModel):
    department_id: UUID
    officer_id: UUID
    remarks: Optional[str] = None


class AssignmentOut(BaseModel):
    id: UUID
    grievance_id: UUID
    department_id: UUID
    department_name: Optional[str] = None
    officer_id: UUID
    officer_name: Optional[str] = None
    assigned_by: UUID
    assignment_remarks: Optional[str] = None
    investigation_remarks: Optional[str] = None
    action_taken: Optional[str] = None
    resolution_details: Optional[str] = None
    cmo_review_status: Optional[str] = None
    cmo_remarks: Optional[str] = None
    assigned_at: datetime
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True


class AssignmentDetail(AssignmentOut):
    grievance: Optional[GrievanceOut] = None
    attachments: List["AttachmentOut"] = []


class OfficerUpdate(BaseModel):
    investigation_remarks: Optional[str] = None
    action_taken: Optional[str] = None


class OfficerReport(BaseModel):
    resolution_details: str
    action_taken: Optional[str] = None


class CMOReview(BaseModel):
    decision: str  # approved, rejected, further_action
    remarks: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None


class FeedbackCreate(BaseModel):
    rating: int  # 1-5
    comments: Optional[str] = None


class EscalateRequest(BaseModel):
    remarks: Optional[str] = None


# --- Attachment Schemas ---

class AttachmentOut(BaseModel):
    id: UUID
    file_name: str
    file_type: str
    file_size: int
    uploaded_at: datetime

    class Config:
        from_attributes = True


# --- AI Schemas ---

class AIAnalysisRequest(BaseModel):
    subject: str
    description: str


class AIAnalysisResult(BaseModel):
    department: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    summary: Optional[str] = None
    reason: Optional[str] = None
    confidence: Optional[float] = None
    error: Optional[str] = None


# --- Dashboard Schemas ---

class DashboardStats(BaseModel):
    total: int = 0
    pending: int = 0
    in_progress: int = 0
    resolved: int = 0
    reopened: int = 0
    overdue: int = 0
    district_wise: list = []
    category_wise: list = []
    department_wise: list = []
    recent: list = []

