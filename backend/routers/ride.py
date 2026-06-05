# from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session, joinedload
# from sqlalchemy import func, text, and_, or_
# from database import get_db
# from models import Ride, RideBooking, RideSeatModificationRequest, User, UserNotification, NotificationType, Vehicle, RideSession, RideSessionRider
# from datetime import datetime, timezone, timedelta
# from pydantic import BaseModel, field_validator
# from typing import Optional, Dict, List
# import math
# import re

# router = APIRouter()

# IST = timezone(timedelta(hours=5, minutes=30))
# SEARCH_RADIUS_M = 2000
# TIME_WINDOW_MINUTES = 60

# # ============================================
# # PYDANTIC MODELS
# # ============================================

# class CreateRideRequest(BaseModel):
#     phone_number: str
#     origin: str
#     destination: str
#     departure_time: datetime
#     available_seats: int
#     price_per_seat: float
#     origin_coords: List[float]
#     destination_coords: List[float]
#     route_coordinates: List[List[float]]
#     distance_km: Optional[float] = None
#     duration_text: Optional[str] = None
#     total_estimated_price: Optional[float] = None
#     preferences: Optional[Dict] = None
#     vehicle_id: Optional[int] = None
#     women_only: Optional[bool] = False

#     @field_validator("origin_coords", "destination_coords")
#     @classmethod
#     def validate_point_coords(cls, value):
#         if len(value) != 2:
#             raise ValueError("Coordinates must contain exactly [lng, lat]")
#         return value

#     @field_validator("route_coordinates")
#     @classmethod
#     def validate_route_coords(cls, value):
#         if len(value) < 2:
#             raise ValueError("Route must contain at least 2 coordinate points")
#         for point in value:
#             if not isinstance(point, list) or len(point) != 2:
#                 raise ValueError("Each route coordinate must be [lng, lat]")
#         return value


# class UpdateRideRequest(CreateRideRequest):
#     """Same as CreateRideRequest for ride updates"""
#     pass


# class SearchRidesRequest(BaseModel):
#     from_location: str
#     to_location: str
#     from_coords: List[float]
#     to_coords: List[float]
#     departure_time: datetime
#     seats_required: int = 1
#     passenger_gender: Optional[str] = None

#     @field_validator("from_coords", "to_coords")
#     @classmethod
#     def validate_search_coords(cls, value):
#         if len(value) != 2:
#             raise ValueError("Coordinates must contain exactly [lng, lat]")
#         return value


# class CreateRideBookingRequest(BaseModel):
#     ride_id: int
#     passenger_phone: str
#     seats_requested: int = 1
#     from_coords: Optional[List[float]] = None
#     to_coords: Optional[List[float]] = None

#     @field_validator("from_coords", "to_coords")
#     @classmethod
#     def validate_optional_coords(cls, value):
#         if value is None:
#             return value
#         if len(value) != 2:
#             raise ValueError("Coordinates must contain exactly [lng, lat]")
#         return value


# class ModifySeatsRequest(BaseModel):
#     new_seats: int

# import socketio
# # At the top of ride.py, add these functions (you already have them)
# _sio = None

# def set_sio_instance(sio_instance):
#     global _sio
#     _sio = sio_instance

# def emit_to_user(user_phone: str, event: str, data: dict):
#     global _sio
#     if _sio:
#         room_name = f"user_{user_phone}"
#         _sio.emit(event, data, room=room_name)
#         print(f"📡 Socket emitted to {room_name}: {event}")
#         return True
#     return False

# def emit_to_ride(ride_id: int, event: str, data: dict):
#     global _sio
#     if _sio:
#         room_name = f"ride_{ride_id}"
#         _sio.emit(event, data, room=room_name)
#         print(f"📡 Socket emitted to {room_name}: {event}")
#         return True
#     return False
# class SeatModificationRequest(BaseModel):
#     requested_seats: int


# class VehicleChangeNotification(BaseModel):
#     ride_id: int
#     old_vehicle_id: Optional[int] = None
#     new_vehicle_id: int


# # ============================================
# # HELPER FUNCTIONS
# # ============================================

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


# def parse_duration_to_minutes(duration_str: Optional[str]) -> int:
#     """Parse duration string like '1 Hr 30 Min' to minutes"""
#     if not duration_str:
#         return 60
    
#     mins = 0
#     hr_match = re.search(r'(\d+)\s*Hr', duration_str, re.IGNORECASE)
#     min_match = re.search(r'(\d+)\s*Min', duration_str, re.IGNORECASE)
    
#     if hr_match:
#         mins += int(hr_match.group(1)) * 60
#     if min_match:
#         mins += int(min_match.group(1))
    
#     return mins or 60


# def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
#     """Calculate distance between two points in kilometers using Haversine formula"""
#     R = 6371
#     dlat = math.radians(lat2 - lat1)
#     dlon = math.radians(lon2 - lon1)
#     a = math.sin(dlat/2) * math.sin(dlat/2) + \
#         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
#         math.sin(dlon/2) * math.sin(dlon/2)
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
#     return R * c


# def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
#     """Return distance in meters between two lat/lon points."""
#     R = 6371000
#     phi1 = math.radians(lat1)
#     phi2 = math.radians(lat2)
#     dphi = math.radians(lat2 - lat1)
#     dlambda = math.radians(lon2 - lon1)
#     a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
#     return R * c


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


# def get_available_seats(db: Session, ride_id: int) -> int:
#     """Calculate actual available seats = total seats - booked seats"""
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         return 0
#     total_booked = get_total_booked_seats(db, ride_id)
#     return max(0, ride.available_seats - total_booked)


# def check_overlapping_rides_for_driver(db: Session, phone_number: str, departure_time: datetime, duration_minutes: int, exclude_ride_id: Optional[int] = None) -> Optional[Dict]:
#     """Check if driver has overlapping active rides"""
    
#     departure_time_utc = departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
    
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
#     # Add buffer (30 minutes before start, 15 minutes after end for overlap detection)
#     buffer_start = departure_time_utc - timedelta(minutes=30)
#     buffer_end = expected_end_time + timedelta(minutes=15)
    
#     query = db.query(Ride).filter(
#         Ride.phone_number == phone_number,
#         Ride.status.in_(["active", "full"]),
#         Ride.departure_time < buffer_end,
#         Ride.expected_end_time > buffer_start
#     )
    
#     if exclude_ride_id:
#         query = query.filter(Ride.id != exclude_ride_id)
    
#     overlapping = query.first()
    
#     if overlapping:
#         return {
#             "ride_id": overlapping.id,
#             "origin": overlapping.origin,
#             "destination": overlapping.destination,
#             "departure_time": overlapping.departure_time,
#             "expected_end_time": overlapping.expected_end_time
#         }
    
#     return None


# def check_overlapping_bookings_for_passenger(db: Session, phone_number: str, departure_time: datetime, duration_minutes: int, exclude_booking_id: Optional[int] = None) -> Optional[Dict]:
#     """Check if passenger has overlapping active/accepted bookings"""
    
#     departure_time_utc = departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
    
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
#     # Add buffer (30 minutes before start, 60 minutes after end for passenger)
#     buffer_start = departure_time_utc - timedelta(minutes=30)
#     buffer_end = expected_end_time + timedelta(minutes=60)
    
#     query = db.query(RideBooking).join(Ride).filter(
#         RideBooking.passenger_phone == phone_number,
#         RideBooking.status.in_(["accepted"]),  # Only accepted bookings count as active
#         Ride.departure_time < buffer_end,
#         Ride.expected_end_time > buffer_start
#     )
    
#     if exclude_booking_id:
#         query = query.filter(RideBooking.id != exclude_booking_id)
    
#     overlapping = query.first()
    
#     if overlapping:
#         return {
#             "booking_id": overlapping.id,
#             "ride_id": overlapping.ride_id,
#             "origin": overlapping.ride.origin,
#             "destination": overlapping.ride.destination,
#             "departure_time": overlapping.ride.departure_time,
#             "expected_end_time": overlapping.ride.expected_end_time
#         }
    
#     return None


# def find_nearest_route_vertex(route_coords: List[List[float]], lng: float, lat: float) -> Optional[Dict]:
#     """Find the nearest vertex in the route_coordinates array to the given point."""
#     if not route_coords or len(route_coords) < 2:
#         return None

#     best = None
#     best_dist = float('inf')

#     for point in route_coords:
#         if not isinstance(point, (list, tuple)) or len(point) < 2:
#             continue
#         plng, plat = float(point[0]), float(point[1])
#         dist = haversine_m(lat, lng, plat, plng)
#         if dist < best_dist:
#             best_dist = dist
#             best = {"lng": plng, "lat": plat}

#     return best


# def build_match_label(score: int) -> str:
#     if score >= 90:
#         return "Excellent"
#     if score >= 75:
#         return "Good"
#     if score >= 60:
#         return "Fair"
#     return "Low"


# def send_to_user(user_phone: str, event: str, data: dict):
#     """Socket function placeholder"""
#     print(f"🔔 Socket notification to {user_phone}: {event} -> {data}")
#     return True


# # ============================================
# # RIDE ENDPOINTS
# # ============================================

# @router.post("/post-ride")
# def post_ride(data: CreateRideRequest, db: Session = Depends(get_db)):
#     normalized_phone = normalize_phone(data.phone_number)
    
#     # Parse duration
#     duration_minutes = parse_duration_to_minutes(data.duration_text)
    
#     # Convert departure time to UTC
#     departure_time_utc = data.departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         departure_time_utc = departure_time_utc.astimezone(timezone.utc)
    
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
#     # Check if user has overlapping ACCEPTED bookings as a passenger
#     passenger_overlap = check_overlapping_bookings_for_passenger(db, normalized_phone, departure_time_utc, duration_minutes)
#     if passenger_overlap:
#         raise HTTPException(
#             status_code=409,
#             detail=f"You have a confirmed booking as a passenger from {passenger_overlap['origin']} to {passenger_overlap['destination']} at {to_ist(passenger_overlap['departure_time']).strftime('%I:%M %p')} that overlaps with this ride. Please complete that ride before offering another."
#         )
    
#     # Check for overlapping rides (Time Buffer Block)
#     overlapping = check_overlapping_rides_for_driver(db, normalized_phone, departure_time_utc, duration_minutes)
#     if overlapping:
#         end_time_ist = to_ist(overlapping["expected_end_time"])
#         raise HTTPException(
#             status_code=409,
#             detail=f"You already have an active ride from {overlapping['origin']} to {overlapping['destination']} at {to_ist(overlapping['departure_time']).strftime('%I:%M %p')}. Please wait until {end_time_ist.strftime('%I:%M %p')} to post another ride."
#         )
    
#     # Validate distance (3km - 300km)
#     distance = calculate_distance_km(
#         data.origin_coords[1], data.origin_coords[0],
#         data.destination_coords[1], data.destination_coords[0]
#     )
    
#     MIN_DISTANCE_KM = 3
#     MAX_DISTANCE_KM = 300
    
#     if distance < MIN_DISTANCE_KM:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Pickup and destination are too close ({distance:.1f} km). Minimum distance is {MIN_DISTANCE_KM} km for a ride."
#         )
    
#     if distance > MAX_DISTANCE_KM:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Distance too far ({distance:.1f} km). Maximum allowed is {MAX_DISTANCE_KM} km for daily commutes."
#         )
    
#     # Validate time (minimum 30 minutes from now)
#     min_departure_time = datetime.now(timezone.utc) + timedelta(minutes=30)
#     if departure_time_utc < min_departure_time:
#         min_time_ist = to_ist(min_departure_time)
#         raise HTTPException(
#             status_code=400,
#             detail=f"Departure time must be at least 30 minutes from now. Please select a time after {min_time_ist.strftime('%I:%M %p')}."
#         )
    
#     # Get women_only from preferences
#     women_only = data.preferences.get('womenOnly', False) if data.preferences else data.women_only
    
#     # Create ride
#     ride = Ride(
#         phone_number=normalized_phone,
#         origin=data.origin,
#         destination=data.destination,
#         departure_time=departure_time_utc,
#         expected_end_time=expected_end_time,
#         duration_minutes=duration_minutes,
#         available_seats=data.available_seats,
#         price_per_seat=data.price_per_seat,
#         distance_km=data.distance_km,
#         duration_text=data.duration_text,
#         total_estimated_price=data.total_estimated_price,
#         preferences=data.preferences,
#         origin_lon=data.origin_coords[0],
#         origin_lat=data.origin_coords[1],
#         destination_lon=data.destination_coords[0],
#         destination_lat=data.destination_coords[1],
#         route_coordinates=data.route_coordinates,
#         vehicle_id=data.vehicle_id,
#         women_only=women_only,
#         status="active",
#     )

#     db.add(ride)
#     db.commit()
#     db.refresh(ride)

#     # Update geometry (if PostGIS is enabled, otherwise skip)
#     try:
#         if data.route_coordinates and len(data.route_coordinates) >= 2:
#             line_wkt = "LINESTRING(" + ",".join(
#                 [f"{lng} {lat}" for lng, lat in data.route_coordinates]
#             ) + ")"
#             db.execute(
#                 text("""
#                     UPDATE rides
#                     SET route_line = ST_GeomFromText(:line_wkt, 4326)::geography
#                     WHERE id = :ride_id
#                 """),
#                 {"ride_id": ride.id, "line_wkt": line_wkt}
#             )
#             db.commit()
#     except Exception as e:
#         print(f"⚠️ PostGIS update skipped: {str(e)}")

#     # Create notification for ride posted
#     try:
#         origin_short = data.origin.split(",")[0].strip() if data.origin else "start"
#         dest_short = data.destination.split(",")[0].strip() if data.destination else "destination"

#         notification = UserNotification(
#             phone_number=normalized_phone,
#             title="Ride Posted! 🚗",
#             message=f"Your ride from {origin_short} to {dest_short} has been posted. You'll be notified when passengers book!",
#             type=NotificationType.RIDE,
#             action_type="ride",
#             action_value=str(ride.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(notification)
#         db.commit()
#         print(f"✅ Ride posted notification created for {normalized_phone}")
#     except Exception as e:
#         print(f"❌ Error creating ride posted notification: {str(e)}")

#     return {
#         "message": "Ride posted successfully",
#         "ride_id": ride.id
#     }


# @router.put("/update-ride/{ride_id}")
# def update_ride(ride_id: int, data: UpdateRideRequest, db: Session = Depends(get_db)):
#     normalized_phone = normalize_phone(data.phone_number)

#     # Fetch existing ride
#     ride = db.query(Ride).filter(
#         Ride.id == ride_id,
#         Ride.phone_number == normalized_phone
#     ).first()
    
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found or you don't have permission to edit it")

#     # Check if ride has confirmed bookings
#     confirmed_bookings = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status == "accepted"
#     ).all()
    
#     has_confirmed_bookings = len(confirmed_bookings) > 0
#     total_booked_seats = sum(b.seats_booked for b in confirmed_bookings)
    
#     # Women Only toggle validation
#     new_women_only = data.preferences.get('womenOnly', False) if data.preferences else data.women_only
    
#     if ride.women_only != new_women_only:
#         if new_women_only == False and ride.women_only == True:
#             female_bookings = db.query(RideBooking).join(User).filter(
#                 RideBooking.ride_id == ride_id,
#                 RideBooking.status == "accepted",
#                 User.gender == "female"
#             ).count()
            
#             if female_bookings > 0:
#                 raise HTTPException(
#                     status_code=403,
#                     detail=f"Cannot disable Women Only mode - {female_bookings} female passenger(s) have already booked this ride based on the safety promise."
#                 )
    
#     # Calculate time difference for validation
#     departure_time_utc = data.departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         departure_time_utc = departure_time_utc.astimezone(timezone.utc)
    
#     time_diff_minutes = abs((departure_time_utc - ride.departure_time).total_seconds()) / 60
    
#     # Check for major changes that require auto-rejecting pending requests
#     major_changes = []
#     auto_reject_pending = False
    
#     if ride.origin != data.origin:
#         major_changes.append("Origin changed")
#         auto_reject_pending = True
#     if ride.destination != data.destination:
#         major_changes.append("Destination changed")
#         auto_reject_pending = True
#     if time_diff_minutes > 15:
#         major_changes.append(f"Time changed by {int(time_diff_minutes)} minutes")
#         auto_reject_pending = True
#     if ride.price_per_seat != data.price_per_seat and data.price_per_seat > ride.price_per_seat:
#         major_changes.append("Price increased")
#         auto_reject_pending = True
    
#     # Lock major fields if there are confirmed bookings
#     if has_confirmed_bookings:
#         critical_changes = []
        
#         if ride.origin != data.origin:
#             critical_changes.append("Origin")
#         if ride.destination != data.destination:
#             critical_changes.append("Destination")
#         if time_diff_minutes > 10:
#             critical_changes.append("Time (more than 10 minutes)")
#         if ride.price_per_seat != data.price_per_seat:
#             critical_changes.append("Price")
        
#         if critical_changes:
#             raise HTTPException(
#                 status_code=403,
#                 detail=f"Cannot modify: {', '.join(critical_changes)}. This ride has {len(confirmed_bookings)} confirmed booking(s). Please cancel the ride and create a new one if you need major changes."
#             )
    
#     # Validate seat changes (cannot reduce below booked seats)
#     if data.available_seats < total_booked_seats:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Cannot reduce seats below {total_booked_seats} as you have {total_booked_seats} confirmed passenger(s)."
#         )
    
#     # Parse duration
#     duration_minutes = parse_duration_to_minutes(data.duration_text)
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
#     # Check for overlapping rides (excluding current ride) - only if time changed significantly
#     if time_diff_minutes > 30:
#         overlapping = check_overlapping_rides_for_driver(db, normalized_phone, departure_time_utc, duration_minutes, exclude_ride_id=ride_id)
#         if overlapping:
#             end_time_ist = to_ist(overlapping["expected_end_time"])
#             raise HTTPException(
#                 status_code=409,
#                 detail=f"Cannot update: You have another active ride from {overlapping['origin']} to {overlapping['destination']} at {to_ist(overlapping['departure_time']).strftime('%I:%M %p')} that overlaps with this new time."
#             )
    
#     # Check if vehicle changed (for notification)
#     vehicle_changed = ride.vehicle_id != data.vehicle_id
    
#     # Update ride fields
#     ride.origin = data.origin
#     ride.destination = data.destination
#     ride.departure_time = departure_time_utc
#     ride.expected_end_time = expected_end_time
#     ride.duration_minutes = duration_minutes
#     ride.available_seats = data.available_seats
#     ride.price_per_seat = data.price_per_seat
#     ride.distance_km = data.distance_km
#     ride.duration_text = data.duration_text
#     ride.total_estimated_price = data.total_estimated_price
#     ride.preferences = data.preferences
#     ride.origin_lon = data.origin_coords[0]
#     ride.origin_lat = data.origin_coords[1]
#     ride.destination_lon = data.destination_coords[0]
#     ride.destination_lat = data.destination_coords[1]
#     ride.route_coordinates = data.route_coordinates
#     ride.vehicle_id = data.vehicle_id
#     ride.women_only = new_women_only

#     # Update status based on remaining seats
#     remaining_seats = ride.available_seats - total_booked_seats
#     if remaining_seats <= 0 and ride.status == "active":
#         ride.status = "full"
#     elif remaining_seats > 0 and ride.status == "full":
#         ride.status = "active"

#     db.commit()
#     db.refresh(ride)

#     # Auto-reject pending requests if major changes
#     rejected_count = 0
#     if auto_reject_pending and has_confirmed_bookings == False:
#         pending_requests = db.query(RideBooking).filter(
#             RideBooking.ride_id == ride_id,
#             RideBooking.status == "pending"
#         ).all()
        
#         for pending in pending_requests:
#             pending.status = "rejected"
#             pending.rejection_reason = f"Driver modified ride details: {', '.join(major_changes)}"
#             rejected_count += 1
            
#             try:
#                 notification = UserNotification(
#                     phone_number=pending.passenger_phone,
#                     title="Ride Details Changed 🔄",
#                     message=f"The driver has modified the ride details ({', '.join(major_changes)}). Please review and request again if it still suits you.",
#                     type=NotificationType.RIDE,
#                     action_type="ride",
#                     action_value=str(ride.id),
#                     is_read=False,
#                     is_deleted=False
#                 )
#                 db.add(notification)
#             except Exception as e:
#                 print(f"Error sending rejection notification: {str(e)}")
        
#         db.commit()

#     # Update geometry (if PostGIS is enabled)
#     try:
#         if data.route_coordinates and len(data.route_coordinates) >= 2:
#             line_wkt = "LINESTRING(" + ",".join(
#                 [f"{lng} {lat}" for lng, lat in data.route_coordinates]
#             ) + ")"
#             db.execute(
#                 text("""
#                     UPDATE rides
#                     SET route_line = ST_GeomFromText(:line_wkt, 4326)::geography
#                     WHERE id = :ride_id
#                 """),
#                 {"ride_id": ride.id, "line_wkt": line_wkt}
#             )
#             db.commit()
#     except Exception as e:
#         print(f"⚠️ PostGIS update skipped: {str(e)}")

#     # Send notification if vehicle changed and has bookings
#     if vehicle_changed and has_confirmed_bookings:
#         try:
#             old_vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first() if ride.vehicle_id else None
#             new_vehicle = db.query(Vehicle).filter(Vehicle.id == data.vehicle_id).first() if data.vehicle_id else None
            
#             old_vehicle_text = f"{old_vehicle.make} {old_vehicle.model} ({old_vehicle.registration_number})" if old_vehicle else "previous vehicle"
#             new_vehicle_text = f"{new_vehicle.make} {new_vehicle.model} ({new_vehicle.registration_number})" if new_vehicle else "new vehicle"
            
#             for booking in confirmed_bookings:
#                 notification = UserNotification(
#                     phone_number=booking.passenger_phone,
#                     title="Vehicle Changed 🚗",
#                     message=f"Driver has changed vehicle from {old_vehicle_text} to {new_vehicle_text}. Please check ride details.",
#                     type=NotificationType.RIDE,
#                     action_type="ride",
#                     action_value=str(ride.id),
#                     is_read=False,
#                     is_deleted=False
#                 )
#                 db.add(notification)
#             db.commit()
#             print(f"✅ Sent vehicle change notifications to {len(confirmed_bookings)} passengers")
#         except Exception as e:
#             print(f"❌ Error sending vehicle change notifications: {str(e)}")

#     # Create notification for ride update
#     try:
#         origin_short = data.origin.split(",")[0].strip() if data.origin else "start"
#         dest_short = data.destination.split(",")[0].strip() if data.destination else "destination"
        
#         notification_title = "Ride Updated! 🔄" if not vehicle_changed else "Ride & Vehicle Updated! 🔄🚗"
        
#         notification = UserNotification(
#             phone_number=normalized_phone,
#             title=notification_title,
#             message=f"Your ride from {origin_short} to {dest_short} has been updated.",
#             type=NotificationType.RIDE,
#             action_type="ride",
#             action_value=str(ride.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(notification)
#         db.commit()
#     except Exception as e:
#         print(f"❌ Error creating update notification: {str(e)}")

#     return {
#         "message": "Ride updated successfully",
#         "ride_id": ride.id,
#         "remaining_seats": max(0, ride.available_seats - total_booked_seats),
#         "total_booked": total_booked_seats,
#         "vehicle_changed": vehicle_changed,
#         "notifications_sent": len(confirmed_bookings) if vehicle_changed else 0,
#         "auto_rejected_pending": rejected_count,
#         "auto_reject_reason": major_changes if auto_reject_pending else None
#     }


# @router.post("/search-rides")
# def search_rides(data: SearchRidesRequest, db: Session = Depends(get_db)):
#     req_time_utc = data.departure_time
#     if req_time_utc.tzinfo is None:
#         req_time_utc = req_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         req_time_utc = req_time_utc.astimezone(timezone.utc)

#     # Build query - Include BOTH active and full rides
#     query = db.query(Ride).filter(
#         Ride.status.in_(["active", "full"]),
#         Ride.departure_time.between(
#             req_time_utc - timedelta(minutes=TIME_WINDOW_MINUTES),
#             req_time_utc + timedelta(minutes=TIME_WINDOW_MINUTES)
#         )
#     )
    
#     # Apply women-only filter at database level
#     if data.passenger_gender != 'female':
#         query = query.filter(Ride.women_only == False)

#     # Execute query
#     all_rides = query.all()
    
#     rides = []
    
#     for ride in all_rides:
#         # Calculate actual remaining seats
#         total_booked = get_total_booked_seats(db, ride.id)
#         remaining_seats = max(0, ride.available_seats - total_booked)
        
#         # Calculate distances if coordinates available
#         pickup_distance_m = 0
#         drop_distance_m = 0
#         pickup_point = None
#         drop_point = None
        
#         if ride.origin_lat and ride.origin_lon and ride.destination_lat and ride.destination_lon:
#             pickup_distance_m = haversine_m(
#                 ride.origin_lat, ride.origin_lon,
#                 data.from_coords[1], data.from_coords[0]
#             )
#             drop_distance_m = haversine_m(
#                 ride.destination_lat, ride.destination_lon,
#                 data.to_coords[1], data.to_coords[0]
#             )
            
#             # Find nearest points on route
#             if ride.route_coordinates:
#                 pickup_point = find_nearest_route_vertex(ride.route_coordinates, data.from_coords[0], data.from_coords[1])
#                 drop_point = find_nearest_route_vertex(ride.route_coordinates, data.to_coords[0], data.to_coords[1])
        
#         # Skip if too far
#         if pickup_distance_m > SEARCH_RADIUS_M * 2 or drop_distance_m > SEARCH_RADIUS_M * 2:
#             continue
        
#         # Calculate match score
#         pickup_score = max(0, 1 - (pickup_distance_m / SEARCH_RADIUS_M))
#         drop_score = max(0, 1 - (drop_distance_m / SEARCH_RADIUS_M))
        
#         time_diff_min = abs((ride.departure_time - req_time_utc).total_seconds()) / 60
#         time_score = max(0, 1 - (time_diff_min / 60))
        
#         match_percentage = round(
#             100 * (0.35 * pickup_score + 0.35 * drop_score + 0.20 * time_score + 0.10)
#         )
        
#         # Get driver info
#         driver = db.query(User).filter(
#             User.phone_number == ride.phone_number
#         ).first()
        
#         driver_name = None
#         if driver:
#             driver_name = driver.full_name or " ".join(filter(None, [driver.first_name, driver.last_name]))
#         if not driver_name:
#             driver_name = f"Driver {ride.phone_number[-4:]}"
        
#         # Get vehicle info
#         vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first() if ride.vehicle_id else None
        
#         departure_time_ist = to_ist(ride.departure_time)
        
#         rides.append({
#             "id": ride.id,
#             "driverName": driver_name,
#             "driverUserId": driver.user_id if driver else None,
#             "phoneNumber": ride.phone_number,
#             "email": driver.email if driver else None,
#             "profileCompleted": driver.profile_completed if driver else False,
#             "userStatus": driver.status.value if driver else None,
#             "profilePicture": driver.profile_picture if driver else None,
#             "driverGender": driver.gender if driver else None,
#             "womenOnly": ride.women_only,
#             "vehicle": {
#                 "id": vehicle.id if vehicle else None,
#                 "make": vehicle.make if vehicle else None,
#                 "model": vehicle.model if vehicle else None,
#                 "color": vehicle.color if vehicle else None,
#                 "registrationNumber": vehicle.registration_number if vehicle else None,
#                 "photoUrl": vehicle.photo_url if vehicle else None,
#             },
#             "rating": 4.5,
#             "date": departure_time_ist.strftime("%d %b %Y"),
#             "time": departure_time_ist.strftime("%I:%M %p"),
#             "from": ride.origin,
#             "to": ride.destination,
#             "suggestedPickup": pickup_point,
#             "suggestedDrop": drop_point,
#             "pickupWalkDistanceM": int(pickup_distance_m),
#             "dropWalkDistanceM": int(drop_distance_m),
#             "pickupLabel": f"Walk {int(pickup_distance_m)} m to pickup point" if pickup_distance_m > 0 else "Pickup point",
#             "dropLabel": f"Walk {int(drop_distance_m)} m from drop point" if drop_distance_m > 0 else "Drop point",
#             "price": ride.price_per_seat,
#             "matchPercentage": match_percentage,
#             "matchLabel": build_match_label(match_percentage),
#             "seatsAvailable": remaining_seats,
#             "totalSeats": ride.available_seats,
#             "bookedSeats": total_booked,
#             "seatsRequested": data.seats_required,
#             "isFull": remaining_seats == 0,
#             "distanceKm": ride.distance_km,
#             "durationText": ride.duration_text,
#             "totalEstimatedPrice": ride.total_estimated_price,
#             "timeDifferenceMin": round(time_diff_min),
#             "routeCoordinates": ride.route_coordinates or [],
#             "status": ride.status,
#         })
    
