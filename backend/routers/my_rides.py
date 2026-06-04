# from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session, joinedload
# from sqlalchemy import and_, func, text
# from database import get_db
# from models import Ride, RideBooking, User, UserNotification, NotificationType, RideSession, RideSessionRider, Vehicle
# from datetime import datetime, timezone, timedelta
# from typing import Optional, Dict, List
# import math

# router = APIRouter()

# IST = timezone(timedelta(hours=5, minutes=30))


# def normalize_phone(phone: str) -> str:
#     if not phone:
#         return phone
#     phone = phone.replace(" ", "").replace("-", "")
#     if phone.startswith("+91"):
#         return phone
#     if phone.startswith("91") and len(phone) == 12:
#         return f"+{phone}"
#     if phone.startswith("+"):
#         return phone
#     return f"+91{phone}"


# def to_ist(dt: datetime) -> datetime:
#     if dt is None:
#         return dt
#     if dt.tzinfo is None:
#         dt = dt.replace(tzinfo=timezone.utc)
#     return dt.astimezone(IST)


# def get_total_booked_seats(db: Session, ride_id: int) -> int:
#     """Get total booked seats for a ride (accepted bookings only)"""
#     result = db.query(func.sum(RideBooking.seats_booked)).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status == "accepted"
#     ).scalar()
#     return result or 0
# @router.get("/my-rides/{phone}")
# def get_my_rides(phone: str, filter: Optional[str] = Query(None), db: Session = Depends(get_db)):
#     norm_phone = normalize_phone(phone)
    
#     # ============================================
#     # OPTIMIZED: POSTED RIDES with ALL data in ONE query
#     # ============================================
    
#     # Build base query with all necessary joins
#     posted_query = db.query(
#         Ride,
#         func.coalesce(func.sum(RideBooking.seats_booked).filter(RideBooking.status == "accepted"), 0).label("total_booked"),
#         User.full_name.label("driver_name"),
#         User.first_name,
#         User.last_name,
#         User.profile_picture.label("driver_profile_picture"),
#         Vehicle.id.label("vehicle_id"),
#         Vehicle.make,
#         Vehicle.model,
#         Vehicle.color,
#         Vehicle.registration_number,
#         Vehicle.photo_url.label("vehicle_photo_url"),
#         RideSession.id.label("session_id"),
#         RideSession.status.label("session_status"),
#         RideSession.current_phase,
#         func.count(RideSessionRider.id).filter(RideSessionRider.status.in_(["boarded", "dropped_off", "completed"])).label("boarded_count"),
#         func.count(RideSessionRider.id).filter(RideSessionRider.status.in_(["dropped_off", "completed"])).label("dropped_count"),
#         func.count(RideSessionRider.id).label("total_riders")
#     ).outerjoin(
#         RideBooking, and_(RideBooking.ride_id == Ride.id, RideBooking.status == "accepted")
#     ).outerjoin(
#         User, User.phone_number == Ride.phone_number
#     ).outerjoin(
#         Vehicle, Vehicle.id == Ride.vehicle_id
#     ).outerjoin(
#         RideSession, and_(
#             RideSession.ride_id == Ride.id,
#             RideSession.status.in_(["driver_started", "boarding", "en_route", "emergency_stopped"])
#         )
#     ).outerjoin(
#         RideSessionRider, RideSessionRider.session_id == RideSession.id
#     ).filter(
#         Ride.phone_number == norm_phone,
#         Ride.is_deleted == False
#     )
    
#     # Apply filter if provided
#     if filter == "upcoming":
#         posted_query = posted_query.filter(Ride.departure_time > datetime.now(timezone.utc))
#     elif filter == "completed":
#         posted_query = posted_query.filter(
#             Ride.departure_time < datetime.now(timezone.utc) - timedelta(minutes=30)
#         )
#     elif filter == "cancelled":
#         posted_query = posted_query.filter(Ride.status == "cancelled")
    
#     posted_query = posted_query.group_by(
#         Ride.id, User.id, Vehicle.id, RideSession.id
#     ).order_by(Ride.departure_time.desc())
    
#     posted_results = posted_query.all()
    
#     # Get all bookings for all posted rides in ONE query
#     posted_ride_ids = [r[0].id for r in posted_results]
#     bookings_map = {}
    
