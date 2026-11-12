import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.grievance import Grievance, GrievanceHistory
from app.models.department import Department
from app.models.assignment import DepartmentAssignment
from app.schemas.grievance import (
    GrievanceOut, GrievanceDetail, DashboardStats, AssignGrievance,
    StatusUpdate, CMOReview, EscalateRequest, AssignmentOut, AttachmentOut, HistoryOut,
)
from app.services.auth_service import require_role

router = APIRouter(prefix="/cmo", tags=["CMO Dashboard"])


def build_detail(grievance, is_public=False):
    """Build grievance detail dict for CMO view."""
    return GrievanceDetail(
        id=grievance.id,
        reference_number=grievance.reference_number,
        citizen_id=grievance.citizen_id,
        district=grievance.district,
        category=grievance.category,
        subject=grievance.subject,
        description=grievance.description,
        status=grievance.status,
        priority=grievance.priority,
        ai_department_id=grievance.ai_department_id,
        assigned_department_id=grievance.assigned_department_id,
        ai_summary=grievance.ai_summary,
        ai_reason=grievance.ai_reason,
        ai_confidence=grievance.ai_confidence,
        due_at=grievance.due_at,
        feedback_rating=grievance.feedback_rating,
        feedback_comments=grievance.feedback_comments,
        feedback_at=grievance.feedback_at,
        created_at=grievance.created_at,
        updated_at=grievance.updated_at,
        citizen_name=grievance.citizen.full_name if grievance.citizen else None,
        citizen_email=grievance.citizen.email if grievance.citizen else None,
        citizen_mobile=grievance.citizen.mobile_number if grievance.citizen else None,
        ai_department_name=grievance.ai_department.name if grievance.ai_department else None,
        assigned_department_name=grievance.assigned_department.name if grievance.assigned_department else None,
        attachments=[AttachmentOut.model_validate(a) for a in grievance.attachments],
        assignments=[
            AssignmentOut(
                id=a.id,
                grievance_id=a.grievance_id,
                department_id=a.department_id,
                department_name=a.department.name if a.department else None,
                officer_id=a.officer_id,
                officer_name=a.officer.full_name if a.officer else None,
                assigned_by=a.assigned_by,
                assignment_remarks=a.assignment_remarks,
                investigation_remarks=a.investigation_remarks,
                action_taken=a.action_taken,
                resolution_details=a.resolution_details,
                cmo_review_status=a.cmo_review_status,
                cmo_remarks=a.cmo_remarks,
                assigned_at=a.assigned_at,
                submitted_at=a.submitted_at,
                reviewed_at=a.reviewed_at,
                is_active=a.is_active,
            )
            for a in grievance.assignments
        ],
    )


@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(require_role("cmo_admin")),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)

    total = db.query(func.count(Grievance.id)).scalar()
    pending = db.query(func.count(Grievance.id)).filter(
        Grievance.status.in_(["Submitted", "Under Review"])
    ).scalar()
    in_progress = db.query(func.count(Grievance.id)).filter(Grievance.status == "In Progress").scalar()
    resolved = db.query(func.count(Grievance.id)).filter(Grievance.status == "Resolved").scalar()
    reopened = db.query(func.count(Grievance.id)).filter(Grievance.status == "Reopened").scalar()
    overdue = db.query(func.count(Grievance.id)).filter(
        Grievance.due_at < now,
        Grievance.status.notin_(["Resolved"]),
    ).scalar()

    # District-wise stats
    district_wise = (
        db.query(Grievance.district, func.count(Grievance.id))
        .group_by(Grievance.district)
        .all()
    )

    # Category-wise stats
    category_wise = (
        db.query(Grievance.category, func.count(Grievance.id))
        .group_by(Grievance.category)
        .all()
    )

    # Department-wise stats
    department_wise = (
        db.query(Department.name, func.count(Grievance.id))
        .join(Grievance, Grievance.assigned_department_id == Department.id)
        .group_by(Department.name)
        .all()
    )

    # Recent grievances
    recent = (
        db.query(Grievance)
        .order_by(Grievance.created_at.desc())
        .limit(10)
        .all()
    )

    return DashboardStats(
        total=total or 0,
        pending=pending or 0,
        in_progress=in_progress or 0,
        resolved=resolved or 0,
        reopened=reopened or 0,
        overdue=overdue or 0,
        district_wise=[{"district": d, "count": c} for d, c in district_wise],
        category_wise=[{"category": c, "count": cnt} for c, cnt in category_wise],
        department_wise=[{"department": d, "count": c} for d, c in department_wise],
        recent=[
            {
                "id": str(g.id),
                "reference_number": g.reference_number,
                "subject": g.subject,
                "status": g.status,
                "priority": g.priority,
                "district": g.district,
                "created_at": g.created_at.isoformat() if g.created_at else None,
            }
            for g in recent
        ],
    )


@router.get("/grievances", response_model=list[GrievanceOut])
def list_all_grievances(
    status: str | None = Query(None),
    district: str | None = Query(None),
    category: str | None = Query(None),
    priority: str | None = Query(None),
    search: str | None = Query(None),
    current_user: User = Depends(require_role("cmo_admin")),
    db: Session = Depends(get_db),
):
    query = db.query(Grievance)

    if status:
        query = query.filter(Grievance.status == status)
    if district:
        query = query.filter(Grievance.district == district)
    if category:
        query = query.filter(Grievance.category == category)
    if priority:
        query = query.filter(Grievance.priority == priority)
    if search:
        query = query.filter(
            (Grievance.reference_number.ilike(f"%{search}%")) |
            (Grievance.subject.ilike(f"%{search}%"))
        )

    grievances = query.order_by(Grievance.created_at.desc()).all()
    return grievances