#     rides.sort(
#         key=lambda x: (
#             -x["matchPercentage"],
#             x["timeDifferenceMin"],
#             x["pickupWalkDistanceM"] + x["dropWalkDistanceM"]
#         )
#     )
    
#     return {"rides": rides}


# @router.post("/ride-bookings")
# def create_ride_booking(data: CreateRideBookingRequest, db: Session = Depends(get_db)):
#     passenger_phone = normalize_phone(data.passenger_phone)

#     ride = db.query(Ride).filter(Ride.id == data.ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")

#     if ride.status not in ["active", "full"]:
#         raise HTTPException(status_code=400, detail="Ride is not available")

#     # Check available seats
#     total_booked = get_total_booked_seats(db, ride.id)
#     remaining_seats = ride.available_seats - total_booked
    
#     if remaining_seats < data.seats_requested:
#         raise HTTPException(status_code=400, detail=f"Not enough seats available. Only {remaining_seats} seat(s) left.")

#     if ride.phone_number == passenger_phone:
#         raise HTTPException(status_code=400, detail="You cannot book your own ride")
    
#     # Check if user already has an ACCEPTED booking for this ride
#     existing_accepted = db.query(RideBooking).filter(
#         RideBooking.ride_id == data.ride_id,
#         RideBooking.passenger_phone == passenger_phone,
#         RideBooking.status == "accepted"
#     ).first()

#     if existing_accepted:
#         raise HTTPException(
#             status_code=400, 
#             detail="You already have a confirmed booking for this ride. Please contact the driver if you need to modify your seat count."
#         )
    
#     # Check for multiple ride requests for same journey (max 2)
#     active_requests = db.query(RideBooking).filter(
#         RideBooking.passenger_phone == passenger_phone,
#         RideBooking.status == "pending",
#         RideBooking.created_at > datetime.now(timezone.utc) - timedelta(minutes=10)
#     ).count()
    
#     if active_requests >= 2:
#         raise HTTPException(status_code=400, detail="You can only have 2 active ride requests at a time. Please wait for responses before requesting more rides.")

#     existing_pending = db.query(RideBooking).filter(
#         RideBooking.ride_id == data.ride_id,
#         RideBooking.passenger_phone == passenger_phone,
#         RideBooking.status == "pending"
#     ).first()

#     if existing_pending:
#         raise HTTPException(status_code=400, detail="You already requested this ride")
    
#     # Get ride duration for overlap check
#     duration_minutes = ride.duration_minutes or parse_duration_to_minutes(ride.duration_text) or 60
    
#     # Check for overlapping active bookings
#     overlapping = check_overlapping_bookings_for_passenger(db, passenger_phone, ride.departure_time, duration_minutes)
#     if overlapping:
#         raise HTTPException(
#             status_code=409,
#             detail=f"You already have a confirmed booking for a ride from {overlapping['origin']} to {overlapping['destination']} at {to_ist(overlapping['departure_time']).strftime('%I:%M %p')} that overlaps with this ride."
#         )

#     # Compute intersection points if coords provided
#     pickup_lat = pickup_lon = drop_lat = drop_lon = None
#     int_pickup_lat = int_pickup_lon = int_drop_lat = int_drop_lon = None
#     pickup_walk_m = drop_walk_m = None

#     if data.from_coords and data.to_coords and ride.route_coordinates:
#         try:
#             sql = text("""
#                 WITH input AS (
#                     SELECT
#                         ST_SetSRID(ST_MakePoint(:from_lng, :from_lat), 4326)::geography AS rider_pickup,
#                         ST_SetSRID(ST_MakePoint(:to_lng, :to_lat), 4326)::geography AS rider_drop
#                 )
#                 SELECT
#                     ST_Distance(r.route_line, i.rider_pickup) AS pickup_distance_m,
#                     ST_Distance(r.route_line, i.rider_drop) AS drop_distance_m
#                 FROM rides r
#                 CROSS JOIN input i
#                 WHERE r.id = :ride_id
#             """)

#             result = db.execute(sql, {
#                 "ride_id": ride.id,
#                 "from_lng": data.from_coords[0],
#                 "from_lat": data.from_coords[1],
#                 "to_lng": data.to_coords[0],
#                 "to_lat": data.to_coords[1],
#             }).mappings().first()

#             if result:
#                 pickup_walk_m = int(float(result["pickup_distance_m"]))
#                 drop_walk_m = int(float(result["drop_distance_m"]))

#                 # Use nearest route vertex for accessible junction points
#                 route_coords = ride.route_coordinates or []
#                 pickup_pt = find_nearest_route_vertex(route_coords, data.from_coords[0], data.from_coords[1])
#                 drop_pt = find_nearest_route_vertex(route_coords, data.to_coords[0], data.to_coords[1])

#                 if pickup_pt:
#                     int_pickup_lon = pickup_pt["lng"]
#                     int_pickup_lat = pickup_pt["lat"]
#                 if drop_pt:
#                     int_drop_lon = drop_pt["lng"]
#                     int_drop_lat = drop_pt["lat"]

#                 pickup_lat = data.from_coords[1]
#                 pickup_lon = data.from_coords[0]
#                 drop_lat = data.to_coords[1]
#                 drop_lon = data.to_coords[0]
#         except Exception as e:
#             print(f"⚠️ Intersection compute error (non-fatal): {e}")

#     # Defensive: ensure price_per_seat is valid before computing total
#     if ride.price_per_seat is None:
#         raise HTTPException(status_code=500, detail="Ride pricing is not configured. Please contact support.")

#     total_amount = ride.price_per_seat * data.seats_requested

#     booking = RideBooking(
#         ride_id=data.ride_id,
#         passenger_phone=passenger_phone,
#         seats_booked=data.seats_requested,
#         total_amount=total_amount,
#         pickup_lat=pickup_lat,
#         pickup_lon=pickup_lon,
#         drop_lat=drop_lat,
#         drop_lon=drop_lon,
#         intersection_pickup_lat=int_pickup_lat,
#         intersection_pickup_lon=int_pickup_lon,
#         intersection_drop_lat=int_drop_lat,
#         intersection_drop_lon=int_drop_lon,
#         pickup_walk_distance_m=pickup_walk_m,
#         drop_walk_distance_m=drop_walk_m,
#         status="pending"
#     )

#     db.add(booking)
#     db.flush()

#     try:
#         driver_phone = normalize_phone(ride.phone_number)

#         origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
#         dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"

#         notification = UserNotification(
#             phone_number=driver_phone,
#             title="New Ride Request 🙋",
#             message=f"You received a request for {data.seats_requested} seat(s) for your ride from {origin_short} to {dest_short}.",
#             type=NotificationType.RIDE,
#             action_type="booking",
#             action_value=str(booking.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(notification)

#     except Exception as e:
#         print(f"❌ Error creating booking notification: {str(e)}")

#     db.commit()
#     db.refresh(booking)

#     return {
#         "message": "Ride request sent successfully",
#         "booking_id": booking.id,
#         "status": booking.status
#     }


# @router.put("/booking/{booking_id}/modify-seats")
# def modify_booking_seats(booking_id: int, data: ModifySeatsRequest, db: Session = Depends(get_db)):
#     """Allow passenger to modify seat count on an accepted booking"""
    
#     booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")
    
#     if booking.status != "accepted":
#         raise HTTPException(status_code=400, detail="Only accepted bookings can be modified")
    
#     ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     if data.new_seats <= 0:
#         raise HTTPException(status_code=400, detail="Seat count must be at least 1")
    
#     # Calculate available seats excluding current booking
#     total_booked = get_total_booked_seats(db, ride.id)
#     other_booked = total_booked - booking.seats_booked
#     available_seats_excluding_current = ride.available_seats - other_booked
    
#     if data.new_seats > available_seats_excluding_current:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Only {available_seats_excluding_current} seat(s) available. Cannot increase to {data.new_seats}."
#         )
    
#     # Update booking
#     old_seats = booking.seats_booked
#     booking.seats_booked = data.new_seats
#     booking.total_amount = ride.price_per_seat * data.new_seats
    
#     db.commit()
    
#     # Notify driver
#     try:
#         notification = UserNotification(
#             phone_number=ride.phone_number,
#             title="Booking Modified 🔄",
#             message=f"Passenger has modified seat request from {old_seats} to {data.new_seats} seat(s).",
#             type=NotificationType.RIDE,
#             action_type="booking",
#             action_value=str(booking.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(notification)
#         db.commit()
#     except Exception as e:
#         print(f"Error sending modification notification: {str(e)}")
    
#     return {
#         "message": f"Seats updated from {old_seats} to {data.new_seats}",
#         "booking_id": booking.id,
#         "new_seats": data.new_seats,
#         "new_total": booking.total_amount
#     }


# @router.get("/check-passenger-overlap")
# def check_passenger_overlap(
#     phone_number: str,
#     departure_time: datetime,
#     duration_minutes: int = 60,
#     exclude_booking_id: Optional[int] = None,
#     db: Session = Depends(get_db)
# ):
#     """Check if passenger has overlapping active bookings"""
#     normalized_phone = normalize_phone(phone_number)
    
#     overlapping = check_overlapping_bookings_for_passenger(db, normalized_phone, departure_time, duration_minutes, exclude_booking_id)
    
#     if overlapping:
#         return {
#             "has_overlap": True,
#             "overlapping_booking": {
#                 "booking_id": overlapping["booking_id"],
#                 "ride_id": overlapping["ride_id"],
#                 "origin": overlapping["origin"],
#                 "destination": overlapping["destination"],
#                 "departure_time": overlapping["departure_time"].isoformat(),
#                 "expected_end_time": overlapping["expected_end_time"].isoformat() if overlapping["expected_end_time"] else None
#             }
#         }
    
#     return {"has_overlap": False}


# @router.get("/check-overlapping-rides")
# def check_overlapping_rides_endpoint(
#     phone_number: str,
#     departure_time: datetime,
#     duration_minutes: int = 60,
#     exclude_ride_id: Optional[int] = None,
#     db: Session = Depends(get_db)
# ):
#     """Check if driver has overlapping active rides"""
#     normalized_phone = normalize_phone(phone_number)
    
#     overlapping = check_overlapping_rides_for_driver(db, normalized_phone, departure_time, duration_minutes, exclude_ride_id)
    
#     if overlapping:
#         return {
#             "has_overlap": True,
#             "overlapping_ride": {
#                 "id": overlapping["ride_id"],
#                 "origin": overlapping["origin"],
#                 "destination": overlapping["destination"],
#                 "departure_time": overlapping["departure_time"].isoformat(),
#                 "expected_end_time": overlapping["expected_end_time"].isoformat() if overlapping["expected_end_time"] else None
#             }
#         }
    
#     return {"has_overlap": False}


# @router.post("/booking/{booking_id}/accept")
# def accept_booking(booking_id: int, db: Session = Depends(get_db)):
#     booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")

#     if booking.status != "pending":
#         raise HTTPException(status_code=400, detail="Already processed")

#     ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")

#     # Check seat availability before accepting
#     total_booked = get_total_booked_seats(db, ride.id)
#     remaining_seats = ride.available_seats - total_booked
    
#     if remaining_seats < booking.seats_booked:
#         booking.status = "rejected"
#         db.commit()
#         raise HTTPException(status_code=400, detail="Not enough seats available anymore")

#     # Accept the booking
#     booking.status = "accepted"
    
#     # Auto-withdraw all other pending requests for this ride
#     other_pending = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride.id,
#         RideBooking.id != booking_id,
#         RideBooking.status == "pending"
#     ).all()
    
#     withdrawn_count = 0
#     for pending_booking in other_pending:
#         pending_booking.status = "rejected"
#         pending_booking.rejection_reason = "Rider joined another vehicle"
#         withdrawn_count += 1
        
#         try:
#             notification = UserNotification(
#                 phone_number=pending_booking.passenger_phone,
#                 title="Request Auto-Withdrawn",
#                 message="Your ride request was automatically withdrawn because the driver accepted another passenger.",
#                 type=NotificationType.RIDE,
#                 action_type="booking",
#                 action_value=str(pending_booking.id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
#         except Exception as e:
#             print(f"Error sending auto-withdrawal notification: {str(e)}")
    
#     # Update ride status if full
#     total_booked_after = get_total_booked_seats(db, ride.id)
#     if ride.available_seats <= total_booked_after:
#         ride.status = "full"
    
#     db.commit()

#     # Create notification for accepted passenger
#     try:
#         origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
#         dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
        
#         notification = UserNotification(
#             phone_number=booking.passenger_phone,
#             title="Booking Accepted! ✅",
#             message=f"Your request for {booking.seats_booked} seat(s) on the ride from {origin_short} to {dest_short} has been accepted by the driver.",
#             type=NotificationType.RIDE,
#             action_type="booking",
#             action_value=str(booking.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(notification)
#         db.commit()
#         print(f"✅ Booking acceptance notification sent to {booking.passenger_phone}")
#     except Exception as e:
#         print(f"❌ Error creating booking acceptance notification: {str(e)}")

#     return {
#         "message": "Booking accepted", 
#         "withdrawn_count": withdrawn_count,
#         "withdrawn_reason": "Rider joined another vehicle"
#     }


# @router.put("/booking/{booking_id}/reject")
# def reject_booking(booking_id: int, db: Session = Depends(get_db)):
#     booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")

#     if booking.status != "pending":
#         raise HTTPException(status_code=400, detail="Already processed")

#     booking.status = "rejected"
#     db.commit()

#     # Create notification for passenger
#     try:
#         ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#         if ride:
#             origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
#             dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
            
#             notification = UserNotification(
#                 phone_number=booking.passenger_phone,
#                 title="Booking Declined ❌",
#                 message=f"Your request for the ride from {origin_short} to {dest_short} was declined by the driver.",
#                 type=NotificationType.RIDE,
#                 action_type="booking",
#                 action_value=str(booking.id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
#             db.commit()
#     except Exception as e:
#         print(f"❌ Error creating booking rejection notification: {str(e)}")

#     return {"message": "Booking rejected"}


# @router.put("/ride/{ride_id}/cancel")
# def cancel_ride(ride_id: int, db: Session = Depends(get_db)):
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")

#     ride.status = "cancelled"

#     # Cancel all accepted bookings
#     bookings = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status == "accepted"
#     ).all()

#     for booking in bookings:
#         booking.status = "cancelled"
        
#         try:
#             notification = UserNotification(
#                 phone_number=booking.passenger_phone,
#                 title="Ride Cancelled ❌",
#                 message=f"The ride from {ride.origin} to {ride.destination} has been cancelled by the driver.",
#                 type=NotificationType.RIDE,
#                 action_type="ride",
#                 action_value=str(ride_id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
#         except Exception as e:
#             print(f"❌ Error creating cancellation notification: {str(e)}")

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

#     if booking.status == "accepted":
#         if ride.status == "full":
#             ride.status = "active"

#     booking.status = "cancelled"
#     db.commit()

#     try:
#         notification = UserNotification(
#             phone_number=ride.phone_number,
#             title="Booking Cancelled",
#             message=f"A passenger has cancelled their booking for your ride from {ride.origin} to {ride.destination}.",
#             type=NotificationType.RIDE,
#             action_type="ride",
#             action_value=str(ride.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(notification)
#         db.commit()
#     except Exception as e:
#         print(f"❌ Error creating cancellation notification for driver: {str(e)}")

#     return {"message": "Booking cancelled successfully"}


# # ============================================
# # MY RIDES ENDPOINT
# # ============================================

# # @router.get("/my-rides/{phone}")
# # def get_my_rides(phone: str, db: Session = Depends(get_db)):
# #     norm_phone = normalize_phone(phone)
    
# #     # POSTED RIDES (Driver)
# #     posted_rides = db.query(Ride).filter(
# #         Ride.phone_number == norm_phone,
# #         Ride.is_deleted == False
# #     ).order_by(
# #         Ride.departure_time.desc()
# #     ).all()
    
# #     # Get bookings for all posted rides
# #     posted_ride_ids = [r.id for r in posted_rides]
# #     bookings_map = {}
    
# #     if posted_ride_ids:
# #         bookings_raw = db.execute(text("""
# #             SELECT 
# #                 rb.id, rb.ride_id, rb.passenger_phone, rb.seats_booked, rb.status,
# #                 rb.created_at, rb.total_amount, rb.cancellation_reason,
# #                 u.full_name as passenger_name, u.first_name, u.last_name, 
# #                 u.profile_picture as passenger_profile_picture,
# #                 u.gender as passenger_gender
# #             FROM ride_bookings rb 
# #             LEFT JOIN users u ON u.phone_number = rb.passenger_phone
# #             WHERE rb.ride_id = ANY(:ride_ids)
# #             ORDER BY rb.created_at DESC
# #         """), {"ride_ids": posted_ride_ids}).mappings().all()
        
# #         for bk in bookings_raw:
# #             ride_id = bk["ride_id"]
# #             if ride_id not in bookings_map:
# #                 bookings_map[ride_id] = []
            
# #             passenger_name = bk["passenger_name"] or " ".join(
# #                 p for p in [bk["first_name"], bk["last_name"]] if p
# #             ).strip() or f"Passenger {bk['passenger_phone'][-4:]}"
            
# #             bookings_map[ride_id].append({
# #                 "id": bk["id"],
# #                 "ride_id": ride_id,
# #                 "passenger_phone": bk["passenger_phone"],
# #                 "passenger_name": passenger_name,
# #                 "passenger_photo": bk["passenger_profile_picture"],
# #                 "passenger_gender": bk["passenger_gender"],
# #                 "seats_requested": bk["seats_booked"],
# #                 "status": bk["status"],
# #                 "cancellation_reason": bk["cancellation_reason"],
# #                 "total_amount": float(bk["total_amount"]) if bk["total_amount"] else None,
# #                 "created_at": bk["created_at"].isoformat() if bk["created_at"] else None,
# #             })
    
# #     # Format posted rides with complete data
# #     posted_formatted = []
# #     for ride in posted_rides:
# #         total_booked = get_total_booked_seats(db, ride.id)
# #         remaining_seats = max(0, ride.available_seats - total_booked)
        
# #         display_status = ride.status
# #         if remaining_seats == 0 and ride.status == "active":
# #             display_status = "full"
        
# #         # Get driver's own profile picture
# #         driver_info = db.query(User).filter(User.phone_number == ride.phone_number).first()
# #         driver_profile_picture = driver_info.profile_picture if driver_info else None
        
# #         # Get vehicle details
# #         vehicle = None
# #         if ride.vehicle_id:
# #             vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first()
        
# #         vehicle_data = None
# #         if vehicle:
# #             vehicle_data = {
# #                 "id": vehicle.id,
# #                 "make": vehicle.make,
# #                 "model": vehicle.model,
# #                 "color": vehicle.color,
# #                 "registration_number": vehicle.registration_number,
# #                 "photo_url": vehicle.photo_url,
# #             }
        
# #         # Get live session if exists
# #         live_session_data = None
# #         try:
# #             live_session = db.query(RideSession).filter(
# #                 RideSession.ride_id == ride.id,
# #                 RideSession.status.in_(["driver_started", "boarding", "en_route", "emergency_stopped"])
# #             ).order_by(RideSession.id.desc()).first()
            
# #             if live_session:
# #                 boarded_count = sum(1 for r in live_session.riders if r.status in ["boarded", "dropped_off", "completed"])
# #                 dropped_count = sum(1 for r in live_session.riders if r.status in ["dropped_off", "completed"])
# #                 live_session_data = {
# #                     "session_id": live_session.id,
# #                     "status": live_session.status,
# #                     "current_phase": live_session.current_phase,
# #                     "boarded_count": boarded_count,
# #                     "dropped_count": dropped_count,
# #                     "total_riders": len(live_session.riders)
# #                 }
# #         except Exception as e:
# #             print(f"Error fetching live session: {str(e)}")
# #         posted_formatted.append({
# #             "id": ride.id,
# #             "phone_number": ride.phone_number,
# #             "origin": ride.origin,
# #             "destination": ride.destination,
# #             "origin_coords": [ride.origin_lon, ride.origin_lat] if ride.origin_lon and ride.origin_lat else None,
# #             "destination_coords": [ride.destination_lon, ride.destination_lat] if ride.destination_lon and ride.destination_lat else None,
# #             "departure_time": ride.departure_time.isoformat() if ride.departure_time else None,
# #             "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p") if ride.departure_time else None,
# #             "available_seats": ride.available_seats,
# #             "remaining_seats": remaining_seats,
# #             "total_booked_seats": total_booked,
# #             "price_per_seat": ride.price_per_seat,
# #             "distance_km": ride.distance_km,
# #             "duration_text": ride.duration_text,
# #             "total_estimated_price": ride.total_estimated_price,
# #             "preferences": ride.preferences,
# #             "women_only": ride.women_only,
# #             "status": display_status,
# #             "vehicle_id": ride.vehicle_id,
# #             "vehicle": vehicle_data,
# #             "route_coordinates": ride.route_coordinates,
# #             "created_at": ride.created_at.isoformat() if ride.created_at else None,
# #             "bookings": bookings_map.get(ride.id, []),
# #             "live_session": live_session_data,
# #             "driver_profile_picture": driver_profile_picture,
# #         })
    
# #     # REQUESTED RIDES (Passenger bookings)
# #     requested_raw = db.execute(text("""
# #         SELECT 
# #             rb.id, rb.ride_id, rb.passenger_phone, rb.seats_booked, rb.status,
# #             rb.created_at, rb.total_amount, rb.cancellation_reason,
# #             r.origin, r.destination, r.departure_time, r.price_per_seat, r.available_seats,
# #             r.distance_km, r.duration_text, r.status as ride_status, r.women_only,
# #             r.route_coordinates, r.suggested_pickup, r.suggested_drop,
# #             u.full_name as driver_name, u.first_name, u.last_name, u.phone_number as driver_phone,
# #             u.user_id as driver_user_id, u.profile_completed, 
# #             u.profile_picture as driver_profile_picture,
# #             u.avg_rating as driver_rating,
# #             v.id as vehicle_id, v.make, v.model, v.color, v.registration_number
# #         FROM ride_bookings rb
# #         JOIN rides r ON r.id = rb.ride_id
# #         LEFT JOIN users u ON u.phone_number = r.phone_number
# #         LEFT JOIN vehicles v ON v.id = r.vehicle_id
# #         WHERE rb.passenger_phone = :phone
# #         ORDER BY rb.created_at DESC
# #     """), {"phone": norm_phone}).mappings().all()
    
# #     requested_formatted = []
# #     for row in requested_raw:
# #         driver_name = row["driver_name"] or " ".join(
# #             p for p in [row["first_name"], row["last_name"]] if p
# #         ).strip() or f"Driver {row['driver_phone'][-4:] if row['driver_phone'] else 'Unknown'}"
        
# #         # Build vehicle object
# #         vehicle_data = None
# #         if row["vehicle_id"]:
# #             vehicle_data = {
# #                 "id": row["vehicle_id"],
# #                 "make": row["make"],
# #                 "model": row["model"],
# #                 "color": row["color"],
# #                 "registration_number": row["registration_number"],
# #             }
        
# #         requested_formatted.append({
# #             "id": row["id"],
# #             "ride_id": row["ride_id"],
# #             "passenger_phone": row["passenger_phone"],
# #             "seats_requested": row["seats_booked"],
# #             "total_amount": float(row["total_amount"]) if row["total_amount"] else None,
# #             "status": row["status"],
# #             "cancellation_reason": row["cancellation_reason"],
# #             "created_at": row["created_at"].isoformat() if row["created_at"] else None,
# #             "origin": row["origin"],
# #             "destination": row["destination"],
# #             "departure_time": row["departure_time"].isoformat() if row["departure_time"] else None,
# #             "departure_time_display": to_ist(row["departure_time"]).strftime("%d %b %Y, %I:%M %p") if row["departure_time"] else None,
# #             "price_per_seat": row["price_per_seat"],
# #             "available_seats": row["available_seats"],
# #             "distance_km": row["distance_km"],
# #             "duration_text": row["duration_text"],
# #             "ride_status": row["ride_status"],
# #             "women_only": row["women_only"],
# #             "driver_name": driver_name,
# #             "driver_phone": row["driver_phone"],
# #             "driver_user_id": row["driver_user_id"],
# #             "driver_photo": row["driver_profile_picture"],
# #             "driver_rating": float(row["driver_rating"]) if row["driver_rating"] else 4.5,
# #             "profile_completed": row["profile_completed"],
# #             "route_coordinates": row["route_coordinates"],
           
# #             "vehicle": vehicle_data,
# #         })
    
# #     return {
# #         "posted_rides": posted_formatted,
# #         "requested_rides": requested_formatted
# #     }


# # ============================================
# # RIDE PASSENGERS ENDPOINT
# # ============================================

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
#         p = db.query(User).filter(
#             User.phone_number == bk.passenger_phone
#         ).first()

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
#             "pickup_lat": bk.pickup_lat,
#             "pickup_lon": bk.pickup_lon,
#             "drop_lat": bk.drop_lat,
#             "drop_lon": bk.drop_lon,
#             "intersection_pickup_lat": bk.intersection_pickup_lat,
#             "intersection_pickup_lon": bk.intersection_pickup_lon,
#             "intersection_drop_lat": bk.intersection_drop_lat,
#             "intersection_drop_lon": bk.intersection_drop_lon,
#             "pickup_walk_distance_m": bk.pickup_walk_distance_m,
#             "drop_walk_distance_m": bk.drop_walk_distance_m,
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
# @router.post("/booking/{booking_id}/request-modification")
# async def request_modification(
#     booking_id: int,
#     request: ModificationRequestSchema,
#     db: Session = Depends(get_db)
# ):
#     booking = db.query(Booking).filter(Booking.id == booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")
    
#     # Get the ride
#     ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     # Check if ride has already started
#     if ride.started_at:
#         raise HTTPException(
#             status_code=400,
#             detail="Cannot modify seats - Ride has already started. Please contact driver directly."
#         )
    
#     # Check if ride is cancelled
#     if ride.cancellation_reason:
#         raise HTTPException(
#             status_code=400,
#             detail="Cannot modify seats - Ride has been cancelled."
#         )
    
#     # Check if booking status is accepted
#     if booking.status != "accepted":
#         raise HTTPException(
#             status_code=400,
#             detail="Cannot modify seats - Booking is not confirmed yet."
#         )
    
#     # Check if there's already a pending modification
#     existing = db.query(ModificationRequest).filter(
#         ModificationRequest.booking_id == booking_id,
#         ModificationRequest.status == "pending"
#     ).first()
    
#     if existing:
#         raise HTTPException(
#             status_code=400, 
#             detail="You already have a pending modification request"
#         )
    
#     # Calculate available seats
#     total_booked = db.query(func.sum(Booking.seats_requested)).filter(
#         Booking.ride_id == ride.id,
#         Booking.status == "accepted"
#     ).scalar() or 0
    
#     # Subtract current user's seats
#     other_booked = total_booked - booking.seats_requested
#     available_seats = ride.available_seats - other_booked
    
#     # Check if requested seats are available
#     if request.requested_seats > available_seats:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Only {available_seats} seat(s) available"
#         )
    
#     if request.requested_seats < 1:
#         raise HTTPException(
#             status_code=400,
#             detail="Minimum 1 seat required"
#         )
    
#     # Create modification request
#     mod_request = ModificationRequest(
#         booking_id=booking_id,
#         current_seats=booking.seats_requested,
#         requested_seats=request.requested_seats,
#         status="pending",
#         created_at=datetime.utcnow()
#     )
    
#     db.add(mod_request)
#     db.commit()
#     db.refresh(mod_request)
    
#     # Get passenger info for notification
#     passenger = db.query(User).filter(User.phone_number == booking.passenger_phone).first()
    
