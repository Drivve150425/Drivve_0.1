from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Ride, RideBooking, UserNotification, NotificationType
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, Dict

router = APIRouter()

class CreateRideRequest(BaseModel):
    phone_number: str
    origin: str
    destination: str
    departure_time: datetime
    available_seats: int
    price_per_seat: float

    distance_km: Optional[float] = None
    duration_text: Optional[str] = None
    total_estimated_price: Optional[float] = None
    preferences: Optional[Dict] = None


@router.post("/post-ride")
def post_ride(data: CreateRideRequest, db: Session = Depends(get_db)):
    ride = Ride(
        phone_number=data.phone_number,
        origin=data.origin,
        destination=data.destination,
        departure_time=data.departure_time,
        available_seats=data.available_seats,
        price_per_seat=data.price_per_seat,
        distance_km=data.distance_km,
        duration_text=data.duration_text,
        total_estimated_price=data.total_estimated_price,
        preferences=data.preferences,
        status="active"
    )

    db.add(ride)
    db.commit()
    db.refresh(ride)

    # Create notification for ride posted
    try:
        # Normalize phone number
        phone_number = data.phone_number
        if not phone_number.startswith("+"):
            phone_number = f"+{phone_number}"

        # Extract short location names (first part before comma)
        origin_short = data.origin.split(",")[0].strip() if data.origin else "start"
        dest_short = data.destination.split(",")[0].strip() if data.destination else "destination"

        notification = UserNotification(
            phone_number=phone_number,
            title="Ride Posted! 🚗",
            message=f"Your ride from {origin_short} to {dest_short} has been posted. You'll be notified when passengers book!",
            type=NotificationType.RIDE,
            action_type="ride",
            action_value=str(ride.id),
            is_read=False,
            is_deleted=False
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        print(f"✅ Ride posted notification created for {phone_number}, notification_id: {notification.id}")
    except Exception as e:
        print(f"❌ Error creating ride posted notification: {str(e)}")
        # Don't fail the ride posting if notification fails

    return {
        "message": "Ride posted successfully",
        "ride_id": ride.id
    }

@router.get("/my-rides/{phone_number}")
def get_my_rides(phone_number: str, db: Session = Depends(get_db)):

    # 1️⃣ Rides user posted (Driver)
    posted_rides = db.query(Ride)\
        .filter(Ride.phone_number == phone_number)\
        .order_by(Ride.departure_time.desc())\
        .all()

    # 2️⃣ Rides user requested (Passenger)
    requested_bookings = db.query(RideBooking)\
        .filter(RideBooking.passenger_phone == phone_number)\
        .order_by(RideBooking.created_at.desc())\
        .all()

    return {
        "posted_rides": posted_rides,
        "requested_rides": requested_bookings
    }

@router.put("/booking/{booking_id}/accept")
def accept_booking(booking_id: int, db: Session = Depends(get_db)):

    booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status != "pending":
        raise HTTPException(status_code=400, detail="Already processed")

    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()

    if ride.available_seats < booking.seats_requested:
        raise HTTPException(status_code=400, detail="Not enough seats available")

    # 🔒 Reduce seats
    ride.available_seats -= booking.seats_requested
    booking.status = "accepted"

    # If no seats left mark full
    if ride.available_seats == 0:
        ride.status = "full"

    db.commit()

    print(f"Send notification to passenger {booking.passenger_phone}")

    return {"message": "Booking accepted"}

@router.put("/ride/{ride_id}/cancel")
def cancel_ride(ride_id: int, db: Session = Depends(get_db)):

    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    ride.status = "cancelled"

    # Cancel all accepted bookings
    bookings = db.query(RideBooking).filter(
        RideBooking.ride_id == ride_id,
        RideBooking.status == "accepted"
    ).all()

    for booking in bookings:
        booking.status = "cancelled"
        print(f"Notify passenger {booking.passenger_phone}")

    db.commit()

    return {"message": "Ride cancelled successfully"}

@router.put("/booking/{booking_id}/cancel")
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):

    booking = db.query(RideBooking).filter(
        RideBooking.id == booking_id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    ride = db.query(Ride).filter(
        Ride.id == booking.ride_id
    ).first()

    # Refund seats if accepted
    if booking.status == "accepted":
        ride.available_seats += booking.seats_requested

        if ride.status == "full":
            ride.status = "active"

    booking.status = "cancelled"

    db.commit()

    return {"message": "Booking cancelled and seats refunded"}
