from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from routers.ride import emit_to_user
from database import get_db
from models import ModificationRequest, RideBooking, Ride, User, UserNotification
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/api/v1/modifications", tags=["Modifications"])

IST = timezone(timedelta(hours=5, minutes=30))


class ModificationRequestSchema(BaseModel):
    requested_seats: int

@router.post("/request/{booking_id}")
def request_modification(
    booking_id: int,
    request: ModificationRequestSchema,
    db: Session = Depends(get_db)
):
    """Request to modify seat count for a booking"""
    # Use row lock for booking and ride
    booking = db.query(RideBooking).filter(RideBooking.id == booking_id).with_for_update().first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    ride = db.query(Ride).filter(Ride.id == booking.ride_id).with_for_update().first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    if ride.started_at:
        raise HTTPException(status_code=400, detail="Cannot modify seats - Ride has already started")
    
    if ride.cancellation_reason:
        raise HTTPException(status_code=400, detail="Cannot modify seats - Ride has been cancelled")
    
    if booking.status != "accepted":
        raise HTTPException(status_code=400, detail="Cannot modify seats - Booking is not confirmed yet")
    
    # Check for existing pending modification request
    existing = db.query(ModificationRequest).filter(
        ModificationRequest.booking_id == booking_id,
        ModificationRequest.status == "pending"
    ).with_for_update().first()
    
    if existing:
        # Update existing request instead of creating new one
        existing.requested_seats = request.requested_seats
        existing.updated_at = datetime.now(timezone.utc)
        db.commit()
        
        # Notify driver about updated request
        emit_to_user(ride.phone_number, "modification-updated", {
            "booking_id": booking_id,
            "current_seats": existing.current_seats,
            "requested_seats": request.requested_seats,
            "message": f"Rider updated modification request: {existing.current_seats} → {request.requested_seats} seats"
        })
        
        return {
            "success": True,
            "message": "Modification request updated",
            "request_id": existing.id,
            "requested_seats": request.requested_seats,
            "is_update": True
        }
    
    # Check available seats
    total_booked = db.query(func.sum(RideBooking.seats_booked)).filter(
        RideBooking.ride_id == ride.id,
        RideBooking.status == "accepted"
    ).scalar() or 0
    
    other_booked = total_booked - booking.seats_booked
    available_seats = ride.available_seats - other_booked
    
    if request.requested_seats > available_seats:
        raise HTTPException(status_code=400, detail=f"Only {available_seats} seat(s) available")
    
    if request.requested_seats < 1:
        raise HTTPException(status_code=400, detail="Minimum 1 seat required")
    
    # Check if there's a pending booking request that might conflict
    pending_booking = db.query(RideBooking).filter(
        RideBooking.ride_id == ride.id,
        RideBooking.status == "pending",
        RideBooking.id != booking_id
    ).first()
    
    mod_request = ModificationRequest(
        booking_id=booking_id,
        ride_id=ride.id,
        passenger_phone=booking.passenger_phone,
        current_seats=booking.seats_booked,
        requested_seats=request.requested_seats,
        status="pending",
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(mod_request)
    db.commit()
    db.refresh(mod_request)
    
    # Notify driver about new modification request
    passenger = db.query(User).filter(User.phone_number == booking.passenger_phone).first()
    passenger_name = passenger.full_name if passenger else "Rider"
    
    emit_to_user(ride.phone_number, "new-modification-request", {
        "request_id": mod_request.id,
        "booking_id": booking_id,
        "passenger_name": passenger_name,
        "passenger_phone": booking.passenger_phone,
        "current_seats": booking.seats_booked,
        "requested_seats": request.requested_seats,
        "ride_id": ride.id,
        "has_conflicting_booking": pending_booking is not None
    })
    
    return {
        "success": True,
        "message": "Modification request sent to driver",
        "request_id": mod_request.id,
        "requested_seats": request.requested_seats
    }


@router.get("/booking/{booking_id}/pending")
def get_pending_modification(booking_id: int, db: Session = Depends(get_db)):
    """Get pending modification request for a booking"""
    pending = db.query(ModificationRequest).filter(
        ModificationRequest.booking_id == booking_id,
        ModificationRequest.status == "pending"
    ).first()
    
    if pending:
        return {
            "has_pending": True,
            "request_id": pending.id,
            "current_seats": pending.current_seats,
            "requested_seats": pending.requested_seats,
            "created_at": pending.created_at.isoformat()
        }
    
    return {"has_pending": False}


@router.get("/ride/{ride_id}/pending")
def get_ride_pending_modifications(ride_id: int, db: Session = Depends(get_db)):
    """Get all pending modifications for a ride"""
    pending = db.query(ModificationRequest).filter(
        ModificationRequest.ride_id == ride_id,
        ModificationRequest.status == "pending"
    ).order_by(ModificationRequest.created_at.desc()).all()
    
    results = []
    for req in pending:
        booking = db.query(RideBooking).filter(RideBooking.id == req.booking_id).first()
        passenger = db.query(User).filter(User.phone_number == req.passenger_phone).first()
        
        results.append({
            "id": req.id,
            "booking_id": req.booking_id,
            "passenger_name": passenger.full_name if passenger else "Passenger",
            "passenger_phone": req.passenger_phone,
            "current_seats": req.current_seats,
            "requested_seats": req.requested_seats,
            "created_at": req.created_at.isoformat()
        })
    
    return {"requests": results, "count": len(results)}


@router.put("/{request_id}/approve")
def approve_modification(request_id: int, db: Session = Depends(get_db)):
    """Approve a modification request"""
    mod_request = db.query(ModificationRequest).filter(ModificationRequest.id == request_id).first()
    
    if not mod_request:
        raise HTTPException(status_code=404, detail="Modification request not found")
    
    if mod_request.status != "pending":
        raise HTTPException(status_code=400, detail=f"Request already {mod_request.status}")
    
    booking = db.query(RideBooking).filter(RideBooking.id == mod_request.booking_id).first()
    ride = db.query(Ride).filter(Ride.id == mod_request.ride_id).first()
    
    if ride.started_at:
        mod_request.status = "rejected"
        mod_request.rejection_reason = "Cannot modify - Ride has already started"
        db.commit()
        raise HTTPException(status_code=400, detail="Cannot approve - Ride has already started")
    
    total_booked = db.query(func.sum(RideBooking.seats_booked)).filter(
        RideBooking.ride_id == ride.id,
        RideBooking.status == "accepted"
    ).scalar() or 0
    
    other_booked = total_booked - booking.seats_booked
    available_seats = ride.available_seats - other_booked
    
    if mod_request.requested_seats > available_seats:
        mod_request.status = "rejected"
        mod_request.rejection_reason = "Not enough seats available"
        db.commit()
        raise HTTPException(status_code=400, detail=f"Only {available_seats} seat(s) available")
    
    old_seats = booking.seats_booked
    booking.seats_booked = mod_request.requested_seats
    booking.total_amount = ride.price_per_seat * mod_request.requested_seats
    
    mod_request.status = "approved"
    mod_request.approved_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {
        "success": True,
        "message": "Modification request approved",
        "booking_id": booking.id,
        "old_seats": old_seats,
        "new_seats": mod_request.requested_seats
    }


@router.put("/{request_id}/reject")
def reject_modification(request_id: int, rejection_reason: str = "Driver declined", db: Session = Depends(get_db)):
    """Reject a modification request"""
    mod_request = db.query(ModificationRequest).filter(ModificationRequest.id == request_id).first()
    
    if not mod_request:
        raise HTTPException(status_code=404, detail="Modification request not found")
    
    if mod_request.status != "pending":
        raise HTTPException(status_code=400, detail=f"Request already {mod_request.status}")
    
    mod_request.status = "rejected"
    mod_request.rejection_reason = rejection_reason
    mod_request.rejected_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {"success": True, "message": "Modification request rejected"}


@router.delete("/booking/{booking_id}/cancel")
def cancel_modification(booking_id: int, db: Session = Depends(get_db)):
    """Cancel a pending modification request"""
    mod_request = db.query(ModificationRequest).filter(
        ModificationRequest.booking_id == booking_id,
        ModificationRequest.status == "pending"
    ).first()
    
    if not mod_request:
        raise HTTPException(status_code=404, detail="No pending modification request found")
    
    mod_request.status = "cancelled"
    mod_request.cancelled_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {"success": True, "message": "Modification request cancelled"}