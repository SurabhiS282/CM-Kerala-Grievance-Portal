from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    mobile_number: str
    password: str
    confirm_password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: UUID
    full_name: str
    email: str
    mobile_number: Optional[str] = None
    role: str
    department_id: Optional[UUID] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

