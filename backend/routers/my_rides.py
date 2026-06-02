from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text
from database import get_db
from models import Ride, RideBooking, User, UserNotification, NotificationType, RideSession, RideSessionRider, Vehicle
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, List
import math

router = APIRouter()

IST = timezone(timedelta(hours=5, minutes=30))


def normalize_phone(phone: str) -> str:
    if not phone:
        return phone
    phone = phone.replace(" ", "").replace("-", "")
    if phone.startswith("+91"):
        return phone
    if phone.startswith("91") and len(phone) == 12:
        return f"+{phone}"
    if phone.startswith("+"):
        return phone
    return f"+91{phone}"


def to_ist(dt: datetime) -> datetime:
    if dt is None:
        return dt
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(IST)


def get_total_booked_seats(db: Session, ride_id: int) -> int:
    """Get total booked seats for a ride (accepted bookings only)"""
    result = db.query(func.sum(RideBooking.seats_booked)).filter(
        RideBooking.ride_id == ride_id,
        RideBooking.status == "accepted"
    ).scalar()
    return result or 0


def get_available_seats(db: Session, ride_id: int) -> int:
    """Calculate actual available seats = total seats - booked seats"""
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        return 0
    total_booked = get_total_booked_seats(db, ride_id)
    return max(0, ride.available_seats - total_booked)


def get_ride_display_status(ride, db: Session):
    """Determine the correct display status for a ride"""
    now = datetime.now(timezone.utc)
    
    # If ride is already cancelled, return cancelled
    if ride.status == "cancelled":
        return "cancelled", getattr(ride, 'cancellation_reason', None)
    
    # If ride has passed its departure time by more than 1 hour, auto-cancel it
    if ride.departure_time:
        time_passed = now - ride.departure_time
        if time_passed.total_seconds() > 3600:  # 1 hour past departure
            # Auto-cancel the ride if not already cancelled
            ride.status = "cancelled"
            ride.cancellation_reason = "Auto-cancelled: Ride time has passed"
            
            # Cancel all accepted bookings
            bookings = db.query(RideBooking).filter(
                RideBooking.ride_id == ride.id,
                RideBooking.status == "accepted"
            ).all()
            
            for booking in bookings:
                booking.status = "cancelled"
                booking.cancellation_reason = "Ride auto-cancelled as departure time passed"
                
                # Notify passenger
                try:
                    notification = UserNotification(
                        phone_number=booking.passenger_phone,
                        title="Ride Auto-Cancelled ⏰",
                        message=f"The ride from {ride.origin} to {ride.destination} scheduled at {to_ist(ride.departure_time).strftime('%I:%M %p')} has been auto-cancelled as the departure time has passed.",
                        type=NotificationType.RIDE,
                        action_type="ride",
                        action_value=str(ride.id),
                        is_read=False,
                        is_deleted=False
                    )
                    db.add(notification)
                except Exception as e:
                    print(f"Error sending auto-cancel notification: {str(e)}")
            
            db.commit()
            return "cancelled", "Auto-cancelled: Ride time has passed"
    
    # If ride has bookings and seats are full
    total_booked = get_total_booked_seats(db, ride.id)
    remaining_seats = ride.available_seats - total_booked
    
    if remaining_seats <= 0 and ride.status == "active":
        return "full", None
    
    return ride.status, None


