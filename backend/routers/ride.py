
# import os
# import secrets
# from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session, joinedload
# from sqlalchemy import func, text, and_, or_
# from database import get_db
# from models import Ride, RideBooking, ModificationRequest, RideFeedback, RideRequest, User, UserNotification, NotificationType, Vehicle, RideSession, RideSessionRider
# from datetime import datetime, timezone, timedelta
# from pydantic import BaseModel, field_validator
# from typing import Optional, Dict, List
# import math
# import re
# import uuid
# import random
# import string

# from fastapi import Header, HTTPException, status
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
# def to_ist(dt: datetime) -> datetime:
#     """Convert datetime to IST timezone (UTC+5:30)"""
#     if dt is None:
#         return dt
#     if dt.tzinfo is None:
#         dt = dt.replace(tzinfo=timezone.utc)
#     ist = timezone(timedelta(hours=5, minutes=30))
#     return dt.astimezone(ist)
# def now_ist() -> datetime:
#     """Get current time in IST"""
#     return datetime.now(timezone.utc).astimezone(IST)

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

# def generate_custom_ride_id():
#     """Generate ride ID in format: R + 4 digits + 2 letters (e.g., R1234TH)"""
#     digits = ''.join(str(random.randint(0, 9)) for _ in range(4))
#     letters = ''.join(random.choices(string.ascii_uppercase, k=2))
#     return f"R{digits}{letters}"

# def generate_custom_booking_id():
#     """Generate booking ID in format: B + 4 digits + 2 letters (e.g., B7655GT)"""
#     digits = ''.join(str(random.randint(0, 9)) for _ in range(4))
#     letters = ''.join(random.choices(string.ascii_uppercase, k=2))
#     return f"B{digits}{letters}"

# def generate_unique_ride_id(db: Session, retries: int = 5):
#     """Generate a unique ride ID that doesn't exist in the database"""
#     for _ in range(retries):
#         ride_id = generate_custom_ride_id()
#         existing = db.query(Ride).filter(Ride.custom_ride_id == ride_id).first()
#         if not existing:
#             return ride_id
#     # If all retries fail, use timestamp-based fallback
#     return f"R{int(datetime.now().timestamp())}{random.choice(string.ascii_uppercase)}{random.choice(string.ascii_uppercase)}"

# def generate_unique_booking_id(db: Session, retries: int = 5):
#     """Generate a unique booking ID that doesn't exist in the database"""
#     for _ in range(retries):
#         booking_id = generate_custom_booking_id()
#         existing = db.query(RideBooking).filter(RideBooking.custom_booking_id == booking_id).first()
#         if not existing:
#             return booking_id
#     # If all retries fail, use timestamp-based fallback
#     return f"B{int(datetime.now().timestamp())}{random.choice(string.ascii_uppercase)}{random.choice(string.ascii_uppercase)}"
# def parse_duration_to_minutes(duration_str: Optional[str]) -> int:
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
#     R = 6371
#     dlat = math.radians(lat2 - lat1)
#     dlon = math.radians(lon2 - lon1)
#     a = math.sin(dlat/2) * math.sin(dlat/2) + \
#         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
#         math.sin(dlon/2) * math.sin(dlon/2)
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
#     return R * c

# def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
#     R = 6371000
#     phi1 = math.radians(lat1)
#     phi2 = math.radians(lat2)
#     dphi = math.radians(lat2 - lat1)
#     dlambda = math.radians(lon2 - lon1)
#     a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
#     return R * c

# def get_total_booked_seats(db: Session, ride_id: int) -> int:
#     """Get total booked seats for a ride (only accepted bookings)"""
#     result = db.query(func.sum(RideBooking.seats_booked)).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status == "accepted"
#     ).scalar()
#     return result or 0
  

# def get_available_seats(db: Session, ride_id: int) -> int:
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         return 0
#     total_booked = get_total_booked_seats(db, ride_id)
#     return max(0, ride.available_seats - total_booked)

# def find_nearest_route_vertex(route_coords: List[List[float]], lng: float, lat: float) -> Optional[Dict]:
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


# # ============================================
# # PYDANTIC MODELS
# # ============================================
# class ModifySeatsRequest(BaseModel):
#     new_seats: int
#     pickup_address: Optional[str] = None
#     dropoff_address: Optional[str] = None
#     pickup_place_name: Optional[str] = None
#     dropoff_place_name: Optional[str] = None
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
#     pickup_address: Optional[str] = None  # Full formatted pickup address
#     dropoff_address: Optional[str] = None  # Full formatted dropoff address
#     pickup_place_name: Optional[str] = None  # Short name/landmark for pickup
#     dropoff_place_name: Optional[str] = None  # Short name/landmark for dropoff

#     @field_validator("from_coords", "to_coords")
#     @classmethod
#     def validate_optional_coords(cls, value):
#         if value is None:
#             return value
#         if len(value) != 2:
#             raise ValueError("Coordinates must contain exactly [lng, lat]")
#         return value


# class ModificationRequestSchema(BaseModel):
#     requested_seats: int


# # ============================================
# # RIDE ENDPOINTS
# # ============================================
# @router.post("/post-ride")
# def post_ride(data: CreateRideRequest, db: Session = Depends(get_db)):
#     normalized_phone = normalize_phone(data.phone_number)
#     duration_minutes = parse_duration_to_minutes(data.duration_text)
    
#     # Convert departure time to UTC for storage
#     departure_time = data.departure_time
    
#     # If the time has no timezone, assume it's IST
#     if departure_time.tzinfo is None:
#         # Create IST timezone
#         ist = timezone(timedelta(hours=5, minutes=30))
#         # Localize to IST
#         departure_time_ist = ist.localize(departure_time)
#         # Convert to UTC
#         departure_time_utc = departure_time_ist.astimezone(timezone.utc)
#     else:
#         # Already has timezone, convert to UTC
#         departure_time_utc = departure_time.astimezone(timezone.utc)
#     print(f"📅 Received departure time: {departure_time}")
#     print(f"📅 Converted to UTC: {departure_time_utc}")
#     print(f"📅 Back to IST: {to_ist(departure_time_utc)}")
    
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
#     # Generate unique custom ride ID
#     custom_ride_id = generate_unique_ride_id(db)
    
#     # Check for passenger overlap
#     passenger_overlap = check_overlapping_bookings_for_passenger(db, normalized_phone, departure_time_utc, duration_minutes)
#     if passenger_overlap:
#         raise HTTPException(
#             status_code=409,
#             detail=f"You have a confirmed booking as a passenger from {passenger_overlap['origin']} to {passenger_overlap['destination']} at {to_ist(passenger_overlap['departure_time']).strftime('%I:%M %p')} that overlaps with this ride."
#         )
    
#     # Check for driver overlapping rides
#     overlapping = check_overlapping_rides_for_driver(db, normalized_phone, departure_time_utc, duration_minutes)
#     if overlapping:
#         end_time_ist = to_ist(overlapping["expected_end_time"])
#         raise HTTPException(
#             status_code=409,
#             detail=f"You already have an active ride from {overlapping['origin']} to {overlapping['destination']} at {to_ist(overlapping['departure_time']).strftime('%I:%M %p')}. Please wait until {end_time_ist.strftime('%I:%M %p')} to post another ride."
#         )
    
#     # Validate distance
#     distance = calculate_distance_km(
#         data.origin_coords[1], data.origin_coords[0],
#         data.destination_coords[1], data.destination_coords[0]
#     )
    
#     MIN_DISTANCE_KM = 3
#     MAX_DISTANCE_KM = 300
    
#     if distance < MIN_DISTANCE_KM:
#         raise HTTPException(status_code=400, detail=f"Pickup and destination are too close ({distance:.1f} km)")
#     if distance > MAX_DISTANCE_KM:
#         raise HTTPException(status_code=400, detail=f"Distance too far ({distance:.1f} km)")
    
#     # Validate time
#     min_departure_time = datetime.now(timezone.utc) + timedelta(minutes=30)
#     if departure_time_utc < min_departure_time:
#         min_time_ist = to_ist(min_departure_time)
#         raise HTTPException(status_code=400, detail=f"Departure time must be at least 30 minutes from now")
    
#     women_only = data.preferences.get('womenOnly', False) if data.preferences else data.women_only
    
#     ride = Ride(
#         custom_ride_id=custom_ride_id,  # Add this
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
#     if ride.id:
#         # Call the matching function
#         check_matching_ride_requests(db, ride)
#     return {
#         "message": "Ride posted successfully", 
#         "ride_id": ride.id,
#         "custom_ride_id": ride.custom_ride_id  # Return the custom ID
#     }

# @router.post("/ride-bookings")
# def create_ride_booking(data: CreateRideBookingRequest, db: Session = Depends(get_db)):
#     passenger_phone = normalize_phone(data.passenger_phone)
#     ride = db.query(Ride).filter(Ride.id == data.ride_id).first()
    
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
#     if ride.status not in ["active", "full"]:
#         raise HTTPException(status_code=400, detail="Ride is not available")
    
#     total_booked = get_total_booked_seats(db, ride.id)
#     remaining_seats = ride.available_seats - total_booked
    
#     if remaining_seats < data.seats_requested:
#         raise HTTPException(status_code=400, detail=f"Not enough seats available. Only {remaining_seats} seat(s) left.")
#     if ride.phone_number == passenger_phone:
#         raise HTTPException(status_code=400, detail="You cannot book your own ride")
    
#     # Check for existing pending modification
#     existing_mod = db.query(ModificationRequest).filter(
#         ModificationRequest.ride_id == ride.id,
#         ModificationRequest.status == "pending"
#     ).first()
    
#     existing_accepted = db.query(RideBooking).filter(
#         RideBooking.ride_id == data.ride_id,
#         RideBooking.passenger_phone == passenger_phone,
#         RideBooking.status == "accepted"
#     ).first()
    
#     if existing_accepted:
#         raise HTTPException(status_code=400, detail="You already have a confirmed booking for this ride")
    
#     total_amount = ride.price_per_seat * data.seats_requested
    
#     # Generate unique custom booking ID
#     custom_booking_id = generate_unique_booking_id(db)
    
#     # Calculate intersection points
#     pickup_lat = pickup_lon = drop_lat = drop_lon = None
#     int_pickup_lat = int_pickup_lon = int_drop_lat = int_drop_lon = None
#     pickup_walk_m = drop_walk_m = None
    
#     if data.from_coords and data.to_coords and ride.route_coordinates:
#         try:
#             pickup_pt = find_nearest_route_vertex(ride.route_coordinates, data.from_coords[0], data.from_coords[1])
#             drop_pt = find_nearest_route_vertex(ride.route_coordinates, data.to_coords[0], data.to_coords[1])
#             if pickup_pt:
#                 int_pickup_lon = pickup_pt["lng"]
#                 int_pickup_lat = pickup_pt["lat"]
#             if drop_pt:
#                 int_drop_lon = drop_pt["lng"]
#                 int_drop_lat = drop_pt["lat"]
#             pickup_lat = data.from_coords[1]
#             pickup_lon = data.from_coords[0]
#             drop_lat = data.to_coords[1]
#             drop_lon = data.to_coords[0]
            
#             # Calculate walk distances
#             if pickup_pt and data.from_coords:
#                 pickup_walk_m = int(haversine_m(pickup_lat, pickup_lon, int_pickup_lat, int_pickup_lon))
#             if drop_pt and data.to_coords:
#                 drop_walk_m = int(haversine_m(drop_lat, drop_lon, int_drop_lat, int_drop_lon))
#         except Exception as e:
#             print(f"⚠️ Intersection compute error: {e}")

#     # Create booking with addresses
#     booking = RideBooking(
#         custom_booking_id=custom_booking_id,
#         ride_id=data.ride_id,
#         passenger_phone=passenger_phone,
#         seats_booked=data.seats_requested,
#         total_amount=total_amount,
#         # ADD ADDRESS FIELDS
#         pickup_address=data.pickup_address,
#         dropoff_address=data.dropoff_address,
#         pickup_place_name=data.pickup_place_name,
#         dropoff_place_name=data.dropoff_place_name,
#         # Coordinates
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
#     db.commit()
#     db.refresh(booking)

#     # Notify driver
#     driver_phone = normalize_phone(ride.phone_number)
#     origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
#     dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
    
#     notification = UserNotification(
#         phone_number=driver_phone,
#         title="New Ride Request 🙋",
#         message=f"You received a request for {data.seats_requested} seat(s) for your ride from {origin_short} to {dest_short}.",
#         type=NotificationType.RIDE,  
#         action_type="booking",
#         action_value=str(booking.id),
#         is_read=False,
#         is_deleted=False
#     )
#     db.add(notification)
#     db.commit()

#     return {
#         "message": "Ride request sent successfully", 
#         "booking_id": booking.id,
#         "custom_booking_id": booking.custom_booking_id,
#         "status": booking.status
#     }
# @router.post("/search-rides")
# def search_rides(data: SearchRidesRequest, db: Session = Depends(get_db)):
#     req_time_utc = data.departure_time
#     if req_time_utc.tzinfo is None:
#         req_time_utc = req_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         req_time_utc = req_time_utc.astimezone(timezone.utc)

#     query = db.query(Ride).filter(
#         Ride.status.in_(["active", "full"]),
#         Ride.departure_time.between(
#             req_time_utc - timedelta(minutes=TIME_WINDOW_MINUTES),
#             req_time_utc + timedelta(minutes=TIME_WINDOW_MINUTES)
#         )
#     )
    
#     if data.passenger_gender != 'female':
#         query = query.filter(Ride.women_only == False)

#     all_rides = query.all()
    
#     rides = []
    
#     for ride in all_rides:
#         total_booked = get_total_booked_seats(db, ride.id)
#         remaining_seats = max(0, ride.available_seats - total_booked)
        
#         # if remaining_seats == 0:
#         #     continue
        
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
            
#             if ride.route_coordinates:
#                 pickup_point = find_nearest_route_vertex(ride.route_coordinates, data.from_coords[0], data.from_coords[1])
#                 drop_point = find_nearest_route_vertex(ride.route_coordinates, data.to_coords[0], data.to_coords[1])
        
#         if pickup_distance_m > SEARCH_RADIUS_M * 2 or drop_distance_m > SEARCH_RADIUS_M * 2:
#             continue
        
#         pickup_score = max(0, 1 - (pickup_distance_m / SEARCH_RADIUS_M))
#         drop_score = max(0, 1 - (drop_distance_m / SEARCH_RADIUS_M))
#         time_diff_min = abs((ride.departure_time - req_time_utc).total_seconds()) / 60
#         time_score = max(0, 1 - (time_diff_min / 60))
#         match_percentage = round(100 * (0.35 * pickup_score + 0.35 * drop_score + 0.20 * time_score + 0.10))
        
#         driver = db.query(User).filter(User.phone_number == ride.phone_number).first()
#         driver_name = None
#         if driver:
#             driver_name = driver.full_name or " ".join(filter(None, [driver.first_name, driver.last_name]))
#         if not driver_name:
#             driver_name = f"Driver {ride.phone_number[-4:]}"
        
#         vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first() if ride.vehicle_id else None
        
#         departure_time_ist = to_ist(ride.departure_time)
        
#         rides.append({
#             "id": ride.id,
#             "driverName": driver_name,
#             "driverUserId": driver.user_id if driver else None,
#             "phoneNumber": ride.phone_number,
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
#             "price": ride.price_per_seat,
#             "matchPercentage": match_percentage,
#             "seatsAvailable": remaining_seats,
#             "totalSeats": ride.available_seats,
#             "bookedSeats": total_booked,
#             "distanceKm": ride.distance_km,
#             "durationText": ride.duration_text,
#             "routeCoordinates": ride.route_coordinates or [],
#             "status": ride.status,
#             "isFull": remaining_seats == 0,
#         })
    
#     rides.sort(key=lambda x: (-x["matchPercentage"]))
#     return {"rides": rides}


# # @router.post("/ride-bookings")
# # def create_ride_booking(data: CreateRideBookingRequest, db: Session = Depends(get_db)):
# #     passenger_phone = normalize_phone(data.passenger_phone)
# #     ride = db.query(Ride).filter(Ride.id == data.ride_id).first()
    
# #     if not ride:
# #         raise HTTPException(status_code=404, detail="Ride not found")
# #     if ride.status not in ["active", "full"]:
# #         raise HTTPException(status_code=400, detail="Ride is not available")
    
# #     total_booked = get_total_booked_seats(db, ride.id)
# #     remaining_seats = ride.available_seats - total_booked
    
# #     if remaining_seats < data.seats_requested:
# #         raise HTTPException(status_code=400, detail=f"Not enough seats available. Only {remaining_seats} seat(s) left.")
# #     if ride.phone_number == passenger_phone:
# #         raise HTTPException(status_code=400, detail="You cannot book your own ride")
# #      # Check for existing pending modification that might conflict
# #     existing_mod = db.query(ModificationRequest).filter(
# #         ModificationRequest.ride_id == ride.id,
# #         ModificationRequest.status == "pending"
# #     ).first()
    
# #     existing_accepted = db.query(RideBooking).filter(
# #         RideBooking.ride_id == data.ride_id,
# #         RideBooking.passenger_phone == passenger_phone,
# #         RideBooking.status == "accepted"
# #     ).first()
    
# #     if existing_accepted:
# #         raise HTTPException(status_code=400, detail="You already have a confirmed booking for this ride")
    
# #     total_amount = ride.price_per_seat * data.seats_requested
    
# #     # Calculate intersection points
# #     pickup_lat = pickup_lon = drop_lat = drop_lon = None
# #     int_pickup_lat = int_pickup_lon = int_drop_lat = int_drop_lon = None
# #     pickup_walk_m = drop_walk_m = None
    
# #     if data.from_coords and data.to_coords and ride.route_coordinates:
# #         try:
# #             pickup_pt = find_nearest_route_vertex(ride.route_coordinates, data.from_coords[0], data.from_coords[1])
# #             drop_pt = find_nearest_route_vertex(ride.route_coordinates, data.to_coords[0], data.to_coords[1])
# #             if pickup_pt:
# #                 int_pickup_lon = pickup_pt["lng"]
# #                 int_pickup_lat = pickup_pt["lat"]
# #             if drop_pt:
# #                 int_drop_lon = drop_pt["lng"]
# #                 int_drop_lat = drop_pt["lat"]
# #             pickup_lat = data.from_coords[1]
# #             pickup_lon = data.from_coords[0]
# #             drop_lat = data.to_coords[1]
# #             drop_lon = data.to_coords[0]
# #         except Exception as e:
# #             print(f"⚠️ Intersection compute error: {e}")

# #     booking = RideBooking(
# #         ride_id=data.ride_id,
# #         passenger_phone=passenger_phone,
# #         seats_booked=data.seats_requested,
# #         total_amount=total_amount,
# #         pickup_lat=pickup_lat,
# #         pickup_lon=pickup_lon,
# #         drop_lat=drop_lat,
# #         drop_lon=drop_lon,
# #         intersection_pickup_lat=int_pickup_lat,
# #         intersection_pickup_lon=int_pickup_lon,
# #         intersection_drop_lat=int_drop_lat,
# #         intersection_drop_lon=int_drop_lon,
# #         pickup_walk_distance_m=pickup_walk_m,
# #         drop_walk_distance_m=drop_walk_m,
# #         status="pending"
# #     )

# #     db.add(booking)
# #     db.commit()
# #     db.refresh(booking)

# #     # Notify driver
# #     driver_phone = normalize_phone(ride.phone_number)
# #     origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
# #     dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
    
# #     notification = UserNotification(
# #         phone_number=driver_phone,
# #         title="New Ride Request 🙋",
# #         message=f"You received a request for {data.seats_requested} seat(s) for your ride from {origin_short} to {dest_short}.",
# #         type=NotificationType.RIDE,  
# #         action_type="booking",
# #         action_value=str(booking.id),
# #         is_read=False,
# #         is_deleted=False
# #     )
# #     db.add(notification)
# #     db.commit()

# #     return {"message": "Ride request sent successfully", "booking_id": booking.id, "status": booking.status}
# from models import NotificationType


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
#         booking.status = "rejected"
#         db.commit()
#         raise HTTPException(status_code=400, detail="Not enough seats available anymore")

#     booking.status = "accepted"
    
#     total_booked_after = get_total_booked_seats(db, ride.id)
#     if ride.available_seats <= total_booked_after:
#         ride.status = "full"
    
#     db.commit()

#     # Notify passenger
#     origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
#     dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
    
#     notification = UserNotification(
#         phone_number=booking.passenger_phone,
#         title="Booking Accepted! ✅",
#         message=f"Your request for {booking.seats_booked} seat(s) on the ride from {origin_short} to {dest_short} has been accepted by the driver.",
#         type=NotificationType.RIDE,
#         action_type="booking",
#         action_value=str(booking.id),
#         is_read=False,
#         is_deleted=False
#     )
#     db.add(notification)
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

#     return {"message": "Booking cancelled successfully"}
# @router.put("/ride/{ride_id}/cancel")
# def cancel_ride(ride_id: int, db: Session = Depends(get_db)):
#     """Cancel a ride and update all related records"""
#     try:
#         ride = db.query(Ride).filter(Ride.id == ride_id).first()
#         if not ride:
#             raise HTTPException(status_code=404, detail="Ride not found")
        
#         # Check if ride can be cancelled
#         if ride.started_at:
#             raise HTTPException(status_code=400, detail="Cannot cancel ride that has already started")
        
#         if ride.status == "completed":
#             raise HTTPException(status_code=400, detail="Cannot cancel completed ride")
        
#         if ride.status == "cancelled":
#             raise HTTPException(status_code=400, detail="Ride is already cancelled")
        
#         # Store original status
#         old_status = ride.status
#         ride.status = "cancelled"
        
#         # Only set cancellation_reason if column exists
#         if hasattr(ride, 'cancellation_reason'):
#             ride.cancellation_reason = "Cancelled by driver"
        
#         # Only set cancelled_at if column exists (skip if not)
#         cancelled_modifications_count = 0
#         affected_passengers = []
        
#         # 1. Cancel all pending modification requests (if model exists)
#         try:
#             from models import ModificationRequest
#             pending_modifications = db.query(ModificationRequest).filter(
#                 ModificationRequest.ride_id == ride_id,
#                 ModificationRequest.status == "pending"
#             ).all()
            
#             for mod_request in pending_modifications:
#                 mod_request.status = "cancelled"
#                 if hasattr(mod_request, 'rejection_reason'):
#                     mod_request.rejection_reason = "Ride was cancelled by driver"
#                 cancelled_modifications_count += 1
                
#                 # Notify passenger about cancelled modification request
#                 passenger_notification = UserNotification(
#                     phone_number=mod_request.passenger_phone,
#                     title="Modification Request Cancelled ❌",
#                     message=f"Your seat modification request for ride from {ride.origin} to {ride.destination} has been cancelled because the ride was cancelled.",
#                     type=NotificationType.RIDE,
#                     action_type="modification",
#                     action_value=str(mod_request.id),
#                     is_read=False,
#                     is_deleted=False
#                 )
#                 db.add(passenger_notification)
                
#                 # Emit socket event to passenger
#                 emit_to_user(mod_request.passenger_phone, "modification-cancelled", {
#                     "ride_id": ride_id,
#                     "request_id": mod_request.id,
#                     "message": "Your modification request was cancelled because the ride was cancelled"
#                 })
#         except ImportError:
#             # ModificationRequest model doesn't exist
#             pass
#         except Exception as e:
#             print(f"Error processing modification requests: {str(e)}")
        
#         # 2. Cancel all accepted bookings
#         accepted_bookings = db.query(RideBooking).filter(
#             RideBooking.ride_id == ride_id,
#             RideBooking.status == "accepted"
#         ).all()
        
#         for booking in accepted_bookings:
#             booking.status = "cancelled"
#             if hasattr(booking, 'cancellation_reason'):
#                 booking.cancellation_reason = "Ride cancelled by driver"
#             affected_passengers.append({
#                 "phone": booking.passenger_phone,
#                 "seats": booking.seats_booked,
#                 "booking_id": booking.id
#             })
            
#             # Notify passenger
#             origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
#             dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
            
#             notification = UserNotification(
#                 phone_number=booking.passenger_phone,
#                 title="Ride Cancelled ❌",
#                 message=f"Your booking for {booking.seats_booked} seat(s) on the ride from {origin_short} to {dest_short} has been cancelled by the driver.",
#                 type=NotificationType.RIDE,
#                 action_type="cancellation",
#                 action_value=str(ride.id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
            
#             # Emit socket event to passenger
#             emit_to_user(booking.passenger_phone, "booking-cancelled", {
#                 "ride_id": ride_id,
#                 "booking_id": booking.id,
#                 "message": f"Your booking for {booking.seats_booked} seat(s) has been cancelled",
#                 "origin": origin_short,
#                 "destination": dest_short
#             })
        
#         # 3. Cancel all pending bookings
#         pending_bookings = db.query(RideBooking).filter(
#             RideBooking.ride_id == ride_id,
#             RideBooking.status == "pending"
#         ).all()
        
#         for booking in pending_bookings:
#             booking.status = "rejected"
#             if hasattr(booking, 'cancellation_reason'):
#                 booking.cancellation_reason = "Ride cancelled by driver"
            
#             # Notify passenger about rejected booking
#             notification = UserNotification(
#                 phone_number=booking.passenger_phone,
#                 title="Booking Request Cancelled ❌",
#                 message=f"Your booking request for {booking.seats_booked} seat(s) on the ride from {ride.origin} to {ride.destination} has been cancelled because the ride was cancelled.",
#                 type=NotificationType.RIDE,
#                 action_type="cancellation",
#                 action_value=str(ride.id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
            
#             # Emit socket event
#             emit_to_user(booking.passenger_phone, "booking-request-cancelled", {
#                 "ride_id": ride_id,
#                 "booking_id": booking.id,
#                 "message": "Your booking request was cancelled because the ride was cancelled"
#             })
        
#         db.commit()
        
#         # Emit ride cancelled event
#         emit_to_ride(ride_id, "ride-cancelled", {
#             "ride_id": ride_id,
#             "message": f"Ride from {ride.origin} to {ride.destination} has been cancelled",
#             "cancelled_bookings": len(accepted_bookings),
#             "cancelled_modifications": cancelled_modifications_count
#         })
        
#         return {
#             "message": "Ride cancelled successfully",
#             "ride_id": ride_id,
#             "affected_passengers": len(accepted_bookings),
#             "cancelled_modifications": cancelled_modifications_count,
#             "cancelled_pending_bookings": len(pending_bookings),
#             "total_affected": len(accepted_bookings) + len(pending_bookings) + cancelled_modifications_count
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"Error in cancel_ride: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Error cancelling ride: {str(e)}")
# @router.post("/booking/{booking_id}/request-modification")
# async def request_modification(
#     booking_id: int,
#     request: ModificationRequestSchema,
#     db: Session = Depends(get_db)
# ):
#     """Request to modify seat count for a booking - ONE TIME ONLY"""
#     try:
#         booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#         if not booking:
#             return {"success": False, "message": "Booking not found"}
        
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
        
#         # ============================================
#         # CRITICAL FIX: Check if user has ALREADY modified before
#         # ============================================
#         # Check for ANY existing modification request (not just pending)
#         existing_modification = db.query(ModificationRequest).filter(
#             ModificationRequest.booking_id == booking_id,
#             ModificationRequest.is_active == True
#         ).first()
        
#         if existing_modification:
#             # Check if it's still pending
#             if existing_modification.status == "pending":
#                 return {
#                     "success": False, 
#                     "message": "You already have a pending modification request. Please wait for driver's response.",
#                     "code": "PENDING_REQUEST_EXISTS",
#                     "existing_request": {
#                         "id": existing_modification.id,
#                         "requested_seats": existing_modification.requested_seats,
#                         "current_seats": existing_modification.current_seats,
#                         "status": existing_modification.status
#                     }
#                 }
#             else:
#                 # User has already requested modification (approved, rejected, or cancelled)
#                 # This means they've used their one-time modification
#                 return {
#                     "success": False, 
#                     "message": "You can only modify your seats once per booking. You have already submitted a modification request.",
#                     "code": "ALREADY_MODIFIED",
#                     "previous_request": {
#                         "id": existing_modification.id,
#                         "requested_seats": existing_modification.requested_seats,
#                         "current_seats": existing_modification.current_seats,
#                         "status": existing_modification.status,
#                         "approved_at": existing_modification.approved_at.isoformat() if existing_modification.approved_at else None,
#                         "rejected_at": existing_modification.rejected_at.isoformat() if existing_modification.rejected_at else None
#                     }
#                 }
        
#         # Check for any modification request in history (inactive ones also count)
#         historical_modification = db.query(ModificationRequest).filter(
#             ModificationRequest.booking_id == booking_id
#         ).first()
        
#         if historical_modification:
#             return {
#                 "success": False,
#                 "message": "You have already used your one-time modification for this booking. Further modifications are not allowed.",
#                 "code": "MODIFICATION_LIMIT_REACHED",
#                 "previous_request": {
#                     "id": historical_modification.id,
#                     "requested_seats": historical_modification.requested_seats,
#                     "status": historical_modification.status,
#                     "created_at": historical_modification.created_at.isoformat() if historical_modification.created_at else None
#                 }
#             }
        
#         # Calculate available seats
#         total_booked = db.query(func.sum(RideBooking.seats_booked)).filter(
#             RideBooking.ride_id == ride.id,
#             RideBooking.status == "accepted"
#         ).scalar() or 0
        
#         other_booked = total_booked - booking.seats_booked
#         available_seats = ride.available_seats - other_booked
        
#         if request.requested_seats > available_seats:
#             return {"success": False, "message": f"Only {available_seats} seat(s) available"}
        
#         if request.requested_seats < 1:
#             return {"success": False, "message": "Minimum 1 seat required"}
        
#         # If request is the same as current seats, don't create modification
#         if request.requested_seats == booking.seats_booked:
#             return {"success": False, "message": "No change in seat count"}
        
#         # Create new modification request
#         new_mod_request = ModificationRequest(
#             booking_id=booking_id,
#             ride_id=ride.id,
#             passenger_phone=booking.passenger_phone,
#             current_seats=booking.seats_booked,
#             requested_seats=request.requested_seats,
#             status="pending",
#             is_active=True,
#             created_at=datetime.now(timezone.utc)
#         )
        
#         db.add(new_mod_request)
#         db.commit()
#         db.refresh(new_mod_request)
        
#         return {
#             "success": True, 
#             "message": "Modification request sent to driver (one-time modification only)",
#             "request": {
#                 "id": new_mod_request.id,
#                 "current_seats": new_mod_request.current_seats,
#                 "requested_seats": new_mod_request.requested_seats,
#                 "status": new_mod_request.status,
#                 "created_at": new_mod_request.created_at.isoformat() if new_mod_request.created_at else None,
#                 "is_active": new_mod_request.is_active
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


# # Make sure these endpoints are properly defined and not commented out
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
# @router.get("/ride/{ride_id}/pending-modifications")
# def get_pending_modifications_for_ride(ride_id: int, db: Session = Depends(get_db)):
#     """Get all pending modification requests for a ride (for driver)"""
#     try:
#         ride = db.query(Ride).filter(Ride.id == ride_id).first()
#         if not ride:
#             return {"success": False, "message": "Ride not found"}
        
#         now = datetime.now(timezone.utc)
#         minutes_since_departure = (now - ride.departure_time).total_seconds() / 60
#         modifications_locked = ride.started_at or (minutes_since_departure > 30)
        
#         pending_requests = db.query(ModificationRequest).filter(
#             ModificationRequest.ride_id == ride_id,
#             ModificationRequest.status == "pending"
#         ).order_by(ModificationRequest.created_at.desc()).all()
        
#         results = []
#         for req in pending_requests:
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
#     """Approve a modification request - updates booking seats"""
#     try:
#         mod_request = db.query(ModificationRequest).filter(
#             ModificationRequest.id == request_id,
#             ModificationRequest.is_active == True
#         ).first()
        
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
        
#         if ride.started_at:
#             mod_request.status = "rejected"
#             mod_request.rejection_reason = "Cannot modify - Ride has already started"
#             mod_request.is_active = False
#             db.commit()
#             return {"success": False, "message": "Cannot approve - Ride has already started"}
        
#         # Calculate available seats excluding this booking
#         total_booked = get_total_booked_seats(db, ride.id)
#         other_booked = total_booked - booking.seats_booked
#         available_seats = ride.available_seats - other_booked
        
#         if mod_request.requested_seats > available_seats:
#             mod_request.status = "rejected"
#             mod_request.rejection_reason = f"Only {available_seats} seats available"
#             mod_request.is_active = False
#             db.commit()
#             return {"success": False, "message": f"Only {available_seats} seat(s) available"}
        
#         # Update booking with new seat count
#         old_seats = booking.seats_booked
#         booking.seats_booked = mod_request.requested_seats
#         booking.total_amount = ride.price_per_seat * mod_request.requested_seats
        
#         mod_request.status = "approved"
#         mod_request.approved_at = datetime.now(timezone.utc)
#         # Keep is_active = True so it shows as approved
        
#         db.commit()
        
#         # Notify passenger
#         try:
#             emit_to_user(booking.passenger_phone, "modification-approved", {
#                 "booking_id": booking.id,
#                 "old_seats": old_seats,
#                 "new_seats": mod_request.requested_seats,
#                 "message": f"Your seat change request from {old_seats} to {mod_request.requested_seats} seats has been approved!"
#             })
#         except Exception as e:
#             print(f"Socket notification error: {e}")
        
#         return {
#             "success": True,
#             "message": f"Modification request approved. Seats updated from {old_seats} to {mod_request.requested_seats}.",
#             "booking_id": booking.id,
#             "old_seats": old_seats,
#             "new_seats": mod_request.requested_seats,
#             "new_total": booking.total_amount
#         }
        
#     except Exception as e:
#         print(f"Error in approve_modification_request: {str(e)}")
#         db.rollback()
#         return {"success": False, "message": str(e)}
# @router.put("/modification-request/{request_id}/reject")
# def reject_modification_request(request_id: int, db: Session = Depends(get_db)):
#     """Reject a modification request - THIS WILL CANCEL THE ORIGINAL BOOKING"""
#     try:
#         print(f"🚫 ========== STARTING REJECTION PROCESS ==========")
#         print(f"📝 Rejecting modification request ID: {request_id}")
        
#         # Get modification request with lock
#         mod_request = db.query(ModificationRequest).filter(
#             ModificationRequest.id == request_id
#         ).with_for_update().first()
        
#         if not mod_request:
#             print(f"❌ Modification request {request_id} not found")
#             return {"success": False, "message": "Modification request not found"}
        
#         print(f"✅ Found modification request: status={mod_request.status}, is_active={mod_request.is_active}")
        
#         if mod_request.status != "pending":
#             print(f"⚠️ Request already {mod_request.status}")
#             return {"success": False, "message": f"Request already {mod_request.status}"}
        
#         # Get associated booking
#         booking = db.query(RideBooking).filter(
#             RideBooking.id == mod_request.booking_id
#         ).with_for_update().first()
        
#         if not booking:
#             print(f"❌ Booking {mod_request.booking_id} not found")
#             return {"success": False, "message": "Associated booking not found"}
        
#         print(f"✅ Found booking: ID={booking.id}, status={booking.status}, seats={booking.seats_booked}")
        
#         # Get the ride
#         ride = db.query(Ride).filter(Ride.id == mod_request.ride_id).with_for_update().first()
        
#         if not ride:
#             print(f"❌ Ride {mod_request.ride_id} not found")
#             return {"success": False, "message": "Ride not found"}
        
#         print(f"✅ Found ride: ID={ride.id}, total_seats={ride.available_seats}, status={ride.status}")
        
#         # Store original seat count before cancellation
#         original_seats = booking.seats_booked
        
#         print(f"🔴 Rejecting modification request {request_id}")
#         print(f"   📍 Booking ID: {booking.id}, Original seats: {original_seats}")
#         print(f"   📍 Ride ID: {ride.id}, Total seats: {ride.available_seats}")
        
#         # ============================================
#         # CRITICAL FIX - Update modification request
#         # ============================================
#         mod_request.status = "rejected"
#         mod_request.rejection_reason = "Driver declined the modification request"
#         mod_request.rejected_at = datetime.now(timezone.utc)
#         mod_request.is_active = False  # ✅ CRITICAL: Mark as inactive
#         mod_request.updated_at = datetime.now(timezone.utc)
        
#         print(f"   ✅ Modification request updated: status=rejected, is_active=False")
        
#         # ============================================
#         # CRITICAL FIX - Cancel booking and release seats
#         # ============================================
#         old_status = booking.status
#         booking.status = "cancelled"
#         booking.seats_booked = 0  # ✅ CRITICAL: Release the seats
#         booking.cancellation_reason = f"Modification request rejected - Original booking of {original_seats} seat(s) cancelled"
#         booking.updated_at = datetime.now(timezone.utc)
        
#         print(f"   ✅ Booking updated: status={old_status} -> cancelled, seats={original_seats} -> 0")
        
#         db.flush()
        
#         # Recalculate total booked seats after cancellation
#         total_booked_after = db.query(func.sum(RideBooking.seats_booked)).filter(
#             RideBooking.ride_id == ride.id,
#             RideBooking.status == "accepted"
#         ).scalar() or 0
        
#         remaining_seats = ride.available_seats - total_booked_after
        
#         print(f"   📊 After cancellation calculation:")
#         print(f"      Total booked (accepted): {total_booked_after}")
#         print(f"      Remaining seats: {remaining_seats}")
        
#         # Update ride status if needed
#         old_ride_status = ride.status
#         if ride.status == "full" and remaining_seats > 0:
#             ride.status = "active"
#             print(f"   ✅ Ride status changed: {old_ride_status} -> active")
#         elif ride.status == "active" and remaining_seats == 0:
#             ride.status = "full"
#             print(f"   ✅ Ride status changed: {old_ride_status} -> full")
#         else:
#             print(f"   ℹ️ Ride status unchanged: {ride.status}")
        
#         ride.updated_at = datetime.now(timezone.utc)
        
#         db.commit()
#         print(f"💾 Database commit successful")
        
#         # ============================================
#         # Send socket events for real-time updates
#         # ============================================
#         print(f"📡 Sending socket events...")
        
#         # Notify the passenger
#         try:
#             emit_to_user(booking.passenger_phone, "booking-cancelled", {
#                 "booking_id": booking.id,
#                 "ride_id": ride.id,
#                 "seats_cancelled": original_seats,
#                 "message": f"Your booking for {original_seats} seat(s) has been cancelled because your modification request was rejected."
#             })
#             print(f"   ✅ Sent booking-cancelled to passenger {booking.passenger_phone}")
#         except Exception as e:
#             print(f"   ⚠️ Socket error (booking-cancelled): {e}")
        
#         # Notify all users in the ride room that seats are available
#         try:
#             emit_to_ride(ride.id, "seats-released", {
#                 "ride_id": ride.id,
#                 "seats_released": original_seats,
#                 "new_available_seats": remaining_seats,
#                 "message": f"{original_seats} seat(s) are now available for this ride!"
#             })
#             print(f"   ✅ Sent seats-released to ride room: ride_{ride.id}")
#         except Exception as e:
#             print(f"   ⚠️ Socket error (seats-released): {e}")
        
#         # Specific modification rejected event
#         try:
#             emit_to_ride(ride.id, "modification-rejected", {
#                 "ride_id": ride.id,
#                 "booking_id": booking.id,
#                 "seats_released": original_seats,
#                 "new_available_seats": remaining_seats,
#                 "message": f"A modification request was rejected. {original_seats} seat(s) are now available."
#             })
#             print(f"   ✅ Sent modification-rejected to ride room: ride_{ride.id}")
#         except Exception as e:
#             print(f"   ⚠️ Socket error (modification-rejected): {e}")
        
#         # Broadcast to all connected clients
#         try:
#             if _sio:
#                 _sio.emit("seat-availability-update", {
#                     "ride_id": ride.id,
#                     "available_seats": remaining_seats,
#                     "total_seats": ride.available_seats,
#                     "action": "seats_released",
#                     "seats_released": original_seats
#                 })
#                 print(f"   ✅ Sent seat-availability-update to all clients")
#         except Exception as e:
#             print(f"   ⚠️ Socket error (seat-availability-update): {e}")
        
#         print(f"✅ ========== REJECTION COMPLETED SUCCESSFULLY ==========")
        
#         return {
#             "success": True,
#             "message": f"Modification request rejected. Original booking for {original_seats} seat(s) has been CANCELLED.",
#             "booking_cancelled": True,
#             "booking_id": booking.id,
#             "seats_released": original_seats,
#             "new_available_seats": remaining_seats,
#             "ride_id": ride.id,
#             "ride_status": ride.status
#         }
        
#     except Exception as e:
#         print(f"❌ ========== ERROR IN REJECTION ==========")
#         print(f"❌ Error: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         db.rollback()
#         return {"success": False, "message": str(e)}
# @router.get("/ride/{ride_id}/rejected-modifications")
# def get_rejected_modifications(ride_id: int, db: Session = Depends(get_db)):
#     """Get all rejected modification requests for a ride"""
#     try:
#         rejected_requests = db.query(ModificationRequest).filter(
#             ModificationRequest.ride_id == ride_id,
#             ModificationRequest.status == "rejected"
#         ).all()
        
#         results = []
#         for req in rejected_requests:
#             results.append({
#                 "id": req.id,
#                 "booking_id": req.booking_id,
#                 "passenger_phone": req.passenger_phone,
#                 "current_seats": req.current_seats,
#                 "requested_seats": req.requested_seats,
#                 "status": req.status,
#                 "rejection_reason": req.rejection_reason,
#                 "created_at": req.created_at.isoformat() if req.created_at else None,
#                 "rejected_at": req.rejected_at.isoformat() if req.rejected_at else None
#             })
        
#         return {
#             "success": True,
#             "rejected_requests": results,
#             "count": len(results)
#         }
        
#     except Exception as e:
#         print(f"Error in get_rejected_modifications: {str(e)}")
#         return {"success": False, "rejected_requests": [], "error": str(e)}
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

#         # Get rating information from ride_session_riders if available
#         driver_rating_given = False
#         driver_rating = 0
#         driver_feedback = ""
        
#         rider_session = db.query(RideSessionRider).filter(
#             RideSessionRider.booking_id == bk.id
#         ).first()
        
#         if rider_session:
#             driver_rating_given = rider_session.driver_rating is not None
#             driver_rating = rider_session.driver_rating or 0
#             driver_feedback = rider_session.driver_feedback or ""

#         passengers.append({
#             "booking_id": bk.id,
#             "custom_booking_id": getattr(bk, 'custom_booking_id', None),  # ADD CUSTOM BOOKING ID
#             "passenger_phone": bk.passenger_phone,
#             "passenger_name": passenger_name,
#             "profile_picture": p.profile_picture if p else None,
#             "seats_booked": bk.seats_booked,
#             "status": bk.status,
#             "total_amount": float(bk.total_amount) if bk.total_amount else None,
#             "created_at": bk.created_at.isoformat() if bk.created_at else None,
#             # ADD ADDRESS FIELDS
#             "pickup_address": getattr(bk, 'pickup_address', None),
#             "dropoff_address": getattr(bk, 'dropoff_address', None),
#             "pickup_place_name": getattr(bk, 'pickup_place_name', None),
#             "dropoff_place_name": getattr(bk, 'dropoff_place_name', None),
#             # Coordinates
#             "pickup_lat": float(bk.pickup_lat) if bk.pickup_lat is not None else None,
#             "pickup_lon": float(bk.pickup_lon) if bk.pickup_lon is not None else None,
#             "drop_lat": float(bk.drop_lat) if bk.drop_lat is not None else None,
#             "drop_lon": float(bk.drop_lon) if bk.drop_lon is not None else None,
#             "intersection_pickup_lat": float(bk.intersection_pickup_lat) if bk.intersection_pickup_lat is not None else None,
#             "intersection_pickup_lon": float(bk.intersection_pickup_lon) if bk.intersection_pickup_lon is not None else None,
#             "intersection_drop_lat": float(bk.intersection_drop_lat) if bk.intersection_drop_lat is not None else None,
#             "intersection_drop_lon": float(bk.intersection_drop_lon) if bk.intersection_drop_lon is not None else None,
#             "pickup_walk_distance_m": bk.pickup_walk_distance_m,
#             "drop_walk_distance_m": bk.drop_walk_distance_m,
#             # Rating information
#             "driver_rating_given": driver_rating_given,
#             "driver_rating": driver_rating,
#             "driver_feedback": driver_feedback,
#         })

#     total_booked = get_total_booked_seats(db, ride_id)
#     remaining_seats = max(0, ride.available_seats - total_booked)

#     return {
#         "ride_id": ride.id,
#         "custom_ride_id": getattr(ride, 'custom_ride_id', None),  # ADD CUSTOM RIDE ID
#         "origin": ride.origin,
#         "destination": ride.destination,
#         "origin_address": getattr(ride, 'origin_address', None),  # ADD ORIGIN ADDRESS
#         "destination_address": getattr(ride, 'destination_address', None),  # ADD DESTINATION ADDRESS
#         "origin_place_name": getattr(ride, 'origin_place_name', None),  # ADD ORIGIN PLACE NAME
#         "destination_place_name": getattr(ride, 'destination_place_name', None),  # ADD DESTINATION PLACE NAME
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
#         "passengers": passengers,
#         "duration_text": ride.duration_text,
#         "distance_km": ride.distance_km,
#         "price_per_seat": ride.price_per_seat,
#     }
# @router.get("/my-rides/{phone}")
# def get_my_rides(phone: str, db: Session = Depends(get_db)):
#     norm_phone = normalize_phone(phone)
    
#     # POSTED RIDES (Driver)
#     posted_rides = db.query(Ride).filter(
#         Ride.phone_number == norm_phone,
#         Ride.is_deleted == False
#     ).order_by(Ride.departure_time.desc()).all()
    
#     posted_ride_ids = [r.id for r in posted_rides]
#     bookings_map = {}
    
#     if posted_ride_ids:
#         bookings_raw = db.execute(text("""
#             SELECT 
#                 rb.id, rb.ride_id, rb.passenger_phone, rb.seats_booked, rb.status,
#                 rb.created_at, rb.total_amount, rb.cancellation_reason,
#                 rb.pickup_lat, rb.pickup_lon, rb.drop_lat, rb.drop_lon,
#                 rb.intersection_pickup_lat, rb.intersection_pickup_lon,
#                 rb.intersection_drop_lat, rb.intersection_drop_lon,
#                 rb.pickup_walk_distance_m, rb.drop_walk_distance_m,
#                 -- ADD ADDRESS FIELDS
#                 rb.pickup_address, rb.dropoff_address,
#                 rb.pickup_place_name, rb.dropoff_place_name,
#                 u.full_name as passenger_name, u.first_name, u.last_name, 
#                 u.profile_picture as passenger_profile_picture,
#                 u.gender as passenger_gender,
#                 COALESCE(rsr.driver_rating, 0) as driver_rating,
#                 COALESCE(rsr.driver_feedback, '') as driver_feedback,
#                 rsr.driver_rating_given,
#                 mr.id as mod_id,
#                 mr.requested_seats as mod_requested_seats,
#                 mr.current_seats as mod_current_seats,
#                 mr.status as mod_status,
#                 mr.created_at as mod_created_at,
#                 mr.rejection_reason as mod_rejection_reason
#             FROM ride_bookings rb 
#             LEFT JOIN users u ON u.phone_number = rb.passenger_phone
#             LEFT JOIN ride_session_riders rsr ON rsr.booking_id = rb.id
#             LEFT JOIN modification_requests mr ON mr.booking_id = rb.id AND mr.status IN ('pending', 'approved', 'rejected')
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
            
#             # Build modification request if exists
#             modification_request = None
#             if bk["mod_id"] is not None:
#                 modification_request = {
#                     "id": bk["mod_id"],
#                     "requested_seats": bk["mod_requested_seats"],
#                     "current_seats": bk["mod_current_seats"],
#                     "status": bk["mod_status"],
#                     "created_at": bk["mod_created_at"].isoformat() if bk["mod_created_at"] else None,
#                     "rejection_reason": bk["mod_rejection_reason"]
#                 }
            
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
#                 "pickup_address": bk.get("pickup_address"),
#                 "dropoff_address": bk.get("dropoff_address"),
#                 "pickup_place_name": bk.get("pickup_place_name"),
#                 "dropoff_place_name": bk.get("dropoff_place_name"),
#                 "pickup_lat": float(bk["pickup_lat"]) if bk["pickup_lat"] is not None else None,
#                 "pickup_lon": float(bk["pickup_lon"]) if bk["pickup_lon"] is not None else None,
#                 "drop_lat": float(bk["drop_lat"]) if bk["drop_lat"] is not None else None,
#                 "drop_lon": float(bk["drop_lon"]) if bk["drop_lon"] is not None else None,
#                 "intersection_pickup_lat": float(bk["intersection_pickup_lat"]) if bk["intersection_pickup_lat"] is not None else None,
#                 "intersection_pickup_lon": float(bk["intersection_pickup_lon"]) if bk["intersection_pickup_lon"] is not None else None,
#                 "intersection_drop_lat": float(bk["intersection_drop_lat"]) if bk["intersection_drop_lat"] is not None else None,
#                 "intersection_drop_lon": float(bk["intersection_drop_lon"]) if bk["intersection_drop_lon"] is not None else None,
#                 "pickup_walk_distance_m": bk["pickup_walk_distance_m"],
#                 "drop_walk_distance_m": bk["drop_walk_distance_m"],
#                 "driver_rating_given": bk["driver_rating_given"] is True or bk["driver_rating_given"] == 1,
#                 "driver_rating": float(bk["driver_rating"]) if bk["driver_rating"] else 0,
#                 "driver_feedback": bk["driver_feedback"] or "",
#                 "modification_request": modification_request  # Add modification request to booking
#             })
    
#     posted_formatted = []
#     for ride in posted_rides:
#         total_booked = get_total_booked_seats(db, ride.id)
#         remaining_seats = max(0, ride.available_seats - total_booked)
        
#         display_status = ride.status
#         if remaining_seats == 0 and ride.status == "active":
#             display_status = "full"
        
#         driver_info = db.query(User).filter(User.phone_number == ride.phone_number).first()
#         driver_profile_picture = driver_info.profile_picture if driver_info else None
        
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
#             "custom_ride_id": getattr(ride, 'custom_ride_id', None),  # Add custom ride ID
#             "phone_number": ride.phone_number,
#             "origin": ride.origin,
#             "destination": ride.destination,
#             "origin_coords": [ride.origin_lon, ride.origin_lat] if ride.origin_lon and ride.origin_lat else None,
#             "destination_coords": [ride.destination_lon, ride.destination_lat] if ride.destination_lon and ride.destination_lat else None,
#             "departure_time": ride.departure_time.isoformat(),
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
#             "cancellation_reason": ride.cancellation_reason,
#             "completed_at": ride.completed_at.isoformat() if hasattr(ride, 'completed_at') and ride.completed_at else None,
#             "origin_lat": float(ride.origin_lat) if ride.origin_lat is not None else None,
#             "origin_lon": float(ride.origin_lon) if ride.origin_lon is not None else None,
#             "destination_lat": float(ride.destination_lat) if ride.destination_lat is not None else None,
#             "destination_lon": float(ride.destination_lon) if ride.destination_lon is not None else None,
#         })
    
#     requested_raw = db.execute(text("""
#         SELECT 
#             rb.id, rb.ride_id, rb.passenger_phone, rb.seats_booked, rb.status,
#             rb.created_at, rb.total_amount, rb.cancellation_reason,
#             rb.pickup_lat, rb.pickup_lon, rb.drop_lat, rb.drop_lon,
#             rb.intersection_pickup_lat, rb.intersection_pickup_lon,
#             rb.intersection_drop_lat, rb.intersection_drop_lon,
#             rb.pickup_walk_distance_m, rb.drop_walk_distance_m,
#             rb.pickup_address, rb.dropoff_address,
#             rb.pickup_place_name, rb.dropoff_place_name,
#             r.origin, r.destination, r.departure_time, r.price_per_seat, r.available_seats,
#             r.distance_km, r.duration_text, r.status as ride_status, r.women_only,
#             r.route_coordinates, r.started_at as ride_started_at,
#             r.origin_lat, r.origin_lon, r.destination_lat, r.destination_lon,
#             r.completed_at as ride_completed_at,
#             r.custom_ride_id as ride_custom_id,
#             u.full_name as driver_name, u.first_name, u.last_name, u.phone_number as driver_phone,
#             u.user_id as driver_user_id, u.profile_completed, 
#             u.profile_picture as driver_profile_picture,
#             u.avg_rating as driver_rating,
#             v.id as vehicle_id, v.make, v.model, v.color, v.registration_number,
#             ls.id as session_id, ls.status as session_status,
#             ls.current_phase as session_phase,
#             COALESCE(rsr.rider_rating, 0) as rider_rating,
#             COALESCE(rsr.rider_feedback, '') as rider_feedback,
#             rsr.rider_rating_given,
#             mr.id as mod_id,
#             mr.requested_seats as mod_requested_seats,
#             mr.current_seats as mod_current_seats,
#             mr.status as mod_status,
#             mr.created_at as mod_created_at,
#             mr.rejection_reason as mod_rejection_reason
#         FROM ride_bookings rb
#         JOIN rides r ON r.id = rb.ride_id
#         LEFT JOIN users u ON u.phone_number = r.phone_number
#         LEFT JOIN vehicles v ON v.id = r.vehicle_id
#         LEFT JOIN ride_sessions ls ON ls.ride_id = r.id AND ls.status IN ('driver_started', 'boarding', 'en_route')
#         LEFT JOIN ride_session_riders rsr ON rsr.booking_id = rb.id
#         LEFT JOIN modification_requests mr ON mr.booking_id = rb.id AND mr.is_active = TRUE  -- Only active modification requests
#         WHERE rb.passenger_phone = :phone
#         ORDER BY rb.created_at DESC
#     """), {"phone": norm_phone}).mappings().all()
        
#     requested_formatted = []
#     for row in requested_raw:
#         driver_name = row["driver_name"] or " ".join(
#             p for p in [row["first_name"], row["last_name"]] if p
#         ).strip() or f"Driver {row['driver_phone'][-4:] if row['driver_phone'] else 'Unknown'}"
        
#         vehicle_data = None
#         if row["vehicle_id"]:
#             vehicle_data = {
#                 "id": row["vehicle_id"],
#                 "make": row["make"],
#                 "model": row["model"],
#                 "color": row["color"],
#                 "registration_number": row["registration_number"],
#             }
        
#         live_session_data = None
#         if row["session_id"]:
#             live_session_data = {
#                 "session_id": row["session_id"],
#                 "status": row["session_status"],
#                 "current_phase": row["session_phase"]
#             }
        
#         # ============================================
#         # ADD MODIFICATION REQUEST DATA
#         # ============================================
#         modification_request = None
#         if row["mod_id"] is not None:
#             modification_request = {
#                 "id": row["mod_id"],
#                 "requested_seats": row["mod_requested_seats"],
#                 "current_seats": row["mod_current_seats"],
#                 "status": row["mod_status"],
#                 "created_at": row["mod_created_at"].isoformat() if row["mod_created_at"] else None,
#                 "rejection_reason": row["mod_rejection_reason"]
#             }
        
#         # Build coordinate objects
#         suggested_pickup_point = None
#         suggested_drop_point = None
        
#         if row["intersection_pickup_lat"] is not None and row["intersection_pickup_lon"] is not None:
#             suggested_pickup_point = {
#                 "lat": float(row["intersection_pickup_lat"]),
#                 "lng": float(row["intersection_pickup_lon"])
#             }
#         elif row["pickup_lat"] is not None and row["pickup_lon"] is not None:
#             suggested_pickup_point = {
#                 "lat": float(row["pickup_lat"]),
#                 "lng": float(row["pickup_lon"])
#             }
        
#         if row["intersection_drop_lat"] is not None and row["intersection_drop_lon"] is not None:
#             suggested_drop_point = {
#                 "lat": float(row["intersection_drop_lat"]),
#                 "lng": float(row["intersection_drop_lon"])
#             }
#         elif row["drop_lat"] is not None and row["drop_lon"] is not None:
#             suggested_drop_point = {
#                 "lat": float(row["drop_lat"]),
#                 "lng": float(row["drop_lon"])
#             }
        
#         requested_formatted.append({
#             "id": row["id"],
#             "custom_booking_id": getattr(row, 'custom_booking_id', None),  # Add custom booking ID
#             "ride_id": row["ride_id"],
#             "ride_custom_id": row["ride_custom_id"],  # Add ride custom ID
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
#             "started_at": row["ride_started_at"].isoformat() if row["ride_started_at"] else None,
#             "completed_at": row["ride_completed_at"].isoformat() if row["ride_completed_at"] else None,
#             "pickup_lat": float(row["pickup_lat"]) if row["pickup_lat"] is not None else None,
#             "pickup_lon": float(row["pickup_lon"]) if row["pickup_lon"] is not None else None,
#             "drop_lat": float(row["drop_lat"]) if row["drop_lat"] is not None else None,
#             "drop_lon": float(row["drop_lon"]) if row["drop_lon"] is not None else None,
#             "intersection_pickup_lat": float(row["intersection_pickup_lat"]) if row["intersection_pickup_lat"] is not None else None,
#             "intersection_pickup_lon": float(row["intersection_pickup_lon"]) if row["intersection_pickup_lon"] is not None else None,
#             "intersection_drop_lat": float(row["intersection_drop_lat"]) if row["intersection_drop_lat"] is not None else None,
#             "intersection_drop_lon": float(row["intersection_drop_lon"]) if row["intersection_drop_lon"] is not None else None,
#             "pickup_walk_distance_m": row["pickup_walk_distance_m"],
#             "drop_walk_distance_m": row["drop_walk_distance_m"],
#             "suggested_pickup_point": suggested_pickup_point,
#             "suggested_drop_point": suggested_drop_point,
#             "origin_lat": float(row["origin_lat"]) if row["origin_lat"] is not None else None,
#             "origin_lon": float(row["origin_lon"]) if row["origin_lon"] is not None else None,
#             "destination_lat": float(row["destination_lat"]) if row["destination_lat"] is not None else None,
#             "destination_lon": float(row["destination_lon"]) if row["destination_lon"] is not None else None,
#             "rider_rating_given": row["rider_rating_given"] is True or row["rider_rating_given"] == 1,
#             "rider_rating": float(row["rider_rating"]) if row["rider_rating"] else 0,
#             "rider_feedback": row["rider_feedback"] or "",
#             # ============================================
#             # ADD MODIFICATION REQUEST TO RESPONSE
#             # ============================================
#             "modification_request": modification_request
#         })
    
#     return {
#         "posted_rides": posted_formatted,
#         "requested_rides": requested_formatted
#     }
# @router.post("/ride/{ride_id}/start")
# def start_ride(ride_id: int, db: Session = Depends(get_db)):
#     """Start a ride - creates live session and QR code"""
#     try:
#         ride = db.query(Ride).filter(Ride.id == ride_id).first()
#         if not ride:
#             raise HTTPException(status_code=404, detail="Ride not found")
        
#         if ride.started_at:
#             raise HTTPException(status_code=400, detail="Ride already started")
        
#         if ride.cancellation_reason:
#             raise HTTPException(status_code=400, detail=f"Cannot start cancelled ride")
        
#         now = datetime.now(timezone.utc)
#         minutes_to_departure = (ride.departure_time - now).total_seconds() / 60
#         minutes_since_departure = (now - ride.departure_time).total_seconds() / 60
        
#         if minutes_to_departure > 15:
#             raise HTTPException(status_code=400, detail=f"Ride can only be started within 15 minutes of departure time")
        
#         if minutes_since_departure > 30:
#             ride.status = "cancelled"
#             ride.cancellation_reason = "Auto-cancelled: Ride was not started within 30 minutes of departure time"
#             db.commit()
#             raise HTTPException(status_code=400, detail="Ride has been auto-cancelled")
        
#         # Start the ride
#         ride.started_at = now
#         ride.status = "active"
#         db.commit()
        
#         # Create live session
#         qr_token = secrets.token_hex(16)
        
#         live_session = RideSession(
#             ride_id=ride_id,
#             driver_phone=ride.phone_number,
#             status="driver_started",
#             current_phase="boarding",
#             qr_code_token=qr_token,
#             qr_expires_at=datetime.now(timezone.utc) + timedelta(hours=8),
#             started_at=datetime.now(timezone.utc)
#         )
#         db.add(live_session)
#         db.flush()
        
#         # Add all accepted riders to session
#         accepted_bookings = db.query(RideBooking).filter(
#             RideBooking.ride_id == ride_id,
#             RideBooking.status == "accepted"
#         ).all()
        
#         for booking in accepted_bookings:
#             rider_user = db.query(User).filter(User.phone_number == booking.passenger_phone).first()
            
#             rider_session = RideSessionRider(
#                 session_id=live_session.id,
#                 booking_id=booking.id,
#                 rider_phone=booking.passenger_phone,
#                 rider_name=rider_user.full_name if rider_user else None,
#                 rider_photo=rider_user.profile_picture if rider_user else None,
#                 pickup_location=ride.origin,
#                 dropoff_location=ride.destination,
#                 status="accepted"
#             )
#             db.add(rider_session)
            
#             # Notify passenger
#             notification = UserNotification(
#                 phone_number=booking.passenger_phone,
#                 title="Ride Started! 🚗",
#                 message=f"The driver has started the ride from {ride.origin} to {ride.destination}.",
#                 type=NotificationType.RIDE,  # ✅ Correct - using enum
#                 action_type="ride",
#                 action_value=str(ride.id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
            
#             # Emit socket event
#             emit_to_user(booking.passenger_phone, "ride-started", {
#                 "ride_id": ride_id,
#                 "session_id": live_session.id,
#                 "message": "The driver has started the ride!"
#             })
        
#         db.commit()
#         db.refresh(live_session)
        
#         return {
#             "message": "Ride started successfully",
#             "session_id": live_session.id,
#             "ride_id": ride.id,
#             "qr_code_token": qr_token
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"Error starting ride: {str(e)}")
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# @router.get("/ride-sessions/driver/{ride_id}")
# def get_driver_session(ride_id: int, driver_phone: str, db: Session = Depends(get_db)):
#     """Get driver's active ride session"""
#     driver_phone = normalize_phone(driver_phone)
    
#     session = db.query(RideSession).filter(
#         RideSession.ride_id == ride_id,
#         RideSession.driver_phone == driver_phone
#     ).order_by(RideSession.id.desc()).first()
    
#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")
    
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
    
#     riders = []
#     boarded_count = 0
#     dropped_count = 0
    
#     for rider in session.riders:
#         if rider.status in ["boarded", "dropped_off", "completed"]:
#             boarded_count += 1
#         if rider.status in ["dropped_off", "completed"]:
#             dropped_count += 1
        
#         riders.append({
#             "id": rider.id,
#             "booking_id": rider.booking_id,
#             "rider_phone": rider.rider_phone,
#             "rider_name": rider.rider_name or f"Rider {rider.rider_phone[-4:]}",
#             "rider_photo": rider.rider_photo,
#             "pickup_location": rider.pickup_location,
#             "dropoff_location": rider.dropoff_location,
#             "status": rider.status,
#             "boarded_at": rider.boarded_at.isoformat() if rider.boarded_at else None,
#             "dropped_off_at": rider.dropped_off_at.isoformat() if rider.dropped_off_at else None,
#             "completed_at": rider.completed_at.isoformat() if rider.completed_at else None,
#             "driver_rating": rider.driver_rating,
#             "rider_rating": rider.rider_rating,
#         })
    
#     return {
#         "session_id": session.id,
#         "ride_id": ride_id,
#         "ride_origin": ride.origin if ride else None,
#         "ride_destination": ride.destination if ride else None,
#         "departure_time": ride.departure_time.isoformat() if ride and ride.departure_time else None,
#         "status": session.status,
#         "current_phase": session.current_phase,
#         "qr_code_token": session.qr_code_token,
#         "boarded_count": boarded_count,
#         "dropped_count": dropped_count,
#         "total_riders": len(session.riders),
#         "sos_active": session.sos_active,
#         "emergency_stop_active": session.emergency_stop_active,
#         "current_lat": session.current_lat,
#         "current_lng": session.current_lng,
#         "riders": riders
#     }


# @router.get("/ride-sessions/rider/{booking_id}")
# def get_rider_session(booking_id: int, rider_phone: str, db: Session = Depends(get_db)):
#     """Get rider's active ride session"""
#     rider_phone = normalize_phone(rider_phone)
    
#     rider_session = db.query(RideSessionRider).filter(
#         RideSessionRider.booking_id == booking_id,
#         RideSessionRider.rider_phone == rider_phone
#     ).order_by(RideSessionRider.id.desc()).first()
    
#     if not rider_session:
#         raise HTTPException(status_code=404, detail="Rider session not found")
    
#     session = db.query(RideSession).filter(RideSession.id == rider_session.session_id).first()
#     ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
#     driver = db.query(User).filter(User.phone_number == session.driver_phone).first()
    
#     return {
#         "session_id": session.id,
#         "booking_id": booking_id,
#         "ride_id": session.ride_id,
#         "session_status": session.status,
#         "current_phase": session.current_phase,
#         "driver_phone": session.driver_phone,
#         "driver_name": driver.full_name if driver else "Driver",
#         "driver_photo": driver.profile_picture if driver else None,
#         "driver_rating": driver.avg_rating if driver else 4.5,
#         "origin": ride.origin if ride else None,
#         "destination": ride.destination if ride else None,
#         "rider_status": rider_session.status,
#         "pickup_location": rider_session.pickup_location,
#         "dropoff_location": rider_session.dropoff_location,
#         "pickup_lat": rider_session.pickup_lat,
#         "pickup_lng": rider_session.pickup_lng,
#         "dropoff_lat": rider_session.dropoff_lat,
#         "dropoff_lng": rider_session.dropoff_lng,
#         "current_lat": session.current_lat,
#         "current_lng": session.current_lng,
#         "sos_active": session.sos_active,
#         "emergency_stop_active": session.emergency_stop_active,
#         "driver_rating_given": rider_session.rider_rating is not None
#     }


# @router.post("/ride-sessions/{session_id}/rider-reached-pickup")
# def rider_reached_pickup(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Rider notifies that they've reached pickup location"""
#     booking_id = payload.get("booking_id")
#     rider_phone = normalize_phone(payload.get("rider_phone", ""))
    
#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id,
#         RideSessionRider.rider_phone == rider_phone
#     ).first()
    
#     if not rider:
#         raise HTTPException(status_code=404, detail="Rider not found in session")
    
#     if rider.status in ["boarded", "dropped_off", "completed"]:
#         raise HTTPException(status_code=400, detail="Ride already in progress")
    
#     rider.status = "reached_pickup"
#     rider.reached_pickup_at = datetime.now(timezone.utc)
#     rider.pickup_confirmed = True
#     db.commit()
    
#     # Notify driver
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
#     if session:
#         emit_to_user(session.driver_phone, "rider-reached-pickup", {
#             "booking_id": booking_id,
#             "rider_phone": rider_phone,
#             "rider_name": rider.rider_name,
#             "message": f"{rider.rider_name or 'Rider'} has reached the pickup location"
#         })
    
#     return {"message": "Pickup arrival marked", "status": rider.status}
# @router.post("/ride-sessions/{session_id}/rider-board")
# def rider_board(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Rider scans QR code to board the vehicle"""
#     from datetime import datetime, timezone
#     from sqlalchemy.orm import joinedload
    
#     try:
#         booking_id = payload.get("booking_id")
#         rider_phone = normalize_phone(payload.get("rider_phone", ""))
#         qr_code_token = payload.get("qr_code_token")
        
#         print(f"📝 Boarding request: session={session_id}, booking={booking_id}")
        
#         # 1. Get session with riders loaded
#         session = db.query(RideSession).options(
#             joinedload(RideSession.riders)
#         ).filter(RideSession.id == session_id).first()
        
#         if not session:
#             raise HTTPException(status_code=404, detail="Ride session not found")
        
#         print(f"✅ Session found: status={session.status}")
        
#         # 2. Validate QR code
#         if not session.qr_code_token:
#             raise HTTPException(status_code=400, detail="No QR code available for this ride")
        
#         if session.qr_code_token != qr_code_token:
#             print(f"❌ QR mismatch: expected={session.qr_code_token}, got={qr_code_token}")
#             raise HTTPException(status_code=400, detail="Invalid QR code")
        
#         print(f"✅ QR code validated")
        
#         # 3. Find the rider
#         rider = None
#         for r in session.riders:
#             if r.booking_id == booking_id or r.rider_phone == rider_phone:
#                 rider = r
#                 break
        
#         if not rider:
#             # Try direct database query
#             rider = db.query(RideSessionRider).filter(
#                 RideSessionRider.session_id == session_id,
#                 RideSessionRider.booking_id == booking_id
#             ).first()
        
#         if not rider:
#             raise HTTPException(status_code=404, detail="Rider not found in this session")
        
#         print(f"✅ Found rider: {rider.rider_name}, current status: {rider.status}")
        
#         # 4. Check if already boarded
#         if rider.status in ["boarded", "dropped_off", "completed"]:
#             return {
#                 "message": f"Rider already {rider.status}",
#                 "rider_status": rider.status,
#                 "already_boarded": True
#             }
        
#         # 5. Update rider status
#         now = datetime.now(timezone.utc)
#         rider.status = "boarded"
#         rider.boarded_at = now
#         rider.pickup_confirmed = True
        
#         # 6. Update session counts
#         boarded_count = db.query(RideSessionRider).filter(
#             RideSessionRider.session_id == session_id,
#             RideSessionRider.status.in_(["boarded", "dropped_off", "completed"])
#         ).count()
        
#         total_riders = db.query(RideSessionRider).filter(
#             RideSessionRider.session_id == session_id
#         ).count()
        
#         print(f"📊 Boarded: {boarded_count}/{total_riders}")
        
#         # 7. Update session phase
#         if boarded_count == total_riders:
#             session.current_phase = "en_route"
#             session.status = "en_route"
#         else:
#             session.current_phase = "boarding"
#             session.status = "boarding"
        
#         # 8. Commit
#         db.commit()
#         print(f"✅ Database commit successful")
        
#         # 9. Send notifications (don't fail if socket fails)
#         try:
#             # from routes. import emit_to_user
            
#             emit_to_user(session.driver_phone, "rider-boarded", {
#                 "booking_id": booking_id,
#                 "rider_phone": rider.rider_phone,
#                 "rider_name": rider.rider_name or "Rider",
#                 "boarded_count": boarded_count,
#                 "total_riders": total_riders
#             })
            
#             emit_to_user(rider.rider_phone, "boarding-confirmed", {
#                 "session_id": session_id,
#                 "booking_id": booking_id,
#                 "message": "You have successfully boarded the vehicle"
#             })
#         except Exception as e:
#             print(f"⚠️ Socket error (non-critical): {e}")
        
#         return {
#             "success": True,
#             "message": "Boarding successful",
#             "rider_status": rider.status,
#             "session_status": session.status,
#             "current_phase": session.current_phase,
#             "boarded_count": boarded_count,
#             "total_riders": total_riders
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"💥 Error in rider_board: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Error boarding rider: {str(e)}")
# @router.post("/ride-sessions/{session_id}/rider-dropped-off")
# def rider_dropped_off(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Driver marks rider as dropped off"""
#     try:
#         booking_id = payload.get("booking_id")
#         rider_phone = normalize_phone(payload.get("rider_phone", ""))
        
#         print(f"📍 Dropoff request: session={session_id}, booking={booking_id}, phone={rider_phone}")
        
#         # Find the rider
#         rider = db.query(RideSessionRider).filter(
#             RideSessionRider.session_id == session_id,
#             RideSessionRider.booking_id == booking_id
#         ).first()
        
#         if not rider:
#             rider = db.query(RideSessionRider).filter(
#                 RideSessionRider.session_id == session_id,
#                 RideSessionRider.rider_phone == rider_phone
#             ).first()
        
#         if not rider:
#             raise HTTPException(status_code=404, detail="Rider not found")
        
#         if rider.status != "boarded":
#             raise HTTPException(status_code=400, detail=f"Rider must be boarded first. Current status: {rider.status}")
        
#         # Update rider
#         rider.status = "dropped_off"
#         rider.dropped_off_at = datetime.now(timezone.utc)
#         rider.dropoff_confirmed = True
        
#         # Update session
#         session = db.query(RideSession).filter(RideSession.id == session_id).first()
#         if session:
#             dropped_count = sum(1 for r in session.riders if r.status in ["dropped_off", "completed"])
#             total_riders = len(session.riders)
            
#             if dropped_count == total_riders:
#                 session.current_phase = "completed"
#                 # Don't mark as completed here - wait for driver to complete
        
#         db.commit()
#         print(f"✅ Rider {rider.rider_name} dropped off successfully")
        
#         # Send notifications
#         try:
#             emit_to_user(session.driver_phone, "rider-dropped-off", {
#                 "booking_id": booking_id,
#                 "rider_phone": rider.rider_phone,
#                 "rider_name": rider.rider_name,
#                 "message": f"{rider.rider_name or 'Rider'} has been dropped off"
#             })
#         except Exception as e:
#             print(f"Socket error: {e}")
        
#         return {
#             "message": "Rider dropped off successfully",
#             "rider_status": rider.status
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"Error in rider_dropped_off: {e}")
#         import traceback
#         traceback.print_exc()
#         db.rollback()
#         raise HTTPException(status_code=500, detail=str(e))
# @router.post("/ride-sessions/{session_id}/rider-complete")
# def rider_complete(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Rider completes the ride and can rate the driver"""
#     booking_id = payload.get("booking_id")
#     rider_phone = normalize_phone(payload.get("rider_phone", ""))
    
#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id,
#         RideSessionRider.rider_phone == rider_phone
#     ).first()
    
#     if not rider:
#         raise HTTPException(status_code=404, detail="Rider not found")
    
#     if rider.status != "dropped_off":
#         raise HTTPException(status_code=400, detail="Ride must be completed after drop off")
    
#     rider.status = "completed"
#     rider.completed_at = datetime.now(timezone.utc)
#     db.commit()
    
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
    
#     # Check if all riders have completed
#     if session:
#         all_completed = all(r.status == "completed" for r in session.riders)
#         if all_completed:
#             session.status = "completed"
#             session.current_phase = "completed"
#             session.completed_at = datetime.now(timezone.utc)
            
#             # Update ride status
#             ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
#             if ride:
#                 ride.status = "completed"
            
#             db.commit()
            
#             emit_to_user(session.driver_phone, "ride-completed", {
#                 "ride_id": session.ride_id,
#                 "session_id": session_id,
#                 "message": "All riders have completed the ride"
#             })
    
#     emit_to_user(rider_phone, "ride-completed", {
#         "booking_id": booking_id,
#         "ride_id": session.ride_id if session else None,
#         "message": "Your ride has been completed!"
#     })
    
#     return {"message": "Ride marked completed", "status": rider.status}

# @router.post("/ride-sessions/{session_id}/complete")
# def complete_ride(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Driver completes the ride and can rate riders"""
#     driver_phone = normalize_phone(payload.get("driver_phone", ""))
    
#     session = db.query(RideSession).filter(
#         RideSession.id == session_id,
#         RideSession.driver_phone == driver_phone
#     ).first()
    
#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")
    
#     # THIS IS THE PROBLEM - It requires all riders to be completed
#     all_completed = all(r.status == "completed" for r in session.riders)
#     if not all_completed:
#         raise HTTPException(status_code=400, detail="All riders must complete before finishing the ride")
    
#     session.status = "completed"
#     session.current_phase = "completed"
#     session.completed_at = datetime.now(timezone.utc)
    
#     ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
#     if ride:
#         ride.status = "completed"
    
#     db.commit()
    
#     return {"message": "Ride completed successfully", "status": session.status}
# @router.post("/ride-sessions/{session_id}/rate-driver")
# def rate_driver(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Rider rates the driver"""
#     booking_id = payload.get("booking_id")
#     rating = payload.get("rating")
#     feedback = payload.get("feedback", "")
    
#     if rating < 1 or rating > 5:
#         raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id
#     ).first()
    
#     if not rider:
#         raise HTTPException(status_code=404, detail="Session rider not found")
    
#     if rider.rider_rating:
#         raise HTTPException(status_code=400, detail="Rating already submitted")
    
#     rider.rider_rating = rating
#     rider.rider_feedback = feedback
#     db.commit()
    
#     # Update driver's average rating
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
#     if session:
#         driver = db.query(User).filter(User.phone_number == session.driver_phone).first()
#         if driver:
#             all_ratings = db.query(RideSessionRider.rider_rating).filter(
#                 RideSessionRider.session_id == session_id,
#                 RideSessionRider.rider_rating.isnot(None)
#             ).all()
#             ratings_list = [r[0] for r in all_ratings if r[0]]
#             if ratings_list:
#                 driver.avg_rating = sum(ratings_list) / len(ratings_list)
#                 driver.total_ratings = len(ratings_list)
#                 db.commit()
    
#     return {"message": "Driver rated successfully"}


# @router.post("/ride-sessions/{session_id}/rate-rider")
# def rate_rider(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Driver rates a rider"""
#     booking_id = payload.get("booking_id")
#     rating = payload.get("rating")
#     feedback = payload.get("feedback", "")
    
#     if rating < 1 or rating > 5:
#         raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id
#     ).first()
    
#     if not rider:
#         raise HTTPException(status_code=404, detail="Rider not found")
    
#     if rider.driver_rating:
#         raise HTTPException(status_code=400, detail="Rating already submitted")
    
#     rider.driver_rating = rating
#     rider.driver_feedback = feedback
#     db.commit()
    
#     return {"message": "Rider rated successfully"}


# @router.post("/ride-sessions/{session_id}/location")
# def update_driver_location(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Update driver's current location for live tracking"""
#     lat = payload.get("lat")
#     lng = payload.get("lng")
    
#     if lat is None or lng is None:
#         raise HTTPException(status_code=400, detail="Latitude and longitude required")
    
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")
    
#     session.current_lat = lat
#     session.current_lng = lng
#     db.commit()
    
#     # Broadcast location to all riders in this session
#     for rider in session.riders:
#         if rider.status in ["accepted", "reached_pickup", "boarded"]:
#             emit_to_user(rider.rider_phone, "driver-location-update", {
#                 "latitude": lat,
#                 "longitude": lng,
#                 "session_id": session_id
#             })
    
#     return {"message": "Location updated"}


# @router.post("/ride-sessions/{session_id}/sos")
# def trigger_sos(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Trigger SOS alert for emergency"""
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")
    
#     session.sos_active = True
#     session.emergency_note = payload.get("note")
#     db.commit()
    
#     # Notify all riders about SOS
#     for rider in session.riders:
#         emit_to_user(rider.rider_phone, "sos-triggered", {
#             "session_id": session_id,
#             "message": "Emergency SOS has been triggered"
#         })
    
#     return {"message": "SOS triggered successfully"}


# # ============================================
# # RIDE FEEDBACK ENDPOINTS
# # ============================================

# @router.get("/ride/{ride_id}/ratings")
# def get_ride_ratings(ride_id: int, db: Session = Depends(get_db)):
#     """Get all ratings for a ride (for display after completion)"""
#     session = db.query(RideSession).filter(
#         RideSession.ride_id == ride_id,
#         RideSession.status == "completed"
#     ).order_by(RideSession.id.desc()).first()
    
#     if not session:
#         return {"ratings": []}
    
#     ratings = []
#     for rider in session.riders:
#         ratings.append({
#             "booking_id": rider.booking_id,
#             "rider_name": rider.rider_name,
#             "rider_phone": rider.rider_phone,
#             "rider_photo": rider.rider_photo,
#             "driver_rating_given": rider.driver_rating is not None,
#             "driver_rating": rider.driver_rating,
#             "driver_feedback": rider.driver_feedback,
#             "rider_rating_given": rider.rider_rating is not None,
#             "rider_rating": rider.rider_rating,
#             "rider_feedback": rider.rider_feedback,
#             "status": rider.status
#         })
    
#     return {"ratings": ratings}

# @router.put("/update-ride/{ride_id}")
# def update_ride(ride_id: int, data: UpdateRideRequest, db: Session = Depends(get_db)):
#     """Update an existing ride"""
#     normalized_phone = normalize_phone(data.phone_number)
    
#     # Fetch existing ride
#     ride = db.query(Ride).filter(
#         Ride.id == ride_id,
#         Ride.phone_number == normalized_phone
#     ).first()
    
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found or you don't have permission to edit it")
    
#     # Check if ride can be edited (not started, not cancelled)
#     if ride.started_at:
#         raise HTTPException(status_code=400, detail="Cannot edit ride - Ride has already started")
    
#     if ride.cancellation_reason:
#         raise HTTPException(status_code=400, detail="Cannot edit cancelled ride")
    
#     # Check if ride has confirmed bookings
#     confirmed_bookings = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status == "accepted"
#     ).all()
    
#     has_confirmed_bookings = len(confirmed_bookings) > 0
#     total_booked_seats = sum(b.seats_booked for b in confirmed_bookings)
    
#     # Parse duration
#     duration_minutes = parse_duration_to_minutes(data.duration_text)
    
#     # Convert departure time to UTC
#     departure_time_utc = data.departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         departure_time_utc = departure_time_utc.astimezone(timezone.utc)
    
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
#     # Validate time (minimum 30 minutes from now for new rides, but can be anytime for existing)
#     min_departure_time = datetime.now(timezone.utc) + timedelta(minutes=30)
#     if departure_time_utc < min_departure_time:
#         min_time_ist = to_ist(min_departure_time)
#         raise HTTPException(status_code=400, detail=f"Departure time must be at least 30 minutes from now. Please select a time after {min_time_ist.strftime('%I:%M %p')}.")
    
#     # Validate seat changes (cannot reduce below booked seats)
#     if data.available_seats < total_booked_seats:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Cannot reduce seats below {total_booked_seats} as you have {total_booked_seats} confirmed passenger(s)."
#         )
    
#     # Validate distance
#     distance = calculate_distance_km(
#         data.origin_coords[1], data.origin_coords[0],
#         data.destination_coords[1], data.destination_coords[0]
#     )
    
#     MIN_DISTANCE_KM = 3
#     MAX_DISTANCE_KM = 300
    
#     if distance < MIN_DISTANCE_KM:
#         raise HTTPException(status_code=400, detail=f"Pickup and destination are too close ({distance:.1f} km).")
#     if distance > MAX_DISTANCE_KM:
#         raise HTTPException(status_code=400, detail=f"Distance too far ({distance:.1f} km).")
    
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
#                     detail=f"Cannot disable Women Only mode - {female_bookings} female passenger(s) have already booked this ride."
#                 )
    
#     # Lock major fields if there are confirmed bookings
#     time_diff_minutes = abs((departure_time_utc - ride.departure_time).total_seconds()) / 60
    
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
#                 detail=f"Cannot modify: {', '.join(critical_changes)}. This ride has {len(confirmed_bookings)} confirmed booking(s)."
#             )
    
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
    
#     # Create notification for ride update
#     try:
#         origin_short = data.origin.split(",")[0].strip() if data.origin else "start"
#         dest_short = data.destination.split(",")[0].strip() if data.destination else "destination"
        
#         notification = UserNotification(
#             phone_number=normalized_phone,
#             title="Ride Updated! 🔄",
#             message=f"Your ride from {origin_short} to {dest_short} has been updated successfully.",
#             type=NotificationType.RIDE,
#             action_type="ride",
#             action_value=str(ride.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(notification)
#         db.commit()
#     except Exception as e:
#         print(f"Error creating update notification: {str(e)}")
    
#     return {
#         "message": "Ride updated successfully",
#         "ride_id": ride.id,
#         "remaining_seats": max(0, ride.available_seats - total_booked_seats),
#         "total_booked": total_booked_seats
#     }
# # Add this Pydantic model at the top with your other models (if not already there)

# @router.put("/booking/{booking_id}/modify-seats")
# def modify_booking_seats(booking_id: int, request: ModifySeatsRequest, db: Session = Depends(get_db)):
#     """Modify seats for a pending booking (not modification request)"""
#     booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")
    
#     # Only pending bookings can be directly modified
#     if booking.status != "pending":
#         raise HTTPException(status_code=400, detail="Only pending bookings can be directly modified")
    
#     ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     new_seats = request.new_seats
    
#     if new_seats <= 0:
#         raise HTTPException(status_code=400, detail="Seat count must be at least 1")
    
#     # Check if ride is still available
#     if ride.status not in ["active", "full"]:
#         raise HTTPException(status_code=400, detail="Ride is no longer available")
    
#     # Check available seats
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
    
#     # Update address fields if provided
#     if request.pickup_address is not None:
#         booking.pickup_address = request.pickup_address
#     if request.dropoff_address is not None:
#         booking.dropoff_address = request.dropoff_address
#     if request.pickup_place_name is not None:
#         booking.pickup_place_name = request.pickup_place_name
#     if request.dropoff_place_name is not None:
#         booking.dropoff_place_name = request.dropoff_place_name
    
#     db.commit()
    
#     # Create notification for the driver
#     try:
#         notification = UserNotification(
#             phone_number=ride.phone_number,
#             title="Booking Modified 🔄",
#             message=f"Passenger has modified their booking from {old_seats} to {new_seats} seat(s).",
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
    
#     # Emit socket event
#     try:
#         emit_to_user(ride.phone_number, "booking-modified", {
#             "booking_id": booking.id,
#             "passenger_phone": booking.passenger_phone,
#             "old_seats": old_seats,
#             "new_seats": new_seats,
#             "ride_id": ride.id
#         })
#     except Exception as e:
#         print(f"Error emitting socket event: {str(e)}")
    
#     return {
#         "message": f"Seats updated from {old_seats} to {new_seats}",
#         "booking_id": booking.id,
#         "new_seats": new_seats,
#         "new_total": booking.total_amount
#     }
# def check_and_auto_cancel_expired_rides(db: Session):
#     """Check for rides that haven't started within 30 minutes of departure and auto-cancel them"""
#     now = datetime.now(timezone.utc)
#     cutoff_time = now - timedelta(minutes=30)
    
#     expired_rides = db.query(Ride).filter(
#         Ride.departure_time <= cutoff_time,
#         Ride.started_at.is_(None),
#         Ride.status.in_(["active", "full"]),
#         Ride.cancellation_reason.is_(None)
#     ).all()
    
#     auto_cancelled_count = 0
    
#     for ride in expired_rides:
#         ride.status = "cancelled"
#         ride.cancellation_reason = "Auto-cancelled: Ride was not started within 30 minutes of departure time"
        
#         # Cancel all pending modification requests
#         pending_mods = db.query(ModificationRequest).filter(
#             ModificationRequest.ride_id == ride.id,
#             ModificationRequest.status == "pending"
#         ).all()
        
#         for mod in pending_mods:
#             mod.status = "cancelled"
#             mod.rejection_reason = "Ride auto-cancelled - not started on time"
#             mod.cancelled_at = now
        
#         # Cancel all accepted bookings
#         accepted_bookings = db.query(RideBooking).filter(
#             RideBooking.ride_id == ride.id,
#             RideBooking.status == "accepted"
#         ).all()
        
#         for booking in accepted_bookings:
#             booking.status = "cancelled"
#             booking.cancellation_reason = "Ride auto-cancelled - not started on time"
            
#             # Notify passenger
#             notification = UserNotification(
#                 phone_number=booking.passenger_phone,
#                 title="Ride Auto-cancelled ⏰",
#                 message=f"The ride from {ride.origin} to {ride.destination} has been auto-cancelled as it was not started on time.",
#                 type=NotificationType.RIDE,
#                 action_type="cancellation",
#                 action_value=str(ride.id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
            
#             emit_to_user(booking.passenger_phone, "ride-auto-cancelled", {
#                 "ride_id": ride.id,
#                 "booking_id": booking.id,
#                 "message": "Ride was not started on time and has been auto-cancelled"
#             })
        
#         auto_cancelled_count += 1
    
#     if auto_cancelled_count > 0:
#         db.commit()
#         print(f"Auto-cancelled {auto_cancelled_count} expired rides")
    
#     return auto_cancelled_count
# @router.post("/rides/check-auto-cancel")
# def check_auto_cancel_rides(db: Session = Depends(get_db)):
#     """Endpoint to manually trigger auto-cancellation check"""
#     count = check_and_auto_cancel_expired_rides(db)
#     return {"message": f"Auto-cancelled {count} expired rides", "count": count}
# # Add these helper functions if not already present (they are in your code but ensure they're there)

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

# # Add to ride.py after the existing endpoints

# @router.post("/ride/{ride_id}/resolve-concurrent-requests")
# def resolve_concurrent_requests(
#     ride_id: int, 
#     payload: dict,
#     db: Session = Depends(get_db)
# ):
#     """
#     Resolve concurrent modification and booking requests.
#     Driver chooses which request to accept.
    
#     Payload:
#     {
#         "choice": "modification" | "booking",
#         "modification_request_id": Optional[int],
#         "booking_id": Optional[int],
#         "driver_phone": str
#     }
#     """
#     from sqlalchemy import select, update
    
#     choice = payload.get("choice")
#     modification_request_id = payload.get("modification_request_id")
#     booking_id = payload.get("booking_id")
#     driver_phone = normalize_phone(payload.get("driver_phone", ""))
    
#     # Get ride with row lock for atomic operation
#     ride = db.query(Ride).filter(Ride.id == ride_id).with_for_update().first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     if ride.started_at:
#         raise HTTPException(status_code=400, detail="Ride already started")
    
#     # Get current seat counts
#     total_booked = get_total_booked_seats(db, ride_id)
#     current_available = ride.available_seats - total_booked
    
#     result = {
#         "success": True,
#         "ride_id": ride_id,
#         "original_available": current_available,
#         "action_taken": choice
#     }
    
#     if choice == "modification" and modification_request_id:
#         # Accept the modification request
#         mod_request = db.query(ModificationRequest).filter(
#             ModificationRequest.id == modification_request_id,
#             ModificationRequest.status == "pending"
#         ).with_for_update().first()
        
#         if not mod_request:
#             raise HTTPException(status_code=404, detail="Modification request not found")
        
#         booking = db.query(RideBooking).filter(
#             RideBooking.id == mod_request.booking_id
#         ).with_for_update().first()
        
#         # Calculate available seats excluding this booking
#         other_booked = total_booked - booking.seats_booked
#         available_excluding_current = ride.available_seats - other_booked
        
#         if mod_request.requested_seats > available_excluding_current:
#             # Not enough seats - reject modification
#             mod_request.status = "rejected"
#             mod_request.rejection_reason = "Not enough seats available"
#             db.commit()
            
#             result["success"] = False
#             result["message"] = "Not enough seats available for modification"
#             result["available_seats"] = available_excluding_current
#         else:
#             # Accept modification
#             old_seats = booking.seats_booked
#             booking.seats_booked = mod_request.requested_seats
#             booking.total_amount = ride.price_per_seat * mod_request.requested_seats
            
#             mod_request.status = "approved"
#             mod_request.approved_at = datetime.now(timezone.utc)
            
#             db.commit()
            
#             result["message"] = f"Modification approved: {old_seats} → {mod_request.requested_seats} seats"
#             result["booking_id"] = booking.id
#             result["new_seats"] = mod_request.requested_seats
            
#             # Notify rider
#             emit_to_user(mod_request.passenger_phone, "modification-approved", {
#                 "booking_id": booking.id,
#                 "new_seats": mod_request.requested_seats,
#                 "message": f"Your seat change to {mod_request.requested_seats} seat(s) has been approved!"
#             })
            
#             # Check if there's a conflicting booking request to auto-reject
#             conflicting_booking = db.query(RideBooking).filter(
#                 RideBooking.ride_id == ride_id,
#                 RideBooking.status == "pending",
#                 RideBooking.id != booking.id
#             ).with_for_update().first()
            
#             if conflicting_booking:
#                 conflicting_booking.status = "rejected"
#                 conflicting_booking.cancellation_reason = "Driver accepted another request"
#                 db.commit()
                
#                 emit_to_user(conflicting_booking.passenger_phone, "booking-rejected", {
#                     "booking_id": conflicting_booking.id,
#                     "ride_id": ride_id,
#                     "message": "Sorry, the driver accepted another request. Only 1 seat remains."
#                 })
                
#                 result["auto_rejected_booking"] = conflicting_booking.id
    
#     elif choice == "booking" and booking_id:
#         # Accept the new booking request
#         booking = db.query(RideBooking).filter(
#             RideBooking.id == booking_id,
#             RideBooking.status == "pending"
#         ).with_for_update().first()
        
#         if not booking:
#             raise HTTPException(status_code=404, detail="Booking request not found")
        
#         total_booked_current = get_total_booked_seats(db, ride_id)
#         remaining_seats = ride.available_seats - total_booked_current
        
#         if booking.seats_booked > remaining_seats:
#             booking.status = "rejected"
#             booking.cancellation_reason = "Not enough seats available"
#             db.commit()
            
#             result["success"] = False
#             result["message"] = f"Only {remaining_seats} seat(s) available"
#         else:
#             # Accept booking
#             booking.status = "accepted"
            
#             # Update ride status if full
#             total_booked_after = get_total_booked_seats(db, ride_id)
#             if ride.available_seats <= total_booked_after:
#                 ride.status = "full"
            
#             db.commit()
            
#             result["message"] = f"Booking approved for {booking.seats_booked} seat(s)"
#             result["booking_id"] = booking.id
            
#             # Notify passenger
#             emit_to_user(booking.passenger_phone, "booking-approved", {
#                 "booking_id": booking.id,
#                 "seats": booking.seats_booked,
#                 "message": f"Your booking for {booking.seats_booked} seat(s) has been accepted!"
#             })
            
#             # Check for pending modification request from other rider and auto-reject
#             pending_mod = db.query(ModificationRequest).filter(
#                 ModificationRequest.ride_id == ride_id,
#                 ModificationRequest.status == "pending"
#             ).with_for_update().first()
            
#             if pending_mod:
#                 pending_mod.status = "rejected"
#                 pending_mod.rejection_reason = "Driver accepted another booking request"
#                 db.commit()
                
#                 emit_to_user(pending_mod.passenger_phone, "modification-rejected", {
#                     "booking_id": pending_mod.booking_id,
#                     "message": "Sorry, the driver accepted another request. No seats available for modification."
#                 })
                
#                 result["auto_rejected_modification"] = pending_mod.id
    
#     else:
#         raise HTTPException(status_code=400, detail="Invalid choice or missing request ID")
    
#     # Get final seat counts
#     final_booked = get_total_booked_seats(db, ride_id)
#     result["final_available_seats"] = ride.available_seats - final_booked
#     result["final_booked_seats"] = final_booked
    
#     # Emit update to all parties
#     emit_to_ride(ride_id, "seat-update", {
#         "available_seats": ride.available_seats - final_booked,
#         "booked_seats": final_booked,
#         "total_seats": ride.available_seats
#     })
    
#     return result


# @router.get("/ride/{ride_id}/concurrent-requests")
# def get_concurrent_requests(ride_id: int, db: Session = Depends(get_db)):
#     """Get both pending modification and new booking requests for driver to choose"""
#     from sqlalchemy import and_
    
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     total_booked = get_total_booked_seats(db, ride_id)
#     available_seats = ride.available_seats - total_booked
    
#     # Get pending modification request
#     pending_mod = db.query(ModificationRequest).filter(
#         ModificationRequest.ride_id == ride_id,
#         ModificationRequest.status == "pending"
#     ).first()
    
#     mod_data = None
#     if pending_mod:
#         booking = db.query(RideBooking).filter(RideBooking.id == pending_mod.booking_id).first()
#         passenger = db.query(User).filter(User.phone_number == pending_mod.passenger_phone).first()
        
#         mod_data = {
#             "id": pending_mod.id,
#             "booking_id": pending_mod.booking_id,
#             "passenger_name": passenger.full_name if passenger else "Rider",
#             "passenger_phone": pending_mod.passenger_phone,
#             "current_seats": pending_mod.current_seats,
#             "requested_seats": pending_mod.requested_seats,
#             "seats_change": pending_mod.requested_seats - pending_mod.current_seats,
#             "created_at": pending_mod.created_at.isoformat(),
#             "type": "modification"
#         }
    
#     # Get pending new booking request (not from the modifying passenger)
#     pending_booking = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status == "pending"
#     )
    
#     if pending_mod:
#         pending_booking = pending_booking.filter(RideBooking.id != pending_mod.booking_id)
    
#     pending_booking = pending_booking.first()
    
#     booking_data = None
#     if pending_booking:
#         passenger = db.query(User).filter(User.phone_number == pending_booking.passenger_phone).first()
        
#         booking_data = {
#             "id": pending_booking.id,
#             "passenger_name": passenger.full_name if passenger else "Rider",
#             "passenger_phone": pending_booking.passenger_phone,
#             "seats_requested": pending_booking.seats_booked,
#             "created_at": pending_booking.created_at.isoformat(),
#             "type": "booking"
#         }
    
#     return {
#         "has_concurrent_requests": mod_data is not None and booking_data is not None,
#         "available_seats": available_seats,
#         "total_seats": ride.available_seats,
#         "booked_seats": total_booked,
#         "modification_request": mod_data,
#         "booking_request": booking_data,
#         "ride": {
#             "id": ride.id,
#             "origin": ride.origin,
#             "destination": ride.destination,
#             "departure_time": ride.departure_time.isoformat()
#         }
#     }
# # Add these endpoints to your existing ride.py

# @router.post("/ride-sessions/{session_id}/complete-force")
# def complete_ride_force(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Driver forcefully completes the ride - marks all pending riders as completed"""
#     driver_phone = normalize_phone(payload.get("driver_phone", ""))
    
#     session = db.query(RideSession).filter(
#         RideSession.id == session_id,
#         RideSession.driver_phone == driver_phone
#     ).first()
    
#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")
    
#     # Mark all incomplete riders as completed automatically
#     completed_count = 0
#     for rider in session.riders:
#         if rider.status not in ["completed", "dropped_off"]:
#             rider.status = "completed"
#             rider.completed_at = datetime.now(timezone.utc)
#             completed_count += 1
    
#     session.status = "completed"
#     session.current_phase = "completed"
#     session.completed_at = datetime.now(timezone.utc)
    
#     ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
#     if ride:
#         ride.status = "completed"
    
#     db.commit()
    
#     # Notify all riders that ride was completed by driver
#     for rider in session.riders:
#         if rider.rider_rating is None:
#             emit_to_user(rider.rider_phone, "ride-completed-by-driver", {
#                 "session_id": session_id,
#                 "ride_id": session.ride_id,
#                 "booking_id": rider.booking_id,
#                 "message": "The driver has completed the ride. You can now rate the driver."
#             })
    
#     return {
#         "message": "Ride completed successfully",
#         "status": session.status,
#         "completed_riders": completed_count,
#         "total_riders": len(session.riders)
#     }


# @router.post("/ride-sessions/{session_id}/rate-driver-once")
# def rate_driver_once(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Rate driver with prevention of duplicate ratings"""
#     booking_id = payload.get("booking_id")
#     rating = payload.get("rating")
#     feedback = payload.get("feedback", "")
    
#     if rating < 1 or rating > 5:
#         raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id
#     ).first()
    
#     if not rider:
#         raise HTTPException(status_code=404, detail="Session rider not found")
    
#     # Check if already rated
#     if rider.rider_rating is not None:
#         return {
#             "already_rated": True,
#             "message": "You have already rated this driver",
#             "existing_rating": rider.rider_rating
#         }
    
#     # Save rating
#     rider.rider_rating = rating
#     rider.rider_feedback = feedback
#     db.commit()
    
#     # Update driver's average rating
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
#     if session:
#         driver = db.query(User).filter(User.phone_number == session.driver_phone).first()
#         if driver:
#             all_ratings = db.query(RideSessionRider.rider_rating).filter(
#                 RideSessionRider.session_id == session_id,
#                 RideSessionRider.rider_rating.isnot(None)
#             ).all()
#             ratings_list = [r[0] for r in all_ratings if r[0]]
#             if ratings_list:
#                 driver.avg_rating = sum(ratings_list) / len(ratings_list)
#                 driver.total_ratings = len(ratings_list)
#                 db.commit()
    
#     return {
#         "success": True,
#         "message": "Driver rated successfully",
#         "rating": rating
#     }


# @router.get("/ride-session/rider/{booking_id}/status")
# def get_rider_session_status(booking_id: int, rider_phone: str, db: Session = Depends(get_db)):
#     """Get rider's session status and rating info"""
#     rider_phone = normalize_phone(rider_phone)
    
#     rider_session = db.query(RideSessionRider).filter(
#         RideSessionRider.booking_id == booking_id,
#         RideSessionRider.rider_phone == rider_phone
#     ).first()
    
#     if not rider_session:
#         raise HTTPException(status_code=404, detail="Rider session not found")
    
#     session = db.query(RideSession).filter(RideSession.id == rider_session.session_id).first()
#     ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
    
#     return {
#         "session_id": session.id,
#         "rider_status": rider_session.status,
#         "session_status": session.status,
#         "has_rated_driver": rider_session.rider_rating is not None,
#         "driver_rating": rider_session.rider_rating,
#         "ride_completed": session.status == "completed",
#         "ride_id": session.ride_id,
#         "origin": ride.origin if ride else None,
#         "destination": ride.destination if ride else None,
#         "route_coordinates": ride.route_coordinates if ride else None
#     }


# @router.get("/ride-session/{session_id}/qr-valid")
# def validate_qr_code(session_id: int, qr_code_token: str, db: Session = Depends(get_db)):
#     """Validate QR code for boarding"""
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
    
#     if not session:
#         return {"valid": False, "message": "Session not found"}
    
#     if session.qr_code_token != qr_code_token:
#         return {"valid": False, "message": "Invalid QR code"}
    
#     if session.qr_expires_at and session.qr_expires_at < datetime.now(timezone.utc):
#         return {"valid": False, "message": "QR code has expired"}
    
#     if session.status in ["completed", "cancelled"]:
#         return {"valid": False, "message": f"Ride is {session.status}"}
    
#     return {
#         "valid": True,
#         "session_id": session.id,
#         "ride_id": session.ride_id,
#         "driver_phone": session.driver_phone
#     }# Add these endpoints to your existing ride.py

# @router.post("/ride-sessions/{session_id}/complete-force")
# def complete_ride_force(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Driver forcefully completes the ride - marks all pending riders as completed"""
#     driver_phone = normalize_phone(payload.get("driver_phone", ""))
    
#     session = db.query(RideSession).filter(
#         RideSession.id == session_id,
#         RideSession.driver_phone == driver_phone
#     ).first()
    
#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")
    
#     # Mark all incomplete riders as completed automatically
#     completed_count = 0
#     for rider in session.riders:
#         if rider.status not in ["completed", "dropped_off"]:
#             rider.status = "completed"
#             rider.completed_at = datetime.now(timezone.utc)
#             completed_count += 1
    
#     session.status = "completed"
#     session.current_phase = "completed"
#     session.completed_at = datetime.now(timezone.utc)
    
#     ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
#     if ride:
#         ride.status = "completed"
    
#     db.commit()
    
#     # Notify all riders that ride was completed by driver
#     for rider in session.riders:
#         if rider.rider_rating is None:
#             emit_to_user(rider.rider_phone, "ride-completed-by-driver", {
#                 "session_id": session_id,
#                 "ride_id": session.ride_id,
#                 "booking_id": rider.booking_id,
#                 "message": "The driver has completed the ride. You can now rate the driver."
#             })
    
#     return {
#         "message": "Ride completed successfully",
#         "status": session.status,
#         "completed_riders": completed_count,
#         "total_riders": len(session.riders)
#     }


# @router.post("/ride-sessions/{session_id}/rate-driver-once")
# def rate_driver_once(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Rate driver with prevention of duplicate ratings"""
#     booking_id = payload.get("booking_id")
#     rating = payload.get("rating")
#     feedback = payload.get("feedback", "")
    
#     if rating < 1 or rating > 5:
#         raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id
#     ).first()
    
#     if not rider:
#         raise HTTPException(status_code=404, detail="Session rider not found")
    
#     # Check if already rated
#     if rider.rider_rating is not None:
#         return {
#             "already_rated": True,
#             "message": "You have already rated this driver",
#             "existing_rating": rider.rider_rating
#         }
    
#     # Save rating
#     rider.rider_rating = rating
#     rider.rider_feedback = feedback
#     db.commit()
    
#     # Update driver's average rating
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
#     if session:
#         driver = db.query(User).filter(User.phone_number == session.driver_phone).first()
#         if driver:
#             all_ratings = db.query(RideSessionRider.rider_rating).filter(
#                 RideSessionRider.session_id == session_id,
#                 RideSessionRider.rider_rating.isnot(None)
#             ).all()
#             ratings_list = [r[0] for r in all_ratings if r[0]]
#             if ratings_list:
#                 driver.avg_rating = sum(ratings_list) / len(ratings_list)
#                 driver.total_ratings = len(ratings_list)
#                 db.commit()
    
#     return {
#         "success": True,
#         "message": "Driver rated successfully",
#         "rating": rating
#     }


# @router.get("/ride-session/rider/{booking_id}/status")
# def get_rider_session_status(booking_id: int, rider_phone: str, db: Session = Depends(get_db)):
#     """Get rider's session status and rating info"""
#     rider_phone = normalize_phone(rider_phone)
    
#     rider_session = db.query(RideSessionRider).filter(
#         RideSessionRider.booking_id == booking_id,
#         RideSessionRider.rider_phone == rider_phone
#     ).first()
    
#     if not rider_session:
#         raise HTTPException(status_code=404, detail="Rider session not found")
    
#     session = db.query(RideSession).filter(RideSession.id == rider_session.session_id).first()
#     ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
    
#     return {
#         "session_id": session.id,
#         "rider_status": rider_session.status,
#         "session_status": session.status,
#         "has_rated_driver": rider_session.rider_rating is not None,
#         "driver_rating": rider_session.rider_rating,
#         "ride_completed": session.status == "completed",
#         "ride_id": session.ride_id,
#         "origin": ride.origin if ride else None,
#         "destination": ride.destination if ride else None,
#         "route_coordinates": ride.route_coordinates if ride else None
#     }


# @router.get("/ride-session/{session_id}/qr-valid")
# def validate_qr_code(session_id: int, qr_code_token: str, db: Session = Depends(get_db)):
#     """Validate QR code for boarding"""
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
    
#     if not session:
#         return {"valid": False, "message": "Session not found"}
    
#     if session.qr_code_token != qr_code_token:
#         return {"valid": False, "message": "Invalid QR code"}
    
#     if session.qr_expires_at and session.qr_expires_at < datetime.now(timezone.utc):
#         return {"valid": False, "message": "QR code has expired"}
    
#     if session.status in ["completed", "cancelled"]:
#         return {"valid": False, "message": f"Ride is {session.status}"}
    
#     return {
#         "valid": True,
#         "session_id": session.id,
#         "ride_id": session.ride_id,
#         "driver_phone": session.driver_phone
#     }
# @router.get("/driver-earnings")
# def get_driver_earnings(phone_number: str, db: Session = Depends(get_db)):
#     """Get total earnings from completed rides for a driver"""
#     normalized_phone = normalize_phone(phone_number)
    
#     # Query completed rides where this user was the driver
#     completed_rides = db.query(Ride).filter(
#         Ride.phone_number == normalized_phone,
#         Ride.status == "completed"
#     ).all()
    
#     total_earnings = 0
#     rides_details = []
    
#     for ride in completed_rides:
#         # Get all accepted bookings for this ride
#         bookings = db.query(RideBooking).filter(
#             RideBooking.ride_id == ride.id,
#             RideBooking.status.in_(["accepted", "completed"])
#         ).all()
        
#         ride_total = 0
#         for booking in bookings:
#             ride_total += booking.total_amount or 0
        
#         total_earnings += ride_total
        
#         rides_details.append({
#             "ride_id": ride.id,
#             "origin": ride.origin,
#             "destination": ride.destination,
#             "departure_time": ride.departure_time.isoformat(),
#             "total_amount": ride_total,
#             "bookings_count": len(bookings)
#         })
    
#     return {
#         "success": True,
#         "phone_number": normalized_phone,
#         "total_earnings": total_earnings,
#         "completed_rides_count": len(completed_rides),
#         "rides": rides_details
#     }
# # Add this endpoint to your user.py or ride.py file

# # Add these endpoints to your ride.py file

# @router.get("/users/{phone_number}/rating")
# def get_user_rating(phone_number: str, db: Session = Depends(get_db)):
#     """Get user's average rating from completed rides"""
#     normalized_phone = normalize_phone(phone_number)
    
#     # Find user
#     user = db.query(User).filter(User.phone_number == normalized_phone).first()
    
#     if not user:
#         return {
#             "success": False,
#             "message": "User not found"
#         }
    
#     # Get ratings from RideSessionRider where user was a driver (rated by passengers)
#     driver_ratings = db.query(RideSessionRider.rider_rating).filter(
#         RideSessionRider.rider_rating.isnot(None)
#     ).join(RideSession).filter(
#         RideSession.driver_phone == normalized_phone
#     ).all()
    
#     # Get ratings from RideSessionRider where user was a rider (rated by driver)
#     rider_ratings = db.query(RideSessionRider.driver_rating).filter(
#         RideSessionRider.driver_rating.isnot(None)
#     ).join(RideSession).filter(
#         RideSessionRider.rider_phone == normalized_phone
#     ).all()
    
#     # Also get ratings from User model's avg_rating if available (from previous rides)
#     if user.avg_rating and user.avg_rating > 0:
#         # Use the stored average rating from User model
#         return {
#             "success": True,
#             "phone_number": normalized_phone,
#             "average_rating": round(float(user.avg_rating), 1),
#             "total_ratings": user.total_ratings or 0,
#             "source": "user_model"
#         }
    
#     # Combine all ratings from RideSessionRider
#     all_ratings = []
#     for r in driver_ratings:
#         if r[0]:
#             all_ratings.append(float(r[0]))
#     for r in rider_ratings:
#         if r[0]:
#             all_ratings.append(float(r[0]))
    
#     # Calculate average
#     if all_ratings:
#         average_rating = sum(all_ratings) / len(all_ratings)
#         total_ratings = len(all_ratings)
#     else:
#         average_rating = 0.0
#         total_ratings = 0
    
#     # Update user model with calculated rating
#     if total_ratings > 0:
#         user.avg_rating = average_rating
#         user.total_ratings = total_ratings
#         db.commit()
    
#     return {
#         "success": True,
#         "phone_number": normalized_phone,
#         "average_rating": round(average_rating, 1),
#         "total_ratings": total_ratings
#     }


# @router.get("/users/{phone_number}/completed-rides/passenger")
# def get_completed_rides_as_passenger(phone_number: str, db: Session = Depends(get_db)):
#     """Get count of completed rides where user was a passenger"""
#     normalized_phone = normalize_phone(phone_number)
    
#     # Count completed bookings (rides that are completed)
#     # A ride is considered completed for passenger if:
#     # 1. Booking status is 'accepted' or 'completed'
#     # 2. The ride status is 'completed'
#     completed_bookings = db.query(RideBooking).join(Ride).filter(
#         RideBooking.passenger_phone == normalized_phone,
#         RideBooking.status.in_(["accepted", "completed"]),
#         Ride.status == "completed"
#     ).count()
    
#     # Also count bookings from ride sessions where rider completed
#     session_completed = db.query(RideSessionRider).join(RideSession).filter(
#         RideSessionRider.rider_phone == normalized_phone,
#         RideSessionRider.status.in_(["completed", "dropped_off"]),
#         RideSession.status == "completed"
#     ).count()
    
#     # Use the maximum count to avoid double counting
#     total_completed = max(completed_bookings, session_completed)
    
#     return {
#         "success": True,
#         "phone_number": normalized_phone,
#         "count": total_completed,
#         "type": "passenger"
#     }


# @router.get("/users/{phone_number}/completed-rides/driver")
# def get_completed_rides_as_driver(phone_number: str, db: Session = Depends(get_db)):
#     """Get count of completed rides where user was the driver"""
#     normalized_phone = normalize_phone(phone_number)
    
#     # Count completed rides as driver
#     completed_rides = db.query(Ride).filter(
#         Ride.phone_number == normalized_phone,
#         Ride.status == "completed"
#     ).count()
    
#     # Also count from ride sessions where driver completed
#     session_completed = db.query(RideSession).filter(
#         RideSession.driver_phone == normalized_phone,
#         RideSession.status == "completed"
#     ).count()
    
#     # Use the maximum count to avoid double counting
#     total_completed = max(completed_rides, session_completed)
    
#     return {
#         "success": True,
#         "phone_number": normalized_phone,
#         "count": total_completed,
#         "type": "driver"
#     }


# @router.get("/users/{phone_number}/ride-stats")
# def get_user_ride_stats(phone_number: str, db: Session = Depends(get_db)):
#     """Get comprehensive ride statistics for a user"""
#     normalized_phone = normalize_phone(phone_number)
    
#     # Get user info
#     user = db.query(User).filter(User.phone_number == normalized_phone).first()
    
#     # Completed rides as passenger
#     passenger_rides = db.query(RideBooking).join(Ride).filter(
#         RideBooking.passenger_phone == normalized_phone,
#         RideBooking.status.in_(["accepted", "completed"]),
#         Ride.status == "completed"
#     ).count()
    
#     # Completed rides as driver
#     driver_rides = db.query(Ride).filter(
#         Ride.phone_number == normalized_phone,
#         Ride.status == "completed"
#     ).count()
    
#     # Total earnings as driver (from completed rides)
#     completed_rides_list = db.query(Ride).filter(
#         Ride.phone_number == normalized_phone,
#         Ride.status == "completed"
#     ).all()
    
#     total_earnings = 0
#     for ride in completed_rides_list:
#         bookings = db.query(RideBooking).filter(
#             RideBooking.ride_id == ride.id,
#             RideBooking.status.in_(["accepted", "completed"])
#         ).all()
#         for booking in bookings:
#             total_earnings += booking.total_amount or 0
    
#     # Get rating
#     avg_rating = 0.0
#     total_ratings = 0
#     if user:
#         if user.avg_rating:
#             avg_rating = float(user.avg_rating)
#         if user.total_ratings:
#             total_ratings = user.total_ratings
    
#     return {
#         "success": True,
#         "phone_number": normalized_phone,
#         "stats": {
#             "completed_rides_as_passenger": passenger_rides,
#             "completed_rides_as_driver": driver_rides,
#             "total_rides": passenger_rides + driver_rides,
#             "total_earnings": total_earnings,
#             "average_rating": round(avg_rating, 1),
#             "total_ratings": total_ratings
#         }
#     }


# @router.post("/rides/update-user-ratings")
# def update_all_user_ratings(db: Session = Depends(get_db)):
#     """Admin endpoint to update all user ratings from ride history"""
#     users = db.query(User).all()
#     updated_count = 0
    
#     for user in users:
#         # Get ratings where user was driver
#         driver_ratings = db.query(RideSessionRider.rider_rating).filter(
#             RideSessionRider.rider_rating.isnot(None)
#         ).join(RideSession).filter(
#             RideSession.driver_phone == user.phone_number
#         ).all()
        
#         # Get ratings where user was rider
#         rider_ratings = db.query(RideSessionRider.driver_rating).filter(
#             RideSessionRider.driver_rating.isnot(None)
#         ).join(RideSession).filter(
#             RideSessionRider.rider_phone == user.phone_number
#         ).all()
        
#         all_ratings = []
#         for r in driver_ratings:
#             if r[0]:
#                 all_ratings.append(float(r[0]))
#         for r in rider_ratings:
#             if r[0]:
#                 all_ratings.append(float(r[0]))
        
#         if all_ratings:
#             avg_rating = sum(all_ratings) / len(all_ratings)
#             user.avg_rating = avg_rating
#             user.total_ratings = len(all_ratings)
#             updated_count += 1
    
#     db.commit()
    
#     return {
#         "success": True,
#         "message": f"Updated ratings for {updated_count} users",
#         "updated_count": updated_count
#     }
# @router.get("/api/v1/bookings/{booking_id}/ride")
# def get_ride_from_booking(booking_id: int, db: Session = Depends(get_db)):
#     """
#     Fetch complete ride details from a booking ID.
#     Used when the app only has the booking ID and needs the full ride data.
#     """
#     try:
#         # Get the booking with ride relationship
#         booking = db.query(RideBooking).options(
#             joinedload(RideBooking.ride)
#         ).filter(RideBooking.id == booking_id).first()
        
#         if not booking:
#             raise HTTPException(status_code=404, detail="Booking not found")
        
#         ride = booking.ride
#         if not ride:
#             raise HTTPException(status_code=404, detail="Ride not found for this booking")
        
#         # Get driver information
#         driver = db.query(User).filter(User.phone_number == ride.phone_number).first()
        
#         # Get vehicle information
#         vehicle = None
#         if ride.vehicle_id:
#             vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first()
        
#         # Get total booked seats for this ride
#         total_booked = get_total_booked_seats(db, ride.id)
#         remaining_seats = max(0, ride.available_seats - total_booked)
        
#         # Get driver's average rating from completed rides
#         driver_rating = 4.5  # default
#         if driver and driver.avg_rating:
#             driver_rating = float(driver.avg_rating)
        
#         # Get route coordinates (ensure it's properly formatted)
#         route_coords = ride.route_coordinates
#         if route_coords and isinstance(route_coords, str):
#             import json
#             try:
#                 route_coords = json.loads(route_coords)
#             except:
#                 route_coords = []
        
#         # Get suggested pickup/drop points from route coordinates
#         suggested_pickup = None
#         suggested_drop = None
        
#         if booking.intersection_pickup_lat and booking.intersection_pickup_lon:
#             suggested_pickup = {
#                 "lat": float(booking.intersection_pickup_lat),
#                 "lng": float(booking.intersection_pickup_lon)
#             }
#         elif ride.route_coordinates and len(ride.route_coordinates) > 0:
#             # Use first point as suggested pickup
#             first = ride.route_coordinates[0]
#             if isinstance(first, list) and len(first) >= 2:
#                 suggested_pickup = {"lng": float(first[0]), "lat": float(first[1])}
        
#         if booking.intersection_drop_lat and booking.intersection_drop_lon:
#             suggested_drop = {
#                 "lat": float(booking.intersection_drop_lat),
#                 "lng": float(booking.intersection_drop_lon)
#             }
#         elif ride.route_coordinates and len(ride.route_coordinates) > 0:
#             # Use last point as suggested drop
#             last = ride.route_coordinates[-1]
#             if isinstance(last, list) and len(last) >= 2:
#                 suggested_drop = {"lng": float(last[0]), "lat": float(last[1])}
        
#         # Determine ride status
#         ride_status = ride.status
#         if ride.started_at and ride_status != "completed":
#             ride_status = "ongoing"
#         elif ride.cancellation_reason:
#             ride_status = "cancelled"
#         elif remaining_seats == 0 and ride_status == "active":
#             ride_status = "full"
        
#         response_data = {
#             "success": True,
#             "ride": {
#                 "id": ride.id,
#                 "custom_ride_id": getattr(ride, 'custom_ride_id', None),  # ADD CUSTOM RIDE ID
#                 "origin": ride.origin,
#                 "destination": ride.destination,
#                 "origin_address": getattr(ride, 'origin_address', None),  # ADD ORIGIN ADDRESS
#                 "destination_address": getattr(ride, 'destination_address', None),  # ADD DESTINATION ADDRESS
#                 "origin_place_name": getattr(ride, 'origin_place_name', None),  # ADD ORIGIN PLACE NAME
#                 "destination_place_name": getattr(ride, 'destination_place_name', None),  # ADD DESTINATION PLACE NAME
#                 "departure_time": ride.departure_time.isoformat() if ride.departure_time else None,
#                 "available_seats": ride.available_seats,
#                 "price_per_seat": float(ride.price_per_seat) if ride.price_per_seat else 0,
#                 "distance_km": float(ride.distance_km) if ride.distance_km else None,
#                 "duration_text": ride.duration_text,
#                 "route_coordinates": route_coords,
#                 "origin_latitude": float(ride.origin_lat) if ride.origin_lat else None,
#                 "origin_longitude": float(ride.origin_lon) if ride.origin_lon else None,
#                 "destination_latitude": float(ride.destination_lat) if ride.destination_lat else None,
#                 "destination_longitude": float(ride.destination_lon) if ride.destination_lon else None,
#                 "women_only": ride.women_only or False,
#                 "status": ride_status,
#                 "started_at": ride.started_at.isoformat() if ride.started_at else None,
#                 "cancellation_reason": ride.cancellation_reason,
#                 "preferences": ride.preferences,
#                 "driver_name": driver.full_name or f"Driver {ride.phone_number[-4:]}" if driver else "Driver",
#                 "driver_phone": ride.phone_number,
#                 "driver_user_id": driver.user_id if driver else None,
#                 "driver_profile_picture": driver.profile_picture if driver else None,
#                 "driver_rating": driver_rating,
#                 "suggested_pickup_point": suggested_pickup,
#                 "suggested_drop_point": suggested_drop,
#                 "vehicle": {
#                     "id": vehicle.id if vehicle else None,
#                     "make": vehicle.make if vehicle else None,
#                     "model": vehicle.model if vehicle else None,
#                     "color": vehicle.color if vehicle else None,
#                     "registration_number": vehicle.registration_number if vehicle else None,
#                     "photo_url": vehicle.photo_url if vehicle else None,
#                 } if vehicle else None,
#                 "total_booked_seats": total_booked,
#                 "remaining_seats": remaining_seats
#             },
#             "booking": {
#                 "id": booking.id,
#                 "custom_booking_id": getattr(booking, 'custom_booking_id', None),  # ADD CUSTOM BOOKING ID
#                 "seats_requested": booking.seats_booked,
#                 "status": booking.status,
#                 "total_amount": float(booking.total_amount) if booking.total_amount else None,
#                 "created_at": booking.created_at.isoformat() if booking.created_at else None,
#                 # ADD ADDRESS FIELDS
#                 "pickup_address": getattr(booking, 'pickup_address', None),
#                 "dropoff_address": getattr(booking, 'dropoff_address', None),
#                 "pickup_place_name": getattr(booking, 'pickup_place_name', None),
#                 "dropoff_place_name": getattr(booking, 'dropoff_place_name', None),
#                 "pickup_walk_distance_m": booking.pickup_walk_distance_m,
#                 "drop_walk_distance_m": booking.drop_walk_distance_m,
#                 "intersection_pickup": {
#                     "lat": float(booking.intersection_pickup_lat) if booking.intersection_pickup_lat else None,
#                     "lng": float(booking.intersection_pickup_lon) if booking.intersection_pickup_lon else None
#                 } if booking.intersection_pickup_lat and booking.intersection_pickup_lon else None,
#                 "intersection_drop": {
#                     "lat": float(booking.intersection_drop_lat) if booking.intersection_drop_lat else None,
#                     "lng": float(booking.intersection_drop_lon) if booking.intersection_drop_lon else None
#                 } if booking.intersection_drop_lat and booking.intersection_drop_lon else None
#             }
#         }
        
#         return response_data
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"Error in get_ride_from_booking: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=f"Error fetching ride details: {str(e)}")
# @router.get("/booking/{booking_id}/completed-details")
# def get_completed_ride_details(booking_id: int, db: Session = Depends(get_db)):
#     """Get detailed information for a completed ride (for rating screen)"""
#     try:
#         booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#         if not booking:
#             raise HTTPException(status_code=404, detail="Booking not found")
        
#         ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#         if not ride:
#             raise HTTPException(status_code=404, detail="Ride not found")
        
#         # Get rider session if exists
#         rider_session = db.query(RideSessionRider).filter(
#             RideSessionRider.booking_id == booking_id
#         ).first()
        
#         # Check if rating already given
#         rating_given = rider_session.rider_rating is not None if rider_session else False
        
#         return {
#             "success": True,
#             "completed_at": ride.completed_at.isoformat() if ride.completed_at else None,
#             "total_amount": float(booking.total_amount) if booking.total_amount else None,
#             "price_per_seat": float(ride.price_per_seat) if ride.price_per_seat else None,
#             "seats": booking.seats_booked,
#             "distance_km": float(ride.distance_km) if ride.distance_km else None,
#             "duration_text": ride.duration_text,
#             "driver_rating_given": rating_given,
#             "driver_rating": rider_session.rider_rating if rider_session else None,
#             "driver_feedback": rider_session.rider_feedback if rider_session else None,
#             "boarding_time": rider_session.boarded_at.isoformat() if rider_session and rider_session.boarded_at else None,
#             "dropoff_time": rider_session.dropped_off_at.isoformat() if rider_session and rider_session.dropped_off_at else None,
#             "ride_duration_minutes": None  # Calculate if needed
#         }
        
#     except Exception as e:
#         print(f"Error in get_completed_ride_details: {str(e)}")
#         return {"success": False, "error": str(e)}
# # Add these endpoints to your existing ride.py

# @router.get("/ride-sessions/driver/{ride_id}/riders")
# def get_driver_session_riders(
#     ride_id: int, 
#     driver_phone: str, 
#     db: Session = Depends(get_db)
# ):
#     """Get driver's active ride session with individual QR codes for each rider"""
#     driver_phone = normalize_phone(driver_phone)
    
#     session = db.query(RideSession).filter(
#         RideSession.ride_id == ride_id,
#         RideSession.driver_phone == driver_phone,
#         RideSession.status.in_(["driver_started", "boarding", "en_route"])
#     ).order_by(RideSession.id.desc()).first()
    
#     if not session:
#         raise HTTPException(status_code=404, detail="No active ride session found")
    
#     # Generate individual QR tokens for each rider if not already generated
#     for rider in session.riders:
#         if rider.status == "accepted" and not rider.individual_qr_token:
#             rider.individual_qr_token = secrets.token_hex(16)
#             rider.qr_expires_at = datetime.now(timezone.utc) + timedelta(hours=2)
    
#     db.commit()
#     db.refresh(session)
    
#     riders_data = []
#     for rider in session.riders:
#         riders_data.append({
#             "id": rider.id,
#             "booking_id": rider.booking_id,
#             "rider_name": rider.rider_name or f"Rider {rider.rider_phone[-4:]}",
#             "rider_phone": rider.rider_phone,
#             "rider_photo": rider.rider_photo,
#             "status": rider.status,
#             "individual_qr_token": rider.individual_qr_token,
#             "qr_expires_at": rider.qr_expires_at.isoformat() if rider.qr_expires_at else None,
#             "pickup_location": rider.pickup_location,
#             "dropoff_location": rider.dropoff_location,
#             "seats_booked": rider.seats_booked or 1,
#             "price_paid": float(rider.price_paid) if rider.price_paid else None
#         })
    
#     return {
#         "session_id": session.id,
#         "ride_id": ride_id,
#         "session_status": session.status,
#         "current_phase": session.current_phase,
#         "total_riders": len(session.riders),
#         "boarded_count": sum(1 for r in session.riders if r.status in ["boarded", "dropped_off", "completed"]),
#         "dropped_count": sum(1 for r in session.riders if r.status in ["dropped_off", "completed"]),
#         "riders": riders_data,
#         "qr_code_token": session.qr_code_token  # Master QR token (optional)
#     }

# @router.post("/ride-sessions/rider/board-by-token")
# def rider_board_by_token(payload: dict, db: Session = Depends(get_db)):
#     """
#     Rider boards by scanning individual QR code
#     Each rider has their own unique QR token
#     """
#     from sqlalchemy.orm import joinedload
#     from datetime import datetime, timezone
#     import secrets
    
#     try:
#         individual_token = payload.get("qr_code_token")
#         rider_phone = normalize_phone(payload.get("rider_phone", ""))
#         booking_id = payload.get("booking_id")
        
#         print(f"📱 Boarding by token: token={individual_token[:20] if individual_token else 'None'}..., phone={rider_phone}, booking={booking_id}")
        
#         if not individual_token:
#             raise HTTPException(status_code=400, detail="QR code token is required")
        
#         # ✅ FIX: Include both 'accepted' AND 'reached_pickup' status
#         rider = db.query(RideSessionRider).options(
#             joinedload(RideSessionRider.session)
#         ).filter(
#             RideSessionRider.individual_qr_token == individual_token,
#             RideSessionRider.status.in_(["accepted", "reached_pickup"])  # ← ADD reached_pickup
#         ).first()
        
#         if not rider:
#             # Try to find by booking ID if provided
#             if booking_id:
#                 rider = db.query(RideSessionRider).options(
#                     joinedload(RideSessionRider.session)
#                 ).filter(
#                     RideSessionRider.booking_id == booking_id,
#                     RideSessionRider.status.in_(["accepted", "reached_pickup"])  # ← ADD reached_pickup
#                 ).first()
                
#                 if rider and rider.individual_qr_token == individual_token:
#                     pass  # Found matching rider
#                 else:
#                     raise HTTPException(status_code=404, detail="Invalid QR code or rider not found")
#             else:
#                 raise HTTPException(status_code=404, detail="Invalid QR code or rider not found")
        
#         # Check if QR code is expired
#         if rider.qr_expires_at and rider.qr_expires_at < datetime.now(timezone.utc):
#             # Generate new token
#             rider.individual_qr_token = secrets.token_hex(16)
#             rider.qr_expires_at = datetime.now(timezone.utc) + timedelta(hours=2)
#             db.commit()
#             raise HTTPException(
#                 status_code=400, 
#                 detail="QR code expired. Please ask the driver to refresh the QR code."
#             )
        
#         # Check if already boarded
#         if rider.status in ["boarded", "dropped_off", "completed"]:
#             return {
#                 "success": True,
#                 "message": f"Rider already {rider.status}",
#                 "already_boarded": True,
#                 "rider_status": rider.status,
#                 "session_id": rider.session_id
#             }
        
#         # Board the rider
#         now = datetime.now(timezone.utc)
#         rider.status = "boarded"
#         rider.boarded_at = now
#         rider.pickup_confirmed = True
        
#         # Update session counts
#         session = rider.session
#         boarded_count = sum(1 for r in session.riders if r.status in ["boarded", "dropped_off", "completed"])
#         total_riders = len(session.riders)
        
#         # Update session phase
#         if boarded_count == total_riders:
#             session.current_phase = "en_route"
#             session.status = "en_route"
#         else:
#             session.current_phase = "boarding"
#             session.status = "boarding"
        
#         db.commit()
        
#         print(f"✅ Rider {rider.rider_name} boarded successfully. Phase: {session.current_phase}")
        
#         # Send notifications
#         try:
#             emit_to_user(session.driver_phone, "rider-boarded", {
#                 "booking_id": rider.booking_id,
#                 "rider_phone": rider.rider_phone,
#                 "rider_name": rider.rider_name or "Rider",
#                 "boarded_count": boarded_count,
#                 "total_riders": total_riders,
#                 "session_id": session.id
#             })
            
#             emit_to_user(rider.rider_phone, "boarding-confirmed", {
#                 "session_id": session.id,
#                 "booking_id": rider.booking_id,
#                 "message": "You have successfully boarded the vehicle"
#             })
#         except Exception as e:
#             print(f"⚠️ Socket error (non-critical): {e}")
        
#         return {
#             "success": True,
#             "message": "Boarding successful",
#             "rider_status": rider.status,
#             "session_status": session.status,
#             "current_phase": session.current_phase,
#             "boarded_count": boarded_count,
#             "total_riders": total_riders,
#             "session_id": session.id
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"💥 Error in rider_board_by_token: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Error boarding rider: {str(e)}")
# @router.post("/ride-sessions/{session_id}/refresh-rider-qr/{rider_id}")
# def refresh_rider_qr_code(
#     session_id: int, 
#     rider_id: int, 
#     payload: dict,
#     db: Session = Depends(get_db)
# ):
#     """Refresh individual QR code for a specific rider"""
#     driver_phone = normalize_phone(payload.get("driver_phone", ""))
    
#     # Verify session belongs to driver
#     session = db.query(RideSession).filter(
#         RideSession.id == session_id,
#         RideSession.driver_phone == driver_phone
#     ).first()
    
#     if not session:
#         raise HTTPException(status_code=404, detail="Session not found or unauthorized")
    
#     # Find the rider
#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.id == rider_id,
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.status == "accepted"
#     ).first()
    
#     if not rider:
#         raise HTTPException(status_code=404, detail="Rider not found or already boarded")
    
#     # Generate new QR token
#     rider.individual_qr_token = secrets.token_hex(16)
#     rider.qr_expires_at = datetime.now(timezone.utc) + timedelta(hours=2)
#     db.commit()
    
#     return {
#         "success": True,
#         "message": "QR code refreshed successfully",
#         "rider_id": rider.id,
#         "booking_id": rider.booking_id,
#         "rider_name": rider.rider_name,
#         "individual_qr_token": rider.individual_qr_token,
#         "qr_expires_at": rider.qr_expires_at.isoformat()
#     }


# @router.get("/ride-sessions/rider/session-status/{booking_id}")
# def get_rider_session_status_v2(
#     booking_id: int, 
#     rider_phone: str,
#     db: Session = Depends(get_db)
# ):
#     """Get rider's session status with better error handling"""
#     rider_phone = normalize_phone(rider_phone)
    
#     # Find rider session
#     rider_session = db.query(RideSessionRider).options(
#         joinedload(RideSessionRider.session)
#     ).filter(
#         RideSessionRider.booking_id == booking_id,
#         RideSessionRider.rider_phone == rider_phone
#     ).first()
    
#     if not rider_session:
#         return {
#             "success": False,
#             "message": "No active session found",
#             "has_session": False,
#             "ride_completed": False,
#             "has_rated_driver": False
#         }
    
#     session = rider_session.session
#     ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
    
#     # Get driver info
#     driver = db.query(User).filter(User.phone_number == session.driver_phone).first()
    
#     return {
#         "success": True,
#         "has_session": True,
#         "session_id": session.id,
#         "booking_id": booking_id,
#         "ride_id": session.ride_id,
#         "rider_status": rider_session.status,
#         "session_status": session.status,
#         "current_phase": session.current_phase,
#         "has_rated_driver": rider_session.rider_rating is not None,
#         "driver_rating": rider_session.rider_rating,
#         "ride_completed": session.status == "completed" or rider_session.status == "completed",
#         "driver_name": driver.full_name if driver else "Driver",
#         "driver_phone": session.driver_phone,
#         "driver_photo": driver.profile_picture if driver else None,
#         "driver_rating_avg": float(driver.avg_rating) if driver and driver.avg_rating else 4.5,
#         "origin": ride.origin if ride else None,
#         "destination": ride.destination if ride else None,
#         "pickup_lat": rider_session.pickup_lat,
#         "pickup_lng": rider_session.pickup_lng,
#         "dropoff_lat": rider_session.dropoff_lat,
#         "dropoff_lng": rider_session.dropoff_lng,
#         "current_driver_lat": session.current_lat,
#         "current_driver_lng": session.current_lng,
#         "route_coordinates": ride.route_coordinates if ride else []
#     }


# @router.post("/ride-sessions/{session_id}/sync")
# def sync_session_state(
#     session_id: int,
#     payload: dict,
#     db: Session = Depends(get_db)
# ):
#     """Sync session state - used for recovery after disconnection"""
#     driver_phone = normalize_phone(payload.get("driver_phone", ""))
    
#     session = db.query(RideSession).filter(
#         RideSession.id == session_id,
#         RideSession.driver_phone == driver_phone
#     ).first()
    
#     if not session:
#         raise HTTPException(status_code=404, detail="Session not found")
    
#     # Recalculate counts
#     boarded_count = sum(1 for r in session.riders if r.status in ["boarded", "dropped_off", "completed"])
#     dropped_count = sum(1 for r in session.riders if r.status in ["dropped_off", "completed"])
#     total_riders = len(session.riders)
    
#     # Update phase if needed
#     if session.current_phase == "boarding" and boarded_count == total_riders:
#         session.current_phase = "en_route"
#         session.status = "en_route"
#         db.commit()
#     elif session.current_phase == "en_route" and dropped_count == total_riders:
#         # Don't auto-complete, wait for driver
#         pass
    
#     riders_data = []
#     for rider in session.riders:
#         riders_data.append({
#             "id": rider.id,
#             "booking_id": rider.booking_id,
#             "rider_name": rider.rider_name,
#             "rider_phone": rider.rider_phone,
#             "status": rider.status,
#             "individual_qr_token": rider.individual_qr_token,
#             "boarded_at": rider.boarded_at.isoformat() if rider.boarded_at else None,
#             "dropped_off_at": rider.dropped_off_at.isoformat() if rider.dropped_off_at else None
#         })
    
#     return {
#         "success": True,
#         "session_id": session.id,
#         "session_status": session.status,
#         "current_phase": session.current_phase,
#         "boarded_count": boarded_count,
#         "dropped_count": dropped_count,
#         "total_riders": total_riders,
#         "current_lat": session.current_lat,
#         "current_lng": session.current_lng,
#         "riders": riders_data
#     }@router.post("/ride-sessions/{session_id}/complete-force")
# def complete_ride_force(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Driver forcefully completes the ride - marks all pending riders as completed"""
#     driver_phone = normalize_phone(payload.get("driver_phone", ""))
    
#     session = db.query(RideSession).filter(
#         RideSession.id == session_id,
#         RideSession.driver_phone == driver_phone
#     ).first()
    
#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")
    
#     # Mark all incomplete riders as completed automatically
#     completed_count = 0
#     for rider in session.riders:
#         if rider.status not in ["completed", "dropped_off"]:
#             rider.status = "completed"
#             rider.completed_at = datetime.now(timezone.utc)
#             completed_count += 1
    
#     session.status = "completed"
#     session.current_phase = "completed"
#     session.completed_at = datetime.now(timezone.utc)
    
#     ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
#     if ride:
#         ride.status = "completed"
    
#     db.commit()
    
#     return {
#         "message": "Ride completed successfully",
#         "status": session.status,
#         "completed_riders": completed_count,
#         "total_riders": len(session.riders)
#     }
# @router.post("/booking/{booking_id}/rate")
# def rate_rider_from_booking(
#     booking_id: int, 
#     payload: dict, 
#     db: Session = Depends(get_db)
# ):
#     """Rate a rider from a completed ride (when session is no longer active)"""
#     try:
#         rating = payload.get("rating")
#         feedback = payload.get("feedback", "")
        
#         if rating < 1 or rating > 5:
#             raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
#         # Find the booking
#         booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#         if not booking:
#             raise HTTPException(status_code=404, detail="Booking not found")
        
#         # Find the rider in RideSessionRider (if exists)
#         rider_session = db.query(RideSessionRider).filter(
#             RideSessionRider.booking_id == booking_id
#         ).first()
        
#         if rider_session:
#             # Update existing session rider
#             if rider_session.driver_rating is not None:
#                 raise HTTPException(status_code=400, detail="Rating already submitted")
            
#             rider_session.driver_rating = rating
#             rider_session.driver_feedback = feedback
#         else:
#             # Create a rating record (you may need a separate ratings table)
#             # For now, just store in booking or create a new record
#             booking.driver_rating = rating
#             booking.driver_feedback = feedback
        
#         db.commit()
        
#         return {"message": "Rider rated successfully", "rating": rating}
        
#     except Exception as e:
#         print(f"Error rating rider: {str(e)}")
#         db.rollback()
#         raise HTTPException(status_code=500, detail=str(e))
# @router.get("/booking/{booking_id}/session")
# def get_session_from_booking(booking_id: int, db: Session = Depends(get_db)):
#     """Get the session ID for a booking (for rating after completion)"""
#     try:
#         rider_session = db.query(RideSessionRider).filter(
#             RideSessionRider.booking_id == booking_id
#         ).first()
        
#         if not rider_session:
#             return {"session_id": None, "message": "No session found for this booking"}
        
#         return {
#             "session_id": rider_session.session_id,
#             "booking_id": booking_id,
#             "rider_status": rider_session.status,
#             "already_rated": rider_session.driver_rating is not None
#         }
        
#     except Exception as e:
#         print(f"Error getting session from booking: {str(e)}")
#         return {"session_id": None, "error": str(e)}
# from pydantic import BaseModel, Field

# class RideFeedbackCreate(BaseModel):
#     ride_booking_id: int = Field(..., description="Booking ID for the ride")
#     rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
#     comment: Optional[str] = Field(None, description="Optional feedback comment")

# # Add this function to get current user from header
# async def get_current_user_from_header(
#     x_phone_number: Optional[str] = Header(None, alias="X-Phone-Number"),
#     db: Session = Depends(get_db)
# ):
#     """Get current user from X-Phone-Number header"""
#     if not x_phone_number:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="X-Phone-Number header required",
#         )
    
#     normalized_phone = normalize_phone(x_phone_number)
#     user = db.query(User).filter(User.phone_number == normalized_phone).first()
    
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="User not found"
#         )
    
#     return user

# # POST endpoint for rating
# @router.post("/api/v1/ride-feedback")
# async def create_ride_feedback(
#     feedback: RideFeedbackCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user_from_header)
# ):
#     """Submit rating for a ride"""
    
#     print(f"📝 Received feedback: {feedback}")
#     print(f"👤 Current user: {current_user.phone_number}")
    
#     # Check if booking exists
#     booking = db.query(RideBooking).filter(RideBooking.id == feedback.ride_booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")
    
#     print(f"📖 Booking found: ID={booking.id}, passenger={booking.passenger_phone}")
    
#     # Check if user is the passenger
#     if booking.passenger_phone != current_user.phone_number:
#         raise HTTPException(status_code=403, detail="Not authorized to rate this ride")
    
#     # Check if already rated
#     existing_feedback = db.query(RideFeedback).filter(
#         RideFeedback.ride_booking_id == feedback.ride_booking_id,
#         RideFeedback.feedback_by_user_id == current_user.id
#     ).first()
    
#     if existing_feedback:
#         raise HTTPException(status_code=400, detail="You have already rated this ride")
    
#     # Get the driver (ride owner)
#     ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     driver = db.query(User).filter(User.phone_number == ride.phone_number).first()
#     if not driver:
#         raise HTTPException(status_code=404, detail="Driver not found")
    
#     print(f"🚗 Driver: {driver.phone_number} (ID: {driver.id})")
    
#     # Create feedback
#     new_feedback = RideFeedback(
#         ride_booking_id=feedback.ride_booking_id,
#         feedback_by_user_id=current_user.id,
#         feedback_for_user_id=driver.id,
#         rating=feedback.rating,
#         comment=feedback.comment,
#         created_at=datetime.now(timezone.utc)
#     )
    
#     db.add(new_feedback)
    
#     # Update driver's average rating
#     all_feedback = db.query(RideFeedback).filter(
#         RideFeedback.feedback_for_user_id == driver.id
#     ).all()
    
#     if all_feedback:
#         avg_rating = sum(f.rating for f in all_feedback) / len(all_feedback)
#         driver.avg_rating = round(avg_rating, 1)
#         driver.total_ratings = len(all_feedback)
    
#     db.commit()
    
#     return {"success": True, "message": "Rating submitted successfully"}

# # GET endpoint for fetching driver rating
# @router.get("/api/v1/ride-feedback/driver/{booking_id}")
# async def get_driver_feedback_for_ride(
#     booking_id: int,
#     db: Session = Depends(get_db)
# ):
#     """Get the rating that the driver received for this specific ride"""
    
#     print(f"🔍 Fetching driver feedback for booking: {booking_id}")
    
#     # Get the booking
#     booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#     if not booking:
#         return {"success": False, "message": "Booking not found"}
    
#     # Get the ride to find the driver
#     ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#     if not ride:
#         return {"success": False, "message": "Ride not found"}
    
#     # Find driver user
#     driver = db.query(User).filter(User.phone_number == ride.phone_number).first()
#     if not driver:
#         return {"success": False, "message": "Driver not found"}
    
#     # Find feedback for the driver on this specific ride
#     feedback = db.query(RideFeedback).filter(
#         RideFeedback.feedback_for_user_id == driver.id,
#         RideFeedback.ride_booking_id == booking_id
#     ).first()
    
#     if feedback:
#         print(f"⭐ Found feedback: rating={feedback.rating}, comment={feedback.comment}")
#         return {
#             "success": True,
#             "feedback": {
#                 "rating": feedback.rating,
#                 "comment": feedback.comment,
#                 "created_at": feedback.created_at.isoformat() if feedback.created_at else None
#             }
#         }
    
#     print("❌ No feedback found for this ride")
#     return {"success": False, "message": "No feedback found"}
# @router.get("/booking/{booking_id}/modification-available")
# def check_modification_available(booking_id: int, db: Session = Depends(get_db)):
#     """Check if user can request modification (one-time check)"""
#     try:
#         booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#         if not booking:
#             return {
#                 "available": False, 
#                 "reason": "Booking not found",
#                 "code": "NOT_FOUND"
#             }
        
#         # Check if user has already made ANY modification request
#         existing_modification = db.query(ModificationRequest).filter(
#             ModificationRequest.booking_id == booking_id
#         ).first()
        
#         if existing_modification:
#             return {
#                 "available": False,
#                 "reason": f"You have already submitted a modification request (Status: {existing_modification.status}). One modification only per booking.",
#                 "code": "ALREADY_MODIFIED",
#                 "modification": {
#                     "id": existing_modification.id,
#                     "requested_seats": existing_modification.requested_seats,
#                     "current_seats": existing_modification.current_seats,
#                     "status": existing_modification.status
#                 }
#             }
        
#         ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#         if not ride:
#             return {"available": False, "reason": "Ride not found", "code": "RIDE_NOT_FOUND"}
        
#         if ride.started_at:
#             return {"available": False, "reason": "Ride has already started", "code": "RIDE_STARTED"}
        
#         if booking.status != "accepted":
#             return {"available": False, "reason": "Booking is not confirmed", "code": "BOOKING_NOT_CONFIRMED"}
        
#         return {
#             "available": True,
#             "message": "You can request one modification for this booking",
#             "current_seats": booking.seats_booked
#         }
        
#     except Exception as e:
#         return {"available": False, "reason": str(e), "code": "ERROR"}
# @router.get("/ride/{ride_id}/refresh-seats")
# def refresh_seat_count(ride_id: int, db: Session = Depends(get_db)):
#     """Force refresh seat count for a ride"""
#     try:
#         ride = db.query(Ride).filter(Ride.id == ride_id).first()
#         if not ride:
#             return {"success": False, "message": "Ride not found"}
        
#         total_booked = get_total_booked_seats(db, ride_id)
#         remaining_seats = ride.available_seats - total_booked
        
#         print(f"🔄 Refresh seats for ride {ride_id}: Total={ride.available_seats}, Booked={total_booked}, Remaining={remaining_seats}")
        
#         # Update ride status if needed
#         old_status = ride.status
#         if remaining_seats == 0 and ride.status == "active":
#             ride.status = "full"
#             db.commit()
#             print(f"   Status changed: {old_status} -> full")
#         elif remaining_seats > 0 and ride.status == "full":
#             ride.status = "active"
#             db.commit()
#             print(f"   Status changed: {old_status} -> active")
        
#         return {
#             "success": True,
#             "ride_id": ride_id,
#             "available_seats": ride.available_seats,
#             "total_booked": total_booked,
#             "remaining_seats": remaining_seats,
#             "status": ride.status
#         }
#     except Exception as e:
#         print(f"Error in refresh_seat_count: {str(e)}")
#         return {"success": False, "message": str(e)}
# @router.get("/debug/modification-request/{request_id}")
# def debug_modification_request(request_id: int, db: Session = Depends(get_db)):
#     """Debug endpoint to check modification request status"""
#     try:
#         mod_request = db.query(ModificationRequest).filter(
#             ModificationRequest.id == request_id
#         ).first()
        
#         if not mod_request:
#             return {"error": "Modification request not found"}
        
#         booking = db.query(RideBooking).filter(
#             RideBooking.id == mod_request.booking_id
#         ).first()
        
#         ride = db.query(Ride).filter(Ride.id == mod_request.ride_id).first()
        
#         total_booked = get_total_booked_seats(db, ride.id) if ride else 0
#         remaining_seats = ride.available_seats - total_booked if ride else 0
        
#         return {
#             "modification_request": {
#                 "id": mod_request.id,
#                 "status": mod_request.status,
#                 "is_active": mod_request.is_active,
#                 "booking_id": mod_request.booking_id,
#                 "current_seats": mod_request.current_seats,
#                 "requested_seats": mod_request.requested_seats,
#                 "created_at": mod_request.created_at.isoformat() if mod_request.created_at else None,
#                 "rejected_at": mod_request.rejected_at.isoformat() if mod_request.rejected_at else None,
#                 "rejection_reason": mod_request.rejection_reason
#             },
#             "booking": {
#                 "id": booking.id if booking else None,
#                 "status": booking.status if booking else None,
#                 "seats_booked": booking.seats_booked if booking else None,
#                 "passenger_phone": booking.passenger_phone if booking else None
#             },
#             "ride": {
#                 "id": ride.id if ride else None,
#                 "total_seats": ride.available_seats if ride else None,
#                 "status": ride.status if ride else None,
#                 "total_booked": total_booked,
#                 "remaining_seats": remaining_seats
#             }
#         }
#     except Exception as e:
#         return {"error": str(e)}
# @router.post("/fix-rejected-modifications")
# def fix_rejected_modifications(db: Session = Depends(get_db)):
#     """
#     Fix rejected modification requests that didn't cancel their bookings
#     This will find all rejected modification requests that still have active bookings
#     """
#     try:
#         print("🔧 ========== STARTING FIX FOR REJECTED MODIFICATIONS ==========")
        
#         # Find all rejected modification requests that are still active
#         bad_mod_requests = db.query(ModificationRequest).filter(
#             ModificationRequest.status == "rejected",
#             ModificationRequest.is_active == True
#         ).all()
        
#         fixed_count = 0
#         fixed_bookings = []
        
#         for mod_request in bad_mod_requests:
#             print(f"\n🔍 Processing modification request {mod_request.id}")
            
#             # Get associated booking
#             booking = db.query(RideBooking).filter(
#                 RideBooking.id == mod_request.booking_id
#             ).first()
            
#             if not booking:
#                 print(f"   ⚠️ Booking {mod_request.booking_id} not found")
#                 continue
            
#             print(f"   📍 Booking ID: {booking.id}, Current status: {booking.status}, Seats: {booking.seats_booked}")
            
#             # Check if booking is still accepted (should be cancelled)
#             if booking.status == "accepted" and booking.seats_booked > 0:
#                 original_seats = booking.seats_booked
                
#                 # Cancel the booking
#                 booking.status = "cancelled"
#                 booking.seats_booked = 0
#                 booking.cancellation_reason = f"Auto-fix: Modification request {mod_request.id} was rejected but booking not cancelled"
#                 booking.updated_at = datetime.now(timezone.utc)
                
#                 # Mark modification request as inactive
#                 mod_request.is_active = False
#                 mod_request.updated_at = datetime.now(timezone.utc)
                
#                 fixed_bookings.append({
#                     "modification_request_id": mod_request.id,
#                     "booking_id": booking.id,
#                     "seats_released": original_seats,
#                     "passenger_phone": booking.passenger_phone
#                 })
                
#                 fixed_count += 1
#                 print(f"   ✅ Fixed: Cancelled booking {booking.id}, released {original_seats} seat(s)")
#             else:
#                 # Just mark modification as inactive
#                 mod_request.is_active = False
#                 mod_request.updated_at = datetime.now(timezone.utc)
#                 print(f"   ℹ️ Booking already cancelled, just marked mod request inactive")
        
#         # Update ride statuses for affected rides
#         affected_ride_ids = set()
#         for fix in fixed_bookings:
#             booking = db.query(RideBooking).filter(RideBooking.id == fix["booking_id"]).first()
#             if booking:
#                 affected_ride_ids.add(booking.ride_id)
        
#         ride_updates = []
#         for ride_id in affected_ride_ids:
#             ride = db.query(Ride).filter(Ride.id == ride_id).first()
#             if ride:
#                 total_booked = get_total_booked_seats(db, ride.id)
#                 remaining_seats = ride.available_seats - total_booked
                
#                 old_status = ride.status
#                 if remaining_seats == 0 and ride.status == "active":
#                     ride.status = "full"
#                 elif remaining_seats > 0 and ride.status == "full":
#                     ride.status = "active"
                
#                 ride.updated_at = datetime.now(timezone.utc)
                
#                 ride_updates.append({
#                     "ride_id": ride_id,
#                     "old_status": old_status,
#                     "new_status": ride.status,
#                     "remaining_seats": remaining_seats
#                 })
                
#                 print(f"   🚗 Updated ride {ride_id}: {old_status} -> {ride.status}, {remaining_seats} seats available")
        
#         db.commit()
        
#         # Send socket notifications for fixed rides
#         for ride_id in affected_ride_ids:
#             ride = db.query(Ride).filter(Ride.id == ride_id).first()
#             if ride:
#                 total_booked = get_total_booked_seats(db, ride.id)
#                 remaining_seats = ride.available_seats - total_booked
                
#                 try:
#                     emit_to_ride(ride_id, "seats-released", {
#                         "ride_id": ride_id,
#                         "seats_released": sum(f["seats_released"] for f in fixed_bookings if f.get("ride_id") == ride_id),
#                         "new_available_seats": remaining_seats,
#                         "message": f"System fix: {remaining_seats} seat(s) are now available!"
#                     })
#                 except Exception as e:
#                     print(f"   ⚠️ Socket error for ride {ride_id}: {e}")
        
#         print(f"\n✅ ========== FIX COMPLETED ==========")
#         print(f"   Fixed {fixed_count} rejected modification requests")
#         print(f"   Updated {len(affected_ride_ids)} rides")
        
#         return {
#             "success": True,
#             "message": f"Fixed {fixed_count} rejected modification requests",
#             "fixed_modifications": fixed_count,
#             "updated_rides": len(affected_ride_ids),
#             "details": {
#                 "fixed_bookings": fixed_bookings,
#                 "ride_updates": ride_updates
#             }
#         }
        
#     except Exception as e:
#         print(f"❌ Error in fix_rejected_modifications: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         db.rollback()
#         return {"success": False, "message": str(e)}
# # Pydantic model for ride request
# class RideRequestAlert(BaseModel):
#     from_location: str
#     to_location: str
#     from_coords: Optional[List[float]] = None
#     to_coords: Optional[List[float]] = None
#     preferred_date: Optional[datetime] = None
#     preferred_time: Optional[str] = None
#     seats_needed: int = 1
#     passenger_phone: str
#     passenger_name: Optional[str] = None
#     passenger_email: str
#     notes: Optional[str] = None

# def send_ride_available_email_azure(to_email: str, passenger_name: str, ride_data: dict) -> bool:
#     """Send email notification using Azure Communication Services when a matching ride is posted"""
    
#     from azure.communication.email import EmailClient
#     from azure.core.exceptions import HttpResponseError

#     AZURE_EMAIL_CONNECTION_STRING = os.getenv("AZURE_EMAIL_CONNECTION_STRING")
#     AZURE_EMAIL_FROM = "DoNotReply@drivve.in"
    
#     if not AZURE_EMAIL_CONNECTION_STRING:
#         print("❌ Azure Email connection string not configured")
#         return False
    
#     if not to_email or '@' not in to_email:
#         print(f"❌ Invalid email address: {to_email}")
#         return False
    
#     try:
#         print(f"📧 Initializing Azure Email client...")
#         email_client = EmailClient.from_connection_string(AZURE_EMAIL_CONNECTION_STRING)
        
#         # Format the date nicely
#         departure_time = ride_data.get('departure_time_display', 'Flexible')
        
#         # Generate deep link URL (update with your app's scheme)
#         deep_link = f"drivve://ride/{ride_data.get('ride_id')}"
        
#         html_content = f"""
#         <html>
#             <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
#                 <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px;">
                    
#                     <!-- Header -->
#                     <div style="text-align: center; margin-bottom: 30px;">
#                         <h2 style="color: #ED7117; margin-top: 10px;">🚗 Ride Available!</h2>
#                     </div>
                    
#                     <!-- Greeting -->
#                     <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
#                         Hey {passenger_name or 'there'},
#                     </p>
                    
#                     <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
#                         Good news! A ride matching your requested route has been posted:
#                     </p>
                    
#                     <!-- Ride Details Card -->
#                     <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #ED7117;">
#                         <div style="margin-bottom: 15px;">
#                             <div style="display: flex; align-items: center; margin-bottom: 10px;">
#                                 <span style="font-size: 20px; margin-right: 10px;">📍</span>
#                                 <div>
#                                     <div style="font-size: 12px; color: #6b7280;">FROM</div>
#                                     <div style="font-weight: bold; color: #111827;">{ride_data.get('origin', 'N/A')}</div>
#                                 </div>
#                             </div>
#                             <div style="display: flex; align-items: center;">
#                                 <span style="font-size: 20px; margin-right: 10px;">🎯</span>
#                                 <div>
#                                     <div style="font-size: 12px; color: #6b7280;">TO</div>
#                                     <div style="font-weight: bold; color: #111827;">{ride_data.get('destination', 'N/A')}</div>
#                                 </div>
#                             </div>
#                         </div>
                        
#                         <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 10px;">
#                             <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
#                                 <span style="color: #6b7280;">📅 Date & Time</span>
#                                 <span style="font-weight: 600;">{departure_time}</span>
#                             </div>
#                             <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
#                                 <span style="color: #6b7280;">💺 Seats Available</span>
#                                 <span style="font-weight: 600;">{ride_data.get('seats_available', 'Check app')} seats</span>
#                             </div>
#                             <div style="display: flex; justify-content: space-between;">
#                                 <span style="color: #6b7280;">💰 Price</span>
#                                 <span style="font-weight: 600; color: #ED7117;">₹{ride_data.get('price_per_seat', 'Check app')} per seat</span>
#                             </div>
#                         </div>
#                     </div>
                    
#                     <!-- CTA Button -->
#                     <div style="text-align: center; margin: 30px 0;">
#                         <a href="{deep_link}" 
#                            style="background-color: #ED7117; color: white; padding: 12px 30px; 
#                                   text-decoration: none; border-radius: 25px; display: inline-block;
#                                   font-weight: bold;">
#                             Book This Ride Now →
#                         </a>
#                     </div>
                    
#                     <!-- Footer -->
#                     <div style="text-align: center; border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 30px;">
#                         <p style="font-size: 12px; color: #9ca3af;">
#                             Safe travels!<br>
#                             <strong>Team Drivve</strong>
#                         </p>
#                     </div>
                    
#                 </div>
#             </body>
#         </html>
#         """
        
#         message = {
#             "senderAddress": AZURE_EMAIL_FROM,
#             "recipients": {
#                 "to": [{"address": to_email}]
#             },
#             "content": {
#                 "subject": f"🚗 Ride Available: {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', 'Available')[:50]}",
#                 "html": html_content
#             }
#         }
        
#         print(f"📤 Sending email to {to_email}...")
#         poller = email_client.begin_send(message)
#         result = poller.result()
#         print(f"✅ Ride alert email sent to {to_email}")
#         return True
        
#     except HttpResponseError as e:
#         print(f"❌ Azure HTTP Error: {e.message}")
#         return False
#     except Exception as e:
#         print(f"❌ Failed to send ride alert email: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return False

# @router.post("/request-ride-alert")
# def request_ride_alert(
#     request: RideRequestAlert,
#     db: Session = Depends(get_db)
# ):
#     """
#     Passenger requests email notification when a matching ride is posted
#     """
#     try:
#         normalized_phone = normalize_phone(request.passenger_phone)
        
#         # Check if user already has an active request for this exact route
#         existing_request = db.query(RideRequest).filter(
#             RideRequest.passenger_phone == normalized_phone,
#             func.lower(RideRequest.from_location) == func.lower(request.from_location),
#             func.lower(RideRequest.to_location) == func.lower(request.to_location),
#             RideRequest.status == "active",
#             RideRequest.expires_at > datetime.now(timezone.utc)
#         ).first()
        
#         if existing_request:
#             return {
#                 "success": False,
#                 "message": "You already have an active request for this route. We'll notify you when a ride is available.",
#                 "request_id": existing_request.id,
#                 "expires_at": existing_request.expires_at.isoformat()
#             }
        
#         # Calculate expiry (7 days from now)
#         expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
#         # Create new request
#         new_request = RideRequest(
#             passenger_phone=normalized_phone,
#             passenger_name=request.passenger_name,
#             passenger_email=request.passenger_email,
#             from_location=request.from_location,
#             to_location=request.to_location,
#             from_lat=request.from_coords[1] if request.from_coords and len(request.from_coords) >= 2 else None,
#             from_lon=request.from_coords[0] if request.from_coords and len(request.from_coords) >= 2 else None,
#             to_lat=request.to_coords[1] if request.to_coords and len(request.to_coords) >= 2 else None,
#             to_lon=request.to_coords[0] if request.to_coords and len(request.to_coords) >= 2 else None,
#             preferred_date=request.preferred_date,
#             preferred_time=request.preferred_time,
#             seats_needed=request.seats_needed,
#             notes=request.notes,
#             status="active",
#             expires_at=expires_at
#         )
        
#         db.add(new_request)
#         db.commit()
#         db.refresh(new_request)
        
#         # Also check if there's already a matching ride (in case one was just posted)
#         check_and_notify_immediate_match(db, new_request)
        
#         return {
#             "success": True,
#             "message": "Ride request alert created successfully. We'll email you when a matching ride is posted.",
#             "request_id": new_request.id,
#             "expires_at": expires_at.isoformat()
#         }
        
#     except Exception as e:
#         print(f"Error creating ride request alert: {str(e)}")
#         db.rollback()
#         raise HTTPException(status_code=500, detail=str(e))
# def check_and_notify_immediate_match(db: Session, ride_request: RideRequest):
#     """Check if there's already a matching ride for this request"""
#     try:
#         # Get request time in IST
#         req_pref = ride_request.preferred_date
#         if req_pref:
#             if req_pref.tzinfo is None:
#                 req_time_ist = req_pref
#             else:
#                 req_time_ist = req_pref.astimezone(timezone(timedelta(hours=5, minutes=30)))
#         else:
#             req_time_ist = None
        
#         # Find matching active rides
#         now_utc = datetime.now(timezone.utc)
#         matching_rides = db.query(Ride).filter(
#             Ride.status.in_(["active", "full"]),
#             Ride.departure_time > now_utc
#         ).all()
        
#         for ride in matching_rides:
#             # Check location match
#             ride_from = ride.origin.split(',')[0].strip().lower()
#             ride_to = ride.destination.split(',')[0].strip().lower()
#             req_from = ride_request.from_location.split(',')[0].strip().lower()
#             req_to = ride_request.to_location.split(',')[0].strip().lower()
            
#             from_match = (ride_from == req_from or ride_from in req_from or req_from in ride_from)
#             to_match = (ride_to == req_to or ride_to in req_to or req_to in ride_to)
            
#             if not (from_match and to_match):
#                 continue
            
#             # Check time match
#             if req_time_ist:
#                 # Convert ride time to IST
#                 ride_time_utc = ride.departure_time
#                 if ride_time_utc.tzinfo is None:
#                     ride_time_utc = ride_time_utc.replace(tzinfo=timezone.utc)
#                 ride_time_ist = ride_time_utc + timedelta(hours=5, minutes=30)
                
#                 time_diff_hours = abs((ride_time_ist - req_time_ist).total_seconds() / 3600)
                
#                 if time_diff_hours > 6:
#                     continue
            
#             # Check seats
#             total_booked = get_total_booked_seats(db, ride.id)
#             available_seats = ride.available_seats - total_booked
            
#             if available_seats < ride_request.seats_needed:
#                 continue
            
#             # Send notification
#             ride_data = {
#                 "ride_id": ride.id,
#                 "origin": ride.origin,
#                 "destination": ride.destination,
#                 "departure_time_display": (ride.departure_time + timedelta(hours=5, minutes=30)).strftime("%d %b %Y, %I:%M %p"),
#                 "seats_available": available_seats,
#                 "price_per_seat": ride.price_per_seat,
#                 "request_date": ride_request.created_at.strftime("%d %b %Y")
#             }
            
#             send_ride_available_email_azure(
#                 ride_request.passenger_email,
#                 ride_request.passenger_name,
#                 ride_data
#             )
            
#             ride_request.status = "notified"
#             ride_request.notified_at = datetime.now(timezone.utc)
#             db.commit()
#             print(f"✅ Immediate notification sent for ride {ride.id}")
#             return True
            
#     except Exception as e:
#         print(f"Error checking immediate match: {str(e)}")
#         return False
# def check_matching_ride_requests(db: Session, ride: Ride):
#     """Check for matching ride requests when a new ride is posted"""
#     try:
#         print(f"\n🔍 ========== CHECKING MATCHING RIDE REQUESTS ==========")
        
#         # ✅ Convert ride departure time to IST for comparison
#         ride_time_ist = to_ist(ride.departure_time)
        
#         print(f"🚗 New ride posted:")
#         print(f"   From: {ride.origin[:50]}")
#         print(f"   To: {ride.destination[:50]}")
#         print(f"   Departure (IST): {ride_time_ist.strftime('%Y-%m-%d %H:%M:%S')}")
#         print(f"   Departure (IST display): {ride_time_ist.strftime('%d %b %Y, %I:%M %p')}")
        
#         # Normalize locations
#         ride_from = ride.origin.split(',')[0].strip().lower()
#         ride_to = ride.destination.split(',')[0].strip().lower()
        
#         # Find active ride requests
#         now_utc = datetime.now(timezone.utc)
#         active_requests = db.query(RideRequest).filter(
#             RideRequest.status == "active",
#             RideRequest.expires_at > now_utc
#         ).all()
        
#         print(f"\n📋 Found {len(active_requests)} active ride requests")
        
#         notified_count = 0
        
#         for req in active_requests:
#             print(f"\n--- Checking Request #{req.id} ---")
            
#             # Normalize request locations
#             req_from = req.from_location.split(',')[0].strip().lower()
#             req_to = req.to_location.split(',')[0].strip().lower()
            
#             # Check location match (flexible matching)
#             from_match = (ride_from == req_from or ride_from in req_from or req_from in ride_from)
#             to_match = (ride_to == req_to or ride_to in req_to or req_to in ride_to)
            
#             if not (from_match and to_match):
#                 print(f"   ❌ Location mismatch")
#                 print(f"   Request: {req_from} → {req_to}")
#                 print(f"   Ride: {ride_from} → {ride_to}")
#                 continue
            
#             print(f"   ✅ Location matched")
            
#             # ✅ FIX: Time comparison in IST
#             time_match = True
#             time_diff_hours = 0
            
#             if req.preferred_date:
#                 # Convert request preferred date to IST
#                 req_time_ist = to_ist(req.preferred_date)
                
#                 print(f"   Request preferred (IST): {req_time_ist.strftime('%Y-%m-%d %H:%M:%S')}")
#                 print(f"   Request display: {req_time_ist.strftime('%d %b %Y, %I:%M %p')}")
#                 print(f"   Ride departure (IST): {ride_time_ist.strftime('%Y-%m-%d %H:%M:%S')}")
                
#                 # Calculate difference in hours
#                 time_diff = abs((ride_time_ist - req_time_ist).total_seconds() / 3600)
#                 time_diff_hours = time_diff
                
#                 print(f"   Time difference: {time_diff_hours:.2f} hours")
                
#                 # 6-hour window (can adjust based on your needs)
#                 if time_diff_hours > 6:
#                     print(f"   ❌ Time difference too large (>6 hours)")
#                     time_match = False
#                 else:
#                     print(f"   ✅ Time within 6-hour window")
#             else:
#                 print(f"   ⏰ No preferred time specified - matching any time")
            
#             if not time_match:
#                 continue
            
#             # Check seats availability
#             total_booked = get_total_booked_seats(db, ride.id)
#             available_seats = ride.available_seats - total_booked
            
#             print(f"   Seats needed: {req.seats_needed}, Available: {available_seats}")
            
#             if available_seats < req.seats_needed:
#                 print(f"   ❌ Not enough seats available")
#                 continue
            
#             # Check if email exists
#             if not req.passenger_email or '@' not in req.passenger_email:
#                 print(f"   ❌ No valid email address for this request")
#                 continue
            
#             # Prepare ride data for email (all times in IST)
#             ride_data = {
#                 "ride_id": ride.id,
#                 "origin": ride.origin,
#                 "destination": ride.destination,
#                 "departure_time_display": ride_time_ist.strftime("%d %b %Y, %I:%M %p"),
#                 "seats_available": available_seats,
#                 "price_per_seat": ride.price_per_seat,
#                 "request_date": to_ist(req.created_at).strftime("%d %b %Y")
#             }
            
#             print(f"\n📧 SENDING EMAIL NOTIFICATION:")
#             print(f"   To: {req.passenger_email}")
#             print(f"   Name: {req.passenger_name or 'User'}")
#             print(f"   Ride: {ride.origin[:50]} → {ride.destination[:50]}")
#             print(f"   Time: {ride_data['departure_time_display']}")
#             print(f"   Seats: {available_seats}")
#             print(f"   Price: ₹{ride.price_per_seat}/seat")
            
#             # Send the email
#             email_sent = send_ride_available_email_azure(
#                 req.passenger_email,
#                 req.passenger_name or "there",
#                 ride_data
#             )
            
#             if email_sent:
#                 # Update request status
#                 req.status = "notified"
#                 req.notified_at = datetime.now(timezone.utc)
#                 notified_count += 1
#                 print(f"   ✅ Email sent successfully!")
#             else:
#                 print(f"   ❌ Failed to send email")
        
#         if notified_count > 0:
#             db.commit()
#             print(f"\n✅ Total notifications sent: {notified_count}")
#         else:
#             print(f"\n📭 No matching requests found")
#             # Debug: Show Azure email configuration status
#             azure_configured = bool(os.getenv('AZURE_EMAIL_CONNECTION_STRING'))
#             print(f"   Azure Email configured: {'Yes' if azure_configured else 'No'}")
        
#         print(f"🔍 ==================================\n")
#         return notified_count
        
#     except Exception as e:
#         print(f"❌ Error in check_matching_ride_requests: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return 0
# @router.get("/my-ride-requests/{phone_number}")
# def get_user_ride_requests(
#     phone_number: str,
#     db: Session = Depends(get_db)
# ):
#     """Get all ride requests for a user"""
#     try:
#         normalized_phone = normalize_phone(phone_number)
        
#         requests = db.query(RideRequest).filter(
#             RideRequest.passenger_phone == normalized_phone
#         ).order_by(RideRequest.created_at.desc()).all()
        
#         return {
#             "success": True,
#             "requests": [
#                 {
#                     "id": req.id,
#                     "from_location": req.from_location,
#                     "to_location": req.to_location,
#                     "preferred_date": req.preferred_date.isoformat() if req.preferred_date else None,
#                     "preferred_time": req.preferred_time,
#                     "seats_needed": req.seats_needed,
#                     "status": req.status,
#                     "created_at": req.created_at.isoformat(),
#                     "expires_at": req.expires_at.isoformat() if req.expires_at else None,
#                     "notified_at": req.notified_at.isoformat() if req.notified_at else None,
#                     "notes": req.notes
#                 }
#                 for req in requests
#             ]
#         }
        
#     except Exception as e:
#         print(f"Error getting ride requests: {str(e)}")
#         return {"success": False, "requests": [], "error": str(e)}

# @router.delete("/ride-request/{request_id}")
# def cancel_ride_request(
#     request_id: int,
#     phone_number: str,
#     db: Session = Depends(get_db)
# ):
#     """Cancel an active ride request"""
#     try:
#         normalized_phone = normalize_phone(phone_number)
        
#         ride_request = db.query(RideRequest).filter(
#             RideRequest.id == request_id,
#             RideRequest.passenger_phone == normalized_phone
#         ).first()
        
#         if not ride_request:
#             raise HTTPException(status_code=404, detail="Ride request not found")
        
#         if ride_request.status != "active":
#             raise HTTPException(status_code=400, detail=f"Cannot cancel request that is already {ride_request.status}")
        
#         ride_request.status = "cancelled"
#         ride_request.cancelled_at = datetime.now(timezone.utc)
#         db.commit()
        
#         return {
#             "success": True,
#             "message": "Ride request cancelled successfully"
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"Error cancelling ride request: {str(e)}")
#         db.rollback()
#         raise HTTPException(status_code=500, detail=str(e))


# @router.post("/ride-requests/cleanup-expired")
# def cleanup_expired_ride_requests(db: Session = Depends(get_db)):
#     """Admin endpoint to mark expired ride requests"""
#     try:
#         expired_requests = db.query(RideRequest).filter(
#             RideRequest.status == "active",
#             RideRequest.expires_at < datetime.now(timezone.utc)
#         ).all()
        
#         expired_count = 0
#         for req in expired_requests:
#             req.status = "expired"
#             expired_count += 1
        
#         db.commit()
        
#         return {
#             "success": True,
#             "message": f"Marked {expired_count} expired ride requests",
#             "expired_count": expired_count
#         }
        
#     except Exception as e:
#         print(f"Error cleaning up expired requests: {str(e)}")
#         return {"success": False, "error": str(e)}
# import os
# import secrets
# from fastapi import APIRouter, Depends, HTTPException, Query, Header, status
# from sqlalchemy.orm import Session, joinedload
# from sqlalchemy import func, text, and_, or_
# from database import get_db
# from models import Ride, RideBooking, ModificationRequest, RideFeedback, RideRequest, User, UserNotification, NotificationType, Vehicle, RideSession, RideSessionRider
# from datetime import datetime, timezone, timedelta
# from pydantic import BaseModel, field_validator
# from typing import Optional, Dict, List
# import math
# import re
# import uuid
# import random
# import string

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

# # ============================================
# # AZURE EMAIL NOTIFICATION HELPERS
# # ============================================

# def get_user_email(db: Session, phone_number: str) -> Optional[str]:
#     """Get registered email for a user"""
#     user = db.query(User).filter(User.phone_number == phone_number).first()
#     if user and user.email:
#         return user.email
#     return None
# def send_email_notification_azure(to_email: str, subject: str, html_content: str) -> bool:
#     """Send email notification using Azure Communication Services"""
#     print(f"📧 EMAIL DEBUG: Attempting to send to {to_email}")
#     print(f"📧 EMAIL DEBUG: Subject: {subject}")
    
#     try:
#         from azure.communication.email import EmailClient
#         from azure.core.exceptions import HttpResponseError
#         print(f"📧 EMAIL DEBUG: Azure packages imported successfully")
#     except ImportError as e:
#         print(f"❌ EMAIL DEBUG: Azure package not installed: {e}")
#         return False

#     AZURE_EMAIL_CONNECTION_STRING = os.getenv("AZURE_EMAIL_CONNECTION_STRING")
#     AZURE_EMAIL_FROM = os.getenv("AZURE_EMAIL_FROM", "DoNotReply@drivve.in")
    
#     print(f"📧 EMAIL DEBUG: Connection string present: {bool(AZURE_EMAIL_CONNECTION_STRING)}")
#     print(f"📧 EMAIL DEBUG: From email: {AZURE_EMAIL_FROM}")
    
#     if not AZURE_EMAIL_CONNECTION_STRING:
#         print("❌ Azure Email connection string not configured")
#         return False
    
#     if not to_email or '@' not in to_email:
#         print(f"❌ Invalid email address: {to_email}")
#         return False
    
#     try:
#         print(f"📧 EMAIL DEBUG: Creating EmailClient...")
#         email_client = EmailClient.from_connection_string(AZURE_EMAIL_CONNECTION_STRING)
        
#         message = {
#             "senderAddress": AZURE_EMAIL_FROM,
#             "recipients": {
#                 "to": [{"address": to_email}]
#             },
#             "content": {
#                 "subject": subject,
#                 "html": html_content
#             }
#         }
        
#         print(f"📧 EMAIL DEBUG: Sending email...")
#         poller = email_client.begin_send(message)
#         result = poller.result()
#         print(f"✅ Email sent to {to_email}")
#         return True
        
#     except Exception as e:
#         print(f"❌ Failed to send email: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return False

# def send_ride_notification_email(
#     to_email: str, 
#     user_name: str, 
#     ride_data: dict, 
#     notification_type: str,
#     booking_id: int = None,
#     ride_id: int = None
# ) -> bool:
#     """Send ride-related email notification"""
    
#     if notification_type == "booking_accepted":
#         subject = f"✅ Booking Confirmed - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
#         html_content = f"""
#         <html>
#             <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
#                 <div style="background: linear-gradient(135deg, #ED7117, #FF8C42); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
#                     <h2 style="color: white; margin: 0;">✅ Booking Confirmed!</h2>
#                 </div>
#                 <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
#                     <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
#                     <p>Great news! Your booking has been <strong style="color: #ED7117;">accepted</strong> by the driver.</p>
                    
#                     <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
#                         <p><strong>🚗 Ride Details:</strong></p>
#                         <p>📍 <strong>From:</strong> {ride_data.get('origin', 'N/A')}</p>
#                         <p>🎯 <strong>To:</strong> {ride_data.get('destination', 'N/A')}</p>
#                         <p>📅 <strong>Departure:</strong> {ride_data.get('departure_time_display', 'N/A')}</p>
#                         <p>💺 <strong>Seats:</strong> {ride_data.get('seats', 'N/A')}</p>
#                         <p>💰 <strong>Total Amount:</strong> ₹{ride_data.get('total_amount', 'N/A')}</p>
#                     </div>
                    
#                     <p>You can track your ride status in the app.</p>
#                     <p>Safe travels! 🚀</p>
#                 </div>
#             </body>
#         </html>
#         """
    
#     elif notification_type == "ride_cancelled":
#         subject = f"❌ Ride Cancelled - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
#         html_content = f"""
#         <html>
#             <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
#                 <div style="background: linear-gradient(135deg, #dc3545, #c82333); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
#                     <h2 style="color: white; margin: 0;">❌ Ride Cancelled</h2>
#                 </div>
#                 <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
#                     <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
#                     <p>We regret to inform you that the ride has been <strong style="color: #dc3545;">cancelled</strong>.</p>
                    
#                     <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
#                         <p><strong>🚗 Ride Details:</strong></p>
#                         <p>📍 <strong>From:</strong> {ride_data.get('origin', 'N/A')}</p>
#                         <p>🎯 <strong>To:</strong> {ride_data.get('destination', 'N/A')}</p>
#                         <p>📅 <strong>Departure:</strong> {ride_data.get('departure_time_display', 'N/A')}</p>
#                     </div>
                    
#                     <p><strong>Cancellation Reason:</strong> {ride_data.get('cancellation_reason', 'Cancelled by driver')}</p>
                    
#                     <p>Your payment will be refunded within 3-5 business days.</p>
#                     <p>You can search for alternative rides in the app.</p>
#                 </div>
#             </body>
#         </html>
#         """
    
#     elif notification_type == "modification_approved":
#         subject = f"🔄 Seat Modification Approved - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
#         html_content = f"""
#         <html>
#             <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
#                 <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
#                     <h2 style="color: white; margin: 0;">🔄 Seat Modification Approved</h2>
#                 </div>
#                 <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
#                     <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
#                     <p>Your seat modification request has been <strong style="color: #28a745;">approved</strong>!</p>
                    
#                     <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
#                         <p><strong>📊 Seat Changes:</strong></p>
#                         <p>🪑 <strong>Old Seats:</strong> {ride_data.get('old_seats', 'N/A')}</p>
#                         <p>🪑 <strong>New Seats:</strong> {ride_data.get('new_seats', 'N/A')}</p>
#                         <p>💰 <strong>New Total:</strong> ₹{ride_data.get('new_total', 'N/A')}</p>
#                     </div>
                    
#                     <p>Your booking has been updated in the app.</p>
#                 </div>
#             </body>
#         </html>
#         """
    
#     elif notification_type == "booking_cancelled":
#         subject = f"❌ Booking Cancelled - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
#         html_content = f"""
#         <html>
#             <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
#                 <div style="background: linear-gradient(135deg, #dc3545, #c82333); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
#                     <h2 style="color: white; margin: 0;">❌ Booking Cancelled</h2>
#                 </div>
#                 <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
#                     <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
#                     <p>Your booking has been <strong style="color: #dc3545;">cancelled</strong>.</p>
                    
#                     <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
#                         <p><strong>🚗 Ride Details:</strong></p>
#                         <p>📍 <strong>From:</strong> {ride_data.get('origin', 'N/A')}</p>
#                         <p>🎯 <strong>To:</strong> {ride_data.get('destination', 'N/A')}</p>
#                         <p>💺 <strong>Seats:</strong> {ride_data.get('seats', 'N/A')}</p>
#                     </div>
                    
#                     <p><strong>Reason:</strong> {ride_data.get('cancellation_reason', 'Driver declined modification request')}</p>
#                 </div>
#             </body>
#         </html>
#         """
    
#     else:
#         # Default notification
#         subject = f"🚗 Ride Update - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
#         html_content = f"""
#         <html>
#             <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
#                 <div style="background: linear-gradient(135deg, #ED7117, #FF8C42); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
#                     <h2 style="color: white; margin: 0;">🚗 Ride Update</h2>
#                 </div>
#                 <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
#                     <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
#                     <p>{ride_data.get('message', 'Your ride has been updated.')}</p>
                    
#                     <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
#                         <p>📍 <strong>{ride_data.get('origin', 'N/A')}</strong> → <strong>{ride_data.get('destination', 'N/A')}</strong></p>
#                         <p>📅 <strong>Departure:</strong> {ride_data.get('departure_time_display', 'N/A')}</p>
#                     </div>
                    
#                     <p>Open the app for more details.</p>
#                 </div>
#             </body>
#         </html>
#         """
    
#     return send_email_notification_azure(to_email, subject, html_content)


# def to_ist(dt: datetime) -> datetime:
#     """Convert datetime to IST timezone (UTC+5:30)"""
#     if dt is None:
#         return dt
#     if dt.tzinfo is None:
#         dt = dt.replace(tzinfo=timezone.utc)
#     ist = timezone(timedelta(hours=5, minutes=30))
#     return dt.astimezone(ist)


# def now_ist() -> datetime:
#     """Get current time in IST"""
#     return datetime.now(timezone.utc).astimezone(IST)


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


# def generate_custom_ride_id():
#     """Generate ride ID in format: R + 4 digits + 2 letters (e.g., R1234TH)"""
#     digits = ''.join(str(random.randint(0, 9)) for _ in range(4))
#     letters = ''.join(random.choices(string.ascii_uppercase, k=2))
#     return f"R{digits}{letters}"


# def generate_custom_booking_id():
#     """Generate booking ID in format: B + 4 digits + 2 letters (e.g., B7655GT)"""
#     digits = ''.join(str(random.randint(0, 9)) for _ in range(4))
#     letters = ''.join(random.choices(string.ascii_uppercase, k=2))
#     return f"B{digits}{letters}"


# def generate_unique_ride_id(db: Session, retries: int = 5):
#     """Generate a unique ride ID that doesn't exist in the database"""
#     for _ in range(retries):
#         ride_id = generate_custom_ride_id()
#         existing = db.query(Ride).filter(Ride.custom_ride_id == ride_id).first()
#         if not existing:
#             return ride_id
#     return f"R{int(datetime.now().timestamp())}{random.choice(string.ascii_uppercase)}{random.choice(string.ascii_uppercase)}"


# def generate_unique_booking_id(db: Session, retries: int = 5):
#     """Generate a unique booking ID that doesn't exist in the database"""
#     for _ in range(retries):
#         booking_id = generate_custom_booking_id()
#         existing = db.query(RideBooking).filter(RideBooking.custom_booking_id == booking_id).first()
#         if not existing:
#             return booking_id
#     return f"B{int(datetime.now().timestamp())}{random.choice(string.ascii_uppercase)}{random.choice(string.ascii_uppercase)}"


# def parse_duration_to_minutes(duration_str: Optional[str]) -> int:
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
#     R = 6371
#     dlat = math.radians(lat2 - lat1)
#     dlon = math.radians(lon2 - lon1)
#     a = math.sin(dlat/2) * math.sin(dlat/2) + \
#         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
#         math.sin(dlon/2) * math.sin(dlon/2)
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
#     return R * c


# def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
#     R = 6371000
#     phi1 = math.radians(lat1)
#     phi2 = math.radians(lat2)
#     dphi = math.radians(lat2 - lat1)
#     dlambda = math.radians(lon2 - lon1)
#     a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
#     return R * c


# def get_total_booked_seats(db: Session, ride_id: int) -> int:
#     """Get total booked seats for a ride (only accepted bookings)"""
#     result = db.query(func.sum(RideBooking.seats_booked)).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status == "accepted"
#     ).scalar()
#     return result or 0


# def get_available_seats(db: Session, ride_id: int) -> int:
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         return 0
#     total_booked = get_total_booked_seats(db, ride_id)
#     return max(0, ride.available_seats - total_booked)


# def find_nearest_route_vertex(route_coords: List[List[float]], lng: float, lat: float) -> Optional[Dict]:
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


# # ============================================
# # PYDANTIC MODELS
# # ============================================

# class ModifySeatsRequest(BaseModel):
#     new_seats: int
#     pickup_address: Optional[str] = None
#     dropoff_address: Optional[str] = None
#     pickup_place_name: Optional[str] = None
#     dropoff_place_name: Optional[str] = None


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
#     pickup_address: Optional[str] = None
#     dropoff_address: Optional[str] = None
#     pickup_place_name: Optional[str] = None
#     dropoff_place_name: Optional[str] = None

#     @field_validator("from_coords", "to_coords")
#     @classmethod
#     def validate_optional_coords(cls, value):
#         if value is None:
#             return value
#         if len(value) != 2:
#             raise ValueError("Coordinates must contain exactly [lng, lat]")
#         return value


# class ModificationRequestSchema(BaseModel):
#     requested_seats: int


# # ============================================
# # HELPER FUNCTIONS FOR OVERLAP CHECKS
# # ============================================

# def check_overlapping_bookings_for_passenger(db: Session, phone_number: str, departure_time: datetime, duration_minutes: int, exclude_booking_id: Optional[int] = None) -> Optional[Dict]:
#     """Check if passenger has overlapping active/accepted bookings"""
    
#     departure_time_utc = departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
    
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
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


# def check_overlapping_rides_for_driver(db: Session, phone_number: str, departure_time: datetime, duration_minutes: int, exclude_ride_id: Optional[int] = None) -> Optional[Dict]:
#     """Check if driver has overlapping active rides"""
    
#     departure_time_utc = departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
    
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
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


# # ============================================
# # RIDE ENDPOINTS
# # ============================================

# @router.post("/post-ride")
# def post_ride(data: CreateRideRequest, db: Session = Depends(get_db)):
#     normalized_phone = normalize_phone(data.phone_number)
#     duration_minutes = parse_duration_to_minutes(data.duration_text)
    
#     # Convert departure time to UTC for storage
#     departure_time = data.departure_time
    
#     if departure_time.tzinfo is None:
#         ist = timezone(timedelta(hours=5, minutes=30))
#         departure_time_ist = ist.localize(departure_time)
#         departure_time_utc = departure_time_ist.astimezone(timezone.utc)
#     else:
#         departure_time_utc = departure_time.astimezone(timezone.utc)
    
#     print(f"📅 Received departure time: {departure_time}")
#     print(f"📅 Converted to UTC: {departure_time_utc}")
#     print(f"📅 Back to IST: {to_ist(departure_time_utc)}")
    
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
#     custom_ride_id = generate_unique_ride_id(db)
    
#     # Check for passenger overlap
#     passenger_overlap = check_overlapping_bookings_for_passenger(db, normalized_phone, departure_time_utc, duration_minutes)
#     if passenger_overlap:
#         raise HTTPException(
#             status_code=409,
#             detail=f"You have a confirmed booking as a passenger from {passenger_overlap['origin']} to {passenger_overlap['destination']} at {to_ist(passenger_overlap['departure_time']).strftime('%I:%M %p')} that overlaps with this ride."
#         )
    
#     # Check for driver overlapping rides
#     overlapping = check_overlapping_rides_for_driver(db, normalized_phone, departure_time_utc, duration_minutes)
#     if overlapping:
#         end_time_ist = to_ist(overlapping["expected_end_time"])
#         raise HTTPException(
#             status_code=409,
#             detail=f"You already have an active ride from {overlapping['origin']} to {overlapping['destination']} at {to_ist(overlapping['departure_time']).strftime('%I:%M %p')}. Please wait until {end_time_ist.strftime('%I:%M %p')} to post another ride."
#         )
    
#     # Validate distance
#     distance = calculate_distance_km(
#         data.origin_coords[1], data.origin_coords[0],
#         data.destination_coords[1], data.destination_coords[0]
#     )
    
#     MIN_DISTANCE_KM = 3
#     MAX_DISTANCE_KM = 300
    
#     if distance < MIN_DISTANCE_KM:
#         raise HTTPException(status_code=400, detail=f"Pickup and destination are too close ({distance:.1f} km)")
#     if distance > MAX_DISTANCE_KM:
#         raise HTTPException(status_code=400, detail=f"Distance too far ({distance:.1f} km)")
    
#     # Validate time
#     min_departure_time = datetime.now(timezone.utc) + timedelta(minutes=30)
#     if departure_time_utc < min_departure_time:
#         min_time_ist = to_ist(min_departure_time)
#         raise HTTPException(status_code=400, detail=f"Departure time must be at least 30 minutes from now")
    
#     women_only = data.preferences.get('womenOnly', False) if data.preferences else data.women_only
    
#     ride = Ride(
#         custom_ride_id=custom_ride_id,
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
    
#     # ============================================
#     # SEND EMAIL NOTIFICATION TO DRIVER
#     # ============================================
#     try:
#         driver_email = get_user_email(db, normalized_phone)
#         print(f"📧 Driver email check for {normalized_phone}: {driver_email}")
        
#         if driver_email:
#             driver_name = get_user_email(db, normalized_phone)
            
#             email_ride_data = {
#                 "origin": ride.origin,
#                 "destination": ride.destination,
#                 "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
#                 "seats_available": ride.available_seats,
#                 "price_per_seat": ride.price_per_seat,
#                 "message": f"Your ride from {ride.origin} to {ride.destination} has been posted successfully!"
#             }
            
#             print(f"📧 Attempting to send ride posted email to: {driver_email}")
#             email_sent = send_ride_notification_email(
#                 driver_email,
#                 driver_name,
#                 email_ride_data,
#                 "ride_posted_driver",
#                 None,
#                 ride.id
#             )
#             print(f"📧 Email sent result: {email_sent}")
#         else:
#             print(f"⚠️ No email found for driver: {normalized_phone}")
#     except Exception as e:
#         print(f"❌ Failed to send ride posted email: {str(e)}")
#         import traceback
#         traceback.print_exc()
    
#     # Call matching function to notify passengers with saved requests
#     if ride.id:
#         check_matching_ride_requests(db, ride)
    
#     return {
#         "message": "Ride posted successfully", 
#         "ride_id": ride.id,
#         "custom_ride_id": ride.custom_ride_id
#     }

# @router.post("/ride-bookings")
# def create_ride_booking(data: CreateRideBookingRequest, db: Session = Depends(get_db)):
#     passenger_phone = normalize_phone(data.passenger_phone)
#     ride = db.query(Ride).filter(Ride.id == data.ride_id).first()
    
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
#     if ride.status not in ["active", "full"]:
#         raise HTTPException(status_code=400, detail="Ride is not available")
    
#     total_booked = get_total_booked_seats(db, ride.id)
#     remaining_seats = ride.available_seats - total_booked
    
#     if remaining_seats < data.seats_requested:
#         raise HTTPException(status_code=400, detail=f"Not enough seats available. Only {remaining_seats} seat(s) left.")
#     if ride.phone_number == passenger_phone:
#         raise HTTPException(status_code=400, detail="You cannot book your own ride")
    
#     existing_mod = db.query(ModificationRequest).filter(
#         ModificationRequest.ride_id == ride.id,
#         ModificationRequest.status == "pending"
#     ).first()
    
#     existing_accepted = db.query(RideBooking).filter(
#         RideBooking.ride_id == data.ride_id,
#         RideBooking.passenger_phone == passenger_phone,
#         RideBooking.status == "accepted"
#     ).first()
    
#     if existing_accepted:
#         raise HTTPException(status_code=400, detail="You already have a confirmed booking for this ride")
    
#     total_amount = ride.price_per_seat * data.seats_requested
#     custom_booking_id = generate_unique_booking_id(db)
    
#     pickup_lat = pickup_lon = drop_lat = drop_lon = None
#     int_pickup_lat = int_pickup_lon = int_drop_lat = int_drop_lon = None
#     pickup_walk_m = drop_walk_m = None
    
#     if data.from_coords and data.to_coords and ride.route_coordinates:
#         try:
#             pickup_pt = find_nearest_route_vertex(ride.route_coordinates, data.from_coords[0], data.from_coords[1])
#             drop_pt = find_nearest_route_vertex(ride.route_coordinates, data.to_coords[0], data.to_coords[1])
#             if pickup_pt:
#                 int_pickup_lon = pickup_pt["lng"]
#                 int_pickup_lat = pickup_pt["lat"]
#             if drop_pt:
#                 int_drop_lon = drop_pt["lng"]
#                 int_drop_lat = drop_pt["lat"]
#             pickup_lat = data.from_coords[1]
#             pickup_lon = data.from_coords[0]
#             drop_lat = data.to_coords[1]
#             drop_lon = data.to_coords[0]
            
#             if pickup_pt and data.from_coords:
#                 pickup_walk_m = int(haversine_m(pickup_lat, pickup_lon, int_pickup_lat, int_pickup_lon))
#             if drop_pt and data.to_coords:
#                 drop_walk_m = int(haversine_m(drop_lat, drop_lon, int_drop_lat, int_drop_lon))
#         except Exception as e:
#             print(f"⚠️ Intersection compute error: {e}")

#     booking = RideBooking(
#         custom_booking_id=custom_booking_id,
#         ride_id=data.ride_id,
#         passenger_phone=passenger_phone,
#         seats_booked=data.seats_requested,
#         total_amount=total_amount,
#         pickup_address=data.pickup_address,
#         dropoff_address=data.dropoff_address,
#         pickup_place_name=data.pickup_place_name,
#         dropoff_place_name=data.dropoff_place_name,
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
#     db.commit()
#     db.refresh(booking)

#     # In-app notification to driver
#     driver_phone = normalize_phone(ride.phone_number)
#     origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
#     dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
    
#     notification = UserNotification(
#         phone_number=driver_phone,
#         title="New Ride Request 🙋",
#         message=f"You received a request for {data.seats_requested} seat(s) for your ride from {origin_short} to {dest_short}.",
#         type=NotificationType.RIDE,  
#         action_type="booking",
#         action_value=str(booking.id),
#         is_read=False,
#         is_deleted=False
#     )
#     db.add(notification)
#     db.commit()
    
#     # Email notification to passenger (booking request sent)
#     try:
#         passenger_email = get_user_email(db, passenger_phone)
#         if passenger_email:
#             passenger_user = db.query(User).filter(User.phone_number == passenger_phone).first()
#             passenger_name = passenger_user.full_name or passenger_user.first_name or "there"
            
#             ride_data = {
#                 "origin": ride.origin,
#                 "destination": ride.destination,
#                 "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
#                 "seats": data.seats_requested,
#                 "total_amount": total_amount,
#                 "message": f"Your booking request for {data.seats_requested} seat(s) has been sent to the driver. You'll be notified when they respond."
#             }
#             send_ride_notification_email(passenger_email, passenger_name, ride_data, "booking_request", booking.id, ride.id)
#     except Exception as e:
#         print(f"Failed to send booking request email: {str(e)}")

#     return {
#         "message": "Ride request sent successfully", 
#         "booking_id": booking.id,
#         "custom_booking_id": booking.custom_booking_id,
#         "status": booking.status
#     }


# @router.post("/search-rides")
# def search_rides(data: SearchRidesRequest, db: Session = Depends(get_db)):
#     req_time_utc = data.departure_time
#     if req_time_utc.tzinfo is None:
#         req_time_utc = req_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         req_time_utc = req_time_utc.astimezone(timezone.utc)

#     query = db.query(Ride).filter(
#         Ride.status.in_(["active", "full"]),
#         Ride.departure_time.between(
#             req_time_utc - timedelta(minutes=TIME_WINDOW_MINUTES),
#             req_time_utc + timedelta(minutes=TIME_WINDOW_MINUTES)
#         )
#     )
    
#     if data.passenger_gender != 'female':
#         query = query.filter(Ride.women_only == False)

#     all_rides = query.all()
    
#     rides = []
    
#     for ride in all_rides:
#         total_booked = get_total_booked_seats(db, ride.id)
#         remaining_seats = max(0, ride.available_seats - total_booked)
        
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
            
#             if ride.route_coordinates:
#                 pickup_point = find_nearest_route_vertex(ride.route_coordinates, data.from_coords[0], data.from_coords[1])
#                 drop_point = find_nearest_route_vertex(ride.route_coordinates, data.to_coords[0], data.to_coords[1])
        
#         if pickup_distance_m > SEARCH_RADIUS_M * 2 or drop_distance_m > SEARCH_RADIUS_M * 2:
#             continue
        
#         pickup_score = max(0, 1 - (pickup_distance_m / SEARCH_RADIUS_M))
#         drop_score = max(0, 1 - (drop_distance_m / SEARCH_RADIUS_M))
#         time_diff_min = abs((ride.departure_time - req_time_utc).total_seconds()) / 60
#         time_score = max(0, 1 - (time_diff_min / 60))
#         match_percentage = round(100 * (0.35 * pickup_score + 0.35 * drop_score + 0.20 * time_score + 0.10))
        
#         driver = db.query(User).filter(User.phone_number == ride.phone_number).first()
#         driver_name = None
#         if driver:
#             driver_name = driver.full_name or " ".join(filter(None, [driver.first_name, driver.last_name]))
#         if not driver_name:
#             driver_name = f"Driver {ride.phone_number[-4:]}"
        
#         vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first() if ride.vehicle_id else None
        
#         departure_time_ist = to_ist(ride.departure_time)
        
#         rides.append({
#             "id": ride.id,
#             "driverName": driver_name,
#             "driverUserId": driver.user_id if driver else None,
#             "phoneNumber": ride.phone_number,
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
#             "price": ride.price_per_seat,
#             "matchPercentage": match_percentage,
#             "seatsAvailable": remaining_seats,
#             "totalSeats": ride.available_seats,
#             "bookedSeats": total_booked,
#             "distanceKm": ride.distance_km,
#             "durationText": ride.duration_text,
#             "routeCoordinates": ride.route_coordinates or [],
#             "status": ride.status,
#             "isFull": remaining_seats == 0,
#         })
    
#     rides.sort(key=lambda x: (-x["matchPercentage"]))
#     return {"rides": rides}


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
#         booking.status = "rejected"
#         db.commit()
#         raise HTTPException(status_code=400, detail="Not enough seats available anymore")

#     booking.status = "accepted"
    
#     total_booked_after = get_total_booked_seats(db, ride.id)
#     if ride.available_seats <= total_booked_after:
#         ride.status = "full"
    
#     db.commit()

#     # In-app notification to passenger
#     origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
#     dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
    
#     notification = UserNotification(
#         phone_number=booking.passenger_phone,
#         title="Booking Accepted! ✅",
#         message=f"Your request for {booking.seats_booked} seat(s) on the ride from {origin_short} to {dest_short} has been accepted by the driver.",
#         type=NotificationType.RIDE,
#         action_type="booking",
#         action_value=str(booking.id),
#         is_read=False,
#         is_deleted=False
#     )
#     db.add(notification)
#     db.commit()
    
#     # Email notification to passenger
#     try:
#         passenger_email = get_user_email(db, booking.passenger_phone)
#         if passenger_email:
#             passenger_user = db.query(User).filter(User.phone_number == booking.passenger_phone).first()
#             passenger_name = passenger_user.full_name or passenger_user.first_name or "there"
            
#             ride_data = {
#                 "origin": ride.origin,
#                 "destination": ride.destination,
#                 "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
#                 "seats": booking.seats_booked,
#                 "total_amount": booking.total_amount
#             }
#             send_ride_notification_email(passenger_email, passenger_name, ride_data, "booking_accepted", booking.id, ride.id)
#     except Exception as e:
#         print(f"Failed to send booking accepted email: {str(e)}")
    
#     # Socket event
#     emit_to_user(booking.passenger_phone, "booking-accepted", {
#         "booking_id": booking.id,
#         "ride_id": ride.id,
#         "message": f"Your booking for {booking.seats_booked} seat(s) has been accepted!"
#     })

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
    
#     # Email notification to passenger about rejection
#     try:
#         ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#         if ride:
#             passenger_email = get_user_email(db, booking.passenger_phone)
#             if passenger_email:
#                 passenger_user = db.query(User).filter(User.phone_number == booking.passenger_phone).first()
#                 passenger_name = passenger_user.full_name or passenger_user.first_name or "there"
                
#                 ride_data = {
#                     "origin": ride.origin,
#                     "destination": ride.destination,
#                     "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
#                     "seats": booking.seats_booked,
#                     "cancellation_reason": "Driver declined your booking request"
#                 }
#                 send_ride_notification_email(passenger_email, passenger_name, ride_data, "booking_cancelled", booking.id, ride.id)
#     except Exception as e:
#         print(f"Failed to send booking rejection email: {str(e)}")

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
    
#     # Email notification to passenger about cancellation
#     try:
#         passenger_email = get_user_email(db, booking.passenger_phone)
#         if passenger_email:
#             passenger_user = db.query(User).filter(User.phone_number == booking.passenger_phone).first()
#             passenger_name = passenger_user.full_name or passenger_user.first_name or "there"
            
#             ride_data = {
#                 "origin": ride.origin,
#                 "destination": ride.destination,
#                 "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
#                 "seats": booking.seats_booked,
#                 "cancellation_reason": "You cancelled your booking"
#             }
#             send_ride_notification_email(passenger_email, passenger_name, ride_data, "booking_cancelled", booking.id, ride.id)
#     except Exception as e:
#         print(f"Failed to send booking cancellation email: {str(e)}")

#     return {"message": "Booking cancelled successfully"}


# @router.put("/ride/{ride_id}/cancel")
# def cancel_ride(ride_id: int, db: Session = Depends(get_db)):
#     """Cancel a ride and update all related records"""
#     try:
#         ride = db.query(Ride).filter(Ride.id == ride_id).first()
#         if not ride:
#             raise HTTPException(status_code=404, detail="Ride not found")
        
#         if ride.started_at:
#             raise HTTPException(status_code=400, detail="Cannot cancel ride that has already started")
        
#         if ride.status == "completed":
#             raise HTTPException(status_code=400, detail="Cannot cancel completed ride")
        
#         if ride.status == "cancelled":
#             raise HTTPException(status_code=400, detail="Ride is already cancelled")
        
#         old_status = ride.status
#         ride.status = "cancelled"
        
#         if hasattr(ride, 'cancellation_reason'):
#             ride.cancellation_reason = "Cancelled by driver"
        
#         cancelled_modifications_count = 0
#         affected_passengers = []
        
#         # Cancel all pending modification requests
#         try:
#             pending_modifications = db.query(ModificationRequest).filter(
#                 ModificationRequest.ride_id == ride_id,
#                 ModificationRequest.status == "pending"
#             ).all()
            
#             for mod_request in pending_modifications:
#                 mod_request.status = "cancelled"
#                 if hasattr(mod_request, 'rejection_reason'):
#                     mod_request.rejection_reason = "Ride was cancelled by driver"
#                 cancelled_modifications_count += 1
                
#                 passenger_notification = UserNotification(
#                     phone_number=mod_request.passenger_phone,
#                     title="Modification Request Cancelled ❌",
#                     message=f"Your seat modification request for ride from {ride.origin} to {ride.destination} has been cancelled because the ride was cancelled.",
#                     type=NotificationType.RIDE,
#                     action_type="modification",
#                     action_value=str(mod_request.id),
#                     is_read=False,
#                     is_deleted=False
#                 )
#                 db.add(passenger_notification)
                
#                 emit_to_user(mod_request.passenger_phone, "modification-cancelled", {
#                     "ride_id": ride_id,
#                     "request_id": mod_request.id,
#                     "message": "Your modification request was cancelled because the ride was cancelled"
#                 })
#         except Exception as e:
#             print(f"Error processing modification requests: {str(e)}")
        
#         # Cancel all accepted bookings
#         accepted_bookings = db.query(RideBooking).filter(
#             RideBooking.ride_id == ride_id,
#             RideBooking.status == "accepted"
#         ).all()
        
#         for booking in accepted_bookings:
#             booking.status = "cancelled"
#             if hasattr(booking, 'cancellation_reason'):
#                 booking.cancellation_reason = "Ride cancelled by driver"
#             affected_passengers.append({
#                 "phone": booking.passenger_phone,
#                 "seats": booking.seats_booked,
#                 "booking_id": booking.id
#             })
            
#             origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
#             dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
            
#             notification = UserNotification(
#                 phone_number=booking.passenger_phone,
#                 title="Ride Cancelled ❌",
#                 message=f"Your booking for {booking.seats_booked} seat(s) on the ride from {origin_short} to {dest_short} has been cancelled by the driver.",
#                 type=NotificationType.RIDE,
#                 action_type="cancellation",
#                 action_value=str(ride.id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
            
#             emit_to_user(booking.passenger_phone, "booking-cancelled", {
#                 "ride_id": ride_id,
#                 "booking_id": booking.id,
#                 "message": f"Your booking for {booking.seats_booked} seat(s) has been cancelled",
#                 "origin": origin_short,
#                 "destination": dest_short
#             })
            
#             # Email notification to passenger
#             try:
#                 passenger_email = get_user_email(db, booking.passenger_phone)
#                 if passenger_email:
#                     passenger_user = db.query(User).filter(User.phone_number == booking.passenger_phone).first()
#                     passenger_name = passenger_user.full_name or passenger_user.first_name or "there"
                    
#                     email_ride_data = {
#                         "origin": ride.origin,
#                         "destination": ride.destination,
#                         "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
#                         "cancellation_reason": "Ride was cancelled by the driver"
#                     }
#                     send_ride_notification_email(passenger_email, passenger_name, email_ride_data, "ride_cancelled", booking.id, ride.id)
#             except Exception as e:
#                 print(f"Failed to send ride cancellation email: {str(e)}")
        
#         # Cancel all pending bookings
#         pending_bookings = db.query(RideBooking).filter(
#             RideBooking.ride_id == ride_id,
#             RideBooking.status == "pending"
#         ).all()
        
#         for booking in pending_bookings:
#             booking.status = "rejected"
#             if hasattr(booking, 'cancellation_reason'):
#                 booking.cancellation_reason = "Ride cancelled by driver"
            
#             notification = UserNotification(
#                 phone_number=booking.passenger_phone,
#                 title="Booking Request Cancelled ❌",
#                 message=f"Your booking request for {booking.seats_booked} seat(s) on the ride from {ride.origin} to {ride.destination} has been cancelled because the ride was cancelled.",
#                 type=NotificationType.RIDE,
#                 action_type="cancellation",
#                 action_value=str(ride.id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
            
#             emit_to_user(booking.passenger_phone, "booking-request-cancelled", {
#                 "ride_id": ride_id,
#                 "booking_id": booking.id,
#                 "message": "Your booking request was cancelled because the ride was cancelled"
#             })
        
#         # Email notification to driver about ride cancellation
#         try:
#             driver_email = get_user_email(db, ride.phone_number)
#             if driver_email:
#                 driver_user = db.query(User).filter(User.phone_number == ride.phone_number).first()
#                 driver_name = driver_user.full_name or driver_user.first_name or "there"
                
#                 email_ride_data = {
#                     "origin": ride.origin,
#                     "destination": ride.destination,
#                     "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
#                     "cancellation_reason": "You cancelled the ride",
#                     "message": f"Your ride from {ride.origin} to {ride.destination} has been cancelled."
#                 }
#                 send_ride_notification_email(driver_email, driver_name, email_ride_data, "ride_cancelled", None, ride.id)
#         except Exception as e:
#             print(f"Failed to send driver cancellation email: {str(e)}")
        
#         db.commit()
        
#         emit_to_ride(ride_id, "ride-cancelled", {
#             "ride_id": ride_id,
#             "message": f"Ride from {ride.origin} to {ride.destination} has been cancelled",
#             "cancelled_bookings": len(accepted_bookings),
#             "cancelled_modifications": cancelled_modifications_count
#         })
        
#         return {
#             "message": "Ride cancelled successfully",
#             "ride_id": ride_id,
#             "affected_passengers": len(accepted_bookings),
#             "cancelled_modifications": cancelled_modifications_count,
#             "cancelled_pending_bookings": len(pending_bookings),
#             "total_affected": len(accepted_bookings) + len(pending_bookings) + cancelled_modifications_count
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"Error in cancel_ride: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Error cancelling ride: {str(e)}")


# @router.post("/booking/{booking_id}/request-modification")
# async def request_modification(
#     booking_id: int,
#     request: ModificationRequestSchema,
#     db: Session = Depends(get_db)
# ):
#     """Request to modify seat count for a booking - ONE TIME ONLY"""
#     try:
#         booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#         if not booking:
#             return {"success": False, "message": "Booking not found"}
        
#         ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#         if not ride:
#             return {"success": False, "message": "Ride not found"}
        
#         if ride.started_at:
#             return {"success": False, "message": "Cannot modify seats - Ride has already started"}
        
#         if ride.cancellation_reason:
#             return {"success": False, "message": "Cannot modify seats - Ride has been cancelled"}
        
#         if booking.status != "accepted":
#             return {"success": False, "message": "Cannot modify seats - Booking is not confirmed yet"}
        
#         # Check for ANY existing modification request
#         existing_modification = db.query(ModificationRequest).filter(
#             ModificationRequest.booking_id == booking_id,
#             ModificationRequest.is_active == True
#         ).first()
        
#         if existing_modification:
#             if existing_modification.status == "pending":
#                 return {
#                     "success": False, 
#                     "message": "You already have a pending modification request. Please wait for driver's response.",
#                     "code": "PENDING_REQUEST_EXISTS",
#                     "existing_request": {
#                         "id": existing_modification.id,
#                         "requested_seats": existing_modification.requested_seats,
#                         "current_seats": existing_modification.current_seats,
#                         "status": existing_modification.status
#                     }
#                 }
#             else:
#                 return {
#                     "success": False, 
#                     "message": "You can only modify your seats once per booking. You have already submitted a modification request.",
#                     "code": "ALREADY_MODIFIED",
#                     "previous_request": {
#                         "id": existing_modification.id,
#                         "requested_seats": existing_modification.requested_seats,
#                         "current_seats": existing_modification.current_seats,
#                         "status": existing_modification.status,
#                         "approved_at": existing_modification.approved_at.isoformat() if existing_modification.approved_at else None,
#                         "rejected_at": existing_modification.rejected_at.isoformat() if existing_modification.rejected_at else None
#                     }
#                 }
        
#         historical_modification = db.query(ModificationRequest).filter(
#             ModificationRequest.booking_id == booking_id
#         ).first()
        
#         if historical_modification:
#             return {
#                 "success": False,
#                 "message": "You have already used your one-time modification for this booking. Further modifications are not allowed.",
#                 "code": "MODIFICATION_LIMIT_REACHED",
#                 "previous_request": {
#                     "id": historical_modification.id,
#                     "requested_seats": historical_modification.requested_seats,
#                     "status": historical_modification.status,
#                     "created_at": historical_modification.created_at.isoformat() if historical_modification.created_at else None
#                 }
#             }
        
#         total_booked = db.query(func.sum(RideBooking.seats_booked)).filter(
#             RideBooking.ride_id == ride.id,
#             RideBooking.status == "accepted"
#         ).scalar() or 0
        
#         other_booked = total_booked - booking.seats_booked
#         available_seats = ride.available_seats - other_booked
        
#         if request.requested_seats > available_seats:
#             return {"success": False, "message": f"Only {available_seats} seat(s) available"}
        
#         if request.requested_seats < 1:
#             return {"success": False, "message": "Minimum 1 seat required"}
        
#         if request.requested_seats == booking.seats_booked:
#             return {"success": False, "message": "No change in seat count"}
        
#         new_mod_request = ModificationRequest(
#             booking_id=booking_id,
#             ride_id=ride.id,
#             passenger_phone=booking.passenger_phone,
#             current_seats=booking.seats_booked,
#             requested_seats=request.requested_seats,
#             status="pending",
#             is_active=True,
#             created_at=datetime.now(timezone.utc)
#         )
        
#         db.add(new_mod_request)
#         db.commit()
#         db.refresh(new_mod_request)
        
#         # Notify driver via in-app notification
#         driver_notification = UserNotification(
#             phone_number=ride.phone_number,
#             title="Modification Request 🔄",
#             message=f"Passenger wants to change seats from {booking.seats_booked} to {request.requested_seats} seat(s).",
#             type=NotificationType.RIDE,
#             action_type="modification",
#             action_value=str(new_mod_request.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(driver_notification)
#         db.commit()
        
#         emit_to_user(ride.phone_number, "modification-request", {
#             "request_id": new_mod_request.id,
#             "booking_id": booking_id,
#             "current_seats": booking.seats_booked,
#             "requested_seats": request.requested_seats,
#             "passenger_phone": booking.passenger_phone
#         })
        
#         return {
#             "success": True, 
#             "message": "Modification request sent to driver (one-time modification only)",
#             "request": {
#                 "id": new_mod_request.id,
#                 "current_seats": new_mod_request.current_seats,
#                 "requested_seats": new_mod_request.requested_seats,
#                 "status": new_mod_request.status,
#                 "created_at": new_mod_request.created_at.isoformat() if new_mod_request.created_at else None,
#                 "is_active": new_mod_request.is_active
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


# @router.get("/ride/{ride_id}/pending-modifications")
# def get_pending_modifications_for_ride(ride_id: int, db: Session = Depends(get_db)):
#     """Get all pending modification requests for a ride (for driver)"""
#     try:
#         ride = db.query(Ride).filter(Ride.id == ride_id).first()
#         if not ride:
#             return {"success": False, "message": "Ride not found"}
        
#         now = datetime.now(timezone.utc)
#         minutes_since_departure = (now - ride.departure_time).total_seconds() / 60
#         modifications_locked = ride.started_at or (minutes_since_departure > 30)
        
#         pending_requests = db.query(ModificationRequest).filter(
#             ModificationRequest.ride_id == ride_id,
#             ModificationRequest.status == "pending"
#         ).order_by(ModificationRequest.created_at.desc()).all()
        
#         results = []
#         for req in pending_requests:
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
#     """Approve a modification request - updates booking seats"""
#     try:
#         mod_request = db.query(ModificationRequest).filter(
#             ModificationRequest.id == request_id,
#             ModificationRequest.is_active == True
#         ).first()
        
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
        
#         if ride.started_at:
#             mod_request.status = "rejected"
#             mod_request.rejection_reason = "Cannot modify - Ride has already started"
#             mod_request.is_active = False
#             db.commit()
#             return {"success": False, "message": "Cannot approve - Ride has already started"}
        
#         total_booked = get_total_booked_seats(db, ride.id)
#         other_booked = total_booked - booking.seats_booked
#         available_seats = ride.available_seats - other_booked
        
#         if mod_request.requested_seats > available_seats:
#             mod_request.status = "rejected"
#             mod_request.rejection_reason = f"Only {available_seats} seats available"
#             mod_request.is_active = False
#             db.commit()
#             return {"success": False, "message": f"Only {available_seats} seat(s) available"}
        
#         old_seats = booking.seats_booked
#         booking.seats_booked = mod_request.requested_seats
#         booking.total_amount = ride.price_per_seat * mod_request.requested_seats
        
#         mod_request.status = "approved"
#         mod_request.approved_at = datetime.now(timezone.utc)
        
#         db.commit()
        
#         # In-app notification to passenger
#         passenger_notification = UserNotification(
#             phone_number=booking.passenger_phone,
#             title="Modification Approved ✅",
#             message=f"Your seat change request from {old_seats} to {mod_request.requested_seats} seats has been approved!",
#             type=NotificationType.RIDE,
#             action_type="modification",
#             action_value=str(mod_request.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(passenger_notification)
#         db.commit()
        
#         # Email notification to passenger
#         try:
#             passenger_email = get_user_email(db, booking.passenger_phone)
#             if passenger_email:
#                 passenger_user = db.query(User).filter(User.phone_number == booking.passenger_phone).first()
#                 passenger_name = passenger_user.full_name or passenger_user.first_name or "there"
                
#                 ride_data = {
#                     "origin": ride.origin,
#                     "destination": ride.destination,
#                     "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
#                     "old_seats": old_seats,
#                     "new_seats": mod_request.requested_seats,
#                     "new_total": booking.total_amount
#                 }
#                 send_ride_notification_email(passenger_email, passenger_name, ride_data, "modification_approved", booking.id, ride.id)
#         except Exception as e:
#             print(f"Failed to send modification approval email: {str(e)}")
        
#         try:
#             emit_to_user(booking.passenger_phone, "modification-approved", {
#                 "booking_id": booking.id,
#                 "old_seats": old_seats,
#                 "new_seats": mod_request.requested_seats,
#                 "message": f"Your seat change request from {old_seats} to {mod_request.requested_seats} seats has been approved!"
#             })
#         except Exception as e:
#             print(f"Socket notification error: {e}")
        
#         return {
#             "success": True,
#             "message": f"Modification request approved. Seats updated from {old_seats} to {mod_request.requested_seats}.",
#             "booking_id": booking.id,
#             "old_seats": old_seats,
#             "new_seats": mod_request.requested_seats,
#             "new_total": booking.total_amount
#         }
        
#     except Exception as e:
#         print(f"Error in approve_modification_request: {str(e)}")
#         db.rollback()
#         return {"success": False, "message": str(e)}


# @router.put("/modification-request/{request_id}/reject")
# def reject_modification_request(request_id: int, db: Session = Depends(get_db)):
#     """Reject a modification request - THIS WILL CANCEL THE ORIGINAL BOOKING"""
#     try:
#         print(f"🚫 ========== STARTING REJECTION PROCESS ==========")
#         print(f"📝 Rejecting modification request ID: {request_id}")
        
#         mod_request = db.query(ModificationRequest).filter(
#             ModificationRequest.id == request_id
#         ).with_for_update().first()
        
#         if not mod_request:
#             print(f"❌ Modification request {request_id} not found")
#             return {"success": False, "message": "Modification request not found"}
        
#         print(f"✅ Found modification request: status={mod_request.status}, is_active={mod_request.is_active}")
        
#         if mod_request.status != "pending":
#             print(f"⚠️ Request already {mod_request.status}")
#             return {"success": False, "message": f"Request already {mod_request.status}"}
        
#         booking = db.query(RideBooking).filter(
#             RideBooking.id == mod_request.booking_id
#         ).with_for_update().first()
        
#         if not booking:
#             print(f"❌ Booking {mod_request.booking_id} not found")
#             return {"success": False, "message": "Associated booking not found"}
        
#         print(f"✅ Found booking: ID={booking.id}, status={booking.status}, seats={booking.seats_booked}")
        
#         ride = db.query(Ride).filter(Ride.id == mod_request.ride_id).with_for_update().first()
        
#         if not ride:
#             print(f"❌ Ride {mod_request.ride_id} not found")
#             return {"success": False, "message": "Ride not found"}
        
#         print(f"✅ Found ride: ID={ride.id}, total_seats={ride.available_seats}, status={ride.status}")
        
#         original_seats = booking.seats_booked
        
#         print(f"🔴 Rejecting modification request {request_id}")
#         print(f"   📍 Booking ID: {booking.id}, Original seats: {original_seats}")
#         print(f"   📍 Ride ID: {ride.id}, Total seats: {ride.available_seats}")
        
#         mod_request.status = "rejected"
#         mod_request.rejection_reason = "Driver declined the modification request"
#         mod_request.rejected_at = datetime.now(timezone.utc)
#         mod_request.is_active = False
#         mod_request.updated_at = datetime.now(timezone.utc)
        
#         print(f"   ✅ Modification request updated: status=rejected, is_active=False")
        
#         old_status = booking.status
#         booking.status = "cancelled"
#         booking.seats_booked = 0
#         booking.cancellation_reason = f"Modification request rejected - Original booking of {original_seats} seat(s) cancelled"
#         booking.updated_at = datetime.now(timezone.utc)
        
#         print(f"   ✅ Booking updated: status={old_status} -> cancelled, seats={original_seats} -> 0")
        
#         db.flush()
        
#         total_booked_after = db.query(func.sum(RideBooking.seats_booked)).filter(
#             RideBooking.ride_id == ride.id,
#             RideBooking.status == "accepted"
#         ).scalar() or 0
        
#         remaining_seats = ride.available_seats - total_booked_after
        
#         print(f"   📊 After cancellation calculation:")
#         print(f"      Total booked (accepted): {total_booked_after}")
#         print(f"      Remaining seats: {remaining_seats}")
        
#         old_ride_status = ride.status
#         if ride.status == "full" and remaining_seats > 0:
#             ride.status = "active"
#             print(f"   ✅ Ride status changed: {old_ride_status} -> active")
#         elif ride.status == "active" and remaining_seats == 0:
#             ride.status = "full"
#             print(f"   ✅ Ride status changed: {old_ride_status} -> full")
#         else:
#             print(f"   ℹ️ Ride status unchanged: {ride.status}")
        
#         ride.updated_at = datetime.now(timezone.utc)
        
#         db.commit()
#         print(f"💾 Database commit successful")
        
#         # In-app notification to passenger about cancellation
#         passenger_notification = UserNotification(
#             phone_number=booking.passenger_phone,
#             title="Booking Cancelled ❌",
#             message=f"Your booking for {original_seats} seat(s) has been cancelled because your modification request was rejected.",
#             type=NotificationType.RIDE,
#             action_type="cancellation",
#             action_value=str(ride.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(passenger_notification)
#         db.commit()
        
#         # Email notification to passenger
#         try:
#             passenger_email = get_user_email(db, booking.passenger_phone)
#             if passenger_email:
#                 passenger_user = db.query(User).filter(User.phone_number == booking.passenger_phone).first()
#                 passenger_name = passenger_user.full_name or passenger_user.first_name or "there"
                
#                 email_ride_data = {
#                     "origin": ride.origin,
#                     "destination": ride.destination,
#                     "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
#                     "seats": original_seats,
#                     "cancellation_reason": "Driver rejected your seat modification request"
#                 }
#                 send_ride_notification_email(passenger_email, passenger_name, email_ride_data, "booking_cancelled", booking.id, ride.id)
#         except Exception as e:
#             print(f"Failed to send modification rejection email: {str(e)}")
        
#         print(f"📡 Sending socket events...")
        
#         try:
#             emit_to_user(booking.passenger_phone, "booking-cancelled", {
#                 "booking_id": booking.id,
#                 "ride_id": ride.id,
#                 "seats_cancelled": original_seats,
#                 "message": f"Your booking for {original_seats} seat(s) has been cancelled because your modification request was rejected."
#             })
#             print(f"   ✅ Sent booking-cancelled to passenger {booking.passenger_phone}")
#         except Exception as e:
#             print(f"   ⚠️ Socket error (booking-cancelled): {e}")
        
#         try:
#             emit_to_ride(ride.id, "seats-released", {
#                 "ride_id": ride.id,
#                 "seats_released": original_seats,
#                 "new_available_seats": remaining_seats,
#                 "message": f"{original_seats} seat(s) are now available for this ride!"
#             })
#             print(f"   ✅ Sent seats-released to ride room: ride_{ride.id}")
#         except Exception as e:
#             print(f"   ⚠️ Socket error (seats-released): {e}")
        
#         try:
#             emit_to_ride(ride.id, "modification-rejected", {
#                 "ride_id": ride.id,
#                 "booking_id": booking.id,
#                 "seats_released": original_seats,
#                 "new_available_seats": remaining_seats,
#                 "message": f"A modification request was rejected. {original_seats} seat(s) are now available."
#             })
#             print(f"   ✅ Sent modification-rejected to ride room: ride_{ride.id}")
#         except Exception as e:
#             print(f"   ⚠️ Socket error (modification-rejected): {e}")
        
#         try:
#             if _sio:
#                 _sio.emit("seat-availability-update", {
#                     "ride_id": ride.id,
#                     "available_seats": remaining_seats,
#                     "total_seats": ride.available_seats,
#                     "action": "seats_released",
#                     "seats_released": original_seats
#                 })
#                 print(f"   ✅ Sent seat-availability-update to all clients")
#         except Exception as e:
#             print(f"   ⚠️ Socket error (seat-availability-update): {e}")
        
#         print(f"✅ ========== REJECTION COMPLETED SUCCESSFULLY ==========")
        
#         return {
#             "success": True,
#             "message": f"Modification request rejected. Original booking for {original_seats} seat(s) has been CANCELLED.",
#             "booking_cancelled": True,
#             "booking_id": booking.id,
#             "seats_released": original_seats,
#             "new_available_seats": remaining_seats,
#             "ride_id": ride.id,
#             "ride_status": ride.status
#         }
        
#     except Exception as e:
#         print(f"❌ ========== ERROR IN REJECTION ==========")
#         print(f"❌ Error: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         db.rollback()
#         return {"success": False, "message": str(e)}


# @router.get("/ride/{ride_id}/rejected-modifications")
# def get_rejected_modifications(ride_id: int, db: Session = Depends(get_db)):
#     """Get all rejected modification requests for a ride"""
#     try:
#         rejected_requests = db.query(ModificationRequest).filter(
#             ModificationRequest.ride_id == ride_id,
#             ModificationRequest.status == "rejected"
#         ).all()
        
#         results = []
#         for req in rejected_requests:
#             results.append({
#                 "id": req.id,
#                 "booking_id": req.booking_id,
#                 "passenger_phone": req.passenger_phone,
#                 "current_seats": req.current_seats,
#                 "requested_seats": req.requested_seats,
#                 "status": req.status,
#                 "rejection_reason": req.rejection_reason,
#                 "created_at": req.created_at.isoformat() if req.created_at else None,
#                 "rejected_at": req.rejected_at.isoformat() if req.rejected_at else None
#             })
        
#         return {
#             "success": True,
#             "rejected_requests": results,
#             "count": len(results)
#         }
        
#     except Exception as e:
#         print(f"Error in get_rejected_modifications: {str(e)}")
#         return {"success": False, "rejected_requests": [], "error": str(e)}


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

#         rider_session = db.query(RideSessionRider).filter(
#             RideSessionRider.booking_id == bk.id
#         ).first()
        
#         if rider_session:
#             driver_rating_given = rider_session.driver_rating is not None
#             driver_rating = rider_session.driver_rating or 0
#             driver_feedback = rider_session.driver_feedback or ""

#         passengers.append({
#             "booking_id": bk.id,
#             "custom_booking_id": getattr(bk, 'custom_booking_id', None),
#             "passenger_phone": bk.passenger_phone,
#             "passenger_name": passenger_name,
#             "profile_picture": p.profile_picture if p else None,
#             "seats_booked": bk.seats_booked,
#             "status": bk.status,
#             "total_amount": float(bk.total_amount) if bk.total_amount else None,
#             "created_at": bk.created_at.isoformat() if bk.created_at else None,
#             "pickup_address": getattr(bk, 'pickup_address', None),
#             "dropoff_address": getattr(bk, 'dropoff_address', None),
#             "pickup_place_name": getattr(bk, 'pickup_place_name', None),
#             "dropoff_place_name": getattr(bk, 'dropoff_place_name', None),
#             "pickup_lat": float(bk.pickup_lat) if bk.pickup_lat is not None else None,
#             "pickup_lon": float(bk.pickup_lon) if bk.pickup_lon is not None else None,
#             "drop_lat": float(bk.drop_lat) if bk.drop_lat is not None else None,
#             "drop_lon": float(bk.drop_lon) if bk.drop_lon is not None else None,
#             "intersection_pickup_lat": float(bk.intersection_pickup_lat) if bk.intersection_pickup_lat is not None else None,
#             "intersection_pickup_lon": float(bk.intersection_pickup_lon) if bk.intersection_pickup_lon is not None else None,
#             "intersection_drop_lat": float(bk.intersection_drop_lat) if bk.intersection_drop_lat is not None else None,
#             "intersection_drop_lon": float(bk.intersection_drop_lon) if bk.intersection_drop_lon is not None else None,
#             "pickup_walk_distance_m": bk.pickup_walk_distance_m,
#             "drop_walk_distance_m": bk.drop_walk_distance_m,
#             "driver_rating_given": driver_rating_given if rider_session else False,
#             "driver_rating": driver_rating if rider_session else 0,
#             "driver_feedback": driver_feedback if rider_session else "",
#         })

#     total_booked = get_total_booked_seats(db, ride_id)
#     remaining_seats = max(0, ride.available_seats - total_booked)

#     return {
#         "ride_id": ride.id,
#         "custom_ride_id": getattr(ride, 'custom_ride_id', None),
#         "origin": ride.origin,
#         "destination": ride.destination,
#         "origin_address": getattr(ride, 'origin_address', None),
#         "destination_address": getattr(ride, 'destination_address', None),
#         "origin_place_name": getattr(ride, 'origin_place_name', None),
#         "destination_place_name": getattr(ride, 'destination_place_name', None),
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
#         "passengers": passengers,
#         "duration_text": ride.duration_text,
#         "distance_km": ride.distance_km,
#         "price_per_seat": ride.price_per_seat,
#     }


# @router.get("/my-rides/{phone}")
# def get_my_rides(phone: str, db: Session = Depends(get_db)):
#     norm_phone = normalize_phone(phone)
    
#     # POSTED RIDES (Driver)
#     posted_rides = db.query(Ride).filter(
#         Ride.phone_number == norm_phone,
#         Ride.is_deleted == False
#     ).order_by(Ride.departure_time.desc()).all()
    
#     posted_ride_ids = [r.id for r in posted_rides]
#     bookings_map = {}
    
#     if posted_ride_ids:
#         bookings_raw = db.execute(text("""
#             SELECT 
#                 rb.id, rb.ride_id, rb.passenger_phone, rb.seats_booked, rb.status,
#                 rb.created_at, rb.total_amount, rb.cancellation_reason,
#                 rb.pickup_lat, rb.pickup_lon, rb.drop_lat, rb.drop_lon,
#                 rb.intersection_pickup_lat, rb.intersection_pickup_lon,
#                 rb.intersection_drop_lat, rb.intersection_drop_lon,
#                 rb.pickup_walk_distance_m, rb.drop_walk_distance_m,
#                 rb.pickup_address, rb.dropoff_address,
#                 rb.pickup_place_name, rb.dropoff_place_name,
#                 u.full_name as passenger_name, u.first_name, u.last_name, 
#                 u.profile_picture as passenger_profile_picture,
#                 u.gender as passenger_gender,
#                 COALESCE(rsr.driver_rating, 0) as driver_rating,
#                 COALESCE(rsr.driver_feedback, '') as driver_feedback,
#                 rsr.driver_rating_given,
#                 mr.id as mod_id,
#                 mr.requested_seats as mod_requested_seats,
#                 mr.current_seats as mod_current_seats,
#                 mr.status as mod_status,
#                 mr.created_at as mod_created_at,
#                 mr.rejection_reason as mod_rejection_reason
#             FROM ride_bookings rb 
#             LEFT JOIN users u ON u.phone_number = rb.passenger_phone
#             LEFT JOIN ride_session_riders rsr ON rsr.booking_id = rb.id
#             LEFT JOIN modification_requests mr ON mr.booking_id = rb.id AND mr.status IN ('pending', 'approved', 'rejected')
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
            
#             modification_request = None
#             if bk["mod_id"] is not None:
#                 modification_request = {
#                     "id": bk["mod_id"],
#                     "requested_seats": bk["mod_requested_seats"],
#                     "current_seats": bk["mod_current_seats"],
#                     "status": bk["mod_status"],
#                     "created_at": bk["mod_created_at"].isoformat() if bk["mod_created_at"] else None,
#                     "rejection_reason": bk["mod_rejection_reason"]
#                 }
            
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
#                 "pickup_address": bk.get("pickup_address"),
#                 "dropoff_address": bk.get("dropoff_address"),
#                 "pickup_place_name": bk.get("pickup_place_name"),
#                 "dropoff_place_name": bk.get("dropoff_place_name"),
#                 "pickup_lat": float(bk["pickup_lat"]) if bk["pickup_lat"] is not None else None,
#                 "pickup_lon": float(bk["pickup_lon"]) if bk["pickup_lon"] is not None else None,
#                 "drop_lat": float(bk["drop_lat"]) if bk["drop_lat"] is not None else None,
#                 "drop_lon": float(bk["drop_lon"]) if bk["drop_lon"] is not None else None,
#                 "intersection_pickup_lat": float(bk["intersection_pickup_lat"]) if bk["intersection_pickup_lat"] is not None else None,
#                 "intersection_pickup_lon": float(bk["intersection_pickup_lon"]) if bk["intersection_pickup_lon"] is not None else None,
#                 "intersection_drop_lat": float(bk["intersection_drop_lat"]) if bk["intersection_drop_lat"] is not None else None,
#                 "intersection_drop_lon": float(bk["intersection_drop_lon"]) if bk["intersection_drop_lon"] is not None else None,
#                 "pickup_walk_distance_m": bk["pickup_walk_distance_m"],
#                 "drop_walk_distance_m": bk["drop_walk_distance_m"],
#                 "driver_rating_given": bk["driver_rating_given"] is True or bk["driver_rating_given"] == 1,
#                 "driver_rating": float(bk["driver_rating"]) if bk["driver_rating"] else 0,
#                 "driver_feedback": bk["driver_feedback"] or "",
#                 "modification_request": modification_request
#             })
    
#     posted_formatted = []
#     for ride in posted_rides:
#         total_booked = get_total_booked_seats(db, ride.id)
#         remaining_seats = max(0, ride.available_seats - total_booked)
        
#         display_status = ride.status
#         if remaining_seats == 0 and ride.status == "active":
#             display_status = "full"
        
#         driver_info = db.query(User).filter(User.phone_number == ride.phone_number).first()
#         driver_profile_picture = driver_info.profile_picture if driver_info else None
        
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
#             "custom_ride_id": getattr(ride, 'custom_ride_id', None),
#             "phone_number": ride.phone_number,
#             "origin": ride.origin,
#             "destination": ride.destination,
#             "origin_coords": [ride.origin_lon, ride.origin_lat] if ride.origin_lon and ride.origin_lat else None,
#             "destination_coords": [ride.destination_lon, ride.destination_lat] if ride.destination_lon and ride.destination_lat else None,
#             "departure_time": ride.departure_time.isoformat(),
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
#             "cancellation_reason": ride.cancellation_reason,
#             "completed_at": ride.completed_at.isoformat() if hasattr(ride, 'completed_at') and ride.completed_at else None,
#             "origin_lat": float(ride.origin_lat) if ride.origin_lat is not None else None,
#             "origin_lon": float(ride.origin_lon) if ride.origin_lon is not None else None,
#             "destination_lat": float(ride.destination_lat) if ride.destination_lat is not None else None,
#             "destination_lon": float(ride.destination_lon) if ride.destination_lon is not None else None,
#         })
    
#     requested_raw = db.execute(text("""
#         SELECT 
#             rb.id, rb.ride_id, rb.passenger_phone, rb.seats_booked, rb.status,
#             rb.created_at, rb.total_amount, rb.cancellation_reason,
#             rb.pickup_lat, rb.pickup_lon, rb.drop_lat, rb.drop_lon,
#             rb.intersection_pickup_lat, rb.intersection_pickup_lon,
#             rb.intersection_drop_lat, rb.intersection_drop_lon,
#             rb.pickup_walk_distance_m, rb.drop_walk_distance_m,
#             rb.pickup_address, rb.dropoff_address,
#             rb.pickup_place_name, rb.dropoff_place_name,
#             r.origin, r.destination, r.departure_time, r.price_per_seat, r.available_seats,
#             r.distance_km, r.duration_text, r.status as ride_status, r.women_only,
#             r.route_coordinates, r.started_at as ride_started_at,
#             r.origin_lat, r.origin_lon, r.destination_lat, r.destination_lon,
#             r.completed_at as ride_completed_at,
#             r.custom_ride_id as ride_custom_id,
#             u.full_name as driver_name, u.first_name, u.last_name, u.phone_number as driver_phone,
#             u.user_id as driver_user_id, u.profile_completed, 
#             u.profile_picture as driver_profile_picture,
#             u.avg_rating as driver_rating,
#             v.id as vehicle_id, v.make, v.model, v.color, v.registration_number,
#             ls.id as session_id, ls.status as session_status,
#             ls.current_phase as session_phase,
#             COALESCE(rsr.rider_rating, 0) as rider_rating,
#             COALESCE(rsr.rider_feedback, '') as rider_feedback,
#             rsr.rider_rating_given,
#             mr.id as mod_id,
#             mr.requested_seats as mod_requested_seats,
#             mr.current_seats as mod_current_seats,
#             mr.status as mod_status,
#             mr.created_at as mod_created_at,
#             mr.rejection_reason as mod_rejection_reason
#         FROM ride_bookings rb
#         JOIN rides r ON r.id = rb.ride_id
#         LEFT JOIN users u ON u.phone_number = r.phone_number
#         LEFT JOIN vehicles v ON v.id = r.vehicle_id
#         LEFT JOIN ride_sessions ls ON ls.ride_id = r.id AND ls.status IN ('driver_started', 'boarding', 'en_route')
#         LEFT JOIN ride_session_riders rsr ON rsr.booking_id = rb.id
#         LEFT JOIN modification_requests mr ON mr.booking_id = rb.id AND mr.is_active = TRUE
#         WHERE rb.passenger_phone = :phone
#         ORDER BY rb.created_at DESC
#     """), {"phone": norm_phone}).mappings().all()
        
#     requested_formatted = []
#     for row in requested_raw:
#         driver_name = row["driver_name"] or " ".join(
#             p for p in [row["first_name"], row["last_name"]] if p
#         ).strip() or f"Driver {row['driver_phone'][-4:] if row['driver_phone'] else 'Unknown'}"
        
#         vehicle_data = None
#         if row["vehicle_id"]:
#             vehicle_data = {
#                 "id": row["vehicle_id"],
#                 "make": row["make"],
#                 "model": row["model"],
#                 "color": row["color"],
#                 "registration_number": row["registration_number"],
#             }
        
#         live_session_data = None
#         if row["session_id"]:
#             live_session_data = {
#                 "session_id": row["session_id"],
#                 "status": row["session_status"],
#                 "current_phase": row["session_phase"]
#             }
        
#         modification_request = None
#         if row["mod_id"] is not None:
#             modification_request = {
#                 "id": row["mod_id"],
#                 "requested_seats": row["mod_requested_seats"],
#                 "current_seats": row["mod_current_seats"],
#                 "status": row["mod_status"],
#                 "created_at": row["mod_created_at"].isoformat() if row["mod_created_at"] else None,
#                 "rejection_reason": row["mod_rejection_reason"]
#             }
        
#         suggested_pickup_point = None
#         suggested_drop_point = None
        
#         if row["intersection_pickup_lat"] is not None and row["intersection_pickup_lon"] is not None:
#             suggested_pickup_point = {
#                 "lat": float(row["intersection_pickup_lat"]),
#                 "lng": float(row["intersection_pickup_lon"])
#             }
#         elif row["pickup_lat"] is not None and row["pickup_lon"] is not None:
#             suggested_pickup_point = {
#                 "lat": float(row["pickup_lat"]),
#                 "lng": float(row["pickup_lon"])
#             }
        
#         if row["intersection_drop_lat"] is not None and row["intersection_drop_lon"] is not None:
#             suggested_drop_point = {
#                 "lat": float(row["intersection_drop_lat"]),
#                 "lng": float(row["intersection_drop_lon"])
#             }
#         elif row["drop_lat"] is not None and row["drop_lon"] is not None:
#             suggested_drop_point = {
#                 "lat": float(row["drop_lat"]),
#                 "lng": float(row["drop_lon"])
#             }
        
#         requested_formatted.append({
#             "id": row["id"],
#             "custom_booking_id": getattr(row, 'custom_booking_id', None),
#             "ride_id": row["ride_id"],
#             "ride_custom_id": row["ride_custom_id"],
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
#             "started_at": row["ride_started_at"].isoformat() if row["ride_started_at"] else None,
#             "completed_at": row["ride_completed_at"].isoformat() if row["ride_completed_at"] else None,
#             "pickup_lat": float(row["pickup_lat"]) if row["pickup_lat"] is not None else None,
#             "pickup_lon": float(row["pickup_lon"]) if row["pickup_lon"] is not None else None,
#             "drop_lat": float(row["drop_lat"]) if row["drop_lat"] is not None else None,
#             "drop_lon": float(row["drop_lon"]) if row["drop_lon"] is not None else None,
#             "intersection_pickup_lat": float(row["intersection_pickup_lat"]) if row["intersection_pickup_lat"] is not None else None,
#             "intersection_pickup_lon": float(row["intersection_pickup_lon"]) if row["intersection_pickup_lon"] is not None else None,
#             "intersection_drop_lat": float(row["intersection_drop_lat"]) if row["intersection_drop_lat"] is not None else None,
#             "intersection_drop_lon": float(row["intersection_drop_lon"]) if row["intersection_drop_lon"] is not None else None,
#             "pickup_walk_distance_m": row["pickup_walk_distance_m"],
#             "drop_walk_distance_m": row["drop_walk_distance_m"],
#             "suggested_pickup_point": suggested_pickup_point,
#             "suggested_drop_point": suggested_drop_point,
#             "origin_lat": float(row["origin_lat"]) if row["origin_lat"] is not None else None,
#             "origin_lon": float(row["origin_lon"]) if row["origin_lon"] is not None else None,
#             "destination_lat": float(row["destination_lat"]) if row["destination_lat"] is not None else None,
#             "destination_lon": float(row["destination_lon"]) if row["destination_lon"] is not None else None,
#             "rider_rating_given": row["rider_rating_given"] is True or row["rider_rating_given"] == 1,
#             "rider_rating": float(row["rider_rating"]) if row["rider_rating"] else 0,
#             "rider_feedback": row["rider_feedback"] or "",
#             "modification_request": modification_request
#         })
    
#     return {
#         "posted_rides": posted_formatted,
#         "requested_rides": requested_formatted
#     }


# @router.post("/ride/{ride_id}/start")
# def start_ride(ride_id: int, db: Session = Depends(get_db)):
#     """Start a ride - creates live session and QR code"""
#     try:
#         ride = db.query(Ride).filter(Ride.id == ride_id).first()
#         if not ride:
#             raise HTTPException(status_code=404, detail="Ride not found")
        
#         if ride.started_at:
#             raise HTTPException(status_code=400, detail="Ride already started")
        
#         if ride.cancellation_reason:
#             raise HTTPException(status_code=400, detail=f"Cannot start cancelled ride")
        
#         now = datetime.now(timezone.utc)
#         minutes_to_departure = (ride.departure_time - now).total_seconds() / 60
#         minutes_since_departure = (now - ride.departure_time).total_seconds() / 60
        
#         if minutes_to_departure > 15:
#             raise HTTPException(status_code=400, detail=f"Ride can only be started within 15 minutes of departure time")
        
#         if minutes_since_departure > 30:
#             ride.status = "cancelled"
#             ride.cancellation_reason = "Auto-cancelled: Ride was not started within 30 minutes of departure time"
#             db.commit()
#             raise HTTPException(status_code=400, detail="Ride has been auto-cancelled")
        
#         ride.started_at = now
#         ride.status = "active"
#         db.commit()
        
#         qr_token = secrets.token_hex(16)
        
#         live_session = RideSession(
#             ride_id=ride_id,
#             driver_phone=ride.phone_number,
#             status="driver_started",
#             current_phase="boarding",
#             qr_code_token=qr_token,
#             qr_expires_at=datetime.now(timezone.utc) + timedelta(hours=8),
#             started_at=datetime.now(timezone.utc)
#         )
#         db.add(live_session)
#         db.flush()
        
#         accepted_bookings = db.query(RideBooking).filter(
#             RideBooking.ride_id == ride_id,
#             RideBooking.status == "accepted"
#         ).all()
        
#         for booking in accepted_bookings:
#             rider_user = db.query(User).filter(User.phone_number == booking.passenger_phone).first()
            
#             rider_session = RideSessionRider(
#                 session_id=live_session.id,
#                 booking_id=booking.id,
#                 rider_phone=booking.passenger_phone,
#                 rider_name=rider_user.full_name if rider_user else None,
#                 rider_photo=rider_user.profile_picture if rider_user else None,
#                 pickup_location=ride.origin,
#                 dropoff_location=ride.destination,
#                 status="accepted"
#             )
#             db.add(rider_session)
            
#             notification = UserNotification(
#                 phone_number=booking.passenger_phone,
#                 title="Ride Started! 🚗",
#                 message=f"The driver has started the ride from {ride.origin} to {ride.destination}.",
#                 type=NotificationType.RIDE,
#                 action_type="ride",
#                 action_value=str(ride.id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
            
#             emit_to_user(booking.passenger_phone, "ride-started", {
#                 "ride_id": ride_id,
#                 "session_id": live_session.id,
#                 "message": "The driver has started the ride!"
#             })
            
#             # Email notification to passenger
#             try:
#                 passenger_email = get_user_email(db, booking.passenger_phone)
#                 if passenger_email:
#                     passenger_user = db.query(User).filter(User.phone_number == booking.passenger_phone).first()
#                     passenger_name = passenger_user.full_name or passenger_user.first_name or "there"
                    
#                     ride_data = {
#                         "origin": ride.origin,
#                         "destination": ride.destination,
#                         "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
#                         "message": f"The driver has started the ride! You can now track your driver's location in the app."
#                     }
#                     send_ride_notification_email(passenger_email, passenger_name, ride_data, "ride_started", booking.id, ride.id)
#             except Exception as e:
#                 print(f"Failed to send ride started email: {str(e)}")
        
#         db.commit()
#         db.refresh(live_session)
        
#         return {
#             "message": "Ride started successfully",
#             "session_id": live_session.id,
#             "ride_id": ride.id,
#             "qr_code_token": qr_token
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"Error starting ride: {str(e)}")
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# @router.get("/ride-sessions/driver/{ride_id}")
# def get_driver_session(ride_id: int, driver_phone: str, db: Session = Depends(get_db)):
#     """Get driver's active ride session"""
#     driver_phone = normalize_phone(driver_phone)
    
#     session = db.query(RideSession).filter(
#         RideSession.ride_id == ride_id,
#         RideSession.driver_phone == driver_phone
#     ).order_by(RideSession.id.desc()).first()
    
#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")
    
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
    
#     riders = []
#     boarded_count = 0
#     dropped_count = 0
    
#     for rider in session.riders:
#         if rider.status in ["boarded", "dropped_off", "completed"]:
#             boarded_count += 1
#         if rider.status in ["dropped_off", "completed"]:
#             dropped_count += 1
        
#         riders.append({
#             "id": rider.id,
#             "booking_id": rider.booking_id,
#             "rider_phone": rider.rider_phone,
#             "rider_name": rider.rider_name or f"Rider {rider.rider_phone[-4:]}",
#             "rider_photo": rider.rider_photo,
#             "pickup_location": rider.pickup_location,
#             "dropoff_location": rider.dropoff_location,
#             "status": rider.status,
#             "boarded_at": rider.boarded_at.isoformat() if rider.boarded_at else None,
#             "dropped_off_at": rider.dropped_off_at.isoformat() if rider.dropped_off_at else None,
#             "completed_at": rider.completed_at.isoformat() if rider.completed_at else None,
#             "driver_rating": rider.driver_rating,
#             "rider_rating": rider.rider_rating,
#         })
    
#     return {
#         "session_id": session.id,
#         "ride_id": ride_id,
#         "ride_origin": ride.origin if ride else None,
#         "ride_destination": ride.destination if ride else None,
#         "departure_time": ride.departure_time.isoformat() if ride and ride.departure_time else None,
#         "status": session.status,
#         "current_phase": session.current_phase,
#         "qr_code_token": session.qr_code_token,
#         "boarded_count": boarded_count,
#         "dropped_count": dropped_count,
#         "total_riders": len(session.riders),
#         "sos_active": session.sos_active,
#         "emergency_stop_active": session.emergency_stop_active,
#         "current_lat": session.current_lat,
#         "current_lng": session.current_lng,
#         "riders": riders
#     }


# @router.get("/ride-sessions/rider/{booking_id}")
# def get_rider_session(booking_id: int, rider_phone: str, db: Session = Depends(get_db)):
#     """Get rider's active ride session"""
#     rider_phone = normalize_phone(rider_phone)
    
#     rider_session = db.query(RideSessionRider).filter(
#         RideSessionRider.booking_id == booking_id,
#         RideSessionRider.rider_phone == rider_phone
#     ).order_by(RideSessionRider.id.desc()).first()
    
#     if not rider_session:
#         raise HTTPException(status_code=404, detail="Rider session not found")
    
#     session = db.query(RideSession).filter(RideSession.id == rider_session.session_id).first()
#     ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
#     driver = db.query(User).filter(User.phone_number == session.driver_phone).first()
    
#     return {
#         "session_id": session.id,
#         "booking_id": booking_id,
#         "ride_id": session.ride_id,
#         "session_status": session.status,
#         "current_phase": session.current_phase,
#         "driver_phone": session.driver_phone,
#         "driver_name": driver.full_name if driver else "Driver",
#         "driver_photo": driver.profile_picture if driver else None,
#         "driver_rating": driver.avg_rating if driver else 4.5,
#         "origin": ride.origin if ride else None,
#         "destination": ride.destination if ride else None,
#         "rider_status": rider_session.status,
#         "pickup_location": rider_session.pickup_location,
#         "dropoff_location": rider_session.dropoff_location,
#         "pickup_lat": rider_session.pickup_lat,
#         "pickup_lng": rider_session.pickup_lng,
#         "dropoff_lat": rider_session.dropoff_lat,
#         "dropoff_lng": rider_session.dropoff_lng,
#         "current_lat": session.current_lat,
#         "current_lng": session.current_lng,
#         "sos_active": session.sos_active,
#         "emergency_stop_active": session.emergency_stop_active,
#         "driver_rating_given": rider_session.rider_rating is not None
#     }


# @router.post("/ride-sessions/{session_id}/rider-reached-pickup")
# def rider_reached_pickup(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Rider notifies that they've reached pickup location"""
#     booking_id = payload.get("booking_id")
#     rider_phone = normalize_phone(payload.get("rider_phone", ""))
    
#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id,
#         RideSessionRider.rider_phone == rider_phone
#     ).first()
    
#     if not rider:
#         raise HTTPException(status_code=404, detail="Rider not found in session")
    
#     if rider.status in ["boarded", "dropped_off", "completed"]:
#         raise HTTPException(status_code=400, detail="Ride already in progress")
    
#     rider.status = "reached_pickup"
#     rider.reached_pickup_at = datetime.now(timezone.utc)
#     rider.pickup_confirmed = True
#     db.commit()
    
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
#     if session:
#         emit_to_user(session.driver_phone, "rider-reached-pickup", {
#             "booking_id": booking_id,
#             "rider_phone": rider_phone,
#             "rider_name": rider.rider_name,
#             "message": f"{rider.rider_name or 'Rider'} has reached the pickup location"
#         })
    
#     return {"message": "Pickup arrival marked", "status": rider.status}


# @router.post("/ride-sessions/{session_id}/rider-board")
# def rider_board(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Rider scans QR code to board the vehicle"""
#     from datetime import datetime, timezone
#     from sqlalchemy.orm import joinedload
    
#     try:
#         booking_id = payload.get("booking_id")
#         rider_phone = normalize_phone(payload.get("rider_phone", ""))
#         qr_code_token = payload.get("qr_code_token")
        
#         print(f"📝 Boarding request: session={session_id}, booking={booking_id}")
        
#         session = db.query(RideSession).options(
#             joinedload(RideSession.riders)
#         ).filter(RideSession.id == session_id).first()
        
#         if not session:
#             raise HTTPException(status_code=404, detail="Ride session not found")
        
#         print(f"✅ Session found: status={session.status}")
        
#         if not session.qr_code_token:
#             raise HTTPException(status_code=400, detail="No QR code available for this ride")
        
#         if session.qr_code_token != qr_code_token:
#             print(f"❌ QR mismatch: expected={session.qr_code_token}, got={qr_code_token}")
#             raise HTTPException(status_code=400, detail="Invalid QR code")
        
#         print(f"✅ QR code validated")
        
#         rider = None
#         for r in session.riders:
#             if r.booking_id == booking_id or r.rider_phone == rider_phone:
#                 rider = r
#                 break
        
#         if not rider:
#             rider = db.query(RideSessionRider).filter(
#                 RideSessionRider.session_id == session_id,
#                 RideSessionRider.booking_id == booking_id
#             ).first()
        
#         if not rider:
#             raise HTTPException(status_code=404, detail="Rider not found in this session")
        
#         print(f"✅ Found rider: {rider.rider_name}, current status: {rider.status}")
        
#         if rider.status in ["boarded", "dropped_off", "completed"]:
#             return {
#                 "message": f"Rider already {rider.status}",
#                 "rider_status": rider.status,
#                 "already_boarded": True
#             }
        
#         now = datetime.now(timezone.utc)
#         rider.status = "boarded"
#         rider.boarded_at = now
#         rider.pickup_confirmed = True
        
#         boarded_count = db.query(RideSessionRider).filter(
#             RideSessionRider.session_id == session_id,
#             RideSessionRider.status.in_(["boarded", "dropped_off", "completed"])
#         ).count()
        
#         total_riders = db.query(RideSessionRider).filter(
#             RideSessionRider.session_id == session_id
#         ).count()
        
#         print(f"📊 Boarded: {boarded_count}/{total_riders}")
        
#         if boarded_count == total_riders:
#             session.current_phase = "en_route"
#             session.status = "en_route"
#         else:
#             session.current_phase = "boarding"
#             session.status = "boarding"
        
#         db.commit()
#         print(f"✅ Database commit successful")
        
#         try:
#             emit_to_user(session.driver_phone, "rider-boarded", {
#                 "booking_id": booking_id,
#                 "rider_phone": rider.rider_phone,
#                 "rider_name": rider.rider_name or "Rider",
#                 "boarded_count": boarded_count,
#                 "total_riders": total_riders
#             })
            
#             emit_to_user(rider.rider_phone, "boarding-confirmed", {
#                 "session_id": session_id,
#                 "booking_id": booking_id,
#                 "message": "You have successfully boarded the vehicle"
#             })
#         except Exception as e:
#             print(f"⚠️ Socket error (non-critical): {e}")
        
#         return {
#             "success": True,
#             "message": "Boarding successful",
#             "rider_status": rider.status,
#             "session_status": session.status,
#             "current_phase": session.current_phase,
#             "boarded_count": boarded_count,
#             "total_riders": total_riders
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"💥 Error in rider_board: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Error boarding rider: {str(e)}")


# @router.post("/ride-sessions/{session_id}/rider-dropped-off")
# def rider_dropped_off(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Driver marks rider as dropped off"""
#     try:
#         booking_id = payload.get("booking_id")
#         rider_phone = normalize_phone(payload.get("rider_phone", ""))
        
#         print(f"📍 Dropoff request: session={session_id}, booking={booking_id}, phone={rider_phone}")
        
#         rider = db.query(RideSessionRider).filter(
#             RideSessionRider.session_id == session_id,
#             RideSessionRider.booking_id == booking_id
#         ).first()
        
#         if not rider:
#             rider = db.query(RideSessionRider).filter(
#                 RideSessionRider.session_id == session_id,
#                 RideSessionRider.rider_phone == rider_phone
#             ).first()
        
#         if not rider:
#             raise HTTPException(status_code=404, detail="Rider not found")
        
#         if rider.status != "boarded":
#             raise HTTPException(status_code=400, detail=f"Rider must be boarded first. Current status: {rider.status}")
        
#         rider.status = "dropped_off"
#         rider.dropped_off_at = datetime.now(timezone.utc)
#         rider.dropoff_confirmed = True
        
#         session = db.query(RideSession).filter(RideSession.id == session_id).first()
#         if session:
#             dropped_count = sum(1 for r in session.riders if r.status in ["dropped_off", "completed"])
#             total_riders = len(session.riders)
            
#             if dropped_count == total_riders:
#                 session.current_phase = "completed"
        
#         db.commit()
#         print(f"✅ Rider {rider.rider_name} dropped off successfully")
        
#         try:
#             emit_to_user(session.driver_phone, "rider-dropped-off", {
#                 "booking_id": booking_id,
#                 "rider_phone": rider.rider_phone,
#                 "rider_name": rider.rider_name,
#                 "message": f"{rider.rider_name or 'Rider'} has been dropped off"
#             })
#         except Exception as e:
#             print(f"Socket error: {e}")
        
#         return {
#             "message": "Rider dropped off successfully",
#             "rider_status": rider.status
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"Error in rider_dropped_off: {e}")
#         import traceback
#         traceback.print_exc()
#         db.rollback()
#         raise HTTPException(status_code=500, detail=str(e))


# @router.post("/ride-sessions/{session_id}/rider-complete")
# def rider_complete(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Rider completes the ride and can rate the driver"""
#     booking_id = payload.get("booking_id")
#     rider_phone = normalize_phone(payload.get("rider_phone", ""))
    
#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id,
#         RideSessionRider.rider_phone == rider_phone
#     ).first()
    
#     if not rider:
#         raise HTTPException(status_code=404, detail="Rider not found")
    
#     if rider.status != "dropped_off":
#         raise HTTPException(status_code=400, detail="Ride must be completed after drop off")
    
#     rider.status = "completed"
#     rider.completed_at = datetime.now(timezone.utc)
#     db.commit()
    
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
    
#     if session:
#         all_completed = all(r.status == "completed" for r in session.riders)
#         if all_completed:
#             session.status = "completed"
#             session.current_phase = "completed"
#             session.completed_at = datetime.now(timezone.utc)
            
#             ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
#             if ride:
#                 ride.status = "completed"
            
#             db.commit()
            
#             emit_to_user(session.driver_phone, "ride-completed", {
#                 "ride_id": session.ride_id,
#                 "session_id": session_id,
#                 "message": "All riders have completed the ride"
#             })
    
#     emit_to_user(rider_phone, "ride-completed", {
#         "booking_id": booking_id,
#         "ride_id": session.ride_id if session else None,
#         "message": "Your ride has been completed!"
#     })
    
#     return {"message": "Ride marked completed", "status": rider.status}


# @router.post("/ride-sessions/{session_id}/complete")
# def complete_ride(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Driver completes the ride and can rate riders"""
#     driver_phone = normalize_phone(payload.get("driver_phone", ""))
    
#     session = db.query(RideSession).filter(
#         RideSession.id == session_id,
#         RideSession.driver_phone == driver_phone
#     ).first()
    
#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")
    
#     all_completed = all(r.status == "completed" for r in session.riders)
#     if not all_completed:
#         raise HTTPException(status_code=400, detail="All riders must complete before finishing the ride")
    
#     session.status = "completed"
#     session.current_phase = "completed"
#     session.completed_at = datetime.now(timezone.utc)
    
#     ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
#     if ride:
#         ride.status = "completed"
    
#     db.commit()
    
#     return {"message": "Ride completed successfully", "status": session.status}


# @router.post("/ride-sessions/{session_id}/rate-driver")
# def rate_driver(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Rider rates the driver"""
#     booking_id = payload.get("booking_id")
#     rating = payload.get("rating")
#     feedback = payload.get("feedback", "")
    
#     if rating < 1 or rating > 5:
#         raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id
#     ).first()
    
#     if not rider:
#         raise HTTPException(status_code=404, detail="Session rider not found")
    
#     if rider.rider_rating:
#         raise HTTPException(status_code=400, detail="Rating already submitted")
    
#     rider.rider_rating = rating
#     rider.rider_feedback = feedback
#     db.commit()
    
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
#     if session:
#         driver = db.query(User).filter(User.phone_number == session.driver_phone).first()
#         if driver:
#             all_ratings = db.query(RideSessionRider.rider_rating).filter(
#                 RideSessionRider.session_id == session_id,
#                 RideSessionRider.rider_rating.isnot(None)
#             ).all()
#             ratings_list = [r[0] for r in all_ratings if r[0]]
#             if ratings_list:
#                 driver.avg_rating = sum(ratings_list) / len(ratings_list)
#                 driver.total_ratings = len(ratings_list)
#                 db.commit()
    
#     return {"message": "Driver rated successfully"}


# @router.post("/ride-sessions/{session_id}/rate-rider")
# def rate_rider(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Driver rates a rider"""
#     booking_id = payload.get("booking_id")
#     rating = payload.get("rating")
#     feedback = payload.get("feedback", "")
    
#     if rating < 1 or rating > 5:
#         raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id
#     ).first()
    
#     if not rider:
#         raise HTTPException(status_code=404, detail="Rider not found")
    
#     if rider.driver_rating:
#         raise HTTPException(status_code=400, detail="Rating already submitted")
    
#     rider.driver_rating = rating
#     rider.driver_feedback = feedback
#     db.commit()
    
#     return {"message": "Rider rated successfully"}


# @router.post("/ride-sessions/{session_id}/location")
# def update_driver_location(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Update driver's current location for live tracking"""
#     lat = payload.get("lat")
#     lng = payload.get("lng")
    
#     if lat is None or lng is None:
#         raise HTTPException(status_code=400, detail="Latitude and longitude required")
    
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")
    
#     session.current_lat = lat
#     session.current_lng = lng
#     db.commit()
    
#     for rider in session.riders:
#         if rider.status in ["accepted", "reached_pickup", "boarded"]:
#             emit_to_user(rider.rider_phone, "driver-location-update", {
#                 "latitude": lat,
#                 "longitude": lng,
#                 "session_id": session_id
#             })
    
#     return {"message": "Location updated"}


# @router.post("/ride-sessions/{session_id}/sos")
# def trigger_sos(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Trigger SOS alert for emergency"""
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")
    
#     session.sos_active = True
#     session.emergency_note = payload.get("note")
#     db.commit()
    
#     for rider in session.riders:
#         emit_to_user(rider.rider_phone, "sos-triggered", {
#             "session_id": session_id,
#             "message": "Emergency SOS has been triggered"
#         })
    
#     return {"message": "SOS triggered successfully"}


# # ============================================
# # RIDE FEEDBACK ENDPOINTS
# # ============================================

# @router.get("/ride/{ride_id}/ratings")
# def get_ride_ratings(ride_id: int, db: Session = Depends(get_db)):
#     """Get all ratings for a ride (for display after completion)"""
#     session = db.query(RideSession).filter(
#         RideSession.ride_id == ride_id,
#         RideSession.status == "completed"
#     ).order_by(RideSession.id.desc()).first()
    
#     if not session:
#         return {"ratings": []}
    
#     ratings = []
#     for rider in session.riders:
#         ratings.append({
#             "booking_id": rider.booking_id,
#             "rider_name": rider.rider_name,
#             "rider_phone": rider.rider_phone,
#             "rider_photo": rider.rider_photo,
#             "driver_rating_given": rider.driver_rating is not None,
#             "driver_rating": rider.driver_rating,
#             "driver_feedback": rider.driver_feedback,
#             "rider_rating_given": rider.rider_rating is not None,
#             "rider_rating": rider.rider_rating,
#             "rider_feedback": rider.rider_feedback,
#             "status": rider.status
#         })
    
#     return {"ratings": ratings}

# @router.put("/update-ride/{ride_id}")
# def update_ride(ride_id: int, data: UpdateRideRequest, db: Session = Depends(get_db)):
#     """Update an existing ride"""
#     normalized_phone = normalize_phone(data.phone_number)
    
#     ride = db.query(Ride).filter(
#         Ride.id == ride_id,
#         Ride.phone_number == normalized_phone
#     ).first()
    
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found or you don't have permission to edit it")
    
#     if ride.started_at:
#         raise HTTPException(status_code=400, detail="Cannot edit ride - Ride has already started")
    
#     if ride.cancellation_reason:
#         raise HTTPException(status_code=400, detail="Cannot edit cancelled ride")
    
#     confirmed_bookings = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status == "accepted"
#     ).all()
    
#     has_confirmed_bookings = len(confirmed_bookings) > 0
#     total_booked_seats = sum(b.seats_booked for b in confirmed_bookings)
    
#     duration_minutes = parse_duration_to_minutes(data.duration_text)
    
#     departure_time_utc = data.departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         departure_time_utc = departure_time_utc.astimezone(timezone.utc)
    
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
#     min_departure_time = datetime.now(timezone.utc) + timedelta(minutes=30)
#     if departure_time_utc < min_departure_time:
#         min_time_ist = to_ist(min_departure_time)
#         raise HTTPException(status_code=400, detail=f"Departure time must be at least 30 minutes from now")
    
#     if data.available_seats < total_booked_seats:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Cannot reduce seats below {total_booked_seats} as you have {total_booked_seats} confirmed passenger(s)."
#         )
    
#     distance = calculate_distance_km(
#         data.origin_coords[1], data.origin_coords[0],
#         data.destination_coords[1], data.destination_coords[0]
#     )
    
#     MIN_DISTANCE_KM = 3
#     MAX_DISTANCE_KM = 300
    
#     if distance < MIN_DISTANCE_KM:
#         raise HTTPException(status_code=400, detail=f"Pickup and destination are too close ({distance:.1f} km).")
#     if distance > MAX_DISTANCE_KM:
#         raise HTTPException(status_code=400, detail=f"Distance too far ({distance:.1f} km).")
    
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
#                     detail=f"Cannot disable Women Only mode - {female_bookings} female passenger(s) have already booked this ride."
#                 )
    
#     time_diff_minutes = abs((departure_time_utc - ride.departure_time).total_seconds()) / 60
    
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
#                 detail=f"Cannot modify: {', '.join(critical_changes)}. This ride has {len(confirmed_bookings)} confirmed booking(s)."
#             )
    
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
    
#     remaining_seats = ride.available_seats - total_booked_seats
#     if remaining_seats <= 0 and ride.status == "active":
#         ride.status = "full"
#     elif remaining_seats > 0 and ride.status == "full":
#         ride.status = "active"
    
#     db.commit()
#     db.refresh(ride)
    
#     # ============================================
#     # IN-APP NOTIFICATION TO DRIVER
#     # ============================================
#     try:
#         origin_short = data.origin.split(",")[0].strip() if data.origin else "start"
#         dest_short = data.destination.split(",")[0].strip() if data.destination else "destination"
        
#         notification = UserNotification(
#             phone_number=normalized_phone,
#             title="Ride Updated! 🔄",
#             message=f"Your ride from {origin_short} to {dest_short} has been updated successfully.",
#             type=NotificationType.RIDE,
#             action_type="ride",
#             action_value=str(ride.id),
#             is_read=False,
#             is_deleted=False
#         )
#         db.add(notification)
#         db.commit()
#         print(f"✅ In-app notification sent to driver: {normalized_phone}")
#     except Exception as e:
#         print(f"Error creating update notification: {str(e)}")
    
#     # ============================================
#     # EMAIL NOTIFICATION TO DRIVER
#     # ============================================
#     try:
#         driver_email = get_user_email(db, normalized_phone)
#         print(f"📧 Driver email check: {driver_email}")
        
#         if driver_email:
#             driver_name = get_user_email(db, normalized_phone)
#             email_ride_data = {
#                 "origin": ride.origin,
#                 "destination": ride.destination,
#                 "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
#                 "seats_available": ride.available_seats,
#                 "price_per_seat": ride.price_per_seat
#             }
            
#             print(f"📧 Sending ride update email to driver: {driver_email}")
#             email_sent = send_ride_notification_email(
#                 driver_email,
#                 driver_name,
#                 email_ride_data,
#                 "ride_updated_driver",
#                 None,
#                 ride.id
#             )
#             print(f"📧 Email sent result: {email_sent}")
#         else:
#             print(f"⚠️ No email found for driver: {normalized_phone}")
#     except Exception as e:
#         print(f"❌ Failed to send ride update email to driver: {str(e)}")
#         import traceback
#         traceback.print_exc()
    
#     # ============================================
#     # NOTIFY ALL PASSENGERS ABOUT RIDE UPDATE
#     # ============================================
#     if has_confirmed_bookings:
#         print(f"📧 Notifying {len(confirmed_bookings)} passengers about ride update")
#         for booking in confirmed_bookings:
#             try:
#                 passenger_email = get_user_email(db, booking.passenger_phone)
#                 print(f"📧 Passenger email check for {booking.passenger_phone}: {passenger_email}")
                
#                 if passenger_email:
#                     passenger_name = get_user_email(db, booking.passenger_phone)
#                     passenger_email_data = {
#                         "origin": ride.origin,
#                         "destination": ride.destination,
#                         "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
#                         "message": f"The ride from {ride.origin} to {ride.destination} has been updated by the driver. Please check the app for details."
#                     }
                    
#                     print(f"📧 Sending ride update email to passenger: {passenger_email}")
#                     email_sent = send_ride_notification_email(
#                         passenger_email,
#                         passenger_name,
#                         passenger_email_data,
#                         "ride_updated",
#                         booking.id,
#                         ride.id
#                     )
#                     print(f"📧 Email sent to passenger {passenger_email}: {email_sent}")
#                 else:
#                     print(f"⚠️ No email found for passenger: {booking.passenger_phone}")
#             except Exception as e:
#                 print(f"❌ Failed to send update email to passenger {booking.passenger_phone}: {str(e)}")
    
#     return {
#         "message": "Ride updated successfully",
#         "ride_id": ride.id,
#         "remaining_seats": max(0, ride.available_seats - total_booked_seats),
#         "total_booked": total_booked_seats
#     }

# @router.put("/booking/{booking_id}/modify-seats")
# def modify_booking_seats(booking_id: int, request: ModifySeatsRequest, db: Session = Depends(get_db)):
#     """Modify seats for a pending booking (not modification request)"""
#     booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")
    
#     if booking.status != "pending":
#         raise HTTPException(status_code=400, detail="Only pending bookings can be directly modified")
    
#     ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     new_seats = request.new_seats
    
#     if new_seats <= 0:
#         raise HTTPException(status_code=400, detail="Seat count must be at least 1")
    
#     if ride.status not in ["active", "full"]:
#         raise HTTPException(status_code=400, detail="Ride is no longer available")
    
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
    
#     if request.pickup_address is not None:
#         booking.pickup_address = request.pickup_address
#     if request.dropoff_address is not None:
#         booking.dropoff_address = request.dropoff_address
#     if request.pickup_place_name is not None:
#         booking.pickup_place_name = request.pickup_place_name
#     if request.dropoff_place_name is not None:
#         booking.dropoff_place_name = request.dropoff_place_name
    
#     db.commit()
    
#     try:
#         notification = UserNotification(
#             phone_number=ride.phone_number,
#             title="Booking Modified 🔄",
#             message=f"Passenger has modified their booking from {old_seats} to {new_seats} seat(s).",
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
    
#     try:
#         emit_to_user(ride.phone_number, "booking-modified", {
#             "booking_id": booking.id,
#             "passenger_phone": booking.passenger_phone,
#             "old_seats": old_seats,
#             "new_seats": new_seats,
#             "ride_id": ride.id
#         })
#     except Exception as e:
#         print(f"Error emitting socket event: {str(e)}")
    
#     return {
#         "message": f"Seats updated from {old_seats} to {new_seats}",
#         "booking_id": booking.id,
#         "new_seats": new_seats,
#         "new_total": booking.total_amount
#     }


# def check_and_auto_cancel_expired_rides(db: Session):
#     """Check for rides that haven't started within 30 minutes of departure and auto-cancel them"""
#     now = datetime.now(timezone.utc)
#     cutoff_time = now - timedelta(minutes=30)
    
#     expired_rides = db.query(Ride).filter(
#         Ride.departure_time <= cutoff_time,
#         Ride.started_at.is_(None),
#         Ride.status.in_(["active", "full"]),
#         Ride.cancellation_reason.is_(None)
#     ).all()
    
#     auto_cancelled_count = 0
    
#     for ride in expired_rides:
#         ride.status = "cancelled"
#         ride.cancellation_reason = "Auto-cancelled: Ride was not started within 30 minutes of departure time"
        
#         pending_mods = db.query(ModificationRequest).filter(
#             ModificationRequest.ride_id == ride.id,
#             ModificationRequest.status == "pending"
#         ).all()
        
#         for mod in pending_mods:
#             mod.status = "cancelled"
#             mod.rejection_reason = "Ride auto-cancelled - not started on time"
#             mod.cancelled_at = now
        
#         accepted_bookings = db.query(RideBooking).filter(
#             RideBooking.ride_id == ride.id,
#             RideBooking.status == "accepted"
#         ).all()
        
#         for booking in accepted_bookings:
#             booking.status = "cancelled"
#             booking.cancellation_reason = "Ride auto-cancelled - not started on time"
            
#             notification = UserNotification(
#                 phone_number=booking.passenger_phone,
#                 title="Ride Auto-cancelled ⏰",
#                 message=f"The ride from {ride.origin} to {ride.destination} has been auto-cancelled as it was not started on time.",
#                 type=NotificationType.RIDE,
#                 action_type="cancellation",
#                 action_value=str(ride.id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
            
#             emit_to_user(booking.passenger_phone, "ride-auto-cancelled", {
#                 "ride_id": ride.id,
#                 "booking_id": booking.id,
#                 "message": "Ride was not started on time and has been auto-cancelled"
#             })
        
#         auto_cancelled_count += 1
    
#     if auto_cancelled_count > 0:
#         db.commit()
#         print(f"Auto-cancelled {auto_cancelled_count} expired rides")
    
#     return auto_cancelled_count


# @router.post("/rides/check-auto-cancel")
# def check_auto_cancel_rides(db: Session = Depends(get_db)):
#     """Endpoint to manually trigger auto-cancellation check"""
#     count = check_and_auto_cancel_expired_rides(db)
#     return {"message": f"Auto-cancelled {count} expired rides", "count": count}


# # ============================================
# # RIDE REQUEST ALERTS (EMAIL NOTIFICATIONS FOR MATCHING RIDES)
# # ============================================

# class RideRequestAlert(BaseModel):
#     from_location: str
#     to_location: str
#     from_coords: Optional[List[float]] = None
#     to_coords: Optional[List[float]] = None
#     preferred_date: Optional[datetime] = None
#     preferred_time: Optional[str] = None
#     seats_needed: int = 1
#     passenger_phone: str
#     passenger_name: Optional[str] = None
#     passenger_email: str
#     notes: Optional[str] = None


# def send_ride_available_email_azure(to_email: str, passenger_name: str, ride_data: dict) -> bool:
#     """Send email notification using Azure Communication Services when a matching ride is posted"""
    
#     from azure.communication.email import EmailClient
#     from azure.core.exceptions import HttpResponseError

#     AZURE_EMAIL_CONNECTION_STRING = os.getenv("AZURE_EMAIL_CONNECTION_STRING")
#     AZURE_EMAIL_FROM = "DoNotReply@drivve.in"
    
#     if not AZURE_EMAIL_CONNECTION_STRING:
#         print("❌ Azure Email connection string not configured")
#         return False
    
#     if not to_email or '@' not in to_email:
#         print(f"❌ Invalid email address: {to_email}")
#         return False
    
#     try:
#         print(f"📧 Initializing Azure Email client...")
#         email_client = EmailClient.from_connection_string(AZURE_EMAIL_CONNECTION_STRING)
        
#         departure_time = ride_data.get('departure_time_display', 'Flexible')
#         deep_link = f"drivve://ride/{ride_data.get('ride_id')}"
        
#         html_content = f"""
#         <html>
#             <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
#                 <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px;">
#                     <div style="text-align: center; margin-bottom: 30px;">
#                         <h2 style="color: #ED7117; margin-top: 10px;">🚗 Ride Available!</h2>
#                     </div>
                    
#                     <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
#                         Hey {passenger_name or 'there'},
#                     </p>
                    
#                     <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
#                         Good news! A ride matching your requested route has been posted:
#                     </p>
                    
#                     <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #ED7117;">
#                         <div style="margin-bottom: 15px;">
#                             <div style="display: flex; align-items: center; margin-bottom: 10px;">
#                                 <span style="font-size: 20px; margin-right: 10px;">📍</span>
#                                 <div>
#                                     <div style="font-size: 12px; color: #6b7280;">FROM</div>
#                                     <div style="font-weight: bold; color: #111827;">{ride_data.get('origin', 'N/A')}</div>
#                                 </div>
#                             </div>
#                             <div style="display: flex; align-items: center;">
#                                 <span style="font-size: 20px; margin-right: 10px;">🎯</span>
#                                 <div>
#                                     <div style="font-size: 12px; color: #6b7280;">TO</div>
#                                     <div style="font-weight: bold; color: #111827;">{ride_data.get('destination', 'N/A')}</div>
#                                 </div>
#                             </div>
#                         </div>
                        
#                         <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 10px;">
#                             <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
#                                 <span style="color: #6b7280;">📅 Date & Time</span>
#                                 <span style="font-weight: 600;">{departure_time}</span>
#                             </div>
#                             <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
#                                 <span style="color: #6b7280;">💺 Seats Available</span>
#                                 <span style="font-weight: 600;">{ride_data.get('seats_available', 'Check app')} seats</span>
#                             </div>
#                             <div style="display: flex; justify-content: space-between;">
#                                 <span style="color: #6b7280;">💰 Price</span>
#                                 <span style="font-weight: 600; color: #ED7117;">₹{ride_data.get('price_per_seat', 'Check app')} per seat</span>
#                             </div>
#                         </div>
#                     </div>
                    
#                     <div style="text-align: center; margin: 30px 0;">
#                         <a href="{deep_link}" 
#                            style="background-color: #ED7117; color: white; padding: 12px 30px; 
#                                   text-decoration: none; border-radius: 25px; display: inline-block;
#                                   font-weight: bold;">
#                             Book This Ride Now →
#                         </a>
#                     </div>
                    
#                     <div style="text-align: center; border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 30px;">
#                         <p style="font-size: 12px; color: #9ca3af;">
#                             Safe travels!<br>
#                             <strong>Team Drivve</strong>
#                         </p>
#                     </div>
                    
#                 </div>
#             </body>
#         </html>
#         """
        
#         message = {
#             "senderAddress": AZURE_EMAIL_FROM,
#             "recipients": {
#                 "to": [{"address": to_email}]
#             },
#             "content": {
#                 "subject": f"🚗 Ride Available: {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', 'Available')[:50]}",
#                 "html": html_content
#             }
#         }
        
#         print(f"📤 Sending email to {to_email}...")
#         poller = email_client.begin_send(message)
#         result = poller.result()
#         print(f"✅ Ride alert email sent to {to_email}")
#         return True
        
#     except HttpResponseError as e:
#         print(f"❌ Azure HTTP Error: {e.message}")
#         return False
#     except Exception as e:
#         print(f"❌ Failed to send ride alert email: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return False


# def check_matching_ride_requests(db: Session, ride: Ride):
#     """Check for matching ride requests when a new ride is posted"""
#     try:
#         print(f"\n🔍 ========== CHECKING MATCHING RIDE REQUESTS ==========")
        
#         ride_time_ist = to_ist(ride.departure_time)
        
#         print(f"🚗 New ride posted:")
#         print(f"   From: {ride.origin[:50]}")
#         print(f"   To: {ride.destination[:50]}")
#         print(f"   Departure (IST): {ride_time_ist.strftime('%Y-%m-%d %H:%M:%S')}")
#         print(f"   Departure (IST display): {ride_time_ist.strftime('%d %b %Y, %I:%M %p')}")
        
#         ride_from = ride.origin.split(',')[0].strip().lower()
#         ride_to = ride.destination.split(',')[0].strip().lower()
        
#         now_utc = datetime.now(timezone.utc)
#         active_requests = db.query(RideRequest).filter(
#             RideRequest.status == "active",
#             RideRequest.expires_at > now_utc
#         ).all()
        
#         print(f"\n📋 Found {len(active_requests)} active ride requests")
        
#         notified_count = 0
        
#         for req in active_requests:
#             print(f"\n--- Checking Request #{req.id} ---")
            
#             req_from = req.from_location.split(',')[0].strip().lower()
#             req_to = req.to_location.split(',')[0].strip().lower()
            
#             from_match = (ride_from == req_from or ride_from in req_from or req_from in ride_from)
#             to_match = (ride_to == req_to or ride_to in req_to or req_to in ride_to)
            
#             if not (from_match and to_match):
#                 print(f"   ❌ Location mismatch")
#                 continue
            
#             print(f"   ✅ Location matched")
            
#             time_match = True
#             if req.preferred_date:
#                 req_time_ist = to_ist(req.preferred_date)
                
#                 time_diff = abs((ride_time_ist - req_time_ist).total_seconds() / 3600)
                
#                 if time_diff > 6:
#                     print(f"   ❌ Time difference too large (>6 hours)")
#                     time_match = False
#                 else:
#                     print(f"   ✅ Time within 6-hour window")
#             else:
#                 print(f"   ⏰ No preferred time specified")
            
#             if not time_match:
#                 continue
            
#             total_booked = get_total_booked_seats(db, ride.id)
#             available_seats = ride.available_seats - total_booked
            
#             if available_seats < req.seats_needed:
#                 print(f"   ❌ Not enough seats available")
#                 continue
            
#             if not req.passenger_email or '@' not in req.passenger_email:
#                 print(f"   ❌ No valid email address for this request")
#                 continue
            
#             ride_data = {
#                 "ride_id": ride.id,
#                 "origin": ride.origin,
#                 "destination": ride.destination,
#                 "departure_time_display": ride_time_ist.strftime("%d %b %Y, %I:%M %p"),
#                 "seats_available": available_seats,
#                 "price_per_seat": ride.price_per_seat,
#                 "request_date": to_ist(req.created_at).strftime("%d %b %Y")
#             }
            
#             print(f"\n📧 SENDING EMAIL NOTIFICATION:")
#             print(f"   To: {req.passenger_email}")
#             print(f"   Name: {req.passenger_name or 'User'}")
            
#             email_sent = send_ride_available_email_azure(
#                 req.passenger_email,
#                 req.passenger_name or "there",
#                 ride_data
#             )
            
#             if email_sent:
#                 req.status = "notified"
#                 req.notified_at = datetime.now(timezone.utc)
#                 notified_count += 1
#                 print(f"   ✅ Email sent successfully!")
#             else:
#                 print(f"   ❌ Failed to send email")
        
#         if notified_count > 0:
#             db.commit()
#             print(f"\n✅ Total notifications sent: {notified_count}")
        
#         print(f"🔍 ==================================\n")
#         return notified_count
        
#     except Exception as e:
#         print(f"❌ Error in check_matching_ride_requests: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return 0


# @router.post("/request-ride-alert")
# def request_ride_alert(
#     request: RideRequestAlert,
#     db: Session = Depends(get_db)
# ):
#     """Passenger requests email notification when a matching ride is posted"""
#     try:
#         normalized_phone = normalize_phone(request.passenger_phone)
        
#         existing_request = db.query(RideRequest).filter(
#             RideRequest.passenger_phone == normalized_phone,
#             func.lower(RideRequest.from_location) == func.lower(request.from_location),
#             func.lower(RideRequest.to_location) == func.lower(request.to_location),
#             RideRequest.status == "active",
#             RideRequest.expires_at > datetime.now(timezone.utc)
#         ).first()
        
#         if existing_request:
#             return {
#                 "success": False,
#                 "message": "You already have an active request for this route. We'll notify you when a ride is available.",
#                 "request_id": existing_request.id,
#                 "expires_at": existing_request.expires_at.isoformat()
#             }
        
#         expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
#         new_request = RideRequest(
#             passenger_phone=normalized_phone,
#             passenger_name=request.passenger_name,
#             passenger_email=request.passenger_email,
#             from_location=request.from_location,
#             to_location=request.to_location,
#             from_lat=request.from_coords[1] if request.from_coords and len(request.from_coords) >= 2 else None,
#             from_lon=request.from_coords[0] if request.from_coords and len(request.from_coords) >= 2 else None,
#             to_lat=request.to_coords[1] if request.to_coords and len(request.to_coords) >= 2 else None,
#             to_lon=request.to_coords[0] if request.to_coords and len(request.to_coords) >= 2 else None,
#             preferred_date=request.preferred_date,
#             preferred_time=request.preferred_time,
#             seats_needed=request.seats_needed,
#             notes=request.notes,
#             status="active",
#             expires_at=expires_at
#         )
        
#         db.add(new_request)
#         db.commit()
#         db.refresh(new_request)
        
#         return {
#             "success": True,
#             "message": "Ride request alert created successfully. We'll email you when a matching ride is posted.",
#             "request_id": new_request.id,
#             "expires_at": expires_at.isoformat()
#         }
        
#     except Exception as e:
#         print(f"Error creating ride request alert: {str(e)}")
#         db.rollback()
#         raise HTTPException(status_code=500, detail=str(e))


# @router.get("/my-ride-requests/{phone_number}")
# def get_user_ride_requests(
#     phone_number: str,
#     db: Session = Depends(get_db)
# ):
#     """Get all ride requests for a user"""
#     try:
#         normalized_phone = normalize_phone(phone_number)
        
#         requests = db.query(RideRequest).filter(
#             RideRequest.passenger_phone == normalized_phone
#         ).order_by(RideRequest.created_at.desc()).all()
        
#         return {
#             "success": True,
#             "requests": [
#                 {
#                     "id": req.id,
#                     "from_location": req.from_location,
#                     "to_location": req.to_location,
#                     "preferred_date": req.preferred_date.isoformat() if req.preferred_date else None,
#                     "preferred_time": req.preferred_time,
#                     "seats_needed": req.seats_needed,
#                     "status": req.status,
#                     "created_at": req.created_at.isoformat(),
#                     "expires_at": req.expires_at.isoformat() if req.expires_at else None,
#                     "notified_at": req.notified_at.isoformat() if req.notified_at else None,
#                     "notes": req.notes
#                 }
#                 for req in requests
#             ]
#         }
        
#     except Exception as e:
#         print(f"Error getting ride requests: {str(e)}")
#         return {"success": False, "requests": [], "error": str(e)}


# @router.delete("/ride-request/{request_id}")
# def cancel_ride_request(
#     request_id: int,
#     phone_number: str,
#     db: Session = Depends(get_db)
# ):
#     """Cancel an active ride request"""
#     try:
#         normalized_phone = normalize_phone(phone_number)
        
#         ride_request = db.query(RideRequest).filter(
#             RideRequest.id == request_id,
#             RideRequest.passenger_phone == normalized_phone
#         ).first()
        
#         if not ride_request:
#             raise HTTPException(status_code=404, detail="Ride request not found")
        
#         if ride_request.status != "active":
#             raise HTTPException(status_code=400, detail=f"Cannot cancel request that is already {ride_request.status}")
        
#         ride_request.status = "cancelled"
#         ride_request.cancelled_at = datetime.now(timezone.utc)
#         db.commit()
        
#         return {
#             "success": True,
#             "message": "Ride request cancelled successfully"
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"Error cancelling ride request: {str(e)}")
#         db.rollback()
#         raise HTTPException(status_code=500, detail=str(e))


# @router.post("/ride-requests/cleanup-expired")
# def cleanup_expired_ride_requests(db: Session = Depends(get_db)):
#     """Admin endpoint to mark expired ride requests"""
#     try:
#         expired_requests = db.query(RideRequest).filter(
#             RideRequest.status == "active",
#             RideRequest.expires_at < datetime.now(timezone.utc)
#         ).all()
        
#         expired_count = 0
#         for req in expired_requests:
#             req.status = "expired"
#             expired_count += 1
        
#         db.commit()
        
#         return {
#             "success": True,
#             "message": f"Marked {expired_count} expired ride requests",
#             "expired_count": expired_count
#         }
        
#     except Exception as e:
#         print(f"Error cleaning up expired requests: {str(e)}")
#         return {"success": False, "error": str(e)}


# # ============================================
# # ADDITIONAL ENDPOINTS (EARNINGS, RATINGS, ETC.)
# # ============================================

# @router.get("/driver-earnings")
# def get_driver_earnings(phone_number: str, db: Session = Depends(get_db)):
#     """Get total earnings from completed rides for a driver"""
#     normalized_phone = normalize_phone(phone_number)
    
#     completed_rides = db.query(Ride).filter(
#         Ride.phone_number == normalized_phone,
#         Ride.status == "completed"
#     ).all()
    
#     total_earnings = 0
#     rides_details = []
    
#     for ride in completed_rides:
#         bookings = db.query(RideBooking).filter(
#             RideBooking.ride_id == ride.id,
#             RideBooking.status.in_(["accepted", "completed"])
#         ).all()
        
#         ride_total = 0
#         for booking in bookings:
#             ride_total += booking.total_amount or 0
        
#         total_earnings += ride_total
        
#         rides_details.append({
#             "ride_id": ride.id,
#             "origin": ride.origin,
#             "destination": ride.destination,
#             "departure_time": ride.departure_time.isoformat(),
#             "total_amount": ride_total,
#             "bookings_count": len(bookings)
#         })
    
#     return {
#         "success": True,
#         "phone_number": normalized_phone,
#         "total_earnings": total_earnings,
#         "completed_rides_count": len(completed_rides),
#         "rides": rides_details
#     }


# @router.get("/users/{phone_number}/rating")
# def get_user_rating(phone_number: str, db: Session = Depends(get_db)):
#     """Get user's average rating from completed rides"""
#     normalized_phone = normalize_phone(phone_number)
    
#     user = db.query(User).filter(User.phone_number == normalized_phone).first()
    
#     if not user:
#         return {
#             "success": False,
#             "message": "User not found"
#         }
    
#     if user.avg_rating and user.avg_rating > 0:
#         return {
#             "success": True,
#             "phone_number": normalized_phone,
#             "average_rating": round(float(user.avg_rating), 1),
#             "total_ratings": user.total_ratings or 0,
#             "source": "user_model"
#         }
    
#     return {
#         "success": True,
#         "phone_number": normalized_phone,
#         "average_rating": 4.5,
#         "total_ratings": 0
#     }


# @router.get("/api/v1/bookings/{booking_id}/ride")
# def get_ride_from_booking(booking_id: int, db: Session = Depends(get_db)):
#     """Fetch complete ride details from a booking ID"""
#     try:
#         booking = db.query(RideBooking).options(
#             joinedload(RideBooking.ride)
#         ).filter(RideBooking.id == booking_id).first()
        
#         if not booking:
#             raise HTTPException(status_code=404, detail="Booking not found")
        
#         ride = booking.ride
#         if not ride:
#             raise HTTPException(status_code=404, detail="Ride not found for this booking")
        
#         driver = db.query(User).filter(User.phone_number == ride.phone_number).first()
        
#         vehicle = None
#         if ride.vehicle_id:
#             vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first()
        
#         total_booked = get_total_booked_seats(db, ride.id)
#         remaining_seats = max(0, ride.available_seats - total_booked)
        
#         driver_rating = 4.5
#         if driver and driver.avg_rating:
#             driver_rating = float(driver.avg_rating)
        
#         route_coords = ride.route_coordinates
#         if route_coords and isinstance(route_coords, str):
#             import json
#             try:
#                 route_coords = json.loads(route_coords)
#             except:
#                 route_coords = []
        
#         suggested_pickup = None
#         suggested_drop = None
        
#         if booking.intersection_pickup_lat and booking.intersection_pickup_lon:
#             suggested_pickup = {
#                 "lat": float(booking.intersection_pickup_lat),
#                 "lng": float(booking.intersection_pickup_lon)
#             }
#         elif ride.route_coordinates and len(ride.route_coordinates) > 0:
#             first = ride.route_coordinates[0]
#             if isinstance(first, list) and len(first) >= 2:
#                 suggested_pickup = {"lng": float(first[0]), "lat": float(first[1])}
        
#         if booking.intersection_drop_lat and booking.intersection_drop_lon:
#             suggested_drop = {
#                 "lat": float(booking.intersection_drop_lat),
#                 "lng": float(booking.intersection_drop_lon)
#             }
#         elif ride.route_coordinates and len(ride.route_coordinates) > 0:
#             last = ride.route_coordinates[-1]
#             if isinstance(last, list) and len(last) >= 2:
#                 suggested_drop = {"lng": float(last[0]), "lat": float(last[1])}
        
#         ride_status = ride.status
#         if ride.started_at and ride_status != "completed":
#             ride_status = "ongoing"
#         elif ride.cancellation_reason:
#             ride_status = "cancelled"
#         elif remaining_seats == 0 and ride_status == "active":
#             ride_status = "full"
        
#         response_data = {
#             "success": True,
#             "ride": {
#                 "id": ride.id,
#                 "custom_ride_id": getattr(ride, 'custom_ride_id', None),
#                 "origin": ride.origin,
#                 "destination": ride.destination,
#                 "origin_address": getattr(ride, 'origin_address', None),
#                 "destination_address": getattr(ride, 'destination_address', None),
#                 "origin_place_name": getattr(ride, 'origin_place_name', None),
#                 "destination_place_name": getattr(ride, 'destination_place_name', None),
#                 "departure_time": ride.departure_time.isoformat() if ride.departure_time else None,
#                 "available_seats": ride.available_seats,
#                 "price_per_seat": float(ride.price_per_seat) if ride.price_per_seat else 0,
#                 "distance_km": float(ride.distance_km) if ride.distance_km else None,
#                 "duration_text": ride.duration_text,
#                 "route_coordinates": route_coords,
#                 "origin_latitude": float(ride.origin_lat) if ride.origin_lat else None,
#                 "origin_longitude": float(ride.origin_lon) if ride.origin_lon else None,
#                 "destination_latitude": float(ride.destination_lat) if ride.destination_lat else None,
#                 "destination_longitude": float(ride.destination_lon) if ride.destination_lon else None,
#                 "women_only": ride.women_only or False,
#                 "status": ride_status,
#                 "started_at": ride.started_at.isoformat() if ride.started_at else None,
#                 "cancellation_reason": ride.cancellation_reason,
#                 "preferences": ride.preferences,
#                 "driver_name": driver.full_name or f"Driver {ride.phone_number[-4:]}" if driver else "Driver",
#                 "driver_phone": ride.phone_number,
#                 "driver_user_id": driver.user_id if driver else None,
#                 "driver_profile_picture": driver.profile_picture if driver else None,
#                 "driver_rating": driver_rating,
#                 "suggested_pickup_point": suggested_pickup,
#                 "suggested_drop_point": suggested_drop,
#                 "vehicle": {
#                     "id": vehicle.id if vehicle else None,
#                     "make": vehicle.make if vehicle else None,
#                     "model": vehicle.model if vehicle else None,
#                     "color": vehicle.color if vehicle else None,
#                     "registration_number": vehicle.registration_number if vehicle else None,
#                     "photo_url": vehicle.photo_url if vehicle else None,
#                 } if vehicle else None,
#                 "total_booked_seats": total_booked,
#                 "remaining_seats": remaining_seats
#             },
#             "booking": {
#                 "id": booking.id,
#                 "custom_booking_id": getattr(booking, 'custom_booking_id', None),
#                 "seats_requested": booking.seats_booked,
#                 "status": booking.status,
#                 "total_amount": float(booking.total_amount) if booking.total_amount else None,
#                 "created_at": booking.created_at.isoformat() if booking.created_at else None,
#                 "pickup_address": getattr(booking, 'pickup_address', None),
#                 "dropoff_address": getattr(booking, 'dropoff_address', None),
#                 "pickup_place_name": getattr(booking, 'pickup_place_name', None),
#                 "dropoff_place_name": getattr(booking, 'dropoff_place_name', None),
#                 "pickup_walk_distance_m": booking.pickup_walk_distance_m,
#                 "drop_walk_distance_m": booking.drop_walk_distance_m,
#                 "intersection_pickup": {
#                     "lat": float(booking.intersection_pickup_lat) if booking.intersection_pickup_lat else None,
#                     "lng": float(booking.intersection_pickup_lon) if booking.intersection_pickup_lon else None
#                 } if booking.intersection_pickup_lat and booking.intersection_pickup_lon else None,
#                 "intersection_drop": {
#                     "lat": float(booking.intersection_drop_lat) if booking.intersection_drop_lat else None,
#                     "lng": float(booking.intersection_drop_lon) if booking.intersection_drop_lon else None
#                 } if booking.intersection_drop_lat and booking.intersection_drop_lon else None
#             }
#         }
        
#         return response_data
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"Error in get_ride_from_booking: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=f"Error fetching ride details: {str(e)}")


# # ============================================
# # RIDE SESSION WITH INDIVIDUAL QR CODES
# # ============================================

# @router.get("/ride-sessions/driver/{ride_id}/riders")
# def get_driver_session_riders(
#     ride_id: int, 
#     driver_phone: str, 
#     db: Session = Depends(get_db)
# ):
#     """Get driver's active ride session with individual QR codes for each rider"""
#     driver_phone = normalize_phone(driver_phone)
    
#     session = db.query(RideSession).filter(
#         RideSession.ride_id == ride_id,
#         RideSession.driver_phone == driver_phone,
#         RideSession.status.in_(["driver_started", "boarding", "en_route"])
#     ).order_by(RideSession.id.desc()).first()
    
#     if not session:
#         raise HTTPException(status_code=404, detail="No active ride session found")
    
#     for rider in session.riders:
#         if rider.status == "accepted" and not rider.individual_qr_token:
#             rider.individual_qr_token = secrets.token_hex(16)
#             rider.qr_expires_at = datetime.now(timezone.utc) + timedelta(hours=2)
    
#     db.commit()
#     db.refresh(session)
    
#     riders_data = []
#     for rider in session.riders:
#         riders_data.append({
#             "id": rider.id,
#             "booking_id": rider.booking_id,
#             "rider_name": rider.rider_name or f"Rider {rider.rider_phone[-4:]}",
#             "rider_phone": rider.rider_phone,
#             "rider_photo": rider.rider_photo,
#             "status": rider.status,
#             "individual_qr_token": rider.individual_qr_token,
#             "qr_expires_at": rider.qr_expires_at.isoformat() if rider.qr_expires_at else None,
#             "pickup_location": rider.pickup_location,
#             "dropoff_location": rider.dropoff_location,
#             "seats_booked": rider.seats_booked or 1,
#             "price_paid": float(rider.price_paid) if rider.price_paid else None
#         })
    
#     return {
#         "session_id": session.id,
#         "ride_id": ride_id,
#         "session_status": session.status,
#         "current_phase": session.current_phase,
#         "total_riders": len(session.riders),
#         "boarded_count": sum(1 for r in session.riders if r.status in ["boarded", "dropped_off", "completed"]),
#         "dropped_count": sum(1 for r in session.riders if r.status in ["dropped_off", "completed"]),
#         "riders": riders_data,
#         "qr_code_token": session.qr_code_token
#     }


# @router.post("/ride-sessions/rider/board-by-token")
# def rider_board_by_token(payload: dict, db: Session = Depends(get_db)):
#     """Rider boards by scanning individual QR code"""
#     from sqlalchemy.orm import joinedload
#     from datetime import datetime, timezone
#     import secrets
    
#     try:
#         individual_token = payload.get("qr_code_token")
#         rider_phone = normalize_phone(payload.get("rider_phone", ""))
#         booking_id = payload.get("booking_id")
        
#         print(f"📱 Boarding by token: token={individual_token[:20] if individual_token else 'None'}..., phone={rider_phone}, booking={booking_id}")
        
#         if not individual_token:
#             raise HTTPException(status_code=400, detail="QR code token is required")
        
#         rider = db.query(RideSessionRider).options(
#             joinedload(RideSessionRider.session)
#         ).filter(
#             RideSessionRider.individual_qr_token == individual_token,
#             RideSessionRider.status.in_(["accepted", "reached_pickup"])
#         ).first()
        
#         if not rider:
#             if booking_id:
#                 rider = db.query(RideSessionRider).options(
#                     joinedload(RideSessionRider.session)
#                 ).filter(
#                     RideSessionRider.booking_id == booking_id,
#                     RideSessionRider.status.in_(["accepted", "reached_pickup"])
#                 ).first()
                
#                 if rider and rider.individual_qr_token == individual_token:
#                     pass
#                 else:
#                     raise HTTPException(status_code=404, detail="Invalid QR code or rider not found")
#             else:
#                 raise HTTPException(status_code=404, detail="Invalid QR code or rider not found")
        
#         if rider.qr_expires_at and rider.qr_expires_at < datetime.now(timezone.utc):
#             rider.individual_qr_token = secrets.token_hex(16)
#             rider.qr_expires_at = datetime.now(timezone.utc) + timedelta(hours=2)
#             db.commit()
#             raise HTTPException(
#                 status_code=400, 
#                 detail="QR code expired. Please ask the driver to refresh the QR code."
#             )
        
#         if rider.status in ["boarded", "dropped_off", "completed"]:
#             return {
#                 "success": True,
#                 "message": f"Rider already {rider.status}",
#                 "already_boarded": True,
#                 "rider_status": rider.status,
#                 "session_id": rider.session_id
#             }
        
#         now = datetime.now(timezone.utc)
#         rider.status = "boarded"
#         rider.boarded_at = now
#         rider.pickup_confirmed = True
        
#         session = rider.session
#         boarded_count = sum(1 for r in session.riders if r.status in ["boarded", "dropped_off", "completed"])
#         total_riders = len(session.riders)
        
#         if boarded_count == total_riders:
#             session.current_phase = "en_route"
#             session.status = "en_route"
#         else:
#             session.current_phase = "boarding"
#             session.status = "boarding"
        
#         db.commit()
        
#         print(f"✅ Rider {rider.rider_name} boarded successfully. Phase: {session.current_phase}")
        
#         try:
#             emit_to_user(session.driver_phone, "rider-boarded", {
#                 "booking_id": rider.booking_id,
#                 "rider_phone": rider.rider_phone,
#                 "rider_name": rider.rider_name or "Rider",
#                 "boarded_count": boarded_count,
#                 "total_riders": total_riders,
#                 "session_id": session.id
#             })
            
#             emit_to_user(rider.rider_phone, "boarding-confirmed", {
#                 "session_id": session.id,
#                 "booking_id": rider.booking_id,
#                 "message": "You have successfully boarded the vehicle"
#             })
#         except Exception as e:
#             print(f"⚠️ Socket error (non-critical): {e}")
        
#         return {
#             "success": True,
#             "message": "Boarding successful",
#             "rider_status": rider.status,
#             "session_status": session.status,
#             "current_phase": session.current_phase,
#             "boarded_count": boarded_count,
#             "total_riders": total_riders,
#             "session_id": session.id
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"💥 Error in rider_board_by_token: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Error boarding rider: {str(e)}")


# @router.post("/ride-sessions/{session_id}/refresh-rider-qr/{rider_id}")
# def refresh_rider_qr_code(
#     session_id: int, 
#     rider_id: int, 
#     payload: dict,
#     db: Session = Depends(get_db)
# ):
#     """Refresh individual QR code for a specific rider"""
#     driver_phone = normalize_phone(payload.get("driver_phone", ""))
    
#     session = db.query(RideSession).filter(
#         RideSession.id == session_id,
#         RideSession.driver_phone == driver_phone
#     ).first()
    
#     if not session:
#         raise HTTPException(status_code=404, detail="Session not found or unauthorized")
    
#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.id == rider_id,
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.status == "accepted"
#     ).first()
    
#     if not rider:
#         raise HTTPException(status_code=404, detail="Rider not found or already boarded")
    
#     rider.individual_qr_token = secrets.token_hex(16)
#     rider.qr_expires_at = datetime.now(timezone.utc) + timedelta(hours=2)
#     db.commit()
    
#     return {
#         "success": True,
#         "message": "QR code refreshed successfully",
#         "rider_id": rider.id,
#         "booking_id": rider.booking_id,
#         "rider_name": rider.rider_name,
#         "individual_qr_token": rider.individual_qr_token,
#         "qr_expires_at": rider.qr_expires_at.isoformat()
#     }


# @router.get("/ride-sessions/rider/session-status/{booking_id}")
# def get_rider_session_status_v2(
#     booking_id: int, 
#     rider_phone: str,
#     db: Session = Depends(get_db)
# ):
#     """Get rider's session status with better error handling"""
#     rider_phone = normalize_phone(rider_phone)
    
#     rider_session = db.query(RideSessionRider).options(
#         joinedload(RideSessionRider.session)
#     ).filter(
#         RideSessionRider.booking_id == booking_id,
#         RideSessionRider.rider_phone == rider_phone
#     ).first()
    
#     if not rider_session:
#         return {
#             "success": False,
#             "message": "No active session found",
#             "has_session": False,
#             "ride_completed": False,
#             "has_rated_driver": False
#         }
    
#     session = rider_session.session
#     ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
    
#     driver = db.query(User).filter(User.phone_number == session.driver_phone).first()
    
#     return {
#         "success": True,
#         "has_session": True,
#         "session_id": session.id,
#         "booking_id": booking_id,
#         "ride_id": session.ride_id,
#         "rider_status": rider_session.status,
#         "session_status": session.status,
#         "current_phase": session.current_phase,
#         "has_rated_driver": rider_session.rider_rating is not None,
#         "driver_rating": rider_session.rider_rating,
#         "ride_completed": session.status == "completed" or rider_session.status == "completed",
#         "driver_name": driver.full_name if driver else "Driver",
#         "driver_phone": session.driver_phone,
#         "driver_photo": driver.profile_picture if driver else None,
#         "driver_rating_avg": float(driver.avg_rating) if driver and driver.avg_rating else 4.5,
#         "origin": ride.origin if ride else None,
#         "destination": ride.destination if ride else None,
#         "pickup_lat": rider_session.pickup_lat,
#         "pickup_lng": rider_session.pickup_lng,
#         "dropoff_lat": rider_session.dropoff_lat,
#         "dropoff_lng": rider_session.dropoff_lng,
#         "current_driver_lat": session.current_lat,
#         "current_driver_lng": session.current_lng,
#         "route_coordinates": ride.route_coordinates if ride else []
#     }


# @router.post("/ride-sessions/{session_id}/sync")
# def sync_session_state(
#     session_id: int,
#     payload: dict,
#     db: Session = Depends(get_db)
# ):
#     """Sync session state - used for recovery after disconnection"""
#     driver_phone = normalize_phone(payload.get("driver_phone", ""))
    
#     session = db.query(RideSession).filter(
#         RideSession.id == session_id,
#         RideSession.driver_phone == driver_phone
#     ).first()
    
#     if not session:
#         raise HTTPException(status_code=404, detail="Session not found")
    
#     boarded_count = sum(1 for r in session.riders if r.status in ["boarded", "dropped_off", "completed"])
#     dropped_count = sum(1 for r in session.riders if r.status in ["dropped_off", "completed"])
#     total_riders = len(session.riders)
    
#     if session.current_phase == "boarding" and boarded_count == total_riders:
#         session.current_phase = "en_route"
#         session.status = "en_route"
#         db.commit()
    
#     riders_data = []
#     for rider in session.riders:
#         riders_data.append({
#             "id": rider.id,
#             "booking_id": rider.booking_id,
#             "rider_name": rider.rider_name,
#             "rider_phone": rider.rider_phone,
#             "status": rider.status,
#             "individual_qr_token": rider.individual_qr_token,
#             "boarded_at": rider.boarded_at.isoformat() if rider.boarded_at else None,
#             "dropped_off_at": rider.dropped_off_at.isoformat() if rider.dropped_off_at else None
#         })
    
#     return {
#         "success": True,
#         "session_id": session.id,
#         "session_status": session.status,
#         "current_phase": session.current_phase,
#         "boarded_count": boarded_count,
#         "dropped_count": dropped_count,
#         "total_riders": total_riders,
#         "current_lat": session.current_lat,
#         "current_lng": session.current_lng,
#         "riders": riders_data
#     }


# @router.post("/ride-sessions/{session_id}/complete-force")
# def complete_ride_force(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     """Driver forcefully completes the ride - marks all pending riders as completed"""
#     driver_phone = normalize_phone(payload.get("driver_phone", ""))
    
#     session = db.query(RideSession).filter(
#         RideSession.id == session_id,
#         RideSession.driver_phone == driver_phone
#     ).first()
    
#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")
    
#     completed_count = 0
#     for rider in session.riders:
#         if rider.status not in ["completed", "dropped_off"]:
#             rider.status = "completed"
#             rider.completed_at = datetime.now(timezone.utc)
#             completed_count += 1
    
#     session.status = "completed"
#     session.current_phase = "completed"
#     session.completed_at = datetime.now(timezone.utc)
    
#     ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
#     if ride:
#         ride.status = "completed"
    
#     db.commit()
    
#     return {
#         "message": "Ride completed successfully",
#         "status": session.status,
#         "completed_riders": completed_count,
#         "total_riders": len(session.riders)
#     }


# @router.post("/booking/{booking_id}/rate")
# def rate_rider_from_booking(
#     booking_id: int, 
#     payload: dict, 
#     db: Session = Depends(get_db)
# ):
#     """Rate a rider from a completed ride (when session is no longer active)"""
#     try:
#         rating = payload.get("rating")
#         feedback = payload.get("feedback", "")
        
#         if rating < 1 or rating > 5:
#             raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
#         booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#         if not booking:
#             raise HTTPException(status_code=404, detail="Booking not found")
        
#         rider_session = db.query(RideSessionRider).filter(
#             RideSessionRider.booking_id == booking_id
#         ).first()
        
#         if rider_session:
#             if rider_session.driver_rating is not None:
#                 raise HTTPException(status_code=400, detail="Rating already submitted")
            
#             rider_session.driver_rating = rating
#             rider_session.driver_feedback = feedback
#         else:
#             booking.driver_rating = rating
#             booking.driver_feedback = feedback
        
#         db.commit()
        
#         return {"message": "Rider rated successfully", "rating": rating}
        
#     except Exception as e:
#         print(f"Error rating rider: {str(e)}")
#         db.rollback()
#         raise HTTPException(status_code=500, detail=str(e))


# @router.get("/booking/{booking_id}/session")
# def get_session_from_booking(booking_id: int, db: Session = Depends(get_db)):
#     """Get the session ID for a booking (for rating after completion)"""
#     try:
#         rider_session = db.query(RideSessionRider).filter(
#             RideSessionRider.booking_id == booking_id
#         ).first()
        
#         if not rider_session:
#             return {"session_id": None, "message": "No session found for this booking"}
        
#         return {
#             "session_id": rider_session.session_id,
#             "booking_id": booking_id,
#             "rider_status": rider_session.status,
#             "already_rated": rider_session.driver_rating is not None
#         }
        
#     except Exception as e:
#         print(f"Error getting session from booking: {str(e)}")
#         return {"session_id": None, "error": str(e)}


# @router.get("/booking/{booking_id}/modification-available")
# def check_modification_available(booking_id: int, db: Session = Depends(get_db)):
#     """Check if user can request modification (one-time check)"""
#     try:
#         booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
#         if not booking:
#             return {
#                 "available": False, 
#                 "reason": "Booking not found",
#                 "code": "NOT_FOUND"
#             }
        
#         existing_modification = db.query(ModificationRequest).filter(
#             ModificationRequest.booking_id == booking_id
#         ).first()
        
#         if existing_modification:
#             return {
#                 "available": False,
#                 "reason": f"You have already submitted a modification request (Status: {existing_modification.status}). One modification only per booking.",
#                 "code": "ALREADY_MODIFIED",
#                 "modification": {
#                     "id": existing_modification.id,
#                     "requested_seats": existing_modification.requested_seats,
#                     "current_seats": existing_modification.current_seats,
#                     "status": existing_modification.status
#                 }
#             }
        
#         ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
#         if not ride:
#             return {"available": False, "reason": "Ride not found", "code": "RIDE_NOT_FOUND"}
        
#         if ride.started_at:
#             return {"available": False, "reason": "Ride has already started", "code": "RIDE_STARTED"}
        
#         if booking.status != "accepted":
#             return {"available": False, "reason": "Booking is not confirmed", "code": "BOOKING_NOT_CONFIRMED"}
        
#         return {
#             "available": True,
#             "message": "You can request one modification for this booking",
#             "current_seats": booking.seats_booked
#         }
        
#     except Exception as e:
#         return {"available": False, "reason": str(e), "code": "ERROR"}


# @router.get("/ride/{ride_id}/refresh-seats")
# def refresh_seat_count(ride_id: int, db: Session = Depends(get_db)):
#     """Force refresh seat count for a ride"""
#     try:
#         ride = db.query(Ride).filter(Ride.id == ride_id).first()
#         if not ride:
#             return {"success": False, "message": "Ride not found"}
        
#         total_booked = get_total_booked_seats(db, ride_id)
#         remaining_seats = ride.available_seats - total_booked
        
#         print(f"🔄 Refresh seats for ride {ride_id}: Total={ride.available_seats}, Booked={total_booked}, Remaining={remaining_seats}")
        
#         old_status = ride.status
#         if remaining_seats == 0 and ride.status == "active":
#             ride.status = "full"
#             db.commit()
#             print(f"   Status changed: {old_status} -> full")
#         elif remaining_seats > 0 and ride.status == "full":
#             ride.status = "active"
#             db.commit()
#             print(f"   Status changed: {old_status} -> active")
        
#         return {
#             "success": True,
#             "ride_id": ride_id,
#             "available_seats": ride.available_seats,
#             "total_booked": total_booked,
#             "remaining_seats": remaining_seats,
#             "status": ride.status
#         }
#     except Exception as e:
#         print(f"Error in refresh_seat_count: {str(e)}")
#         return {"success": False, "message": str(e)}
# @router.get("/test-email/{phone_number}")
# def test_email(phone_number: str, db: Session = Depends(get_db)):
#     """Test email sending"""
#     normalized = normalize_phone(phone_number)
#     user_email = get_user_email(db, normalized)
    
#     if not user_email:
#         return {
#             "success": False,
#             "message": f"No email found for {normalized}",
#             "user": db.query(User).filter(User.phone_number == normalized).first()
#         }
    
#     test_data = {
#         "origin": "Test Location",
#         "destination": "Test Destination", 
#         "departure_time_display": datetime.now().strftime("%d %b %Y, %I:%M %p"),
#         "message": "This is a test email from DRIVVE to verify email notifications are working correctly."
#     }
    
#     result = send_ride_notification_email(
#         user_email,
#         "Test User",
#         test_data,
#         "test"
#     )
    
#     return {
#         "success": result,
#         "email_sent_to": user_email,
#         "message": "Test email sent successfully" if result else "Failed to send test email"
#     }
import os
import secrets
from fastapi import APIRouter, Depends, HTTPException, Query, Header, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text, and_, or_
from database import get_db
from models import Ride, RideBooking, ModificationRequest, RideFeedback, RideRequest, User, UserNotification, NotificationType, Vehicle, RideSession, RideSessionRider
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, field_validator
from typing import Optional, Dict, List
import math
import re
import uuid
import random
import string

router = APIRouter()
from zoneinfo import ZoneInfo

IST = timezone(timedelta(hours=5, minutes=30))

# With this:
IST = ZoneInfo('Asia/Kolkata')
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

# ============================================
# AZURE EMAIL NOTIFICATION HELPERS
# ============================================

def get_user_email(db: Session, phone_number: str) -> Optional[str]:
    """Get registered email for a user"""
    user = db.query(User).filter(User.phone_number == phone_number).first()
    if user and user.email:
        return user.email
    return None

def get_user_name(db: Session, phone_number: str) -> str:
    """Get user's full name"""
    user = db.query(User).filter(User.phone_number == phone_number).first()
    if user:
        if user.full_name:
            return user.full_name
        if user.first_name:
            return f"{user.first_name} {user.last_name or ''}".strip()
    return "there"

def send_email_notification_azure(to_email: str, subject: str, html_content: str) -> bool:
    """Send email notification using Azure Communication Services"""
    print(f"📧 EMAIL DEBUG: Attempting to send to {to_email}")
    print(f"📧 EMAIL DEBUG: Subject: {subject}")
    
    try:
        from azure.communication.email import EmailClient
        from azure.core.exceptions import HttpResponseError
        print(f"📧 EMAIL DEBUG: Azure packages imported successfully")
    except ImportError as e:
        print(f"❌ EMAIL DEBUG: Azure package not installed: {e}")
        return False

    AZURE_EMAIL_CONNECTION_STRING = os.getenv("AZURE_EMAIL_CONNECTION_STRING")
    AZURE_EMAIL_FROM = os.getenv("AZURE_EMAIL_FROM", "DoNotReply@drivve.in")
    
    print(f"📧 EMAIL DEBUG: Connection string present: {bool(AZURE_EMAIL_CONNECTION_STRING)}")
    print(f"📧 EMAIL DEBUG: From email: {AZURE_EMAIL_FROM}")
    
    if not AZURE_EMAIL_CONNECTION_STRING:
        print("❌ Azure Email connection string not configured")
        return False
    
    if not to_email or '@' not in to_email:
        print(f"❌ Invalid email address: {to_email}")
        return False
    
    try:
        print(f"📧 EMAIL DEBUG: Creating EmailClient...")
        email_client = EmailClient.from_connection_string(AZURE_EMAIL_CONNECTION_STRING)
        
        message = {
            "senderAddress": AZURE_EMAIL_FROM,
            "recipients": {
                "to": [{"address": to_email}]
            },
            "content": {
                "subject": subject,
                "html": html_content
            }
        }
        
        print(f"📧 EMAIL DEBUG: Sending email...")
        poller = email_client.begin_send(message)
        result = poller.result()
        print(f"✅ Email sent to {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def send_ride_notification_email(
    to_email: str, 
    user_name: str, 
    ride_data: dict, 
    notification_type: str,
    booking_id: int = None,
    ride_id: int = None
) -> bool:
    """Send ride-related email notification"""
    
    if notification_type == "booking_accepted":
        subject = f"✅ Booking Confirmed - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ED7117, #FF8C42); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h2 style="color: white; margin: 0;">✅ Booking Confirmed!</h2>
                </div>
                <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
                    <p>Great news! Your booking has been <strong style="color: #ED7117;">accepted</strong> by the driver.</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>🚗 Ride Details:</strong></p>
                        <p>📍 <strong>From:</strong> {ride_data.get('origin', 'N/A')}</p>
                        <p>🎯 <strong>To:</strong> {ride_data.get('destination', 'N/A')}</p>
                        <p>📅 <strong>Departure:</strong> {ride_data.get('departure_time_display', 'N/A')}</p>
                        <p>💺 <strong>Seats:</strong> {ride_data.get('seats', 'N/A')}</p>
                        <p>💰 <strong>Total Amount:</strong> ₹{ride_data.get('total_amount', 'N/A')}</p>
                    </div>
                    
                    <p>You can track your ride status in the app.</p>
                    <p>Safe travels! 🚀</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Team Drivve</p>
                </div>
            </body>
        </html>
        """
    
    elif notification_type == "booking_request":
        subject = f"📝 Booking Request Sent - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ED7117, #FF8C42); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h2 style="color: white; margin: 0;">📝 Booking Request Sent</h2>
                </div>
                <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
                    <p>Your booking request for <strong>{ride_data.get('seats', 'N/A')}</strong> seat(s) has been sent to the driver.</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>🚗 Ride Details:</strong></p>
                        <p>📍 <strong>From:</strong> {ride_data.get('origin', 'N/A')}</p>
                        <p>🎯 <strong>To:</strong> {ride_data.get('destination', 'N/A')}</p>
                        <p>📅 <strong>Departure:</strong> {ride_data.get('departure_time_display', 'N/A')}</p>
                        <p>💰 <strong>Total Amount:</strong> ₹{ride_data.get('total_amount', 'N/A')}</p>
                    </div>
                    
                    <p>You'll be notified when the driver responds to your request.</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Team Drivve</p>
                </div>
            </body>
        </html>
        """
    
    elif notification_type == "booking_rejected":
        subject = f"❌ Booking Request Declined - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc3545, #c82333); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h2 style="color: white; margin: 0;">❌ Booking Request Declined</h2>
                </div>
                <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
                    <p>Unfortunately, the driver has declined your booking request.</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>🚗 Ride Details:</strong></p>
                        <p>📍 <strong>From:</strong> {ride_data.get('origin', 'N/A')}</p>
                        <p>🎯 <strong>To:</strong> {ride_data.get('destination', 'N/A')}</p>
                        <p>📅 <strong>Departure:</strong> {ride_data.get('departure_time_display', 'N/A')}</p>
                        <p>💺 <strong>Seats Requested:</strong> {ride_data.get('seats', 'N/A')}</p>
                    </div>
                    
                    <p>You can search for other rides in the app.</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Team Drivve</p>
                </div>
            </body>
        </html>
        """
    
    elif notification_type == "ride_cancelled":
        subject = f"❌ Ride Cancelled - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc3545, #c82333); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h2 style="color: white; margin: 0;">❌ Ride Cancelled</h2>
                </div>
                <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
                    <p>We regret to inform you that the ride has been <strong style="color: #dc3545;">cancelled</strong>.</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>🚗 Ride Details:</strong></p>
                        <p>📍 <strong>From:</strong> {ride_data.get('origin', 'N/A')}</p>
                        <p>🎯 <strong>To:</strong> {ride_data.get('destination', 'N/A')}</p>
                        <p>📅 <strong>Departure:</strong> {ride_data.get('departure_time_display', 'N/A')}</p>
                    </div>
                    
                    <p><strong>Cancellation Reason:</strong> {ride_data.get('cancellation_reason', 'Cancelled by driver')}</p>
                    
                    <p>Your payment will be refunded within 3-5 business days.</p>
                    <p>You can search for alternative rides in the app.</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Team Drivve</p>
                </div>
            </body>
        </html>
        """
    
    elif notification_type == "ride_posted_driver":
        subject = f"🚗 Ride Posted - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h2 style="color: white; margin: 0;">🚗 Ride Posted Successfully!</h2>
                </div>
                <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
                    <p>Your ride has been posted successfully and is now visible to passengers!</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>🚗 Ride Details:</strong></p>
                        <p>📍 <strong>From:</strong> {ride_data.get('origin', 'N/A')}</p>
                        <p>🎯 <strong>To:</strong> {ride_data.get('destination', 'N/A')}</p>
                        <p>📅 <strong>Departure:</strong> {ride_data.get('departure_time_display', 'N/A')}</p>
                        <p>💺 <strong>Seats Available:</strong> {ride_data.get('seats_available', 'N/A')}</p>
                        <p>💰 <strong>Price per Seat:</strong> ₹{ride_data.get('price_per_seat', 'N/A')}</p>
                    </div>
                    
                    <p>You'll receive notifications when passengers request to book your ride.</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Team Drivve</p>
                </div>
            </body>
        </html>
        """
    
    elif notification_type == "ride_updated_driver":
        subject = f"🔄 Ride Updated - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #17a2b8, #138496); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h2 style="color: white; margin: 0;">🔄 Ride Updated</h2>
                </div>
                <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
                    <p>Your ride has been updated successfully!</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>🚗 Updated Ride Details:</strong></p>
                        <p>📍 <strong>From:</strong> {ride_data.get('origin', 'N/A')}</p>
                        <p>🎯 <strong>To:</strong> {ride_data.get('destination', 'N/A')}</p>
                        <p>📅 <strong>Departure:</strong> {ride_data.get('departure_time_display', 'N/A')}</p>
                        <p>💺 <strong>Seats Available:</strong> {ride_data.get('seats_available', 'N/A')}</p>
                        <p>💰 <strong>Price per Seat:</strong> ₹{ride_data.get('price_per_seat', 'N/A')}</p>
                    </div>
                    
                    <p>The changes are now visible to passengers.</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Team Drivve</p>
                </div>
            </body>
        </html>
        """
    
    elif notification_type == "ride_updated":
        subject = f"🔄 Ride Updated - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #17a2b8, #138496); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h2 style="color: white; margin: 0;">🔄 Ride Details Updated</h2>
                </div>
                <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
                    <p>The driver has updated the ride details:</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>🚗 Ride Details:</strong></p>
                        <p>📍 <strong>From:</strong> {ride_data.get('origin', 'N/A')}</p>
                        <p>🎯 <strong>To:</strong> {ride_data.get('destination', 'N/A')}</p>
                        <p>📅 <strong>Departure:</strong> {ride_data.get('departure_time_display', 'N/A')}</p>
                    </div>
                    
                    <p>Please check the app for the latest information.</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Team Drivve</p>
                </div>
            </body>
        </html>
        """
    
    elif notification_type == "modification_approved":
        subject = f"🔄 Seat Modification Approved - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h2 style="color: white; margin: 0;">🔄 Seat Modification Approved</h2>
                </div>
                <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
                    <p>Your seat modification request has been <strong style="color: #28a745;">approved</strong>!</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>📊 Seat Changes:</strong></p>
                        <p>🪑 <strong>Old Seats:</strong> {ride_data.get('old_seats', 'N/A')}</p>
                        <p>🪑 <strong>New Seats:</strong> {ride_data.get('new_seats', 'N/A')}</p>
                        <p>💰 <strong>New Total:</strong> ₹{ride_data.get('new_total', 'N/A')}</p>
                    </div>
                    
                    <p>Your booking has been updated in the app.</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Team Drivve</p>
                </div>
            </body>
        </html>
        """
    
    elif notification_type == "modification_request":
        subject = f"🔄 Seat Modification Request - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ffc107, #ff9800); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h2 style="color: #333; margin: 0;">🔄 Seat Modification Request</h2>
                </div>
                <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
                    <p>A passenger has requested to modify their seat count:</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>📊 Modification Details:</strong></p>
                        <p>🪑 <strong>Current Seats:</strong> {ride_data.get('current_seats', 'N/A')}</p>
                        <p>🪑 <strong>Requested Seats:</strong> {ride_data.get('requested_seats', 'N/A')}</p>
                        <p>👤 <strong>Passenger:</strong> {ride_data.get('passenger_name', 'N/A')}</p>
                    </div>
                    
                    <p>Please open the app to approve or reject this request.</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Team Drivve</p>
                </div>
            </body>
        </html>
        """
    
    elif notification_type == "ride_started":
        subject = f"🚗 Ride Started - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h2 style="color: white; margin: 0;">🚗 Ride Started!</h2>
                </div>
                <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
                    <p>The driver has started the ride!</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p>📍 <strong>From:</strong> {ride_data.get('origin', 'N/A')}</p>
                        <p>🎯 <strong>To:</strong> {ride_data.get('destination', 'N/A')}</p>
                    </div>
                    
                    <p>You can now track your driver's location in the app.</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Team Drivve</p>
                </div>
            </body>
        </html>
        """
    elif notification_type == "booking_request_driver":
        subject = f"📝 New Booking Request - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ED7117, #FF8C42); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h2 style="color: white; margin: 0;">📝 New Booking Request!</h2>
                </div>
                <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
                    <p>A passenger has requested to book your ride!</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>👤 Passenger Details:</strong></p>
                        <p>👤 <strong>Name:</strong> {ride_data.get('passenger_name', 'N/A')}</p>
                        <p>📱 <strong>Phone:</strong> {ride_data.get('passenger_phone', 'N/A')}</p>
                        <p>💺 <strong>Seats Requested:</strong> {ride_data.get('seats', 'N/A')}</p>
                        <p>💰 <strong>Total Amount:</strong> ₹{ride_data.get('total_amount', 'N/A')}</p>
                    </div>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>🚗 Your Ride Details:</strong></p>
                        <p>📍 <strong>From:</strong> {ride_data.get('origin', 'N/A')}</p>
                        <p>🎯 <strong>To:</strong> {ride_data.get('destination', 'N/A')}</p>
                        <p>📅 <strong>Departure:</strong> {ride_data.get('departure_time_display', 'N/A')}</p>
                    </div>
                    
                    <p>Please open the app to accept or reject this booking request.</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Team Drivve</p>
                </div>
            </body>
        </html>
        """
    elif notification_type == "booking_cancelled":
        subject = f"❌ Booking Cancelled - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc3545, #c82333); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h2 style="color: white; margin: 0;">❌ Booking Cancelled</h2>
                </div>
                <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
                    <p>Your booking has been <strong style="color: #dc3545;">cancelled</strong>.</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>🚗 Ride Details:</strong></p>
                        <p>📍 <strong>From:</strong> {ride_data.get('origin', 'N/A')}</p>
                        <p>🎯 <strong>To:</strong> {ride_data.get('destination', 'N/A')}</p>
                        <p>💺 <strong>Seats:</strong> {ride_data.get('seats', 'N/A')}</p>
                    </div>
                    
                    <p><strong>Reason:</strong> {ride_data.get('cancellation_reason', 'Booking cancelled')}</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Team Drivve</p>
                </div>
            </body>
        </html>
        """
    
    else:
        # Default notification
        subject = f"🚗 Ride Update - {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', '')[:50]}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ED7117, #FF8C42); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h2 style="color: white; margin: 0;">🚗 Ride Update</h2>
                </div>
                <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px;">Hey <strong>{user_name}</strong>,</p>
                    <p>{ride_data.get('message', 'Your ride has been updated.')}</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p>📍 <strong>{ride_data.get('origin', 'N/A')}</strong> → <strong>{ride_data.get('destination', 'N/A')}</strong></p>
                        <p>📅 <strong>Departure:</strong> {ride_data.get('departure_time_display', 'N/A')}</p>
                    </div>
                    
                    <p>Open the app for more details.</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Team Drivve</p>
                </div>
            </body>
        </html>
        """
    
    return send_email_notification_azure(to_email, subject, html_content)

def send_in_app_notification(db: Session, phone_number: str, title: str, message: str, action_type: str, action_value: str = None):
    """Send in-app notification to user"""
    try:
        notification = UserNotification(
            phone_number=phone_number,
            title=title,
            message=message,
            type=NotificationType.RIDE,
            action_type=action_type,
            action_value=action_value,
            is_read=False,
            is_deleted=False
        )
        db.add(notification)
        db.commit()
        print(f"✅ In-app notification sent to {phone_number}: {title}")
        
        # Send socket event for real-time delivery
        emit_to_user(phone_number, "new-notification", {
            "title": title,
            "message": message,
            "action_type": action_type,
            "action_value": action_value
        })
        
        return True
    except Exception as e:
        print(f"❌ Failed to send in-app notification: {str(e)}")
        return False

def to_ist(dt: datetime) -> datetime:
    """Convert datetime to IST timezone (UTC+5:30)"""
    if dt is None:
        return dt
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    ist = timezone(timedelta(hours=5, minutes=30))
    return dt.astimezone(ist)


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


def generate_custom_ride_id():
    """Generate ride ID in format: R + 4 digits + 2 letters (e.g., R1234TH)"""
    digits = ''.join(str(random.randint(0, 9)) for _ in range(4))
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    return f"R{digits}{letters}"


def generate_custom_booking_id():
    """Generate booking ID in format: B + 4 digits + 2 letters (e.g., B7655GT)"""
    digits = ''.join(str(random.randint(0, 9)) for _ in range(4))
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    return f"B{digits}{letters}"


def generate_unique_ride_id(db: Session, retries: int = 5):
    """Generate a unique ride ID that doesn't exist in the database"""
    for _ in range(retries):
        ride_id = generate_custom_ride_id()
        existing = db.query(Ride).filter(Ride.custom_ride_id == ride_id).first()
        if not existing:
            return ride_id
    return f"R{int(datetime.now().timestamp())}{random.choice(string.ascii_uppercase)}{random.choice(string.ascii_uppercase)}"


def generate_unique_booking_id(db: Session, retries: int = 5):
    """Generate a unique booking ID that doesn't exist in the database"""
    for _ in range(retries):
        booking_id = generate_custom_booking_id()
        existing = db.query(RideBooking).filter(RideBooking.custom_booking_id == booking_id).first()
        if not existing:
            return booking_id
    return f"B{int(datetime.now().timestamp())}{random.choice(string.ascii_uppercase)}{random.choice(string.ascii_uppercase)}"


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
    """Get total booked seats for a ride (only accepted bookings)"""
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
    pickup_address: Optional[str] = None
    dropoff_address: Optional[str] = None
    pickup_place_name: Optional[str] = None
    dropoff_place_name: Optional[str] = None


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
    pickup_address: Optional[str] = None
    dropoff_address: Optional[str] = None
    pickup_place_name: Optional[str] = None
    dropoff_place_name: Optional[str] = None

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
# HELPER FUNCTIONS FOR OVERLAP CHECKS
# ============================================

def check_overlapping_bookings_for_passenger(db: Session, phone_number: str, departure_time: datetime, duration_minutes: int, exclude_booking_id: Optional[int] = None) -> Optional[Dict]:
    """Check if passenger has overlapping active/accepted bookings"""
    
    departure_time_utc = departure_time
    if departure_time_utc.tzinfo is None:
        departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
    
    expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
    buffer_start = departure_time_utc - timedelta(minutes=30)
    buffer_end = expected_end_time + timedelta(minutes=60)
    
    query = db.query(RideBooking).join(Ride).filter(
        RideBooking.passenger_phone == phone_number,
        RideBooking.status.in_(["accepted"]),
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


# ============================================
# RIDE ENDPOINTS
# ============================================
@router.post("/post-ride")
def post_ride(data: CreateRideRequest, db: Session = Depends(get_db)):
    normalized_phone = normalize_phone(data.phone_number)
    duration_minutes = parse_duration_to_minutes(data.duration_text)
    
    # ============================================
    # WORK ENTIRELY IN IST - NO UTC CONVERSION
    # ============================================
    departure_time = data.departure_time
    
    # If the time has no timezone, assume it's IST
    if departure_time.tzinfo is None:
        ist = timezone(timedelta(hours=5, minutes=30))
        # departure_time_ist = ist.localize(departure_time)
        departure_time_ist = departure_time.replace(tzinfo=IST)

    else:
        # If it has a timezone, convert to IST
        departure_time_ist = departure_time.astimezone(IST)
    
    # Expected end time in IST
    expected_end_time_ist = departure_time_ist + timedelta(minutes=duration_minutes)
    
    print(f"📅 Received departure time: {departure_time}")
    print(f"📅 Using IST: {departure_time_ist.strftime('%Y-%m-%d %H:%M:%S %Z')}")
    print(f"📅 Expected end time (IST): {expected_end_time_ist.strftime('%Y-%m-%d %H:%M:%S %Z')}")
    
    # Generate unique custom ride ID
    custom_ride_id = generate_unique_ride_id(db)
    
    # Check for passenger overlap (convert to UTC for comparison or keep in IST)
    # For overlap checks, convert to UTC temporarily
    departure_time_utc = departure_time_ist.astimezone(timezone.utc)
    
    passenger_overlap = check_overlapping_bookings_for_passenger(db, normalized_phone, departure_time_utc, duration_minutes)
    if passenger_overlap:
        raise HTTPException(
            status_code=409,
            detail=f"You have a confirmed booking as a passenger from {passenger_overlap['origin']} to {passenger_overlap['destination']} at {to_ist(passenger_overlap['departure_time']).strftime('%I:%M %p')} that overlaps with this ride."
        )
    
    # Check for driver overlapping rides
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
    
    # Validate time - minimum 30 minutes from NOW in IST
    now_ist = datetime.now(IST)
    min_departure_time_ist = now_ist + timedelta(minutes=30)
    
    if departure_time_ist < min_departure_time_ist:
        raise HTTPException(
            status_code=400, 
            detail=f"Departure time must be at least 30 minutes from now. Current time: {now_ist.strftime('%I:%M %p')}, Minimum departure: {min_departure_time_ist.strftime('%I:%M %p')}"
        )
    
    women_only = data.preferences.get('womenOnly', False) if data.preferences else data.women_only
    
    # STORE IN IST (NOT UTC)
    ride = Ride(
        custom_ride_id=custom_ride_id,
        phone_number=normalized_phone,
        origin=data.origin,
        destination=data.destination,
        departure_time=departure_time_ist,  # Store in IST
        expected_end_time=expected_end_time_ist,  # Store in IST
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
    
    # ============================================
    # IN-APP NOTIFICATION TO DRIVER
    # ============================================
    origin_short = data.origin.split(",")[0].strip() if data.origin else "start"
    dest_short = data.destination.split(",")[0].strip() if data.destination else "destination"
    
    send_in_app_notification(
        db, normalized_phone,
        title="Ride Posted Successfully! 🚗",
        message=f"Your ride from {origin_short} to {dest_short} has been posted. You'll receive notifications when passengers book.",
        action_type="ride",
        action_value=str(ride.id)
    )
    
    # ============================================
    # SEND EMAIL NOTIFICATION TO DRIVER
    # ============================================
    try:
        driver_email = get_user_email(db, normalized_phone)
        print(f"📧 Driver email check for {normalized_phone}: {driver_email}")
        
        if driver_email:
            driver_name = get_user_name(db, normalized_phone)
            
            email_ride_data = {
                "origin": ride.origin,
                "destination": ride.destination,
                "departure_time_display": ride.departure_time.strftime("%d %b %Y, %I:%M %p"),  # Already in IST
                "seats_available": ride.available_seats,
                "price_per_seat": ride.price_per_seat,
                "message": f"Your ride from {ride.origin} to {ride.destination} has been posted successfully!"
            }
            
            print(f"📧 Attempting to send ride posted email to: {driver_email}")
            email_sent = send_ride_notification_email(
                driver_email,
                driver_name,
                email_ride_data,
                "ride_posted_driver",
                None,
                ride.id
            )
            print(f"📧 Email sent result: {email_sent}")
        else:
            print(f"⚠️ No email found for driver: {normalized_phone}")
    except Exception as e:
        print(f"❌ Failed to send ride posted email: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # Call matching function to notify passengers with saved requests
    if ride.id:
        check_matching_ride_requests(db, ride)
    
    # Socket event for real-time updates
    emit_to_ride(ride.id, "new-ride-posted", {
        "ride_id": ride.id,
        "origin": ride.origin,
        "destination": ride.destination,
        "departure_time": ride.departure_time.isoformat()  # Will be in IST with +05:30 offset
    })
    
    return {
        "message": "Ride posted successfully", 
        "ride_id": ride.id,
        "custom_ride_id": ride.custom_ride_id,
        "departure_time_ist": ride.departure_time.strftime("%Y-%m-%d %H:%M:%S %Z")
    }
# @router.post("/post-ride")
# def post_ride(data: CreateRideRequest, db: Session = Depends(get_db)):
#     normalized_phone = normalize_phone(data.phone_number)
#     duration_minutes = parse_duration_to_minutes(data.duration_text)
    
#     # Convert departure time to UTC for storage
#     departure_time = data.departure_time
    
#     if departure_time.tzinfo is None:
#         ist = timezone(timedelta(hours=5, minutes=30))
#         departure_time_ist = ist.localize(departure_time)
#         departure_time_utc = departure_time_ist.astimezone(timezone.utc)
#     else:
#         departure_time_utc = departure_time.astimezone(timezone.utc)
    
#     print(f"📅 Received departure time: {departure_time}")
#     print(f"📅 Converted to UTC: {departure_time_utc}")
#     print(f"📅 Back to IST: {to_ist(departure_time_utc)}")
    
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
#     custom_ride_id = generate_unique_ride_id(db)
    
#     # Check for passenger overlap
#     passenger_overlap = check_overlapping_bookings_for_passenger(db, normalized_phone, departure_time_utc, duration_minutes)
#     if passenger_overlap:
#         raise HTTPException(
#             status_code=409,
#             detail=f"You have a confirmed booking as a passenger from {passenger_overlap['origin']} to {passenger_overlap['destination']} at {to_ist(passenger_overlap['departure_time']).strftime('%I:%M %p')} that overlaps with this ride."
#         )
    
#     # Check for driver overlapping rides
#     overlapping = check_overlapping_rides_for_driver(db, normalized_phone, departure_time_utc, duration_minutes)
#     if overlapping:
#         end_time_ist = to_ist(overlapping["expected_end_time"])
#         raise HTTPException(
#             status_code=409,
#             detail=f"You already have an active ride from {overlapping['origin']} to {overlapping['destination']} at {to_ist(overlapping['departure_time']).strftime('%I:%M %p')}. Please wait until {end_time_ist.strftime('%I:%M %p')} to post another ride."
#         )
    
#     # Validate distance
#     distance = calculate_distance_km(
#         data.origin_coords[1], data.origin_coords[0],
#         data.destination_coords[1], data.destination_coords[0]
#     )
    
#     MIN_DISTANCE_KM = 3
#     MAX_DISTANCE_KM = 300
    
#     if distance < MIN_DISTANCE_KM:
#         raise HTTPException(status_code=400, detail=f"Pickup and destination are too close ({distance:.1f} km)")
#     if distance > MAX_DISTANCE_KM:
#         raise HTTPException(status_code=400, detail=f"Distance too far ({distance:.1f} km)")
    
#     # Validate time
#     min_departure_time = datetime.now(timezone.utc) + timedelta(minutes=30)
#     if departure_time_utc < min_departure_time:
#         min_time_ist = to_ist(min_departure_time)
#         raise HTTPException(status_code=400, detail=f"Departure time must be at least 30 minutes from now")
    
#     women_only = data.preferences.get('womenOnly', False) if data.preferences else data.women_only
    
#     ride = Ride(
#         custom_ride_id=custom_ride_id,
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
    
#     # ============================================
#     # IN-APP NOTIFICATION TO DRIVER
#     # ============================================
#     origin_short = data.origin.split(",")[0].strip() if data.origin else "start"
#     dest_short = data.destination.split(",")[0].strip() if data.destination else "destination"
    
#     send_in_app_notification(
#         db, normalized_phone,
#         title="Ride Posted Successfully! 🚗",
#         message=f"Your ride from {origin_short} to {dest_short} has been posted. You'll receive notifications when passengers book.",
#         action_type="ride",
#         action_value=str(ride.id)
#     )
    
#     # ============================================
#     # SEND EMAIL NOTIFICATION TO DRIVER
#     # ============================================
#     try:
#         driver_email = get_user_email(db, normalized_phone)
#         print(f"📧 Driver email check for {normalized_phone}: {driver_email}")
        
#         if driver_email:
#             driver_name = get_user_name(db, normalized_phone)
            
#             email_ride_data = {
#                 "origin": ride.origin,
#                 "destination": ride.destination,
#                 "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
#                 "seats_available": ride.available_seats,
#                 "price_per_seat": ride.price_per_seat,
#                 "message": f"Your ride from {ride.origin} to {ride.destination} has been posted successfully!"
#             }
            
#             print(f"📧 Attempting to send ride posted email to: {driver_email}")
#             email_sent = send_ride_notification_email(
#                 driver_email,
#                 driver_name,
#                 email_ride_data,
#                 "ride_posted_driver",
#                 None,
#                 ride.id
#             )
#             print(f"📧 Email sent result: {email_sent}")
#         else:
#             print(f"⚠️ No email found for driver: {normalized_phone}")
#     except Exception as e:
#         print(f"❌ Failed to send ride posted email: {str(e)}")
#         import traceback
#         traceback.print_exc()
    
#     # Call matching function to notify passengers with saved requests
#     if ride.id:
#         check_matching_ride_requests(db, ride)
    
#     # Socket event for real-time updates
#     emit_to_ride(ride.id, "new-ride-posted", {
#         "ride_id": ride.id,
#         "origin": ride.origin,
#         "destination": ride.destination,
#         "departure_time": ride.departure_time.isoformat()
#     })
    
#     return {
#         "message": "Ride posted successfully", 
#         "ride_id": ride.id,
#         "custom_ride_id": ride.custom_ride_id
#     }

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
    
    existing_mod = db.query(ModificationRequest).filter(
        ModificationRequest.ride_id == ride.id,
        ModificationRequest.status == "pending"
    ).first()
    
    existing_accepted = db.query(RideBooking).filter(
        RideBooking.ride_id == data.ride_id,
        RideBooking.passenger_phone == passenger_phone,
        RideBooking.status == "accepted"
    ).first()
    
    if existing_accepted:
        raise HTTPException(status_code=400, detail="You already have a confirmed booking for this ride")
    
    total_amount = ride.price_per_seat * data.seats_requested
    custom_booking_id = generate_unique_booking_id(db)
    
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
            
            if pickup_pt and data.from_coords:
                pickup_walk_m = int(haversine_m(pickup_lat, pickup_lon, int_pickup_lat, int_pickup_lon))
            if drop_pt and data.to_coords:
                drop_walk_m = int(haversine_m(drop_lat, drop_lon, int_drop_lat, int_drop_lon))
        except Exception as e:
            print(f"⚠️ Intersection compute error: {e}")

    booking = RideBooking(
        custom_booking_id=custom_booking_id,
        ride_id=data.ride_id,
        passenger_phone=passenger_phone,
        seats_booked=data.seats_requested,
        total_amount=total_amount,
        pickup_address=data.pickup_address,
        dropoff_address=data.dropoff_address,
        pickup_place_name=data.pickup_place_name,
        dropoff_place_name=data.dropoff_place_name,
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

    # ============================================
    # IN-APP NOTIFICATION TO DRIVER
    # ============================================
    driver_phone = normalize_phone(ride.phone_number)
    origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
    dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
    
    send_in_app_notification(
        db, driver_phone,
        title="New Ride Request 🙋",
        message=f"You received a request for {data.seats_requested} seat(s) for your ride from {origin_short} to {dest_short}.",
        action_type="booking",
        action_value=str(booking.id)
    )
    
    # Socket event to driver
    emit_to_user(driver_phone, "new-booking-request", {
        "booking_id": booking.id,
        "ride_id": ride.id,
        "passenger_phone": passenger_phone,
        "seats": data.seats_requested,
        "origin": origin_short,
        "destination": dest_short
    })
    
    # ============================================
    # IN-APP NOTIFICATION TO PASSENGER (Booking sent)
    # ============================================
    send_in_app_notification(
        db, passenger_phone,
        title="Booking Request Sent 📝",
        message=f"Your request for {data.seats_requested} seat(s) on the ride from {origin_short} to {dest_short} has been sent to the driver.",
        action_type="booking",
        action_value=str(booking.id)
    )
    
    # ============================================
    # EMAIL NOTIFICATION TO PASSENGER
    # ============================================
    try:
        passenger_email = get_user_email(db, passenger_phone)
        if passenger_email:
            passenger_name = get_user_name(db, passenger_phone)
            
            ride_data = {
                "origin": ride.origin,
                "destination": ride.destination,
                "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
                "seats": data.seats_requested,
                "total_amount": total_amount,
                "message": f"Your booking request for {data.seats_requested} seat(s) has been sent to the driver. You'll be notified when they respond."
            }
            send_ride_notification_email(passenger_email, passenger_name, ride_data, "booking_request", booking.id, ride.id)
    except Exception as e:
        print(f"Failed to send booking request email: {str(e)}")
    try:
        driver_email = get_user_email(db, driver_phone)
        print(f"📧 Checking driver email for {driver_phone}: {driver_email}")
        
        if driver_email:
            driver_name = get_user_name(db, driver_phone)
            passenger_name = get_user_name(db, passenger_phone)
            
            driver_ride_data = {
                "origin": ride.origin,
                "destination": ride.destination,
                "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
                "seats": data.seats_requested,
                "total_amount": total_amount,
                "passenger_name": passenger_name,
                "passenger_phone": passenger_phone,
                "booking_id": booking.id,
                "message": f"{passenger_name} has requested {data.seats_requested} seat(s) for your ride from {ride.origin} to {ride.destination}."
            }
            
            print(f"📧 Attempting to send booking request email to driver: {driver_email}")
            email_sent = send_ride_notification_email(
                driver_email,
                driver_name,
                driver_ride_data,
                "booking_request_driver",  # New notification type
                booking.id,
                ride.id
            )
            print(f"📧 Driver email sent result: {email_sent}")
        else:
            print(f"⚠️ No email found for driver: {driver_phone}")
    except Exception as e:
        print(f"❌ Failed to send booking request email to driver: {str(e)}")
        import traceback
        traceback.print_exc()

    return {
        "message": "Ride request sent successfully", 
        "booking_id": booking.id,
        "custom_booking_id": booking.custom_booking_id,
        "status": booking.status
    }


# @router.post("/search-rides")
# def search_rides(data: SearchRidesRequest, db: Session = Depends(get_db)):
#     req_time_utc = data.departure_time
#     if req_time_utc.tzinfo is None:
#         req_time_utc = req_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         req_time_utc = req_time_utc.astimezone(timezone.utc)

#     query = db.query(Ride).filter(
#         Ride.status.in_(["active", "full"]),
#         Ride.departure_time.between(
#             req_time_utc - timedelta(minutes=TIME_WINDOW_MINUTES),
#             req_time_utc + timedelta(minutes=TIME_WINDOW_MINUTES)
#         )
#     )
    
#     if data.passenger_gender != 'female':
#         query = query.filter(Ride.women_only == False)

#     all_rides = query.all()
    
#     rides = []
    
#     for ride in all_rides:
#         total_booked = get_total_booked_seats(db, ride.id)
#         remaining_seats = max(0, ride.available_seats - total_booked)
        
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
            
#             if ride.route_coordinates:
#                 pickup_point = find_nearest_route_vertex(ride.route_coordinates, data.from_coords[0], data.from_coords[1])
#                 drop_point = find_nearest_route_vertex(ride.route_coordinates, data.to_coords[0], data.to_coords[1])
        
#         if pickup_distance_m > SEARCH_RADIUS_M * 2 or drop_distance_m > SEARCH_RADIUS_M * 2:
#             continue
        
#         pickup_score = max(0, 1 - (pickup_distance_m / SEARCH_RADIUS_M))
#         drop_score = max(0, 1 - (drop_distance_m / SEARCH_RADIUS_M))
#         time_diff_min = abs((ride.departure_time - req_time_utc).total_seconds()) / 60
#         time_score = max(0, 1 - (time_diff_min / 60))
#         match_percentage = round(100 * (0.35 * pickup_score + 0.35 * drop_score + 0.20 * time_score + 0.10))
        
#         driver = db.query(User).filter(User.phone_number == ride.phone_number).first()
#         driver_name = None
#         if driver:
#             driver_name = driver.full_name or " ".join(filter(None, [driver.first_name, driver.last_name]))
#         if not driver_name:
#             driver_name = f"Driver {ride.phone_number[-4:]}"
        
#         vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first() if ride.vehicle_id else None
        
#         departure_time_ist = to_ist(ride.departure_time)
        
#         rides.append({
#             "id": ride.id,
#             "driverName": driver_name,
#             "driverUserId": driver.user_id if driver else None,
#             "phoneNumber": ride.phone_number,
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
#             "price": ride.price_per_seat,
#             "matchPercentage": match_percentage,
#             "seatsAvailable": remaining_seats,
#             "totalSeats": ride.available_seats,
#             "bookedSeats": total_booked,
#             "distanceKm": ride.distance_km,
#             "durationText": ride.duration_text,
#             "routeCoordinates": ride.route_coordinates or [],
#             "status": ride.status,
#             "isFull": remaining_seats == 0,
#         })
    
#     rides.sort(key=lambda x: (-x["matchPercentage"]))
#     return {"rides": rides}
@router.post("/search-rides")
def search_rides(data: SearchRidesRequest, db: Session = Depends(get_db)):
    try:
        print("=" * 50)
        print("SEARCH RIDES CALLED")
        
        req_time = data.departure_time
        ist = timezone(timedelta(hours=5, minutes=30))
        # Handle timezone using pytz
        if req_time.tzinfo is None:
            # Assume IST if no timezone
            # req_time_ist = IST.localize(req_time)
            req_time_ist = req_time.replace(tzinfo=IST)
        else:
            req_time_ist = req_time.astimezone(IST)
        
        # Convert to UTC for database query
        req_time_utc = req_time_ist.astimezone(timezone.utc)
        
        print(f"req_time_ist: {req_time_ist}")
        print(f"req_time_utc: {req_time_utc}")
        
        # Get the date in IST
        req_date = req_time_ist.date()
        
        # Get start and end of day in IST
        from datetime import datetime as dt
        # start_of_day_ist = IST.localize(dt.combine(req_date, dt.min.time()))
        # end_of_day_ist = IST.localize(dt.combine(req_date, dt.max.time()))
        start_of_day_ist = dt.combine(req_date, dt.min.time()).replace(tzinfo=ist)
        end_of_day_ist = dt.combine(req_date, dt.max.time()).replace(tzinfo=ist)
        # Convert to UTC for database query
        start_of_day_utc = start_of_day_ist.astimezone(timezone.utc)
        end_of_day_utc = end_of_day_ist.astimezone(timezone.utc)
        
        print(f"Searching for rides between {start_of_day_utc} and {end_of_day_utc}")
        
        # Query rides for the entire day
        query = db.query(Ride).filter(
            Ride.status.in_(["active", "full"]),
            Ride.departure_time >= start_of_day_utc,
            Ride.departure_time <= end_of_day_utc
        )
        
        if data.passenger_gender != 'female':
            query = query.filter(Ride.women_only == False)
        
        all_rides = query.all()
        print(f"Found {len(all_rides)} rides")
        
        rides = []
        SEARCH_RADIUS_M = 5000  # 5km radius
        
        for ride in all_rides:
            total_booked = get_total_booked_seats(db, ride.id)
            remaining_seats = max(0, ride.available_seats - total_booked)
            
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
                
                # Also check reverse direction
                reverse_pickup = haversine_m(
                    ride.origin_lat, ride.origin_lon,
                    data.to_coords[1], data.to_coords[0]
                )
                reverse_drop = haversine_m(
                    ride.destination_lat, ride.destination_lon,
                    data.from_coords[1], data.from_coords[0]
                )
                
                # Use the better match (closer)
                if reverse_pickup < pickup_distance_m and reverse_drop < drop_distance_m:
                    pickup_distance_m = reverse_pickup
                    drop_distance_m = reverse_drop
                    print(f"   Using reverse direction for ride {ride.id}")
                
                if ride.route_coordinates:
                    pickup_point = find_nearest_route_vertex(ride.route_coordinates, data.from_coords[0], data.from_coords[1])
                    drop_point = find_nearest_route_vertex(ride.route_coordinates, data.to_coords[0], data.to_coords[1])
            
            # Skip if too far
            if pickup_distance_m > SEARCH_RADIUS_M * 2 or drop_distance_m > SEARCH_RADIUS_M * 2:
                continue
            
            # Calculate scores
            pickup_score = max(0, 1 - (pickup_distance_m / SEARCH_RADIUS_M))
            drop_score = max(0, 1 - (drop_distance_m / SEARCH_RADIUS_M))
            
            # Time difference in hours
            time_diff_hours = abs((ride.departure_time - req_time_utc).total_seconds()) / 3600
            time_score = max(0, 1 - (time_diff_hours / 12))  # 12-hour window
            
            match_percentage = round(100 * (0.40 * pickup_score + 0.40 * drop_score + 0.15 * time_score + 0.05))
            
            driver = db.query(User).filter(User.phone_number == ride.phone_number).first()
            driver_name = None
            if driver:
                driver_name = driver.full_name or " ".join(filter(None, [driver.first_name, driver.last_name]))
            if not driver_name:
                driver_name = f"Driver {ride.phone_number[-4:]}"
            
            vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first() if ride.vehicle_id else None
            
            # Convert to IST for display
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
                "isFull": remaining_seats == 0,
            })
        
        rides.sort(key=lambda x: (-x["matchPercentage"]))
        print(f"Returning {len(rides)} rides")
        return {"rides": rides}
        
    except Exception as e:
        print(f"ERROR in search_rides: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

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

    # ============================================
    # IN-APP NOTIFICATION TO PASSENGER
    # ============================================
    origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
    dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
    
    send_in_app_notification(
        db, booking.passenger_phone,
        title="Booking Accepted! ✅",
        message=f"Your request for {booking.seats_booked} seat(s) on the ride from {origin_short} to {dest_short} has been accepted by the driver.",
        action_type="booking",
        action_value=str(booking.id)
    )
    
    # ============================================
    # IN-APP NOTIFICATION TO DRIVER (Confirmation)
    # ============================================
    passenger_name = get_user_name(db, booking.passenger_phone)
    send_in_app_notification(
        db, ride.phone_number,
        title="Booking Accepted ✅",
        message=f"You accepted {passenger_name}'s booking request for {booking.seats_booked} seat(s).",
        action_type="booking",
        action_value=str(booking.id)
    )
    
    # ============================================
    # EMAIL NOTIFICATION TO PASSENGER
    # ============================================
    try:
        passenger_email = get_user_email(db, booking.passenger_phone)
        if passenger_email:
            passenger_name = get_user_name(db, booking.passenger_phone)
            
            ride_data = {
                "origin": ride.origin,
                "destination": ride.destination,
                "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
                "seats": booking.seats_booked,
                "total_amount": booking.total_amount
            }
            send_ride_notification_email(passenger_email, passenger_name, ride_data, "booking_accepted", booking.id, ride.id)
    except Exception as e:
        print(f"Failed to send booking accepted email: {str(e)}")
    
    # Socket events
    emit_to_user(booking.passenger_phone, "booking-accepted", {
        "booking_id": booking.id,
        "ride_id": ride.id,
        "message": f"Your booking for {booking.seats_booked} seat(s) has been accepted!"
    })
    
    emit_to_ride(ride.id, "booking-updated", {
        "booking_id": booking.id,
        "status": "accepted",
        "seats": booking.seats_booked
    })

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
    
    # ============================================
    # IN-APP NOTIFICATION TO PASSENGER
    # ============================================
    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
    if ride:
        origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
        dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
        
        send_in_app_notification(
            db, booking.passenger_phone,
            title="Booking Request Declined ❌",
            message=f"Your request for {booking.seats_booked} seat(s) on the ride from {origin_short} to {dest_short} was declined by the driver.",
            action_type="booking",
            action_value=str(booking.id)
        )
    
    # ============================================
    # EMAIL NOTIFICATION TO PASSENGER
    # ============================================
    try:
        if ride:
            passenger_email = get_user_email(db, booking.passenger_phone)
            if passenger_email:
                passenger_name = get_user_name(db, booking.passenger_phone)
                
                ride_data = {
                    "origin": ride.origin,
                    "destination": ride.destination,
                    "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
                    "seats": booking.seats_booked,
                    "cancellation_reason": "Driver declined your booking request"
                }
                send_ride_notification_email(passenger_email, passenger_name, ride_data, "booking_rejected", booking.id, ride.id)
    except Exception as e:
        print(f"Failed to send booking rejection email: {str(e)}")
    
    # Socket event
    emit_to_user(booking.passenger_phone, "booking-rejected", {
        "booking_id": booking.id,
        "ride_id": booking.ride_id,
        "message": "Your booking request was declined"
    })

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
    
    # ============================================
    # IN-APP NOTIFICATION TO DRIVER
    # ============================================
    passenger_name = get_user_name(db, booking.passenger_phone)
    origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
    dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
    
    send_in_app_notification(
        db, ride.phone_number,
        title="Booking Cancelled ❌",
        message=f"{passenger_name} cancelled their booking of {booking.seats_booked} seat(s) on the ride from {origin_short} to {dest_short}.",
        action_type="booking",
        action_value=str(booking.id)
    )
    
    # ============================================
    # EMAIL NOTIFICATION TO PASSENGER
    # ============================================
    try:
        passenger_email = get_user_email(db, booking.passenger_phone)
        if passenger_email:
            passenger_name = get_user_name(db, booking.passenger_phone)
            
            ride_data = {
                "origin": ride.origin,
                "destination": ride.destination,
                "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
                "seats": booking.seats_booked,
                "cancellation_reason": "You cancelled your booking"
            }
            send_ride_notification_email(passenger_email, passenger_name, ride_data, "booking_cancelled", booking.id, ride.id)
    except Exception as e:
        print(f"Failed to send booking cancellation email: {str(e)}")
    try:
        driver_email = get_user_email(db, ride.phone_number)
        if driver_email:
            driver_name = get_user_name(db, ride.phone_number)
            passenger_name = get_user_name(db, booking.passenger_phone)
            
            driver_ride_data = {
                "origin": ride.origin,
                "destination": ride.destination,
                "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
                "seats": booking.seats_booked,
                "passenger_name": passenger_name,
                "cancellation_reason": "Passenger cancelled their booking"
            }
            send_ride_notification_email(
                driver_email,
                driver_name,
                driver_ride_data,
                "booking_cancelled_driver",  # New type
                booking.id,
                ride.id
            )
    except Exception as e:
        print(f"Failed to send booking cancellation email to driver: {str(e)}")
    # Socket events
    emit_to_user(ride.phone_number, "booking-cancelled", {
        "booking_id": booking.id,
        "ride_id": ride.id,
        "passenger_phone": booking.passenger_phone,
        "seats": booking.seats_booked,
        "message": f"Passenger cancelled their booking for {booking.seats_booked} seat(s)"
    })
    
    emit_to_ride(ride.id, "booking-cancelled", {
        "booking_id": booking.id,
        "seats_released": booking.seats_booked,
        "available_seats": ride.available_seats - get_total_booked_seats(db, ride.id)
    })

    return {"message": "Booking cancelled successfully"}


@router.put("/ride/{ride_id}/cancel")
def cancel_ride(ride_id: int, db: Session = Depends(get_db)):
    """Cancel a ride and update all related records"""
    try:
        ride = db.query(Ride).filter(Ride.id == ride_id).first()
        if not ride:
            raise HTTPException(status_code=404, detail="Ride not found")
        
        if ride.started_at:
            raise HTTPException(status_code=400, detail="Cannot cancel ride that has already started")
        
        if ride.status == "completed":
            raise HTTPException(status_code=400, detail="Cannot cancel completed ride")
        
        if ride.status == "cancelled":
            raise HTTPException(status_code=400, detail="Ride is already cancelled")
        
        old_status = ride.status
        ride.status = "cancelled"
        
        if hasattr(ride, 'cancellation_reason'):
            ride.cancellation_reason = "Cancelled by driver"
        
        cancelled_modifications_count = 0
        affected_passengers = []
        
        # Cancel all pending modification requests
        try:
            pending_modifications = db.query(ModificationRequest).filter(
                ModificationRequest.ride_id == ride_id,
                ModificationRequest.status == "pending"
            ).all()
            
            for mod_request in pending_modifications:
                mod_request.status = "cancelled"
                if hasattr(mod_request, 'rejection_reason'):
                    mod_request.rejection_reason = "Ride was cancelled by driver"
                cancelled_modifications_count += 1
                
                # In-app notification to passenger
                send_in_app_notification(
                    db, mod_request.passenger_phone,
                    title="Modification Request Cancelled ❌",
                    message=f"Your seat modification request for ride from {ride.origin} to {ride.destination} has been cancelled because the ride was cancelled.",
                    action_type="modification",
                    action_value=str(mod_request.id)
                )
                
                emit_to_user(mod_request.passenger_phone, "modification-cancelled", {
                    "ride_id": ride_id,
                    "request_id": mod_request.id,
                    "message": "Your modification request was cancelled because the ride was cancelled"
                })
        except Exception as e:
            print(f"Error processing modification requests: {str(e)}")
        
        # Cancel all accepted bookings
        accepted_bookings = db.query(RideBooking).filter(
            RideBooking.ride_id == ride_id,
            RideBooking.status == "accepted"
        ).all()
        
        for booking in accepted_bookings:
            booking.status = "cancelled"
            if hasattr(booking, 'cancellation_reason'):
                booking.cancellation_reason = "Ride cancelled by driver"
            affected_passengers.append({
                "phone": booking.passenger_phone,
                "seats": booking.seats_booked,
                "booking_id": booking.id
            })
            
            origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
            dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
            
            # In-app notification to passenger
            send_in_app_notification(
                db, booking.passenger_phone,
                title="Ride Cancelled ❌",
                message=f"Your booking for {booking.seats_booked} seat(s) on the ride from {origin_short} to {dest_short} has been cancelled by the driver.",
                action_type="cancellation",
                action_value=str(ride.id)
            )
            
            emit_to_user(booking.passenger_phone, "booking-cancelled", {
                "ride_id": ride_id,
                "booking_id": booking.id,
                "message": f"Your booking for {booking.seats_booked} seat(s) has been cancelled",
                "origin": origin_short,
                "destination": dest_short
            })
            
            # Email notification to passenger
            try:
                passenger_email = get_user_email(db, booking.passenger_phone)
                if passenger_email:
                    passenger_name = get_user_name(db, booking.passenger_phone)
                    
                    email_ride_data = {
                        "origin": ride.origin,
                        "destination": ride.destination,
                        "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
                        "cancellation_reason": "Ride was cancelled by the driver"
                    }
                    send_ride_notification_email(passenger_email, passenger_name, email_ride_data, "ride_cancelled", booking.id, ride.id)
            except Exception as e:
                print(f"Failed to send ride cancellation email: {str(e)}")
        
        # Cancel all pending bookings
        pending_bookings = db.query(RideBooking).filter(
            RideBooking.ride_id == ride_id,
            RideBooking.status == "pending"
        ).all()
        
        for booking in pending_bookings:
            booking.status = "rejected"
            if hasattr(booking, 'cancellation_reason'):
                booking.cancellation_reason = "Ride cancelled by driver"
            
            # In-app notification to passenger
            send_in_app_notification(
                db, booking.passenger_phone,
                title="Booking Request Cancelled ❌",
                message=f"Your booking request for {booking.seats_booked} seat(s) on the ride from {ride.origin} to {ride.destination} has been cancelled because the ride was cancelled.",
                action_type="cancellation",
                action_value=str(ride.id)
            )
            
            emit_to_user(booking.passenger_phone, "booking-request-cancelled", {
                "ride_id": ride_id,
                "booking_id": booking.id,
                "message": "Your booking request was cancelled because the ride was cancelled"
            })
        
        # In-app notification to driver about ride cancellation
        origin_short = ride.origin.split(",")[0].strip() if ride.origin else "start"
        dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
        
        send_in_app_notification(
            db, ride.phone_number,
            title="Ride Cancelled ❌",
            message=f"Your ride from {origin_short} to {dest_short} has been cancelled. {len(accepted_bookings)} passenger(s) have been notified.",
            action_type="cancellation",
            action_value=str(ride.id)
        )
        
        # Email notification to driver about ride cancellation
        try:
            driver_email = get_user_email(db, ride.phone_number)
            if driver_email:
                driver_name = get_user_name(db, ride.phone_number)
                
                email_ride_data = {
                    "origin": ride.origin,
                    "destination": ride.destination,
                    "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
                    "cancellation_reason": "You cancelled the ride",
                    "message": f"Your ride from {ride.origin} to {ride.destination} has been cancelled."
                }
                send_ride_notification_email(driver_email, driver_name, email_ride_data, "ride_cancelled", None, ride.id)
        except Exception as e:
            print(f"Failed to send driver cancellation email: {str(e)}")
        
        db.commit()
        
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
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in cancel_ride: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error cancelling ride: {str(e)}")


@router.post("/booking/{booking_id}/request-modification")
async def request_modification(
    booking_id: int,
    request: ModificationRequestSchema,
    db: Session = Depends(get_db)
):
    """Request to modify seat count for a booking - ONE TIME ONLY"""
    try:
        booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
        if not booking:
            return {"success": False, "message": "Booking not found"}
        
        ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
        if not ride:
            return {"success": False, "message": "Ride not found"}
        
        if ride.started_at:
            return {"success": False, "message": "Cannot modify seats - Ride has already started"}
        
        if ride.cancellation_reason:
            return {"success": False, "message": "Cannot modify seats - Ride has been cancelled"}
        
        if booking.status != "accepted":
            return {"success": False, "message": "Cannot modify seats - Booking is not confirmed yet"}
        
        # Check for ANY existing modification request
        existing_modification = db.query(ModificationRequest).filter(
            ModificationRequest.booking_id == booking_id,
            ModificationRequest.is_active == True
        ).first()
        
        if existing_modification:
            if existing_modification.status == "pending":
                return {
                    "success": False, 
                    "message": "You already have a pending modification request. Please wait for driver's response.",
                    "code": "PENDING_REQUEST_EXISTS",
                    "existing_request": {
                        "id": existing_modification.id,
                        "requested_seats": existing_modification.requested_seats,
                        "current_seats": existing_modification.current_seats,
                        "status": existing_modification.status
                    }
                }
            else:
                return {
                    "success": False, 
                    "message": "You can only modify your seats once per booking. You have already submitted a modification request.",
                    "code": "ALREADY_MODIFIED",
                    "previous_request": {
                        "id": existing_modification.id,
                        "requested_seats": existing_modification.requested_seats,
                        "current_seats": existing_modification.current_seats,
                        "status": existing_modification.status,
                        "approved_at": existing_modification.approved_at.isoformat() if existing_modification.approved_at else None,
                        "rejected_at": existing_modification.rejected_at.isoformat() if existing_modification.rejected_at else None
                    }
                }
        
        historical_modification = db.query(ModificationRequest).filter(
            ModificationRequest.booking_id == booking_id
        ).first()
        
        if historical_modification:
            return {
                "success": False,
                "message": "You have already used your one-time modification for this booking. Further modifications are not allowed.",
                "code": "MODIFICATION_LIMIT_REACHED",
                "previous_request": {
                    "id": historical_modification.id,
                    "requested_seats": historical_modification.requested_seats,
                    "status": historical_modification.status,
                    "created_at": historical_modification.created_at.isoformat() if historical_modification.created_at else None
                }
            }
        
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
        
        if request.requested_seats == booking.seats_booked:
            return {"success": False, "message": "No change in seat count"}
        
        new_mod_request = ModificationRequest(
            booking_id=booking_id,
            ride_id=ride.id,
            passenger_phone=booking.passenger_phone,
            current_seats=booking.seats_booked,
            requested_seats=request.requested_seats,
            status="pending",
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )
        
        db.add(new_mod_request)
        db.commit()
        db.refresh(new_mod_request)
        
        # ============================================
        # IN-APP NOTIFICATION TO DRIVER
        # ============================================
        passenger_name = get_user_name(db, booking.passenger_phone)
        origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
        dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
        
        send_in_app_notification(
            db, ride.phone_number,
            title="Modification Request 🔄",
            message=f"{passenger_name} wants to change seats from {booking.seats_booked} to {request.requested_seats} seat(s) on ride from {origin_short} to {dest_short}.",
            action_type="modification",
            action_value=str(new_mod_request.id)
        )
        
        # ============================================
        # EMAIL NOTIFICATION TO DRIVER
        # ============================================
        try:
            driver_email = get_user_email(db, ride.phone_number)
            if driver_email:
                driver_name = get_user_name(db, ride.phone_number)
                
                email_ride_data = {
                    "origin": ride.origin,
                    "destination": ride.destination,
                    "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
                    "current_seats": booking.seats_booked,
                    "requested_seats": request.requested_seats,
                    "passenger_name": passenger_name
                }
                send_ride_notification_email(driver_email, driver_name, email_ride_data, "modification_request", booking.id, ride.id)
        except Exception as e:
            print(f"Failed to send modification request email to driver: {str(e)}")
        
        # Socket event to driver
        emit_to_user(ride.phone_number, "modification-request", {
            "request_id": new_mod_request.id,
            "booking_id": booking_id,
            "current_seats": booking.seats_booked,
            "requested_seats": request.requested_seats,
            "passenger_name": passenger_name,
            "passenger_phone": booking.passenger_phone
        })
        
        # In-app notification to passenger (confirmation)
        send_in_app_notification(
            db, booking.passenger_phone,
            title="Modification Request Sent 📝",
            message=f"Your request to change seats from {booking.seats_booked} to {request.requested_seats} has been sent to the driver.",
            action_type="modification",
            action_value=str(new_mod_request.id)
        )
        
        return {
            "success": True, 
            "message": "Modification request sent to driver (one-time modification only)",
            "request": {
                "id": new_mod_request.id,
                "current_seats": new_mod_request.current_seats,
                "requested_seats": new_mod_request.requested_seats,
                "status": new_mod_request.status,
                "created_at": new_mod_request.created_at.isoformat() if new_mod_request.created_at else None,
                "is_active": new_mod_request.is_active
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
    """Approve a modification request - updates booking seats"""
    try:
        mod_request = db.query(ModificationRequest).filter(
            ModificationRequest.id == request_id,
            ModificationRequest.is_active == True
        ).first()
        
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
            mod_request.is_active = False
            db.commit()
            return {"success": False, "message": "Cannot approve - Ride has already started"}
        
        total_booked = get_total_booked_seats(db, ride.id)
        other_booked = total_booked - booking.seats_booked
        available_seats = ride.available_seats - other_booked
        
        if mod_request.requested_seats > available_seats:
            mod_request.status = "rejected"
            mod_request.rejection_reason = f"Only {available_seats} seats available"
            mod_request.is_active = False
            db.commit()
            return {"success": False, "message": f"Only {available_seats} seat(s) available"}
        
        old_seats = booking.seats_booked
        booking.seats_booked = mod_request.requested_seats
        booking.total_amount = ride.price_per_seat * mod_request.requested_seats
        
        mod_request.status = "approved"
        mod_request.approved_at = datetime.now(timezone.utc)
        
        db.commit()
        
        # ============================================
        # IN-APP NOTIFICATION TO PASSENGER
        # ============================================
        send_in_app_notification(
            db, booking.passenger_phone,
            title="Modification Approved ✅",
            message=f"Your seat change request from {old_seats} to {mod_request.requested_seats} seats has been approved!",
            action_type="modification",
            action_value=str(mod_request.id)
        )
        
        # ============================================
        # IN-APP NOTIFICATION TO DRIVER (Confirmation)
        # ============================================
        passenger_name = get_user_name(db, booking.passenger_phone)
        send_in_app_notification(
            db, ride.phone_number,
            title="Modification Approved ✅",
            message=f"You approved {passenger_name}'s seat change request from {old_seats} to {mod_request.requested_seats} seats.",
            action_type="modification",
            action_value=str(mod_request.id)
        )
        
        # ============================================
        # EMAIL NOTIFICATION TO PASSENGER
        # ============================================
        try:
            passenger_email = get_user_email(db, booking.passenger_phone)
            if passenger_email:
                passenger_name = get_user_name(db, booking.passenger_phone)
                
                ride_data = {
                    "origin": ride.origin,
                    "destination": ride.destination,
                    "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
                    "old_seats": old_seats,
                    "new_seats": mod_request.requested_seats,
                    "new_total": booking.total_amount
                }
                send_ride_notification_email(passenger_email, passenger_name, ride_data, "modification_approved", booking.id, ride.id)
        except Exception as e:
            print(f"Failed to send modification approval email: {str(e)}")
        
        # Socket events
        emit_to_user(booking.passenger_phone, "modification-approved", {
            "booking_id": booking.id,
            "old_seats": old_seats,
            "new_seats": mod_request.requested_seats,
            "message": f"Your seat change request from {old_seats} to {mod_request.requested_seats} seats has been approved!"
        })
        
        emit_to_ride(ride.id, "modification-approved", {
            "booking_id": booking.id,
            "old_seats": old_seats,
            "new_seats": mod_request.requested_seats,
            "seats_change": mod_request.requested_seats - old_seats
        })
        
        return {
            "success": True,
            "message": f"Modification request approved. Seats updated from {old_seats} to {mod_request.requested_seats}.",
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
    """Reject a modification request - THIS WILL CANCEL THE ORIGINAL BOOKING"""
    try:
        print(f"🚫 ========== STARTING REJECTION PROCESS ==========")
        print(f"📝 Rejecting modification request ID: {request_id}")
        
        mod_request = db.query(ModificationRequest).filter(
            ModificationRequest.id == request_id
        ).with_for_update().first()
        
        if not mod_request:
            print(f"❌ Modification request {request_id} not found")
            return {"success": False, "message": "Modification request not found"}
        
        print(f"✅ Found modification request: status={mod_request.status}, is_active={mod_request.is_active}")
        
        if mod_request.status != "pending":
            print(f"⚠️ Request already {mod_request.status}")
            return {"success": False, "message": f"Request already {mod_request.status}"}
        
        booking = db.query(RideBooking).filter(
            RideBooking.id == mod_request.booking_id
        ).with_for_update().first()
        
        if not booking:
            print(f"❌ Booking {mod_request.booking_id} not found")
            return {"success": False, "message": "Associated booking not found"}
        
        print(f"✅ Found booking: ID={booking.id}, status={booking.status}, seats={booking.seats_booked}")
        
        ride = db.query(Ride).filter(Ride.id == mod_request.ride_id).with_for_update().first()
        
        if not ride:
            print(f"❌ Ride {mod_request.ride_id} not found")
            return {"success": False, "message": "Ride not found"}
        
        print(f"✅ Found ride: ID={ride.id}, total_seats={ride.available_seats}, status={ride.status}")
        
        original_seats = booking.seats_booked
        
        print(f"🔴 Rejecting modification request {request_id}")
        print(f"   📍 Booking ID: {booking.id}, Original seats: {original_seats}")
        print(f"   📍 Ride ID: {ride.id}, Total seats: {ride.available_seats}")
        
        mod_request.status = "rejected"
        mod_request.rejection_reason = "Driver declined the modification request"
        mod_request.rejected_at = datetime.now(timezone.utc)
        mod_request.is_active = False
        mod_request.updated_at = datetime.now(timezone.utc)
        
        print(f"   ✅ Modification request updated: status=rejected, is_active=False")
        
        old_status = booking.status
        booking.status = "cancelled"
        booking.seats_booked = 0
        booking.cancellation_reason = f"Modification request rejected - Original booking of {original_seats} seat(s) cancelled"
        booking.updated_at = datetime.now(timezone.utc)
        
        print(f"   ✅ Booking updated: status={old_status} -> cancelled, seats={original_seats} -> 0")
        
        db.flush()
        
        total_booked_after = db.query(func.sum(RideBooking.seats_booked)).filter(
            RideBooking.ride_id == ride.id,
            RideBooking.status == "accepted"
        ).scalar() or 0
        
        remaining_seats = ride.available_seats - total_booked_after
        
        print(f"   📊 After cancellation calculation:")
        print(f"      Total booked (accepted): {total_booked_after}")
        print(f"      Remaining seats: {remaining_seats}")
        
        old_ride_status = ride.status
        if ride.status == "full" and remaining_seats > 0:
            ride.status = "active"
            print(f"   ✅ Ride status changed: {old_ride_status} -> active")
        elif ride.status == "active" and remaining_seats == 0:
            ride.status = "full"
            print(f"   ✅ Ride status changed: {old_ride_status} -> full")
        else:
            print(f"   ℹ️ Ride status unchanged: {ride.status}")
        
        ride.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        print(f"💾 Database commit successful")
        
        # ============================================
        # IN-APP NOTIFICATION TO PASSENGER
        # ============================================
        passenger_name = get_user_name(db, booking.passenger_phone)
        origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
        dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
        
        send_in_app_notification(
            db, booking.passenger_phone,
            title="Booking Cancelled ❌",
            message=f"Your booking for {original_seats} seat(s) on the ride from {origin_short} to {dest_short} has been cancelled because your modification request was rejected.",
            action_type="cancellation",
            action_value=str(ride.id)
        )
        
        # ============================================
        # IN-APP NOTIFICATION TO DRIVER (Confirmation)
        # ============================================
        send_in_app_notification(
            db, ride.phone_number,
            title="Modification Rejected ❌",
            message=f"You rejected {passenger_name}'s seat modification request. Their booking has been cancelled.",
            action_type="modification",
            action_value=str(mod_request.id)
        )
        
        # ============================================
        # EMAIL NOTIFICATION TO PASSENGER
        # ============================================
        try:
            passenger_email = get_user_email(db, booking.passenger_phone)
            if passenger_email:
                passenger_name = get_user_name(db, booking.passenger_phone)
                
                email_ride_data = {
                    "origin": ride.origin,
                    "destination": ride.destination,
                    "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
                    "seats": original_seats,
                    "cancellation_reason": "Driver rejected your seat modification request"
                }
                send_ride_notification_email(passenger_email, passenger_name, email_ride_data, "booking_cancelled", booking.id, ride.id)
        except Exception as e:
            print(f"Failed to send modification rejection email: {str(e)}")
        
        print(f"📡 Sending socket events...")
        
        try:
            emit_to_user(booking.passenger_phone, "booking-cancelled", {
                "booking_id": booking.id,
                "ride_id": ride.id,
                "seats_cancelled": original_seats,
                "message": f"Your booking for {original_seats} seat(s) has been cancelled because your modification request was rejected."
            })
            print(f"   ✅ Sent booking-cancelled to passenger {booking.passenger_phone}")
        except Exception as e:
            print(f"   ⚠️ Socket error (booking-cancelled): {e}")
        
        try:
            emit_to_ride(ride.id, "seats-released", {
                "ride_id": ride.id,
                "seats_released": original_seats,
                "new_available_seats": remaining_seats,
                "message": f"{original_seats} seat(s) are now available for this ride!"
            })
            print(f"   ✅ Sent seats-released to ride room: ride_{ride.id}")
        except Exception as e:
            print(f"   ⚠️ Socket error (seats-released): {e}")
        
        try:
            emit_to_ride(ride.id, "modification-rejected", {
                "ride_id": ride.id,
                "booking_id": booking.id,
                "seats_released": original_seats,
                "new_available_seats": remaining_seats,
                "message": f"A modification request was rejected. {original_seats} seat(s) are now available."
            })
            print(f"   ✅ Sent modification-rejected to ride room: ride_{ride.id}")
        except Exception as e:
            print(f"   ⚠️ Socket error (modification-rejected): {e}")
        
        try:
            if _sio:
                _sio.emit("seat-availability-update", {
                    "ride_id": ride.id,
                    "available_seats": remaining_seats,
                    "total_seats": ride.available_seats,
                    "action": "seats_released",
                    "seats_released": original_seats
                })
                print(f"   ✅ Sent seat-availability-update to all clients")
        except Exception as e:
            print(f"   ⚠️ Socket error (seat-availability-update): {e}")
        
        print(f"✅ ========== REJECTION COMPLETED SUCCESSFULLY ==========")
        
        return {
            "success": True,
            "message": f"Modification request rejected. Original booking for {original_seats} seat(s) has been CANCELLED.",
            "booking_cancelled": True,
            "booking_id": booking.id,
            "seats_released": original_seats,
            "new_available_seats": remaining_seats,
            "ride_id": ride.id,
            "ride_status": ride.status
        }
        
    except Exception as e:
        print(f"❌ ========== ERROR IN REJECTION ==========")
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return {"success": False, "message": str(e)}


@router.get("/ride/{ride_id}/rejected-modifications")
def get_rejected_modifications(ride_id: int, db: Session = Depends(get_db)):
    """Get all rejected modification requests for a ride"""
    try:
        rejected_requests = db.query(ModificationRequest).filter(
            ModificationRequest.ride_id == ride_id,
            ModificationRequest.status == "rejected"
        ).all()
        
        results = []
        for req in rejected_requests:
            results.append({
                "id": req.id,
                "booking_id": req.booking_id,
                "passenger_phone": req.passenger_phone,
                "current_seats": req.current_seats,
                "requested_seats": req.requested_seats,
                "status": req.status,
                "rejection_reason": req.rejection_reason,
                "created_at": req.created_at.isoformat() if req.created_at else None,
                "rejected_at": req.rejected_at.isoformat() if req.rejected_at else None
            })
        
        return {
            "success": True,
            "rejected_requests": results,
            "count": len(results)
        }
        
    except Exception as e:
        print(f"Error in get_rejected_modifications: {str(e)}")
        return {"success": False, "rejected_requests": [], "error": str(e)}


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

        rider_session = db.query(RideSessionRider).filter(
            RideSessionRider.booking_id == bk.id
        ).first()
        
        if rider_session:
            driver_rating_given = rider_session.driver_rating is not None
            driver_rating = rider_session.driver_rating or 0
            driver_feedback = rider_session.driver_feedback or ""

        passengers.append({
            "booking_id": bk.id,
            "custom_booking_id": getattr(bk, 'custom_booking_id', None),
            "passenger_phone": bk.passenger_phone,
            "passenger_name": passenger_name,
            "profile_picture": p.profile_picture if p else None,
            "seats_booked": bk.seats_booked,
            "status": bk.status,
            "total_amount": float(bk.total_amount) if bk.total_amount else None,
            "created_at": bk.created_at.isoformat() if bk.created_at else None,
            "pickup_address": getattr(bk, 'pickup_address', None),
            "dropoff_address": getattr(bk, 'dropoff_address', None),
            "pickup_place_name": getattr(bk, 'pickup_place_name', None),
            "dropoff_place_name": getattr(bk, 'dropoff_place_name', None),
            "pickup_lat": float(bk.pickup_lat) if bk.pickup_lat is not None else None,
            "pickup_lon": float(bk.pickup_lon) if bk.pickup_lon is not None else None,
            "drop_lat": float(bk.drop_lat) if bk.drop_lat is not None else None,
            "drop_lon": float(bk.drop_lon) if bk.drop_lon is not None else None,
            "intersection_pickup_lat": float(bk.intersection_pickup_lat) if bk.intersection_pickup_lat is not None else None,
            "intersection_pickup_lon": float(bk.intersection_pickup_lon) if bk.intersection_pickup_lon is not None else None,
            "intersection_drop_lat": float(bk.intersection_drop_lat) if bk.intersection_drop_lat is not None else None,
            "intersection_drop_lon": float(bk.intersection_drop_lon) if bk.intersection_drop_lon is not None else None,
            "pickup_walk_distance_m": bk.pickup_walk_distance_m,
            "drop_walk_distance_m": bk.drop_walk_distance_m,
            "driver_rating_given": driver_rating_given if rider_session else False,
            "driver_rating": driver_rating if rider_session else 0,
            "driver_feedback": driver_feedback if rider_session else "",
        })

    total_booked = get_total_booked_seats(db, ride_id)
    remaining_seats = max(0, ride.available_seats - total_booked)

    return {
        "ride_id": ride.id,
        "custom_ride_id": getattr(ride, 'custom_ride_id', None),
        "origin": ride.origin,
        "destination": ride.destination,
        "origin_address": getattr(ride, 'origin_address', None),
        "destination_address": getattr(ride, 'destination_address', None),
        "origin_place_name": getattr(ride, 'origin_place_name', None),
        "destination_place_name": getattr(ride, 'destination_place_name', None),
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
                rb.pickup_lat, rb.pickup_lon, rb.drop_lat, rb.drop_lon,
                rb.intersection_pickup_lat, rb.intersection_pickup_lon,
                rb.intersection_drop_lat, rb.intersection_drop_lon,
                rb.pickup_walk_distance_m, rb.drop_walk_distance_m,
                rb.pickup_address, rb.dropoff_address,
                rb.pickup_place_name, rb.dropoff_place_name,
                u.full_name as passenger_name, u.first_name, u.last_name, 
                u.profile_picture as passenger_profile_picture,
                u.gender as passenger_gender,
                COALESCE(rsr.driver_rating, 0) as driver_rating,
                COALESCE(rsr.driver_feedback, '') as driver_feedback,
                rsr.driver_rating_given,
                mr.id as mod_id,
                mr.requested_seats as mod_requested_seats,
                mr.current_seats as mod_current_seats,
                mr.status as mod_status,
                mr.created_at as mod_created_at,
                mr.rejection_reason as mod_rejection_reason
            FROM ride_bookings rb 
            LEFT JOIN users u ON u.phone_number = rb.passenger_phone
            LEFT JOIN ride_session_riders rsr ON rsr.booking_id = rb.id
            LEFT JOIN modification_requests mr ON mr.booking_id = rb.id AND mr.status IN ('pending', 'approved', 'rejected')
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
            
            modification_request = None
            if bk["mod_id"] is not None:
                modification_request = {
                    "id": bk["mod_id"],
                    "requested_seats": bk["mod_requested_seats"],
                    "current_seats": bk["mod_current_seats"],
                    "status": bk["mod_status"],
                    "created_at": bk["mod_created_at"].isoformat() if bk["mod_created_at"] else None,
                    "rejection_reason": bk["mod_rejection_reason"]
                }
            
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
                "pickup_address": bk.get("pickup_address"),
                "dropoff_address": bk.get("dropoff_address"),
                "pickup_place_name": bk.get("pickup_place_name"),
                "dropoff_place_name": bk.get("dropoff_place_name"),
                "pickup_lat": float(bk["pickup_lat"]) if bk["pickup_lat"] is not None else None,
                "pickup_lon": float(bk["pickup_lon"]) if bk["pickup_lon"] is not None else None,
                "drop_lat": float(bk["drop_lat"]) if bk["drop_lat"] is not None else None,
                "drop_lon": float(bk["drop_lon"]) if bk["drop_lon"] is not None else None,
                "intersection_pickup_lat": float(bk["intersection_pickup_lat"]) if bk["intersection_pickup_lat"] is not None else None,
                "intersection_pickup_lon": float(bk["intersection_pickup_lon"]) if bk["intersection_pickup_lon"] is not None else None,
                "intersection_drop_lat": float(bk["intersection_drop_lat"]) if bk["intersection_drop_lat"] is not None else None,
                "intersection_drop_lon": float(bk["intersection_drop_lon"]) if bk["intersection_drop_lon"] is not None else None,
                "pickup_walk_distance_m": bk["pickup_walk_distance_m"],
                "drop_walk_distance_m": bk["drop_walk_distance_m"],
                "driver_rating_given": bk["driver_rating_given"] is True or bk["driver_rating_given"] == 1,
                "driver_rating": float(bk["driver_rating"]) if bk["driver_rating"] else 0,
                "driver_feedback": bk["driver_feedback"] or "",
                "modification_request": modification_request
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
            "custom_ride_id": getattr(ride, 'custom_ride_id', None),
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
            "cancellation_reason": ride.cancellation_reason,
            "completed_at": ride.completed_at.isoformat() if hasattr(ride, 'completed_at') and ride.completed_at else None,
            "origin_lat": float(ride.origin_lat) if ride.origin_lat is not None else None,
            "origin_lon": float(ride.origin_lon) if ride.origin_lon is not None else None,
            "destination_lat": float(ride.destination_lat) if ride.destination_lat is not None else None,
            "destination_lon": float(ride.destination_lon) if ride.destination_lon is not None else None,
        })
    
    requested_raw = db.execute(text("""
        SELECT 
            rb.id, rb.ride_id, rb.passenger_phone, rb.seats_booked, rb.status,
            rb.created_at, rb.total_amount, rb.cancellation_reason,
            rb.pickup_lat, rb.pickup_lon, rb.drop_lat, rb.drop_lon,
            rb.intersection_pickup_lat, rb.intersection_pickup_lon,
            rb.intersection_drop_lat, rb.intersection_drop_lon,
            rb.pickup_walk_distance_m, rb.drop_walk_distance_m,
            rb.pickup_address, rb.dropoff_address,
            rb.pickup_place_name, rb.dropoff_place_name,
            r.origin, r.destination, r.departure_time, r.price_per_seat, r.available_seats,
            r.distance_km, r.duration_text, r.status as ride_status, r.women_only,
            r.route_coordinates, r.started_at as ride_started_at,
            r.origin_lat, r.origin_lon, r.destination_lat, r.destination_lon,
            r.completed_at as ride_completed_at,
            r.custom_ride_id as ride_custom_id,
            u.full_name as driver_name, u.first_name, u.last_name, u.phone_number as driver_phone,
            u.user_id as driver_user_id, u.profile_completed, 
            u.profile_picture as driver_profile_picture,
            u.avg_rating as driver_rating,
            v.id as vehicle_id, v.make, v.model, v.color, v.registration_number,
            ls.id as session_id, ls.status as session_status,
            ls.current_phase as session_phase,
            COALESCE(rsr.rider_rating, 0) as rider_rating,
            COALESCE(rsr.rider_feedback, '') as rider_feedback,
            rsr.rider_rating_given,
            mr.id as mod_id,
            mr.requested_seats as mod_requested_seats,
            mr.current_seats as mod_current_seats,
            mr.status as mod_status,
            mr.created_at as mod_created_at,
            mr.rejection_reason as mod_rejection_reason
        FROM ride_bookings rb
        JOIN rides r ON r.id = rb.ride_id
        LEFT JOIN users u ON u.phone_number = r.phone_number
        LEFT JOIN vehicles v ON v.id = r.vehicle_id
        LEFT JOIN ride_sessions ls ON ls.ride_id = r.id AND ls.status IN ('driver_started', 'boarding', 'en_route')
        LEFT JOIN ride_session_riders rsr ON rsr.booking_id = rb.id
        LEFT JOIN modification_requests mr ON mr.booking_id = rb.id AND mr.is_active = TRUE
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
                "status": row["session_status"],
                "current_phase": row["session_phase"]
            }
        
        modification_request = None
        if row["mod_id"] is not None:
            modification_request = {
                "id": row["mod_id"],
                "requested_seats": row["mod_requested_seats"],
                "current_seats": row["mod_current_seats"],
                "status": row["mod_status"],
                "created_at": row["mod_created_at"].isoformat() if row["mod_created_at"] else None,
                "rejection_reason": row["mod_rejection_reason"]
            }
        
        suggested_pickup_point = None
        suggested_drop_point = None
        
        if row["intersection_pickup_lat"] is not None and row["intersection_pickup_lon"] is not None:
            suggested_pickup_point = {
                "lat": float(row["intersection_pickup_lat"]),
                "lng": float(row["intersection_pickup_lon"])
            }
        elif row["pickup_lat"] is not None and row["pickup_lon"] is not None:
            suggested_pickup_point = {
                "lat": float(row["pickup_lat"]),
                "lng": float(row["pickup_lon"])
            }
        
        if row["intersection_drop_lat"] is not None and row["intersection_drop_lon"] is not None:
            suggested_drop_point = {
                "lat": float(row["intersection_drop_lat"]),
                "lng": float(row["intersection_drop_lon"])
            }
        elif row["drop_lat"] is not None and row["drop_lon"] is not None:
            suggested_drop_point = {
                "lat": float(row["drop_lat"]),
                "lng": float(row["drop_lon"])
            }
        
        requested_formatted.append({
            "id": row["id"],
            "custom_booking_id": getattr(row, 'custom_booking_id', None),
            "ride_id": row["ride_id"],
            "ride_custom_id": row["ride_custom_id"],
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
            "started_at": row["ride_started_at"].isoformat() if row["ride_started_at"] else None,
            "completed_at": row["ride_completed_at"].isoformat() if row["ride_completed_at"] else None,
            "pickup_lat": float(row["pickup_lat"]) if row["pickup_lat"] is not None else None,
            "pickup_lon": float(row["pickup_lon"]) if row["pickup_lon"] is not None else None,
            "drop_lat": float(row["drop_lat"]) if row["drop_lat"] is not None else None,
            "drop_lon": float(row["drop_lon"]) if row["drop_lon"] is not None else None,
            "intersection_pickup_lat": float(row["intersection_pickup_lat"]) if row["intersection_pickup_lat"] is not None else None,
            "intersection_pickup_lon": float(row["intersection_pickup_lon"]) if row["intersection_pickup_lon"] is not None else None,
            "intersection_drop_lat": float(row["intersection_drop_lat"]) if row["intersection_drop_lat"] is not None else None,
            "intersection_drop_lon": float(row["intersection_drop_lon"]) if row["intersection_drop_lon"] is not None else None,
            "pickup_walk_distance_m": row["pickup_walk_distance_m"],
            "drop_walk_distance_m": row["drop_walk_distance_m"],
            "suggested_pickup_point": suggested_pickup_point,
            "suggested_drop_point": suggested_drop_point,
            "origin_lat": float(row["origin_lat"]) if row["origin_lat"] is not None else None,
            "origin_lon": float(row["origin_lon"]) if row["origin_lon"] is not None else None,
            "destination_lat": float(row["destination_lat"]) if row["destination_lat"] is not None else None,
            "destination_lon": float(row["destination_lon"]) if row["destination_lon"] is not None else None,
            "rider_rating_given": row["rider_rating_given"] is True or row["rider_rating_given"] == 1,
            "rider_rating": float(row["rider_rating"]) if row["rider_rating"] else 0,
            "rider_feedback": row["rider_feedback"] or "",
            "modification_request": modification_request
        })
    
    return {
        "posted_rides": posted_formatted,
        "requested_rides": requested_formatted
    }


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
        
        ride.started_at = now
        ride.status = "active"
        db.commit()
        
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
            
            # In-app notification to passenger
            origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
            dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
            
            send_in_app_notification(
                db, booking.passenger_phone,
                title="Ride Started! 🚗",
                message=f"The driver has started the ride from {origin_short} to {dest_short}. You can now track your driver's location.",
                action_type="ride",
                action_value=str(ride.id)
            )
            
            emit_to_user(booking.passenger_phone, "ride-started", {
                "ride_id": ride_id,
                "session_id": live_session.id,
                "message": "The driver has started the ride!"
            })
            
            # Email notification to passenger
            try:
                passenger_email = get_user_email(db, booking.passenger_phone)
                if passenger_email:
                    passenger_name = get_user_name(db, booking.passenger_phone)
                    
                    ride_data = {
                        "origin": ride.origin,
                        "destination": ride.destination,
                        "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
                        "message": f"The driver has started the ride! You can now track your driver's location in the app."
                    }
                    send_ride_notification_email(passenger_email, passenger_name, ride_data, "ride_started", booking.id, ride.id)
            except Exception as e:
                print(f"Failed to send ride started email: {str(e)}")
        
        # In-app notification to driver
        send_in_app_notification(
            db, ride.phone_number,
            title="Ride Started! 🚗",
            message=f"You have started the ride from {ride.origin} to {ride.destination}. {len(accepted_bookings)} passenger(s) have been notified.",
            action_type="ride",
            action_value=str(ride.id)
        )
        
        db.commit()
        db.refresh(live_session)
        
        emit_to_ride(ride_id, "ride-started", {
            "ride_id": ride_id,
            "session_id": live_session.id,
            "message": "Ride has started!"
        })
        
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
    
    session = db.query(RideSession).filter(RideSession.id == session_id).first()
    if session:
        # In-app notification to driver
        send_in_app_notification(
            db, session.driver_phone,
            title="Rider Reached Pickup 📍",
            message=f"{rider.rider_name or 'A rider'} has reached the pickup location.",
            action_type="rider",
            action_value=str(rider.id)
        )
        
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
    from datetime import datetime, timezone
    from sqlalchemy.orm import joinedload
    
    try:
        booking_id = payload.get("booking_id")
        rider_phone = normalize_phone(payload.get("rider_phone", ""))
        qr_code_token = payload.get("qr_code_token")
        
        print(f"📝 Boarding request: session={session_id}, booking={booking_id}")
        
        session = db.query(RideSession).options(
            joinedload(RideSession.riders)
        ).filter(RideSession.id == session_id).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Ride session not found")
        
        print(f"✅ Session found: status={session.status}")
        
        if not session.qr_code_token:
            raise HTTPException(status_code=400, detail="No QR code available for this ride")
        
        if session.qr_code_token != qr_code_token:
            print(f"❌ QR mismatch: expected={session.qr_code_token}, got={qr_code_token}")
            raise HTTPException(status_code=400, detail="Invalid QR code")
        
        print(f"✅ QR code validated")
        
        rider = None
        for r in session.riders:
            if r.booking_id == booking_id or r.rider_phone == rider_phone:
                rider = r
                break
        
        if not rider:
            rider = db.query(RideSessionRider).filter(
                RideSessionRider.session_id == session_id,
                RideSessionRider.booking_id == booking_id
            ).first()
        
        if not rider:
            raise HTTPException(status_code=404, detail="Rider not found in this session")
        
        print(f"✅ Found rider: {rider.rider_name}, current status: {rider.status}")
        
        if rider.status in ["boarded", "dropped_off", "completed"]:
            return {
                "message": f"Rider already {rider.status}",
                "rider_status": rider.status,
                "already_boarded": True
            }
        
        now = datetime.now(timezone.utc)
        rider.status = "boarded"
        rider.boarded_at = now
        rider.pickup_confirmed = True
        
        boarded_count = db.query(RideSessionRider).filter(
            RideSessionRider.session_id == session_id,
            RideSessionRider.status.in_(["boarded", "dropped_off", "completed"])
        ).count()
        
        total_riders = db.query(RideSessionRider).filter(
            RideSessionRider.session_id == session_id
        ).count()
        
        print(f"📊 Boarded: {boarded_count}/{total_riders}")
        
        if boarded_count == total_riders:
            session.current_phase = "en_route"
            session.status = "en_route"
        else:
            session.current_phase = "boarding"
            session.status = "boarding"
        
        db.commit()
        print(f"✅ Database commit successful")
        
        # In-app notification to driver
        send_in_app_notification(
            db, session.driver_phone,
            title="Rider Boarded 🚗",
            message=f"{rider.rider_name or 'A rider'} has boarded the vehicle. {boarded_count}/{total_riders} riders now on board.",
            action_type="rider",
            action_value=str(rider.id)
        )
        
        try:
            emit_to_user(session.driver_phone, "rider-boarded", {
                "booking_id": booking_id,
                "rider_phone": rider.rider_phone,
                "rider_name": rider.rider_name or "Rider",
                "boarded_count": boarded_count,
                "total_riders": total_riders
            })
            
            emit_to_user(rider.rider_phone, "boarding-confirmed", {
                "session_id": session_id,
                "booking_id": booking_id,
                "message": "You have successfully boarded the vehicle"
            })
        except Exception as e:
            print(f"⚠️ Socket error (non-critical): {e}")
        
        return {
            "success": True,
            "message": "Boarding successful",
            "rider_status": rider.status,
            "session_status": session.status,
            "current_phase": session.current_phase,
            "boarded_count": boarded_count,
            "total_riders": total_riders
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"💥 Error in rider_board: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error boarding rider: {str(e)}")


@router.post("/ride-sessions/{session_id}/rider-dropped-off")
def rider_dropped_off(session_id: int, payload: dict, db: Session = Depends(get_db)):
    """Driver marks rider as dropped off"""
    try:
        booking_id = payload.get("booking_id")
        rider_phone = normalize_phone(payload.get("rider_phone", ""))
        
        print(f"📍 Dropoff request: session={session_id}, booking={booking_id}, phone={rider_phone}")
        
        rider = db.query(RideSessionRider).filter(
            RideSessionRider.session_id == session_id,
            RideSessionRider.booking_id == booking_id
        ).first()
        
        if not rider:
            rider = db.query(RideSessionRider).filter(
                RideSessionRider.session_id == session_id,
                RideSessionRider.rider_phone == rider_phone
            ).first()
        
        if not rider:
            raise HTTPException(status_code=404, detail="Rider not found")
        
        if rider.status != "boarded":
            raise HTTPException(status_code=400, detail=f"Rider must be boarded first. Current status: {rider.status}")
        
        rider.status = "dropped_off"
        rider.dropped_off_at = datetime.now(timezone.utc)
        rider.dropoff_confirmed = True
        
        session = db.query(RideSession).filter(RideSession.id == session_id).first()
        if session:
            dropped_count = sum(1 for r in session.riders if r.status in ["dropped_off", "completed"])
            total_riders = len(session.riders)
            
            if dropped_count == total_riders:
                session.current_phase = "completed"
        
        db.commit()
        print(f"✅ Rider {rider.rider_name} dropped off successfully")
        
        # In-app notification to driver
        send_in_app_notification(
            db, session.driver_phone,
            title="Rider Dropped Off 📍",
            message=f"{rider.rider_name or 'A rider'} has been dropped off at their destination.",
            action_type="rider",
            action_value=str(rider.id)
        )
        
        try:
            emit_to_user(session.driver_phone, "rider-dropped-off", {
                "booking_id": booking_id,
                "rider_phone": rider.rider_phone,
                "rider_name": rider.rider_name,
                "message": f"{rider.rider_name or 'Rider'} has been dropped off"
            })
        except Exception as e:
            print(f"Socket error: {e}")
        
        return {
            "message": "Rider dropped off successfully",
            "rider_status": rider.status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in rider_dropped_off: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


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
    
    if session:
        all_completed = all(r.status == "completed" for r in session.riders)
        if all_completed:
            session.status = "completed"
            session.current_phase = "completed"
            session.completed_at = datetime.now(timezone.utc)
            
            ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
            if ride:
                ride.status = "completed"
            
            db.commit()
            
            # In-app notification to driver
            send_in_app_notification(
                db, session.driver_phone,
                title="Ride Completed ✅",
                message=f"All riders have completed their rides!",
                action_type="ride",
                action_value=str(session.ride_id)
            )
            
            emit_to_user(session.driver_phone, "ride-completed", {
                "ride_id": session.ride_id,
                "session_id": session_id,
                "message": "All riders have completed the ride"
            })
    
    # In-app notification to rider
    send_in_app_notification(
        db, rider_phone,
        title="Ride Completed ✅",
        message="Your ride has been completed! Please rate your driver.",
        action_type="ride",
        action_value=str(session.ride_id if session else None)
    )
    
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
    
    # In-app notification to driver
    send_in_app_notification(
        db, driver_phone,
        title="Ride Completed ✅",
        message=f"Your ride from {ride.origin if ride else 'start'} to {ride.destination if ride else 'destination'} has been completed.",
        action_type="ride",
        action_value=str(session.ride_id)
    )
    
    emit_to_ride(session.ride_id, "ride-completed-by-driver", {
        "session_id": session_id,
        "ride_id": session.ride_id,
        "message": "Driver has completed the ride"
    })
    
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
    
    # In-app notification to driver
    if session:
        send_in_app_notification(
            db, session.driver_phone,
            title="New Rating ⭐",
            message=f"A rider rated you {rating}/5 stars.",
            action_type="rating",
            action_value=str(session_id)
        )
    
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
    
    # In-app notification to rider
    send_in_app_notification(
        db, rider.rider_phone,
        title="New Rating ⭐",
        message=f"The driver rated you {rating}/5 stars.",
        action_type="rating",
        action_value=str(session_id)
    )
    
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
    
    # In-app notification to all riders
    for rider in session.riders:
        send_in_app_notification(
            db, rider.rider_phone,
            title="🚨 SOS Alert 🚨",
            message="An emergency SOS has been triggered. Help is on the way.",
            action_type="sos",
            action_value=str(session_id)
        )
        
        emit_to_user(rider.rider_phone, "sos-triggered", {
            "session_id": session_id,
            "message": "Emergency SOS has been triggered"
        })
    
    # Also notify the driver
    send_in_app_notification(
        db, session.driver_phone,
        title="🚨 SOS Alert 🚨",
        message="An SOS has been triggered on your ride.",
        action_type="sos",
        action_value=str(session_id)
    )
    
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
    
    ride = db.query(Ride).filter(
        Ride.id == ride_id,
        Ride.phone_number == normalized_phone
    ).first()
    
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found or you don't have permission to edit it")
    
    if ride.started_at:
        raise HTTPException(status_code=400, detail="Cannot edit ride - Ride has already started")
    
    if ride.cancellation_reason:
        raise HTTPException(status_code=400, detail="Cannot edit cancelled ride")
    
    confirmed_bookings = db.query(RideBooking).filter(
        RideBooking.ride_id == ride_id,
        RideBooking.status == "accepted"
    ).all()
    
    has_confirmed_bookings = len(confirmed_bookings) > 0
    total_booked_seats = sum(b.seats_booked for b in confirmed_bookings)
    
    duration_minutes = parse_duration_to_minutes(data.duration_text)
    
    departure_time_utc = data.departure_time
    if departure_time_utc.tzinfo is None:
        departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
    else:
        departure_time_utc = departure_time_utc.astimezone(timezone.utc)
    
    expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
    min_departure_time = datetime.now(timezone.utc) + timedelta(minutes=30)
    if departure_time_utc < min_departure_time:
        min_time_ist = to_ist(min_departure_time)
        raise HTTPException(status_code=400, detail=f"Departure time must be at least 30 minutes from now")
    
    if data.available_seats < total_booked_seats:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot reduce seats below {total_booked_seats} as you have {total_booked_seats} confirmed passenger(s)."
        )
    
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
    
    remaining_seats = ride.available_seats - total_booked_seats
    if remaining_seats <= 0 and ride.status == "active":
        ride.status = "full"
    elif remaining_seats > 0 and ride.status == "full":
        ride.status = "active"
    
    db.commit()
    db.refresh(ride)
    
    # ============================================
    # IN-APP NOTIFICATION TO DRIVER
    # ============================================
    origin_short = data.origin.split(",")[0].strip() if data.origin else "start"
    dest_short = data.destination.split(",")[0].strip() if data.destination else "destination"
    
    send_in_app_notification(
        db, normalized_phone,
        title="Ride Updated! 🔄",
        message=f"Your ride from {origin_short} to {dest_short} has been updated successfully.",
        action_type="ride",
        action_value=str(ride.id)
    )
    
    # ============================================
    # EMAIL NOTIFICATION TO DRIVER
    # ============================================
    try:
        driver_email = get_user_email(db, normalized_phone)
        print(f"📧 Driver email check: {driver_email}")
        
        if driver_email:
            driver_name = get_user_name(db, normalized_phone)
            email_ride_data = {
                "origin": ride.origin,
                "destination": ride.destination,
                "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
                "seats_available": ride.available_seats,
                "price_per_seat": ride.price_per_seat
            }
            
            print(f"📧 Sending ride update email to driver: {driver_email}")
            email_sent = send_ride_notification_email(
                driver_email,
                driver_name,
                email_ride_data,
                "ride_updated_driver",
                None,
                ride.id
            )
            print(f"📧 Email sent result: {email_sent}")
        else:
            print(f"⚠️ No email found for driver: {normalized_phone}")
    except Exception as e:
        print(f"❌ Failed to send ride update email to driver: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # ============================================
    # NOTIFY ALL PASSENGERS ABOUT RIDE UPDATE
    # ============================================
    if has_confirmed_bookings:
        print(f"📧 Notifying {len(confirmed_bookings)} passengers about ride update")
        for booking in confirmed_bookings:
            # In-app notification to passenger
            send_in_app_notification(
                db, booking.passenger_phone,
                title="Ride Updated 🔄",
                message=f"The ride from {origin_short} to {dest_short} has been updated by the driver. Please check the app for details.",
                action_type="ride",
                action_value=str(ride.id)
            )
            
            try:
                passenger_email = get_user_email(db, booking.passenger_phone)
                print(f"📧 Passenger email check for {booking.passenger_phone}: {passenger_email}")
                
                if passenger_email:
                    passenger_name = get_user_name(db, booking.passenger_phone)
                    passenger_email_data = {
                        "origin": ride.origin,
                        "destination": ride.destination,
                        "departure_time_display": to_ist(ride.departure_time).strftime("%d %b %Y, %I:%M %p"),
                        "message": f"The ride from {ride.origin} to {ride.destination} has been updated by the driver. Please check the app for details."
                    }
                    
                    print(f"📧 Sending ride update email to passenger: {passenger_email}")
                    email_sent = send_ride_notification_email(
                        passenger_email,
                        passenger_name,
                        passenger_email_data,
                        "ride_updated",
                        booking.id,
                        ride.id
                    )
                    print(f"📧 Email sent to passenger {passenger_email}: {email_sent}")
                else:
                    print(f"⚠️ No email found for passenger: {booking.passenger_phone}")
            except Exception as e:
                print(f"❌ Failed to send update email to passenger {booking.passenger_phone}: {str(e)}")
    
    # Socket event to notify all listeners
    emit_to_ride(ride_id, "ride-updated", {
        "ride_id": ride.id,
        "origin": ride.origin,
        "destination": ride.destination,
        "departure_time": ride.departure_time.isoformat(),
        "available_seats": ride.available_seats,
        "remaining_seats": remaining_seats,
        "price_per_seat": ride.price_per_seat
    })
    
    return {
        "message": "Ride updated successfully",
        "ride_id": ride.id,
        "remaining_seats": max(0, ride.available_seats - total_booked_seats),
        "total_booked": total_booked_seats
    }

@router.put("/booking/{booking_id}/modify-seats")
def modify_booking_seats(booking_id: int, request: ModifySeatsRequest, db: Session = Depends(get_db)):
    """Modify seats for a pending booking (not modification request)"""
    booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending bookings can be directly modified")
    
    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    new_seats = request.new_seats
    
    if new_seats <= 0:
        raise HTTPException(status_code=400, detail="Seat count must be at least 1")
    
    if ride.status not in ["active", "full"]:
        raise HTTPException(status_code=400, detail="Ride is no longer available")
    
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
    
    if request.pickup_address is not None:
        booking.pickup_address = request.pickup_address
    if request.dropoff_address is not None:
        booking.dropoff_address = request.dropoff_address
    if request.pickup_place_name is not None:
        booking.pickup_place_name = request.pickup_place_name
    if request.dropoff_place_name is not None:
        booking.dropoff_place_name = request.dropoff_place_name
    
    db.commit()
    
    # In-app notification to driver
    origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
    dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
    
    send_in_app_notification(
        db, ride.phone_number,
        title="Booking Modified 🔄",
        message=f"Passenger has modified their booking from {old_seats} to {new_seats} seat(s) on ride from {origin_short} to {dest_short}.",
        action_type="booking",
        action_value=str(booking.id)
    )
    
    emit_to_user(ride.phone_number, "booking-modified", {
        "booking_id": booking.id,
        "passenger_phone": booking.passenger_phone,
        "old_seats": old_seats,
        "new_seats": new_seats,
        "ride_id": ride.id
    })
    
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
        
        pending_mods = db.query(ModificationRequest).filter(
            ModificationRequest.ride_id == ride.id,
            ModificationRequest.status == "pending"
        ).all()
        
        for mod in pending_mods:
            mod.status = "cancelled"
            mod.rejection_reason = "Ride auto-cancelled - not started on time"
            mod.cancelled_at = now
        
        accepted_bookings = db.query(RideBooking).filter(
            RideBooking.ride_id == ride.id,
            RideBooking.status == "accepted"
        ).all()
        
        for booking in accepted_bookings:
            booking.status = "cancelled"
            booking.cancellation_reason = "Ride auto-cancelled - not started on time"
            
            # In-app notification to passenger
            origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
            dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"
            
            send_in_app_notification(
                db, booking.passenger_phone,
                title="Ride Auto-cancelled ⏰",
                message=f"The ride from {origin_short} to {dest_short} has been auto-cancelled as it was not started on time.",
                action_type="cancellation",
                action_value=str(ride.id)
            )
            
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


# ============================================
# RIDE REQUEST ALERTS (EMAIL NOTIFICATIONS FOR MATCHING RIDES)
# ============================================

class RideRequestAlert(BaseModel):
    from_location: str
    to_location: str
    from_coords: Optional[List[float]] = None
    to_coords: Optional[List[float]] = None
    preferred_date: Optional[datetime] = None
    preferred_time: Optional[str] = None
    seats_needed: int = 1
    passenger_phone: str
    passenger_name: Optional[str] = None
    passenger_email: str
    notes: Optional[str] = None


def send_ride_available_email_azure(to_email: str, passenger_name: str, ride_data: dict) -> bool:
    """Send email notification using Azure Communication Services when a matching ride is posted"""
    
    from azure.communication.email import EmailClient
    from azure.core.exceptions import HttpResponseError

    AZURE_EMAIL_CONNECTION_STRING = os.getenv("AZURE_EMAIL_CONNECTION_STRING")
    AZURE_EMAIL_FROM = "DoNotReply@drivve.in"
    
    if not AZURE_EMAIL_CONNECTION_STRING:
        print("❌ Azure Email connection string not configured")
        return False
    
    if not to_email or '@' not in to_email:
        print(f"❌ Invalid email address: {to_email}")
        return False
    
    try:
        print(f"📧 Initializing Azure Email client...")
        email_client = EmailClient.from_connection_string(AZURE_EMAIL_CONNECTION_STRING)
        
        departure_time = ride_data.get('departure_time_display', 'Flexible')
        deep_link = f"drivve://ride/{ride_data.get('ride_id')}"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #ED7117; margin-top: 10px;">🚗 Ride Available!</h2>
                    </div>
                    
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                        Hey {passenger_name or 'there'},
                    </p>
                    
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                        Good news! A ride matching your requested route has been posted:
                    </p>
                    
                    <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #ED7117;">
                        <div style="margin-bottom: 15px;">
                            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                <span style="font-size: 20px; margin-right: 10px;">📍</span>
                                <div>
                                    <div style="font-size: 12px; color: #6b7280;">FROM</div>
                                    <div style="font-weight: bold; color: #111827;">{ride_data.get('origin', 'N/A')}</div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center;">
                                <span style="font-size: 20px; margin-right: 10px;">🎯</span>
                                <div>
                                    <div style="font-size: 12px; color: #6b7280;">TO</div>
                                    <div style="font-weight: bold; color: #111827;">{ride_data.get('destination', 'N/A')}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 10px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="color: #6b7280;">📅 Date & Time</span>
                                <span style="font-weight: 600;">{departure_time}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="color: #6b7280;">💺 Seats Available</span>
                                <span style="font-weight: 600;">{ride_data.get('seats_available', 'Check app')} seats</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #6b7280;">💰 Price</span>
                                <span style="font-weight: 600; color: #ED7117;">₹{ride_data.get('price_per_seat', 'Check app')} per seat</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{deep_link}" 
                           style="background-color: #ED7117; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 25px; display: inline-block;
                                  font-weight: bold;">
                            Book This Ride Now →
                        </a>
                    </div>
                    
                    <div style="text-align: center; border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 30px;">
                        <p style="font-size: 12px; color: #9ca3af;">
                            Safe travels!<br>
                            <strong>Team Drivve</strong>
                        </p>
                    </div>
                    
                </div>
            </body>
        </html>
        """
        
        message = {
            "senderAddress": AZURE_EMAIL_FROM,
            "recipients": {
                "to": [{"address": to_email}]
            },
            "content": {
                "subject": f"🚗 Ride Available: {ride_data.get('origin', 'Ride')[:50]} → {ride_data.get('destination', 'Available')[:50]}",
                "html": html_content
            }
        }
        
        print(f"📤 Sending email to {to_email}...")
        poller = email_client.begin_send(message)
        result = poller.result()
        print(f"✅ Ride alert email sent to {to_email}")
        return True
        
    except HttpResponseError as e:
        print(f"❌ Azure HTTP Error: {e.message}")
        return False
    except Exception as e:
        print(f"❌ Failed to send ride alert email: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
def check_matching_ride_requests(db: Session, ride: Ride):
    """Check for matching ride requests when a new ride is posted - WITH DISTANCE-BASED MATCHING"""
    try:
        print(f"\n🔍 ========== CHECKING MATCHING RIDE REQUESTS ==========")
        
        ride_time_ist = to_ist(ride.departure_time)
        ride_date = ride_time_ist.date()
        
        print(f"🚗 New ride posted:")
        print(f"   From: {ride.origin[:50]}")
        print(f"   To: {ride.destination[:50]}")
        print(f"   Departure (IST): {ride_time_ist.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"   Date: {ride_date}")
        
        # Get ride coordinates
        ride_origin_lat = ride.origin_lat
        ride_origin_lon = ride.origin_lon
        ride_dest_lat = ride.destination_lat
        ride_dest_lon = ride.destination_lon
        
        # Maximum allowed distance in meters (5 km = 5000 meters)
        MAX_DISTANCE_M = 5000
        
        now_utc = datetime.now(timezone.utc)
        active_requests = db.query(RideRequest).filter(
            RideRequest.status == "active",
            RideRequest.expires_at > now_utc
        ).all()
        
        print(f"\n📋 Found {len(active_requests)} active ride requests")
        
        notified_count = 0
        
        for req in active_requests:
            print(f"\n--- Checking Request #{req.id} ---")
            
            if not req.preferred_date:
                print(f"   ⏰ No preferred date - skipping")
                continue
            
            req_time_ist = to_ist(req.preferred_date)
            req_date = req_time_ist.date()
            
            if req_date != ride_date:
                print(f"   ❌ Date mismatch: Request on {req_date}, Ride on {ride_date}")
                continue
            
            print(f"   ✅ Same date match: {req_date}")
            
            # ============================================
            # DISTANCE-BASED MATCHING (4-5 KM radius)
            # ============================================
            
            # Get request coordinates
            req_origin_lat = req.from_lat
            req_origin_lon = req.from_lon
            req_dest_lat = req.to_lat
            req_dest_lon = req.to_lon
            
            # Skip if coordinates are missing
            if not all([ride_origin_lat, ride_origin_lon, ride_dest_lat, ride_dest_lon,
                       req_origin_lat, req_origin_lon, req_dest_lat, req_dest_lon]):
                print(f"   ⚠️ Missing coordinates - cannot calculate distance")
                # Fall back to text matching
                ride_from = ride.origin.split(',')[0].strip().lower()
                ride_to = ride.destination.split(',')[0].strip().lower()
                req_from = req.from_location.split(',')[0].strip().lower()
                req_to = req.to_location.split(',')[0].strip().lower()
                
                from_match = (ride_from == req_from or ride_from in req_from or req_from in ride_from)
                to_match = (ride_to == req_to or ride_to in req_to or req_to in ride_to)
                
                if not (from_match and to_match):
                    print(f"   ❌ Text match failed")
                    continue
            else:
                # Calculate distances
                pickup_distance = haversine_m(
                    ride_origin_lat, ride_origin_lon,
                    req_origin_lat, req_origin_lon
                )
                
                drop_distance = haversine_m(
                    ride_dest_lat, ride_dest_lon,
                    req_dest_lat, req_dest_lon
                )
                
                # Also check reverse direction (ride pickup near request drop, ride drop near request pickup)
                reverse_pickup_distance = haversine_m(
                    ride_origin_lat, ride_origin_lon,
                    req_dest_lat, req_dest_lon
                )
                
                reverse_drop_distance = haversine_m(
                    ride_dest_lat, ride_dest_lon,
                    req_origin_lat, req_origin_lon
                )
                
                print(f"   📍 Distance calculations:")
                print(f"      Pickup distance: {pickup_distance:.0f}m")
                print(f"      Drop distance: {drop_distance:.0f}m")
                print(f"      Reverse pickup: {reverse_pickup_distance:.0f}m")
                print(f"      Reverse drop: {reverse_drop_distance:.0f}m")
                
                # Check if either direction matches within 5km radius
                same_direction_match = (pickup_distance <= MAX_DISTANCE_M and drop_distance <= MAX_DISTANCE_M)
                reverse_direction_match = (reverse_pickup_distance <= MAX_DISTANCE_M and reverse_drop_distance <= MAX_DISTANCE_M)
                
                # Also allow partial matches (e.g., pickup close but drop a bit farther, but within extended range)
                extended_range_m = MAX_DISTANCE_M * 2  # 10 km
                partial_match = (
                    (pickup_distance <= MAX_DISTANCE_M and drop_distance <= extended_range_m) or
                    (drop_distance <= MAX_DISTANCE_M and pickup_distance <= extended_range_m) or
                    (reverse_pickup_distance <= MAX_DISTANCE_M and reverse_drop_distance <= extended_range_m) or
                    (reverse_drop_distance <= MAX_DISTANCE_M and reverse_pickup_distance <= extended_range_m)
                )
                
                if same_direction_match:
                    print(f"   ✅ SAME DIRECTION MATCH! (within {MAX_DISTANCE_M/1000:.1f}km)")
                elif reverse_direction_match:
                    print(f"   ✅ REVERSE DIRECTION MATCH! (within {MAX_DISTANCE_M/1000:.1f}km)")
                elif partial_match:
                    print(f"   ✅ PARTIAL MATCH! (within {extended_range_m/1000:.1f}km range)")
                else:
                    print(f"   ❌ Distance too far:")
                    print(f"      Same direction: pickup={pickup_distance:.0f}m, drop={drop_distance:.0f}m")
                    print(f"      Reverse direction: pickup={reverse_pickup_distance:.0f}m, drop={reverse_drop_distance:.0f}m")
                    continue
            
            print(f"   ✅ Location matched!")
            
            # Check seats availability
            total_booked = get_total_booked_seats(db, ride.id)
            available_seats = ride.available_seats - total_booked
            
            if available_seats < req.seats_needed:
                print(f"   ❌ Not enough seats: Need {req.seats_needed}, Available {available_seats}")
                continue
            
            # Check email
            if not req.passenger_email or '@' not in req.passenger_email:
                print(f"   ❌ No valid email address")
                continue
            
            # Prepare ride data for email (times in IST)
            ride_data = {
                "ride_id": ride.id,
                "origin": ride.origin,
                "destination": ride.destination,
                "departure_time_display": ride_time_ist.strftime("%d %b %Y, %I:%M %p"),
                "seats_available": available_seats,
                "price_per_seat": ride.price_per_seat,
                "request_date": to_ist(req.created_at).strftime("%d %b %Y"),
                "pickup_distance_m": int(pickup_distance) if 'pickup_distance' in locals() else None,
                "drop_distance_m": int(drop_distance) if 'drop_distance' in locals() else None
            }
            
            print(f"\n📧 SENDING EMAIL NOTIFICATION:")
            print(f"   To: {req.passenger_email}")
            print(f"   Name: {req.passenger_name or 'User'}")
            if 'pickup_distance' in locals():
                print(f"   Pickup distance: {pickup_distance:.0f}m")
                print(f"   Drop distance: {drop_distance:.0f}m")
            
            # Send email
            email_sent = send_ride_available_email_azure(
                req.passenger_email,
                req.passenger_name or "there",
                ride_data
            )
            
            if email_sent:
                req.status = "notified"
                req.notified_at = datetime.now(timezone.utc)
                notified_count += 1
                print(f"   ✅ Email sent successfully!")
            else:
                print(f"   ❌ Failed to send email")
        
        if notified_count > 0:
            db.commit()
            print(f"\n✅ Total notifications sent: {notified_count}")
        else:
            print(f"\n📭 No matching requests found for date {ride_date}")
        
        print(f"🔍 ==================================\n")
        return notified_count
        
    except Exception as e:
        print(f"❌ Error in check_matching_ride_requests: {str(e)}")
        import traceback
        traceback.print_exc()
        return 0

@router.post("/request-ride-alert")
def request_ride_alert(
    request: RideRequestAlert,
    db: Session = Depends(get_db)
):
    """Passenger requests email notification when a matching ride is posted"""
    try:
        normalized_phone = normalize_phone(request.passenger_phone)
        
        existing_request = db.query(RideRequest).filter(
            RideRequest.passenger_phone == normalized_phone,
            func.lower(RideRequest.from_location) == func.lower(request.from_location),
            func.lower(RideRequest.to_location) == func.lower(request.to_location),
            RideRequest.status == "active",
            RideRequest.expires_at > datetime.now(timezone.utc)
        ).first()
        
        if existing_request:
            return {
                "success": False,
                "message": "You already have an active request for this route. We'll notify you when a ride is available.",
                "request_id": existing_request.id,
                "expires_at": existing_request.expires_at.isoformat()
            }
        
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        new_request = RideRequest(
            passenger_phone=normalized_phone,
            passenger_name=request.passenger_name,
            passenger_email=request.passenger_email,
            from_location=request.from_location,
            to_location=request.to_location,
            from_lat=request.from_coords[1] if request.from_coords and len(request.from_coords) >= 2 else None,
            from_lon=request.from_coords[0] if request.from_coords and len(request.from_coords) >= 2 else None,
            to_lat=request.to_coords[1] if request.to_coords and len(request.to_coords) >= 2 else None,
            to_lon=request.to_coords[0] if request.to_coords and len(request.to_coords) >= 2 else None,
            preferred_date=request.preferred_date,
            preferred_time=request.preferred_time,
            seats_needed=request.seats_needed,
            notes=request.notes,
            status="active",
            expires_at=expires_at
        )
        
        db.add(new_request)
        db.commit()
        db.refresh(new_request)
        
        return {
            "success": True,
            "message": "Ride request alert created successfully. We'll email you when a matching ride is posted.",
            "request_id": new_request.id,
            "expires_at": expires_at.isoformat()
        }
        
    except Exception as e:
        print(f"Error creating ride request alert: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/my-ride-requests/{phone_number}")
def get_user_ride_requests(
    phone_number: str,
    db: Session = Depends(get_db)
):
    """Get all ride requests for a user"""
    try:
        normalized_phone = normalize_phone(phone_number)
        
        requests = db.query(RideRequest).filter(
            RideRequest.passenger_phone == normalized_phone
        ).order_by(RideRequest.created_at.desc()).all()
        
        return {
            "success": True,
            "requests": [
                {
                    "id": req.id,
                    "from_location": req.from_location,
                    "to_location": req.to_location,
                    "preferred_date": req.preferred_date.isoformat() if req.preferred_date else None,
                    "preferred_time": req.preferred_time,
                    "seats_needed": req.seats_needed,
                    "status": req.status,
                    "created_at": req.created_at.isoformat(),
                    "expires_at": req.expires_at.isoformat() if req.expires_at else None,
                    "notified_at": req.notified_at.isoformat() if req.notified_at else None,
                    "notes": req.notes
                }
                for req in requests
            ]
        }
        
    except Exception as e:
        print(f"Error getting ride requests: {str(e)}")
        return {"success": False, "requests": [], "error": str(e)}


@router.delete("/ride-request/{request_id}")
def cancel_ride_request(
    request_id: int,
    phone_number: str,
    db: Session = Depends(get_db)
):
    """Cancel an active ride request"""
    try:
        normalized_phone = normalize_phone(phone_number)
        
        ride_request = db.query(RideRequest).filter(
            RideRequest.id == request_id,
            RideRequest.passenger_phone == normalized_phone
        ).first()
        
        if not ride_request:
            raise HTTPException(status_code=404, detail="Ride request not found")
        
        if ride_request.status != "active":
            raise HTTPException(status_code=400, detail=f"Cannot cancel request that is already {ride_request.status}")
        
        ride_request.status = "cancelled"
        ride_request.cancelled_at = datetime.now(timezone.utc)
        db.commit()
        
        return {
            "success": True,
            "message": "Ride request cancelled successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error cancelling ride request: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ride-requests/cleanup-expired")
def cleanup_expired_ride_requests(db: Session = Depends(get_db)):
    """Admin endpoint to mark expired ride requests"""
    try:
        expired_requests = db.query(RideRequest).filter(
            RideRequest.status == "active",
            RideRequest.expires_at < datetime.now(timezone.utc)
        ).all()
        
        expired_count = 0
        for req in expired_requests:
            req.status = "expired"
            expired_count += 1
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Marked {expired_count} expired ride requests",
            "expired_count": expired_count
        }
        
    except Exception as e:
        print(f"Error cleaning up expired requests: {str(e)}")
        return {"success": False, "error": str(e)}


# ============================================
# ADDITIONAL ENDPOINTS (EARNINGS, RATINGS, ETC.)
# ============================================

@router.get("/driver-earnings")
def get_driver_earnings(phone_number: str, db: Session = Depends(get_db)):
    """Get total earnings from completed rides for a driver"""
    normalized_phone = normalize_phone(phone_number)
    
    completed_rides = db.query(Ride).filter(
        Ride.phone_number == normalized_phone,
        Ride.status == "completed"
    ).all()
    
    total_earnings = 0
    rides_details = []
    
    for ride in completed_rides:
        bookings = db.query(RideBooking).filter(
            RideBooking.ride_id == ride.id,
            RideBooking.status.in_(["accepted", "completed"])
        ).all()
        
        ride_total = 0
        for booking in bookings:
            ride_total += booking.total_amount or 0
        
        total_earnings += ride_total
        
        rides_details.append({
            "ride_id": ride.id,
            "origin": ride.origin,
            "destination": ride.destination,
            "departure_time": ride.departure_time.isoformat(),
            "total_amount": ride_total,
            "bookings_count": len(bookings)
        })
    
    return {
        "success": True,
        "phone_number": normalized_phone,
        "total_earnings": total_earnings,
        "completed_rides_count": len(completed_rides),
        "rides": rides_details
    }


@router.get("/users/{phone_number}/rating")
def get_user_rating(phone_number: str, db: Session = Depends(get_db)):
    """Get user's average rating from completed rides"""
    normalized_phone = normalize_phone(phone_number)
    
    user = db.query(User).filter(User.phone_number == normalized_phone).first()
    
    if not user:
        return {
            "success": False,
            "message": "User not found"
        }
    
    if user.avg_rating and user.avg_rating > 0:
        return {
            "success": True,
            "phone_number": normalized_phone,
            "average_rating": round(float(user.avg_rating), 1),
            "total_ratings": user.total_ratings or 0,
            "source": "user_model"
        }
    
    return {
        "success": True,
        "phone_number": normalized_phone,
        "average_rating": 4.5,
        "total_ratings": 0
    }


@router.get("/api/v1/bookings/{booking_id}/ride")
def get_ride_from_booking(booking_id: int, db: Session = Depends(get_db)):
    """Fetch complete ride details from a booking ID"""
    try:
        booking = db.query(RideBooking).options(
            joinedload(RideBooking.ride)
        ).filter(RideBooking.id == booking_id).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        ride = booking.ride
        if not ride:
            raise HTTPException(status_code=404, detail="Ride not found for this booking")
        
        driver = db.query(User).filter(User.phone_number == ride.phone_number).first()
        
        vehicle = None
        if ride.vehicle_id:
            vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first()
        
        total_booked = get_total_booked_seats(db, ride.id)
        remaining_seats = max(0, ride.available_seats - total_booked)
        
        driver_rating = 4.5
        if driver and driver.avg_rating:
            driver_rating = float(driver.avg_rating)
        
        route_coords = ride.route_coordinates
        if route_coords and isinstance(route_coords, str):
            import json
            try:
                route_coords = json.loads(route_coords)
            except:
                route_coords = []
        
        suggested_pickup = None
        suggested_drop = None
        
        if booking.intersection_pickup_lat and booking.intersection_pickup_lon:
            suggested_pickup = {
                "lat": float(booking.intersection_pickup_lat),
                "lng": float(booking.intersection_pickup_lon)
            }
        elif ride.route_coordinates and len(ride.route_coordinates) > 0:
            first = ride.route_coordinates[0]
            if isinstance(first, list) and len(first) >= 2:
                suggested_pickup = {"lng": float(first[0]), "lat": float(first[1])}
        
        if booking.intersection_drop_lat and booking.intersection_drop_lon:
            suggested_drop = {
                "lat": float(booking.intersection_drop_lat),
                "lng": float(booking.intersection_drop_lon)
            }
        elif ride.route_coordinates and len(ride.route_coordinates) > 0:
            last = ride.route_coordinates[-1]
            if isinstance(last, list) and len(last) >= 2:
                suggested_drop = {"lng": float(last[0]), "lat": float(last[1])}
        
        ride_status = ride.status
        if ride.started_at and ride_status != "completed":
            ride_status = "ongoing"
        elif ride.cancellation_reason:
            ride_status = "cancelled"
        elif remaining_seats == 0 and ride_status == "active":
            ride_status = "full"
        
        response_data = {
            "success": True,
            "ride": {
                "id": ride.id,
                "custom_ride_id": getattr(ride, 'custom_ride_id', None),
                "origin": ride.origin,
                "destination": ride.destination,
                "origin_address": getattr(ride, 'origin_address', None),
                "destination_address": getattr(ride, 'destination_address', None),
                "origin_place_name": getattr(ride, 'origin_place_name', None),
                "destination_place_name": getattr(ride, 'destination_place_name', None),
                "departure_time": ride.departure_time.isoformat() if ride.departure_time else None,
                "available_seats": ride.available_seats,
                "price_per_seat": float(ride.price_per_seat) if ride.price_per_seat else 0,
                "distance_km": float(ride.distance_km) if ride.distance_km else None,
                "duration_text": ride.duration_text,
                "route_coordinates": route_coords,
                "origin_latitude": float(ride.origin_lat) if ride.origin_lat else None,
                "origin_longitude": float(ride.origin_lon) if ride.origin_lon else None,
                "destination_latitude": float(ride.destination_lat) if ride.destination_lat else None,
                "destination_longitude": float(ride.destination_lon) if ride.destination_lon else None,
                "women_only": ride.women_only or False,
                "status": ride_status,
                "started_at": ride.started_at.isoformat() if ride.started_at else None,
                "cancellation_reason": ride.cancellation_reason,
                "preferences": ride.preferences,
                "driver_name": driver.full_name or f"Driver {ride.phone_number[-4:]}" if driver else "Driver",
                "driver_phone": ride.phone_number,
                "driver_user_id": driver.user_id if driver else None,
                "driver_profile_picture": driver.profile_picture if driver else None,
                "driver_rating": driver_rating,
                "suggested_pickup_point": suggested_pickup,
                "suggested_drop_point": suggested_drop,
                "vehicle": {
                    "id": vehicle.id if vehicle else None,
                    "make": vehicle.make if vehicle else None,
                    "model": vehicle.model if vehicle else None,
                    "color": vehicle.color if vehicle else None,
                    "registration_number": vehicle.registration_number if vehicle else None,
                    "photo_url": vehicle.photo_url if vehicle else None,
                } if vehicle else None,
                "total_booked_seats": total_booked,
                "remaining_seats": remaining_seats
            },
            "booking": {
                "id": booking.id,
                "custom_booking_id": getattr(booking, 'custom_booking_id', None),
                "seats_requested": booking.seats_booked,
                "status": booking.status,
                "total_amount": float(booking.total_amount) if booking.total_amount else None,
                "created_at": booking.created_at.isoformat() if booking.created_at else None,
                "pickup_address": getattr(booking, 'pickup_address', None),
                "dropoff_address": getattr(booking, 'dropoff_address', None),
                "pickup_place_name": getattr(booking, 'pickup_place_name', None),
                "dropoff_place_name": getattr(booking, 'dropoff_place_name', None),
                "pickup_walk_distance_m": booking.pickup_walk_distance_m,
                "drop_walk_distance_m": booking.drop_walk_distance_m,
                "intersection_pickup": {
                    "lat": float(booking.intersection_pickup_lat) if booking.intersection_pickup_lat else None,
                    "lng": float(booking.intersection_pickup_lon) if booking.intersection_pickup_lon else None
                } if booking.intersection_pickup_lat and booking.intersection_pickup_lon else None,
                "intersection_drop": {
                    "lat": float(booking.intersection_drop_lat) if booking.intersection_drop_lat else None,
                    "lng": float(booking.intersection_drop_lon) if booking.intersection_drop_lon else None
                } if booking.intersection_drop_lat and booking.intersection_drop_lon else None
            }
        }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_ride_from_booking: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching ride details: {str(e)}")


# ============================================
# RIDE SESSION WITH INDIVIDUAL QR CODES
# ============================================

@router.get("/ride-sessions/driver/{ride_id}/riders")
def get_driver_session_riders(
    ride_id: int, 
    driver_phone: str, 
    db: Session = Depends(get_db)
):
    """Get driver's active ride session with individual QR codes for each rider"""
    driver_phone = normalize_phone(driver_phone)
    
    session = db.query(RideSession).filter(
        RideSession.ride_id == ride_id,
        RideSession.driver_phone == driver_phone,
        RideSession.status.in_(["driver_started", "boarding", "en_route"])
    ).order_by(RideSession.id.desc()).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="No active ride session found")
    
    for rider in session.riders:
        if rider.status == "accepted" and not rider.individual_qr_token:
            rider.individual_qr_token = secrets.token_hex(16)
            rider.qr_expires_at = datetime.now(timezone.utc) + timedelta(hours=2)
    
    db.commit()
    db.refresh(session)
    
    riders_data = []
    for rider in session.riders:
        riders_data.append({
            "id": rider.id,
            "booking_id": rider.booking_id,
            "rider_name": rider.rider_name or f"Rider {rider.rider_phone[-4:]}",
            "rider_phone": rider.rider_phone,
            "rider_photo": rider.rider_photo,
            "status": rider.status,
            "individual_qr_token": rider.individual_qr_token,
            "qr_expires_at": rider.qr_expires_at.isoformat() if rider.qr_expires_at else None,
            "pickup_location": rider.pickup_location,
            "dropoff_location": rider.dropoff_location,
            "seats_booked": rider.seats_booked or 1,
            "price_paid": float(rider.price_paid) if rider.price_paid else None
        })
    
    return {
        "session_id": session.id,
        "ride_id": ride_id,
        "session_status": session.status,
        "current_phase": session.current_phase,
        "total_riders": len(session.riders),
        "boarded_count": sum(1 for r in session.riders if r.status in ["boarded", "dropped_off", "completed"]),
        "dropped_count": sum(1 for r in session.riders if r.status in ["dropped_off", "completed"]),
        "riders": riders_data,
        "qr_code_token": session.qr_code_token
    }


@router.post("/ride-sessions/rider/board-by-token")
def rider_board_by_token(payload: dict, db: Session = Depends(get_db)):
    """Rider boards by scanning individual QR code"""
    from sqlalchemy.orm import joinedload
    from datetime import datetime, timezone
    import secrets
    
    try:
        individual_token = payload.get("qr_code_token")
        rider_phone = normalize_phone(payload.get("rider_phone", ""))
        booking_id = payload.get("booking_id")
        
        print(f"📱 Boarding by token: token={individual_token[:20] if individual_token else 'None'}..., phone={rider_phone}, booking={booking_id}")
        
        if not individual_token:
            raise HTTPException(status_code=400, detail="QR code token is required")
        
        rider = db.query(RideSessionRider).options(
            joinedload(RideSessionRider.session)
        ).filter(
            RideSessionRider.individual_qr_token == individual_token,
            RideSessionRider.status.in_(["accepted", "reached_pickup"])
        ).first()
        
        if not rider:
            if booking_id:
                rider = db.query(RideSessionRider).options(
                    joinedload(RideSessionRider.session)
                ).filter(
                    RideSessionRider.booking_id == booking_id,
                    RideSessionRider.status.in_(["accepted", "reached_pickup"])
                ).first()
                
                if rider and rider.individual_qr_token == individual_token:
                    pass
                else:
                    raise HTTPException(status_code=404, detail="Invalid QR code or rider not found")
            else:
                raise HTTPException(status_code=404, detail="Invalid QR code or rider not found")
        
        if rider.qr_expires_at and rider.qr_expires_at < datetime.now(timezone.utc):
            rider.individual_qr_token = secrets.token_hex(16)
            rider.qr_expires_at = datetime.now(timezone.utc) + timedelta(hours=2)
            db.commit()
            raise HTTPException(
                status_code=400, 
                detail="QR code expired. Please ask the driver to refresh the QR code."
            )
        
        if rider.status in ["boarded", "dropped_off", "completed"]:
            return {
                "success": True,
                "message": f"Rider already {rider.status}",
                "already_boarded": True,
                "rider_status": rider.status,
                "session_id": rider.session_id
            }
        
        now = datetime.now(timezone.utc)
        rider.status = "boarded"
        rider.boarded_at = now
        rider.pickup_confirmed = True
        
        session = rider.session
        boarded_count = sum(1 for r in session.riders if r.status in ["boarded", "dropped_off", "completed"])
        total_riders = len(session.riders)
        
        if boarded_count == total_riders:
            session.current_phase = "en_route"
            session.status = "en_route"
        else:
            session.current_phase = "boarding"
            session.status = "boarding"
        
        db.commit()
        
        print(f"✅ Rider {rider.rider_name} boarded successfully. Phase: {session.current_phase}")
        
        # In-app notification to driver
        send_in_app_notification(
            db, session.driver_phone,
            title="Rider Boarded 🚗",
            message=f"{rider.rider_name or 'A rider'} has boarded the vehicle. {boarded_count}/{total_riders} riders now on board.",
            action_type="rider",
            action_value=str(rider.id)
        )
        
        try:
            emit_to_user(session.driver_phone, "rider-boarded", {
                "booking_id": rider.booking_id,
                "rider_phone": rider.rider_phone,
                "rider_name": rider.rider_name or "Rider",
                "boarded_count": boarded_count,
                "total_riders": total_riders,
                "session_id": session.id
            })
            
            emit_to_user(rider.rider_phone, "boarding-confirmed", {
                "session_id": session.id,
                "booking_id": rider.booking_id,
                "message": "You have successfully boarded the vehicle"
            })
        except Exception as e:
            print(f"⚠️ Socket error (non-critical): {e}")
        
        return {
            "success": True,
            "message": "Boarding successful",
            "rider_status": rider.status,
            "session_status": session.status,
            "current_phase": session.current_phase,
            "boarded_count": boarded_count,
            "total_riders": total_riders,
            "session_id": session.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"💥 Error in rider_board_by_token: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error boarding rider: {str(e)}")


@router.post("/ride-sessions/{session_id}/refresh-rider-qr/{rider_id}")
def refresh_rider_qr_code(
    session_id: int, 
    rider_id: int, 
    payload: dict,
    db: Session = Depends(get_db)
):
    """Refresh individual QR code for a specific rider"""
    driver_phone = normalize_phone(payload.get("driver_phone", ""))
    
    session = db.query(RideSession).filter(
        RideSession.id == session_id,
        RideSession.driver_phone == driver_phone
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or unauthorized")
    
    rider = db.query(RideSessionRider).filter(
        RideSessionRider.id == rider_id,
        RideSessionRider.session_id == session_id,
        RideSessionRider.status == "accepted"
    ).first()
    
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found or already boarded")
    
    rider.individual_qr_token = secrets.token_hex(16)
    rider.qr_expires_at = datetime.now(timezone.utc) + timedelta(hours=2)
    db.commit()
    
    return {
        "success": True,
        "message": "QR code refreshed successfully",
        "rider_id": rider.id,
        "booking_id": rider.booking_id,
        "rider_name": rider.rider_name,
        "individual_qr_token": rider.individual_qr_token,
        "qr_expires_at": rider.qr_expires_at.isoformat()
    }


@router.get("/ride-sessions/rider/session-status/{booking_id}")
def get_rider_session_status_v2(
    booking_id: int, 
    rider_phone: str,
    db: Session = Depends(get_db)
):
    """Get rider's session status with better error handling"""
    rider_phone = normalize_phone(rider_phone)
    
    rider_session = db.query(RideSessionRider).options(
        joinedload(RideSessionRider.session)
    ).filter(
        RideSessionRider.booking_id == booking_id,
        RideSessionRider.rider_phone == rider_phone
    ).first()
    
    if not rider_session:
        return {
            "success": False,
            "message": "No active session found",
            "has_session": False,
            "ride_completed": False,
            "has_rated_driver": False
        }
    
    session = rider_session.session
    ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
    
    driver = db.query(User).filter(User.phone_number == session.driver_phone).first()
    
    return {
        "success": True,
        "has_session": True,
        "session_id": session.id,
        "booking_id": booking_id,
        "ride_id": session.ride_id,
        "rider_status": rider_session.status,
        "session_status": session.status,
        "current_phase": session.current_phase,
        "has_rated_driver": rider_session.rider_rating is not None,
        "driver_rating": rider_session.rider_rating,
        "ride_completed": session.status == "completed" or rider_session.status == "completed",
        "driver_name": driver.full_name if driver else "Driver",
        "driver_phone": session.driver_phone,
        "driver_photo": driver.profile_picture if driver else None,
        "driver_rating_avg": float(driver.avg_rating) if driver and driver.avg_rating else 4.5,
        "origin": ride.origin if ride else None,
        "destination": ride.destination if ride else None,
        "pickup_lat": rider_session.pickup_lat,
        "pickup_lng": rider_session.pickup_lng,
        "dropoff_lat": rider_session.dropoff_lat,
        "dropoff_lng": rider_session.dropoff_lng,
        "current_driver_lat": session.current_lat,
        "current_driver_lng": session.current_lng,
        "route_coordinates": ride.route_coordinates if ride else []
    }


@router.post("/ride-sessions/{session_id}/sync")
def sync_session_state(
    session_id: int,
    payload: dict,
    db: Session = Depends(get_db)
):
    """Sync session state - used for recovery after disconnection"""
    driver_phone = normalize_phone(payload.get("driver_phone", ""))
    
    session = db.query(RideSession).filter(
        RideSession.id == session_id,
        RideSession.driver_phone == driver_phone
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    boarded_count = sum(1 for r in session.riders if r.status in ["boarded", "dropped_off", "completed"])
    dropped_count = sum(1 for r in session.riders if r.status in ["dropped_off", "completed"])
    total_riders = len(session.riders)
    
    if session.current_phase == "boarding" and boarded_count == total_riders:
        session.current_phase = "en_route"
        session.status = "en_route"
        db.commit()
    
    riders_data = []
    for rider in session.riders:
        riders_data.append({
            "id": rider.id,
            "booking_id": rider.booking_id,
            "rider_name": rider.rider_name,
            "rider_phone": rider.rider_phone,
            "status": rider.status,
            "individual_qr_token": rider.individual_qr_token,
            "boarded_at": rider.boarded_at.isoformat() if rider.boarded_at else None,
            "dropped_off_at": rider.dropped_off_at.isoformat() if rider.dropped_off_at else None
        })
    
    return {
        "success": True,
        "session_id": session.id,
        "session_status": session.status,
        "current_phase": session.current_phase,
        "boarded_count": boarded_count,
        "dropped_count": dropped_count,
        "total_riders": total_riders,
        "current_lat": session.current_lat,
        "current_lng": session.current_lng,
        "riders": riders_data
    }


@router.post("/ride-sessions/{session_id}/complete-force")
def complete_ride_force(session_id: int, payload: dict, db: Session = Depends(get_db)):
    """Driver forcefully completes the ride - marks all pending riders as completed"""
    driver_phone = normalize_phone(payload.get("driver_phone", ""))
    
    session = db.query(RideSession).filter(
        RideSession.id == session_id,
        RideSession.driver_phone == driver_phone
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Ride session not found")
    
    completed_count = 0
    for rider in session.riders:
        if rider.status not in ["completed", "dropped_off"]:
            rider.status = "completed"
            rider.completed_at = datetime.now(timezone.utc)
            completed_count += 1
    
    session.status = "completed"
    session.current_phase = "completed"
    session.completed_at = datetime.now(timezone.utc)
    
    ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
    if ride:
        ride.status = "completed"
    
    db.commit()
    
    # In-app notification to driver
    send_in_app_notification(
        db, driver_phone,
        title="Ride Completed ✅",
        message=f"Ride forcefully completed. {completed_count} rider(s) marked as completed.",
        action_type="ride",
        action_value=str(session.ride_id)
    )
    
    return {
        "message": "Ride completed successfully",
        "status": session.status,
        "completed_riders": completed_count,
        "total_riders": len(session.riders)
    }


@router.post("/booking/{booking_id}/rate")
def rate_rider_from_booking(
    booking_id: int, 
    payload: dict, 
    db: Session = Depends(get_db)
):
    """Rate a rider from a completed ride (when session is no longer active)"""
    try:
        rating = payload.get("rating")
        feedback = payload.get("feedback", "")
        
        if rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
        booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        rider_session = db.query(RideSessionRider).filter(
            RideSessionRider.booking_id == booking_id
        ).first()
        
        if rider_session:
            if rider_session.driver_rating is not None:
                raise HTTPException(status_code=400, detail="Rating already submitted")
            
            rider_session.driver_rating = rating
            rider_session.driver_feedback = feedback
        else:
            booking.driver_rating = rating
            booking.driver_feedback = feedback
        
        db.commit()
        
        # In-app notification to rider
        send_in_app_notification(
            db, booking.passenger_phone,
            title="New Rating ⭐",
            message=f"The driver rated you {rating}/5 stars.",
            action_type="rating",
            action_value=str(booking_id)
        )
        
        return {"message": "Rider rated successfully", "rating": rating}
        
    except Exception as e:
        print(f"Error rating rider: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/booking/{booking_id}/session")
def get_session_from_booking(booking_id: int, db: Session = Depends(get_db)):
    """Get the session ID for a booking (for rating after completion)"""
    try:
        rider_session = db.query(RideSessionRider).filter(
            RideSessionRider.booking_id == booking_id
        ).first()
        
        if not rider_session:
            return {"session_id": None, "message": "No session found for this booking"}
        
        return {
            "session_id": rider_session.session_id,
            "booking_id": booking_id,
            "rider_status": rider_session.status,
            "already_rated": rider_session.driver_rating is not None
        }
        
    except Exception as e:
        print(f"Error getting session from booking: {str(e)}")
        return {"session_id": None, "error": str(e)}


@router.get("/booking/{booking_id}/modification-available")
def check_modification_available(booking_id: int, db: Session = Depends(get_db)):
    """Check if user can request modification (one-time check)"""
    try:
        booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
        if not booking:
            return {
                "available": False, 
                "reason": "Booking not found",
                "code": "NOT_FOUND"
            }
        
        existing_modification = db.query(ModificationRequest).filter(
            ModificationRequest.booking_id == booking_id
        ).first()
        
        if existing_modification:
            return {
                "available": False,
                "reason": f"You have already submitted a modification request (Status: {existing_modification.status}). One modification only per booking.",
                "code": "ALREADY_MODIFIED",
                "modification": {
                    "id": existing_modification.id,
                    "requested_seats": existing_modification.requested_seats,
                    "current_seats": existing_modification.current_seats,
                    "status": existing_modification.status
                }
            }
        
        ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
        if not ride:
            return {"available": False, "reason": "Ride not found", "code": "RIDE_NOT_FOUND"}
        
        if ride.started_at:
            return {"available": False, "reason": "Ride has already started", "code": "RIDE_STARTED"}
        
        if booking.status != "accepted":
            return {"available": False, "reason": "Booking is not confirmed", "code": "BOOKING_NOT_CONFIRMED"}
        
        return {
            "available": True,
            "message": "You can request one modification for this booking",
            "current_seats": booking.seats_booked
        }
        
    except Exception as e:
        return {"available": False, "reason": str(e), "code": "ERROR"}


@router.get("/ride/{ride_id}/refresh-seats")
def refresh_seat_count(ride_id: int, db: Session = Depends(get_db)):
    """Force refresh seat count for a ride"""
    try:
        ride = db.query(Ride).filter(Ride.id == ride_id).first()
        if not ride:
            return {"success": False, "message": "Ride not found"}
        
        total_booked = get_total_booked_seats(db, ride_id)
        remaining_seats = ride.available_seats - total_booked
        
        print(f"🔄 Refresh seats for ride {ride_id}: Total={ride.available_seats}, Booked={total_booked}, Remaining={remaining_seats}")
        
        old_status = ride.status
        if remaining_seats == 0 and ride.status == "active":
            ride.status = "full"
            db.commit()
            print(f"   Status changed: {old_status} -> full")
        elif remaining_seats > 0 and ride.status == "full":
            ride.status = "active"
            db.commit()
            print(f"   Status changed: {old_status} -> active")
        
        return {
            "success": True,
            "ride_id": ride_id,
            "available_seats": ride.available_seats,
            "total_booked": total_booked,
            "remaining_seats": remaining_seats,
            "status": ride.status
        }
    except Exception as e:
        print(f"Error in refresh_seat_count: {str(e)}")
        return {"success": False, "message": str(e)}


@router.get("/test-email/{phone_number}")
def test_email(phone_number: str, db: Session = Depends(get_db)):
    """Test email sending"""
    normalized = normalize_phone(phone_number)
    user_email = get_user_email(db, normalized)
    
    if not user_email:
        return {
            "success": False,
            "message": f"No email found for {normalized}",
            "user": db.query(User).filter(User.phone_number == normalized).first()
        }
    
    test_data = {
        "origin": "Test Location",
        "destination": "Test Destination", 
        "departure_time_display": datetime.now().strftime("%d %b %Y, %I:%M %p"),
        "message": "This is a test email from DRIVVE to verify email notifications are working correctly."
    }
    
    result = send_ride_notification_email(
        user_email,
        "Test User",
        test_data,
        "test"
    )
    
    return {
        "success": result,
        "email_sent_to": user_email,
        "message": "Test email sent successfully" if result else "Failed to send test email"
    }