#     # Emit socket notification
#     await notify_driver_of_modification(
#         ride_id=ride.id,
#         booking_id=booking_id,
#         passenger_name=passenger.full_name if passenger else "Passenger",
#         passenger_photo=passenger.profile_picture if passenger else None,
#         current_seats=booking.seats_requested,
#         requested_seats=request.requested_seats
#     )
    
#     return {
#         "success": True, 
#         "message": "Modification request sent to driver",
#         "request": {
#             "id": mod_request.id,
#             "current_seats": mod_request.current_seats,
#             "requested_seats": mod_request.requested_seats,
#             "status": mod_request.status,
#             "created_at": mod_request.created_at.isoformat()
#         }
#     }
# @router.put("/modification-request/{request_id}/approve")
# def approve_modification_request(request_id: int, db: Session = Depends(get_db)):
#     mod_request = db.query(RideSeatModificationRequest).filter(
#         RideSeatModificationRequest.id == request_id
#     ).first()
    
#     if not mod_request:
#         raise HTTPException(status_code=404, detail="Modification request not found")
    
#     if mod_request.status != "pending":
#         raise HTTPException(status_code=400, detail=f"Request already {mod_request.status}")
    
#     booking = db.query(RideBooking).filter(RideBooking.id == mod_request.booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")
    
#     ride = db.query(Ride).filter(Ride.id == mod_request.ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     # ============================================
#     # ADD THIS CHECK - MODIFICATION LOCK
#     # ============================================
#     now = datetime.now(timezone.utc)
#     minutes_to_departure = (ride.departure_time - now).total_seconds() / 60
#     minutes_since_departure = (now - ride.departure_time).total_seconds() / 60

#     if minutes_to_departure <= 15:
#         mod_request.status = "rejected"
#         mod_request.rejection_reason = "Modification window closed (within 15 minutes of departure)"
#         db.commit()
#         raise HTTPException(
#             status_code=400,
#             detail="Cannot approve modification within 15 minutes of departure"
#         )
#     # ============================================
    
#     total_booked = get_total_booked_seats(db, ride.id)
#     other_booked = total_booked - booking.seats_booked
#     available_seats_excluding_this = ride.available_seats - other_booked
    
#     if mod_request.requested_seats > available_seats_excluding_this:
#         mod_request.status = "rejected"
#         mod_request.rejection_reason = "Not enough seats available"
#         db.commit()
#         raise HTTPException(
#             status_code=400,
#             detail=f"Cannot approve: Only {available_seats_excluding_this} seat(s) available"
#         )
    
#     old_seats = booking.seats_booked
#     booking.seats_booked = mod_request.requested_seats
#     booking.total_amount = ride.price_per_seat * mod_request.requested_seats
    
#     mod_request.status = "approved"
#     mod_request.approved_at = datetime.now(timezone.utc)
    
#     db.commit()
    
#     socket_data = {
#         "ride_id": ride.id,
#         "booking_id": booking.id,
#         "request_id": request_id,
#         "status": "approved",
#         "action": "approved",
#         "new_seats": mod_request.requested_seats,
#         "old_seats": old_seats,
#         "message": f"Your seat change request from {old_seats} to {mod_request.requested_seats} seat(s) has been approved"
#     }
    
#     emit_to_user(booking.passenger_phone, "modification-response", socket_data)
#     emit_to_ride(ride.id, "modification-response", socket_data)
    
#     return {
#         "message": "Modification request approved",
#         "booking_id": booking.id,
#         "old_seats": old_seats,
#         "new_seats": mod_request.requested_seats,
#         "new_total": booking.total_amount
#     }
# @router.put("/modification-request/{request_id}/reject")
# def reject_modification_request(request_id: int, rejection_reason: Optional[str] = "Driver declined", db: Session = Depends(get_db)):
#     mod_request = db.query(RideSeatModificationRequest).filter(
#         RideSeatModificationRequest.id == request_id
#     ).first()
    
#     if not mod_request:
#         raise HTTPException(status_code=404, detail="Modification request not found")
    
#     if mod_request.status != "pending":
#         raise HTTPException(status_code=400, detail=f"Request already {mod_request.status}")
    
#     booking = db.query(RideBooking).filter(RideBooking.id == mod_request.booking_id).first()
#     ride = db.query(Ride).filter(Ride.id == mod_request.ride_id).first()
    
#     mod_request.status = "rejected"
#     mod_request.rejection_reason = rejection_reason
#     mod_request.rejected_at = datetime.now(timezone.utc)
    
#     db.commit()
    
#     # ============================================
#     # EMIT SOCKET EVENT TO PASSENGER
#     # ============================================
#     socket_data = {
#         "ride_id": ride.id,
#         "booking_id": booking.id,
#         "request_id": request_id,
#         "status": "rejected",
#         "action": "rejected",
#         "reason": rejection_reason,
#         "message": f"Your seat change request was rejected: {rejection_reason}"
#     }
    
#     emit_to_user(booking.passenger_phone, "modification-response", socket_data)
#     emit_to_ride(ride.id, "modification-response", socket_data)
    
#     return {"message": "Modification request rejected", "booking_id": mod_request.booking_id}
# @router.get("/booking/{booking_id}/modification-request")
# def get_pending_modification_request(booking_id: int, db: Session = Depends(get_db)):
#     pending_request = db.query(RideSeatModificationRequest).filter(
#         RideSeatModificationRequest.booking_id == booking_id,
#         RideSeatModificationRequest.status == "pending"
#     ).first()
    
#     if pending_request:
#         return {
#             "has_pending": True,
#             "request": {
#                 "id": pending_request.id,
#                 "requested_seats": pending_request.requested_seats,
#                 "current_seats": pending_request.current_seats,
#                 "status": pending_request.status,
#                 "created_at": pending_request.created_at.isoformat()
#             }
#         }
    
#     return {"has_pending": False}


# @router.delete("/booking/{booking_id}/cancel-modification-request")
# def cancel_modification_request(booking_id: int, db: Session = Depends(get_db)):
#     mod_request = db.query(RideSeatModificationRequest).filter(
#         RideSeatModificationRequest.booking_id == booking_id,
#         RideSeatModificationRequest.status == "pending"
#     ).first()
    
#     if not mod_request:
#         raise HTTPException(status_code=404, detail="No pending modification request found")
    
#     mod_request.status = "cancelled"
#     mod_request.cancelled_at = datetime.now(timezone.utc)
    
#     db.commit()
    
#     return {"message": "Modification request cancelled successfully"}


# # ============================================
# # AUTO-EXPIRY ENDPOINTS
# # ============================================

# @router.get("/expire-pending-rides")
# def expire_pending_rides(db: Session = Depends(get_db)):
#     now = datetime.now(timezone.utc)
#     expiry_cutoff = now - timedelta(minutes=45)
    
#     expired_rides = db.query(Ride).filter(
#         Ride.departure_time < expiry_cutoff,
#         Ride.status.in_(["active", "full"]),
#         Ride.is_deleted == False
#     ).all()
    
#     expired_count = 0
#     notification_count = 0
    
#     for ride in expired_rides:
#         bookings = db.query(RideBooking).filter(
#             RideBooking.ride_id == ride.id,
#             RideBooking.status == "accepted"
#         ).all()
        
#         ride.status = "cancelled"
#         ride.cancellation_reason = "Auto-expired: Ride did not start within 45 minutes of scheduled time"
        
#         for booking in bookings:
#             booking.status = "cancelled"
#             booking.cancellation_reason = "Ride auto-expired"
            
#             try:
#                 notification = UserNotification(
#                     phone_number=booking.passenger_phone,
#                     title="Ride Auto-Expired ⏰",
#                     message=f"The ride from {ride.origin} to {ride.destination} scheduled at {to_ist(ride.departure_time).strftime('%I:%M %p')} has been auto-cancelled as it didn't start on time.",
#                     type=NotificationType.RIDE,
#                     action_type="ride",
#                     action_value=str(ride.id),
#                     is_read=False,
#                     is_deleted=False
#                 )
#                 db.add(notification)
#                 notification_count += 1
#             except Exception as e:
#                 print(f"Error sending expiry notification: {str(e)}")
        
#         expired_count += 1
    
#     db.commit()
    
#     return {
#         "message": f"Expired {expired_count} rides",
#         "expired_rides": expired_count,
#         "notifications_sent": notification_count
#     }


# @router.get("/expire-pending-requests")
# def expire_pending_requests(db: Session = Depends(get_db)):
#     now = datetime.now(timezone.utc)
#     expiry_threshold = now + timedelta(minutes=15)
    
#     pending_requests = db.query(RideBooking).join(Ride).filter(
#         RideBooking.status == "pending",
#         Ride.departure_time < expiry_threshold,
#         Ride.departure_time > now
#     ).all()
    
#     expired_count = 0
#     notification_count = 0
    
#     for booking in pending_requests:
#         booking.status = "rejected"
#         booking.rejection_reason = "Request timed out - driver did not respond in time"
        
#         try:
#             ride = booking.ride
#             origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
#             dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
            
#             notification = UserNotification(
#                 phone_number=booking.passenger_phone,
#                 title="Request Timed Out ⏰",
#                 message=f"Your request for the ride from {origin_short} to {dest_short} has expired as the driver didn't respond in time. Please try another ride.",
#                 type=NotificationType.RIDE,
#                 action_type="booking",
#                 action_value=str(booking.id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
#             notification_count += 1
#         except Exception as e:
#             print(f"Error sending timeout notification: {str(e)}")
        
#         expired_count += 1
    
#     db.commit()
    
#     return {
#         "message": f"Expired {expired_count} pending requests",
#         "expired_requests": expired_count,
#         "notifications_sent": notification_count
#     }
# @router.get("/ride/{ride_id}/pending-modifications")
# def get_pending_modifications_for_ride(ride_id: int, db: Session = Depends(get_db)):
#     print(f"🔍 DEBUG: get_pending_modifications_for_ride called with ride_id={ride_id}")
    
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     # Check if modifications are allowed
#     now = datetime.now(timezone.utc)
#     minutes_to_departure = (ride.departure_time - now).total_seconds() / 60
#     modifications_locked = minutes_to_departure <= 15 or ride.started_at or ride.cancellation_reason
    
#     pending_requests = db.query(RideSeatModificationRequest).join(RideBooking).filter(
#         RideSeatModificationRequest.ride_id == ride_id,
#         RideSeatModificationRequest.status == "pending"
#     ).order_by(RideSeatModificationRequest.created_at.desc()).all()
    
#     print(f"🔍 DEBUG: Found {len(pending_requests)} pending requests")
    
#     results = []
#     for req in pending_requests:
#         passenger = db.query(User).filter(User.phone_number == req.passenger_phone).first()
#         passenger_name = passenger.full_name if passenger else f"Passenger {req.passenger_phone[-4:]}"
        
#         results.append({
#             "id": req.id,
#             "booking_id": req.booking_id,
#             "passenger_name": passenger_name,
#             "passenger_phone": req.passenger_phone,
#             "passenger_photo": passenger.profile_picture if passenger else None,
#             "current_seats": req.current_seats,
#             "requested_seats": req.requested_seats,
#             "created_at": req.created_at.isoformat(),
#             "ride_id": req.ride_id
#         })
    
#     return {
#         "ride_id": ride_id,
#         "pending_requests": results,
#         "count": len(results),
#         "modifications_locked": modifications_locked,
#         "minutes_to_departure": round(minutes_to_departure)
#     }
# # Add this helper function at the top with other helper functions
# def can_modify_ride(ride: Ride) -> bool:
#     """Check if modifications are allowed (not within 15 minutes of departure and not started)"""
#     now = datetime.now(timezone.utc)
#     minutes_to_departure = (ride.departure_time - now).total_seconds() / 60
#     # Modifications allowed only if more than 15 minutes to departure, not started, not cancelled
#     return minutes_to_departure > 15 and not ride.started_at and not ride.cancellation_reason

# @router.post("/ride/{ride_id}/start")
# def start_ride(ride_id: int, db: Session = Depends(get_db)):
#     """Start a ride - only allowed within 15 minutes before to 30 minutes after departure"""
#     try:
#         ride = db.query(Ride).filter(Ride.id == ride_id).first()
#         if not ride:
#             raise HTTPException(status_code=404, detail="Ride not found")
        
#         if ride.started_at:
#             raise HTTPException(status_code=400, detail="Ride already started")
        
#         if ride.cancellation_reason:
#             raise HTTPException(status_code=400, detail=f"Cannot start cancelled ride: {ride.cancellation_reason}")
        
#         now = datetime.now(timezone.utc)
#         minutes_to_departure = (ride.departure_time - now).total_seconds() / 60
#         minutes_since_departure = (now - ride.departure_time).total_seconds() / 60
        
#         # Check if within valid start window: 15 min before to 30 min after departure
#         if minutes_to_departure > 15:
#             raise HTTPException(
#                 status_code=400,
#                 detail=f"Ride can only be started within 15 minutes of departure time. {int(minutes_to_departure)} minutes remaining."
#             )
        
#         if minutes_since_departure > 30:
#             # Auto-cancel the ride
#             ride.status = "cancelled"
#             ride.cancellation_reason = "Auto-cancelled: Ride was not started within 30 minutes of departure time"
            
#             # Cancel all accepted bookings
#             accepted_bookings = db.query(RideBooking).filter(
#                 RideBooking.ride_id == ride_id,
#                 RideBooking.status == "accepted"
#             ).all()
            
#             for booking in accepted_bookings:
#                 booking.status = "cancelled"
#                 booking.cancellation_reason = "Ride auto-cancelled - driver did not start on time"
                
#                 # Notify passenger
#                 notification = UserNotification(
#                     phone_number=booking.passenger_phone,
#                     title="Ride Auto-Cancelled ❌",
#                     message=f"The ride from {ride.origin} to {ride.destination} has been auto-cancelled as the driver did not start within 30 minutes.",
#                     type=NotificationType.RIDE,
#                     action_type="ride",
#                     action_value=str(ride.id),
#                     is_read=False,
#                     is_deleted=False
#                 )
#                 db.add(notification)
                
#                 # Emit socket event
#                 emit_to_user(booking.passenger_phone, "ride-auto-cancelled", {
#                     "ride_id": ride.id,
#                     "reason": "Driver did not start within 30 minutes"
#                 })
            
#             db.commit()
#             emit_to_ride(ride.id, "ride-auto-cancelled", {
#                 "ride_id": ride.id,
#                 "reason": "Driver did not start within 30 minutes"
#             })
            
#             raise HTTPException(
#                 status_code=400,
#                 detail="Ride has been auto-cancelled as it was not started within 30 minutes of departure time."
#             )
        
#         # Start the ride
#         ride.started_at = now
#         ride.status = "active"
        
#         # Create live session
#         import uuid
#         session_id = str(uuid.uuid4())
#         live_session = RideSession(
#             ride_id=ride_id,
#             session_id=session_id,
#             status="driver_started",
#             started_at=now
#         )
#         db.add(live_session)
#         db.commit()
#         db.refresh(live_session)
        
#         # Notify all accepted passengers
#         accepted_bookings = db.query(RideBooking).filter(
#             RideBooking.ride_id == ride_id,
#             RideBooking.status == "accepted"
#         ).all()
        
#         for booking in accepted_bookings:
#             # Create rider session entry
#             rider_session = RideSessionRider(
#                 session_id=live_session.id,
#                 booking_id=booking.id,
#                 passenger_phone=booking.passenger_phone,
#                 status="pending"
#             )
#             db.add(rider_session)
            
#             # Notify passenger
#             notification = UserNotification(
#                 phone_number=booking.passenger_phone,
#                 title="Ride Started! 🚗",
#                 message=f"The driver has started the ride from {ride.origin} to {ride.destination}. You can now track the journey live.",
#                 type=NotificationType.RIDE,
#                 action_type="ride",
#                 action_value=str(ride.id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
            
#             # Emit socket event
#             emit_to_user(booking.passenger_phone, "ride-started", {
#                 "ride_id": ride.id,
#                 "session_id": session_id,
#                 "booking_id": booking.id
#             })
        
#         db.commit()
        
#         # Emit to ride room
#         emit_to_ride(ride.id, "ride-started", {
#             "ride_id": ride.id,
#             "session_id": session_id
#         })
        
#         # Return JSON response
#         return {
#             "message": "Ride started successfully",
#             "session_id": session_id,
#             "ride_id": ride.id
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"Error starting ride: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
# @router.put("/ride/{ride_id}/auto-cancel")
# def auto_cancel_ride(ride_id: int, db: Session = Depends(get_db)):
#     """Auto-cancel a ride that wasn't started within 30 minutes"""
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     if ride.started_at:
#         return {"message": "Ride already started", "cancelled": False}
    
#     if ride.cancellation_reason:
#         return {"message": "Ride already cancelled", "cancelled": False}
    
#     now = datetime.now(timezone.utc)
#     minutes_since_departure = (now - ride.departure_time).total_seconds() / 60
    
#     if minutes_since_departure <= 30:
#         return {"message": "Ride still within start window", "cancelled": False}
    
#     # Auto-cancel the ride
#     ride.status = "cancelled"
#     ride.cancellation_reason = "Auto-cancelled: Ride was not started within 30 minutes of departure time"
    
#     # Cancel all accepted bookings
#     accepted_bookings = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status == "accepted"
#     ).all()
    
#     for booking in accepted_bookings:
#         booking.status = "cancelled"
#         booking.cancellation_reason = "Ride auto-cancelled - driver did not start on time"
        
#         notification = UserNotification(
#             phone_number=booking.passenger_phone,
#             title="Ride Auto-Cancelled ❌",
#             message=f"The ride from {ride.origin} to {ride.destination} has been auto-cancelled as the driver did not start within 30 minutes.",
#             type=NotificationType.RIDE,
#             action_type="ride",
#             action_value=str(ride.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(notification)
        
#         emit_to_user(booking.passenger_phone, "ride-auto-cancelled", {
#             "ride_id": ride.id,
#             "reason": "Driver did not start within 30 minutes"
#         })
    
#     db.commit()
    
#     emit_to_ride(ride.id, "ride-auto-cancelled", {
#         "ride_id": ride.id,
#         "reason": "Driver did not start within 30 minutes"
#     })
    
#     return {
#         "message": "Ride auto-cancelled successfully",
#         "cancelled": True,
#         "affected_passengers": len(accepted_bookings)
#     }


# @router.get("/ride/{ride_id}/can-modify")
# def check_can_modify_ride(ride_id: int, db: Session = Depends(get_db)):
#     """Check if modifications are allowed for this ride"""
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     now = datetime.now(timezone.utc)
#     minutes_to_departure = (ride.departure_time - now).total_seconds() / 60
    
#     return {
#         "can_modify": minutes_to_departure > 15 and not ride.started_at and not ride.cancellation_reason,
#         "minutes_to_departure": round(minutes_to_departure),
#         "is_started": ride.started_at is not None,
#         "is_cancelled": ride.cancellation_reason is not None
#     }


# @router.get("/ride/{ride_id}/live-session")
# def get_live_session(ride_id: int, db: Session = Depends(get_db)):
#     """Get active live session for a ride"""
#     live_session = db.query(RideSession).filter(
#         RideSession.ride_id == ride_id,
#         RideSession.status.in_(["driver_started", "boarding", "en_route"])
#     ).order_by(RideSession.id.desc()).first()
    
#     if live_session:
#         return {
#             "success": True,
#             "session": {
#                 "session_id": live_session.id,
#                 "status": live_session.status,
#                 "started_at": live_session.started_at.isoformat() if live_session.started_at else None
#             }
#         }
    
#     return {"success": False, "session": None}
# @router.get("/ride/{ride_id}/modification-request-for-chat")
# async def get_modification_request_for_chat(
#     ride_id: int,
#     user_phone: str,
#     db: Session = Depends(get_db)
# ):
#     """Get pending modification request for a ride for chat display"""
    
#     # Find the user's booking for this ride
#     booking = db.query(Booking).filter(
#         Booking.ride_id == ride_id,
#         (Booking.passenger_phone == user_phone) | (Booking.ride.has(driver_phone=user_phone))
#     ).first()
    
#     if not booking:
#         return {"success": False, "message": "No booking found"}
    
#     # Check for pending modification request
#     mod_request = db.query(ModificationRequest).filter(
#         ModificationRequest.booking_id == booking.id,
#         ModificationRequest.status == "pending"
#     ).first()
    
#     if mod_request:
#         return {
#             "success": True,
#             "request": {
#                 "id": mod_request.id,
#                 "current_seats": mod_request.current_seats,
#                 "requested_seats": mod_request.requested_seats,
#                 "status": mod_request.status,
#                 "passenger_name": booking.passenger_name,
#                 "passenger_phone": booking.passenger_phone,
#                 "driver_phone": booking.ride.driver_phone,
#                 "created_at": mod_request.created_at.isoformat() if mod_request.created_at else None
#             }
#         }
    
#     return {"success": False, "message": "No pending modification request"}
# import secrets

# from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session, joinedload
# from sqlalchemy import func, text, and_, or_
# from database import get_db
# from models import Ride, RideBooking, ModificationRequest, User, UserNotification, NotificationType, Vehicle, RideSession, RideSessionRider
# from datetime import datetime, timezone, timedelta
# from pydantic import BaseModel, field_validator
# from typing import Optional, Dict, List
# import math
# import re
# import uuid

# router = APIRouter()

# IST = timezone(timedelta(hours=5, minutes=30))
# SEARCH_RADIUS_M = 2000
# TIME_WINDOW_MINUTES = 60

# # Socket.IO instance
# _sio = None

# def set_sio_instance(sio_instance):
#     global _sio
#     _sio = sio_instance

# def emit_to_user(user_phone: str, event: str, data: dict):
#     global _sio
#     if _sio:
#         room_name = f"user_{user_phone}"
#         _sio.emit(event, data, room=room_name)
#         print(f"📡 Socket emitted to {room_name}: {event}")
#         return True
#     return False

# def emit_to_ride(ride_id: int, event: str, data: dict):
#     global _sio
#     if _sio:
#         room_name = f"ride_{ride_id}"
#         _sio.emit(event, data, room=room_name)
#         print(f"📡 Socket emitted to {room_name}: {event}")
#         return True
#     return False

# async def notify_driver_of_modification(ride_id, booking_id, passenger_name, passenger_photo, current_seats, requested_seats):
#     """Notify driver about modification request"""
#     if _sio:
#         _sio.emit('new-modification-request', {
#             'ride_id': ride_id,
#             'booking_id': booking_id,
#             'passenger_name': passenger_name,
#             'passenger_photo': passenger_photo,
#             'current_seats': current_seats,
#             'requested_seats': requested_seats
#         }, room=f'ride_{ride_id}')
#         print(f"📡 Emitted modification request to ride_{ride_id}")

# # ============================================
# # PYDANTIC MODELS
# # ============================================

# class CreateRideRequest(BaseModel):
#     phone_number: str
#     origin: str
#     destination: str
#     departure_time: datetime
#     available_seats: int
#     price_per_seat: float
#     origin_coords: List[float]
#     destination_coords: List[float]
#     route_coordinates: List[List[float]]
#     distance_km: Optional[float] = None
#     duration_text: Optional[str] = None
#     total_estimated_price: Optional[float] = None
#     preferences: Optional[Dict] = None
#     vehicle_id: Optional[int] = None
#     women_only: Optional[bool] = False

#     @field_validator("origin_coords", "destination_coords")
#     @classmethod
#     def validate_point_coords(cls, value):
#         if len(value) != 2:
#             raise ValueError("Coordinates must contain exactly [lng, lat]")
#         return value

#     @field_validator("route_coordinates")
#     @classmethod
#     def validate_route_coords(cls, value):
#         if len(value) < 2:
#             raise ValueError("Route must contain at least 2 coordinate points")
#         for point in value:
#             if not isinstance(point, list) or len(point) != 2:
#                 raise ValueError("Each route coordinate must be [lng, lat]")
#         return value


# class UpdateRideRequest(CreateRideRequest):
#     """Same as CreateRideRequest for ride updates"""
#     pass


# class SearchRidesRequest(BaseModel):
#     from_location: str
#     to_location: str
#     from_coords: List[float]
#     to_coords: List[float]
#     departure_time: datetime
#     seats_required: int = 1
#     passenger_gender: Optional[str] = None

#     @field_validator("from_coords", "to_coords")
#     @classmethod
#     def validate_search_coords(cls, value):
#         if len(value) != 2:
#             raise ValueError("Coordinates must contain exactly [lng, lat]")
#         return value


# class CreateRideBookingRequest(BaseModel):
#     ride_id: int
#     passenger_phone: str
#     seats_requested: int = 1
#     from_coords: Optional[List[float]] = None
#     to_coords: Optional[List[float]] = None

#     @field_validator("from_coords", "to_coords")
#     @classmethod
#     def validate_optional_coords(cls, value):
#         if value is None:
#             return value
#         if len(value) != 2:
#             raise ValueError("Coordinates must contain exactly [lng, lat]")
#         return value


# class ModifySeatsRequest(BaseModel):
#     new_seats: int


# class ModificationRequestSchema(BaseModel):
#     requested_seats: int


# class VehicleChangeNotification(BaseModel):
#     ride_id: int
#     old_vehicle_id: Optional[int] = None
#     new_vehicle_id: int


# # ============================================
# # HELPER FUNCTIONS
# # ============================================

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


# def parse_duration_to_minutes(duration_str: Optional[str]) -> int:
#     """Parse duration string like '1 Hr 30 Min' to minutes"""
#     if not duration_str:
#         return 60
    
#     mins = 0
#     hr_match = re.search(r'(\d+)\s*Hr', duration_str, re.IGNORECASE)
#     min_match = re.search(r'(\d+)\s*Min', duration_str, re.IGNORECASE)
    
#     if hr_match:
#         mins += int(hr_match.group(1)) * 60
#     if min_match:
#         mins += int(min_match.group(1))
    
#     return mins or 60


# def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
#     """Calculate distance between two points in kilometers using Haversine formula"""
#     R = 6371
#     dlat = math.radians(lat2 - lat1)
#     dlon = math.radians(lon2 - lon1)
#     a = math.sin(dlat/2) * math.sin(dlat/2) + \
#         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
#         math.sin(dlon/2) * math.sin(dlon/2)
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
#     return R * c


# def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
#     """Return distance in meters between two lat/lon points."""
#     R = 6371000
#     phi1 = math.radians(lat1)
#     phi2 = math.radians(lat2)
#     dphi = math.radians(lat2 - lat1)
#     dlambda = math.radians(lon2 - lon1)
#     a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
#     return R * c


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


# def get_available_seats(db: Session, ride_id: int) -> int:
#     """Calculate actual available seats = total seats - booked seats"""
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         return 0
#     total_booked = get_total_booked_seats(db, ride_id)
#     return max(0, ride.available_seats - total_booked)


# def check_overlapping_rides_for_driver(db: Session, phone_number: str, departure_time: datetime, duration_minutes: int, exclude_ride_id: Optional[int] = None) -> Optional[Dict]:
#     """Check if driver has overlapping active rides"""
    
#     departure_time_utc = departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
    
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
#     # Add buffer (30 minutes before start, 15 minutes after end for overlap detection)
#     buffer_start = departure_time_utc - timedelta(minutes=30)
#     buffer_end = expected_end_time + timedelta(minutes=15)
    
#     query = db.query(Ride).filter(
#         Ride.phone_number == phone_number,
#         Ride.status.in_(["active", "full"]),
#         Ride.departure_time < buffer_end,
#         Ride.expected_end_time > buffer_start
#     )
    
#     if exclude_ride_id:
#         query = query.filter(Ride.id != exclude_ride_id)
    
#     overlapping = query.first()
    
#     if overlapping:
#         return {
#             "ride_id": overlapping.id,
#             "origin": overlapping.origin,
#             "destination": overlapping.destination,
#             "departure_time": overlapping.departure_time,
#             "expected_end_time": overlapping.expected_end_time
#         }
    
#     return None


# def check_overlapping_bookings_for_passenger(db: Session, phone_number: str, departure_time: datetime, duration_minutes: int, exclude_booking_id: Optional[int] = None) -> Optional[Dict]:
#     """Check if passenger has overlapping active/accepted bookings"""
    
#     departure_time_utc = departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
    
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
#     # Add buffer (30 minutes before start, 60 minutes after end for passenger)
#     buffer_start = departure_time_utc - timedelta(minutes=30)
#     buffer_end = expected_end_time + timedelta(minutes=60)
    