@router.get("/my-rides/{phone}")
def get_my_rides(phone: str, db: Session = Depends(get_db)):
    norm_phone = normalize_phone(phone)
    
    # POSTED RIDES (Driver)
    posted_rides = db.query(Ride).filter(
        Ride.phone_number == norm_phone,
        Ride.is_deleted == False
    ).order_by(
        Ride.departure_time.desc()
    ).all()
    
    # Get bookings for all posted rides
    posted_ride_ids = [r.id for r in posted_rides]
    bookings_map = {}
    
    if posted_ride_ids:
        bookings_raw = db.execute(text("""
            SELECT 
                rb.id, rb.ride_id, rb.passenger_phone, rb.seats_booked, rb.status,
                rb.created_at, rb.total_amount, rb.cancellation_reason,
                u.full_name as passenger_name, u.first_name, u.last_name, 
                u.profile_picture as passenger_profile_picture,
                u.gender as passenger_gender
            FROM ride_bookings rb 
            LEFT JOIN users u ON u.phone_number = rb.passenger_phone
            WHERE rb.ride_id = ANY(:ride_ids)
            ORDER BY rb.created_at DESC
        """), {"ride_ids": posted_ride_ids}).mappings().all()
        
        for bk in bookings_raw:
            ride_id = bk["ride_id"]
            if ride_id not in bookings_map:
                bookings_map[ride_id] = []
            
            passenger_name = bk["passenger_name"] or " ".join(
                p for p in [bk["first_name"], bk["last_name"]] if p
            ).strip() or f"Passenger {bk['passenger_phone'][-4:]}"
            
            bookings_map[ride_id].append({
                "id": bk["id"],
                "ride_id": ride_id,
                "passenger_phone": bk["passenger_phone"],
                "passenger_name": passenger_name,
                "passenger_photo": bk["passenger_profile_picture"],
                "passenger_gender": bk["passenger_gender"],
                "seats_requested": bk["seats_booked"],
                "status": bk["status"],
                "cancellation_reason": bk["cancellation_reason"],
                "total_amount": float(bk["total_amount"]) if bk["total_amount"] else None,
                "created_at": bk["created_at"].isoformat() if bk["created_at"] else None,
            })
    
    # Format posted rides with complete data
    posted_formatted = []
    for ride in posted_rides:
        total_booked = get_total_booked_seats(db, ride.id)
        remaining_seats = max(0, ride.available_seats - total_booked)
        
        display_status = ride.status
        if remaining_seats == 0 and ride.status == "active":
            display_status = "full"
        
        # Get driver's own profile picture
        driver_info = db.query(User).filter(User.phone_number == ride.phone_number).first()
        driver_profile_picture = driver_info.profile_picture if driver_info else None
        
        # Get vehicle details
        vehicle = None
        if ride.vehicle_id:
            vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first()
        
        vehicle_data = None
        if vehicle:
            vehicle_data = {
                "id": vehicle.id,
                "make": vehicle.make,
                "model": vehicle.model,
                "color": vehicle.color,
                "registration_number": vehicle.registration_number,
                "photo_url": vehicle.photo_url,
            }
        
        # Get live session if exists
        live_session = None
        live_session_data = None
        try:
            live_session = db.query(RideSession).filter(
                RideSession.ride_id == ride.id,
                RideSession.status.in_(["driver_started", "boarding", "en_route", "emergency_stopped"])
            ).order_by(RideSession.id.desc()).first()
            
            if live_session:
                boarded_count = sum(1 for r in live_session.riders if r.status in ["boarded", "dropped_off", "completed"])
                dropped_count = sum(1 for r in live_session.riders if r.status in ["dropped_off", "completed"])
                live_session_data = {
                    "session_id": live_session.id,
                    "status": live_session.status,
                    "current_phase": live_session.current_phase,
                    "boarded_count": boarded_count,
                    "dropped_count": dropped_count,
                    "total_riders": len(live_session.riders)
                }
        except Exception as e:
            print(f"Error fetching live session: {str(e)}")
        
        posted_formatted.append({
            "id": ride.id,
            "phone_number": ride.phone_number,
            "origin": ride.origin,
            "destination": ride.destination,
            "origin_coords": [ride.origin_lon, ride.origin_lat] if ride.origin_lon and ride.origin_lat else None,
            "destination_coords": [ride.destination_lon, ride.destination_lat] if ride.destination_lon and ride.destination_lat else None,
            "departure_time": ride.departure_time.isoformat() if ride.departure_time else None,
            "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p") if ride.departure_time else None,
            "available_seats": ride.available_seats,
            "remaining_seats": remaining_seats,
            "total_booked_seats": total_booked,
            "price_per_seat": ride.price_per_seat,
            "distance_km": ride.distance_km,
            "duration_text": ride.duration_text,
            "total_estimated_price": ride.total_estimated_price,
            "preferences": ride.preferences,
            "women_only": ride.women_only,
            "status": display_status,
            "vehicle_id": ride.vehicle_id,
            "vehicle": vehicle_data,
            "route_coordinates": ride.route_coordinates,
            "suggested_pickup": ride.suggested_pickup,
            "suggested_drop": ride.suggested_drop,
            "created_at": ride.created_at.isoformat() if ride.created_at else None,
            "bookings": bookings_map.get(ride.id, []),
            "live_session": live_session_data,
            "driver_profile_picture": driver_profile_picture,
        })
    
    # REQUESTED RIDES (Passenger bookings)
    requested_raw = db.execute(text("""
        SELECT 
            rb.id, rb.ride_id, rb.passenger_phone, rb.seats_booked, rb.status,
            rb.created_at, rb.total_amount, rb.cancellation_reason,
            r.origin, r.destination, r.departure_time, r.price_per_seat, r.available_seats,
            r.distance_km, r.duration_text, r.status as ride_status, r.women_only,
            r.route_coordinates, r.suggested_pickup, r.suggested_drop,
            u.full_name as driver_name, u.first_name, u.last_name, u.phone_number as driver_phone,
            u.user_id as driver_user_id, u.profile_completed, 
            u.profile_picture as driver_profile_picture,
            u.avg_rating as driver_rating,
            v.id as vehicle_id, v.make, v.model, v.color, v.registration_number
        FROM ride_bookings rb
        JOIN rides r ON r.id = rb.ride_id
        LEFT JOIN users u ON u.phone_number = r.phone_number
        LEFT JOIN vehicles v ON v.id = r.vehicle_id
        WHERE rb.passenger_phone = :phone
        ORDER BY rb.created_at DESC
    """), {"phone": norm_phone}).mappings().all()
    
    requested_formatted = []
    for row in requested_raw:
        driver_name = row["driver_name"] or " ".join(
            p for p in [row["first_name"], row["last_name"]] if p
        ).strip() or f"Driver {row['driver_phone'][-4:] if row['driver_phone'] else 'Unknown'}"
        
        # Build vehicle object
        vehicle_data = None
        if row["vehicle_id"]:
            vehicle_data = {
                "id": row["vehicle_id"],
                "make": row["make"],
                "model": row["model"],
                "color": row["color"],
                "registration_number": row["registration_number"],
            }
        
        # Get live session info for this booking
        live_session_data = None
        try:
            session_rider = db.query(RideSessionRider).filter(
                RideSessionRider.booking_id == row["id"]
            ).order_by(RideSessionRider.id.desc()).first()
            
            if session_rider:
                session = db.query(RideSession).filter(RideSession.id == session_rider.session_id).first()
                if session:
                    live_session_data = {
                        "session_id": session.id,
                        "session_status": session.status,
                        "current_phase": session.current_phase,
                        "rider_status": session_rider.status,
                        "pickup_confirmed": getattr(session_rider, 'pickup_confirmed', False),
                        "dropoff_confirmed": getattr(session_rider, 'dropoff_confirmed', False)
                    }
        except Exception as e:
            print(f"Error fetching session info: {str(e)}")
        
        requested_formatted.append({
            "id": row["id"],
            "ride_id": row["ride_id"],
            "passenger_phone": row["passenger_phone"],
            "seats_requested": row["seats_booked"],
            "total_amount": float(row["total_amount"]) if row["total_amount"] else None,
            "status": row["status"],
            "cancellation_reason": row["cancellation_reason"],
            "created_at": row["created_at"].isoformat() if row["created_at"] else None,
            "origin": row["origin"],
            "destination": row["destination"],
            "departure_time": row["departure_time"].isoformat() if row["departure_time"] else None,
            "departure_time_display": to_ist(row["departure_time"]).strftime("%d %b %Y, %I:%M %p") if row["departure_time"] else None,
            "price_per_seat": row["price_per_seat"],
            "available_seats": row["available_seats"],
            "distance_km": row["distance_km"],
            "duration_text": row["duration_text"],
            "ride_status": row["ride_status"],
            "women_only": row["women_only"],
            "driver_name": driver_name,
            "driver_phone": row["driver_phone"],
            "driver_user_id": row["driver_user_id"],
            "driver_photo": row["driver_profile_picture"],
            "driver_rating": float(row["driver_rating"]) if row["driver_rating"] else 4.5,
            "profile_completed": row["profile_completed"],
            "route_coordinates": row["route_coordinates"],
            "suggested_pickup": row["suggested_pickup"],
            "suggested_drop": row["suggested_drop"],
            "vehicle": vehicle_data,
            "live_session": live_session_data,
        })
    
    return {
        "posted_rides": posted_formatted,
        "requested_rides": requested_formatted
    }


