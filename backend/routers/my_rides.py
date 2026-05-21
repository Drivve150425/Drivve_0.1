
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import Ride, RideBooking, User
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timezone
from typing import Optional
from database import get_db
from models import Ride, User, Vehicle
import math

router = APIRouter()

def normalize_phone(phone: str) -> str:
    phone = phone.replace(" ", "").replace("-", "")
    if phone.startswith("+91"):
        return phone
    if phone.startswith("91") and len(phone) == 12:
        return f"+{phone}"
    if phone.startswith("+"):
        return phone
    return f"+91{phone}"

@router.get("/my-rides/{phone}")
async def get_my_rides(phone: str, db: Session = Depends(get_db)):
    norm_phone = normalize_phone(phone)
    
    # Posted rides
    posted_rides = db.query(Ride).filter(
        Ride.phone_number == norm_phone
    ).order_by(
        Ride.departure_time.desc()
    ).all()
    
    # Rider bookings with passenger JOIN (for Posted tab)
    bookings_raw = db.execute(text("""
        SELECT 
            rb.id, rb.ride_id, rb.passenger_phone, rb.seats_booked as seats_requested, rb.status,
            rb.created_at, u.full_name as passenger_name, u.profile_picture as passenger_photo
        FROM ride_bookings rb 
        LEFT JOIN users u ON u.phone_number = rb.passenger_phone
        WHERE rb.driver_phone = :phone OR rb.ride_id IN (
            SELECT id FROM rides WHERE phone_number = :phone
        )
        ORDER BY rb.created_at DESC
    """), {"phone": norm_phone}).mappings().all()
    
    bookings_map = {}
    for bk in bookings_raw:
        ride_id = bk["ride_id"]
        if ride_id not in bookings_map:
            bookings_map[ride_id] = []
        bookings_map[ride_id].append({
            "id": bk["id"],
            "ride_id": ride_id,
            "passenger_phone": bk["passenger_phone"],
            "passenger_name": bk["passenger_name"],
            "passenger_photo": bk["passenger_photo"],
            "seats_requested": bk["seats_requested"],
            "status": bk["status"],
            "created_at": bk["created_at"].isoformat() if bk["created_at"] else None,
        })
    
    # Format posted rides with bookings
    posted_formatted = []
    for ride in posted_rides:
        posted_formatted.append({
            "id": ride.id,
            "phone_number": ride.phone_number,
            "origin": ride.origin,
            "destination": ride.destination,
            "departure_time": ride.departure_time.isoformat() if ride.departure_time else None,
            "available_seats": ride.available_seats,
            "price_per_seat": ride.price_per_seat,
            "preferences": ride.preferences,
            "status": ride.status,
            "bookings": bookings_map.get(ride.id, []),
        })
    
    # My bookings (requested rides as passenger)
    requested_raw = db.query(RideBooking, Ride, User).outerjoin(
        Ride, RideBooking.ride_id == Ride.id
    ).outerjoin(
        User, User.phone_number == Ride.phone_number
    ).filter(
        RideBooking.passenger_phone == norm_phone
    ).order_by(
        RideBooking.created_at.desc()
    ).all()
    
    requested_formatted = []
    for booking, ride, driver in requested_raw:
        driver_name = driver.full_name if driver else f"Driver {ride.phone_number[-4:] if ride else 'Unknown'}"
        requested_formatted.append({
            "id": booking.id,
            "ride_id": booking.ride_id,
            "passenger_phone": booking.passenger_phone,
            "seats_requested": booking.seats_booked,
            "status": booking.status,
            "created_at": booking.created_at.isoformat() if booking.created_at else None,
            "origin": ride.origin if ride else None,
            "destination": ride.destination if ride else None,
            "departure_time": ride.departure_time.isoformat() if ride else None,
            "driver_name": driver_name,
            "driver_phone": ride.phone_number if ride else None,
        })
    
    return {
        "posted_rides": posted_formatted,
        "requested_rides": requested_formatted
    }



