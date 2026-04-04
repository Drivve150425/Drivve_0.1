from pydantic import BaseModel, Field

from models import AboutUs, UserFeedback
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

from fastapi import APIRouter

router = APIRouter()
class FeedbackRequest(BaseModel):
    phone_number: str
    rating: int = Field(..., ge=1, le=5)
    reason: str | None = None

@router.post("/api/v1/feedback")
def submit_feedback(data: FeedbackRequest, db: Session = Depends(get_db)):
    feedback = UserFeedback(
        phone_number=data.phone_number,
        rating=data.rating,
        reason=data.reason
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return {
        "success": True,
        "message": "Feedback submitted successfully",
        "feedback_id": feedback.id
    }