#     if posted_ride_ids:
#         bookings_raw = db.query(
#             RideBooking.id,
#             RideBooking.ride_id,
#             RideBooking.passenger_phone,
#             RideBooking.seats_booked,
#             RideBooking.status,
#             RideBooking.created_at,
#             RideBooking.total_amount,
#             RideBooking.cancellation_reason,
#             User.full_name.label("passenger_name"),
#             User.first_name,
#             User.last_name,
#             User.profile_picture.label("passenger_profile_picture"),
#             User.gender.label("passenger_gender")
#         ).outerjoin(
#             User, User.phone_number == RideBooking.passenger_phone
#         ).filter(
#             RideBooking.ride_id.in_(posted_ride_ids)
#         ).order_by(
#             RideBooking.created_at.desc()
#         ).all()
        
#         for bk in bookings_raw:
#             ride_id = bk.ride_id
#             if ride_id not in bookings_map:
#                 bookings_map[ride_id] = []
            
#             passenger_name = bk.passenger_name or " ".join(
#                 p for p in [bk.first_name, bk.last_name] if p
#             ).strip() or f"Passenger {bk.passenger_phone[-4:]}"
            
#             bookings_map[ride_id].append({
#                 "id": bk.id,
#                 "ride_id": ride_id,
#                 "passenger_phone": bk.passenger_phone,
#                 "passenger_name": passenger_name,
#                 "passenger_photo": bk.passenger_profile_picture,
#                 "passenger_gender": bk.passenger_gender,
#                 "seats_requested": bk.seats_booked,
#                 "status": bk.status,
#                 "cancellation_reason": bk.cancellation_reason,
#                 "total_amount": float(bk.total_amount) if bk.total_amount else None,
#                 "created_at": bk.created_at.isoformat() if bk.created_at else None,
#             })
    
#     # Format posted rides
#     posted_formatted = []
#     for ride, total_booked, driver_name, first_name, last_name, driver_profile_picture, \
#         vehicle_id, make, model, color, registration_number, vehicle_photo_url, \
#         session_id, session_status, current_phase, boarded_count, dropped_count, total_riders in posted_results:
        
#         remaining_seats = max(0, ride.available_seats - (total_booked or 0))
        
#         display_status = ride.status
#         if remaining_seats == 0 and ride.status == "active":
#             display_status = "full"
        
#         driver_full_name = driver_name or " ".join(filter(None, [first_name, last_name])).strip()
        
#         vehicle_data = None
#         if vehicle_id:
#             vehicle_data = {
#                 "id": vehicle_id,
#                 "make": make,
#                 "model": model,
#                 "color": color,
#                 "registration_number": registration_number,
#                 "photo_url": vehicle_photo_url,
#             }
        
#         live_session_data = None
#         if session_id:
#             live_session_data = {
#                 "session_id": session_id,
#                 "status": session_status,
#                 "current_phase": current_phase,
#                 "boarded_count": boarded_count or 0,
#                 "dropped_count": dropped_count or 0,
#                 "total_riders": total_riders or 0
#             }
        
#         posted_formatted.append({
#             "id": ride.id,
#             "phone_number": ride.phone_number,
#             "origin": ride.origin,
#             "destination": ride.destination,
#             "origin_coords": [ride.origin_lon, ride.origin_lat] if ride.origin_lon and ride.origin_lat else None,
#             "destination_coords": [ride.destination_lon, ride.destination_lat] if ride.destination_lon and ride.destination_lat else None,
#             "departure_time": ride.departure_time.isoformat() if ride.departure_time else None,
#             "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p") if ride.departure_time else None,
#             "available_seats": ride.available_seats,
#             "remaining_seats": remaining_seats,
#             "total_booked_seats": int(total_booked or 0),
#             "price_per_seat": ride.price_per_seat,
#             "distance_km": ride.distance_km,
#             "duration_text": ride.duration_text,
#             "total_estimated_price": ride.total_estimated_price,
#             "preferences": ride.preferences,
#             "women_only": ride.women_only,
#             "status": display_status,
#             "vehicle_id": ride.vehicle_id,
#             "vehicle": vehicle_data,
#             "route_coordinates": ride.route_coordinates,
#             "created_at": ride.created_at.isoformat() if ride.created_at else None,
#             "bookings": bookings_map.get(ride.id, []),
#             "live_session": live_session_data,
#             "driver_profile_picture": driver_profile_picture,
#             "started_at": ride.started_at.isoformat() if ride.started_at else None,
#             "cancellation_reason": ride.cancellation_reason,
#         })
    