@router.get("/api/v1/rides/search")
async def search_rides(
    from_lat: float = Query(..., description="Pickup latitude"),
    from_lng: float = Query(..., description="Pickup longitude"),
    to_lat: float = Query(..., description="Drop latitude"),
    to_lng: float = Query(..., description="Drop longitude"),
    date: str = Query(..., description="Travel date YYYY-MM-DD"),
    seats: int = Query(1, ge=1, description="Number of seats needed"),
    db: Session = Depends(get_db)
):
    """
    Search for available rides
    """
    try:
        # Parse date
        travel_date = datetime.strptime(date, "%Y-%m-%d").date()
        start_datetime = datetime.combine(travel_date, datetime.min.time()).replace(tzinfo=timezone.utc)
        end_datetime = datetime.combine(travel_date, datetime.max.time()).replace(tzinfo=timezone.utc)
        
        # Query rides with all necessary fields including preferences
        rides = db.query(
            Ride.id,
            Ride.phone_number,
            Ride.user_id,
            Ride.origin,
            Ride.destination,
            Ride.origin_lat,
            Ride.origin_lng,
            Ride.destination_lat,
            Ride.destination_lng,
            Ride.departure_time,
            Ride.available_seats,
            Ride.price_per_seat,
            Ride.preferences,  # ⭐ CRITICAL: Include preferences field
            Ride.route_coordinates,
            Ride.status,
            Ride.created_at,
            User.full_name.label("driver_name"),
            User.profile_picture,
            User.avg_rating,
            User.bio,
            Vehicle.make,
            Vehicle.model,
            Vehicle.color,
            Vehicle.vehicle_type
        ).join(
            User, User.id == Ride.user_id
        ).outerjoin(
            Vehicle, Vehicle.id == Ride.vehicle_id
        ).filter(
            and_(
                Ride.status == "active",
                Ride.available_seats >= seats,
                Ride.departure_time >= start_datetime,
                Ride.departure_time <= end_datetime
            )
        ).order_by(Ride.departure_time.asc()).all()
        
        # Calculate intersection points and format response
        result = []
        for ride in rides:
            # Calculate suggested pickup/drop points (simplified)
            suggested_pickup = None
            suggested_drop = None
            
            if ride.origin_lat and ride.origin_lng and from_lat and from_lng:
                # Simple midpoint calculation
                suggested_pickup = {
                    "lat": (ride.origin_lat + from_lat) / 2,
                    "lng": (ride.origin_lng + from_lng) / 2
                }
            
            if ride.destination_lat and ride.destination_lng and to_lat and to_lng:
                suggested_drop = {
                    "lat": (ride.destination_lat + to_lat) / 2,
                    "lng": (ride.destination_lng + to_lng) / 2
                }
            
            result.append({
                "id": ride.id,
                "phoneNumber": ride.phone_number,
                "driverUserId": ride.user_id,
                "driverName": ride.driver_name,
                "driverBio": ride.bio,
                "profilePicture": ride.profile_picture,
                "rating": float(ride.avg_rating) if ride.avg_rating else 5.0,
                "from": ride.origin,
                "to": ride.destination,
                "from_coords": [ride.origin_lng, ride.origin_lat] if ride.origin_lat else None,
                "to_coords": [ride.destination_lng, ride.destination_lat] if ride.destination_lat else None,
                "date": ride.departure_time.strftime("%Y-%m-%d"),
                "time": ride.departure_time.strftime("%I:%M %p"),
                "price": float(ride.price_per_seat),
                "seatsAvailable": ride.available_seats,
                "preferences": ride.preferences,  # ⭐ Include preferences here
                "vehicle": {
                    "make": ride.make,
                    "model": ride.model,
                    "color": ride.color,
                    "vehicle_type": ride.vehicle_type
                } if ride.make else None,
                "route_coordinates": ride.route_coordinates,
                "suggestedPickup": suggested_pickup,
                "suggestedDrop": suggested_drop,
                "profileCompleted": True  # You can check from user table if needed
            })
        
        return {
            "success": True,
            "rides": result,
            "count": len(result)
        }
        
    except Exception as e:
        print(f"❌ Search rides error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))