@router.put("/booking/{booking_id}/accept")
def accept_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status != "pending":
        raise HTTPException(status_code=400, detail="Already processed")

    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    # Check seat availability using proper calculation
    total_booked = get_total_booked_seats(db, ride.id)
    remaining_seats = ride.available_seats - total_booked
    
    if remaining_seats < booking.seats_booked:
        raise HTTPException(status_code=400, detail=f"Not enough seats available. Only {remaining_seats} seat(s) left.")

    # Accept the booking (don't modify ride.available_seats directly)
    booking.status = "accepted"

    # Mark ride as full if no seats left
    if remaining_seats - booking.seats_booked <= 0:
        ride.status = "full"

    db.commit()

    # Create notification for passenger
    try:
        origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
        dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
        
        notification = UserNotification(
            phone_number=booking.passenger_phone,
            title="Booking Accepted! ✅",
            message=f"Your request for {booking.seats_booked} seat(s) on the ride from {origin_short} to {dest_short} has been accepted by the driver.",
            type=NotificationType.RIDE,
            action_type="booking",
            action_value=str(booking.id),
            is_read=False,
            is_deleted=False
        )
        db.add(notification)
        db.commit()
        print(f"✅ Booking acceptance notification sent to {booking.passenger_phone}")
    except Exception as e:
        print(f"❌ Error creating booking acceptance notification: {str(e)}")

    return {"message": "Booking accepted"}


