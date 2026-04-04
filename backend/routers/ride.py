from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Ride, RideBooking, UserNotification, NotificationType
from datetime import datetime
from pydantic import BaseModel, field_validator
from typing import Optional, Dict, List
from sqlalchemy import text, bindparam, DateTime, Float, Integer

router = APIRouter()

class CreateRideRequest(BaseModel):
    phone_number: str
    origin: str
    destination: str
    departure_time: datetime
    available_seats: int
    price_per_seat: float

    origin_coords: List[float]          # [lng, lat]
    destination_coords: List[float]     # [lng, lat]
    route_coordinates: List[List[float]]  # [[lng, lat], [lng, lat], ...]

    distance_km: Optional[float] = None
    duration_text: Optional[str] = None
    total_estimated_price: Optional[float] = None
    preferences: Optional[Dict] = None

    @field_validator("origin_coords", "destination_coords")
    @classmethod
    def validate_point_coords(cls, value):
        if len(value) != 2:
            raise ValueError("Coordinates must contain exactly [lng, lat]")
        return value

    @field_validator("route_coordinates")
    @classmethod
    def validate_route_coords(cls, value):
        if len(value) < 2:
            raise ValueError("Route must contain at least 2 coordinate points")

        for point in value:
            if not isinstance(point, list) or len(point) != 2:
                raise ValueError("Each route coordinate must be [lng, lat]")

        return value
class SearchRidesRequest(BaseModel):
    from_location: str
    to_location: str
    from_coords: List[float]
    to_coords: List[float]
    departure_time: datetime
    seats_required: int = 1

    @field_validator("from_coords", "to_coords")
    @classmethod
    def validate_search_coords(cls, value):
        if len(value) != 2:
            raise ValueError("Coordinates must contain exactly [lng, lat]")
        return value
    
class CreateRideBookingRequest(BaseModel):
    ride_id: int
    passenger_phone: str
    seats_requested: int = 1

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
        origin_lon=data.origin_coords[0],
        origin_lat=data.origin_coords[1],
        destination_lon=data.destination_coords[0],
        destination_lat=data.destination_coords[1],
        route_coordinates=data.route_coordinates,
        status="active"
    )

    db.add(ride)
    db.commit()
    db.refresh(ride)

    line_wkt = "SRID=4326;LINESTRING(" + ",".join(
        [f"{lng} {lat}" for lng, lat in data.route_coordinates]
    ) + ")"

    db.execute(
        text("""
            UPDATE rides
            SET route_line = ST_GeogFromText(:line_wkt)
            WHERE id = :ride_id
        """),
        {
            "ride_id": ride.id,
            "line_wkt": line_wkt
        }
    )
    db.commit()

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