#     # ============================================
#     # OPTIMIZED: REQUESTED RIDES in ONE query
#     # ============================================
    
#     requested_raw = db.query(
#         RideBooking.id,
#         RideBooking.ride_id,
#         RideBooking.passenger_phone,
#         RideBooking.seats_booked,
#         RideBooking.status,
#         RideBooking.created_at,
#         RideBooking.total_amount,
#         RideBooking.cancellation_reason,
#         Ride.origin,
#         Ride.destination,
#         Ride.departure_time,
#         Ride.price_per_seat,
#         Ride.available_seats,
#         Ride.distance_km,
#         Ride.duration_text,
#         Ride.status.label("ride_status"),
#         Ride.women_only,
#         Ride.route_coordinates,
#         Ride.started_at.label("ride_started_at"),
#         Ride.cancellation_reason.label("ride_cancellation_reason"),
#         User.full_name.label("driver_name"),
#         User.first_name,
#         User.last_name,
#         User.phone_number.label("driver_phone"),
#         User.user_id.label("driver_user_id"),
#         User.profile_completed,
#         User.profile_picture.label("driver_profile_picture"),
#         User.avg_rating.label("driver_rating"),
#         Vehicle.id.label("vehicle_id"),
#         Vehicle.make,
#         Vehicle.model,
#         Vehicle.color,
#         Vehicle.registration_number,
#         Vehicle.photo_url.label("vehicle_photo_url"),
#         RideSession.id.label("session_id"),
#         RideSession.status.label("session_status")
#     ).join(
#         Ride, Ride.id == RideBooking.ride_id
#     ).outerjoin(
#         User, User.phone_number == Ride.phone_number
#     ).outerjoin(
#         Vehicle, Vehicle.id == Ride.vehicle_id
#     ).outerjoin(
#         RideSession, and_(
#             RideSession.ride_id == Ride.id,
#             RideSession.status.in_(["driver_started", "boarding", "en_route"])
#         )
#     ).filter(
#         RideBooking.passenger_phone == norm_phone
#     ).order_by(
#         RideBooking.created_at.desc()
#     ).all()
    
#     requested_formatted = []
#     for row in requested_raw:
#         driver_name = row.driver_name or " ".join(
#             p for p in [row.first_name, row.last_name] if p
#         ).strip() or f"Driver {row.driver_phone[-4:] if row.driver_phone else 'Unknown'}"
        
#         vehicle_data = None
#         if row.vehicle_id:
#             vehicle_data = {
#                 "id": row.vehicle_id,
#                 "make": row.make,
#                 "model": row.model,
#                 "color": row.color,
#                 "registration_number": row.registration_number,
#                 "photo_url": row.vehicle_photo_url,
#             }
        
#         live_session_data = None
#         if row.session_id:
#             live_session_data = {
#                 "session_id": row.session_id,
#                 "status": row.session_status
#             }
        
#         requested_formatted.append({
#             "id": row.id,
#             "ride_id": row.ride_id,
#             "passenger_phone": row.passenger_phone,
#             "seats_requested": row.seats_booked,
#             "total_amount": float(row.total_amount) if row.total_amount else None,
#             "status": row.status,
#             "cancellation_reason": row.cancellation_reason,
#             "created_at": row.created_at.isoformat() if row.created_at else None,
#             "origin": row.origin,
#             "destination": row.destination,
#             "departure_time": row.departure_time.isoformat() if row.departure_time else None,
#             "departure_time_display": to_ist(row.departure_time).strftime("%d %b %Y, %I:%M %p") if row.departure_time else None,
#             "price_per_seat": row.price_per_seat,
#             "available_seats": row.available_seats,
#             "distance_km": row.distance_km,
#             "duration_text": row.duration_text,
#             "ride_status": row.ride_status,
#             "women_only": row.women_only,
#             "driver_name": driver_name,
#             "driver_phone": row.driver_phone,
#             "driver_user_id": row.driver_user_id,
#             "driver_photo": row.driver_profile_picture,
#             "driver_rating": float(row.driver_rating) if row.driver_rating else 4.5,
#             "profile_completed": row.profile_completed,
#             "route_coordinates": row.route_coordinates,
#             "vehicle": vehicle_data,
#             "live_session": live_session_data,
#             "started_at": row.ride_started_at.isoformat() if row.ride_started_at else None,
#         })
    
