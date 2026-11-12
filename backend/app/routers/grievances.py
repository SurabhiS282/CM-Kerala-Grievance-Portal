import uuid
import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.grievance import Grievance, GrievanceHistory
from app.models.department import Department
from app.models.attachment import Attachment
from app.schemas.grievance import (
    GrievanceOut, GrievanceDetail, GrievanceTrack, HistoryOut,
    FeedbackCreate, AttachmentOut, AssignmentOut,
)
from app.services.auth_service import get_current_user, require_role
from app.services.ai_service import analyze_grievance
from app.config import settings
import asyncio

router = APIRouter(prefix="/grievances", tags=["Grievances"])

ALLOWED_FILE_TYPES = {"image/jpeg", "image/png", "image/jpg", "application/pdf",
                       "application/msword",
                       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def generate_reference_number():
    year = datetime.now().year
    random_part = uuid.uuid4().hex[:6].upper()
    return f"GRV-{year}-{random_part}"


def build_grievance_detail(grievance: Grievance, db: Session, is_public: bool = False) -> dict:
    """Build a detailed grievance response dict."""
    data = {
        "id": grievance.id,
        "reference_number": grievance.reference_number,
        "citizen_id": grievance.citizen_id,
        "district": grievance.district,
        "category": grievance.category,
        "subject": grievance.subject,
        "description": grievance.description,
        "status": grievance.status,
        "priority": grievance.priority,
        "ai_department_id": grievance.ai_department_id,
        "assigned_department_id": grievance.assigned_department_id,
        "ai_summary": grievance.ai_summary if not is_public else None,
        "ai_reason": grievance.ai_reason if not is_public else None,
        "ai_confidence": grievance.ai_confidence if not is_public else None,
        "due_at": grievance.due_at,
        "feedback_rating": grievance.feedback_rating,
        "feedback_comments": grievance.feedback_comments,
        "feedback_at": grievance.feedback_at,
        "created_at": grievance.created_at,
        "updated_at": grievance.updated_at,
        "citizen_name": grievance.citizen.full_name if grievance.citizen else None,
        "citizen_email": grievance.citizen.email if grievance.citizen else None,
        "citizen_mobile": grievance.citizen.mobile_number if grievance.citizen else None,
        "ai_department_name": grievance.ai_department.name if grievance.ai_department else None,
        "assigned_department_name": grievance.assigned_department.name if grievance.assigned_department else None,
        "attachments": [
            AttachmentOut.model_validate(a) for a in grievance.attachments
        ],
        "assignments": [
            AssignmentOut(
                id=a.id,
                grievance_id=a.grievance_id,
                department_id=a.department_id,
                department_name=a.department.name if a.department else None,
                officer_id=a.officer_id,
                officer_name=a.officer.full_name if a.officer else None,
                assigned_by=a.assigned_by,
                assignment_remarks=a.assignment_remarks if not is_public else None,
                investigation_remarks=a.investigation_remarks,
                action_taken=a.action_taken,
                resolution_details=a.resolution_details,
                cmo_review_status=a.cmo_review_status,
                cmo_remarks=a.cmo_remarks if not is_public else None,
                assigned_at=a.assigned_at,
                submitted_at=a.submitted_at,
                reviewed_at=a.reviewed_at,
                is_active=a.is_active,
            )
            for a in grievance.assignments
        ],
    }
    return data


@router.post("/", response_model=GrievanceOut, status_code=201)
async def create_grievance(
    district: str = Form(...),
    category: str = Form(...),
    subject: str = Form(...),
    description: str = Form(...),
    file: UploadFile | None = File(None),
    current_user: User = Depends(require_role("citizen")),
    db: Session = Depends(get_db),
):
    # Generate unique reference number
    ref = generate_reference_number()
    while db.query(Grievance).filter(Grievance.reference_number == ref).first():
        ref = generate_reference_number()

    grievance = Grievance(
        reference_number=ref,
        citizen_id=current_user.id,
        district=district,
        category=category,
        subject=subject,
        description=description,
        status="Submitted",
        due_at=datetime.now(timezone.utc) + timedelta(days=15),
    )
    db.add(grievance)
    db.flush()  # Get the ID

    # Record initial history
    history = GrievanceHistory(
        grievance_id=grievance.id,
        previous_status=None,
        new_status="Submitted",
        changed_by=current_user.id,
        remarks="Grievance submitted by citizen",
    )
    db.add(history)

    # Handle file upload
    if file:
        if file.content_type not in ALLOWED_FILE_TYPES:
            raise HTTPException(status_code=400, detail="File type not allowed. Allowed: JPG, PNG, PDF, DOC, DOCX")

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")

        # Save file
        upload_dir = os.path.join(settings.UPLOAD_DIR, str(grievance.id))
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(content)

        attachment = Attachment(
            grievance_id=grievance.id,
            uploaded_by=current_user.id,
            file_name=file.filename,
            file_path=file_path,
            file_type=file.content_type,
            file_size=len(content),
        )
        db.add(attachment)

    db.commit()
    db.refresh(grievance)

    # Trigger AI analysis (don't fail submission if AI fails)
    try:
        ai_result = await analyze_grievance(subject, description)
        if not ai_result.error:
            # Find matching department
            if ai_result.department:
                dept = db.query(Department).filter(
                    Department.name.ilike(f"%{ai_result.department.replace(' Department', '').strip()}%")
                ).first()
                if dept:
                    grievance.ai_department_id = dept.id

            grievance.ai_summary = ai_result.summary
            grievance.ai_reason = ai_result.reason
            grievance.ai_confidence = ai_result.confidence
            if ai_result.priority:
                grievance.priority = ai_result.priority
            db.commit()
            db.refresh(grievance)
    except Exception:
        pass  # AI failure should never block submission

    return grievance


@router.get("/my", response_model=list[GrievanceOut])
def get_my_grievances(
    current_user: User = Depends(require_role("citizen")),
    db: Session = Depends(get_db),
):
    grievances = (
        db.query(Grievance)
        .filter(Grievance.citizen_id == current_user.id)
        .order_by(Grievance.created_at.desc())
        .all()
    )
    return grievances


@router.get("/track/{reference_number}", response_model=GrievanceTrack)
def track_grievance(reference_number: str, db: Session = Depends(get_db)):
    grievance = db.query(Grievance).filter(Grievance.reference_number == reference_number).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    # Build public-safe history (filter out internal CMO-only remarks)
    history = []
    for h in grievance.history:
        history.append(HistoryOut(
            id=h.id,
            previous_status=h.previous_status,
            new_status=h.new_status,
            changed_by_name=h.user.full_name if h.user else None,
            remarks=h.remarks if h.remarks and "internal" not in (h.remarks or "").lower() else None,
            created_at=h.created_at,
        ))

    return GrievanceTrack(
        reference_number=grievance.reference_number,
        status=grievance.status,
        district=grievance.district,
        category=grievance.category,
        subject=grievance.subject,
        assigned_department_name=grievance.assigned_department.name if grievance.assigned_department else None,
        priority=grievance.priority,
        created_at=grievance.created_at,
        updated_at=grievance.updated_at,
        history=history,
    )


@router.get("/{grievance_id}", response_model=GrievanceDetail)
def get_grievance(
    grievance_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    # Enforce ownership/access
    if current_user.role == "citizen" and grievance.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if current_user.role == "officer":
        # Officers can only see grievances assigned to them
        from app.models.assignment import DepartmentAssignment
        assignment = db.query(DepartmentAssignment).filter(
            DepartmentAssignment.grievance_id == grievance_id,
            DepartmentAssignment.officer_id == current_user.id,
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Access denied")

    is_public = current_user.role == "citizen"
    return build_grievance_detail(grievance, db, is_public=is_public)


@router.get("/{grievance_id}/history", response_model=list[HistoryOut])
def get_grievance_history(
    grievance_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    # Enforce ownership
    if current_user.role == "citizen" and grievance.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    history = []
    for h in grievance.history:
        remarks = h.remarks
        # Hide internal remarks from citizens
        if current_user.role == "citizen" and remarks and "internal" in remarks.lower():
            remarks = None
        history.append(HistoryOut(
            id=h.id,
            previous_status=h.previous_status,
            new_status=h.new_status,
            changed_by_name=h.user.full_name if h.user else None,
            remarks=remarks,
            created_at=h.created_at,
        ))
    return history


@router.post("/{grievance_id}/feedback")
def submit_feedback(
    grievance_id: uuid.UUID,
    data: FeedbackCreate,
    current_user: User = Depends(require_role("citizen")),
    db: Session = Depends(get_db),
):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    if grievance.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if grievance.status != "Resolved":
        raise HTTPException(status_code=400, detail="Feedback can only be submitted for resolved grievances")

    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    grievance.feedback_rating = data.rating
    grievance.feedback_comments = data.comments
    grievance.feedback_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Feedback submitted successfully"}


@router.post("/{grievance_id}/reopen")
def reopen_grievance(
    grievance_id: uuid.UUID,
    current_user: User = Depends(require_role("citizen")),
    db: Session = Depends(get_db),
):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    if grievance.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if grievance.status != "Resolved":
        raise HTTPException(status_code=400, detail="Only resolved grievances can be reopened")

    prev_status = grievance.status
    grievance.status = "Reopened"
    grievance.feedback_rating = None
    grievance.feedback_comments = None
    grievance.feedback_at = None

    history = GrievanceHistory(
        grievance_id=grievance.id,
        previous_status=prev_status,
        new_status="Reopened",
        changed_by=current_user.id,
        remarks="Grievance reopened by citizen",
    )
    db.add(history)
    db.commit()
    return {"message": "Grievance reopened successfully"}

