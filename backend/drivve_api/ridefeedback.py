from typing import Optional
from pydantic import BaseModel, Field
from models import Ride, RideBooking, RideFeedback, User
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException

from fastapi import APIRouter

router = APIRouter()
class RideFeedbackRequest(BaseModel):
    ride_booking_id: int
    phone_number: str
    rating: int = Field(..., ge=1, le=5)
    reason: str | None = None
    comment: str | None = None
@router.post("/api/v1/ride-feedback")
def submit_ride_feedback(
    data: RideFeedbackRequest,
    db: Session = Depends(get_db)
):
    try:
        booking = db.query(RideBooking).filter(
            RideBooking.id == data.ride_booking_id
        ).first()

        if not booking:
            raise HTTPException(404, "Ride booking not found")

        user = db.query(User).filter(
            User.phone_number == data.phone_number
        ).first()

        if not user:
            raise HTTPException(404, "User not found")

        # 🚫 prevent duplicate
        existing = db.query(RideFeedback).filter(
            RideFeedback.ride_booking_id == data.ride_booking_id,
            RideFeedback.feedback_by_user_id == user.id
        ).first()

        if existing:
            raise HTTPException(400, "Feedback already submitted")

        # 👇 SAFE RECEIVER LOGIC
        if booking.passenger_id == user.id:
            ride = db.query(Ride).filter(
                Ride.id == booking.ride_id
            ).first()

            if not ride:
                raise HTTPException(404, "Ride not found")

            if not ride.driver_id:
                raise HTTPException(400, "Driver not assigned")

            feedback_for_user_id = ride.driver_id

        else:
            feedback_for_user_id = booking.passenger_id

        feedback = RideFeedback(
            ride_booking_id=data.ride_booking_id,
            feedback_by_user_id=user.id,
            feedback_for_user_id=feedback_for_user_id,
            rating=data.rating,
            reason=data.reason,
            comment=data.comment,
        )

        db.add(feedback)
        db.commit()
        db.refresh(feedback)

        return {
            "success": True,
            "message": "Ride feedback submitted",
            "feedback_id": feedback.id
        }

    except HTTPException:
        raise

    except Exception as e:
        print("❌ Ride feedback error:", str(e))
        raise HTTPException(500, "Failed to submit feedback")