@router.put("/booking/{booking_id}/reject")
def reject_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status != "pending":
        raise HTTPException(status_code=400, detail="Already processed")

    booking.status = "rejected"
    db.commit()

    # Create notification for passenger
    try:
        ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
        if ride:
            origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
            dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
            
            notification = UserNotification(
                phone_number=booking.passenger_phone,
                title="Booking Declined ❌",
                message=f"Your request for the ride from {origin_short} to {dest_short} was declined by the driver.",
                type=NotificationType.RIDE,
                action_type="booking",
                action_value=str(booking.id),
                is_read=False,
                is_deleted=False
            )
            db.add(notification)
            db.commit()
    except Exception as e:
        print(f"❌ Error creating booking rejection notification: {str(e)}")

    return {"message": "Booking rejected"}


@router.put("/ride/{ride_id}/cancel")
def cancel_ride(ride_id: int, db: Session = Depends(get_db)):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    ride.status = "cancelled"
    ride.cancellation_reason = "Cancelled by driver"

    # Cancel all accepted bookings
    bookings = db.query(RideBooking).filter(
        RideBooking.ride_id == ride_id,
        RideBooking.status == "accepted"
    ).all()

    for booking in bookings:
        booking.status = "cancelled"
        booking.cancellation_reason = "Ride cancelled by driver"
        
        # Notify each passenger
        try:
            notification = UserNotification(
                phone_number=booking.passenger_phone,
                title="Ride Cancelled ❌",
                message=f"The ride from {ride.origin} to {ride.destination} has been cancelled by the driver.",
                type=NotificationType.RIDE,
                action_type="ride",
                action_value=str(ride_id),
                is_read=False,
                is_deleted=False
            )
            db.add(notification)
        except Exception as e:
            print(f"❌ Error creating cancellation notification: {str(e)}")

    db.commit()

    return {"message": "Ride cancelled successfully", "affected_passengers": len(bookings)}


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

    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    # Update status (don't modify ride.available_seats directly)
    booking.status = "cancelled"
    booking.cancellation_reason = "Cancelled by passenger"
    
    # If ride was full, set back to active since a seat became available
    if ride.status == "full":
        ride.status = "active"

    db.commit()

    # Notify driver
    try:
        notification = UserNotification(
            phone_number=ride.phone_number,
            title="Booking Cancelled",
            message=f"A passenger has cancelled their booking for your ride from {ride.origin} to {ride.destination}.",
            type=NotificationType.RIDE,
            action_type="ride",
            action_value=str(ride.id),
            is_read=False,
            is_deleted=False
        )
        db.add(notification)
        db.commit()
    except Exception as e:
        print(f"❌ Error creating cancellation notification for driver: {str(e)}")

    return {"message": "Booking cancelled successfully"}