#     query = db.query(RideBooking).join(Ride).filter(
#         RideBooking.passenger_phone == phone_number,
#         RideBooking.status.in_(["accepted"]),
#         Ride.departure_time < buffer_end,
#         Ride.expected_end_time > buffer_start
#     )
    
#     if exclude_booking_id:
#         query = query.filter(RideBooking.id != exclude_booking_id)
    
#     overlapping = query.first()
    
#     if overlapping:
#         return {
#             "booking_id": overlapping.id,
#             "ride_id": overlapping.ride_id,
#             "origin": overlapping.ride.origin,
#             "destination": overlapping.ride.destination,
#             "departure_time": overlapping.ride.departure_time,
#             "expected_end_time": overlapping.ride.expected_end_time
#         }
    
#     return None


# def find_nearest_route_vertex(route_coords: List[List[float]], lng: float, lat: float) -> Optional[Dict]:
#     """Find the nearest vertex in the route_coordinates array to the given point."""
#     if not route_coords or len(route_coords) < 2:
#         return None

#     best = None
#     best_dist = float('inf')

#     for point in route_coords:
#         if not isinstance(point, (list, tuple)) or len(point) < 2:
#             continue
#         plng, plat = float(point[0]), float(point[1])
#         dist = haversine_m(lat, lng, plat, plng)
#         if dist < best_dist:
#             best_dist = dist
#             best = {"lng": plng, "lat": plat}

#     return best


# def build_match_label(score: int) -> str:
#     if score >= 90:
#         return "Excellent"
#     if score >= 75:
#         return "Good"
#     if score >= 60:
#         return "Fair"
#     return "Low"


# # ============================================
# # RIDE ENDPOINTS
# # ============================================

# @router.post("/post-ride")
# def post_ride(data: CreateRideRequest, db: Session = Depends(get_db)):
#     normalized_phone = normalize_phone(data.phone_number)
    
#     # Parse duration
#     duration_minutes = parse_duration_to_minutes(data.duration_text)
    
#     # Convert departure time to UTC
#     departure_time_utc = data.departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         departure_time_utc = departure_time_utc.astimezone(timezone.utc)
    
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
#     # Check if user has overlapping ACCEPTED bookings as a passenger
#     passenger_overlap = check_overlapping_bookings_for_passenger(db, normalized_phone, departure_time_utc, duration_minutes)
#     if passenger_overlap:
#         raise HTTPException(
#             status_code=409,
#             detail=f"You have a confirmed booking as a passenger from {passenger_overlap['origin']} to {passenger_overlap['destination']} at {to_ist(passenger_overlap['departure_time']).strftime('%I:%M %p')} that overlaps with this ride. Please complete that ride before offering another."
#         )
    
#     # Check for overlapping rides (Time Buffer Block)
#     overlapping = check_overlapping_rides_for_driver(db, normalized_phone, departure_time_utc, duration_minutes)
#     if overlapping:
#         end_time_ist = to_ist(overlapping["expected_end_time"])
#         raise HTTPException(
#             status_code=409,
#             detail=f"You already have an active ride from {overlapping['origin']} to {overlapping['destination']} at {to_ist(overlapping['departure_time']).strftime('%I:%M %p')}. Please wait until {end_time_ist.strftime('%I:%M %p')} to post another ride."
#         )
    
#     # Validate distance (3km - 300km)
#     distance = calculate_distance_km(
#         data.origin_coords[1], data.origin_coords[0],
#         data.destination_coords[1], data.destination_coords[0]
#     )
    
#     MIN_DISTANCE_KM = 3
#     MAX_DISTANCE_KM = 300
    
#     if distance < MIN_DISTANCE_KM:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Pickup and destination are too close ({distance:.1f} km). Minimum distance is {MIN_DISTANCE_KM} km for a ride."
#         )
    
#     if distance > MAX_DISTANCE_KM:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Distance too far ({distance:.1f} km). Maximum allowed is {MAX_DISTANCE_KM} km for daily commutes."
#         )
    
#     # Validate time (minimum 30 minutes from now)
#     min_departure_time = datetime.now(timezone.utc) + timedelta(minutes=30)
#     if departure_time_utc < min_departure_time:
#         min_time_ist = to_ist(min_departure_time)
#         raise HTTPException(
#             status_code=400,
#             detail=f"Departure time must be at least 30 minutes from now. Please select a time after {min_time_ist.strftime('%I:%M %p')}."
#         )
    
#     # Get women_only from preferences
#     women_only = data.preferences.get('womenOnly', False) if data.preferences else data.women_only
    
#     # Create ride
#     ride = Ride(
#         phone_number=normalized_phone,
#         origin=data.origin,
#         destination=data.destination,
#         departure_time=departure_time_utc,
#         expected_end_time=expected_end_time,
#         duration_minutes=duration_minutes,
#         available_seats=data.available_seats,
#         price_per_seat=data.price_per_seat,
#         distance_km=data.distance_km,
#         duration_text=data.duration_text,
#         total_estimated_price=data.total_estimated_price,
#         preferences=data.preferences,
#         origin_lon=data.origin_coords[0],
#         origin_lat=data.origin_coords[1],
#         destination_lon=data.destination_coords[0],
#         destination_lat=data.destination_coords[1],
#         route_coordinates=data.route_coordinates,
#         vehicle_id=data.vehicle_id,
#         women_only=women_only,
#         status="active",
#     )

#     db.add(ride)
#     db.commit()
#     db.refresh(ride)

#     # Update geometry (if PostGIS is enabled, otherwise skip)
#     try:
#         if data.route_coordinates and len(data.route_coordinates) >= 2:
#             line_wkt = "LINESTRING(" + ",".join(
#                 [f"{lng} {lat}" for lng, lat in data.route_coordinates]
#             ) + ")"
#             db.execute(
#                 text("""
#                     UPDATE rides
#                     SET route_line = ST_GeomFromText(:line_wkt, 4326)::geography
#                     WHERE id = :ride_id
#                 """),
#                 {"ride_id": ride.id, "line_wkt": line_wkt}
#             )
#             db.commit()
#     except Exception as e:
#         print(f"⚠️ PostGIS update skipped: {str(e)}")

#     # Create notification for ride posted
#     try:
#         origin_short = data.origin.split(",")[0].strip() if data.origin else "start"
#         dest_short = data.destination.split(",")[0].strip() if data.destination else "destination"

#         notification = UserNotification(
#             phone_number=normalized_phone,
#             title="Ride Posted! 🚗",
#             message=f"Your ride from {origin_short} to {dest_short} has been posted. You'll be notified when passengers book!",
#             type=NotificationType.RIDE,
#             action_type="ride",
#             action_value=str(ride.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(notification)
#         db.commit()
#         print(f"✅ Ride posted notification created for {normalized_phone}")
#     except Exception as e:
#         print(f"❌ Error creating ride posted notification: {str(e)}")

#     return {
#         "message": "Ride posted successfully",
#         "ride_id": ride.id
#     }


# @router.put("/update-ride/{ride_id}")
# def update_ride(ride_id: int, data: UpdateRideRequest, db: Session = Depends(get_db)):
#     normalized_phone = normalize_phone(data.phone_number)

#     # Fetch existing ride
#     ride = db.query(Ride).filter(
#         Ride.id == ride_id,
#         Ride.phone_number == normalized_phone
#     ).first()
    
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found or you don't have permission to edit it")

#     # Check if ride has confirmed bookings
#     confirmed_bookings = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status == "accepted"
#     ).all()
    
#     has_confirmed_bookings = len(confirmed_bookings) > 0
#     total_booked_seats = sum(b.seats_booked for b in confirmed_bookings)
    
#     # Women Only toggle validation
#     new_women_only = data.preferences.get('womenOnly', False) if data.preferences else data.women_only
    
#     if ride.women_only != new_women_only:
#         if new_women_only == False and ride.women_only == True:
#             female_bookings = db.query(RideBooking).join(User).filter(
#                 RideBooking.ride_id == ride_id,
#                 RideBooking.status == "accepted",
#                 User.gender == "female"
#             ).count()
            
#             if female_bookings > 0:
#                 raise HTTPException(
#                     status_code=403,
#                     detail=f"Cannot disable Women Only mode - {female_bookings} female passenger(s) have already booked this ride based on the safety promise."
#                 )
    
#     # Calculate time difference for validation
#     departure_time_utc = data.departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         departure_time_utc = departure_time_utc.astimezone(timezone.utc)
    
#     time_diff_minutes = abs((departure_time_utc - ride.departure_time).total_seconds()) / 60
    
#     # Check for major changes that require auto-rejecting pending requests
#     major_changes = []
#     auto_reject_pending = False
    
#     if ride.origin != data.origin:
#         major_changes.append("Origin changed")
#         auto_reject_pending = True
#     if ride.destination != data.destination:
#         major_changes.append("Destination changed")
#         auto_reject_pending = True
#     if time_diff_minutes > 15:
#         major_changes.append(f"Time changed by {int(time_diff_minutes)} minutes")
#         auto_reject_pending = True
#     if ride.price_per_seat != data.price_per_seat and data.price_per_seat > ride.price_per_seat:
#         major_changes.append("Price increased")
#         auto_reject_pending = True
    
#     # Lock major fields if there are confirmed bookings
#     if has_confirmed_bookings:
#         critical_changes = []
        
#         if ride.origin != data.origin:
#             critical_changes.append("Origin")
#         if ride.destination != data.destination:
#             critical_changes.append("Destination")
#         if time_diff_minutes > 10:
#             critical_changes.append("Time (more than 10 minutes)")
#         if ride.price_per_seat != data.price_per_seat:
#             critical_changes.append("Price")
        
#         if critical_changes:
#             raise HTTPException(
#                 status_code=403,
#                 detail=f"Cannot modify: {', '.join(critical_changes)}. This ride has {len(confirmed_bookings)} confirmed booking(s). Please cancel the ride and create a new one if you need major changes."
#             )
    
#     # Validate seat changes (cannot reduce below booked seats)
#     if data.available_seats < total_booked_seats:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Cannot reduce seats below {total_booked_seats} as you have {total_booked_seats} confirmed passenger(s)."
#         )
    
#     # Parse duration
#     duration_minutes = parse_duration_to_minutes(data.duration_text)
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
#     # Check for overlapping rides (excluding current ride) - only if time changed significantly
#     if time_diff_minutes > 30:
#         overlapping = check_overlapping_rides_for_driver(db, normalized_phone, departure_time_utc, duration_minutes, exclude_ride_id=ride_id)
#         if overlapping:
#             end_time_ist = to_ist(overlapping["expected_end_time"])
#             raise HTTPException(
#                 status_code=409,
#                 detail=f"Cannot update: You have another active ride from {overlapping['origin']} to {overlapping['destination']} at {to_ist(overlapping['departure_time']).strftime('%I:%M %p')} that overlaps with this new time."
#             )
    
#     # Check if vehicle changed (for notification)
#     vehicle_changed = ride.vehicle_id != data.vehicle_id
    
#     # Update ride fields
#     ride.origin = data.origin
#     ride.destination = data.destination
#     ride.departure_time = departure_time_utc
#     ride.expected_end_time = expected_end_time
#     ride.duration_minutes = duration_minutes
#     ride.available_seats = data.available_seats
#     ride.price_per_seat = data.price_per_seat
#     ride.distance_km = data.distance_km
#     ride.duration_text = data.duration_text
#     ride.total_estimated_price = data.total_estimated_price
#     ride.preferences = data.preferences
#     ride.origin_lon = data.origin_coords[0]
#     ride.origin_lat = data.origin_coords[1]
#     ride.destination_lon = data.destination_coords[0]
#     ride.destination_lat = data.destination_coords[1]
#     ride.route_coordinates = data.route_coordinates
#     ride.vehicle_id = data.vehicle_id
#     ride.women_only = new_women_only

#     # Update status based on remaining seats
#     remaining_seats = ride.available_seats - total_booked_seats
#     if remaining_seats <= 0 and ride.status == "active":
#         ride.status = "full"
#     elif remaining_seats > 0 and ride.status == "full":
#         ride.status = "active"

#     db.commit()
#     db.refresh(ride)

#     # Auto-reject pending requests if major changes
#     rejected_count = 0
#     if auto_reject_pending and has_confirmed_bookings == False:
#         pending_requests = db.query(RideBooking).filter(
#             RideBooking.ride_id == ride_id,
#             RideBooking.status == "pending"
#         ).all()
        
#         for pending in pending_requests:
#             pending.status = "rejected"
#             pending.rejection_reason = f"Driver modified ride details: {', '.join(major_changes)}"
#             rejected_count += 1
            
#             try:
#                 notification = UserNotification(
#                     phone_number=pending.passenger_phone,
#                     title="Ride Details Changed 🔄",
#                     message=f"The driver has modified the ride details ({', '.join(major_changes)}). Please review and request again if it still suits you.",
#                     type=NotificationType.RIDE,
#                     action_type="ride",
#                     action_value=str(ride.id),
#                     is_read=False,
#                     is_deleted=False
#                 )
#                 db.add(notification)
#             except Exception as e:
#                 print(f"Error sending rejection notification: {str(e)}")
        
#         db.commit()

#     # Update geometry (if PostGIS is enabled)
#     try:
#         if data.route_coordinates and len(data.route_coordinates) >= 2:
#             line_wkt = "LINESTRING(" + ",".join(
#                 [f"{lng} {lat}" for lng, lat in data.route_coordinates]
#             ) + ")"
#             db.execute(
#                 text("""
#                     UPDATE rides
#                     SET route_line = ST_GeomFromText(:line_wkt, 4326)::geography
#                     WHERE id = :ride_id
#                 """),
#                 {"ride_id": ride.id, "line_wkt": line_wkt}
#             )
#             db.commit()
#     except Exception as e:
#         print(f"⚠️ PostGIS update skipped: {str(e)}")

#     # Send notification if vehicle changed and has bookings
#     if vehicle_changed and has_confirmed_bookings:
#         try:
#             old_vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first() if ride.vehicle_id else None
#             new_vehicle = db.query(Vehicle).filter(Vehicle.id == data.vehicle_id).first() if data.vehicle_id else None
            
#             old_vehicle_text = f"{old_vehicle.make} {old_vehicle.model} ({old_vehicle.registration_number})" if old_vehicle else "previous vehicle"
#             new_vehicle_text = f"{new_vehicle.make} {new_vehicle.model} ({new_vehicle.registration_number})" if new_vehicle else "new vehicle"
            
#             for booking in confirmed_bookings:
#                 notification = UserNotification(
#                     phone_number=booking.passenger_phone,
#                     title="Vehicle Changed 🚗",
#                     message=f"Driver has changed vehicle from {old_vehicle_text} to {new_vehicle_text}. Please check ride details.",
#                     type=NotificationType.RIDE,
#                     action_type="ride",
#                     action_value=str(ride.id),
#                     is_read=False,
#                     is_deleted=False
#                 )
#                 db.add(notification)
#             db.commit()
#             print(f"✅ Sent vehicle change notifications to {len(confirmed_bookings)} passengers")
#         except Exception as e:
#             print(f"❌ Error sending vehicle change notifications: {str(e)}")

#     # Create notification for ride update
#     try:
#         origin_short = data.origin.split(",")[0].strip() if data.origin else "start"
#         dest_short = data.destination.split(",")[0].strip() if data.destination else "destination"
        
#         notification_title = "Ride Updated! 🔄" if not vehicle_changed else "Ride & Vehicle Updated! 🔄🚗"
        
#         notification = UserNotification(
#             phone_number=normalized_phone,
#             title=notification_title,
#             message=f"Your ride from {origin_short} to {dest_short} has been updated.",
#             type=NotificationType.RIDE,
#             action_type="ride",
#             action_value=str(ride.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(notification)
#         db.commit()
#     except Exception as e:
#         print(f"❌ Error creating update notification: {str(e)}")

#     return {
#         "message": "Ride updated successfully",
#         "ride_id": ride.id,
#         "remaining_seats": max(0, ride.available_seats - total_booked_seats),
#         "total_booked": total_booked_seats,
#         "vehicle_changed": vehicle_changed,
#         "notifications_sent": len(confirmed_bookings) if vehicle_changed else 0,
#         "auto_rejected_pending": rejected_count,
#         "auto_reject_reason": major_changes if auto_reject_pending else None
#     }


# @router.post("/search-rides")
# def search_rides(data: SearchRidesRequest, db: Session = Depends(get_db)):
#     req_time_utc = data.departure_time
#     if req_time_utc.tzinfo is None:
#         req_time_utc = req_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         req_time_utc = req_time_utc.astimezone(timezone.utc)

#     # Build query - Include BOTH active and full rides
#     query = db.query(Ride).filter(
#         Ride.status.in_(["active", "full"]),
#         Ride.departure_time.between(
#             req_time_utc - timedelta(minutes=TIME_WINDOW_MINUTES),
#             req_time_utc + timedelta(minutes=TIME_WINDOW_MINUTES)
#         )
#     )
    
#     # Apply women-only filter at database level
#     if data.passenger_gender != 'female':
#         query = query.filter(Ride.women_only == False)

#     # Execute query
#     all_rides = query.all()
    
#     rides = []
    
#     for ride in all_rides:
#         # Calculate actual remaining seats
#         total_booked = get_total_booked_seats(db, ride.id)
#         remaining_seats = max(0, ride.available_seats - total_booked)
        
#         # Skip if no seats available
#         if remaining_seats == 0:
#             continue
        
#         # Calculate distances if coordinates available
#         pickup_distance_m = 0
#         drop_distance_m = 0
#         pickup_point = None
#         drop_point = None
        
#         if ride.origin_lat and ride.origin_lon and ride.destination_lat and ride.destination_lon:
#             pickup_distance_m = haversine_m(
#                 ride.origin_lat, ride.origin_lon,
#                 data.from_coords[1], data.from_coords[0]
#             )
#             drop_distance_m = haversine_m(
#                 ride.destination_lat, ride.destination_lon,
#                 data.to_coords[1], data.to_coords[0]
#             )
            
#             # Find nearest points on route
#             if ride.route_coordinates:
#                 pickup_point = find_nearest_route_vertex(ride.route_coordinates, data.from_coords[0], data.from_coords[1])
#                 drop_point = find_nearest_route_vertex(ride.route_coordinates, data.to_coords[0], data.to_coords[1])
        
#         # Skip if too far
#         if pickup_distance_m > SEARCH_RADIUS_M * 2 or drop_distance_m > SEARCH_RADIUS_M * 2:
#             continue
        
#         # Calculate match score
#         pickup_score = max(0, 1 - (pickup_distance_m / SEARCH_RADIUS_M))
#         drop_score = max(0, 1 - (drop_distance_m / SEARCH_RADIUS_M))
        
#         time_diff_min = abs((ride.departure_time - req_time_utc).total_seconds()) / 60
#         time_score = max(0, 1 - (time_diff_min / 60))
        
#         match_percentage = round(
#             100 * (0.35 * pickup_score + 0.35 * drop_score + 0.20 * time_score + 0.10)
#         )
        
#         # Get driver info
#         driver = db.query(User).filter(
#             User.phone_number == ride.phone_number
#         ).first()
        
#         driver_name = None
#         if driver:
#             driver_name = driver.full_name or " ".join(filter(None, [driver.first_name, driver.last_name]))
#         if not driver_name:
#             driver_name = f"Driver {ride.phone_number[-4:]}"
        
#         # Get vehicle info
#         vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first() if ride.vehicle_id else None
        
#         departure_time_ist = to_ist(ride.departure_time)
        
#         rides.append({
#             "id": ride.id,
#             "driverName": driver_name,
#             "driverUserId": driver.user_id if driver else None,
#             "phoneNumber": ride.phone_number,
#             "email": driver.email if driver else None,
#             "profileCompleted": driver.profile_completed if driver else False,
#             "userStatus": driver.status.value if driver else None,
#             "profilePicture": driver.profile_picture if driver else None,
#             "driverGender": driver.gender if driver else None,
#             "womenOnly": ride.women_only,
#             "vehicle": {
#                 "id": vehicle.id if vehicle else None,
#                 "make": vehicle.make if vehicle else None,
#                 "model": vehicle.model if vehicle else None,
#                 "color": vehicle.color if vehicle else None,
#                 "registrationNumber": vehicle.registration_number if vehicle else None,
#                 "photoUrl": vehicle.photo_url if vehicle else None,
#             },
#             "rating": driver.avg_rating if driver and driver.avg_rating else 4.5,
#             "date": departure_time_ist.strftime("%d %b %Y"),
#             "time": departure_time_ist.strftime("%I:%M %p"),
#             "from": ride.origin,
#             "to": ride.destination,
#             "suggestedPickup": pickup_point,
#             "suggestedDrop": drop_point,
#             "pickupWalkDistanceM": int(pickup_distance_m),
#             "dropWalkDistanceM": int(drop_distance_m),
#             "pickupLabel": f"Walk {int(pickup_distance_m)} m to pickup point" if pickup_distance_m > 0 else "Pickup point",
#             "dropLabel": f"Walk {int(drop_distance_m)} m from drop point" if drop_distance_m > 0 else "Drop point",
#             "price": ride.price_per_seat,
#             "matchPercentage": match_percentage,
#             "matchLabel": build_match_label(match_percentage),
#             "seatsAvailable": remaining_seats,
#             "totalSeats": ride.available_seats,
#             "bookedSeats": total_booked,
#             "seatsRequested": data.seats_required,
#             "isFull": remaining_seats == 0,
#             "distanceKm": ride.distance_km,
#             "durationText": ride.duration_text,
#             "totalEstimatedPrice": ride.total_estimated_price,
#             "timeDifferenceMin": round(time_diff_min),
#             "routeCoordinates": ride.route_coordinates or [],
#             "status": ride.status,
#         })
    
#     rides.sort(
#         key=lambda x: (
#             -x["matchPercentage"],
#             x["timeDifferenceMin"],
#             x["pickupWalkDistanceM"] + x["dropWalkDistanceM"]
#         )
#     )
    
#     return {"rides": rides}


# @router.post("/ride-bookings")
# def create_ride_booking(data: CreateRideBookingRequest, db: Session = Depends(get_db)):
#     passenger_phone = normalize_phone(data.passenger_phone)

#     ride = db.query(Ride).filter(Ride.id == data.ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")

#     if ride.status not in ["active", "full"]:
#         raise HTTPException(status_code=400, detail="Ride is not available")

#     # Check available seats
#     total_booked = get_total_booked_seats(db, ride.id)
#     remaining_seats = ride.available_seats - total_booked
    
#     if remaining_seats < data.seats_requested:
#         raise HTTPException(status_code=400, detail=f"Not enough seats available. Only {remaining_seats} seat(s) left.")

#     if ride.phone_number == passenger_phone:
#         raise HTTPException(status_code=400, detail="You cannot book your own ride")
    
#     # Check if user already has an ACCEPTED booking for this ride
#     existing_accepted = db.query(RideBooking).filter(
#         RideBooking.ride_id == data.ride_id,
#         RideBooking.passenger_phone == passenger_phone,
#         RideBooking.status == "accepted"
#     ).first()

#     if existing_accepted:
#         raise HTTPException(
#             status_code=400, 
#             detail="You already have a confirmed booking for this ride. Please contact the driver if you need to modify your seat count."
#         )
    
#     # Check for multiple ride requests for same journey (max 2)
#     active_requests = db.query(RideBooking).filter(
#         RideBooking.passenger_phone == passenger_phone,
#         RideBooking.status == "pending",
#         RideBooking.created_at > datetime.now(timezone.utc) - timedelta(minutes=10)
#     ).count()
    
#     if active_requests >= 2:
#         raise HTTPException(status_code=400, detail="You can only have 2 active ride requests at a time. Please wait for responses before requesting more rides.")

#     existing_pending = db.query(RideBooking).filter(
#         RideBooking.ride_id == data.ride_id,
#         RideBooking.passenger_phone == passenger_phone,
#         RideBooking.status == "pending"
#     ).first()

#     if existing_pending:
#         raise HTTPException(status_code=400, detail="You already requested this ride")
    
#     # Get ride duration for overlap check
#     duration_minutes = ride.duration_minutes or parse_duration_to_minutes(ride.duration_text) or 60
    
#     # Check for overlapping active bookings
#     overlapping = check_overlapping_bookings_for_passenger(db, passenger_phone, ride.departure_time, duration_minutes)
#     if overlapping:
#         raise HTTPException(
#             status_code=409,
#             detail=f"You already have a confirmed booking for a ride from {overlapping['origin']} to {overlapping['destination']} at {to_ist(overlapping['departure_time']).strftime('%I:%M %p')} that overlaps with this ride."
#         )

#     # Compute intersection points if coords provided
#     pickup_lat = pickup_lon = drop_lat = drop_lon = None
#     int_pickup_lat = int_pickup_lon = int_drop_lat = int_drop_lon = None
#     pickup_walk_m = drop_walk_m = None

#     if data.from_coords and data.to_coords and ride.route_coordinates:
#         try:
#             sql = text("""
#                 WITH input AS (
#                     SELECT
#                         ST_SetSRID(ST_MakePoint(:from_lng, :from_lat), 4326)::geography AS rider_pickup,
#                         ST_SetSRID(ST_MakePoint(:to_lng, :to_lat), 4326)::geography AS rider_drop
#                 )
#                 SELECT
#                     ST_Distance(r.route_line, i.rider_pickup) AS pickup_distance_m,
#                     ST_Distance(r.route_line, i.rider_drop) AS drop_distance_m
#                 FROM rides r
#                 CROSS JOIN input i
#                 WHERE r.id = :ride_id
#             """)

#             result = db.execute(sql, {
#                 "ride_id": ride.id,
#                 "from_lng": data.from_coords[0],
#                 "from_lat": data.from_coords[1],
#                 "to_lng": data.to_coords[0],
#                 "to_lat": data.to_coords[1],
#             }).mappings().first()

#             if result:
#                 pickup_walk_m = int(float(result["pickup_distance_m"]))
#                 drop_walk_m = int(float(result["drop_distance_m"]))

#                 # Use nearest route vertex for accessible junction points
#                 route_coords = ride.route_coordinates or []
#                 pickup_pt = find_nearest_route_vertex(route_coords, data.from_coords[0], data.from_coords[1])
#                 drop_pt = find_nearest_route_vertex(route_coords, data.to_coords[0], data.to_coords[1])

#                 if pickup_pt:
#                     int_pickup_lon = pickup_pt["lng"]
#                     int_pickup_lat = pickup_pt["lat"]
#                 if drop_pt:
#                     int_drop_lon = drop_pt["lng"]
#                     int_drop_lat = drop_pt["lat"]

#                 pickup_lat = data.from_coords[1]
#                 pickup_lon = data.from_coords[0]
#                 drop_lat = data.to_coords[1]
#                 drop_lon = data.to_coords[0]
#         except Exception as e:
#             print(f"⚠️ Intersection compute error (non-fatal): {e}")

#     # Defensive: ensure price_per_seat is valid before computing total
#     if ride.price_per_seat is None:
#         raise HTTPException(status_code=500, detail="Ride pricing is not configured. Please contact support.")

#     total_amount = ride.price_per_seat * data.seats_requested

#     booking = RideBooking(
#         ride_id=data.ride_id,
#         passenger_phone=passenger_phone,
#         seats_booked=data.seats_requested,
#         total_amount=total_amount,
#         pickup_lat=pickup_lat,
#         pickup_lon=pickup_lon,
#         drop_lat=drop_lat,
#         drop_lon=drop_lon,
#         intersection_pickup_lat=int_pickup_lat,
#         intersection_pickup_lon=int_pickup_lon,
#         intersection_drop_lat=int_drop_lat,
#         intersection_drop_lon=int_drop_lon,
#         pickup_walk_distance_m=pickup_walk_m,
#         drop_walk_distance_m=drop_walk_m,
#         status="pending"
#     )

#     db.add(booking)
#     db.flush()

#     try:
#         driver_phone = normalize_phone(ride.phone_number)

#         origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
#         dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"

#         notification = UserNotification(
#             phone_number=driver_phone,
#             title="New Ride Request 🙋",
#             message=f"You received a request for {data.seats_requested} seat(s) for your ride from {origin_short} to {dest_short}.",
#             type=NotificationType.RIDE,
#             action_type="booking",
#             action_value=str(booking.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(notification)

#     except Exception as e:
#         print(f"❌ Error creating booking notification: {str(e)}")