#     return {
#         "posted_rides": posted_formatted,
#         "requested_rides": requested_formatted
#     }

# @router.put("/booking/{booking_id}/accept")
# def accept_booking(booking_id: int, db: Session = Depends(get_db)):
#     booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")

#     if booking.status != "pending":
#         raise HTTPException(status_code=400, detail="Already processed")

#     ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")

#     total_booked = get_total_booked_seats(db, ride.id)
#     remaining_seats = ride.available_seats - total_booked
    
#     if remaining_seats < booking.seats_booked:
#         raise HTTPException(status_code=400, detail=f"Not enough seats available. Only {remaining_seats} seat(s) left.")

#     booking.status = "accepted"

#     if remaining_seats - booking.seats_booked <= 0:
#         ride.status = "full"

#     db.commit()

#     return {"message": "Booking accepted"}


# @router.put("/booking/{booking_id}/reject")
# def reject_booking(booking_id: int, db: Session = Depends(get_db)):
#     booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")

#     if booking.status != "pending":
#         raise HTTPException(status_code=400, detail="Already processed")

#     booking.status = "rejected"
#     db.commit()

#     return {"message": "Booking rejected"}


# @router.put("/ride/{ride_id}/cancel")
# def cancel_ride(ride_id: int, db: Session = Depends(get_db)):
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")

#     ride.status = "cancelled"

#     bookings = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status == "accepted"
#     ).all()

#     for booking in bookings:
#         booking.status = "cancelled"

#     db.commit()

#     return {"message": "Ride cancelled successfully", "affected_passengers": len(bookings)}


# @router.put("/booking/{booking_id}/cancel")
# def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
#     booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")

#     ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")

#     booking.status = "cancelled"
    
#     if ride.status == "full":
#         ride.status = "active"

#     db.commit()

#     return {"message": "Booking cancelled successfully"}


# @router.put("/booking/{booking_id}/modify-seats")
# def modify_booking_seats(booking_id: int, new_seats: int, db: Session = Depends(get_db)):
#     booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")
    
#     if booking.status != "accepted":
#         raise HTTPException(status_code=400, detail="Only accepted bookings can be modified")
    
#     ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     if new_seats <= 0:
#         raise HTTPException(status_code=400, detail="Seat count must be at least 1")
    
#     total_booked = get_total_booked_seats(db, ride.id)
#     other_booked = total_booked - booking.seats_booked
#     available_seats_excluding_current = ride.available_seats - other_booked
    
#     if new_seats > available_seats_excluding_current:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Only {available_seats_excluding_current} seat(s) available. Cannot increase to {new_seats}."
#         )
    
#     old_seats = booking.seats_booked
#     booking.seats_booked = new_seats
#     booking.total_amount = ride.price_per_seat * new_seats
    
#     db.commit()
    
#     return {
#         "message": f"Seats updated from {old_seats} to {new_seats}",
#         "booking_id": booking.id,
#         "new_seats": new_seats,
#         "new_total": booking.total_amount
#     }


# @router.get("/ride/{ride_id}/passengers")
# def get_ride_passengers(ride_id: int, db: Session = Depends(get_db)):
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")

#     bookings = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status.in_(["pending", "accepted"])
#     ).order_by(RideBooking.created_at.asc()).all()

#     passengers = []
#     for bk in bookings:
#         p = db.query(User).filter(User.phone_number == bk.passenger_phone).first()

#         passenger_name = None
#         if p:
#             passenger_name = p.full_name or " ".join(
#                 part for part in [p.first_name, p.last_name] if part
#             ).strip()
        
#         if not passenger_name:
#             passenger_name = f"Passenger {bk.passenger_phone[-4:]}"

#         passengers.append({
#             "booking_id": bk.id,
#             "passenger_phone": bk.passenger_phone,
#             "passenger_name": passenger_name,
#             "profile_picture": p.profile_picture if p else None,
#             "seats_booked": bk.seats_booked,
#             "status": bk.status,
#             "total_amount": float(bk.total_amount) if bk.total_amount else None,
#             "created_at": bk.created_at.isoformat() if bk.created_at else None,
#         })