@router.get("/grievances/{grievance_id}", response_model=GrievanceDetail)
def get_grievance_detail(
    grievance_id: uuid.UUID,
    current_user: User = Depends(require_role("cmo_admin")),
    db: Session = Depends(get_db),
):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")
    return build_detail(grievance)


@router.post("/grievances/{grievance_id}/assign")
def assign_grievance(
    grievance_id: uuid.UUID,
    data: AssignGrievance,
    current_user: User = Depends(require_role("cmo_admin")),
    db: Session = Depends(get_db),
):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    # Verify department and officer exist
    department = db.query(Department).filter(Department.id == data.department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    officer = db.query(User).filter(
        User.id == data.officer_id,
        User.role == "officer",
    ).first()
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")

    # Deactivate previous active assignments
    db.query(DepartmentAssignment).filter(
        DepartmentAssignment.grievance_id == grievance_id,
        DepartmentAssignment.is_active == True,
    ).update({"is_active": False})

    # Create new assignment
    assignment = DepartmentAssignment(
        grievance_id=grievance.id,
        department_id=data.department_id,
        officer_id=data.officer_id,
        assigned_by=current_user.id,
        assignment_remarks=data.remarks,
        is_active=True,
    )
    db.add(assignment)

    # Update grievance
    prev_status = grievance.status
    grievance.assigned_department_id = data.department_id
    grievance.status = "Under Review"

    # Record history
    history = GrievanceHistory(
        grievance_id=grievance.id,
        previous_status=prev_status,
        new_status="Under Review",
        changed_by=current_user.id,
        remarks=f"Assigned to {department.name} - {officer.full_name}. {data.remarks or ''}".strip(),
    )
    db.add(history)
    db.commit()

    return {"message": "Grievance assigned successfully"}


@router.post("/grievances/{grievance_id}/status")
def update_grievance_status(
    grievance_id: uuid.UUID,
    data: StatusUpdate,
    current_user: User = Depends(require_role("cmo_admin")),
    db: Session = Depends(get_db),
):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    valid_statuses = ["Submitted", "Under Review", "In Progress", "Resolved", "Reopened"]
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    prev_status = grievance.status
    grievance.status = data.status

    history = GrievanceHistory(
        grievance_id=grievance.id,
        previous_status=prev_status,
        new_status=data.status,
        changed_by=current_user.id,
        remarks=data.remarks,
    )
    db.add(history)
    db.commit()
    return {"message": f"Status updated to {data.status}"}


@router.post("/grievances/{grievance_id}/review-report")
def review_report(
    grievance_id: uuid.UUID,
    data: CMOReview,
    current_user: User = Depends(require_role("cmo_admin")),
    db: Session = Depends(get_db),
):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    # Find active assignment
    assignment = db.query(DepartmentAssignment).filter(
        DepartmentAssignment.grievance_id == grievance_id,
        DepartmentAssignment.is_active == True,
    ).first()
    if not assignment:
        raise HTTPException(status_code=400, detail="No active assignment found")

    if data.decision not in ["approved", "rejected", "further_action"]:
        raise HTTPException(status_code=400, detail="Decision must be: approved, rejected, or further_action")

    assignment.cmo_review_status = data.decision
    assignment.cmo_remarks = data.remarks
    assignment.reviewed_by = current_user.id
    assignment.reviewed_at = datetime.now(timezone.utc)

    prev_status = grievance.status

    if data.decision == "approved":
        grievance.status = "Resolved"
        new_status = "Resolved"
        remark = f"Resolution approved by CMO. {data.remarks or ''}"
    elif data.decision == "further_action":
        new_status = "In Progress"
        remark = f"CMO requested further action. {data.remarks or ''}"
    else:
        new_status = "In Progress"
        remark = f"Resolution rejected by CMO. {data.remarks or ''}"

    grievance.status = new_status

    history = GrievanceHistory(
        grievance_id=grievance.id,
        previous_status=prev_status,
        new_status=new_status,
        changed_by=current_user.id,
        remarks=remark.strip(),
    )
    db.add(history)
    db.commit()
    return {"message": f"Report review completed: {data.decision}"}


@router.post("/grievances/{grievance_id}/escalate")
def escalate_grievance(
    grievance_id: uuid.UUID,
    data: EscalateRequest,
    current_user: User = Depends(require_role("cmo_admin")),
    db: Session = Depends(get_db),
):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    grievance.priority = "High"

    history = GrievanceHistory(
        grievance_id=grievance.id,
        previous_status=grievance.status,
        new_status=grievance.status,
        changed_by=current_user.id,
        remarks=f"Grievance escalated to High priority. {data.remarks or ''}".strip(),
    )
    db.add(history)
    db.commit()
    return {"message": "Grievance escalated successfully"}


@router.get("/officers", response_model=list[dict])
def list_officers(
    department_id: uuid.UUID | None = Query(None),
    current_user: User = Depends(require_role("cmo_admin")),
    db: Session = Depends(get_db),
):
    """List officers, optionally filtered by department."""
    query = db.query(User).filter(User.role == "officer", User.is_active == True)
    if department_id:
        query = query.filter(User.department_id == department_id)
    officers = query.all()
    return [
        {"id": str(o.id), "full_name": o.full_name, "email": o.email, "department_id": str(o.department_id) if o.department_id else None}
        for o in officers
    ]

