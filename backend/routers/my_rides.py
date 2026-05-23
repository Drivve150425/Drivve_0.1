
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import Ride, RideBooking, User

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

