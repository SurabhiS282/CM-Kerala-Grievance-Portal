import uuid
import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.grievance import Grievance, GrievanceHistory
from app.models.assignment import DepartmentAssignment
from app.models.attachment import Attachment
from app.schemas.grievance import (
    AssignmentOut, AssignmentDetail, OfficerUpdate, OfficerReport,
    GrievanceOut, AttachmentOut,
)
from app.services.auth_service import require_role
from app.config import settings

router = APIRouter(prefix="/officer", tags=["Officer Dashboard"])

ALLOWED_FILE_TYPES = {"image/jpeg", "image/png", "image/jpg", "application/pdf",
                       "application/msword",
                       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
MAX_FILE_SIZE = 5 * 1024 * 1024


@router.get("/assignments")
def get_my_assignments(
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db),
):
    assignments = (
        db.query(DepartmentAssignment)
        .filter(DepartmentAssignment.officer_id == current_user.id)
        .order_by(DepartmentAssignment.assigned_at.desc())
        .all()
    )

    result = []
    for a in assignments:
        g = a.grievance
        result.append({
            "id": str(a.id),
            "grievance_id": str(a.grievance_id),
            "reference_number": g.reference_number if g else None,
            "subject": g.subject if g else None,
            "description": g.description if g else None,
            "status": g.status if g else None,
            "priority": g.priority if g else None,
            "district": g.district if g else None,
            "category": g.category if g else None,
            "department_id": str(a.department_id),
            "department_name": a.department.name if a.department else None,
            "assignment_remarks": a.assignment_remarks,
            "investigation_remarks": a.investigation_remarks,
            "action_taken": a.action_taken,
            "resolution_details": a.resolution_details,
            "cmo_review_status": a.cmo_review_status,
            "cmo_remarks": a.cmo_remarks,
            "assigned_at": a.assigned_at.isoformat() if a.assigned_at else None,
            "submitted_at": a.submitted_at.isoformat() if a.submitted_at else None,
            "reviewed_at": a.reviewed_at.isoformat() if a.reviewed_at else None,
            "is_active": a.is_active,
            "citizen_name": g.citizen.full_name if g and g.citizen else None,
            "created_at": g.created_at.isoformat() if g and g.created_at else None,
            "attachments": [
                {
                    "id": str(att.id),
                    "file_name": att.file_name,
                    "file_type": att.file_type,
                    "file_size": att.file_size,
                    "uploaded_at": att.uploaded_at.isoformat() if att.uploaded_at else None,
                }
                for att in g.attachments
            ] if g else [],
        })
    return result


@router.get("/assignments/{assignment_id}")
def get_assignment_detail(
    assignment_id: uuid.UUID,
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db),
):
    assignment = db.query(DepartmentAssignment).filter(
        DepartmentAssignment.id == assignment_id,
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if assignment.officer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    g = assignment.grievance
    return {
        "id": str(assignment.id),
        "grievance_id": str(assignment.grievance_id),
        "reference_number": g.reference_number,
        "subject": g.subject,
        "description": g.description,
        "status": g.status,
        "priority": g.priority,
        "district": g.district,
        "category": g.category,
        "citizen_name": g.citizen.full_name if g.citizen else None,
        "citizen_email": g.citizen.email if g.citizen else None,
        "department_name": assignment.department.name if assignment.department else None,
        "assignment_remarks": assignment.assignment_remarks,
        "investigation_remarks": assignment.investigation_remarks,
        "action_taken": assignment.action_taken,
        "resolution_details": assignment.resolution_details,
        "cmo_review_status": assignment.cmo_review_status,
        "cmo_remarks": assignment.cmo_remarks,
        "assigned_at": assignment.assigned_at.isoformat() if assignment.assigned_at else None,
        "submitted_at": assignment.submitted_at.isoformat() if assignment.submitted_at else None,
        "reviewed_at": assignment.reviewed_at.isoformat() if assignment.reviewed_at else None,
        "is_active": assignment.is_active,
        "attachments": [
            {
                "id": str(att.id),
                "file_name": att.file_name,
                "file_type": att.file_type,
                "file_size": att.file_size,
            }
            for att in g.attachments
        ],
    }


@router.post("/assignments/{assignment_id}/update")
def update_assignment(
    assignment_id: uuid.UUID,
    data: OfficerUpdate,
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db),
):
    assignment = db.query(DepartmentAssignment).filter(
        DepartmentAssignment.id == assignment_id,
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if assignment.officer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if data.investigation_remarks:
        assignment.investigation_remarks = data.investigation_remarks
    if data.action_taken:
        assignment.action_taken = data.action_taken

    # Update grievance status to In Progress
    grievance = assignment.grievance
    if grievance.status in ["Submitted", "Under Review"]:
        prev_status = grievance.status
        grievance.status = "In Progress"
        history = GrievanceHistory(
            grievance_id=grievance.id,
            previous_status=prev_status,
            new_status="In Progress",
            changed_by=current_user.id,
            remarks=f"Investigation update by officer: {data.investigation_remarks or data.action_taken or ''}".strip(),
        )
        db.add(history)

    db.commit()
    return {"message": "Assignment updated successfully"}


@router.post("/assignments/{assignment_id}/submit-report")
async def submit_report(
    assignment_id: uuid.UUID,
    resolution_details: str = Form(...),
    action_taken: str = Form(None),
    file: UploadFile | None = File(None),
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db),
):
    assignment = db.query(DepartmentAssignment).filter(
        DepartmentAssignment.id == assignment_id,
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if assignment.officer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    assignment.resolution_details = resolution_details
    if action_taken:
        assignment.action_taken = action_taken
    assignment.submitted_at = datetime.now(timezone.utc)
    assignment.cmo_review_status = "pending"

    # Handle file upload
    if file:
        if file.content_type not in ALLOWED_FILE_TYPES:
            raise HTTPException(status_code=400, detail="File type not allowed")

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")

        upload_dir = os.path.join(settings.UPLOAD_DIR, str(assignment.grievance_id))
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(content)

        attachment = Attachment(
            grievance_id=assignment.grievance_id,
            assignment_id=assignment.id,
            uploaded_by=current_user.id,
            file_name=file.filename,
            file_path=file_path,
            file_type=file.content_type,
            file_size=len(content),
        )
        db.add(attachment)

    # Record history
    grievance = assignment.grievance
    history = GrievanceHistory(
        grievance_id=grievance.id,
        previous_status=grievance.status,
        new_status=grievance.status,
        changed_by=current_user.id,
        remarks=f"Action-taken report submitted by officer for CMO review",
    )
    db.add(history)
    db.commit()
    return {"message": "Report submitted for CMO review"}


@router.get("/dashboard/stats")
def get_officer_stats(
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db),
):
    assignments = db.query(DepartmentAssignment).filter(
        DepartmentAssignment.officer_id == current_user.id
    ).all()

    total = len(assignments)
    pending = sum(1 for a in assignments if a.grievance and a.grievance.status in ["Submitted", "Under Review"] and a.is_active)
    in_progress = sum(1 for a in assignments if a.grievance and a.grievance.status == "In Progress" and a.is_active)
    reports_submitted = sum(1 for a in assignments if a.submitted_at is not None)

    return {
        "total": total,
        "pending": pending,
        "in_progress": in_progress,
        "reports_submitted": reports_submitted,
    }

