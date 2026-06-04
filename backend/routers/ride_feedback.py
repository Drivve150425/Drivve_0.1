from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import RideSession, RideSessionRider, User, Ride
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/api/v1/ride-feedback", tags=["Ride Feedback"])

IST = timezone(timedelta(hours=5, minutes=30))


@router.get("/ride/{ride_id}/unrated-riders")
def get_unrated_riders(ride_id: int, driver_phone: str, db: Session = Depends(get_db)):
    """Get list of riders that driver hasn't rated yet"""
    session = db.query(RideSession).filter(
        RideSession.ride_id == ride_id,
        RideSession.driver_phone == driver_phone,
        RideSession.status == "completed"
    ).order_by(RideSession.id.desc()).first()
    
    if not session:
        return {"riders": []}
    
    unrated_riders = []
    for rider in session.riders:
        if rider.driver_rating is None and rider.status == "completed":
            unrated_riders.append({
                "booking_id": rider.booking_id,
                "rider_name": rider.rider_name,
                "rider_phone": rider.rider_phone,
                "rider_photo": rider.rider_photo,
                "session_id": session.id
            })
    
    return {"riders": unrated_riders, "session_id": session.id}


@router.get("/booking/{booking_id}/can-rate-driver")
def can_rate_driver(booking_id: int, rider_phone: str, db: Session = Depends(get_db)):
    """Check if rider can rate the driver"""
    rider = db.query(RideSessionRider).filter(
        RideSessionRider.booking_id == booking_id,
        RideSessionRider.rider_phone == rider_phone
    ).first()
    
    if not rider:
        return {"can_rate": False, "message": "Booking not found"}
    
    can_rate = rider.rider_rating is None and rider.status == "completed"
    
    return {
        "can_rate": can_rate,
        "session_id": rider.session_id,
        "booking_id": booking_id
    }


@router.get("/ride/{ride_id}/ratings-summary")
def get_ride_ratings_summary(ride_id: int, db: Session = Depends(get_db)):
    """Get ratings summary for a completed ride"""
    session = db.query(RideSession).filter(
        RideSession.ride_id == ride_id,
        RideSession.status == "completed"
    ).order_by(RideSession.id.desc()).first()
    
    if not session:
        return {"ratings": []}
    
    ratings = []
    for rider in session.riders:
        ratings.append({
            "rider_name": rider.rider_name,
            "rider_rating_given": rider.rider_rating is not None,
            "rider_rating": rider.rider_rating,
            "driver_rating_given": rider.driver_rating is not None,
            "driver_rating": rider.driver_rating
        })
    
    return {"ratings": ratings, "total_riders": len(session.riders)}