#     db.commit()
#     db.refresh(booking)

#     return {
#         "message": "Ride request sent successfully",
#         "booking_id": booking.id,
#         "status": booking.status
#     }


# @router.put("/modification-request/{request_id}/reject")
# def reject_modification_request(request_id: int, rejection_reason: Optional[str] = "Driver declined", db: Session = Depends(get_db)):
#     mod_request = db.query(ModificationRequest).filter(
#         ModificationRequest.id == request_id
#     ).first()
    
#     if not mod_request:
#         raise HTTPException(status_code=404, detail="Modification request not found")
    
#     if mod_request.status != "pending":
#         raise HTTPException(status_code=400, detail=f"Request already {mod_request.status}")
    
#     booking = db.query(RideBooking).filter(RideBooking.id == mod_request.booking_id).first()
#     ride = db.query(Ride).filter(Ride.id == mod_request.ride_id).first()
    
#     mod_request.status = "rejected"
#     mod_request.rejection_reason = rejection_reason
#     mod_request.rejected_at = datetime.now(timezone.utc)
    
#     db.commit()
    
#     socket_data = {
#         "ride_id": ride.id,
#         "booking_id": booking.id,
#         "request_id": request_id,
#         "status": "rejected",
#         "action": "rejected",
#         "reason": rejection_reason,
#         "message": f"Your seat change request was rejected: {rejection_reason}"
#     }
    
#     emit_to_user(booking.passenger_phone, "modification-response", socket_data)
#     emit_to_ride(ride.id, "modification-response", socket_data)
    
#     return {"message": "Modification request rejected", "booking_id": mod_request.booking_id}



# @router.get("/ride/{ride_id}/modification-request-for-chat")
# async def get_modification_request_for_chat(
#     ride_id: int,
#     user_phone: str,
#     db: Session = Depends(get_db)
# ):
#     """Get pending modification request for a ride for chat display"""
    
#     # Find the user's booking for this ride
#     booking = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride_id,
#         (RideBooking.passenger_phone == user_phone) | 
#         (RideBooking.ride.has(phone_number=user_phone))
#     ).first()
    
#     if not booking:
#         return {"success": False, "message": "No booking found"}
    
#     # Check for pending modification request
#     mod_request = db.query(ModificationRequest).filter(
#         ModificationRequest.booking_id == booking.id,
#         ModificationRequest.status == "pending"
#     ).first()
    
#     if mod_request:
#         # Get driver info
#         ride = db.query(Ride).filter(Ride.id == ride_id).first()
        
#         return {
#             "success": True,
#             "request": {
#                 "id": mod_request.id,
#                 "current_seats": mod_request.current_seats,
#                 "requested_seats": mod_request.requested_seats,
#                 "status": mod_request.status,
#                 "passenger_name": booking.passenger_name,
#                 "passenger_phone": booking.passenger_phone,
#                 "driver_phone": ride.phone_number if ride else None,
#                 "created_at": mod_request.created_at.isoformat() if mod_request.created_at else None
#             }
#         }
    
#     return {"success": False, "message": "No pending modification request"}


# # ============================================
# # RIDE PASSENGERS ENDPOINT
# # ============================================

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
#         p = db.query(User).filter(
#             User.phone_number == bk.passenger_phone
#         ).first()

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
#             "pickup_lat": bk.pickup_lat,
#             "pickup_lon": bk.pickup_lon,
#             "drop_lat": bk.drop_lat,
#             "drop_lon": bk.drop_lon,
#             "intersection_pickup_lat": bk.intersection_pickup_lat,
#             "intersection_pickup_lon": bk.intersection_pickup_lon,
#             "intersection_drop_lat": bk.intersection_drop_lat,
#             "intersection_drop_lon": bk.intersection_drop_lon,
#             "pickup_walk_distance_m": bk.pickup_walk_distance_m,
#             "drop_walk_distance_m": bk.drop_walk_distance_m,
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
#         "passengers": passengers,"duration_text": ride.duration_text,  # ✅ ADD THIS
#         "distance_km": ride.distance_km,      # ✅ ADD THIS
#         "price_per_seat": ride.price_per_seat, # ✅ ADD THIS
#     }


# # ============================================
# # AUTO-CANCEL ENDPOINTS
# # ============================================

# @router.put("/ride/{ride_id}/auto-cancel")
# def auto_cancel_ride(ride_id: int, db: Session = Depends(get_db)):
#     """Auto-cancel a ride that wasn't started within 30 minutes"""
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     if ride.started_at:
#         return {"message": "Ride already started", "cancelled": False}
    
#     if ride.cancellation_reason:
#         return {"message": "Ride already cancelled", "cancelled": False}
    
#     now = datetime.now(timezone.utc)
#     minutes_since_departure = (now - ride.departure_time).total_seconds() / 60
    
#     if minutes_since_departure <= 30:
#         return {"message": "Ride still within start window", "cancelled": False}
    
#     # Auto-cancel the ride
#     ride.status = "cancelled"
#     ride.cancellation_reason = "Auto-cancelled: Ride was not started within 30 minutes of departure time"
    
#     # Cancel all accepted bookings
#     accepted_bookings = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status == "accepted"
#     ).all()
    
#     for booking in accepted_bookings:
#         booking.status = "cancelled"
#         booking.cancellation_reason = "Ride auto-cancelled - driver did not start on time"
        
#         notification = UserNotification(
#             phone_number=booking.passenger_phone,
#             title="Ride Auto-Cancelled ❌",
#             message=f"The ride from {ride.origin} to {ride.destination} has been auto-cancelled as the driver did not start within 30 minutes.",
#             type=NotificationType.RIDE,
#             action_type="ride",
#             action_value=str(ride.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(notification)
        
#         emit_to_user(booking.passenger_phone, "ride-auto-cancelled", {
#             "ride_id": ride.id,
#             "reason": "Driver did not start within 30 minutes"
#         })
    
#     db.commit()
    
#     emit_to_ride(ride.id, "ride-auto-cancelled", {
#         "ride_id": ride.id,
#         "reason": "Driver did not start within 30 minutes"
#     })
    
#     return {
#         "message": "Ride auto-cancelled successfully",
#         "cancelled": True,
#         "affected_passengers": len(accepted_bookings)
#     }


# @router.get("/ride/{ride_id}/can-modify")
# def check_can_modify_ride(ride_id: int, db: Session = Depends(get_db)):
#     """Check if modifications are allowed for this ride"""
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     now = datetime.now(timezone.utc)
#     minutes_since_departure = (now - ride.departure_time).total_seconds() / 60
    
#     # Modifications allowed if: not started AND not auto-cancelled (30+ min past)
#     can_modify = not ride.started_at and minutes_since_departure <= 30 and not ride.cancellation_reason
    
#     return {
#         "can_modify": can_modify,
#         "is_started": ride.started_at is not None,
#         "is_cancelled": ride.cancellation_reason is not None,
#         "minutes_since_departure": round(minutes_since_departure) if minutes_since_departure > 0 else 0
#     }

# @router.post("/ride/{ride_id}/start")
# def start_ride(ride_id: int, db: Session = Depends(get_db)):
#     """Start a ride - only allowed within 15 minutes before to 30 minutes after departure"""
#     try:
#         ride = db.query(Ride).filter(Ride.id == ride_id).first()
#         if not ride:
#             raise HTTPException(status_code=404, detail="Ride not found")
        
#         if ride.started_at:
#             raise HTTPException(status_code=400, detail="Ride already started")
        
#         if ride.cancellation_reason:
#             raise HTTPException(status_code=400, detail=f"Cannot start cancelled ride: {ride.cancellation_reason}")
        
#         now = datetime.now(timezone.utc)
#         minutes_to_departure = (ride.departure_time - now).total_seconds() / 60
#         minutes_since_departure = (now - ride.departure_time).total_seconds() / 60
        
#         # Check if within valid start window: 15 min before to 30 min after departure
#         if minutes_to_departure > 15:
#             raise HTTPException(
#                 status_code=400,
#                 detail=f"Ride can only be started within 15 minutes of departure time. {int(minutes_to_departure)} minutes remaining."
#             )
        
#         if minutes_since_departure > 30:
#             # Auto-cancel the ride
#             ride.status = "cancelled"
#             ride.cancellation_reason = "Auto-cancelled: Ride was not started within 30 minutes of departure time"
            
#             accepted_bookings = db.query(RideBooking).filter(
#                 RideBooking.ride_id == ride_id,
#                 RideBooking.status == "accepted"
#             ).all()
            
#             for booking in accepted_bookings:
#                 booking.status = "cancelled"
#                 booking.cancellation_reason = "Ride auto-cancelled - driver did not start on time"
                
#                 # Send notification
#                 notification = UserNotification(
#                     phone_number=booking.passenger_phone,
#                     title="Ride Auto-Cancelled ❌",
#                     message=f"The ride from {ride.origin} to {ride.destination} has been auto-cancelled as the driver did not start within 30 minutes.",
#                     type=NotificationType.RIDE,
#                     action_type="ride",
#                     action_value=str(ride.id),
#                     is_read=False,
#                     is_deleted=False
#                 )
#                 db.add(notification)
            
#             db.commit()
            
#             raise HTTPException(
#                 status_code=400,
#                 detail="Ride has been auto-cancelled as it was not started within 30 minutes of departure time."
#             )
        
#         # Start the ride
#         ride.started_at = now
#         ride.status = "active"
#         db.commit()
        
#         # Create live session
#         try:
#             qr_token = secrets.token_hex(16)
            
#             live_session = RideSession(
#                 ride_id=ride_id,
#                 driver_phone=ride.phone_number,
#                 status="driver_started",
#                 current_phase="boarding",
#                 qr_code_token=qr_token,
#                 qr_expires_at=datetime.utcnow() + timedelta(hours=8),
#                 started_at=datetime.utcnow()
#             )
#             db.add(live_session)
#             db.flush()
            
#             # Add all accepted riders to session
#             accepted_bookings = db.query(RideBooking).filter(
#                 RideBooking.ride_id == ride_id,
#                 RideBooking.status == "accepted"
#             ).all()
            
#             for booking in accepted_bookings:
#                 rider_user = db.query(User).filter(User.phone_number == booking.passenger_phone).first()
                
#                 rider_session = RideSessionRider(
#                     session_id=live_session.id,
#                     booking_id=booking.id,
#                     rider_phone=booking.passenger_phone,
#                     rider_name=rider_user.full_name if rider_user else None,
#                     rider_photo=rider_user.profile_picture if rider_user else None,
#                     pickup_location=ride.origin,
#                     dropoff_location=ride.destination,
#                     status="accepted"
#                 )
#                 db.add(rider_session)
                
#                 # Notify passenger
#                 notification = UserNotification(
#                     phone_number=booking.passenger_phone,
#                     title="Ride Started! 🚗",
#                     message=f"The driver has started the ride from {ride.origin} to {ride.destination}. You can now track the journey live.",
#                     type=NotificationType.RIDE,
#                     action_type="ride",
#                     action_value=str(ride.id),
#                     is_read=False,
#                     is_deleted=False
#                 )
#                 db.add(notification)
            
#             db.commit()
#             db.refresh(live_session)
            
#             return {
#                 "message": "Ride started successfully",
#                 "session_id": live_session.id,
#                 "ride_id": ride.id
#             }
            
#         except Exception as e:
#             print(f"Error creating live session: {str(e)}")
#             db.rollback()
#             return {
#                 "message": "Ride started but session creation failed",
#                 "ride_id": ride.id
#             }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"Error starting ride: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
# @router.get("/ride/{ride_id}/live-session")
# def get_live_session(ride_id: int, db: Session = Depends(get_db)):
#     """Get active live session for a ride"""
#     live_session = db.query(RideSession).filter(
#         RideSession.ride_id == ride_id,
#         RideSession.status.in_(["driver_started", "boarding", "en_route"])
#     ).order_by(RideSession.id.desc()).first()
    
#     if live_session:
#         return {
#             "success": True,
#             "session": {
#                 "session_id": live_session.id,
#                 "status": live_session.status,
#                 "started_at": live_session.started_at.isoformat() if live_session.started_at else None
#             }
#         }
    
#     return {"success": False, "session": None}


# # ============================================
# # MY RIDES ENDPOINT
# # ============================================

# @router.get("/my-rides/{phone}")
# def get_my_rides(phone: str, db: Session = Depends(get_db)):
#     norm_phone = normalize_phone(phone)
    
#     # POSTED RIDES (Driver)
#     posted_rides = db.query(Ride).filter(
#         Ride.phone_number == norm_phone,
#         Ride.is_deleted == False
#     ).order_by(
#         Ride.departure_time.desc()
#     ).all()
    
#     # Get bookings for all posted rides
#     posted_ride_ids = [r.id for r in posted_rides]
#     bookings_map = {}
    
#     if posted_ride_ids:
#         bookings_raw = db.execute(text("""
#             SELECT 
#                 rb.id, rb.ride_id, rb.passenger_phone, rb.seats_booked, rb.status,
#                 rb.created_at, rb.total_amount, rb.cancellation_reason,
#                 u.full_name as passenger_name, u.first_name, u.last_name, 
#                 u.profile_picture as passenger_profile_picture,
#                 u.gender as passenger_gender
#             FROM ride_bookings rb 
#             LEFT JOIN users u ON u.phone_number = rb.passenger_phone
#             WHERE rb.ride_id = ANY(:ride_ids)
#             ORDER BY rb.created_at DESC
#         """), {"ride_ids": posted_ride_ids}).mappings().all()
        
#         for bk in bookings_raw:
#             ride_id = bk["ride_id"]
#             if ride_id not in bookings_map:
#                 bookings_map[ride_id] = []
            
#             passenger_name = bk["passenger_name"] or " ".join(
#                 p for p in [bk["first_name"], bk["last_name"]] if p
#             ).strip() or f"Passenger {bk['passenger_phone'][-4:]}"
            
#             bookings_map[ride_id].append({
#                 "id": bk["id"],
#                 "ride_id": ride_id,
#                 "passenger_phone": bk["passenger_phone"],
#                 "passenger_name": passenger_name,
#                 "passenger_photo": bk["passenger_profile_picture"],
#                 "passenger_gender": bk["passenger_gender"],
#                 "seats_requested": bk["seats_booked"],
#                 "status": bk["status"],
#                 "cancellation_reason": bk["cancellation_reason"],
#                 "total_amount": float(bk["total_amount"]) if bk["total_amount"] else None,
#                 "created_at": bk["created_at"].isoformat() if bk["created_at"] else None,
#             })
    
#     # Format posted rides with complete data
#     posted_formatted = []
#     for ride in posted_rides:
#         total_booked = get_total_booked_seats(db, ride.id)
#         remaining_seats = max(0, ride.available_seats - total_booked)
        
#         display_status = ride.status
#         if remaining_seats == 0 and ride.status == "active":
#             display_status = "full"
        
#         # Get driver's own profile picture
#         driver_info = db.query(User).filter(User.phone_number == ride.phone_number).first()
#         driver_profile_picture = driver_info.profile_picture if driver_info else None
        
#         # Get vehicle details
#         vehicle = None
#         if ride.vehicle_id:
#             vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first()
        
#         vehicle_data = None
#         if vehicle:
#             vehicle_data = {
#                 "id": vehicle.id,
#                 "make": vehicle.make,
#                 "model": vehicle.model,
#                 "color": vehicle.color,
#                 "registration_number": vehicle.registration_number,
#                 "photo_url": vehicle.photo_url,
#             }
        
#         # Get live session if exists
#         live_session_data = None
#         try:
#             live_session = db.query(RideSession).filter(
#                 RideSession.ride_id == ride.id,
#                 RideSession.status.in_(["driver_started", "boarding", "en_route", "emergency_stopped"])
#             ).order_by(RideSession.id.desc()).first()
            
#             if live_session:
#                 boarded_count = sum(1 for r in live_session.riders if r.status in ["boarded", "dropped_off", "completed"])
#                 dropped_count = sum(1 for r in live_session.riders if r.status in ["dropped_off", "completed"])
#                 live_session_data = {
#                     "session_id": live_session.id,
#                     "status": live_session.status,
#                     "current_phase": live_session.current_phase,
#                     "boarded_count": boarded_count,
#                     "dropped_count": dropped_count,
#                     "total_riders": len(live_session.riders)
#                 }
#         except Exception as e:
#             print(f"Error fetching live session: {str(e)}")
        
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
#             "total_booked_seats": total_booked,
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
#             "cancellation_reason": ride.cancellation_reason
#         })
    
#     # REQUESTED RIDES (Passenger bookings)
#     requested_raw = db.execute(text("""
#         SELECT 
#             rb.id, rb.ride_id, rb.passenger_phone, rb.seats_booked, rb.status,
#             rb.created_at, rb.total_amount, rb.cancellation_reason,
#             r.origin, r.destination, r.departure_time, r.price_per_seat, r.available_seats,
#             r.distance_km, r.duration_text, r.status as ride_status, r.women_only,
#             r.route_coordinates, r.started_at as ride_started_at,
#             u.full_name as driver_name, u.first_name, u.last_name, u.phone_number as driver_phone,
#             u.user_id as driver_user_id, u.profile_completed, 
#             u.profile_picture as driver_profile_picture,
#             u.avg_rating as driver_rating,
#             v.id as vehicle_id, v.make, v.model, v.color, v.registration_number,
#             ls.id as session_id, ls.status as session_status
#         FROM ride_bookings rb
#         JOIN rides r ON r.id = rb.ride_id
#         LEFT JOIN users u ON u.phone_number = r.phone_number
#         LEFT JOIN vehicles v ON v.id = r.vehicle_id
#         LEFT JOIN ride_sessions ls ON ls.ride_id = r.id AND ls.status IN ('driver_started', 'boarding', 'en_route')
#         WHERE rb.passenger_phone = :phone
#         ORDER BY rb.created_at DESC
#     """), {"phone": norm_phone}).mappings().all()
    
#     requested_formatted = []
#     for row in requested_raw:
#         driver_name = row["driver_name"] or " ".join(
#             p for p in [row["first_name"], row["last_name"]] if p
#         ).strip() or f"Driver {row['driver_phone'][-4:] if row['driver_phone'] else 'Unknown'}"
        
#         # Build vehicle object
#         vehicle_data = None
#         if row["vehicle_id"]:
#             vehicle_data = {
#                 "id": row["vehicle_id"],
#                 "make": row["make"],
#                 "model": row["model"],
#                 "color": row["color"],
#                 "registration_number": row["registration_number"],
#             }
        
#         # Live session data
#         live_session_data = None
#         if row["session_id"]:
#             live_session_data = {
#                 "session_id": row["session_id"],
#                 "status": row["session_status"]
#             }
        
#         requested_formatted.append({
#             "id": row["id"],
#             "ride_id": row["ride_id"],
#             "passenger_phone": row["passenger_phone"],
#             "seats_requested": row["seats_booked"],
#             "total_amount": float(row["total_amount"]) if row["total_amount"] else None,
#             "status": row["status"],
#             "cancellation_reason": row["cancellation_reason"],
#             "created_at": row["created_at"].isoformat() if row["created_at"] else None,
#             "origin": row["origin"],
#             "destination": row["destination"],
#             "departure_time": row["departure_time"].isoformat() if row["departure_time"] else None,
#             "departure_time_display": to_ist(row["departure_time"]).strftime("%d %b %Y, %I:%M %p") if row["departure_time"] else None,
#             "price_per_seat": row["price_per_seat"],
#             "available_seats": row["available_seats"],
#             "distance_km": row["distance_km"],
#             "duration_text": row["duration_text"],
#             "ride_status": row["ride_status"],
#             "women_only": row["women_only"],
#             "driver_name": driver_name,
#             "driver_phone": row["driver_phone"],
#             "driver_user_id": row["driver_user_id"],
#             "driver_photo": row["driver_profile_picture"],
#             "driver_rating": float(row["driver_rating"]) if row["driver_rating"] else 4.5,
#             "profile_completed": row["profile_completed"],
#             "route_coordinates": row["route_coordinates"],
#             "vehicle": vehicle_data,
#             "live_session": live_session_data,
#             "started_at": row["ride_started_at"].isoformat() if row["ride_started_at"] else None
#         })
    
#     return {
#         "posted_rides": posted_formatted,
#         "requested_rides": requested_formatted
#     }


# # ============================================
# # BOOKING ACTION ENDPOINTS
# # ============================================

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

#     # Check seat availability before accepting
#     total_booked = get_total_booked_seats(db, ride.id)
#     remaining_seats = ride.available_seats - total_booked
    
#     if remaining_seats < booking.seats_booked:
#         booking.status = "rejected"
#         db.commit()
#         raise HTTPException(status_code=400, detail="Not enough seats available anymore")

#     # Accept the booking
#     booking.status = "accepted"
    
#     # Auto-withdraw all other pending requests for this ride
#     other_pending = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride.id,
#         RideBooking.id != booking_id,
#         RideBooking.status == "pending"
#     ).all()
    
#     withdrawn_count = 0
#     for pending_booking in other_pending:
#         pending_booking.status = "rejected"
#         pending_booking.rejection_reason = "Rider joined another vehicle"
#         withdrawn_count += 1
        
#         try:
#             notification = UserNotification(
#                 phone_number=pending_booking.passenger_phone,
#                 title="Request Auto-Withdrawn",
#                 message="Your ride request was automatically withdrawn because the driver accepted another passenger.",
#                 type=NotificationType.RIDE,
#                 action_type="booking",
#                 action_value=str(pending_booking.id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
#         except Exception as e:
#             print(f"Error sending auto-withdrawal notification: {str(e)}")
    
#     # Update ride status if full
#     total_booked_after = get_total_booked_seats(db, ride.id)
#     if ride.available_seats <= total_booked_after:
#         ride.status = "full"
    
#     db.commit()

#     # Create notification for accepted passenger
#     try:
#         origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
#         dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
        
#         notification = UserNotification(
#             phone_number=booking.passenger_phone,
#             title="Booking Accepted! ✅",
#             message=f"Your request for {booking.seats_booked} seat(s) on the ride from {origin_short} to {dest_short} has been accepted by the driver.",
#             type=NotificationType.RIDE,
#             action_type="booking",
#             action_value=str(booking.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(notification)
#         db.commit()
#         print(f"✅ Booking acceptance notification sent to {booking.passenger_phone}")
#     except Exception as e:
#         print(f"❌ Error creating booking acceptance notification: {str(e)}")

#     return {
#         "message": "Booking accepted", 
#         "withdrawn_count": withdrawn_count,
#         "withdrawn_reason": "Rider joined another vehicle"
#     }


# @router.put("/booking/{booking_id}/reject")
# def reject_booking(booking_id: int, db: Session = Depends(get_db)):
#     booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")

#     if booking.status != "pending":
#         raise HTTPException(status_code=400, detail="Already processed")

#     booking.status = "rejected"
#     db.commit()

#     # Create notification for passenger
#     try:
#         ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#         if ride:
#             origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
#             dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
            
#             notification = UserNotification(
#                 phone_number=booking.passenger_phone,
#                 title="Booking Declined ❌",
#                 message=f"Your request for the ride from {origin_short} to {dest_short} was declined by the driver.",
#                 type=NotificationType.RIDE,
#                 action_type="booking",
#                 action_value=str(booking.id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
#             db.commit()
#     except Exception as e:
#         print(f"❌ Error creating booking rejection notification: {str(e)}")

#     return {"message": "Booking rejected"}


# @router.put("/booking/{booking_id}/cancel")
# def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
#     booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")

#     ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")

#     if booking.status == "accepted":
#         if ride.status == "full":
#             ride.status = "active"

#     booking.status = "cancelled"
#     db.commit()

#     try:
#         notification = UserNotification(
#             phone_number=ride.phone_number,
#             title="Booking Cancelled",
#             message=f"A passenger has cancelled their booking for your ride from {ride.origin} to {ride.destination}.",
#             type=NotificationType.RIDE,
#             action_type="ride",
#             action_value=str(ride.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(notification)
#         db.commit()
#     except Exception as e:
#         print(f"❌ Error creating cancellation notification for driver: {str(e)}")

#     return {"message": "Booking cancelled successfully"}


# @router.put("/ride/{ride_id}/cancel")
# def cancel_ride(ride_id: int, db: Session = Depends(get_db)):
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")

#     ride.status = "cancelled"

#     # Cancel all accepted bookings
#     bookings = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status == "accepted"
#     ).all()

#     for booking in bookings:
#         booking.status = "cancelled"
        
#         try:
#             notification = UserNotification(
#                 phone_number=booking.passenger_phone,
#                 title="Ride Cancelled ❌",
#                 message=f"The ride from {ride.origin} to {ride.destination} has been cancelled by the driver.",
#                 type=NotificationType.RIDE,
#                 action_type="ride",
#                 action_value=str(ride_id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
#         except Exception as e:
#             print(f"❌ Error creating cancellation notification: {str(e)}")

#     db.commit()

#     return {"message": "Ride cancelled successfully", "affected_passengers": len(bookings)}
# # ============================================
# # MODIFICATION REQUEST ENDPOINTS - PERMANENT FIX
# # ============================================

# @router.post("/booking/{booking_id}/request-modification")
# async def request_modification(
#     booking_id: int,
#     request: ModificationRequestSchema,
#     db: Session = Depends(get_db)
# ):
#     """Request to modify seat count for a booking"""
#     try:
#         # Get booking
#         booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#         if not booking:
#             return {"success": False, "message": "Booking not found"}
        
#         # Get the ride
#         ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#         if not ride:
#             return {"success": False, "message": "Ride not found"}
        
#         # Check conditions
#         if ride.started_at:
#             return {"success": False, "message": "Cannot modify seats - Ride has already started"}
        
#         if ride.cancellation_reason:
#             return {"success": False, "message": "Cannot modify seats - Ride has been cancelled"}
        
#         if booking.status != "accepted":
#             return {"success": False, "message": "Cannot modify seats - Booking is not confirmed yet"}
        
#         # Check for existing pending request
#         existing = db.query(ModificationRequest).filter(
#             ModificationRequest.booking_id == booking_id,
#             ModificationRequest.status == "pending"
#         ).first()
        
#         if existing:
#             return {"success": False, "message": "You already have a pending modification request"}
        
#         # Calculate available seats
#         total_booked = db.query(func.sum(RideBooking.seats_booked)).filter(
#             RideBooking.ride_id == ride.id,
#             RideBooking.status == "accepted"
#         ).scalar() or 0
        
#         other_booked = total_booked - booking.seats_booked
#         available_seats = ride.available_seats - other_booked
        
#         # Validate requested seats
#         if request.requested_seats > available_seats:
#             return {"success": False, "message": f"Only {available_seats} seat(s) available"}
        
#         if request.requested_seats < 1:
#             return {"success": False, "message": "Minimum 1 seat required"}
        
#         # Create modification request
#         mod_request = ModificationRequest(
#             booking_id=booking_id,
#             ride_id=ride.id,
#             passenger_phone=booking.passenger_phone,
#             current_seats=booking.seats_booked,
#             requested_seats=request.requested_seats,
#             status="pending",
#             created_at=datetime.now(timezone.utc)
#         )
        
#         db.add(mod_request)
#         db.commit()
#         db.refresh(mod_request)
        
#         # Get passenger info
#         passenger = db.query(User).filter(User.phone_number == booking.passenger_phone).first()
        
#         # Notify driver via socket
#         await notify_driver_of_modification(
#             ride_id=ride.id,
#             booking_id=booking_id,
#             passenger_name=passenger.full_name if passenger else "Passenger",
#             passenger_photo=passenger.profile_picture if passenger else None,
#             current_seats=booking.seats_booked,
#             requested_seats=request.requested_seats
#         )
        
#         return {
#             "success": True, 
#             "message": "Modification request sent to driver",
#             "request": {
#                 "id": mod_request.id,
#                 "current_seats": mod_request.current_seats,
#                 "requested_seats": mod_request.requested_seats,
#                 "status": mod_request.status,
#                 "created_at": mod_request.created_at.isoformat()
#             }
#         }
        
#     except Exception as e:
#         print(f"Error in request_modification: {str(e)}")
#         db.rollback()
#         return {"success": False, "message": str(e)}


# @router.get("/booking/{booking_id}/modification-request")
# def get_pending_modification_request(booking_id: int, db: Session = Depends(get_db)):
#     """Get pending modification request for a booking"""
#     try:
#         # Find pending modification request
#         pending_request = db.query(ModificationRequest).filter(
#             ModificationRequest.booking_id == booking_id,
#             ModificationRequest.status == "pending"
#         ).first()
        