#     total_booked = get_total_booked_seats(db, ride_id)
#     remaining_seats = max(0, ride.available_seats - total_booked)

#     return {
#         "ride_id": ride_id,
#         "origin": ride.origin,
#         "destination": ride.destination,
#         "origin_lon": ride.origin_lon,
#         "origin_lat": ride.origin_lat,
#         "destination_lon": ride.destination_lon,
#         "destination_lat": ride.destination_lat,
#         "route_coordinates": ride.route_coordinates,
#         "departure_time": ride.departure_time.isoformat(),
#         "available_seats": ride.available_seats,
#         "total_booked_seats": total_booked,
#         "remaining_seats": remaining_seats,
#         "status": ride.status,
#         "passengers": passengers
#     }
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func, text, or_
from database import get_db
from models import Ride, RideBooking, User, UserNotification, NotificationType, RideSession, RideSessionRider, Vehicle, ModificationRequest
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


def get_pending_modification_requests(db: Session, booking_ids: List[int]) -> Dict:
    """Get pending modification requests for multiple bookings"""
    if not booking_ids:
        return {}
    
    mod_requests = db.query(ModificationRequest).filter(
        ModificationRequest.booking_id.in_(booking_ids),
        ModificationRequest.status == "pending"
    ).all()
    
    result = {}
    for req in mod_requests:
        result[req.booking_id] = {
            "id": req.id,
            "current_seats": req.current_seats,
            "requested_seats": req.requested_seats,
            "status": req.status,
            "created_at": req.created_at.isoformat() if req.created_at else None
        }
    
    return result


