from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.contact import ContactEnquiry
from app.schemas.contact import ContactCreate

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def submit_enquiry(data: ContactCreate, db: Session = Depends(get_db)):
    enquiry = ContactEnquiry(
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
    )
    db.add(enquiry)
    db.commit()
    return {"message": "Your enquiry has been submitted successfully"}