#         if pending_request:
#             return {
#                 "has_pending": True,
#                 "request": {
#                     "id": pending_request.id,
#                     "requested_seats": pending_request.requested_seats,
#                     "current_seats": pending_request.current_seats,
#                     "status": pending_request.status,
#                     "created_at": pending_request.created_at.isoformat() if pending_request.created_at else None
#                 }
#             }
        
#         return {"has_pending": False}
        
#     except Exception as e:
#         print(f"Error in get_pending_modification_request: {str(e)}")
#         return {"has_pending": False, "error": str(e)}


# @router.get("/ride/{ride_id}/pending-modifications")
# def get_pending_modifications_for_ride(ride_id: int, db: Session = Depends(get_db)):
#     """Get all pending modification requests for a ride (for driver)"""
#     try:
#         ride = db.query(Ride).filter(Ride.id == ride_id).first()
#         if not ride:
#             return {"success": False, "message": "Ride not found"}
        
#         # Check if modifications are locked
#         now = datetime.now(timezone.utc)
#         minutes_since_departure = (now - ride.departure_time).total_seconds() / 60
#         modifications_locked = ride.started_at or (minutes_since_departure > 30)
        
#         # Get pending requests
#         pending_requests = db.query(ModificationRequest).filter(
#             ModificationRequest.ride_id == ride_id,
#             ModificationRequest.status == "pending"
#         ).order_by(ModificationRequest.created_at.desc()).all()
        
#         results = []
#         for req in pending_requests:
#             # Get booking to find passenger
#             booking = db.query(RideBooking).filter(RideBooking.id == req.booking_id).first()
#             passenger = None
#             passenger_name = "Unknown"
            
#             if booking:
#                 passenger = db.query(User).filter(User.phone_number == booking.passenger_phone).first()
#                 if passenger:
#                     passenger_name = passenger.full_name or f"{passenger.first_name or ''} {passenger.last_name or ''}".strip()
#                 if not passenger_name or passenger_name == "":
#                     passenger_name = f"Passenger {booking.passenger_phone[-4:]}"
            
#             results.append({
#                 "id": req.id,
#                 "booking_id": req.booking_id,
#                 "passenger_name": passenger_name,
#                 "passenger_phone": req.passenger_phone,
#                 "passenger_photo": passenger.profile_picture if passenger else None,
#                 "current_seats": req.current_seats,
#                 "requested_seats": req.requested_seats,
#                 "created_at": req.created_at.isoformat() if req.created_at else None,
#                 "ride_id": req.ride_id
#             })
        
#         return {
#             "success": True,
#             "ride_id": ride_id,
#             "pending_requests": results,
#             "count": len(results),
#             "modifications_locked": modifications_locked,
#             "minutes_since_departure": round(minutes_since_departure) if minutes_since_departure > 0 else 0
#         }
        
#     except Exception as e:
#         print(f"Error in get_pending_modifications_for_ride: {str(e)}")
#         return {"success": False, "message": str(e), "pending_requests": []}


# @router.put("/modification-request/{request_id}/approve")
# def approve_modification_request(request_id: int, db: Session = Depends(get_db)):
#     """Approve a modification request"""
#     try:
#         mod_request = db.query(ModificationRequest).filter(ModificationRequest.id == request_id).first()
        
#         if not mod_request:
#             return {"success": False, "message": "Modification request not found"}
        
#         if mod_request.status != "pending":
#             return {"success": False, "message": f"Request already {mod_request.status}"}
        
#         booking = db.query(RideBooking).filter(RideBooking.id == mod_request.booking_id).first()
#         if not booking:
#             return {"success": False, "message": "Booking not found"}
        
#         ride = db.query(Ride).filter(Ride.id == mod_request.ride_id).first()
#         if not ride:
#             return {"success": False, "message": "Ride not found"}
        
#         # Check if modification is still allowed
#         if ride.started_at:
#             mod_request.status = "rejected"
#             mod_request.rejection_reason = "Cannot modify - Ride has already started"
#             db.commit()
#             return {"success": False, "message": "Cannot approve - Ride has already started"}
        
#         # Calculate available seats
#         total_booked = db.query(func.sum(RideBooking.seats_booked)).filter(
#             RideBooking.ride_id == ride.id,
#             RideBooking.status == "accepted"
#         ).scalar() or 0
        
#         other_booked = total_booked - booking.seats_booked
#         available_seats = ride.available_seats - other_booked
        
#         if mod_request.requested_seats > available_seats:
#             mod_request.status = "rejected"
#             mod_request.rejection_reason = "Not enough seats available"
#             db.commit()
#             return {"success": False, "message": f"Only {available_seats} seat(s) available"}
        
#         # Update booking
#         old_seats = booking.seats_booked
#         booking.seats_booked = mod_request.requested_seats
#         booking.total_amount = ride.price_per_seat * mod_request.requested_seats
        
#         # Update modification request
#         mod_request.status = "approved"
#         mod_request.approved_at = datetime.now(timezone.utc)
        
#         db.commit()
        
#         # Notify passenger
#         socket_data = {
#             "success": True,
#             "booking_id": booking.id,
#             "request_id": request_id,
#             "status": "approved",
#             "new_seats": mod_request.requested_seats,
#             "old_seats": old_seats,
#             "message": f"Your seat change request from {old_seats} to {mod_request.requested_seats} seat(s) has been approved"
#         }
        
#         emit_to_user(booking.passenger_phone, "modification-response", socket_data)
#         emit_to_ride(ride.id, "modification-response", socket_data)
        
#         return {
#             "success": True,
#             "message": "Modification request approved",
#             "booking_id": booking.id,
#             "old_seats": old_seats,
#             "new_seats": mod_request.requested_seats,
#             "new_total": booking.total_amount
#         }
        
#     except Exception as e:
#         print(f"Error in approve_modification_request: {str(e)}")
#         db.rollback()
#         return {"success": False, "message": str(e)}


# @router.delete("/booking/{booking_id}/cancel-modification-request")
# def cancel_modification_request(booking_id: int, db: Session = Depends(get_db)):
#     """Cancel a pending modification request"""
#     try:
#         mod_request = db.query(ModificationRequest).filter(
#             ModificationRequest.booking_id == booking_id,
#             ModificationRequest.status == "pending"
#         ).first()
        
#         if not mod_request:
#             return {"success": False, "message": "No pending modification request found"}
        
#         mod_request.status = "cancelled"
#         mod_request.cancelled_at = datetime.now(timezone.utc)
        
#         db.commit()
        
#         return {"success": True, "message": "Modification request cancelled successfully"}
        
#     except Exception as e:
#         print(f"Error in cancel_modification_request: {str(e)}")
#         db.rollback()
#         return {"success": False, "message": str(e)}

# # Add this Pydantic model at the top with your other models
# class BatchModificationRequest(BaseModel):
#     booking_ids: List[int]

# @router.post("/bookings/modification-requests/batch")
# def get_batch_modification_requests(request: BatchModificationRequest, db: Session = Depends(get_db)):
#     """Get pending modification requests for multiple bookings in one call"""
#     if not request.booking_ids:
#         return {"requests": {}}
    
#     # Single query for all bookings
#     mod_requests = db.query(ModificationRequest).filter(
#         ModificationRequest.booking_id.in_(request.booking_ids),
#         ModificationRequest.status == "pending"
#     ).all()
    
#     result = {}
#     for req in mod_requests:
#         result[req.booking_id] = {
#             "id": req.id,
#             "current_seats": req.current_seats,
#             "requested_seats": req.requested_seats,
#             "status": req.status,
#             "created_at": req.created_at.isoformat() if req.created_at else None
#         }
    
#     return {"requests": result}
# # Add to your ride.py backend file
# @router.get("/my-rides-optimized/{phone}")
# def get_my_rides_optimized(
#     phone: str, 
#     limit: int = Query(20, ge=1, le=100),
#     offset: int = Query(0, ge=0),
#     db: Session = Depends(get_db)
# ):
#     """Optimized version with pagination and batch loading - Returns ALL data same as regular endpoint"""
#     norm_phone = normalize_phone(phone)
    
#     # Get posted rides with pagination
#     posted_rides_query = db.query(Ride).filter(
#         Ride.phone_number == norm_phone,
#         Ride.is_deleted == False
#     ).order_by(Ride.departure_time.desc())
    
#     total_posted = posted_rides_query.count()
#     posted_rides = posted_rides_query.offset(offset).limit(limit).all()
    
#     # Batch load bookings for all posted rides in ONE query
#     posted_ride_ids = [r.id for r in posted_rides]
#     bookings_map = {}
#     modification_requests = {}
    
#     if posted_ride_ids:
#         # One query for all bookings with user details
#         bookings_raw = db.execute(text("""
#             SELECT 
#                 rb.id, rb.ride_id, rb.passenger_phone, rb.seats_booked, rb.status,
#                 rb.created_at, rb.total_amount, rb.cancellation_reason,
#                 u.full_name as passenger_name, u.first_name, u.last_name, 
#                 u.profile_picture as passenger_profile_picture,
#                 u.gender as passenger_gender
#             FROM ride_bookings rb 
#             LEFT JOIN users u ON u.phone_number = rb.passenger_phone
#             WHERE rb.ride_id = ANY(:ride_ids)
#             ORDER BY rb.created_at DESC
#         """), {"ride_ids": posted_ride_ids}).mappings().all()
        
#         for bk in bookings_raw:
#             ride_id = bk["ride_id"]
#             if ride_id not in bookings_map:
#                 bookings_map[ride_id] = []
            
#             passenger_name = bk["passenger_name"] or " ".join(
#                 p for p in [bk["first_name"], bk["last_name"]] if p
#             ).strip() or f"Passenger {bk['passenger_phone'][-4:]}"
            
#             bookings_map[ride_id].append({
#                 "id": bk["id"],
#                 "ride_id": ride_id,
#                 "passenger_phone": bk["passenger_phone"],
#                 "passenger_name": passenger_name,
#                 "passenger_photo": bk["passenger_profile_picture"],
#                 "passenger_gender": bk["passenger_gender"],
#                 "seats_requested": bk["seats_booked"],
#                 "status": bk["status"],
#                 "cancellation_reason": bk["cancellation_reason"],
#                 "total_amount": float(bk["total_amount"]) if bk["total_amount"] else None,
#                 "created_at": bk["created_at"].isoformat() if bk["created_at"] else None,
#             })
        
#         # One query for all modification requests
#         all_booking_ids = [bk["id"] for bk in bookings_raw if bk["status"] == "accepted"]
#         if all_booking_ids:
#             mod_requests = db.execute(text("""
#                 SELECT mr.* 
#                 FROM modification_requests mr
#                 WHERE mr.booking_id = ANY(:booking_ids)
#                 AND mr.status = 'pending'
#             """), {"booking_ids": all_booking_ids}).mappings().all()
            
#             for mr in mod_requests:
#                 modification_requests[mr["booking_id"]] = {
#                     "id": mr["id"],
#                     "current_seats": mr["current_seats"],
#                     "requested_seats": mr["requested_seats"],
#                     "status": mr["status"],
#                     "created_at": mr["created_at"].isoformat() if mr["created_at"] else None
#                 }
    
#     # Get driver info for posted rides
#     driver_info_map = {}
#     driver_phones = list(set([ride.phone_number for ride in posted_rides]))
#     if driver_phones:
#         drivers = db.query(User).filter(User.phone_number.in_(driver_phones)).all()
#         for driver in drivers:
#             driver_info_map[driver.phone_number] = driver
    
#     # Get vehicle info for posted rides
#     vehicle_ids = [ride.vehicle_id for ride in posted_rides if ride.vehicle_id]
#     vehicle_map = {}
#     if vehicle_ids:
#         vehicles = db.query(Vehicle).filter(Vehicle.id.in_(vehicle_ids)).all()
#         for vehicle in vehicles:
#             vehicle_map[vehicle.id] = vehicle
    
#     # Get live sessions for posted rides
#     live_session_map = {}
#     if posted_ride_ids:
#         live_sessions = db.query(RideSession).filter(
#             RideSession.ride_id.in_(posted_ride_ids),
#             RideSession.status.in_(["driver_started", "boarding", "en_route", "emergency_stopped"])
#         ).all()
        
#         # Get latest session per ride
#         for session in live_sessions:
#             if session.ride_id not in live_session_map:
#                 live_session_map[session.ride_id] = session
    
#     # Format posted rides with complete data (same as regular endpoint)
#     posted_formatted = []
#     for ride in posted_rides:
#         total_booked = get_total_booked_seats(db, ride.id)
#         remaining_seats = max(0, ride.available_seats - total_booked)
        
#         display_status = ride.status
#         if remaining_seats == 0 and ride.status == "active":
#             display_status = "full"
        
#         # Get driver's own profile picture
#         driver_info = driver_info_map.get(ride.phone_number)
#         driver_profile_picture = driver_info.profile_picture if driver_info else None
        
#         # Get vehicle details
#         vehicle = vehicle_map.get(ride.vehicle_id) if ride.vehicle_id else None
#         vehicle_data = None
#         if vehicle:
#             vehicle_data = {
#                 "id": vehicle.id,
#                 "make": vehicle.make,
#                 "model": vehicle.model,
#                 "color": vehicle.color,
#                 "registration_number": vehicle.registration_number,
#                 "photo_url": vehicle.photo_url,
#             }
        
#         # Get live session if exists
#         live_session = live_session_map.get(ride.id)
#         live_session_data = None
#         if live_session:
#             try:
#                 boarded_count = sum(1 for r in live_session.riders if r.status in ["boarded", "dropped_off", "completed"])
#                 dropped_count = sum(1 for r in live_session.riders if r.status in ["dropped_off", "completed"])
#                 live_session_data = {
#                     "session_id": live_session.id,
#                     "status": live_session.status,
#                     "current_phase": live_session.current_phase,
#                     "boarded_count": boarded_count,
#                     "dropped_count": dropped_count,
#                     "total_riders": len(live_session.riders)
#                 }
#             except Exception as e:
#                 print(f"Error processing live session: {str(e)}")
        
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
#             "total_booked_seats": total_booked,
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
#             "modification_requests": modification_requests,
#             "live_session": live_session_data,
#             "driver_profile_picture": driver_profile_picture,
#             "started_at": ride.started_at.isoformat() if ride.started_at else None,
#             "cancellation_reason": ride.cancellation_reason
#         })
    
#     # Get requested rides with pagination - with ALL fields
#     requested_rides_query = db.execute(text("""
#         SELECT 
#             rb.id, rb.ride_id, rb.passenger_phone, rb.seats_booked, rb.status,
#             rb.created_at, rb.total_amount, rb.cancellation_reason,
#             r.origin, r.destination, r.departure_time, r.price_per_seat, r.available_seats,
#             r.distance_km, r.duration_text, r.status as ride_status, r.women_only,
#             r.route_coordinates, r.started_at as ride_started_at,
#             r.origin_lat, r.origin_lon, r.destination_lat, r.destination_lon,
#             u.full_name as driver_name, u.first_name, u.last_name, u.phone_number as driver_phone,
#             u.user_id as driver_user_id, u.profile_completed, 
#             u.profile_picture as driver_profile_picture,
#             u.avg_rating as driver_rating,
#             v.id as vehicle_id, v.make, v.model, v.color, v.registration_number,
#             v.photo_url as vehicle_photo_url,
#             ls.id as session_id, ls.status as session_status
#         FROM ride_bookings rb
#         JOIN rides r ON r.id = rb.ride_id
#         LEFT JOIN users u ON u.phone_number = r.phone_number
#         LEFT JOIN vehicles v ON v.id = r.vehicle_id
#         LEFT JOIN ride_sessions ls ON ls.ride_id = r.id AND ls.status IN ('driver_started', 'boarding', 'en_route')
#         WHERE rb.passenger_phone = :phone
#         ORDER BY rb.created_at DESC
#         LIMIT :limit OFFSET :offset
#     """), {
#         "phone": norm_phone,
#         "limit": limit,
#         "offset": offset
#     }).mappings().all()
    
#     total_requested = db.execute(text("""
#         SELECT COUNT(*) FROM ride_bookings rb
#         WHERE rb.passenger_phone = :phone
#     """), {"phone": norm_phone}).scalar()
    
#     # Format requested rides with complete data
#     requested_formatted = []
#     for row in requested_rides_query:
#         driver_name = row["driver_name"] or " ".join(
#             p for p in [row["first_name"], row["last_name"]] if p
#         ).strip() or f"Driver {row['driver_phone'][-4:] if row['driver_phone'] else 'Unknown'}"
        
#         # Build vehicle object
#         vehicle_data = None
#         if row["vehicle_id"]:
#             vehicle_data = {
#                 "id": row["vehicle_id"],
#                 "make": row["make"],
#                 "model": row["model"],
#                 "color": row["color"],
#                 "registration_number": row["registration_number"],
#                 "photo_url": row["vehicle_photo_url"],
#             }
        
#         # Live session data
#         live_session_data = None
#         if row["session_id"]:
#             live_session_data = {
#                 "session_id": row["session_id"],
#                 "status": row["session_status"]
#             }
        
#         # Get suggested pickup/drop from route coordinates if available
#         suggested_pickup = None
#         suggested_drop = None
#         if row["route_coordinates"] and row["origin_lat"] and row["origin_lon"]:
#             suggested_pickup = find_nearest_route_vertex(
#                 row["route_coordinates"], 
#                 row["origin_lon"], 
#                 row["origin_lat"]
#             )
#         if row["route_coordinates"] and row["destination_lat"] and row["destination_lon"]:
#             suggested_drop = find_nearest_route_vertex(
#                 row["route_coordinates"], 
#                 row["destination_lon"], 
#                 row["destination_lat"]
#             )
        
#         requested_formatted.append({
#             "id": row["id"],
#             "ride_id": row["ride_id"],
#             "passenger_phone": row["passenger_phone"],
#             "seats_requested": row["seats_booked"],
#             "total_amount": float(row["total_amount"]) if row["total_amount"] else None,
#             "status": row["status"],
#             "cancellation_reason": row["cancellation_reason"],
#             "created_at": row["created_at"].isoformat() if row["created_at"] else None,
#             "origin": row["origin"],
#             "destination": row["destination"],
#             "departure_time": row["departure_time"].isoformat() if row["departure_time"] else None,
#             "departure_time_display": to_ist(row["departure_time"]).strftime("%d %b %Y, %I:%M %p") if row["departure_time"] else None,
#             "price_per_seat": row["price_per_seat"],
#             "available_seats": row["available_seats"],
#             "distance_km": row["distance_km"],
#             "duration_text": row["duration_text"],
#             "ride_status": row["ride_status"],
#             "women_only": row["women_only"],
#             "driver_name": driver_name,
#             "driver_phone": row["driver_phone"],
#             "driver_user_id": row["driver_user_id"],
#             "driver_photo": row["driver_profile_picture"],
#             "driver_rating": float(row["driver_rating"]) if row["driver_rating"] else 4.5,
#             "profile_completed": row["profile_completed"],
#             "route_coordinates": row["route_coordinates"],
#             "suggested_pickup": suggested_pickup,
#             "suggested_drop": suggested_drop,
#             "vehicle": vehicle_data,
#             "live_session": live_session_data,
#             "started_at": row["ride_started_at"].isoformat() if row["ride_started_at"] else None,
#             "origin_coords": [row["origin_lon"], row["origin_lat"]] if row["origin_lon"] and row["origin_lat"] else None,
#             "destination_coords": [row["destination_lon"], row["destination_lat"]] if row["destination_lon"] and row["destination_lat"] else None,
#         })
    
#     return {
#         "posted_rides": posted_formatted,
#         "requested_rides": requested_formatted,
#         "pagination": {
#             "total_posted": total_posted,
#             "total_requested": total_requested,
#             "limit": limit,
#             "offset": offset,
#             "has_more": len(posted_rides) == limit or total_requested > offset + limit
#         }
#     }
import secrets
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text, and_, or_
from database import get_db
from models import Ride, RideBooking, ModificationRequest, User, UserNotification, NotificationType, Vehicle, RideSession, RideSessionRider
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, field_validator
from typing import Optional, Dict, List
import math
import re
import uuid

router = APIRouter()

IST = timezone(timedelta(hours=5, minutes=30))
SEARCH_RADIUS_M = 2000
TIME_WINDOW_MINUTES = 60

# Socket.IO instance
_sio = None

def set_sio_instance(sio_instance):
    global _sio
    _sio = sio_instance

def emit_to_user(user_phone: str, event: str, data: dict):
    global _sio
    if _sio:
        room_name = f"user_{user_phone}"
        _sio.emit(event, data, room=room_name)
        print(f"📡 Socket emitted to {room_name}: {event}")
        return True
    return False

def emit_to_ride(ride_id: int, event: str, data: dict):
    global _sio
    if _sio:
        room_name = f"ride_{ride_id}"
        _sio.emit(event, data, room=room_name)
        print(f"📡 Socket emitted to {room_name}: {event}")
        return True
    return False

def to_ist(dt: datetime) -> datetime:
    """Convert datetime to IST timezone"""
    if dt is None:
        return dt
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(IST)

def now_ist() -> datetime:
    """Get current time in IST"""
    return datetime.now(timezone.utc).astimezone(IST)

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

def parse_duration_to_minutes(duration_str: Optional[str]) -> int:
    if not duration_str:
        return 60
    mins = 0
    hr_match = re.search(r'(\d+)\s*Hr', duration_str, re.IGNORECASE)
    min_match = re.search(r'(\d+)\s*Min', duration_str, re.IGNORECASE)
    if hr_match:
        mins += int(hr_match.group(1)) * 60
    if min_match:
        mins += int(min_match.group(1))
    return mins or 60

def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def get_total_booked_seats(db: Session, ride_id: int) -> int:
    result = db.query(func.sum(RideBooking.seats_booked)).filter(
        RideBooking.ride_id == ride_id,
        RideBooking.status == "accepted"
    ).scalar()
    return result or 0

def get_available_seats(db: Session, ride_id: int) -> int:
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        return 0
    total_booked = get_total_booked_seats(db, ride_id)
    return max(0, ride.available_seats - total_booked)

def find_nearest_route_vertex(route_coords: List[List[float]], lng: float, lat: float) -> Optional[Dict]:
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


# ============================================
# PYDANTIC MODELS
# ============================================
class ModifySeatsRequest(BaseModel):
    new_seats: int
class CreateRideRequest(BaseModel):
    phone_number: str
    origin: str
    destination: str
    departure_time: datetime
    available_seats: int
    price_per_seat: float
    origin_coords: List[float]
    destination_coords: List[float]
    route_coordinates: List[List[float]]
    distance_km: Optional[float] = None
    duration_text: Optional[str] = None
    total_estimated_price: Optional[float] = None
    preferences: Optional[Dict] = None
    vehicle_id: Optional[int] = None
    women_only: Optional[bool] = False

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


class UpdateRideRequest(CreateRideRequest):
    pass


class SearchRidesRequest(BaseModel):
    from_location: str
    to_location: str
    from_coords: List[float]
    to_coords: List[float]
    departure_time: datetime
    seats_required: int = 1
    passenger_gender: Optional[str] = None

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
    from_coords: Optional[List[float]] = None
    to_coords: Optional[List[float]] = None

    @field_validator("from_coords", "to_coords")
    @classmethod
    def validate_optional_coords(cls, value):
        if value is None:
            return value
        if len(value) != 2:
            raise ValueError("Coordinates must contain exactly [lng, lat]")
        return value


class ModificationRequestSchema(BaseModel):
    requested_seats: int


# ============================================
# RIDE ENDPOINTS
# ============================================

@router.post("/post-ride")
def post_ride(data: CreateRideRequest, db: Session = Depends(get_db)):
    normalized_phone = normalize_phone(data.phone_number)
    duration_minutes = parse_duration_to_minutes(data.duration_text)
    
    # Convert departure time to UTC for storage
    departure_time_utc = data.departure_time
    if departure_time_utc.tzinfo is None:
        departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
    else:
        departure_time_utc = departure_time_utc.astimezone(timezone.utc)
    
    expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
      # ADD THIS CHECK - Passenger overlap
    passenger_overlap = check_overlapping_bookings_for_passenger(db, normalized_phone, departure_time_utc, duration_minutes)
    if passenger_overlap:
        raise HTTPException(
            status_code=409,
            detail=f"You have a confirmed booking as a passenger from {passenger_overlap['origin']} to {passenger_overlap['destination']} at {to_ist(passenger_overlap['departure_time']).strftime('%I:%M %p')} that overlaps with this ride."
        )
    
    # ADD THIS CHECK - Driver overlapping rides
    overlapping = check_overlapping_rides_for_driver(db, normalized_phone, departure_time_utc, duration_minutes)
    if overlapping:
        end_time_ist = to_ist(overlapping["expected_end_time"])
        raise HTTPException(
            status_code=409,
            detail=f"You already have an active ride from {overlapping['origin']} to {overlapping['destination']} at {to_ist(overlapping['departure_time']).strftime('%I:%M %p')}. Please wait until {end_time_ist.strftime('%I:%M %p')} to post another ride."
        )
    # Validate distance
    distance = calculate_distance_km(
        data.origin_coords[1], data.origin_coords[0],
        data.destination_coords[1], data.destination_coords[0]
    )
    
    MIN_DISTANCE_KM = 3
    MAX_DISTANCE_KM = 300
    
    if distance < MIN_DISTANCE_KM:
        raise HTTPException(status_code=400, detail=f"Pickup and destination are too close ({distance:.1f} km)")
    if distance > MAX_DISTANCE_KM:
        raise HTTPException(status_code=400, detail=f"Distance too far ({distance:.1f} km)")
    
    # Validate time
    min_departure_time = datetime.now(timezone.utc) + timedelta(minutes=30)
    if departure_time_utc < min_departure_time:
        min_time_ist = to_ist(min_departure_time)
        raise HTTPException(status_code=400, detail=f"Departure time must be at least 30 minutes from now")
    
    women_only = data.preferences.get('womenOnly', False) if data.preferences else data.women_only
    
    ride = Ride(
        phone_number=normalized_phone,
        origin=data.origin,
        destination=data.destination,
        departure_time=departure_time_utc,
        expected_end_time=expected_end_time,
        duration_minutes=duration_minutes,
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
        vehicle_id=data.vehicle_id,
        women_only=women_only,
        status="active",
    )

    db.add(ride)
    db.commit()
    db.refresh(ride)

    return {"message": "Ride posted successfully", "ride_id": ride.id}