@router.get("/my-rides/{phone}")
def get_my_rides(phone: str, filter: Optional[str] = Query(None), db: Session = Depends(get_db)):
    norm_phone = normalize_phone(phone)
    
    # ============================================
    # OPTIMIZED: POSTED RIDES with ALL data in ONE query
    # ============================================
    
    # Build base query with all necessary joins
    posted_query = db.query(
        Ride,
        func.coalesce(func.sum(RideBooking.seats_booked).filter(RideBooking.status == "accepted"), 0).label("total_booked"),
        User.full_name.label("driver_name"),
        User.first_name,
        User.last_name,
        User.profile_picture.label("driver_profile_picture"),
        Vehicle.id.label("vehicle_id"),
        Vehicle.make,
        Vehicle.model,
        Vehicle.color,
        Vehicle.registration_number,
        Vehicle.photo_url.label("vehicle_photo_url"),
        RideSession.id.label("session_id"),
        RideSession.status.label("session_status"),
        RideSession.current_phase,
        func.count(RideSessionRider.id).filter(RideSessionRider.status.in_(["boarded", "dropped_off", "completed"])).label("boarded_count"),
        func.count(RideSessionRider.id).filter(RideSessionRider.status.in_(["dropped_off", "completed"])).label("dropped_count"),
        func.count(RideSessionRider.id).label("total_riders")
    ).outerjoin(
        RideBooking, and_(RideBooking.ride_id == Ride.id, RideBooking.status == "accepted")
    ).outerjoin(
        User, User.phone_number == Ride.phone_number
    ).outerjoin(
        Vehicle, Vehicle.id == Ride.vehicle_id
    ).outerjoin(
        RideSession, and_(
            RideSession.ride_id == Ride.id,
            RideSession.status.in_(["driver_started", "boarding", "en_route", "emergency_stopped"])
        )
    ).outerjoin(
        RideSessionRider, RideSessionRider.session_id == RideSession.id
    ).filter(
        Ride.phone_number == norm_phone,
        Ride.is_deleted == False
    )
    
    # Apply filter if provided
    now_utc = datetime.now(timezone.utc)
    if filter == "upcoming":
        posted_query = posted_query.filter(Ride.departure_time > now_utc)
    elif filter == "completed":
        posted_query = posted_query.filter(
            Ride.departure_time < now_utc - timedelta(minutes=30)
        )
    elif filter == "cancelled":
        posted_query = posted_query.filter(Ride.status == "cancelled")
    
    posted_query = posted_query.group_by(
        Ride.id, User.id, Vehicle.id, RideSession.id
    ).order_by(Ride.departure_time.desc())
    
    posted_results = posted_query.all()
    
    # Get all bookings for all posted rides in ONE query
    posted_ride_ids = [r[0].id for r in posted_results]
    bookings_map = {}
    
    if posted_ride_ids:
        bookings_raw = db.query(
            RideBooking.id,
            RideBooking.ride_id,
            RideBooking.passenger_phone,
            RideBooking.seats_booked,
            RideBooking.status,
            RideBooking.created_at,
            RideBooking.total_amount,
            RideBooking.cancellation_reason,
            User.full_name.label("passenger_name"),
            User.first_name,
            User.last_name,
            User.profile_picture.label("passenger_profile_picture"),
            User.gender.label("passenger_gender")
        ).outerjoin(
            User, User.phone_number == RideBooking.passenger_phone
        ).filter(
            RideBooking.ride_id.in_(posted_ride_ids)
        ).order_by(
            RideBooking.created_at.desc()
        ).all()
        
        for bk in bookings_raw:
            ride_id = bk.ride_id
            if ride_id not in bookings_map:
                bookings_map[ride_id] = []
            
            passenger_name = bk.passenger_name or " ".join(
                p for p in [bk.first_name, bk.last_name] if p
            ).strip() or f"Passenger {bk.passenger_phone[-4:]}"
            
            bookings_map[ride_id].append({
                "id": bk.id,
                "ride_id": ride_id,
                "passenger_phone": bk.passenger_phone,
                "passenger_name": passenger_name,
                "passenger_photo": bk.passenger_profile_picture,
                "passenger_gender": bk.passenger_gender,
                "seats_requested": bk.seats_booked,
                "status": bk.status,
                "cancellation_reason": bk.cancellation_reason,
                "total_amount": float(bk.total_amount) if bk.total_amount else None,
                "created_at": bk.created_at.isoformat() if bk.created_at else None,
            })
    
    # Get pending modification requests for all accepted bookings
    all_accepted_booking_ids = []
    for ride_id, bookings in bookings_map.items():
        for booking in bookings:
            if booking["status"] == "accepted":
                all_accepted_booking_ids.append(booking["id"])
    
    modification_requests_map = get_pending_modification_requests(db, all_accepted_booking_ids)
    
    # Format posted rides
    posted_formatted = []
    for ride, total_booked, driver_name, first_name, last_name, driver_profile_picture, \
        vehicle_id, make, model, color, registration_number, vehicle_photo_url, \
        session_id, session_status, current_phase, boarded_count, dropped_count, total_riders in posted_results:
        
        remaining_seats = max(0, ride.available_seats - (total_booked or 0))
        
        display_status = ride.status
        if remaining_seats == 0 and ride.status == "active":
            display_status = "full"
        
        driver_full_name = driver_name or " ".join(filter(None, [first_name, last_name])).strip()
        
        vehicle_data = None
        if vehicle_id:
            vehicle_data = {
                "id": vehicle_id,
                "make": make,
                "model": model,
                "color": color,
                "registration_number": registration_number,
                "photo_url": vehicle_photo_url,
            }
        
        live_session_data = None
        if session_id:
            live_session_data = {
                "session_id": session_id,
                "status": session_status,
                "current_phase": current_phase,
                "boarded_count": boarded_count or 0,
                "dropped_count": dropped_count or 0,
                "total_riders": total_riders or 0
            }
        
        # Add modification requests to bookings
        ride_bookings = bookings_map.get(ride.id, [])
        for booking in ride_bookings:
            booking["modification_request"] = modification_requests_map.get(booking["id"])
        
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
            "total_booked_seats": int(total_booked or 0),
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
            "created_at": ride.created_at.isoformat() if ride.created_at else None,
            "bookings": ride_bookings,
            "live_session": live_session_data,
            "driver_profile_picture": driver_profile_picture,
            "started_at": ride.started_at.isoformat() if ride.started_at else None,
            "cancellation_reason": ride.cancellation_reason,
        })
    
    # ============================================
    # OPTIMIZED: REQUESTED RIDES in ONE query
    # ============================================
    
    requested_raw = db.query(
        RideBooking.id,
        RideBooking.ride_id,
        RideBooking.passenger_phone,
        RideBooking.seats_booked,
        RideBooking.status,
        RideBooking.created_at,
        RideBooking.total_amount,
        RideBooking.cancellation_reason,
        Ride.origin,
        Ride.destination,
        Ride.departure_time,
        Ride.price_per_seat,
        Ride.available_seats,
        Ride.distance_km,
        Ride.duration_text,
        Ride.status.label("ride_status"),
        Ride.women_only,
        Ride.route_coordinates,
        Ride.started_at.label("ride_started_at"),
        Ride.cancellation_reason.label("ride_cancellation_reason"),
        Ride.origin_lat,
        Ride.origin_lon,
        Ride.destination_lat,
        Ride.destination_lon,
        User.full_name.label("driver_name"),
        User.first_name,
        User.last_name,
        User.phone_number.label("driver_phone"),
        User.user_id.label("driver_user_id"),
        User.profile_completed,
        User.profile_picture.label("driver_profile_picture"),
        User.avg_rating.label("driver_rating"),
        Vehicle.id.label("vehicle_id"),
        Vehicle.make,
        Vehicle.model,
        Vehicle.color,
        Vehicle.registration_number,
        Vehicle.photo_url.label("vehicle_photo_url"),
        RideSession.id.label("session_id"),
        RideSession.status.label("session_status"),
        RideSession.current_lat,
        RideSession.current_lng
    ).join(
        Ride, Ride.id == RideBooking.ride_id
    ).outerjoin(
        User, User.phone_number == Ride.phone_number
    ).outerjoin(
        Vehicle, Vehicle.id == Ride.vehicle_id
    ).outerjoin(
        RideSession, and_(
            RideSession.ride_id == Ride.id,
            RideSession.status.in_(["driver_started", "boarding", "en_route"])
        )
    ).filter(
        RideBooking.passenger_phone == norm_phone
    ).order_by(
        RideBooking.created_at.desc()
    ).all()
    
    # Get pending modification requests for requested rides
    requested_booking_ids = [row.id for row in requested_raw if row.status == "accepted"]
    requested_mod_requests = get_pending_modification_requests(db, requested_booking_ids)
    
    requested_formatted = []
    for row in requested_raw:
        driver_name = row.driver_name or " ".join(
            p for p in [row.first_name, row.last_name] if p
        ).strip() or f"Driver {row.driver_phone[-4:] if row.driver_phone else 'Unknown'}"
        
        vehicle_data = None
        if row.vehicle_id:
            vehicle_data = {
                "id": row.vehicle_id,
                "make": row.make,
                "model": row.model,
                "color": row.color,
                "registration_number": row.registration_number,
                "photo_url": row.vehicle_photo_url,
            }
        
        live_session_data = None
        if row.session_id:
            live_session_data = {
                "session_id": row.session_id,
                "status": row.session_status,
                "current_lat": row.current_lat,
                "current_lng": row.current_lng
            }
        
        # Find suggested pickup/drop points from route coordinates
        suggested_pickup = None
        suggested_drop = None
        if row.route_coordinates and row.origin_lat and row.origin_lon:
            suggested_pickup = find_nearest_route_vertex(row.route_coordinates, row.origin_lon, row.origin_lat)
        if row.route_coordinates and row.destination_lat and row.destination_lon:
            suggested_drop = find_nearest_route_vertex(row.route_coordinates, row.destination_lon, row.destination_lat)
        
        requested_formatted.append({
            "id": row.id,
            "ride_id": row.ride_id,
            "passenger_phone": row.passenger_phone,
            "seats_requested": row.seats_booked,
            "total_amount": float(row.total_amount) if row.total_amount else None,
            "status": row.status,
            "cancellation_reason": row.cancellation_reason,
            "created_at": row.created_at.isoformat() if row.created_at else None,
            "origin": row.origin,
            "destination": row.destination,
            "origin_coords": [row.origin_lon, row.origin_lat] if row.origin_lon and row.origin_lat else None,
            "destination_coords": [row.destination_lon, row.destination_lat] if row.destination_lon and row.destination_lat else None,
            "departure_time": row.departure_time.isoformat() if row.departure_time else None,
            "departure_time_display": to_ist(row.departure_time).strftime("%d %b %Y, %I:%M %p") if row.departure_time else None,
            "price_per_seat": row.price_per_seat,
            "available_seats": row.available_seats,
            "distance_km": row.distance_km,
            "duration_text": row.duration_text,
            "ride_status": row.ride_status,
            "women_only": row.women_only,
            "driver_name": driver_name,
            "driver_phone": row.driver_phone,
            "driver_user_id": row.driver_user_id,
            "driver_photo": row.driver_profile_picture,
            "driver_rating": float(row.driver_rating) if row.driver_rating else 4.5,
            "profile_completed": row.profile_completed,
            "route_coordinates": row.route_coordinates,
            "vehicle": vehicle_data,
            "live_session": live_session_data,
            "started_at": row.ride_started_at.isoformat() if row.ride_started_at else None,
            "suggested_pickup": suggested_pickup,
            "suggested_drop": suggested_drop,
            "modification_request": requested_mod_requests.get(row.id)
        })
    
    return {
        "posted_rides": posted_formatted,
        "requested_rides": requested_formatted
    }