@router.post("/search-rides")
def search_rides(data: SearchRidesRequest, db: Session = Depends(get_db)):

    sql = text("""
        WITH input AS (
            SELECT
                ST_SetSRID(ST_MakePoint(:from_lng, :from_lat), 4326)::geography AS pickup_point,
                ST_SetSRID(ST_MakePoint(:to_lng, :to_lat), 4326)::geography AS drop_point,
                CAST(:departure_time AS timestamp) AS req_time,
                CAST(:seats_required AS integer) AS req_seats
        )
        SELECT
            r.id,
            r.phone_number,
            r.origin,
            r.destination,
            r.departure_time,
            r.available_seats,
            r.price_per_seat,
            r.distance_km,
            r.duration_text,
            r.total_estimated_price,

            u.id AS user_db_id,
            u.user_id AS driver_user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.profile_completed,
            u.status AS user_status,

            ST_Distance(r.route_line, i.pickup_point) AS pickup_distance_m,
            ST_Distance(r.route_line, i.drop_point) AS drop_distance_m,
            ST_LineLocatePoint(r.route_line::geometry, i.pickup_point::geometry) AS pickup_pos,
            ST_LineLocatePoint(r.route_line::geometry, i.drop_point::geometry) AS drop_pos

        FROM rides r
        LEFT JOIN users u
            ON u.phone_number = r.phone_number
        CROSS JOIN input i
        WHERE r.status = 'active'
          AND r.available_seats >= i.req_seats
          AND ABS(EXTRACT(EPOCH FROM (r.departure_time - i.req_time))) <= 7200
          AND ST_DWithin(r.route_line, i.pickup_point, 800)
          AND ST_DWithin(r.route_line, i.drop_point, 800)
    """)

    rows = db.execute(sql, {
        "from_lng": data.from_coords[0],
        "from_lat": data.from_coords[1],
        "to_lng": data.to_coords[0],
        "to_lat": data.to_coords[1],
        "departure_time": data.departure_time,
        "seats_required": data.seats_required,
    }).mappings().all()

    rides = []

    for row in rows:
        if row["pickup_pos"] >= row["drop_pos"]:
            continue

        pickup_score = max(0, 1 - (row["pickup_distance_m"] / 800))
        drop_score = max(0, 1 - (row["drop_distance_m"] / 800))

        time_diff_min = abs((row["departure_time"] - data.departure_time).total_seconds()) / 60
        time_score = max(0, 1 - (time_diff_min / 120))

        direction_score = 1

        match_percentage = round(
            100 * (
                0.4 * pickup_score +
                0.4 * drop_score +
                0.1 * time_score +
                0.1 * direction_score
            )
        )

        full_name = " ".join(
            part for part in [row.get("first_name"), row.get("last_name")] if part
        ).strip()

        rides.append({
            "id": row["id"],
            "driverName": full_name if full_name else f"Driver {str(row['phone_number'])[-4:]}",
            "driverUserId": row.get("driver_user_id"),
            "phoneNumber": row["phone_number"],
            "email": row.get("email"),
            "profileCompleted": row.get("profile_completed"),
            "userStatus": row.get("user_status"),
            "rating": 4.5,
            "date": row["departure_time"].strftime("%d %b %Y"),
            "time": row["departure_time"].strftime("%I:%M %p"),
            "from": row["origin"],
            "to": row["destination"],
            "pickupLabel": f"Pickup within {int(row['pickup_distance_m'])} m",
            "dropLabel": f"Drop within {int(row['drop_distance_m'])} m",
            "price": row["price_per_seat"],
            "matchPercentage": match_percentage,
            "seatsAvailable": row["available_seats"],
            "distanceKm": row["distance_km"],
            "durationText": row["duration_text"],
            "totalEstimatedPrice": row["total_estimated_price"],
        })

    rides.sort(key=lambda x: x["matchPercentage"], reverse=True)

    return {"rides": rides}

@router.post("/ride-bookings")
def create_ride_booking(data: CreateRideBookingRequest, db: Session = Depends(get_db)):
    ride = db.query(Ride).filter(Ride.id == data.ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if ride.status != "active":
        raise HTTPException(status_code=400, detail="Ride is not available")

    if ride.available_seats < data.seats_requested:
        raise HTTPException(status_code=400, detail="Not enough seats available")

    if ride.phone_number == data.passenger_phone:
        raise HTTPException(status_code=400, detail="You cannot book your own ride")

    existing_booking = db.query(RideBooking).filter(
        RideBooking.ride_id == data.ride_id,
        RideBooking.passenger_phone == data.passenger_phone,
        RideBooking.status.in_(["pending", "accepted"])
    ).first()

    if existing_booking:
        raise HTTPException(status_code=400, detail="You already requested this ride")

    booking = RideBooking(
        ride_id=data.ride_id,
        passenger_phone=data.passenger_phone,
        seats_requested=data.seats_requested,
        status="pending"
    )

    db.add(booking)
    db.flush()

    try:
        driver_phone = ride.phone_number
        if not driver_phone.startswith("+"):
            driver_phone = f"+{driver_phone}"

        origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
        dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"

        notification = UserNotification(
            phone_number=driver_phone,
            title="New Ride Request 🙋",
            message=f"You received a request for your ride from {origin_short} to {dest_short}.",
            type=NotificationType.RIDE,
            action_type="booking",
            action_value=str(booking.id),
            is_read=False,
            is_deleted=False
        )
        db.add(notification)

    except Exception as e:
        print(f"❌ Error creating booking notification: {str(e)}")

    db.commit()
    db.refresh(booking)

    return {
        "message": "Ride request sent successfully",
        "booking_id": booking.id,
        "status": booking.status
    }