@router.post("/search-rides")
def search_rides(data: SearchRidesRequest, db: Session = Depends(get_db)):
    req_time_utc = data.departure_time
    if req_time_utc.tzinfo is None:
        req_time_utc = req_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
    else:
        req_time_utc = req_time_utc.astimezone(timezone.utc)

    query = db.query(Ride).filter(
        Ride.status.in_(["active", "full"]),
        Ride.departure_time.between(
            req_time_utc - timedelta(minutes=TIME_WINDOW_MINUTES),
            req_time_utc + timedelta(minutes=TIME_WINDOW_MINUTES)
        )
    )
    
    if data.passenger_gender != 'female':
        query = query.filter(Ride.women_only == False)

    all_rides = query.all()
    
    rides = []
    
    for ride in all_rides:
        total_booked = get_total_booked_seats(db, ride.id)
        remaining_seats = max(0, ride.available_seats - total_booked)
        
        if remaining_seats == 0:
            continue
        
        pickup_distance_m = 0
        drop_distance_m = 0
        pickup_point = None
        drop_point = None
        
        if ride.origin_lat and ride.origin_lon and ride.destination_lat and ride.destination_lon:
            pickup_distance_m = haversine_m(
                ride.origin_lat, ride.origin_lon,
                data.from_coords[1], data.from_coords[0]
            )
            drop_distance_m = haversine_m(
                ride.destination_lat, ride.destination_lon,
                data.to_coords[1], data.to_coords[0]
            )
            
            if ride.route_coordinates:
                pickup_point = find_nearest_route_vertex(ride.route_coordinates, data.from_coords[0], data.from_coords[1])
                drop_point = find_nearest_route_vertex(ride.route_coordinates, data.to_coords[0], data.to_coords[1])
        
        if pickup_distance_m > SEARCH_RADIUS_M * 2 or drop_distance_m > SEARCH_RADIUS_M * 2:
            continue
        
        pickup_score = max(0, 1 - (pickup_distance_m / SEARCH_RADIUS_M))
        drop_score = max(0, 1 - (drop_distance_m / SEARCH_RADIUS_M))
        time_diff_min = abs((ride.departure_time - req_time_utc).total_seconds()) / 60
        time_score = max(0, 1 - (time_diff_min / 60))
        match_percentage = round(100 * (0.35 * pickup_score + 0.35 * drop_score + 0.20 * time_score + 0.10))
        
        driver = db.query(User).filter(User.phone_number == ride.phone_number).first()
        driver_name = None
        if driver:
            driver_name = driver.full_name or " ".join(filter(None, [driver.first_name, driver.last_name]))
        if not driver_name:
            driver_name = f"Driver {ride.phone_number[-4:]}"
        
        vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first() if ride.vehicle_id else None
        
        departure_time_ist = to_ist(ride.departure_time)
        
        rides.append({
            "id": ride.id,
            "driverName": driver_name,
            "driverUserId": driver.user_id if driver else None,
            "phoneNumber": ride.phone_number,
            "profilePicture": driver.profile_picture if driver else None,
            "driverGender": driver.gender if driver else None,
            "womenOnly": ride.women_only,
            "vehicle": {
                "id": vehicle.id if vehicle else None,
                "make": vehicle.make if vehicle else None,
                "model": vehicle.model if vehicle else None,
                "color": vehicle.color if vehicle else None,
                "registrationNumber": vehicle.registration_number if vehicle else None,
                "photoUrl": vehicle.photo_url if vehicle else None,
            },
            "rating": driver.avg_rating if driver and driver.avg_rating else 4.5,
            "date": departure_time_ist.strftime("%d %b %Y"),
            "time": departure_time_ist.strftime("%I:%M %p"),
            "from": ride.origin,
            "to": ride.destination,
            "suggestedPickup": pickup_point,
            "suggestedDrop": drop_point,
            "pickupWalkDistanceM": int(pickup_distance_m),
            "dropWalkDistanceM": int(drop_distance_m),
            "price": ride.price_per_seat,
            "matchPercentage": match_percentage,
            "seatsAvailable": remaining_seats,
            "totalSeats": ride.available_seats,
            "bookedSeats": total_booked,
            "distanceKm": ride.distance_km,
            "durationText": ride.duration_text,
            "routeCoordinates": ride.route_coordinates or [],
            "status": ride.status,
        })
    
    rides.sort(key=lambda x: (-x["matchPercentage"]))
    return {"rides": rides}


@router.post("/ride-bookings")
def create_ride_booking(data: CreateRideBookingRequest, db: Session = Depends(get_db)):
    passenger_phone = normalize_phone(data.passenger_phone)
    ride = db.query(Ride).filter(Ride.id == data.ride_id).first()
    
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    if ride.status not in ["active", "full"]:
        raise HTTPException(status_code=400, detail="Ride is not available")
    
    total_booked = get_total_booked_seats(db, ride.id)
    remaining_seats = ride.available_seats - total_booked
    
    if remaining_seats < data.seats_requested:
        raise HTTPException(status_code=400, detail=f"Not enough seats available. Only {remaining_seats} seat(s) left.")
    if ride.phone_number == passenger_phone:
        raise HTTPException(status_code=400, detail="You cannot book your own ride")
    
    existing_accepted = db.query(RideBooking).filter(
        RideBooking.ride_id == data.ride_id,
        RideBooking.passenger_phone == passenger_phone,
        RideBooking.status == "accepted"
    ).first()
    
    if existing_accepted:
        raise HTTPException(status_code=400, detail="You already have a confirmed booking for this ride")
    
    total_amount = ride.price_per_seat * data.seats_requested
    
    # Calculate intersection points
    pickup_lat = pickup_lon = drop_lat = drop_lon = None
    int_pickup_lat = int_pickup_lon = int_drop_lat = int_drop_lon = None
    pickup_walk_m = drop_walk_m = None
    
    if data.from_coords and data.to_coords and ride.route_coordinates:
        try:
            pickup_pt = find_nearest_route_vertex(ride.route_coordinates, data.from_coords[0], data.from_coords[1])
            drop_pt = find_nearest_route_vertex(ride.route_coordinates, data.to_coords[0], data.to_coords[1])
            if pickup_pt:
                int_pickup_lon = pickup_pt["lng"]
                int_pickup_lat = pickup_pt["lat"]
            if drop_pt:
                int_drop_lon = drop_pt["lng"]
                int_drop_lat = drop_pt["lat"]
            pickup_lat = data.from_coords[1]
            pickup_lon = data.from_coords[0]
            drop_lat = data.to_coords[1]
            drop_lon = data.to_coords[0]
        except Exception as e:
            print(f"⚠️ Intersection compute error: {e}")

    booking = RideBooking(
        ride_id=data.ride_id,
        passenger_phone=passenger_phone,
        seats_booked=data.seats_requested,
        total_amount=total_amount,
        pickup_lat=pickup_lat,
        pickup_lon=pickup_lon,
        drop_lat=drop_lat,
        drop_lon=drop_lon,
        intersection_pickup_lat=int_pickup_lat,
        intersection_pickup_lon=int_pickup_lon,
        intersection_drop_lat=int_drop_lat,
        intersection_drop_lon=int_drop_lon,
        pickup_walk_distance_m=pickup_walk_m,
        drop_walk_distance_m=drop_walk_m,
        status="pending"
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Notify driver
    driver_phone = normalize_phone(ride.phone_number)
    origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
    dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
    
    notification = UserNotification(
        phone_number=driver_phone,
        title="New Ride Request 🙋",
        message=f"You received a request for {data.seats_requested} seat(s) for your ride from {origin_short} to {dest_short}.",
        type="ride",
        action_type="booking",
        action_value=str(booking.id),
        is_read=False,
        is_deleted=False
    )
    db.add(notification)
    db.commit()

    return {"message": "Ride request sent successfully", "booking_id": booking.id, "status": booking.status}


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
        booking.status = "rejected"
        db.commit()
        raise HTTPException(status_code=400, detail="Not enough seats available anymore")

    booking.status = "accepted"
    
    total_booked_after = get_total_booked_seats(db, ride.id)
    if ride.available_seats <= total_booked_after:
        ride.status = "full"
    
    db.commit()

    # Notify passenger
    origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
    dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
    
    notification = UserNotification(
        phone_number=booking.passenger_phone,
        title="Booking Accepted! ✅",
        message=f"Your request for {booking.seats_booked} seat(s) on the ride from {origin_short} to {dest_short} has been accepted by the driver.",
        type="ride",
        action_type="booking",
        action_value=str(booking.id),
        is_read=False,
        is_deleted=False
    )
    db.add(notification)
    db.commit()

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

    return {"message": "Booking rejected"}


@router.put("/booking/{booking_id}/cancel")
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if booking.status == "accepted":
        if ride.status == "full":
            ride.status = "active"

    booking.status = "cancelled"
    db.commit()

    return {"message": "Booking cancelled successfully"}
@router.put("/ride/{ride_id}/cancel")
def cancel_ride(ride_id: int, db: Session = Depends(get_db)):
    """Cancel a ride and update all related records"""
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    # Check if ride can be cancelled
    if ride.started_at:
        raise HTTPException(status_code=400, detail="Cannot cancel ride that has already started")
    
    if ride.status == "completed":
        raise HTTPException(status_code=400, detail="Cannot cancel completed ride")
    
    if ride.cancellation_reason:
        raise HTTPException(status_code=400, detail="Ride is already cancelled")
    
    # Update ride status
    old_status = ride.status
    ride.status = "cancelled"
    ride.cancellation_reason = "Cancelled by driver"
    ride.cancelled_at = datetime.now(timezone.utc)
    
    cancelled_modifications_count = 0
    affected_passengers = []
    
    # 1. Cancel all pending modification requests
    pending_modifications = db.query(ModificationRequest).filter(
        ModificationRequest.ride_id == ride_id,
        ModificationRequest.status == "pending"
    ).all()
    
    for mod_request in pending_modifications:
        mod_request.status = "cancelled"
        mod_request.cancelled_at = datetime.now(timezone.utc)
        mod_request.rejection_reason = "Ride was cancelled by driver"
        cancelled_modifications_count += 1
        
        # Notify passenger about cancelled modification request
        passenger_notification = UserNotification(
            phone_number=mod_request.passenger_phone,
            title="Modification Request Cancelled ❌",
            message=f"Your seat modification request for ride from {ride.origin} to {ride.destination} has been cancelled because the ride was cancelled.",
            type="ride",
            action_type="modification",
            action_value=str(mod_request.id),
            is_read=False,
            is_deleted=False
        )
        db.add(passenger_notification)
        
        # Emit socket event to passenger
        emit_to_user(mod_request.passenger_phone, "modification-cancelled", {
            "ride_id": ride_id,
            "request_id": mod_request.id,
            "message": "Your modification request was cancelled because the ride was cancelled"
        })
    
    # 2. Cancel all accepted bookings
    accepted_bookings = db.query(RideBooking).filter(
        RideBooking.ride_id == ride_id,
        RideBooking.status == "accepted"
    ).all()
    
    for booking in accepted_bookings:
        old_seats = booking.seats_booked
        booking.status = "cancelled"
        booking.cancellation_reason = "Ride cancelled by driver"
        booking.cancelled_at = datetime.now(timezone.utc)
        affected_passengers.append({
            "phone": booking.passenger_phone,
            "seats": booking.seats_booked,
            "booking_id": booking.id
        })
        
        # Notify passenger
        origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
        dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
        
        notification = UserNotification(
            phone_number=booking.passenger_phone,
            title="Ride Cancelled ❌",
            message=f"Your booking for {booking.seats_booked} seat(s) on the ride from {origin_short} to {dest_short} has been cancelled by the driver.",
            type="ride",
            action_type="cancellation",
            action_value=str(ride.id),
            is_read=False,
            is_deleted=False
        )
        db.add(notification)
        
        # Emit socket event to passenger
        emit_to_user(booking.passenger_phone, "booking-cancelled", {
            "ride_id": ride_id,
            "booking_id": booking.id,
            "message": f"Your booking for {booking.seats_booked} seat(s) has been cancelled",
            "origin": origin_short,
            "destination": dest_short
        })
    
    # 3. Cancel all pending bookings
    pending_bookings = db.query(RideBooking).filter(
        RideBooking.ride_id == ride_id,
        RideBooking.status == "pending"
    ).all()
    
    for booking in pending_bookings:
        booking.status = "rejected"
        booking.cancellation_reason = "Ride cancelled by driver"
        booking.cancelled_at = datetime.now(timezone.utc)
        
        # Notify passenger about rejected booking
        notification = UserNotification(
            phone_number=booking.passenger_phone,
            title="Booking Request Cancelled ❌",
            message=f"Your booking request for {booking.seats_booked} seat(s) on the ride from {ride.origin} to {ride.destination} has been cancelled because the ride was cancelled.",
            type="ride",
            action_type="cancellation",
            action_value=str(ride.id),
            is_read=False,
            is_deleted=False
        )
        db.add(notification)
        
        # Emit socket event
        emit_to_user(booking.passenger_phone, "booking-request-cancelled", {
            "ride_id": ride_id,
            "booking_id": booking.id,
            "message": "Your booking request was cancelled because the ride was cancelled"
        })
    
    db.commit()
    
    # Emit ride cancelled event to all users in the ride room
    emit_to_ride(ride_id, "ride-cancelled", {
        "ride_id": ride_id,
        "message": f"Ride from {ride.origin} to {ride.destination} has been cancelled",
        "cancelled_bookings": len(accepted_bookings),
        "cancelled_modifications": cancelled_modifications_count
    })
    
    return {
        "message": "Ride cancelled successfully",
        "ride_id": ride_id,
        "affected_passengers": len(accepted_bookings),
        "cancelled_modifications": cancelled_modifications_count,
        "cancelled_pending_bookings": len(pending_bookings),
        "total_affected": len(accepted_bookings) + len(pending_bookings) + cancelled_modifications_count
    }
# ============================================
# MODIFICATION REQUEST ENDPOINTS
# ============================================
@router.post("/booking/{booking_id}/request-modification")
async def request_modification(
    booking_id: int,
    request: ModificationRequestSchema,
    db: Session = Depends(get_db)
):
    """Request to modify seat count for a booking"""
    try:
        booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
        if not booking:
            return {"success": False, "message": "Booking not found"}
        
        ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
        if not ride:
            return {"success": False, "message": "Ride not found"}
        
        # Check conditions
        if ride.started_at:
            return {"success": False, "message": "Cannot modify seats - Ride has already started"}
        
        if ride.cancellation_reason:
            return {"success": False, "message": "Cannot modify seats - Ride has been cancelled"}
        
        if booking.status != "accepted":
            return {"success": False, "message": "Cannot modify seats - Booking is not confirmed yet"}
        
        # Check for existing pending request
        existing = db.query(ModificationRequest).filter(
            ModificationRequest.booking_id == booking_id,
            ModificationRequest.status == "pending"
        ).first()
        
        # Calculate available seats
        total_booked = db.query(func.sum(RideBooking.seats_booked)).filter(
            RideBooking.ride_id == ride.id,
            RideBooking.status == "accepted"
        ).scalar() or 0
        
        other_booked = total_booked - booking.seats_booked
        available_seats = ride.available_seats - other_booked
        
        if request.requested_seats > available_seats:
            return {"success": False, "message": f"Only {available_seats} seat(s) available"}
        
        if request.requested_seats < 1:
            return {"success": False, "message": "Minimum 1 seat required"}
        
        # If request is the same as current seats, cancel or ignore
        if request.requested_seats == booking.seats_booked:
            # Delete pending request if exists
            if existing:
                db.delete(existing)
                db.commit()
            return {"success": True, "message": "Modification request cancelled - same as current seats"}
        
        # UPDATE existing request instead of creating new one
        if existing:
            # Update the existing pending request
            existing.requested_seats = request.requested_seats
            existing.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(existing)
            
            return {
                "success": True, 
                "message": "Modification request updated",
                "request": {
                    "id": existing.id,
                    "current_seats": existing.current_seats,
                    "requested_seats": existing.requested_seats,
                    "status": existing.status,
                    "created_at": existing.created_at.isoformat() if existing.created_at else None,
                    "updated_at": existing.updated_at.isoformat() if existing.updated_at else None
                }
            }
        else:
            # Create new modification request
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
            
            return {
                "success": True, 
                "message": "Modification request sent to driver",
                "request": {
                    "id": mod_request.id,
                    "current_seats": mod_request.current_seats,
                    "requested_seats": mod_request.requested_seats,
                    "status": mod_request.status,
                    "created_at": mod_request.created_at.isoformat() if mod_request.created_at else None
                }
            }
        
    except Exception as e:
        print(f"Error in request_modification: {str(e)}")
        db.rollback()
        return {"success": False, "message": str(e)}

@router.get("/booking/{booking_id}/modification-request")
def get_pending_modification_request(booking_id: int, db: Session = Depends(get_db)):
    """Get pending modification request for a booking"""
    try:
        pending_request = db.query(ModificationRequest).filter(
            ModificationRequest.booking_id == booking_id,
            ModificationRequest.status == "pending"
        ).first()
        
        if pending_request:
            return {
                "has_pending": True,
                "request": {
                    "id": pending_request.id,
                    "requested_seats": pending_request.requested_seats,
                    "current_seats": pending_request.current_seats,
                    "status": pending_request.status,
                    "created_at": pending_request.created_at.isoformat() if pending_request.created_at else None
                }
            }
        
        return {"has_pending": False}
        
    except Exception as e:
        print(f"Error in get_pending_modification_request: {str(e)}")
        return {"has_pending": False, "error": str(e)}


# Make sure these endpoints are properly defined and not commented out
@router.get("/check-passenger-overlap")
def check_passenger_overlap(
    phone_number: str,
    departure_time: datetime,
    duration_minutes: int = 60,
    exclude_booking_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Check if passenger has overlapping active bookings"""
    normalized_phone = normalize_phone(phone_number)
    
    overlapping = check_overlapping_bookings_for_passenger(db, normalized_phone, departure_time, duration_minutes, exclude_booking_id)
    
    if overlapping:
        return {
            "has_overlap": True,
            "overlapping_booking": {
                "booking_id": overlapping["booking_id"],
                "ride_id": overlapping["ride_id"],
                "origin": overlapping["origin"],
                "destination": overlapping["destination"],
                "departure_time": overlapping["departure_time"].isoformat(),
                "expected_end_time": overlapping["expected_end_time"].isoformat() if overlapping["expected_end_time"] else None
            }
        }
    
    return {"has_overlap": False}


@router.get("/check-overlapping-rides")
def check_overlapping_rides_endpoint(
    phone_number: str,
    departure_time: datetime,
    duration_minutes: int = 60,
    exclude_ride_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Check if driver has overlapping active rides"""
    normalized_phone = normalize_phone(phone_number)
    
    overlapping = check_overlapping_rides_for_driver(db, normalized_phone, departure_time, duration_minutes, exclude_ride_id)
    
    if overlapping:
        return {
            "has_overlap": True,
            "overlapping_ride": {
                "id": overlapping["ride_id"],
                "origin": overlapping["origin"],
                "destination": overlapping["destination"],
                "departure_time": overlapping["departure_time"].isoformat(),
                "expected_end_time": overlapping["expected_end_time"].isoformat() if overlapping["expected_end_time"] else None
            }
        }
    
    return {"has_overlap": False}
@router.get("/ride/{ride_id}/pending-modifications")
def get_pending_modifications_for_ride(ride_id: int, db: Session = Depends(get_db)):
    """Get all pending modification requests for a ride (for driver)"""
    try:
        ride = db.query(Ride).filter(Ride.id == ride_id).first()
        if not ride:
            return {"success": False, "message": "Ride not found"}
        
        now = datetime.now(timezone.utc)
        minutes_since_departure = (now - ride.departure_time).total_seconds() / 60
        modifications_locked = ride.started_at or (minutes_since_departure > 30)
        
        pending_requests = db.query(ModificationRequest).filter(
            ModificationRequest.ride_id == ride_id,
            ModificationRequest.status == "pending"
        ).order_by(ModificationRequest.created_at.desc()).all()
        
        results = []
        for req in pending_requests:
            booking = db.query(RideBooking).filter(RideBooking.id == req.booking_id).first()
            passenger = None
            passenger_name = "Unknown"
            
            if booking:
                passenger = db.query(User).filter(User.phone_number == booking.passenger_phone).first()
                if passenger:
                    passenger_name = passenger.full_name or f"{passenger.first_name or ''} {passenger.last_name or ''}".strip()
                if not passenger_name or passenger_name == "":
                    passenger_name = f"Passenger {booking.passenger_phone[-4:]}"
            
            results.append({
                "id": req.id,
                "booking_id": req.booking_id,
                "passenger_name": passenger_name,
                "passenger_phone": req.passenger_phone,
                "passenger_photo": passenger.profile_picture if passenger else None,
                "current_seats": req.current_seats,
                "requested_seats": req.requested_seats,
                "created_at": req.created_at.isoformat() if req.created_at else None,
                "ride_id": req.ride_id
            })
        
        return {
            "success": True,
            "ride_id": ride_id,
            "pending_requests": results,
            "count": len(results),
            "modifications_locked": modifications_locked,
            "minutes_since_departure": round(minutes_since_departure) if minutes_since_departure > 0 else 0
        }
        
    except Exception as e:
        print(f"Error in get_pending_modifications_for_ride: {str(e)}")
        return {"success": False, "message": str(e), "pending_requests": []}


@router.put("/modification-request/{request_id}/approve")
def approve_modification_request(request_id: int, db: Session = Depends(get_db)):
    """Approve a modification request"""
    try:
        mod_request = db.query(ModificationRequest).filter(ModificationRequest.id == request_id).first()
        
        if not mod_request:
            return {"success": False, "message": "Modification request not found"}
        
        if mod_request.status != "pending":
            return {"success": False, "message": f"Request already {mod_request.status}"}
        
        booking = db.query(RideBooking).filter(RideBooking.id == mod_request.booking_id).first()
        if not booking:
            return {"success": False, "message": "Booking not found"}
        
        ride = db.query(Ride).filter(Ride.id == mod_request.ride_id).first()
        if not ride:
            return {"success": False, "message": "Ride not found"}
        
        if ride.started_at:
            mod_request.status = "rejected"
            mod_request.rejection_reason = "Cannot modify - Ride has already started"
            db.commit()
            return {"success": False, "message": "Cannot approve - Ride has already started"}
        
        # Calculate available seats
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
            return {"success": False, "message": f"Only {available_seats} seat(s) available"}
        
        # Update booking
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
            "new_seats": mod_request.requested_seats,
            "new_total": booking.total_amount
        }
        
    except Exception as e:
        print(f"Error in approve_modification_request: {str(e)}")
        db.rollback()
        return {"success": False, "message": str(e)}


@router.put("/modification-request/{request_id}/reject")
def reject_modification_request(request_id: int, db: Session = Depends(get_db)):
    """Reject a modification request"""
    try:
        mod_request = db.query(ModificationRequest).filter(ModificationRequest.id == request_id).first()
        
        if not mod_request:
            return {"success": False, "message": "Modification request not found"}
        
        if mod_request.status != "pending":
            return {"success": False, "message": f"Request already {mod_request.status}"}
        
        mod_request.status = "rejected"
        mod_request.rejection_reason = "Driver declined the modification request"
        mod_request.rejected_at = datetime.now(timezone.utc)
        
        db.commit()
        
        return {"success": True, "message": "Modification request rejected"}
        
    except Exception as e:
        print(f"Error in reject_modification_request: {str(e)}")
        db.rollback()
        return {"success": False, "message": str(e)}


@router.delete("/booking/{booking_id}/cancel-modification-request")
def cancel_modification_request(booking_id: int, db: Session = Depends(get_db)):
    """Cancel a pending modification request"""
    try:
        mod_request = db.query(ModificationRequest).filter(
            ModificationRequest.booking_id == booking_id,
            ModificationRequest.status == "pending"
        ).first()
        
        if not mod_request:
            return {"success": False, "message": "No pending modification request found"}
        
        mod_request.status = "cancelled"
        mod_request.cancelled_at = datetime.now(timezone.utc)
        
        db.commit()
        
        return {"success": True, "message": "Modification request cancelled successfully"}
        
    except Exception as e:
        print(f"Error in cancel_modification_request: {str(e)}")
        db.rollback()
        return {"success": False, "message": str(e)}


# ============================================
# RIDE PASSENGERS ENDPOINT
# ============================================

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
        "available_seats": ride.available_seats,
        "total_booked_seats": total_booked,
        "remaining_seats": remaining_seats,
        "status": ride.status,
        "passengers": passengers,
        "duration_text": ride.duration_text,
        "distance_km": ride.distance_km,
        "price_per_seat": ride.price_per_seat,
    }


# ============================================
# MY RIDES ENDPOINT
# ============================================

@router.get("/my-rides/{phone}")
def get_my_rides(phone: str, db: Session = Depends(get_db)):
    norm_phone = normalize_phone(phone)
    
    # POSTED RIDES (Driver)
    posted_rides = db.query(Ride).filter(
        Ride.phone_number == norm_phone,
        Ride.is_deleted == False
    ).order_by(Ride.departure_time.desc()).all()
    
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
    
    posted_formatted = []
    for ride in posted_rides:
        total_booked = get_total_booked_seats(db, ride.id)
        remaining_seats = max(0, ride.available_seats - total_booked)
        
        display_status = ride.status
        if remaining_seats == 0 and ride.status == "active":
            display_status = "full"
        
        driver_info = db.query(User).filter(User.phone_number == ride.phone_number).first()
        driver_profile_picture = driver_info.profile_picture if driver_info else None
        
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
            "departure_time": ride.departure_time.isoformat(),
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
            "created_at": ride.created_at.isoformat() if ride.created_at else None,
            "bookings": bookings_map.get(ride.id, []),
            "live_session": live_session_data,
            "driver_profile_picture": driver_profile_picture,
            "started_at": ride.started_at.isoformat() if ride.started_at else None,
            "cancellation_reason": ride.cancellation_reason
        })
    
    # REQUESTED RIDES (Passenger bookings)
    requested_raw = db.execute(text("""
        SELECT 
            rb.id, rb.ride_id, rb.passenger_phone, rb.seats_booked, rb.status,
            rb.created_at, rb.total_amount, rb.cancellation_reason,
            r.origin, r.destination, r.departure_time, r.price_per_seat, r.available_seats,
            r.distance_km, r.duration_text, r.status as ride_status, r.women_only,
            r.route_coordinates, r.started_at as ride_started_at,
            u.full_name as driver_name, u.first_name, u.last_name, u.phone_number as driver_phone,
            u.user_id as driver_user_id, u.profile_completed, 
            u.profile_picture as driver_profile_picture,
            u.avg_rating as driver_rating,
            v.id as vehicle_id, v.make, v.model, v.color, v.registration_number,
            ls.id as session_id, ls.status as session_status
        FROM ride_bookings rb
        JOIN rides r ON r.id = rb.ride_id
        LEFT JOIN users u ON u.phone_number = r.phone_number
        LEFT JOIN vehicles v ON v.id = r.vehicle_id
        LEFT JOIN ride_sessions ls ON ls.ride_id = r.id AND ls.status IN ('driver_started', 'boarding', 'en_route')
        WHERE rb.passenger_phone = :phone
        ORDER BY rb.created_at DESC
    """), {"phone": norm_phone}).mappings().all()
    
    requested_formatted = []
    for row in requested_raw:
        driver_name = row["driver_name"] or " ".join(
            p for p in [row["first_name"], row["last_name"]] if p
        ).strip() or f"Driver {row['driver_phone'][-4:] if row['driver_phone'] else 'Unknown'}"
        
        vehicle_data = None
        if row["vehicle_id"]:
            vehicle_data = {
                "id": row["vehicle_id"],
                "make": row["make"],
                "model": row["model"],
                "color": row["color"],
                "registration_number": row["registration_number"],
            }
        
        live_session_data = None
        if row["session_id"]:
            live_session_data = {
                "session_id": row["session_id"],
                "status": row["session_status"]
            }
        
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
            "vehicle": vehicle_data,
            "live_session": live_session_data,
            "started_at": row["ride_started_at"].isoformat() if row["ride_started_at"] else None
        })
    
    return {
        "posted_rides": posted_formatted,
        "requested_rides": requested_formatted
    }


# ============================================
# RIDE SESSION ENDPOINTS (Live Tracking)
# ============================================