def find_nearest_route_vertex(route_coords: List[List[float]], lng: float, lat: float) -> Optional[Dict]:
    """Find the nearest vertex in the route_coordinates array to the given point."""
    if not route_coords or len(route_coords) < 2:
        return None

    best = None
    best_dist = float('inf')

    for point in route_coords:
        if not isinstance(point, (list, tuple)) or len(point) < 2:
            continue
        plng, plat = float(point[0]), float(point[1])
        dist = haversine_m(lat, lng, plat, plng)
        if dist < best_dist:
            best_dist = dist
            best = {"lng": plng, "lat": plat}

    return best


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in meters between two lat/lon points."""
    R = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


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

    total_booked = get_total_booked_seats(db, ride.id)
    remaining_seats = ride.available_seats - total_booked
    
    if remaining_seats < booking.seats_booked:
        raise HTTPException(status_code=400, detail=f"Not enough seats available. Only {remaining_seats} seat(s) left.")

    booking.status = "accepted"

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
    except Exception as e:
        print(f"Error creating notification: {str(e)}")

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
        print(f"Error creating notification: {str(e)}")

    return {"message": "Booking rejected"}


@router.put("/ride/{ride_id}/cancel")
def cancel_ride(ride_id: int, db: Session = Depends(get_db)):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    ride.status = "cancelled"

    bookings = db.query(RideBooking).filter(
        RideBooking.ride_id == ride_id,
        RideBooking.status == "accepted"
    ).all()

    for booking in bookings:
        booking.status = "cancelled"
        
        # Notify passenger
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
            print(f"Error creating notification: {str(e)}")

    db.commit()

    return {"message": "Ride cancelled successfully", "affected_passengers": len(bookings)}


@router.put("/booking/{booking_id}/cancel")
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    booking.status = "cancelled"
    
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
        print(f"Error creating notification: {str(e)}")

    return {"message": "Booking cancelled successfully"}


@router.put("/booking/{booking_id}/modify-seats")
def modify_booking_seats(booking_id: int, new_seats: int, db: Session = Depends(get_db)):
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
    
    total_booked = get_total_booked_seats(db, ride.id)
    other_booked = total_booked - booking.seats_booked
    available_seats_excluding_current = ride.available_seats - other_booked
    
    if new_seats > available_seats_excluding_current:
        raise HTTPException(
            status_code=400,
            detail=f"Only {available_seats_excluding_current} seat(s) available. Cannot increase to {new_seats}."
        )
    
    old_seats = booking.seats_booked
    booking.seats_booked = new_seats
    booking.total_amount = ride.price_per_seat * new_seats
    
    db.commit()
    
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
    for bk in bookings:
        p = db.query(User).filter(User.phone_number == bk.passenger_phone).first()

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
            "created_at": bk.created_at.isoformat() if bk.created_at else None,
            "pickup_lat": bk.pickup_lat,
            "pickup_lon": bk.pickup_lon,
            "drop_lat": bk.drop_lat,
            "drop_lon": bk.drop_lon,
        })

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
        "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p") if ride.departure_time else None,
        "available_seats": ride.available_seats,
        "total_booked_seats": total_booked,
        "remaining_seats": remaining_seats,
        "status": ride.status,
        "passengers": passengers,
        "distance_km": ride.distance_km,
        "duration_text": ride.duration_text,
        "price_per_seat": ride.price_per_seat,
    }