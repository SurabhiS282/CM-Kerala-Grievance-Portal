from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class DepartmentOut(BaseModel):
    id: UUID
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

