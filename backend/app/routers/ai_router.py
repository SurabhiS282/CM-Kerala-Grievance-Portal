from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.grievance import Grievance
from app.models.department import Department
from app.schemas.grievance import AIAnalysisRequest, AIAnalysisResult
from app.services.auth_service import require_role
from app.services.ai_service import analyze_grievance
import uuid

router = APIRouter(prefix="/ai", tags=["AI Analysis"])


@router.post("/analyze", response_model=AIAnalysisResult)
async def analyze(
    data: AIAnalysisRequest,
    current_user: User = Depends(require_role("cmo_admin")),
):
    result = await analyze_grievance(data.subject, data.description)
    return result


@router.post("/analyze/{grievance_id}/retry", response_model=AIAnalysisResult)
async def retry_analysis(
    grievance_id: uuid.UUID,
    current_user: User = Depends(require_role("cmo_admin")),
    db: Session = Depends(get_db),
):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    result = await analyze_grievance(grievance.subject, grievance.description)

    if not result.error:
        # Update AI fields
        if result.department:
            dept = db.query(Department).filter(
                Department.name.ilike(f"%{result.department.replace(' Department', '').strip()}%")
            ).first()
            if dept:
                grievance.ai_department_id = dept.id

        grievance.ai_summary = result.summary
        grievance.ai_reason = result.reason
        grievance.ai_confidence = result.confidence
        if result.priority:
            grievance.priority = result.priority
        db.commit()

    return result