@router.put("/booking/{booking_id}/modify-seats")
def modify_booking_seats(booking_id: int, new_seats: int, db: Session = Depends(get_db)):
    """Allow passenger to modify seat count on an accepted booking"""
    
    booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status != "accepted":
        raise HTTPException(status_code=400, detail="Only accepted bookings can be modified")
    
    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    if new_seats <= 0:
        raise HTTPException(status_code=400, detail="Seat count must be at least 1")
    
    # Calculate available seats excluding current booking
    total_booked = get_total_booked_seats(db, ride.id)
    other_booked = total_booked - booking.seats_booked
    available_seats_excluding_current = ride.available_seats - other_booked
    
    if new_seats > available_seats_excluding_current:
        raise HTTPException(
            status_code=400,
            detail=f"Only {available_seats_excluding_current} seat(s) available. Cannot increase to {new_seats}."
        )
    
    # Update booking
    old_seats = booking.seats_booked
    booking.seats_booked = new_seats
    booking.total_amount = ride.price_per_seat * new_seats
    
    db.commit()
    
    # Notify driver
    try:
        notification = UserNotification(
            phone_number=ride.phone_number,
            title="Booking Modified 🔄",
            message=f"Passenger has modified seat request from {old_seats} to {new_seats} seat(s).",
            type=NotificationType.RIDE,
            action_type="booking",
            action_value=str(booking.id),
            is_read=False,
            is_deleted=False
        )
        db.add(notification)
        db.commit()
    except Exception as e:
        print(f"Error sending modification notification: {str(e)}")
    
    return {
        "message": f"Seats updated from {old_seats} to {new_seats}",
        "booking_id": booking.id,
        "new_seats": new_seats,
        "new_total": booking.total_amount
    }


@router.get("/ride/{ride_id}/passengers")
def get_ride_passengers(ride_id: int, db: Session = Depends(get_db)):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    bookings = db.query(RideBooking).filter(
        RideBooking.ride_id == ride_id,
        RideBooking.status.in_(["pending", "accepted"])
    ).order_by(RideBooking.created_at.asc()).all()

    passengers = []
    for idx, bk in enumerate(bookings, start=1):
        p = db.query(User).filter(
            User.phone_number == bk.passenger_phone
        ).first()

        passenger_name = None
        if p:
            passenger_name = p.full_name or " ".join(
                part for part in [p.first_name, p.last_name] if part
            ).strip()
        
        if not passenger_name:
            passenger_name = f"Passenger {bk.passenger_phone[-4:]}"

        passengers.append({
            "booking_id": bk.id,
            "passenger_phone": bk.passenger_phone,
            "passenger_name": passenger_name,
            "profile_picture": p.profile_picture if p else None,
            "seats_booked": bk.seats_booked,
            "status": bk.status,
            "total_amount": float(bk.total_amount) if bk.total_amount else None,
            "pickup_lat": bk.pickup_lat,
            "pickup_lon": bk.pickup_lon,
            "drop_lat": bk.drop_lat,
            "drop_lon": bk.drop_lon,
            "intersection_pickup_lat": bk.intersection_pickup_lat,
            "intersection_pickup_lon": bk.intersection_pickup_lon,
            "intersection_drop_lat": bk.intersection_drop_lat,
            "intersection_drop_lon": bk.intersection_drop_lon,
            "pickup_walk_distance_m": bk.pickup_walk_distance_m,
            "drop_walk_distance_m": bk.drop_walk_distance_m,
            "created_at": bk.created_at.isoformat() if bk.created_at else None,
        })

    # Calculate total booked and remaining seats
    total_booked = get_total_booked_seats(db, ride_id)
    remaining_seats = max(0, ride.available_seats - total_booked)

    return {
        "ride_id": ride_id,
        "origin": ride.origin,
        "destination": ride.destination,
        "origin_lon": ride.origin_lon,
        "origin_lat": ride.origin_lat,
        "destination_lon": ride.destination_lon,
        "destination_lat": ride.destination_lat,
        "route_coordinates": ride.route_coordinates,
        "departure_time": ride.departure_time.isoformat(),
        "available_seats": ride.available_seats,
        "total_booked_seats": total_booked,
        "remaining_seats": remaining_seats,
        "status": ride.status,
        "passengers": passengers
    }