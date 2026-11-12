from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.department import Department
from app.schemas.department import DepartmentOut

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.get("/", response_model=list[DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    departments = db.query(Department).filter(Department.is_active == True).order_by(Department.name).all()
    return departments