@router.post("/ride/{ride_id}/start")
def start_ride(ride_id: int, db: Session = Depends(get_db)):
    """Start a ride - creates live session and QR code"""
    try:
        ride = db.query(Ride).filter(Ride.id == ride_id).first()
        if not ride:
            raise HTTPException(status_code=404, detail="Ride not found")
        
        if ride.started_at:
            raise HTTPException(status_code=400, detail="Ride already started")
        
        if ride.cancellation_reason:
            raise HTTPException(status_code=400, detail=f"Cannot start cancelled ride")
        
        now = datetime.now(timezone.utc)
        minutes_to_departure = (ride.departure_time - now).total_seconds() / 60
        minutes_since_departure = (now - ride.departure_time).total_seconds() / 60
        
        if minutes_to_departure > 15:
            raise HTTPException(status_code=400, detail=f"Ride can only be started within 15 minutes of departure time")
        
        if minutes_since_departure > 30:
            ride.status = "cancelled"
            ride.cancellation_reason = "Auto-cancelled: Ride was not started within 30 minutes of departure time"
            db.commit()
            raise HTTPException(status_code=400, detail="Ride has been auto-cancelled")
        
        # Start the ride
        ride.started_at = now
        ride.status = "active"
        db.commit()
        
        # Create live session
        qr_token = secrets.token_hex(16)
        
        live_session = RideSession(
            ride_id=ride_id,
            driver_phone=ride.phone_number,
            status="driver_started",
            current_phase="boarding",
            qr_code_token=qr_token,
            qr_expires_at=datetime.now(timezone.utc) + timedelta(hours=8),
            started_at=datetime.now(timezone.utc)
        )
        db.add(live_session)
        db.flush()
        
        # Add all accepted riders to session
        accepted_bookings = db.query(RideBooking).filter(
            RideBooking.ride_id == ride_id,
            RideBooking.status == "accepted"
        ).all()
        
        for booking in accepted_bookings:
            rider_user = db.query(User).filter(User.phone_number == booking.passenger_phone).first()
            
            rider_session = RideSessionRider(
                session_id=live_session.id,
                booking_id=booking.id,
                rider_phone=booking.passenger_phone,
                rider_name=rider_user.full_name if rider_user else None,
                rider_photo=rider_user.profile_picture if rider_user else None,
                pickup_location=ride.origin,
                dropoff_location=ride.destination,
                status="accepted"
            )
            db.add(rider_session)
            
            # Notify passenger
            notification = UserNotification(
                phone_number=booking.passenger_phone,
                title="Ride Started! 🚗",
                message=f"The driver has started the ride from {ride.origin} to {ride.destination}.",
                type="ride",
                action_type="ride",
                action_value=str(ride.id),
                is_read=False,
                is_deleted=False
            )
            db.add(notification)
            
            # Emit socket event
            emit_to_user(booking.passenger_phone, "ride-started", {
                "ride_id": ride_id,
                "session_id": live_session.id,
                "message": "The driver has started the ride!"
            })
        
        db.commit()
        db.refresh(live_session)
        
        return {
            "message": "Ride started successfully",
            "session_id": live_session.id,
            "ride_id": ride.id,
            "qr_code_token": qr_token
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error starting ride: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/ride-sessions/driver/{ride_id}")
def get_driver_session(ride_id: int, driver_phone: str, db: Session = Depends(get_db)):
    """Get driver's active ride session"""
    driver_phone = normalize_phone(driver_phone)
    
    session = db.query(RideSession).filter(
        RideSession.ride_id == ride_id,
        RideSession.driver_phone == driver_phone
    ).order_by(RideSession.id.desc()).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Ride session not found")
    
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    
    riders = []
    boarded_count = 0
    dropped_count = 0
    
    for rider in session.riders:
        if rider.status in ["boarded", "dropped_off", "completed"]:
            boarded_count += 1
        if rider.status in ["dropped_off", "completed"]:
            dropped_count += 1
        
        riders.append({
            "id": rider.id,
            "booking_id": rider.booking_id,
            "rider_phone": rider.rider_phone,
            "rider_name": rider.rider_name or f"Rider {rider.rider_phone[-4:]}",
            "rider_photo": rider.rider_photo,
            "pickup_location": rider.pickup_location,
            "dropoff_location": rider.dropoff_location,
            "status": rider.status,
            "boarded_at": rider.boarded_at.isoformat() if rider.boarded_at else None,
            "dropped_off_at": rider.dropped_off_at.isoformat() if rider.dropped_off_at else None,
            "completed_at": rider.completed_at.isoformat() if rider.completed_at else None,
            "driver_rating": rider.driver_rating,
            "rider_rating": rider.rider_rating,
        })
    
    return {
        "session_id": session.id,
        "ride_id": ride_id,
        "ride_origin": ride.origin if ride else None,
        "ride_destination": ride.destination if ride else None,
        "departure_time": ride.departure_time.isoformat() if ride and ride.departure_time else None,
        "status": session.status,
        "current_phase": session.current_phase,
        "qr_code_token": session.qr_code_token,
        "boarded_count": boarded_count,
        "dropped_count": dropped_count,
        "total_riders": len(session.riders),
        "sos_active": session.sos_active,
        "emergency_stop_active": session.emergency_stop_active,
        "current_lat": session.current_lat,
        "current_lng": session.current_lng,
        "riders": riders
    }


@router.get("/ride-sessions/rider/{booking_id}")
def get_rider_session(booking_id: int, rider_phone: str, db: Session = Depends(get_db)):
    """Get rider's active ride session"""
    rider_phone = normalize_phone(rider_phone)
    
    rider_session = db.query(RideSessionRider).filter(
        RideSessionRider.booking_id == booking_id,
        RideSessionRider.rider_phone == rider_phone
    ).order_by(RideSessionRider.id.desc()).first()
    
    if not rider_session:
        raise HTTPException(status_code=404, detail="Rider session not found")
    
    session = db.query(RideSession).filter(RideSession.id == rider_session.session_id).first()
    ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
    driver = db.query(User).filter(User.phone_number == session.driver_phone).first()
    
    return {
        "session_id": session.id,
        "booking_id": booking_id,
        "ride_id": session.ride_id,
        "session_status": session.status,
        "current_phase": session.current_phase,
        "driver_phone": session.driver_phone,
        "driver_name": driver.full_name if driver else "Driver",
        "driver_photo": driver.profile_picture if driver else None,
        "driver_rating": driver.avg_rating if driver else 4.5,
        "origin": ride.origin if ride else None,
        "destination": ride.destination if ride else None,
        "rider_status": rider_session.status,
        "pickup_location": rider_session.pickup_location,
        "dropoff_location": rider_session.dropoff_location,
        "pickup_lat": rider_session.pickup_lat,
        "pickup_lng": rider_session.pickup_lng,
        "dropoff_lat": rider_session.dropoff_lat,
        "dropoff_lng": rider_session.dropoff_lng,
        "current_lat": session.current_lat,
        "current_lng": session.current_lng,
        "sos_active": session.sos_active,
        "emergency_stop_active": session.emergency_stop_active,
        "driver_rating_given": rider_session.rider_rating is not None
    }


@router.post("/ride-sessions/{session_id}/rider-reached-pickup")
def rider_reached_pickup(session_id: int, payload: dict, db: Session = Depends(get_db)):
    """Rider notifies that they've reached pickup location"""
    booking_id = payload.get("booking_id")
    rider_phone = normalize_phone(payload.get("rider_phone", ""))
    
    rider = db.query(RideSessionRider).filter(
        RideSessionRider.session_id == session_id,
        RideSessionRider.booking_id == booking_id,
        RideSessionRider.rider_phone == rider_phone
    ).first()
    
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found in session")
    
    if rider.status in ["boarded", "dropped_off", "completed"]:
        raise HTTPException(status_code=400, detail="Ride already in progress")
    
    rider.status = "reached_pickup"
    rider.reached_pickup_at = datetime.now(timezone.utc)
    rider.pickup_confirmed = True
    db.commit()
    
    # Notify driver
    session = db.query(RideSession).filter(RideSession.id == session_id).first()
    if session:
        emit_to_user(session.driver_phone, "rider-reached-pickup", {
            "booking_id": booking_id,
            "rider_phone": rider_phone,
            "rider_name": rider.rider_name,
            "message": f"{rider.rider_name or 'Rider'} has reached the pickup location"
        })
    
    return {"message": "Pickup arrival marked", "status": rider.status}


@router.post("/ride-sessions/{session_id}/rider-board")
def rider_board(session_id: int, payload: dict, db: Session = Depends(get_db)):
    """Rider scans QR code to board the vehicle"""
    booking_id = payload.get("booking_id")
    rider_phone = normalize_phone(payload.get("rider_phone", ""))
    qr_code_token = payload.get("qr_code_token")
    
    session = db.query(RideSession).filter(RideSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Ride session not found")
    
    if session.qr_code_token != qr_code_token:
        raise HTTPException(status_code=400, detail="Invalid QR code")
    
    if session.qr_expires_at and session.qr_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="QR code has expired")
    
    rider = db.query(RideSessionRider).filter(
        RideSessionRider.session_id == session_id,
        RideSessionRider.booking_id == booking_id,
        RideSessionRider.rider_phone == rider_phone
    ).first()
    
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    
    if rider.status in ["boarded", "dropped_off", "completed"]:
        raise HTTPException(status_code=400, detail="Rider already boarded")
    
    rider.status = "boarded"
    rider.boarded_at = datetime.now(timezone.utc)
    
    # Update session status
    all_boarded = all(r.status in ["boarded", "dropped_off", "completed"] for r in session.riders)
    if all_boarded:
        session.status = "en_route"
        session.current_phase = "en_route"
    else:
        session.status = "boarding"
        session.current_phase = "boarding"
    
    db.commit()
    
    # Notify driver
    emit_to_user(session.driver_phone, "rider-boarded", {
        "booking_id": booking_id,
        "rider_phone": rider_phone,
        "rider_name": rider.rider_name,
        "message": f"{rider.rider_name or 'Rider'} has boarded the vehicle"
    })
    
    # Notify rider
    emit_to_user(rider_phone, "rider-boarded", {
        "booking_id": booking_id,
        "session_id": session_id,
        "message": "You have been boarded successfully!"
    })
    
    return {
        "message": "Boarding successful",
        "rider_status": rider.status,
        "session_status": session.status,
        "current_phase": session.current_phase
    }


@router.post("/ride-sessions/{session_id}/rider-dropped-off")
def rider_dropped_off(session_id: int, payload: dict, db: Session = Depends(get_db)):
    """Rider marks that they've been dropped off"""
    booking_id = payload.get("booking_id")
    rider_phone = normalize_phone(payload.get("rider_phone", ""))
    
    rider = db.query(RideSessionRider).filter(
        RideSessionRider.session_id == session_id,
        RideSessionRider.booking_id == booking_id,
        RideSessionRider.rider_phone == rider_phone
    ).first()
    
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    
    if rider.status != "boarded":
        raise HTTPException(status_code=400, detail="Rider must be boarded before drop off")
    
    rider.status = "dropped_off"
    rider.dropped_off_at = datetime.now(timezone.utc)
    rider.dropoff_confirmed = True
    db.commit()
    
    session = db.query(RideSession).filter(RideSession.id == session_id).first()
    
    if session:
        emit_to_user(session.driver_phone, "rider-dropped-off", {
            "booking_id": booking_id,
            "rider_phone": rider_phone,
            "rider_name": rider.rider_name,
            "message": f"{rider.rider_name or 'Rider'} has been dropped off"
        })
        
        emit_to_user(rider_phone, "rider-dropped-off", {
            "booking_id": booking_id,
            "session_id": session_id,
            "message": "You have been dropped off. Please complete the ride."
        })
    
    return {"message": "Dropped off successfully", "rider_status": rider.status}


@router.post("/ride-sessions/{session_id}/rider-complete")
def rider_complete(session_id: int, payload: dict, db: Session = Depends(get_db)):
    """Rider completes the ride and can rate the driver"""
    booking_id = payload.get("booking_id")
    rider_phone = normalize_phone(payload.get("rider_phone", ""))
    
    rider = db.query(RideSessionRider).filter(
        RideSessionRider.session_id == session_id,
        RideSessionRider.booking_id == booking_id,
        RideSessionRider.rider_phone == rider_phone
    ).first()
    
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    
    if rider.status != "dropped_off":
        raise HTTPException(status_code=400, detail="Ride must be completed after drop off")
    
    rider.status = "completed"
    rider.completed_at = datetime.now(timezone.utc)
    db.commit()
    
    session = db.query(RideSession).filter(RideSession.id == session_id).first()
    
    # Check if all riders have completed
    if session:
        all_completed = all(r.status == "completed" for r in session.riders)
        if all_completed:
            session.status = "completed"
            session.current_phase = "completed"
            session.completed_at = datetime.now(timezone.utc)
            
            # Update ride status
            ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
            if ride:
                ride.status = "completed"
            
            db.commit()
            
            emit_to_user(session.driver_phone, "ride-completed", {
                "ride_id": session.ride_id,
                "session_id": session_id,
                "message": "All riders have completed the ride"
            })
    
    emit_to_user(rider_phone, "ride-completed", {
        "booking_id": booking_id,
        "ride_id": session.ride_id if session else None,
        "message": "Your ride has been completed!"
    })
    
    return {"message": "Ride marked completed", "status": rider.status}


@router.post("/ride-sessions/{session_id}/complete")
def complete_ride(session_id: int, payload: dict, db: Session = Depends(get_db)):
    """Driver completes the ride and can rate riders"""
    driver_phone = normalize_phone(payload.get("driver_phone", ""))
    
    session = db.query(RideSession).filter(
        RideSession.id == session_id,
        RideSession.driver_phone == driver_phone
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Ride session not found")
    
    all_completed = all(r.status == "completed" for r in session.riders)
    if not all_completed:
        raise HTTPException(status_code=400, detail="All riders must complete before finishing the ride")
    
    session.status = "completed"
    session.current_phase = "completed"
    session.completed_at = datetime.now(timezone.utc)
    
    ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
    if ride:
        ride.status = "completed"
    
    db.commit()
    
    return {"message": "Ride completed successfully", "status": session.status}


@router.post("/ride-sessions/{session_id}/rate-driver")
def rate_driver(session_id: int, payload: dict, db: Session = Depends(get_db)):
    """Rider rates the driver"""
    booking_id = payload.get("booking_id")
    rating = payload.get("rating")
    feedback = payload.get("feedback", "")
    
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    rider = db.query(RideSessionRider).filter(
        RideSessionRider.session_id == session_id,
        RideSessionRider.booking_id == booking_id
    ).first()
    
    if not rider:
        raise HTTPException(status_code=404, detail="Session rider not found")
    
    if rider.rider_rating:
        raise HTTPException(status_code=400, detail="Rating already submitted")
    
    rider.rider_rating = rating
    rider.rider_feedback = feedback
    db.commit()
    
    # Update driver's average rating
    session = db.query(RideSession).filter(RideSession.id == session_id).first()
    if session:
        driver = db.query(User).filter(User.phone_number == session.driver_phone).first()
        if driver:
            all_ratings = db.query(RideSessionRider.rider_rating).filter(
                RideSessionRider.session_id == session_id,
                RideSessionRider.rider_rating.isnot(None)
            ).all()
            ratings_list = [r[0] for r in all_ratings if r[0]]
            if ratings_list:
                driver.avg_rating = sum(ratings_list) / len(ratings_list)
                driver.total_ratings = len(ratings_list)
                db.commit()
    
    return {"message": "Driver rated successfully"}


@router.post("/ride-sessions/{session_id}/rate-rider")
def rate_rider(session_id: int, payload: dict, db: Session = Depends(get_db)):
    """Driver rates a rider"""
    booking_id = payload.get("booking_id")
    rating = payload.get("rating")
    feedback = payload.get("feedback", "")
    
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    rider = db.query(RideSessionRider).filter(
        RideSessionRider.session_id == session_id,
        RideSessionRider.booking_id == booking_id
    ).first()
    
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    
    if rider.driver_rating:
        raise HTTPException(status_code=400, detail="Rating already submitted")
    
    rider.driver_rating = rating
    rider.driver_feedback = feedback
    db.commit()
    
    return {"message": "Rider rated successfully"}


@router.post("/ride-sessions/{session_id}/location")
def update_driver_location(session_id: int, payload: dict, db: Session = Depends(get_db)):
    """Update driver's current location for live tracking"""
    lat = payload.get("lat")
    lng = payload.get("lng")
    
    if lat is None or lng is None:
        raise HTTPException(status_code=400, detail="Latitude and longitude required")
    
    session = db.query(RideSession).filter(RideSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Ride session not found")
    
    session.current_lat = lat
    session.current_lng = lng
    db.commit()
    
    # Broadcast location to all riders in this session
    for rider in session.riders:
        if rider.status in ["accepted", "reached_pickup", "boarded"]:
            emit_to_user(rider.rider_phone, "driver-location-update", {
                "latitude": lat,
                "longitude": lng,
                "session_id": session_id
            })
    
    return {"message": "Location updated"}


@router.post("/ride-sessions/{session_id}/sos")
def trigger_sos(session_id: int, payload: dict, db: Session = Depends(get_db)):
    """Trigger SOS alert for emergency"""
    session = db.query(RideSession).filter(RideSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Ride session not found")
    
    session.sos_active = True
    session.emergency_note = payload.get("note")
    db.commit()
    
    # Notify all riders about SOS
    for rider in session.riders:
        emit_to_user(rider.rider_phone, "sos-triggered", {
            "session_id": session_id,
            "message": "Emergency SOS has been triggered"
        })
    
    return {"message": "SOS triggered successfully"}


# ============================================
# RIDE FEEDBACK ENDPOINTS
# ============================================

@router.get("/ride/{ride_id}/ratings")
def get_ride_ratings(ride_id: int, db: Session = Depends(get_db)):
    """Get all ratings for a ride (for display after completion)"""
    session = db.query(RideSession).filter(
        RideSession.ride_id == ride_id,
        RideSession.status == "completed"
    ).order_by(RideSession.id.desc()).first()
    
    if not session:
        return {"ratings": []}
    
    ratings = []
    for rider in session.riders:
        ratings.append({
            "booking_id": rider.booking_id,
            "rider_name": rider.rider_name,
            "rider_phone": rider.rider_phone,
            "rider_photo": rider.rider_photo,
            "driver_rating_given": rider.driver_rating is not None,
            "driver_rating": rider.driver_rating,
            "driver_feedback": rider.driver_feedback,
            "rider_rating_given": rider.rider_rating is not None,
            "rider_rating": rider.rider_rating,
            "rider_feedback": rider.rider_feedback,
            "status": rider.status
        })
    
    return {"ratings": ratings}

@router.put("/update-ride/{ride_id}")
def update_ride(ride_id: int, data: UpdateRideRequest, db: Session = Depends(get_db)):
    """Update an existing ride"""
    normalized_phone = normalize_phone(data.phone_number)
    
    # Fetch existing ride
    ride = db.query(Ride).filter(
        Ride.id == ride_id,
        Ride.phone_number == normalized_phone
    ).first()
    
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found or you don't have permission to edit it")
    
    # Check if ride can be edited (not started, not cancelled)
    if ride.started_at:
        raise HTTPException(status_code=400, detail="Cannot edit ride - Ride has already started")
    
    if ride.cancellation_reason:
        raise HTTPException(status_code=400, detail="Cannot edit cancelled ride")
    
    # Check if ride has confirmed bookings
    confirmed_bookings = db.query(RideBooking).filter(
        RideBooking.ride_id == ride_id,
        RideBooking.status == "accepted"
    ).all()
    
    has_confirmed_bookings = len(confirmed_bookings) > 0
    total_booked_seats = sum(b.seats_booked for b in confirmed_bookings)
    
    # Parse duration
    duration_minutes = parse_duration_to_minutes(data.duration_text)
    
    # Convert departure time to UTC
    departure_time_utc = data.departure_time
    if departure_time_utc.tzinfo is None:
        departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
    else:
        departure_time_utc = departure_time_utc.astimezone(timezone.utc)
    
    expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
    # Validate time (minimum 30 minutes from now for new rides, but can be anytime for existing)
    min_departure_time = datetime.now(timezone.utc) + timedelta(minutes=30)
    if departure_time_utc < min_departure_time:
        min_time_ist = to_ist(min_departure_time)
        raise HTTPException(status_code=400, detail=f"Departure time must be at least 30 minutes from now. Please select a time after {min_time_ist.strftime('%I:%M %p')}.")
    
    # Validate seat changes (cannot reduce below booked seats)
    if data.available_seats < total_booked_seats:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot reduce seats below {total_booked_seats} as you have {total_booked_seats} confirmed passenger(s)."
        )
    
    # Validate distance
    distance = calculate_distance_km(
        data.origin_coords[1], data.origin_coords[0],
        data.destination_coords[1], data.destination_coords[0]
    )
    
    MIN_DISTANCE_KM = 3
    MAX_DISTANCE_KM = 300
    
    if distance < MIN_DISTANCE_KM:
        raise HTTPException(status_code=400, detail=f"Pickup and destination are too close ({distance:.1f} km).")
    if distance > MAX_DISTANCE_KM:
        raise HTTPException(status_code=400, detail=f"Distance too far ({distance:.1f} km).")
    
    # Women Only toggle validation
    new_women_only = data.preferences.get('womenOnly', False) if data.preferences else data.women_only
    
    if ride.women_only != new_women_only:
        if new_women_only == False and ride.women_only == True:
            female_bookings = db.query(RideBooking).join(User).filter(
                RideBooking.ride_id == ride_id,
                RideBooking.status == "accepted",
                User.gender == "female"
            ).count()
            
            if female_bookings > 0:
                raise HTTPException(
                    status_code=403,
                    detail=f"Cannot disable Women Only mode - {female_bookings} female passenger(s) have already booked this ride."
                )
    
    # Lock major fields if there are confirmed bookings
    time_diff_minutes = abs((departure_time_utc - ride.departure_time).total_seconds()) / 60
    
    if has_confirmed_bookings:
        critical_changes = []
        
        if ride.origin != data.origin:
            critical_changes.append("Origin")
        if ride.destination != data.destination:
            critical_changes.append("Destination")
        if time_diff_minutes > 10:
            critical_changes.append("Time (more than 10 minutes)")
        if ride.price_per_seat != data.price_per_seat:
            critical_changes.append("Price")
        
        if critical_changes:
            raise HTTPException(
                status_code=403,
                detail=f"Cannot modify: {', '.join(critical_changes)}. This ride has {len(confirmed_bookings)} confirmed booking(s)."
            )
    
    # Update ride fields
    ride.origin = data.origin
    ride.destination = data.destination
    ride.departure_time = departure_time_utc
    ride.expected_end_time = expected_end_time
    ride.duration_minutes = duration_minutes
    ride.available_seats = data.available_seats
    ride.price_per_seat = data.price_per_seat
    ride.distance_km = data.distance_km
    ride.duration_text = data.duration_text
    ride.total_estimated_price = data.total_estimated_price
    ride.preferences = data.preferences
    ride.origin_lon = data.origin_coords[0]
    ride.origin_lat = data.origin_coords[1]
    ride.destination_lon = data.destination_coords[0]
    ride.destination_lat = data.destination_coords[1]
    ride.route_coordinates = data.route_coordinates
    ride.vehicle_id = data.vehicle_id
    ride.women_only = new_women_only
    
    # Update status based on remaining seats
    remaining_seats = ride.available_seats - total_booked_seats
    if remaining_seats <= 0 and ride.status == "active":
        ride.status = "full"
    elif remaining_seats > 0 and ride.status == "full":
        ride.status = "active"
    
    db.commit()
    db.refresh(ride)
    
    # Create notification for ride update
    try:
        origin_short = data.origin.split(",")[0].strip() if data.origin else "start"
        dest_short = data.destination.split(",")[0].strip() if data.destination else "destination"
        
        notification = UserNotification(
            phone_number=normalized_phone,
            title="Ride Updated! 🔄",
            message=f"Your ride from {origin_short} to {dest_short} has been updated successfully.",
            type=NotificationType.RIDE,
            action_type="ride",
            action_value=str(ride.id),
            is_read=False,
            is_deleted=False
        )
        db.add(notification)
        db.commit()
    except Exception as e:
        print(f"Error creating update notification: {str(e)}")
    
    return {
        "message": "Ride updated successfully",
        "ride_id": ride.id,
        "remaining_seats": max(0, ride.available_seats - total_booked_seats),
        "total_booked": total_booked_seats
    }
@router.put("/booking/{booking_id}/modify-seats")
def modify_booking_seats(booking_id: int, new_seats: int, db: Session = Depends(get_db)):
    """Modify seats for a pending booking (not modification request)"""
    booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Only pending bookings can be directly modified
    if booking.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending bookings can be directly modified")
    
    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    if new_seats <= 0:
        raise HTTPException(status_code=400, detail="Seat count must be at least 1")
    
    # Check if ride is still available
    if ride.status not in ["active", "full"]:
        raise HTTPException(status_code=400, detail="Ride is no longer available")
    
    # Check available seats
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
def check_and_auto_cancel_expired_rides(db: Session):
    """Check for rides that haven't started within 30 minutes of departure and auto-cancel them"""
    now = datetime.now(timezone.utc)
    cutoff_time = now - timedelta(minutes=30)
    
    expired_rides = db.query(Ride).filter(
        Ride.departure_time <= cutoff_time,
        Ride.started_at.is_(None),
        Ride.status.in_(["active", "full"]),
        Ride.cancellation_reason.is_(None)
    ).all()
    
    auto_cancelled_count = 0
    
    for ride in expired_rides:
        ride.status = "cancelled"
        ride.cancellation_reason = "Auto-cancelled: Ride was not started within 30 minutes of departure time"
        
        # Cancel all pending modification requests
        pending_mods = db.query(ModificationRequest).filter(
            ModificationRequest.ride_id == ride.id,
            ModificationRequest.status == "pending"
        ).all()
        
        for mod in pending_mods:
            mod.status = "cancelled"
            mod.rejection_reason = "Ride auto-cancelled - not started on time"
            mod.cancelled_at = now
        
        # Cancel all accepted bookings
        accepted_bookings = db.query(RideBooking).filter(
            RideBooking.ride_id == ride.id,
            RideBooking.status == "accepted"
        ).all()
        
        for booking in accepted_bookings:
            booking.status = "cancelled"
            booking.cancellation_reason = "Ride auto-cancelled - not started on time"
            
            # Notify passenger
            notification = UserNotification(
                phone_number=booking.passenger_phone,
                title="Ride Auto-cancelled ⏰",
                message=f"The ride from {ride.origin} to {ride.destination} has been auto-cancelled as it was not started on time.",
                type="ride",
                action_type="cancellation",
                action_value=str(ride.id),
                is_read=False,
                is_deleted=False
            )
            db.add(notification)
            
            emit_to_user(booking.passenger_phone, "ride-auto-cancelled", {
                "ride_id": ride.id,
                "booking_id": booking.id,
                "message": "Ride was not started on time and has been auto-cancelled"
            })
        
        auto_cancelled_count += 1
    
    if auto_cancelled_count > 0:
        db.commit()
        print(f"Auto-cancelled {auto_cancelled_count} expired rides")
    
    return auto_cancelled_count
@router.post("/rides/check-auto-cancel")
def check_auto_cancel_rides(db: Session = Depends(get_db)):
    """Endpoint to manually trigger auto-cancellation check"""
    count = check_and_auto_cancel_expired_rides(db)
    return {"message": f"Auto-cancelled {count} expired rides", "count": count}
# Add these helper functions if not already present (they are in your code but ensure they're there)

def check_overlapping_bookings_for_passenger(db: Session, phone_number: str, departure_time: datetime, duration_minutes: int, exclude_booking_id: Optional[int] = None) -> Optional[Dict]:
    """Check if passenger has overlapping active/accepted bookings"""
    
    departure_time_utc = departure_time
    if departure_time_utc.tzinfo is None:
        departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
    
    expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
    # Add buffer (30 minutes before start, 60 minutes after end for passenger)
    buffer_start = departure_time_utc - timedelta(minutes=30)
    buffer_end = expected_end_time + timedelta(minutes=60)
    
    query = db.query(RideBooking).join(Ride).filter(
        RideBooking.passenger_phone == phone_number,
        RideBooking.status.in_(["accepted"]),  # Only accepted bookings count as active
        Ride.departure_time < buffer_end,
        Ride.expected_end_time > buffer_start
    )
    
    if exclude_booking_id:
        query = query.filter(RideBooking.id != exclude_booking_id)
    
    overlapping = query.first()
    
    if overlapping:
        return {
            "booking_id": overlapping.id,
            "ride_id": overlapping.ride_id,
            "origin": overlapping.ride.origin,
            "destination": overlapping.ride.destination,
            "departure_time": overlapping.ride.departure_time,
            "expected_end_time": overlapping.ride.expected_end_time
        }
    
    return None


def check_overlapping_rides_for_driver(db: Session, phone_number: str, departure_time: datetime, duration_minutes: int, exclude_ride_id: Optional[int] = None) -> Optional[Dict]:
    """Check if driver has overlapping active rides"""
    
    departure_time_utc = departure_time
    if departure_time_utc.tzinfo is None:
        departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
    
    expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
    # Add buffer (30 minutes before start, 15 minutes after end for overlap detection)
    buffer_start = departure_time_utc - timedelta(minutes=30)
    buffer_end = expected_end_time + timedelta(minutes=15)
    
    query = db.query(Ride).filter(
        Ride.phone_number == phone_number,
        Ride.status.in_(["active", "full"]),
        Ride.departure_time < buffer_end,
        Ride.expected_end_time > buffer_start
    )
    
    if exclude_ride_id:
        query = query.filter(Ride.id != exclude_ride_id)
    
    overlapping = query.first()
    
    if overlapping:
        return {
            "ride_id": overlapping.id,
            "origin": overlapping.origin,
            "destination": overlapping.destination,
            "departure_time": overlapping.departure_time,
            "expected_end_time": overlapping.expected_end_time
        }
    
    return None

