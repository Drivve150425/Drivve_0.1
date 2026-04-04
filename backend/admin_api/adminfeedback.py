from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from models import  UserFeedback
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from drivve_api.app_config import create_app
app = create_app()

class UserFeedbackCreate(BaseModel):
    phone_number: str = Field(..., max_length=20)
    rating: int = Field(..., ge=1, le=5)
    reason: Optional[str] = None
class UserFeedbackOut(BaseModel):
    id: int
    phone_number: str
    rating: int
    reason: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True
@app.get("/api/v1/admin/feedback", response_model=List[UserFeedbackOut])
def get_feedback(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    feedback = (
        db.query(UserFeedback)
        .order_by(UserFeedback.created_at.desc())
        .limit(limit)
        .all()
    )

    return feedback  # ✅ MUST RETURN A LIST
