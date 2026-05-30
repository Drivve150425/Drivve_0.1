# # from fastapi import APIRouter, Depends, HTTPException
# # from sqlalchemy.orm import Session
# # from database import get_db
# # from models import Ride, RideBooking, UserNotification, NotificationType
# # from datetime import datetime
# # from pydantic import BaseModel, field_validator
# # from typing import Optional, Dict, List
# # from sqlalchemy import text, bindparam, DateTime, Float, Integer

# # router = APIRouter()

# # class CreateRideRequest(BaseModel):
# #     phone_number: str
# #     origin: str
# #     destination: str
# #     departure_time: datetime
# #     available_seats: int
# #     price_per_seat: float

# #     origin_coords: List[float]          # [lng, lat]
# #     destination_coords: List[float]     # [lng, lat]
# #     route_coordinates: List[List[float]]  # [[lng, lat], [lng, lat], ...]

# #     distance_km: Optional[float] = None
# #     duration_text: Optional[str] = None
# #     total_estimated_price: Optional[float] = None
# #     preferences: Optional[Dict] = None

# #     @field_validator("origin_coords", "destination_coords")
# #     @classmethod
# #     def validate_point_coords(cls, value):
# #         if len(value) != 2:
# #             raise ValueError("Coordinates must contain exactly [lng, lat]")
# #         return value

# #     @field_validator("route_coordinates")
# #     @classmethod
# #     def validate_route_coords(cls, value):
# #         if len(value) < 2:
# #             raise ValueError("Route must contain at least 2 coordinate points")

# #         for point in value:
# #             if not isinstance(point, list) or len(point) != 2:
# #                 raise ValueError("Each route coordinate must be [lng, lat]")

# #         return value
# # class SearchRidesRequest(BaseModel):
# #     from_location: str
# #     to_location: str
# #     from_coords: List[float]
# #     to_coords: List[float]
# #     departure_time: datetime
# #     seats_required: int = 1

# #     @field_validator("from_coords", "to_coords")
# #     @classmethod
# #     def validate_search_coords(cls, value):
# #         if len(value) != 2:
# #             raise ValueError("Coordinates must contain exactly [lng, lat]")
# #         return value
    
# # class CreateRideBookingRequest(BaseModel):
# #     ride_id: int
# #     passenger_phone: str
# #     seats_requested: int = 1

# # @router.post("/post-ride")
# # def post_ride(data: CreateRideRequest, db: Session = Depends(get_db)):
# #     ride = Ride(
# #         phone_number=data.phone_number,
# #         origin=data.origin,
# #         destination=data.destination,
# #         departure_time=data.departure_time,
# #         available_seats=data.available_seats,
# #         price_per_seat=data.price_per_seat,
# #         distance_km=data.distance_km,
# #         duration_text=data.duration_text,
# #         total_estimated_price=data.total_estimated_price,
# #         preferences=data.preferences,
# #         origin_lon=data.origin_coords[0],
# #         origin_lat=data.origin_coords[1],
# #         destination_lon=data.destination_coords[0],
# #         destination_lat=data.destination_coords[1],
# #         route_coordinates=data.route_coordinates,
# #         status="active"
# #     )

# #     db.add(ride)
# #     db.commit()
# #     db.refresh(ride)

# #     line_wkt = "SRID=4326;LINESTRING(" + ",".join(
# #         [f"{lng} {lat}" for lng, lat in data.route_coordinates]
# #     ) + ")"

# #     db.execute(
# #         text("""
# #             UPDATE rides
# #             SET route_line = ST_GeogFromText(:line_wkt)
# #             WHERE id = :ride_id
# #         """),
# #         {
# #             "ride_id": ride.id,
# #             "line_wkt": line_wkt
# #         }
# #     )
# #     db.commit()

# #     # Create notification for ride posted
# #     try:
# #         # Normalize phone number
# #         phone_number = data.phone_number
# #         if not phone_number.startswith("+"):
# #             phone_number = f"+{phone_number}"

# #         # Extract short location names (first part before comma)
# #         origin_short = data.origin.split(",")[0].strip() if data.origin else "start"
# #         dest_short = data.destination.split(",")[0].strip() if data.destination else "destination"

# #         notification = UserNotification(
# #             phone_number=phone_number,
# #             title="Ride Posted! 🚗",
# #             message=f"Your ride from {origin_short} to {dest_short} has been posted. You'll be notified when passengers book!",
# #             type=NotificationType.RIDE,
# #             action_type="ride",
# #             action_value=str(ride.id),
# #             is_read=False,
# #             is_deleted=False
# #         )
# #         db.add(notification)
# #         db.commit()
# #         db.refresh(notification)
# #         print(f"✅ Ride posted notification created for {phone_number}, notification_id: {notification.id}")
# #     except Exception as e:
# #         print(f"❌ Error creating ride posted notification: {str(e)}")
# #         # Don't fail the ride posting if notification fails

# #     return {
# #         "message": "Ride posted successfully",
# #         "ride_id": ride.id
# #     }

# # @router.get("/my-rides/{phone_number}")
# # def get_my_rides(phone_number: str, db: Session = Depends(get_db)):

# #     # 1️⃣ Rides user posted (Driver)
# #     posted_rides = db.query(Ride)\
# #         .filter(Ride.phone_number == phone_number)\
# #         .order_by(Ride.departure_time.desc())\
# #         .all()

# #     # 2️⃣ Rides user requested (Passenger)
# #     requested_bookings = db.query(RideBooking)\
# #         .filter(RideBooking.passenger_phone == phone_number)\
# #         .order_by(RideBooking.created_at.desc())\
# #         .all()

# #     return {
# #         "posted_rides": posted_rides,
# #         "requested_rides": requested_bookings
# #     }

# # @router.put("/booking/{booking_id}/accept")
# # def accept_booking(booking_id: int, db: Session = Depends(get_db)):

# #     booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
# #     if not booking:
# #         raise HTTPException(status_code=404, detail="Booking not found")

# #     if booking.status != "pending":
# #         raise HTTPException(status_code=400, detail="Already processed")

# #     ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()

# #     if ride.available_seats < booking.seats_requested:
# #         raise HTTPException(status_code=400, detail="Not enough seats available")

# #     # 🔒 Reduce seats
# #     ride.available_seats -= booking.seats_requested
# #     booking.status = "accepted"

# #     # If no seats left mark full
# #     if ride.available_seats == 0:
# #         ride.status = "full"

# #     db.commit()

# #     print(f"Send notification to passenger {booking.passenger_phone}")

# #     return {"message": "Booking accepted"}

# # @router.put("/ride/{ride_id}/cancel")
# # def cancel_ride(ride_id: int, db: Session = Depends(get_db)):

# #     ride = db.query(Ride).filter(Ride.id == ride_id).first()
# #     if not ride:
# #         raise HTTPException(status_code=404, detail="Ride not found")

# #     ride.status = "cancelled"

# #     # Cancel all accepted bookings
# #     bookings = db.query(RideBooking).filter(
# #         RideBooking.ride_id == ride_id,
# #         RideBooking.status == "accepted"
# #     ).all()

# #     for booking in bookings:
# #         booking.status = "cancelled"
# #         print(f"Notify passenger {booking.passenger_phone}")

# #     db.commit()

# #     return {"message": "Ride cancelled successfully"}

# # @router.put("/booking/{booking_id}/cancel")
# # def cancel_booking(booking_id: int, db: Session = Depends(get_db)):

# #     booking = db.query(RideBooking).filter(
# #         RideBooking.id == booking_id
# #     ).first()

# #     if not booking:
# #         raise HTTPException(status_code=404, detail="Booking not found")

# #     ride = db.query(Ride).filter(
# #         Ride.id == booking.ride_id
# #     ).first()

# #     # Refund seats if accepted
# #     if booking.status == "accepted":
# #         ride.available_seats += booking.seats_requested

# #         if ride.status == "full":
# #             ride.status = "active"

# #     booking.status = "cancelled"

# #     db.commit()

# #     return {"message": "Booking cancelled and seats refunded"}

# # @router.post("/search-rides")
# # def search_rides(data: SearchRidesRequest, db: Session = Depends(get_db)):

# #     sql = text("""
# #         WITH input AS (
# #             SELECT
# #                 ST_SetSRID(ST_MakePoint(:from_lng, :from_lat), 4326)::geography AS pickup_point,
# #                 ST_SetSRID(ST_MakePoint(:to_lng, :to_lat), 4326)::geography AS drop_point,
# #                 CAST(:departure_time AS timestamp) AS req_time,
# #                 CAST(:seats_required AS integer) AS req_seats
# #         )
# #         SELECT
# #             r.id,
# #             r.phone_number,
# #             r.origin,
# #             r.destination,
# #             r.departure_time,
# #             r.available_seats,
# #             r.price_per_seat,
# #             r.distance_km,
# #             r.duration_text,
# #             r.total_estimated_price,

# #             u.id AS user_db_id,
# #             u.user_id AS driver_user_id,
# #             u.first_name,
# #             u.last_name,
# #             u.email,
# #             u.profile_completed,
# #             u.status AS user_status,

# #             ST_Distance(r.route_line, i.pickup_point) AS pickup_distance_m,
# #             ST_Distance(r.route_line, i.drop_point) AS drop_distance_m,
# #             ST_LineLocatePoint(r.route_line::geometry, i.pickup_point::geometry) AS pickup_pos,
# #             ST_LineLocatePoint(r.route_line::geometry, i.drop_point::geometry) AS drop_pos

# #         FROM rides r
# #         LEFT JOIN users u
# #             ON u.phone_number = r.phone_number
# #         CROSS JOIN input i
# #         WHERE r.status = 'active'
# #           AND r.available_seats >= i.req_seats
# #           AND ABS(EXTRACT(EPOCH FROM (r.departure_time - i.req_time))) <= 7200
# #           AND ST_DWithin(r.route_line, i.pickup_point, 800)
# #           AND ST_DWithin(r.route_line, i.drop_point, 800)
# #     """)

# #     rows = db.execute(sql, {
# #         "from_lng": data.from_coords[0],
# #         "from_lat": data.from_coords[1],
# #         "to_lng": data.to_coords[0],
# #         "to_lat": data.to_coords[1],
# #         "departure_time": data.departure_time,
# #         "seats_required": data.seats_required,
# #     }).mappings().all()

# #     rides = []

# #     for row in rows:
# #         if row["pickup_pos"] >= row["drop_pos"]:
# #             continue

# #         pickup_score = max(0, 1 - (row["pickup_distance_m"] / 800))
# #         drop_score = max(0, 1 - (row["drop_distance_m"] / 800))

# #         time_diff_min = abs((row["departure_time"] - data.departure_time).total_seconds()) / 60
# #         time_score = max(0, 1 - (time_diff_min / 120))

# #         direction_score = 1

# #         match_percentage = round(
# #             100 * (
# #                 0.4 * pickup_score +
# #                 0.4 * drop_score +
# #                 0.1 * time_score +
# #                 0.1 * direction_score
# #             )
# #         )

# #         full_name = " ".join(
# #             part for part in [row.get("first_name"), row.get("last_name")] if part
# #         ).strip()

# #         rides.append({
# #             "id": row["id"],
# #             "driverName": full_name if full_name else f"Driver {str(row['phone_number'])[-4:]}",
# #             "driverUserId": row.get("driver_user_id"),
# #             "phoneNumber": row["phone_number"],
# #             "email": row.get("email"),
# #             "profileCompleted": row.get("profile_completed"),
# #             "userStatus": row.get("user_status"),
# #             "rating": 4.5,
# #             "date": row["departure_time"].strftime("%d %b %Y"),
# #             "time": row["departure_time"].strftime("%I:%M %p"),
# #             "from": row["origin"],
# #             "to": row["destination"],
# #             "pickupLabel": f"Pickup within {int(row['pickup_distance_m'])} m",
# #             "dropLabel": f"Drop within {int(row['drop_distance_m'])} m",
# #             "price": row["price_per_seat"],
# #             "matchPercentage": match_percentage,
# #             "seatsAvailable": row["available_seats"],
# #             "distanceKm": row["distance_km"],
# #             "durationText": row["duration_text"],
# #             "totalEstimatedPrice": row["total_estimated_price"],
# #         })

# #     rides.sort(key=lambda x: x["matchPercentage"], reverse=True)

# #     return {"rides": rides}

# # @router.post("/ride-bookings")
# # def create_ride_booking(data: CreateRideBookingRequest, db: Session = Depends(get_db)):
# #     ride = db.query(Ride).filter(Ride.id == data.ride_id).first()
# #     if not ride:
# #         raise HTTPException(status_code=404, detail="Ride not found")

# #     if ride.status != "active":
# #         raise HTTPException(status_code=400, detail="Ride is not available")

# #     if ride.available_seats < data.seats_requested:
# #         raise HTTPException(status_code=400, detail="Not enough seats available")

# #     if ride.phone_number == data.passenger_phone:
# #         raise HTTPException(status_code=400, detail="You cannot book your own ride")

# #     existing_booking = db.query(RideBooking).filter(
# #         RideBooking.ride_id == data.ride_id,
# #         RideBooking.passenger_phone == data.passenger_phone,
# #         RideBooking.status.in_(["pending", "accepted"])
# #     ).first()

# #     if existing_booking:
# #         raise HTTPException(status_code=400, detail="You already requested this ride")

# #     booking = RideBooking(
# #         ride_id=data.ride_id,
# #         passenger_phone=data.passenger_phone,
# #         seats_requested=data.seats_requested,
# #         status="pending"
# #     )

# #     db.add(booking)
# #     db.flush()

# #     try:
# #         driver_phone = ride.phone_number
# #         if not driver_phone.startswith("+"):
# #             driver_phone = f"+{driver_phone}"

# #         origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
# #         dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"

# #         notification = UserNotification(
# #             phone_number=driver_phone,
# #             title="New Ride Request 🙋",
# #             message=f"You received a request for your ride from {origin_short} to {dest_short}.",
# #             type=NotificationType.RIDE,
# #             action_type="booking",
# #             action_value=str(booking.id),
# #             is_read=False,
# #             is_deleted=False
# #         )
# #         db.add(notification)

# #     except Exception as e:
# #         print(f"❌ Error creating booking notification: {str(e)}")

# #     db.commit()
# #     db.refresh(booking)

# #     return {
# #         "message": "Ride request sent successfully",
# #         "booking_id": booking.id,
# #         "status": booking.status
# #     }

# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session, joinedload
# from sqlalchemy import func, text
# from database import get_db
# from models import Ride, RideBooking, User, UserNotification, NotificationType
# from datetime import datetime, timezone, timedelta
# from pydantic import BaseModel, field_validator
# from typing import Optional, Dict, List
# import math
# from models import RideSession, RideSessionRider
# from sqlalchemy import cast, Float
# from sqlalchemy import func
# from sqlalchemy.sql import expression as expr

# # Add this near your other imports
# ST_Distance = func.ST_Distance
# ST_SetSRID = func.ST_SetSRID
# ST_MakePoint = func.ST_MakePoint
# router = APIRouter()

# IST = timezone(timedelta(hours=5, minutes=30))
# SEARCH_RADIUS_M = 2000
# TIME_WINDOW_SECONDS = 3600


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


# class SearchRidesRequest(BaseModel):
#     from_location: str
#     to_location: str
#     from_coords: List[float]
#     to_coords: List[float]
#     departure_time: datetime
#     seats_required: int = 1

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
#     from_coords: Optional[List[float]] = None   # [lng, lat] rider original pickup
#     to_coords: Optional[List[float]] = None     # [lng, lat] rider original drop

#     @field_validator("from_coords", "to_coords")
#     @classmethod
#     def validate_optional_coords(cls, value):
#         if value is None:
#             return value
#         if len(value) != 2:
#             raise ValueError("Coordinates must contain exactly [lng, lat]")
#         return value


# class UpdateRideRequest(CreateRideRequest):
#     """Same as CreateRideRequest for ride updates"""
#     pass


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


# def parse_point_wkt(wkt: Optional[str]):
#     if not wkt:
#         return None

#     try:
#         raw = wkt.replace("POINT(", "").replace(")", "").strip().split()
#         return {
#             "lng": float(raw[0]),
#             "lat": float(raw[1]),
#         }
#     except Exception:
#         return None


# def build_match_label(score: int) -> str:
#     if score >= 90:
#         return "Excellent"
#     if score >= 75:
#         return "Good"
#     if score >= 60:
#         return "Fair"
#     return "Low"


# def to_ist(dt: datetime) -> datetime:
#     if dt is None:
#         return dt
#     if dt.tzinfo is None:
#         dt = dt.replace(tzinfo=timezone.utc)
#     return dt.astimezone(IST)


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


# def find_nearest_route_vertex(route_coords: List[List[float]], lng: float, lat: float) -> Optional[Dict]:
#     """
#     Find the nearest vertex in the route_coordinates array to the given point.
#     route_coords is [[lng, lat], [lng, lat], ...] from Google Routes API.
#     Returns {"lng": float, "lat": float} or None.
#     """
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


# @router.post("/post-ride")
# def post_ride(data: CreateRideRequest, db: Session = Depends(get_db)):
#     normalized_phone = normalize_phone(data.phone_number)

#     departure_time_utc = data.departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         departure_time_utc = departure_time_utc.astimezone(timezone.utc)

#     ride = Ride(
#         phone_number=normalized_phone,
#         origin=data.origin,
#         destination=data.destination,
#         departure_time=departure_time_utc,
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
#         status="active",
#     )

#     db.add(ride)
#     db.commit()
#     db.refresh(ride)

#     line_wkt = "LINESTRING(" + ",".join(
#         [f"{lng} {lat}" for lng, lat in data.route_coordinates]
#     ) + ")"

#     db.execute(
#         text("""
#             UPDATE rides
#             SET route_line = ST_GeomFromText(:line_wkt, 4326)::geography
#             WHERE id = :ride_id
#         """),
#         {
#             "ride_id": ride.id,
#             "line_wkt": line_wkt
#         }
#     )
#     db.commit()

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
#         db.refresh(notification)
#         print(f"✅ Ride posted notification created for {normalized_phone}, notification_id: {notification.id}")
#     except Exception as e:
#         print(f"❌ Error creating ride posted notification: {str(e)}")

#     return {
#         "message": "Ride posted successfully",
#         "ride_id": ride.id
#     }


# @router.get("/my-rides/{phone_number}")
# def get_my_rides(phone_number: str, db: Session = Depends(get_db)):
#     normalized_phone = normalize_phone(phone_number)

#     # Posted rides (do not eagerly load bookings to avoid missing-column issues)
#     posted_rides = db.query(Ride)\
#         .filter(Ride.phone_number == normalized_phone)\
#         .order_by(Ride.departure_time.desc())\
#         .all()

#     posted_ride_ids = [r.id for r in posted_rides]
#     bookings_map = {}
#     if posted_ride_ids:
#         all_bookings = db.query(RideBooking)\
#             .filter(RideBooking.ride_id.in_(posted_ride_ids))\
#             .all()
#         for bk in all_bookings:
#             bookings_map.setdefault(bk.ride_id, []).append({
#                 "id": bk.id,
#                 "ride_id": bk.ride_id,
#                 "passenger_phone": bk.passenger_phone,
#                 "passenger_name": None,
#                 "seats_requested": bk.seats_booked,
#                 "status": bk.status,
#                 "created_at": bk.created_at.isoformat() if bk.created_at else None,
#             })

#     posted_rides_formatted = []
#     for ride in posted_rides:
#         bookings_list = bookings_map.get(ride.id, [])

#         live_session = db.query(RideSession).filter(
#             RideSession.ride_id == ride.id,
#             RideSession.status.in_(["driver_started", "boarding", "en_route", "emergency_stopped"])
#         ).order_by(RideSession.id.desc()).first()

#         live_session_data = None
#         if live_session:
#             boarded_count = sum(1 for r in live_session.riders if r.status in ["boarded", "dropped_off", "completed"])
#             dropped_count = sum(1 for r in live_session.riders if r.status in ["dropped_off", "completed"])
#             live_session_data = {
#                 "session_id": live_session.id,
#                 "status": live_session.status,
#                 "current_phase": live_session.current_phase,
#                 "boarded_count": boarded_count,
#                 "dropped_count": dropped_count,
#                 "total_riders": len(live_session.riders)
#             }

#         posted_rides_formatted.append({
#             "id": ride.id,
#             "phone_number": ride.phone_number,
#             "origin": ride.origin,
#             "destination": ride.destination,
#             "origin_coords": [ride.origin_lon, ride.origin_lat] if ride.origin_lon and ride.origin_lat else None,
#             "destination_coords": [ride.destination_lon, ride.destination_lat] if ride.destination_lon and ride.destination_lat else None,
#             "departure_time": ride.departure_time.isoformat() if ride.departure_time else None,
#             "departure_time_js": ride.departure_time.isoformat() if ride.departure_time else None,
#             "available_seats": ride.available_seats,
#             "price_per_seat": ride.price_per_seat,
#             "distance_km": ride.distance_km,
#             "duration_text": ride.duration_text,
#             "total_estimated_price": ride.total_estimated_price,
#             "preferences": ride.preferences,
#             "status": ride.status,
#             "vehicle_id": ride.vehicle_id,
#             "created_at": ride.created_at.isoformat() if ride.created_at else None,
#             "bookings": bookings_list,
#             "live_session": live_session_data,
#         })

#     # Requested rides with ride and driver info joined
#     requested_bookings = db.query(RideBooking, Ride, User)\
#         .join(Ride, RideBooking.ride_id == Ride.id)\
#         .outerjoin(User, User.phone_number == Ride.phone_number)\
#         .filter(RideBooking.passenger_phone == normalized_phone)\
#         .order_by(RideBooking.created_at.desc())\
#         .all()

#     # Live session info for the most recent requested booking (if any)
#     live_session_data = None
#     if requested_bookings:
#         latest_booking = requested_bookings[0][0]  # RideBooking from (booking, ride, driver)
#         session_rider = db.query(RideSessionRider).filter(
#             RideSessionRider.booking_id == latest_booking.id
#         ).order_by(RideSessionRider.id.desc()).first()

#         if session_rider:
#             session = db.query(RideSession).filter(RideSession.id == session_rider.session_id).first()
#             if session:
#                 live_session_data = {
#                     "session_id": session.id,
#                     "session_status": session.status,
#                     "current_phase": session.current_phase,
#                     "rider_status": session_rider.status
#                 }

#     requested_rides_formatted = []
#     for booking, ride, driver in requested_bookings:
#         driver_name = None
#         if driver:
#             driver_name = driver.full_name or " ".join(
#                 p for p in [driver.first_name, driver.last_name] if p
#             ).strip()
#         if not driver_name:
#             driver_name = f"Driver {str(ride.phone_number)[-4:]}"

#         requested_rides_formatted.append({
#             "id": booking.id,
#             "ride_id": booking.ride_id,
#             "passenger_phone": booking.passenger_phone,
#             "seats_requested": booking.seats_booked,
#             "total_amount": booking.total_amount,
#             "status": booking.status,
#             "created_at": booking.created_at.isoformat() if booking.created_at else None,

#             # Ride details
#             "origin": ride.origin,
#             "destination": ride.destination,
#             "departure_time": ride.departure_time.isoformat() if ride.departure_time else None,
#             "price_per_seat": ride.price_per_seat,
#             "available_seats": ride.available_seats,
#             "distance_km": ride.distance_km,
#             "duration_text": ride.duration_text,
#             "ride_status": ride.status,

#             # Driver details
#             "driver_name": driver_name,
#             "driver_phone": ride.phone_number,
#             "driver_user_id": driver.user_id if driver else None,
#             "profile_completed": driver.profile_completed if driver else False,
#         })

#     return {
#         "posted_rides": posted_rides_formatted,
#         "requested_rides": requested_rides_formatted,
#         "live_session": live_session_data,
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

#     if ride.available_seats < booking.seats_booked:
#         raise HTTPException(status_code=400, detail="Not enough seats available")

#     ride.available_seats -= booking.seats_booked
#     booking.status = "accepted"

#     if ride.available_seats == 0:
#         ride.status = "full"

#     db.commit()

#     print(f"Send notification to passenger {booking.passenger_phone}")

#     return {"message": "Booking accepted"}


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
#         print(f"Notify passenger {booking.passenger_phone}")

#     db.commit()

#     return {"message": "Ride cancelled successfully"}


# @router.put("/booking/{booking_id}/cancel")
# def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
#     booking = db.query(RideBooking).filter(
#         RideBooking.id == booking_id
#     ).first()

#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")

#     ride = db.query(Ride).filter(
#         Ride.id == booking.ride_id
#     ).first()

#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")

#     if booking.status == "accepted":
#         ride.available_seats += booking.seats_booked

#         if ride.status == "full":
#             ride.status = "active"

#     booking.status = "cancelled"

#     db.commit()

#     return {"message": "Booking cancelled and seats refunded"}


# @router.post("/search-rides")
# def search_rides(data: SearchRidesRequest, db: Session = Depends(get_db)):
#     req_time_utc = data.departure_time
#     if req_time_utc.tzinfo is None:
#         req_time_utc = req_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         req_time_utc = req_time_utc.astimezone(timezone.utc)

#     sql = text("""
#         WITH input AS (
#             SELECT
#                 ST_SetSRID(ST_MakePoint(:from_lng, :from_lat), 4326)::geography AS rider_pickup,
#                 ST_SetSRID(ST_MakePoint(:to_lng, :to_lat), 4326)::geography AS rider_drop,
#                 CAST(:departure_time AS timestamptz) AS req_time,
#                 CAST(:seats_required AS integer) AS req_seats
#         ),
#         candidate_rides AS (
#             SELECT
#                 r.id,
#                 r.phone_number,
#                 r.origin,
#                 r.destination,
#                 r.departure_time,
#                 r.available_seats,
#                 r.price_per_seat,
#                 r.distance_km,
#                 r.duration_text,
#                 r.total_estimated_price,
#                 r.route_line,
#                 r.route_coordinates,

#                 u.id AS user_db_id,
#                 u.user_id AS driver_user_id,
#                 u.first_name,
#                 u.last_name,
#                 u.full_name,
#                 u.email,
#                 u.profile_picture,
#                 u.profile_completed,
#                 u.status AS user_status,

#                 v.id AS vehicle_id,
#                 v.make AS vehicle_make,
#                 v.model AS vehicle_model,
#                 v.color AS vehicle_color,
#                 v.registration_number AS vehicle_registrationnumber,
#                 v.photo_url AS vehicle_photo,

#                 ST_Distance(r.route_line, i.rider_pickup) AS pickup_distance_m,
#                 ST_Distance(r.route_line, i.rider_drop) AS drop_distance_m,
#                 ST_LineLocatePoint(r.route_line::geometry, i.rider_pickup::geometry) AS pickup_pos,
#                 ST_LineLocatePoint(r.route_line::geometry, i.rider_drop::geometry) AS drop_pos,

#                 ST_AsText(
#                     ST_LineInterpolatePoint(
#                         r.route_line::geometry,
#                         ST_LineLocatePoint(r.route_line::geometry, i.rider_pickup::geometry)
#                     )
#                 ) AS pickup_point_wkt,

#                 ST_AsText(
#                     ST_LineInterpolatePoint(
#                         r.route_line::geometry,
#                         ST_LineLocatePoint(r.route_line::geometry, i.rider_drop::geometry)
#                     )
#                 ) AS drop_point_wkt

#             FROM rides r
#             LEFT JOIN users u
#                 ON RIGHT(REGEXP_REPLACE(COALESCE(u.phone_number, ''), '\\D', '', 'g'), 10) =
#                    RIGHT(REGEXP_REPLACE(COALESCE(r.phone_number, ''), '\\D', '', 'g'), 10)
#             LEFT JOIN LATERAL (
#                 SELECT vv.*
#                 FROM vehicles vv
#                 WHERE RIGHT(REGEXP_REPLACE(COALESCE(vv.phone_number, ''), '\\D', '', 'g'), 10) =
#                       RIGHT(REGEXP_REPLACE(COALESCE(r.phone_number, ''), '\\D', '', 'g'), 10)
#                 ORDER BY vv.id DESC
#                 LIMIT 1
#             ) v ON TRUE
#             CROSS JOIN input i
#             WHERE r.status = 'active'
#               AND r.available_seats >= i.req_seats
#               AND ABS(EXTRACT(EPOCH FROM (r.departure_time - i.req_time))) <= :time_window_seconds
#               AND ST_DWithin(r.route_line, i.rider_pickup, :search_radius_m)
#               AND ST_DWithin(r.route_line, i.rider_drop, :search_radius_m)
#         )
#         SELECT *
#         FROM candidate_rides
#         ORDER BY departure_time ASC
#     """)

#     rows = db.execute(sql, {
#         "from_lng": data.from_coords[0],
#         "from_lat": data.from_coords[1],
#         "to_lng": data.to_coords[0],
#         "to_lat": data.to_coords[1],
#         "departure_time": req_time_utc,
#         "seats_required": data.seats_required,
#         "time_window_seconds": TIME_WINDOW_SECONDS,
#         "search_radius_m": SEARCH_RADIUS_M,
#     }).mappings().all()

#     rides = []

#     for row in rows:
#         if row["pickup_pos"] is None or row["drop_pos"] is None:
#             continue

#         if row["pickup_pos"] >= row["drop_pos"]:
#             continue

#         pickup_distance_m = float(row["pickup_distance_m"])
#         drop_distance_m = float(row["drop_distance_m"])

#         pickup_score = max(0, 1 - (pickup_distance_m / SEARCH_RADIUS_M))
#         drop_score = max(0, 1 - (drop_distance_m / SEARCH_RADIUS_M))

#         row_departure_utc = row["departure_time"]
#         if row_departure_utc.tzinfo is None:
#             row_departure_utc = row_departure_utc.replace(tzinfo=timezone.utc)

#         time_diff_min = abs((row_departure_utc - req_time_utc).total_seconds()) / 60
#         time_score = max(0, 1 - (time_diff_min / 60))

#         match_percentage = round(
#             100 * (
#                 0.35 * pickup_score +
#                 0.35 * drop_score +
#                 0.20 * time_score +
#                 0.10 * 1
#             )
#         )

#         # Use nearest route vertex for accessible junction points
#         route_coords = row.get("route_coordinates") or []
#         pickup_point = find_nearest_route_vertex(route_coords, data.from_coords[0], data.from_coords[1])
#         drop_point = find_nearest_route_vertex(route_coords, data.to_coords[0], data.to_coords[1])

#         full_name = (
#             row.get("full_name")
#             or " ".join(
#                 part for part in [row.get("first_name"), row.get("last_name")] if part
#             ).strip()
#         )

#         driver_name = full_name if full_name else f"Driver {str(row['phone_number'])[-4:]}"
#         departure_time_ist = to_ist(row_departure_utc)

#         rides.append({
#             "id": row["id"],
#             "driverName": driver_name,
#             "driverUserId": row.get("driver_user_id"),
#             "phoneNumber": row["phone_number"],
#             "email": row.get("email"),
#             "profileCompleted": row.get("profile_completed"),
#             "userStatus": row.get("user_status"),
#             "profilePicture": row.get("profile_picture"),

#             "vehicle": {
#                 "id": row.get("vehicle_id"),
#                 "make": row.get("vehicle_make"),
#                 "model": row.get("vehicle_model"),
#                 "color": row.get("vehicle_color"),
#                 "registrationNumber": row.get("vehicle_registration_number"),
#                 "photoUrl": row.get("vehicle_photo"),
#             },

#             "rating": 4.5,
#             "date": departure_time_ist.strftime("%d %b %Y"),
#             "time": departure_time_ist.strftime("%I:%M %p"),
#             "from": row["origin"],
#             "to": row["destination"],

#             "suggestedPickup": pickup_point,
#             "suggestedDrop": drop_point,

#             "pickupWalkDistanceM": int(pickup_distance_m),
#             "dropWalkDistanceM": int(drop_distance_m),
#             "pickupLabel": f"Walk {int(pickup_distance_m)} m to pickup point",
#             "dropLabel": f"Walk {int(drop_distance_m)} m from drop point",

#             "pickupPositionOnRoute": float(row["pickup_pos"]),
#             "dropPositionOnRoute": float(row["drop_pos"]),

#             "price": row["price_per_seat"],
#             "matchPercentage": match_percentage,
#             "matchLabel": build_match_label(match_percentage),
#             "seatsAvailable": row["available_seats"],
#             "distanceKm": row["distance_km"],
#             "durationText": row["duration_text"],
#             "totalEstimatedPrice": row["total_estimated_price"],
#             "timeDifferenceMin": round(time_diff_min),
#             "routeCoordinates": route_coords,
#         })

#     rides.sort(
#         key=lambda x: (
#             -x["matchPercentage"],
#             x["timeDifferenceMin"],
#             x["pickupWalkDistanceM"] + x["dropWalkDistanceM"]
#         )
#     )

#     return {"rides": rides}


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

#     # Prevent edits if bookings accepted or ride started
#     if ride.status not in ["active"]:
#         raise HTTPException(status_code=400, detail="Cannot edit this ride (may have active bookings or completed)")

#     # Update scalar fields
#     departure_time_utc = data.departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         departure_time_utc = departure_time_utc.astimezone(timezone.utc)

#     ride.phone_number = normalized_phone
#     ride.origin = data.origin
#     ride.destination = data.destination
#     ride.departure_time = departure_time_utc
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

#     db.commit()
#     db.refresh(ride)

#     # Update geometry
#     line_wkt = "LINESTRING(" + ",".join(
#         [f"{lng} {lat}" for lng, lat in data.route_coordinates]
#     ) + ")"

#     db.execute(
#         text("""
#             UPDATE rides
#             SET route_line = ST_GeomFromText(:line_wkt, 4326)::geography
#             WHERE id = :ride_id
#         """),
#         {
#             "ride_id": ride.id,
#             "line_wkt": line_wkt
#         }
#     )
#     db.commit()

#     # Optional: Update notification for edited ride
#     try:
#         origin_short = data.origin.split(",")[0].strip() if data.origin else "start"
#         dest_short = data.destination.split(",")[0].strip() if data.destination else "destination"

#         notification = UserNotification(
#             phone_number=normalized_phone,
#             title="Ride Updated! 🔄",
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
#         "ride": ride
#     }


# @router.post("/ride-bookings")
# def create_ride_booking(data: CreateRideBookingRequest, db: Session = Depends(get_db)):
#     passenger_phone = normalize_phone(data.passenger_phone)

#     ride = db.query(Ride).filter(Ride.id == data.ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")

#     if ride.status != "active":
#         raise HTTPException(status_code=400, detail="Ride is not available")

#     if ride.available_seats < data.seats_requested:
#         raise HTTPException(status_code=400, detail="Not enough seats available")

#     if ride.phone_number == passenger_phone:
#         raise HTTPException(status_code=400, detail="You cannot book your own ride")

#     existing_booking = db.query(RideBooking).filter(
#         RideBooking.ride_id == data.ride_id,
#         RideBooking.passenger_phone == passenger_phone,
#         RideBooking.status.in_(["pending", "accepted"])
#     ).first()

#     if existing_booking:
#         raise HTTPException(status_code=400, detail="You already requested this ride")

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
#             message=f"You received a request for your ride from {origin_short} to {dest_short}.",
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
#     for idx, bk in enumerate(bookings, start=1):
#         p = db.query(User).filter(
#             User.phone_number == bk.passenger_phone
#         ).first()

#         passengers.append({
#             "booking_id": bk.id,
#             "passenger_phone": bk.passenger_phone,
#             "passenger_name": p.full_name if p and p.full_name else (p.first_name if p else f"Passenger {idx}"),
#             "profile_picture": p.profile_picture if p else None,
#             "seats_booked": bk.seats_booked,
#             "status": bk.status,
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
#         })

#     return {
#         "ride_id": ride_id,
#         "origin": ride.origin,
#         "destination": ride.destination,
#         "origin_lon": ride.origin_lon,
#         "origin_lat": ride.origin_lat,
#         "destination_lon": ride.destination_lon,
#         "destination_lat": ride.destination_lat,
#         "route_coordinates": ride.route_coordinates,
#         "passengers": passengers
#     }
# @router.get("/check-active-rides/{phone_number}")
# def check_active_rides(phone_number: str, vehicle_id: int = None, db: Session = Depends(get_db)):
#     """
#     Check if the driver has any active rides with the specified vehicle
#     """
#     normalized_phone = normalize_phone(phone_number)
    
#     query = db.query(Ride).filter(
#         Ride.phone_number == normalized_phone,
#         Ride.status.in_(["active", "full"])  # Only active or full rides
#     )
    
#     if vehicle_id:
#         query = query.filter(Ride.vehicle_id == vehicle_id)
    
#     active_rides = query.all()
    
#     rides_data = []
#     for ride in active_rides:
#         rides_data.append({
#             "id": ride.id,
#             "origin": ride.origin,
#             "destination": ride.destination,
#             "departure_time": ride.departure_time.isoformat(),
#             "available_seats": ride.available_seats,
#             "status": ride.status,
#             "vehicle_id": ride.vehicle_id
#         })
    
#     return {
#         "has_active_rides": len(active_rides) > 0,
#         "rides": rides_data
#     }
# @router.get("/check-duplicate-ride")
# def check_duplicate_ride(
#     phone_number: str,
#     origin_lng: float,
#     origin_lat: float,
#     destination_lng: float,
#     destination_lat: float,
#     departure_time: datetime,
#     vehicle_id: int,
#     db: Session = Depends(get_db)
# ):
#     """
#     Check for duplicate rides with same route, time, and vehicle
#     """
#     normalized_phone = normalize_phone(phone_number)
    
#     # Convert departure time to UTC for comparison
#     if departure_time.tzinfo is None:
#         departure_time = departure_time.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         departure_time = departure_time.astimezone(timezone.utc)
    
#     # Time window for duplicate detection (±2 hours)
#     time_window_start = departure_time - timedelta(hours=2)
#     time_window_end = departure_time + timedelta(hours=2)
    
#     # Find similar rides
#     similar_rides = db.query(Ride).filter(
#         Ride.phone_number == normalized_phone,
#         Ride.vehicle_id == vehicle_id,
#         Ride.status.in_(["active", "full"]),  # Only active or full rides
#         Ride.departure_time.between(time_window_start, time_window_end),
#         # Check if routes are similar using PostGIS (within 1km of origin/destination)
#         ST_Distance(
#     ST_SetSRID(
#         ST_MakePoint(
#             cast(origin_lng, Float),
#             cast(origin_lat, Float)
#         ),
#         4326
#     ),
#     ST_SetSRID(
#         ST_MakePoint(
#             cast(Ride.origin_lon, Float),
#             cast(Ride.origin_lat, Float)
#         ),
#         4326
#     )
# ) < 1000,
#         ST_Distance(
#     ST_SetSRID(
#         ST_MakePoint(
#             cast(destination_lng, Float),
#             cast(destination_lat, Float)
#         ),
#         4326
#     ),
#     ST_SetSRID(
#         ST_MakePoint(
#             cast(Ride.destination_lon, Float),
#             cast(Ride.destination_lat, Float)
#         ),
#         4326
#     )
# ) < 1000 # Within 1km
#     ).all()
    
#     if similar_rides:
#         ride = similar_rides[0]
#         return {
#             "has_duplicate": True,
#             "ride_id": ride.id,
#             "status": ride.status,
#             "available_seats": ride.available_seats,
#             "total_seats": ride.available_seats + get_booked_seats_count(db, ride.id),
#             "message": f"You already have a ride from {ride.origin} to {ride.destination} on {ride.departure_time.strftime('%d %b %Y at %I:%M %p')}"
#         }
    
#     return {
#         "has_duplicate": False
#     }

# def get_booked_seats_count(db: Session, ride_id: int) -> int:
#     """Helper function to get total booked seats for a ride"""
#     result = db.query(func.sum(RideBooking.seats_booked)).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status.in_(["pending", "accepted"])
#     ).scalar()
#     return result or 0
# from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session, joinedload
# from sqlalchemy import func, text, and_, or_
# from database import get_db
# from models import Ride, RideBooking, User, UserNotification, NotificationType, Vehicle
# from datetime import datetime, timezone, timedelta
# from pydantic import BaseModel, field_validator
# from typing import Optional, Dict, List
# import math
# import re

# router = APIRouter()

# IST = timezone(timedelta(hours=5, minutes=30))
# SEARCH_RADIUS_M = 2000
# TIME_WINDOW_SECONDS = 3600

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


# def check_overlapping_rides(db: Session, phone_number: str, departure_time: datetime, duration_minutes: int, exclude_ride_id: Optional[int] = None) -> Optional[Dict]:
#     """Check if there are any overlapping active rides for the driver"""
    
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


# def get_total_booked_seats(db: Session, ride_id: int) -> int:
#     """Get total booked seats for a ride (accepted bookings only)"""
#     result = db.query(func.sum(RideBooking.seats_booked)).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status == "accepted"
#     ).scalar()
#     return result or 0


# def to_ist(dt: datetime) -> datetime:
#     if dt is None:
#         return dt
#     if dt.tzinfo is None:
#         dt = dt.replace(tzinfo=timezone.utc)
#     return dt.astimezone(IST)


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
    
#     # ✅ Check for overlapping rides (Time Buffer Block)
#     overlapping = check_overlapping_rides(db, normalized_phone, departure_time_utc, duration_minutes)
#     if overlapping:
#         end_time_ist = to_ist(overlapping["expected_end_time"])
#         raise HTTPException(
#             status_code=409,
#             detail=f"You already have an active ride from {overlapping['origin']} to {overlapping['destination']} at {to_ist(overlapping['departure_time']).strftime('%I:%M %p')}. Please wait until {end_time_ist.strftime('%I:%M %p')} to post another ride."
#         )
    
#     # ✅ Validate distance (3km - 300km)
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
    
#     # ✅ Validate time (minimum 30 minutes from now)
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

#     # Update geometry
#     line_wkt = "LINESTRING(" + ",".join(
#         [f"{lng} {lat}" for lng, lat in data.route_coordinates]
#     ) + ")"

#     db.execute(
#         text("""
#             UPDATE rides
#             SET route_line = ST_GeomFromText(:line_wkt, 4326)::geography
#             WHERE id = :ride_id
#         """),
#         {"ride_id": ride.id, "line_wkt": line_wkt}
#     )
#     db.commit()

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
    
#     # ✅ Lock major fields if there are confirmed bookings
#     if has_confirmed_bookings:
#         # Check if major fields are being changed
#         major_changes = []
        
#         if ride.origin != data.origin:
#             major_changes.append("Origin")
#         if ride.destination != data.destination:
#             major_changes.append("Destination")
        
#         # Check time change (more than 10 minutes)
#         departure_time_utc = data.departure_time
#         if departure_time_utc.tzinfo is None:
#             departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#         else:
#             departure_time_utc = departure_time_utc.astimezone(timezone.utc)
        
#         time_diff_minutes = abs((departure_time_utc - ride.departure_time).total_seconds()) / 60
        
#         if time_diff_minutes > 10:
#             major_changes.append("Time (more than 10 minutes)")
        
#         # Check price change
#         if ride.price_per_seat != data.price_per_seat:
#             major_changes.append("Price")
        
#         if major_changes:
#             raise HTTPException(
#                 status_code=403,
#                 detail=f"Cannot modify: {', '.join(major_changes)}. This ride has {len(confirmed_bookings)} confirmed booking(s). Please cancel the ride and create a new one if you need major changes."
#             )
    
#     # ✅ Validate seat changes (cannot reduce below booked seats)
#     if data.available_seats < total_booked_seats:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Cannot reduce seats below {total_booked_seats} as you have {total_booked_seats} confirmed passenger(s)."
#         )
    
#     # Parse duration
#     duration_minutes = parse_duration_to_minutes(data.duration_text)
    
#     # Convert departure time to UTC
#     departure_time_utc = data.departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         departure_time_utc = departure_time_utc.astimezone(timezone.utc)
    
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
#     # ✅ Check for overlapping rides (excluding current ride)
#     if time_diff_minutes > 30:  # Only check if time changed significantly
#         overlapping = check_overlapping_rides(db, normalized_phone, departure_time_utc, duration_minutes, exclude_ride_id=ride_id)
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
#     ride.women_only = data.preferences.get('womenOnly', False) if data.preferences else False

#     db.commit()
#     db.refresh(ride)

#     # Update geometry
#     line_wkt = "LINESTRING(" + ",".join(
#         [f"{lng} {lat}" for lng, lat in data.route_coordinates]
#     ) + ")"

#     db.execute(
#         text("""
#             UPDATE rides
#             SET route_line = ST_GeomFromText(:line_wkt, 4326)::geography
#             WHERE id = :ride_id
#         """),
#         {"ride_id": ride.id, "line_wkt": line_wkt}
#     )
#     db.commit()

#     # Send notification if vehicle changed and has bookings
#     if vehicle_changed and has_confirmed_bookings:
#         try:
#             # Get old and new vehicle details
#             old_vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first() if ride.vehicle_id else None
#             new_vehicle = db.query(Vehicle).filter(Vehicle.id == data.vehicle_id).first() if data.vehicle_id else None
            
#             for booking in confirmed_bookings:
#                 notification = UserNotification(
#                     phone_number=booking.passenger_phone,
#                     title="Vehicle Changed 🚗",
#                     message=f"Your driver has changed vehicles. Please check the ride details for updated vehicle information.",
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
#         "vehicle_changed": vehicle_changed,
#         "notifications_sent": len(confirmed_bookings) if vehicle_changed else 0
#     }


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
    
#     overlapping = check_overlapping_rides(db, normalized_phone, departure_time, duration_minutes, exclude_ride_id)
    
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


# @router.get("/ride/{ride_id}/details")
# def get_ride_details(ride_id: int, db: Session = Depends(get_db)):
#     """Get ride details including bookings for edit mode"""
    
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     # Get all bookings
#     bookings = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride_id
#     ).order_by(RideBooking.created_at.desc()).all()
    
#     bookings_data = []
#     for booking in bookings:
#         passenger = db.query(User).filter(
#             User.phone_number == booking.passenger_phone
#         ).first()
        
#         bookings_data.append({
#             "id": booking.id,
#             "passenger_phone": booking.passenger_phone,
#             "passenger_name": passenger.full_name if passenger else passenger.first_name if passenger else None,
#             "seats": booking.seats_booked,
#             "status": booking.status,
#             "created_at": booking.created_at.isoformat(),
#             "total_amount": booking.total_amount
#         })
    
#     # Check if ride has confirmed bookings
#     confirmed_bookings = [b for b in bookings_data if b["status"] == "accepted"]
#     total_booked_seats = sum(b["seats"] for b in confirmed_bookings)
    
#     return {
#         "id": ride.id,
#         "origin": ride.origin,
#         "destination": ride.destination,
#         "departure_time": ride.departure_time.isoformat(),
#         "available_seats": ride.available_seats,
#         "price_per_seat": ride.price_per_seat,
#         "vehicle_id": ride.vehicle_id,
#         "status": ride.status,
#         "women_only": ride.women_only,
#         "preferences": ride.preferences,
#         "origin_coords": [ride.origin_lon, ride.origin_lat] if ride.origin_lon and ride.origin_lat else None,
#         "destination_coords": [ride.destination_lon, ride.destination_lat] if ride.destination_lon and ride.destination_lat else None,
#         "distance_km": ride.distance_km,
#         "duration_text": ride.duration_text,
#         "duration_minutes": ride.duration_minutes,
#         "expected_end_time": ride.expected_end_time.isoformat() if ride.expected_end_time else None,
#         "bookings": bookings_data,
#         "has_confirmed_bookings": len(confirmed_bookings) > 0,
#         "total_booked_seats": total_booked_seats
#     }


# @router.get("/check-duplicate-ride")
# def check_duplicate_ride(
#     phone_number: str,
#     origin_lng: float,
#     origin_lat: float,
#     destination_lng: float,
#     destination_lat: float,
#     departure_time: datetime,
#     vehicle_id: int,
#     db: Session = Depends(get_db)
# ):
#     """Check for duplicate rides with same route, time, and vehicle"""
#     normalized_phone = normalize_phone(phone_number)
    
#     # Convert departure time to UTC for comparison
#     if departure_time.tzinfo is None:
#         departure_time = departure_time.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         departure_time = departure_time.astimezone(timezone.utc)
    
#     # Time window for duplicate detection (±2 hours)
#     time_window_start = departure_time - timedelta(hours=2)
#     time_window_end = departure_time + timedelta(hours=2)
    
#     # Find similar rides
#     similar_rides = db.query(Ride).filter(
#         Ride.phone_number == normalized_phone,
#         Ride.vehicle_id == vehicle_id,
#         Ride.status.in_(["active", "full"]),
#         Ride.departure_time.between(time_window_start, time_window_end),
#         func.ST_Distance(
#             func.ST_SetSRID(func.ST_MakePoint(origin_lng, origin_lat), 4326),
#             func.ST_SetSRID(func.ST_MakePoint(Ride.origin_lon, Ride.origin_lat), 4326)
#         ) < 1000,  # Within 1km
#         func.ST_Distance(
#             func.ST_SetSRID(func.ST_MakePoint(destination_lng, destination_lat), 4326),
#             func.ST_SetSRID(func.ST_MakePoint(Ride.destination_lon, Ride.destination_lat), 4326)
#         ) < 1000
#     ).all()
    
#     if similar_rides:
#         ride = similar_rides[0]
#         total_seats = ride.available_seats + get_total_booked_seats(db, ride.id)
        
#         return {
#             "has_duplicate": True,
#             "ride_id": ride.id,
#             "status": ride.status,
#             "available_seats": ride.available_seats,
#             "total_seats": total_seats,
#             "message": f"You already have a ride from {ride.origin} to {ride.destination} on {to_ist(ride.departure_time).strftime('%d %b %Y at %I:%M %p')}"
#         }
    
#     return {"has_duplicate": False}


# @router.get("/check-active-rides/{phone_number}")
# def check_active_rides(phone_number: str, vehicle_id: Optional[int] = None, db: Session = Depends(get_db)):
#     """Check if the driver has any active rides with the specified vehicle"""
#     normalized_phone = normalize_phone(phone_number)
    
#     query = db.query(Ride).filter(
#         Ride.phone_number == normalized_phone,
#         Ride.status.in_(["active", "full"])
#     )
    
#     if vehicle_id:
#         query = query.filter(Ride.vehicle_id == vehicle_id)
    
#     active_rides = query.all()
    
#     rides_data = []
#     for ride in active_rides:
#         rides_data.append({
#             "id": ride.id,
#             "origin": ride.origin,
#             "destination": ride.destination,
#             "departure_time": ride.departure_time.isoformat(),
#             "available_seats": ride.available_seats,
#             "status": ride.status,
#             "vehicle_id": ride.vehicle_id
#         })
    
#     return {
#         "has_active_rides": len(active_rides) > 0,
#         "rides": rides_data
#     }


# @router.post("/search-rides")
# def search_rides(data: SearchRidesRequest, db: Session = Depends(get_db)):
#     req_time_utc = data.departure_time
#     if req_time_utc.tzinfo is None:
#         req_time_utc = req_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         req_time_utc = req_time_utc.astimezone(timezone.utc)

#     sql = text("""
#         WITH input AS (
#             SELECT
#                 ST_SetSRID(ST_MakePoint(:from_lng, :from_lat), 4326)::geography AS rider_pickup,
#                 ST_SetSRID(ST_MakePoint(:to_lng, :to_lat), 4326)::geography AS rider_drop,
#                 CAST(:departure_time AS timestamptz) AS req_time,
#                 CAST(:seats_required AS integer) AS req_seats,
#                 CAST(:passenger_gender AS text) AS passenger_gender
#         ),
#         candidate_rides AS (
#             SELECT
#                 r.id,
#                 r.phone_number,
#                 r.origin,
#                 r.destination,
#                 r.departure_time,
#                 r.available_seats,
#                 r.price_per_seat,
#                 r.distance_km,
#                 r.duration_text,
#                 r.total_estimated_price,
#                 r.route_line,
#                 r.route_coordinates,
#                 r.women_only,

#                 u.id AS user_db_id,
#                 u.user_id AS driver_user_id,
#                 u.first_name,
#                 u.last_name,
#                 u.full_name,
#                 u.email,
#                 u.profile_picture,
#                 u.profile_completed,
#                 u.status AS user_status,
#                 u.gender AS driver_gender,

#                 v.id AS vehicle_id,
#                 v.make AS vehicle_make,
#                 v.model AS vehicle_model,
#                 v.color AS vehicle_color,
#                 v.registration_number AS vehicle_registrationnumber,
#                 v.photo_url AS vehicle_photo,

#                 ST_Distance(r.route_line, i.rider_pickup) AS pickup_distance_m,
#                 ST_Distance(r.route_line, i.rider_drop) AS drop_distance_m,
#                 ST_LineLocatePoint(r.route_line::geometry, i.rider_pickup::geometry) AS pickup_pos,
#                 ST_LineLocatePoint(r.route_line::geometry, i.rider_drop::geometry) AS drop_pos

#             FROM rides r
#             LEFT JOIN users u
#                 ON RIGHT(REGEXP_REPLACE(COALESCE(u.phone_number, ''), '\\D', '', 'g'), 10) =
#                    RIGHT(REGEXP_REPLACE(COALESCE(r.phone_number, ''), '\\D', '', 'g'), 10)
#             LEFT JOIN LATERAL (
#                 SELECT vv.*
#                 FROM vehicles vv
#                 WHERE RIGHT(REGEXP_REPLACE(COALESCE(vv.phone_number, ''), '\\D', '', 'g'), 10) =
#                       RIGHT(REGEXP_REPLACE(COALESCE(r.phone_number, ''), '\\D', '', 'g'), 10)
#                 ORDER BY vv.id DESC
#                 LIMIT 1
#             ) v ON TRUE
#             CROSS JOIN input i
#             WHERE r.status = 'active'
#               AND r.available_seats >= i.req_seats
#               AND ABS(EXTRACT(EPOCH FROM (r.departure_time - i.req_time))) <= :time_window_seconds
#               AND ST_DWithin(r.route_line, i.rider_pickup, :search_radius_m)
#               AND ST_DWithin(r.route_line, i.rider_drop, :search_radius_m)
#               -- Women only filter: if ride is women_only, only show to female passengers
#               AND (r.women_only = FALSE OR r.women_only IS NULL OR i.passenger_gender = 'female')
#         )
#         SELECT *
#         FROM candidate_rides
#         ORDER BY departure_time ASC
#     """)

#     rows = db.execute(sql, {
#         "from_lng": data.from_coords[0],
#         "from_lat": data.from_coords[1],
#         "to_lng": data.to_coords[0],
#         "to_lat": data.to_coords[1],
#         "departure_time": req_time_utc,
#         "seats_required": data.seats_required,
#         "passenger_gender": data.passenger_gender,
#         "time_window_seconds": TIME_WINDOW_SECONDS,
#         "search_radius_m": SEARCH_RADIUS_M,
#     }).mappings().all()

#     rides = []

#     for row in rows:
#         if row["pickup_pos"] is None or row["drop_pos"] is None:
#             continue

#         if row["pickup_pos"] >= row["drop_pos"]:
#             continue

#         pickup_distance_m = float(row["pickup_distance_m"])
#         drop_distance_m = float(row["drop_distance_m"])

#         pickup_score = max(0, 1 - (pickup_distance_m / SEARCH_RADIUS_M))
#         drop_score = max(0, 1 - (drop_distance_m / SEARCH_RADIUS_M))

#         row_departure_utc = row["departure_time"]
#         if row_departure_utc.tzinfo is None:
#             row_departure_utc = row_departure_utc.replace(tzinfo=timezone.utc)

#         time_diff_min = abs((row_departure_utc - req_time_utc).total_seconds()) / 60
#         time_score = max(0, 1 - (time_diff_min / 60))

#         match_percentage = round(
#             100 * (
#                 0.35 * pickup_score +
#                 0.35 * drop_score +
#                 0.20 * time_score +
#                 0.10 * 1
#             )
#         )

#         route_coords = row.get("route_coordinates") or []
#         pickup_point = find_nearest_route_vertex(route_coords, data.from_coords[0], data.from_coords[1])
#         drop_point = find_nearest_route_vertex(route_coords, data.to_coords[0], data.to_coords[1])

#         full_name = (
#             row.get("full_name")
#             or " ".join(
#                 part for part in [row.get("first_name"), row.get("last_name")] if part
#             ).strip()
#         )

#         driver_name = full_name if full_name else f"Driver {str(row['phone_number'])[-4:]}"
#         departure_time_ist = to_ist(row_departure_utc)

#         rides.append({
#             "id": row["id"],
#             "driverName": driver_name,
#             "driverUserId": row.get("driver_user_id"),
#             "phoneNumber": row["phone_number"],
#             "email": row.get("email"),
#             "profileCompleted": row.get("profile_completed"),
#             "userStatus": row.get("user_status"),
#             "profilePicture": row.get("profile_picture"),
#             "driverGender": row.get("driver_gender"),
#             "womenOnly": row.get("women_only", False),

#             "vehicle": {
#                 "id": row.get("vehicle_id"),
#                 "make": row.get("vehicle_make"),
#                 "model": row.get("vehicle_model"),
#                 "color": row.get("vehicle_color"),
#                 "registrationNumber": row.get("vehicle_registrationnumber"),
#                 "photoUrl": row.get("vehicle_photo"),
#             },

#             "rating": 4.5,
#             "date": departure_time_ist.strftime("%d %b %Y"),
#             "time": departure_time_ist.strftime("%I:%M %p"),
#             "from": row["origin"],
#             "to": row["destination"],

#             "suggestedPickup": pickup_point,
#             "suggestedDrop": drop_point,

#             "pickupWalkDistanceM": int(pickup_distance_m),
#             "dropWalkDistanceM": int(drop_distance_m),
#             "pickupLabel": f"Walk {int(pickup_distance_m)} m to pickup point",
#             "dropLabel": f"Walk {int(drop_distance_m)} m from drop point",

#             "pickupPositionOnRoute": float(row["pickup_pos"]),
#             "dropPositionOnRoute": float(row["drop_pos"]),

#             "price": row["price_per_seat"],
#             "matchPercentage": match_percentage,
#             "matchLabel": build_match_label(match_percentage),
#             "seatsAvailable": row["available_seats"],
#             "distanceKm": row["distance_km"],
#             "durationText": row["duration_text"],
#             "totalEstimatedPrice": row["total_estimated_price"],
#             "timeDifferenceMin": round(time_diff_min),
#             "routeCoordinates": route_coords,
#         })

#     rides.sort(
#         key=lambda x: (
#             -x["matchPercentage"],
#             x["timeDifferenceMin"],
#             x["pickupWalkDistanceM"] + x["dropWalkDistanceM"]
#         )
#     )

#     return {"rides": rides}
# from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session, joinedload
# from sqlalchemy import func, text, and_, or_
# from database import get_db
# from models import Ride, RideBooking, User, UserNotification, NotificationType, Vehicle
# from datetime import datetime, timezone, timedelta
# from pydantic import BaseModel, field_validator
# from typing import Optional, Dict, List
# import math
# import re

# router = APIRouter()

# IST = timezone(timedelta(hours=5, minutes=30))
# SEARCH_RADIUS_M = 2000
# TIME_WINDOW_MINUTES  = 60

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


# def check_overlapping_rides(db: Session, phone_number: str, departure_time: datetime, duration_minutes: int, exclude_ride_id: Optional[int] = None) -> Optional[Dict]:
#     """Check if there are any overlapping active rides for the driver"""
    
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


# def get_total_booked_seats(db: Session, ride_id: int) -> int:
#     """Get total booked seats for a ride (accepted bookings only)"""
#     result = db.query(func.sum(RideBooking.seats_booked)).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status == "accepted"
#     ).scalar()
#     return result or 0


# def to_ist(dt: datetime) -> datetime:
#     if dt is None:
#         return dt
#     if dt.tzinfo is None:
#         dt = dt.replace(tzinfo=timezone.utc)
#     return dt.astimezone(IST)


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
    
#     # ✅ Check for overlapping rides (Time Buffer Block)
#     overlapping = check_overlapping_rides(db, normalized_phone, departure_time_utc, duration_minutes)
#     if overlapping:
#         end_time_ist = to_ist(overlapping["expected_end_time"])
#         raise HTTPException(
#             status_code=409,
#             detail=f"You already have an active ride from {overlapping['origin']} to {overlapping['destination']} at {to_ist(overlapping['departure_time']).strftime('%I:%M %p')}. Please wait until {end_time_ist.strftime('%I:%M %p')} to post another ride."
#         )
    
#     # ✅ Validate distance (3km - 300km)
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
    
#     # ✅ Validate time (minimum 30 minutes from now)
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
    
#     # Calculate time difference for validation
#     departure_time_utc = data.departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         departure_time_utc = departure_time_utc.astimezone(timezone.utc)
    
#     time_diff_minutes = abs((departure_time_utc - ride.departure_time).total_seconds()) / 60
    
#     # ✅ Lock major fields if there are confirmed bookings
#     if has_confirmed_bookings:
#         major_changes = []
        
#         if ride.origin != data.origin:
#             major_changes.append("Origin")
#         if ride.destination != data.destination:
#             major_changes.append("Destination")
        
#         if time_diff_minutes > 10:
#             major_changes.append("Time (more than 10 minutes)")
        
#         if ride.price_per_seat != data.price_per_seat:
#             major_changes.append("Price")
        
#         if major_changes:
#             raise HTTPException(
#                 status_code=403,
#                 detail=f"Cannot modify: {', '.join(major_changes)}. This ride has {len(confirmed_bookings)} confirmed booking(s). Please cancel the ride and create a new one if you need major changes."
#             )
    
#     # ✅ Validate seat changes (cannot reduce below booked seats)
#     if data.available_seats < total_booked_seats:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Cannot reduce seats below {total_booked_seats} as you have {total_booked_seats} confirmed passenger(s)."
#         )
    
#     # Parse duration
#     duration_minutes = parse_duration_to_minutes(data.duration_text)
#     expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
#     # ✅ Check for overlapping rides (excluding current ride) - only if time changed significantly
#     if time_diff_minutes > 30:
#         overlapping = check_overlapping_rides(db, normalized_phone, departure_time_utc, duration_minutes, exclude_ride_id=ride_id)
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
#     ride.women_only = data.preferences.get('womenOnly', False) if data.preferences else False

#     db.commit()
#     db.refresh(ride)

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
#         "vehicle_changed": vehicle_changed,
#         "notifications_sent": len(confirmed_bookings) if vehicle_changed else 0
#     }


# @router.post("/notify-vehicle-change")
# def notify_vehicle_change(data: VehicleChangeNotification, db: Session = Depends(get_db)):
#     """Notify all accepted passengers about vehicle change"""
    
#     ride = db.query(Ride).filter(Ride.id == data.ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     old_vehicle = db.query(Vehicle).filter(Vehicle.id == data.old_vehicle_id).first() if data.old_vehicle_id else None
#     new_vehicle = db.query(Vehicle).filter(Vehicle.id == data.new_vehicle_id).first()
    
#     if not new_vehicle:
#         raise HTTPException(status_code=404, detail="New vehicle not found")
    
#     confirmed_bookings = db.query(RideBooking).filter(
#         RideBooking.ride_id == data.ride_id,
#         RideBooking.status == "accepted"
#     ).all()
    
#     old_vehicle_text = f"{old_vehicle.make} {old_vehicle.model} ({old_vehicle.registration_number})" if old_vehicle else "previous vehicle"
#     new_vehicle_text = f"{new_vehicle.make} {new_vehicle.model} ({new_vehicle.registration_number})"
    
#     notifications_sent = 0
#     for booking in confirmed_bookings:
#         try:
#             notification = UserNotification(
#                 phone_number=booking.passenger_phone,
#                 title="Vehicle Changed 🚗",
#                 message=f"Driver has changed vehicle from {old_vehicle_text} to {new_vehicle_text}. Please check ride details.",
#                 type=NotificationType.RIDE,
#                 action_type="ride",
#                 action_value=str(data.ride_id),
#                 is_read=False,
#                 is_deleted=False
#             )
#             db.add(notification)
#             notifications_sent += 1
#         except Exception as e:
#             print(f"Error sending notification to {booking.passenger_phone}: {str(e)}")
    
#     db.commit()
    
#     return {
#         "message": f"Notified {notifications_sent} passengers",
#         "notifications_sent": notifications_sent
#     }


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
    
#     overlapping = check_overlapping_rides(db, normalized_phone, departure_time, duration_minutes, exclude_ride_id)
    
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


# @router.get("/ride/{ride_id}/details")
# def get_ride_details(ride_id: int, db: Session = Depends(get_db)):
#     """Get ride details including bookings for edit mode"""
    
#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")
    
#     # Get all bookings
#     bookings = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride_id
#     ).order_by(RideBooking.created_at.desc()).all()
    
#     bookings_data = []
#     for booking in bookings:
#         passenger = db.query(User).filter(
#             User.phone_number == booking.passenger_phone
#         ).first()
        
#         bookings_data.append({
#             "id": booking.id,
#             "passenger_phone": booking.passenger_phone,
#             "passenger_name": passenger.full_name if passenger else (passenger.first_name if passenger else None),
#             "seats": booking.seats_booked,
#             "status": booking.status,
#             "created_at": booking.created_at.isoformat(),
#             "total_amount": booking.total_amount
#         })
    
#     # Check if ride has confirmed bookings
#     confirmed_bookings = [b for b in bookings_data if b["status"] == "accepted"]
#     total_booked_seats = sum(b["seats"] for b in confirmed_bookings)
    
#     return {
#         "id": ride.id,
#         "origin": ride.origin,
#         "destination": ride.destination,
#         "departure_time": ride.departure_time.isoformat(),
#         "available_seats": ride.available_seats,
#         "price_per_seat": ride.price_per_seat,
#         "vehicle_id": ride.vehicle_id,
#         "status": ride.status,
#         "women_only": ride.women_only,
#         "preferences": ride.preferences,
#         "origin_coords": [ride.origin_lon, ride.origin_lat] if ride.origin_lon and ride.origin_lat else None,
#         "destination_coords": [ride.destination_lon, ride.destination_lat] if ride.destination_lon and ride.destination_lat else None,
#         "distance_km": ride.distance_km,
#         "duration_text": ride.duration_text,
#         "duration_minutes": ride.duration_minutes,
#         "expected_end_time": ride.expected_end_time.isoformat() if ride.expected_end_time else None,
#         "bookings": bookings_data,
#         "has_confirmed_bookings": len(confirmed_bookings) > 0,
#         "total_booked_seats": total_booked_seats
#     }


# @router.get("/check-duplicate-ride")
# def check_duplicate_ride(
#     phone_number: str,
#     origin_lng: float,
#     origin_lat: float,
#     destination_lng: float,
#     destination_lat: float,
#     departure_time: datetime,
#     vehicle_id: int,
#     db: Session = Depends(get_db)
# ):
#     """Check for duplicate rides with same route, time, and vehicle"""
#     normalized_phone = normalize_phone(phone_number)
    
#     # Convert departure time to UTC for comparison
#     if departure_time.tzinfo is None:
#         departure_time = departure_time.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         departure_time = departure_time.astimezone(timezone.utc)
    
#     # Time window for duplicate detection (±2 hours)
#     time_window_start = departure_time - timedelta(hours=2)
#     time_window_end = departure_time + timedelta(hours=2)
    
#     # Find similar rides (simplified without PostGIS)
#     similar_rides = db.query(Ride).filter(
#         Ride.phone_number == normalized_phone,
#         Ride.vehicle_id == vehicle_id,
#         Ride.status.in_(["active", "full"]),
#         Ride.departure_time.between(time_window_start, time_window_end),
#         Ride.origin_lat.isnot(None),
#         Ride.origin_lon.isnot(None),
#         Ride.destination_lat.isnot(None),
#         Ride.destination_lon.isnot(None)
#     ).all()
    
#     # Filter by distance manually
#     filtered_rides = []
#     for ride in similar_rides:
#         origin_dist = calculate_distance_km(origin_lat, origin_lng, ride.origin_lat, ride.origin_lon)
#         dest_dist = calculate_distance_km(destination_lat, destination_lng, ride.destination_lat, ride.destination_lon)
        
#         if origin_dist < 1.0 and dest_dist < 1.0:  # Within 1km
#             filtered_rides.append(ride)
    
#     if filtered_rides:
#         ride = filtered_rides[0]
#         total_seats = ride.available_seats + get_total_booked_seats(db, ride.id)
        
#         return {
#             "has_duplicate": True,
#             "ride_id": ride.id,
#             "status": ride.status,
#             "available_seats": ride.available_seats,
#             "total_seats": total_seats,
#             "message": f"You already have a ride from {ride.origin} to {ride.destination} on {to_ist(ride.departure_time).strftime('%d %b %Y at %I:%M %p')}"
#         }
    
#     return {"has_duplicate": False}


# @router.get("/check-active-rides/{phone_number}")
# def check_active_rides(phone_number: str, vehicle_id: Optional[int] = None, db: Session = Depends(get_db)):
#     """Check if the driver has any active rides with the specified vehicle"""
#     normalized_phone = normalize_phone(phone_number)
    
#     query = db.query(Ride).filter(
#         Ride.phone_number == normalized_phone,
#         Ride.status.in_(["active", "full"])
#     )
    
#     if vehicle_id:
#         query = query.filter(Ride.vehicle_id == vehicle_id)
    
#     active_rides = query.all()
    
#     rides_data = []
#     for ride in active_rides:
#         rides_data.append({
#             "id": ride.id,
#             "origin": ride.origin,
#             "destination": ride.destination,
#             "departure_time": ride.departure_time.isoformat(),
#             "available_seats": ride.available_seats,
#             "status": ride.status,
#             "vehicle_id": ride.vehicle_id
#         })
    
#     return {
#         "has_active_rides": len(active_rides) > 0,
#         "rides": rides_data
#     }

# @router.post("/search-rides")
# def search_rides(data: SearchRidesRequest, db: Session = Depends(get_db)):
#     req_time_utc = data.departure_time
#     if req_time_utc.tzinfo is None:
#         req_time_utc = req_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         req_time_utc = req_time_utc.astimezone(timezone.utc)

#     # ✅ Build query first
#     query = db.query(Ride).filter(
#         Ride.status == "active",
#         Ride.available_seats >= data.seats_required,
#         Ride.departure_time.between(
#             req_time_utc - timedelta(minutes=TIME_WINDOW_MINUTES),
#             req_time_utc + timedelta(minutes=TIME_WINDOW_MINUTES)
#         )
#     )
    
#     # ✅ Apply women-only filter at database level
#     if data.passenger_gender != 'female':
#         query = query.filter(Ride.women_only == False)

#     # ✅ Execute query
#     all_rides = query.all()
    
#     rides = []
    
#     for ride in all_rides:
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
#             "pickupLabel": f"Walk {int(pickup_distance_m)} m to pickup point",
#             "dropLabel": f"Walk {int(drop_distance_m)} m from drop point",
#             "price": ride.price_per_seat,
#             "matchPercentage": match_percentage,
#             "matchLabel": build_match_label(match_percentage),
#             "seatsAvailable": ride.available_seats,
#             "distanceKm": ride.distance_km,
#             "durationText": ride.duration_text,
#             "totalEstimatedPrice": ride.total_estimated_price,
#             "timeDifferenceMin": round(time_diff_min),
#             "routeCoordinates": ride.route_coordinates or [],
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

#     if ride.status != "active":
#         raise HTTPException(status_code=400, detail="Ride is not available")

#     if ride.available_seats < data.seats_requested:
#         raise HTTPException(status_code=400, detail="Not enough seats available")

#     if ride.phone_number == passenger_phone:
#         raise HTTPException(status_code=400, detail="You cannot book your own ride")

#     existing_booking = db.query(RideBooking).filter(
#         RideBooking.ride_id == data.ride_id,
#         RideBooking.passenger_phone == passenger_phone,
#         RideBooking.status.in_(["pending", "accepted"])
#     ).first()

#     if existing_booking:
#         raise HTTPException(status_code=400, detail="You already requested this ride")

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
#             message=f"You received a request for your ride from {origin_short} to {dest_short}.",
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
# from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session, joinedload
# from sqlalchemy import func, text, and_, or_
# from database import get_db
# from models import Ride, RideBooking, User, UserNotification, NotificationType, Vehicle
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
    
#     # Calculate time difference for validation
#     departure_time_utc = data.departure_time
#     if departure_time_utc.tzinfo is None:
#         departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         departure_time_utc = departure_time_utc.astimezone(timezone.utc)
    
#     time_diff_minutes = abs((departure_time_utc - ride.departure_time).total_seconds()) / 60
    
#     # Lock major fields if there are confirmed bookings
#     if has_confirmed_bookings:
#         major_changes = []
        
#         if ride.origin != data.origin:
#             major_changes.append("Origin")
#         if ride.destination != data.destination:
#             major_changes.append("Destination")
        
#         if time_diff_minutes > 10:
#             major_changes.append("Time (more than 10 minutes)")
        
#         if ride.price_per_seat != data.price_per_seat:
#             major_changes.append("Price")
        
#         if major_changes:
#             raise HTTPException(
#                 status_code=403,
#                 detail=f"Cannot modify: {', '.join(major_changes)}. This ride has {len(confirmed_bookings)} confirmed booking(s). Please cancel the ride and create a new one if you need major changes."
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
#     ride.women_only = data.preferences.get('womenOnly', False) if data.preferences else False

#     db.commit()
#     db.refresh(ride)

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
#         "vehicle_changed": vehicle_changed,
#         "notifications_sent": len(confirmed_bookings) if vehicle_changed else 0
#     }


# @router.post("/search-rides")
# def search_rides(data: SearchRidesRequest, db: Session = Depends(get_db)):
#     req_time_utc = data.departure_time
#     if req_time_utc.tzinfo is None:
#         req_time_utc = req_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
#     else:
#         req_time_utc = req_time_utc.astimezone(timezone.utc)

#     # Build query
#     query = db.query(Ride).filter(
#         Ride.status == "active",
#         Ride.available_seats >= data.seats_required,
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
        
#         # Calculate total booked seats
#         total_booked = get_total_booked_seats(db, ride.id)
#         remaining_seats = ride.available_seats - total_booked
        
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
#             "seatsAvailable": remaining_seats,  # Show remaining seats, not total available
#             "totalSeats": ride.available_seats,  # Total seats originally available
#             "seatsRequested": data.seats_required,  # Seats requested by passenger
#             "distanceKm": ride.distance_km,
#             "durationText": ride.duration_text,
#             "totalEstimatedPrice": ride.total_estimated_price,
#             "timeDifferenceMin": round(time_diff_min),
#             "routeCoordinates": ride.route_coordinates or [],
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

#     if ride.status != "active":
#         raise HTTPException(status_code=400, detail="Ride is not available")

#     if ride.available_seats < data.seats_requested:
#         raise HTTPException(status_code=400, detail="Not enough seats available")

#     if ride.phone_number == passenger_phone:
#         raise HTTPException(status_code=400, detail="You cannot book your own ride")
    
#     # Check for multiple ride requests for same journey (max 2)
#     active_requests = db.query(RideBooking).filter(
#         RideBooking.passenger_phone == passenger_phone,
#         RideBooking.status == "pending",
#         RideBooking.created_at > datetime.now(timezone.utc) - timedelta(minutes=10)
#     ).count()
    
#     if active_requests >= 2:
#         raise HTTPException(status_code=400, detail="You can only have 2 active ride requests at a time. Please wait for responses before requesting more rides.")

#     existing_booking = db.query(RideBooking).filter(
#         RideBooking.ride_id == data.ride_id,
#         RideBooking.passenger_phone == passenger_phone,
#         RideBooking.status.in_(["pending", "accepted"])
#     ).first()

#     if existing_booking:
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
#             message=f"You received a request for your ride from {origin_short} to {dest_short}.",
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


# # Add this to handle auto-withdrawal of pending requests when a ride is accepted
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
#         # Auto-reject the booking instead of accepting
#         booking.status = "rejected"
#         db.commit()
#         raise HTTPException(status_code=400, detail="Not enough seats available anymore")

#     # Reduce available seats
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
        
#         # Notify the passenger that their request was auto-withdrawn
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
    
#     # Update ride available seats
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
#             message=f"Your request for the ride from {origin_short} to {dest_short} has been accepted by the driver.",
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
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text, and_, or_
from database import get_db
from models import Ride, RideBooking, User, UserNotification, NotificationType, Vehicle
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, field_validator
from typing import Optional, Dict, List
import math
import re

router = APIRouter()

IST = timezone(timedelta(hours=5, minutes=30))
SEARCH_RADIUS_M = 2000
TIME_WINDOW_MINUTES = 60

# ============================================
# PYDANTIC MODELS
# ============================================

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
    """Same as CreateRideRequest for ride updates"""
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


class VehicleChangeNotification(BaseModel):
    ride_id: int
    old_vehicle_id: Optional[int] = None
    new_vehicle_id: int


class ModifySeatsRequest(BaseModel):
    new_seats: int


# ============================================
# HELPER FUNCTIONS
# ============================================

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
    """Parse duration string like '1 Hr 30 Min' to minutes"""
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
    """Calculate distance between two points in kilometers using Haversine formula"""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c


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


def build_match_label(score: int) -> str:
    if score >= 90:
        return "Excellent"
    if score >= 75:
        return "Good"
    if score >= 60:
        return "Fair"
    return "Low"


# ============================================
# RIDE ENDPOINTS
# ============================================

@router.post("/post-ride")
def post_ride(data: CreateRideRequest, db: Session = Depends(get_db)):
    normalized_phone = normalize_phone(data.phone_number)
    
    # Parse duration
    duration_minutes = parse_duration_to_minutes(data.duration_text)
    
    # Convert departure time to UTC
    departure_time_utc = data.departure_time
    if departure_time_utc.tzinfo is None:
        departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
    else:
        departure_time_utc = departure_time_utc.astimezone(timezone.utc)
    
    expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
    # Check if user has overlapping ACCEPTED bookings as a passenger
    passenger_overlap = check_overlapping_bookings_for_passenger(db, normalized_phone, departure_time_utc, duration_minutes)
    if passenger_overlap:
        raise HTTPException(
            status_code=409,
            detail=f"You have a confirmed booking as a passenger from {passenger_overlap['origin']} to {passenger_overlap['destination']} at {to_ist(passenger_overlap['departure_time']).strftime('%I:%M %p')} that overlaps with this ride. Please complete that ride before offering another."
        )
    
    # Check for overlapping rides (Time Buffer Block)
    overlapping = check_overlapping_rides_for_driver(db, normalized_phone, departure_time_utc, duration_minutes)
    if overlapping:
        end_time_ist = to_ist(overlapping["expected_end_time"])
        raise HTTPException(
            status_code=409,
            detail=f"You already have an active ride from {overlapping['origin']} to {overlapping['destination']} at {to_ist(overlapping['departure_time']).strftime('%I:%M %p')}. Please wait until {end_time_ist.strftime('%I:%M %p')} to post another ride."
        )
    
    # Validate distance (3km - 300km)
    distance = calculate_distance_km(
        data.origin_coords[1], data.origin_coords[0],
        data.destination_coords[1], data.destination_coords[0]
    )
    
    MIN_DISTANCE_KM = 3
    MAX_DISTANCE_KM = 300
    
    if distance < MIN_DISTANCE_KM:
        raise HTTPException(
            status_code=400,
            detail=f"Pickup and destination are too close ({distance:.1f} km). Minimum distance is {MIN_DISTANCE_KM} km for a ride."
        )
    
    if distance > MAX_DISTANCE_KM:
        raise HTTPException(
            status_code=400,
            detail=f"Distance too far ({distance:.1f} km). Maximum allowed is {MAX_DISTANCE_KM} km for daily commutes."
        )
    
    # Validate time (minimum 30 minutes from now)
    min_departure_time = datetime.now(timezone.utc) + timedelta(minutes=30)
    if departure_time_utc < min_departure_time:
        min_time_ist = to_ist(min_departure_time)
        raise HTTPException(
            status_code=400,
            detail=f"Departure time must be at least 30 minutes from now. Please select a time after {min_time_ist.strftime('%I:%M %p')}."
        )
    
    # Get women_only from preferences
    women_only = data.preferences.get('womenOnly', False) if data.preferences else data.women_only
    
    # Create ride
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

    # Update geometry (if PostGIS is enabled, otherwise skip)
    try:
        if data.route_coordinates and len(data.route_coordinates) >= 2:
            line_wkt = "LINESTRING(" + ",".join(
                [f"{lng} {lat}" for lng, lat in data.route_coordinates]
            ) + ")"
            db.execute(
                text("""
                    UPDATE rides
                    SET route_line = ST_GeomFromText(:line_wkt, 4326)::geography
                    WHERE id = :ride_id
                """),
                {"ride_id": ride.id, "line_wkt": line_wkt}
            )
            db.commit()
    except Exception as e:
        print(f"⚠️ PostGIS update skipped: {str(e)}")

    # Create notification for ride posted
    try:
        origin_short = data.origin.split(",")[0].strip() if data.origin else "start"
        dest_short = data.destination.split(",")[0].strip() if data.destination else "destination"

        notification = UserNotification(
            phone_number=normalized_phone,
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
        print(f"✅ Ride posted notification created for {normalized_phone}")
    except Exception as e:
        print(f"❌ Error creating ride posted notification: {str(e)}")

    return {
        "message": "Ride posted successfully",
        "ride_id": ride.id
    }


@router.put("/update-ride/{ride_id}")
def update_ride(ride_id: int, data: UpdateRideRequest, db: Session = Depends(get_db)):
    normalized_phone = normalize_phone(data.phone_number)

    # Fetch existing ride
    ride = db.query(Ride).filter(
        Ride.id == ride_id,
        Ride.phone_number == normalized_phone
    ).first()
    
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found or you don't have permission to edit it")

    # Check if ride has confirmed bookings
    confirmed_bookings = db.query(RideBooking).filter(
        RideBooking.ride_id == ride_id,
        RideBooking.status == "accepted"
    ).all()
    
    has_confirmed_bookings = len(confirmed_bookings) > 0
    total_booked_seats = sum(b.seats_booked for b in confirmed_bookings)
    
    # Calculate time difference for validation
    departure_time_utc = data.departure_time
    if departure_time_utc.tzinfo is None:
        departure_time_utc = departure_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
    else:
        departure_time_utc = departure_time_utc.astimezone(timezone.utc)
    
    time_diff_minutes = abs((departure_time_utc - ride.departure_time).total_seconds()) / 60
    
    # Lock major fields if there are confirmed bookings
    if has_confirmed_bookings:
        major_changes = []
        
        if ride.origin != data.origin:
            major_changes.append("Origin")
        if ride.destination != data.destination:
            major_changes.append("Destination")
        
        if time_diff_minutes > 10:
            major_changes.append("Time (more than 10 minutes)")
        
        if ride.price_per_seat != data.price_per_seat:
            major_changes.append("Price")
        
        if major_changes:
            raise HTTPException(
                status_code=403,
                detail=f"Cannot modify: {', '.join(major_changes)}. This ride has {len(confirmed_bookings)} confirmed booking(s). Please cancel the ride and create a new one if you need major changes."
            )
    
    # Validate seat changes (cannot reduce below booked seats)
    if data.available_seats < total_booked_seats:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot reduce seats below {total_booked_seats} as you have {total_booked_seats} confirmed passenger(s)."
        )
    
    # Parse duration
    duration_minutes = parse_duration_to_minutes(data.duration_text)
    expected_end_time = departure_time_utc + timedelta(minutes=duration_minutes)
    
    # Check for overlapping rides (excluding current ride) - only if time changed significantly
    if time_diff_minutes > 30:
        overlapping = check_overlapping_rides_for_driver(db, normalized_phone, departure_time_utc, duration_minutes, exclude_ride_id=ride_id)
        if overlapping:
            end_time_ist = to_ist(overlapping["expected_end_time"])
            raise HTTPException(
                status_code=409,
                detail=f"Cannot update: You have another active ride from {overlapping['origin']} to {overlapping['destination']} at {to_ist(overlapping['departure_time']).strftime('%I:%M %p')} that overlaps with this new time."
            )
    
    # Check if vehicle changed (for notification)
    vehicle_changed = ride.vehicle_id != data.vehicle_id
    
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
    ride.women_only = data.preferences.get('womenOnly', False) if data.preferences else False

    db.commit()
    db.refresh(ride)

    # Update geometry (if PostGIS is enabled)
    try:
        if data.route_coordinates and len(data.route_coordinates) >= 2:
            line_wkt = "LINESTRING(" + ",".join(
                [f"{lng} {lat}" for lng, lat in data.route_coordinates]
            ) + ")"
            db.execute(
                text("""
                    UPDATE rides
                    SET route_line = ST_GeomFromText(:line_wkt, 4326)::geography
                    WHERE id = :ride_id
                """),
                {"ride_id": ride.id, "line_wkt": line_wkt}
            )
            db.commit()
    except Exception as e:
        print(f"⚠️ PostGIS update skipped: {str(e)}")

    # Send notification if vehicle changed and has bookings
    if vehicle_changed and has_confirmed_bookings:
        try:
            old_vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first() if ride.vehicle_id else None
            new_vehicle = db.query(Vehicle).filter(Vehicle.id == data.vehicle_id).first() if data.vehicle_id else None
            
            old_vehicle_text = f"{old_vehicle.make} {old_vehicle.model} ({old_vehicle.registration_number})" if old_vehicle else "previous vehicle"
            new_vehicle_text = f"{new_vehicle.make} {new_vehicle.model} ({new_vehicle.registration_number})" if new_vehicle else "new vehicle"
            
            for booking in confirmed_bookings:
                notification = UserNotification(
                    phone_number=booking.passenger_phone,
                    title="Vehicle Changed 🚗",
                    message=f"Driver has changed vehicle from {old_vehicle_text} to {new_vehicle_text}. Please check ride details.",
                    type=NotificationType.RIDE,
                    action_type="ride",
                    action_value=str(ride.id),
                    is_read=False,
                    is_deleted=False
                )
                db.add(notification)
            db.commit()
            print(f"✅ Sent vehicle change notifications to {len(confirmed_bookings)} passengers")
        except Exception as e:
            print(f"❌ Error sending vehicle change notifications: {str(e)}")

    # Create notification for ride update
    try:
        origin_short = data.origin.split(",")[0].strip() if data.origin else "start"
        dest_short = data.destination.split(",")[0].strip() if data.destination else "destination"
        
        notification_title = "Ride Updated! 🔄" if not vehicle_changed else "Ride & Vehicle Updated! 🔄🚗"
        
        notification = UserNotification(
            phone_number=normalized_phone,
            title=notification_title,
            message=f"Your ride from {origin_short} to {dest_short} has been updated.",
            type=NotificationType.RIDE,
            action_type="ride",
            action_value=str(ride.id),
            is_read=False,
            is_deleted=False
        )
        db.add(notification)
        db.commit()
    except Exception as e:
        print(f"❌ Error creating update notification: {str(e)}")

    return {
        "message": "Ride updated successfully",
        "ride_id": ride.id,
        "vehicle_changed": vehicle_changed,
        "notifications_sent": len(confirmed_bookings) if vehicle_changed else 0
    }


@router.post("/search-rides")
def search_rides(data: SearchRidesRequest, db: Session = Depends(get_db)):
    req_time_utc = data.departure_time
    if req_time_utc.tzinfo is None:
        req_time_utc = req_time_utc.replace(tzinfo=IST).astimezone(timezone.utc)
    else:
        req_time_utc = req_time_utc.astimezone(timezone.utc)

    # Build query
    query = db.query(Ride).filter(
        Ride.status == "active",
        Ride.available_seats >= data.seats_required,
        Ride.departure_time.between(
            req_time_utc - timedelta(minutes=TIME_WINDOW_MINUTES),
            req_time_utc + timedelta(minutes=TIME_WINDOW_MINUTES)
        )
    )
    
    # Apply women-only filter at database level
    if data.passenger_gender != 'female':
        query = query.filter(Ride.women_only == False)

    # Execute query
    all_rides = query.all()
    
    rides = []
    
    for ride in all_rides:
        # Calculate distances if coordinates available
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
            
            # Find nearest points on route
            if ride.route_coordinates:
                pickup_point = find_nearest_route_vertex(ride.route_coordinates, data.from_coords[0], data.from_coords[1])
                drop_point = find_nearest_route_vertex(ride.route_coordinates, data.to_coords[0], data.to_coords[1])
        
        # Skip if too far
        if pickup_distance_m > SEARCH_RADIUS_M * 2 or drop_distance_m > SEARCH_RADIUS_M * 2:
            continue
        
        # Calculate match score
        pickup_score = max(0, 1 - (pickup_distance_m / SEARCH_RADIUS_M))
        drop_score = max(0, 1 - (drop_distance_m / SEARCH_RADIUS_M))
        
        time_diff_min = abs((ride.departure_time - req_time_utc).total_seconds()) / 60
        time_score = max(0, 1 - (time_diff_min / 60))
        
        match_percentage = round(
            100 * (0.35 * pickup_score + 0.35 * drop_score + 0.20 * time_score + 0.10)
        )
        
        # Get driver info
        driver = db.query(User).filter(
            User.phone_number == ride.phone_number
        ).first()
        
        driver_name = None
        if driver:
            driver_name = driver.full_name or " ".join(filter(None, [driver.first_name, driver.last_name]))
        if not driver_name:
            driver_name = f"Driver {ride.phone_number[-4:]}"
        
        # Get vehicle info
        vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first() if ride.vehicle_id else None
        
        departure_time_ist = to_ist(ride.departure_time)
        
        # Calculate total booked seats
        total_booked = get_total_booked_seats(db, ride.id)
        remaining_seats = ride.available_seats - total_booked
        
        rides.append({
            "id": ride.id,
            "driverName": driver_name,
            "driverUserId": driver.user_id if driver else None,
            "phoneNumber": ride.phone_number,
            "email": driver.email if driver else None,
            "profileCompleted": driver.profile_completed if driver else False,
            "userStatus": driver.status.value if driver else None,
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
            "rating": 4.5,
            "date": departure_time_ist.strftime("%d %b %Y"),
            "time": departure_time_ist.strftime("%I:%M %p"),
            "from": ride.origin,
            "to": ride.destination,
            "suggestedPickup": pickup_point,
            "suggestedDrop": drop_point,
            "pickupWalkDistanceM": int(pickup_distance_m),
            "dropWalkDistanceM": int(drop_distance_m),
            "pickupLabel": f"Walk {int(pickup_distance_m)} m to pickup point" if pickup_distance_m > 0 else "Pickup point",
            "dropLabel": f"Walk {int(drop_distance_m)} m from drop point" if drop_distance_m > 0 else "Drop point",
            "price": ride.price_per_seat,
            "matchPercentage": match_percentage,
            "matchLabel": build_match_label(match_percentage),
            "seatsAvailable": remaining_seats,  # Show remaining seats, not total available
            "totalSeats": ride.available_seats,  # Total seats originally available
            "seatsRequested": data.seats_required,  # Seats requested by passenger
            "distanceKm": ride.distance_km,
            "durationText": ride.duration_text,
            "totalEstimatedPrice": ride.total_estimated_price,
            "timeDifferenceMin": round(time_diff_min),
            "routeCoordinates": ride.route_coordinates or [],
        })
    
    rides.sort(
        key=lambda x: (
            -x["matchPercentage"],
            x["timeDifferenceMin"],
            x["pickupWalkDistanceM"] + x["dropWalkDistanceM"]
        )
    )
    
    return {"rides": rides}


@router.post("/ride-bookings")
def create_ride_booking(data: CreateRideBookingRequest, db: Session = Depends(get_db)):
    passenger_phone = normalize_phone(data.passenger_phone)

    ride = db.query(Ride).filter(Ride.id == data.ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if ride.status != "active":
        raise HTTPException(status_code=400, detail="Ride is not available")

    # Check available seats
    total_booked = get_total_booked_seats(db, ride.id)
    remaining_seats = ride.available_seats - total_booked
    
    if remaining_seats < data.seats_requested:
        raise HTTPException(status_code=400, detail=f"Not enough seats available. Only {remaining_seats} seat(s) left.")

    if ride.phone_number == passenger_phone:
        raise HTTPException(status_code=400, detail="You cannot book your own ride")
    
    # Check if user already has an ACCEPTED booking for this ride
    existing_accepted = db.query(RideBooking).filter(
        RideBooking.ride_id == data.ride_id,
        RideBooking.passenger_phone == passenger_phone,
        RideBooking.status == "accepted"
    ).first()

    if existing_accepted:
        raise HTTPException(
            status_code=400, 
            detail="You already have a confirmed booking for this ride. Please contact the driver if you need to modify your seat count."
        )
    
    # Check for multiple ride requests for same journey (max 2)
    active_requests = db.query(RideBooking).filter(
        RideBooking.passenger_phone == passenger_phone,
        RideBooking.status == "pending",
        RideBooking.created_at > datetime.now(timezone.utc) - timedelta(minutes=10)
    ).count()
    
    if active_requests >= 2:
        raise HTTPException(status_code=400, detail="You can only have 2 active ride requests at a time. Please wait for responses before requesting more rides.")

    existing_pending = db.query(RideBooking).filter(
        RideBooking.ride_id == data.ride_id,
        RideBooking.passenger_phone == passenger_phone,
        RideBooking.status == "pending"
    ).first()

    if existing_pending:
        raise HTTPException(status_code=400, detail="You already requested this ride")
    
    # Get ride duration for overlap check
    duration_minutes = ride.duration_minutes or parse_duration_to_minutes(ride.duration_text) or 60
    
    # Check for overlapping active bookings
    overlapping = check_overlapping_bookings_for_passenger(db, passenger_phone, ride.departure_time, duration_minutes)
    if overlapping:
        raise HTTPException(
            status_code=409,
            detail=f"You already have a confirmed booking for a ride from {overlapping['origin']} to {overlapping['destination']} at {to_ist(overlapping['departure_time']).strftime('%I:%M %p')} that overlaps with this ride."
        )

    # Compute intersection points if coords provided
    pickup_lat = pickup_lon = drop_lat = drop_lon = None
    int_pickup_lat = int_pickup_lon = int_drop_lat = int_drop_lon = None
    pickup_walk_m = drop_walk_m = None

    if data.from_coords and data.to_coords and ride.route_coordinates:
        try:
            sql = text("""
                WITH input AS (
                    SELECT
                        ST_SetSRID(ST_MakePoint(:from_lng, :from_lat), 4326)::geography AS rider_pickup,
                        ST_SetSRID(ST_MakePoint(:to_lng, :to_lat), 4326)::geography AS rider_drop
                )
                SELECT
                    ST_Distance(r.route_line, i.rider_pickup) AS pickup_distance_m,
                    ST_Distance(r.route_line, i.rider_drop) AS drop_distance_m
                FROM rides r
                CROSS JOIN input i
                WHERE r.id = :ride_id
            """)

            result = db.execute(sql, {
                "ride_id": ride.id,
                "from_lng": data.from_coords[0],
                "from_lat": data.from_coords[1],
                "to_lng": data.to_coords[0],
                "to_lat": data.to_coords[1],
            }).mappings().first()

            if result:
                pickup_walk_m = int(float(result["pickup_distance_m"]))
                drop_walk_m = int(float(result["drop_distance_m"]))

                # Use nearest route vertex for accessible junction points
                route_coords = ride.route_coordinates or []
                pickup_pt = find_nearest_route_vertex(route_coords, data.from_coords[0], data.from_coords[1])
                drop_pt = find_nearest_route_vertex(route_coords, data.to_coords[0], data.to_coords[1])

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
            print(f"⚠️ Intersection compute error (non-fatal): {e}")

    # Defensive: ensure price_per_seat is valid before computing total
    if ride.price_per_seat is None:
        raise HTTPException(status_code=500, detail="Ride pricing is not configured. Please contact support.")

    total_amount = ride.price_per_seat * data.seats_requested

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
    db.flush()

    try:
        driver_phone = normalize_phone(ride.phone_number)

        origin_short = ride.origin.split(",")[0].strip() if ride.origin else "pickup"
        dest_short = ride.destination.split(",")[0].strip() if ride.destination else "destination"

        notification = UserNotification(
            phone_number=driver_phone,
            title="New Ride Request 🙋",
            message=f"You received a request for {data.seats_requested} seat(s) for your ride from {origin_short} to {dest_short}.",
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


@router.put("/booking/{booking_id}/modify-seats")
def modify_booking_seats(booking_id: int, data: ModifySeatsRequest, db: Session = Depends(get_db)):
    """Allow passenger to modify seat count on an accepted booking"""
    
    booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status != "accepted":
        raise HTTPException(status_code=400, detail="Only accepted bookings can be modified")
    
    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    if data.new_seats <= 0:
        raise HTTPException(status_code=400, detail="Seat count must be at least 1")
    
    # Calculate seat difference
    seat_diff = data.new_seats - booking.seats_booked
    
    if seat_diff > 0:
        # Need more seats - check availability
        total_booked = get_total_booked_seats(db, ride.id)
        remaining_seats = ride.available_seats - (total_booked - booking.seats_booked)
        
        if remaining_seats < seat_diff:
            raise HTTPException(
                status_code=400,
                detail=f"Only {remaining_seats} additional seat(s) available. Cannot increase by {seat_diff}."
            )
    
    # Update booking
    old_seats = booking.seats_booked
    booking.seats_booked = data.new_seats
    booking.total_amount = ride.price_per_seat * data.new_seats
    
    db.commit()
    
    # Notify driver
    try:
        notification = UserNotification(
            phone_number=ride.phone_number,
            title="Booking Modified 🔄",
            message=f"Passenger has modified seat request from {old_seats} to {data.new_seats} seat(s).",
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
        "message": f"Seats updated from {old_seats} to {data.new_seats}",
        "booking_id": booking.id,
        "new_seats": data.new_seats,
        "new_total": booking.total_amount
    }


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


@router.post("/booking/{booking_id}/accept")
def accept_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(RideBooking).filter(RideBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status != "pending":
        raise HTTPException(status_code=400, detail="Already processed")

    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    # Check seat availability before accepting
    total_booked = get_total_booked_seats(db, ride.id)
    remaining_seats = ride.available_seats - total_booked
    
    if remaining_seats < booking.seats_booked:
        # Auto-reject the booking instead of accepting
        booking.status = "rejected"
        db.commit()
        raise HTTPException(status_code=400, detail="Not enough seats available anymore")

    # Accept the booking
    booking.status = "accepted"
    
    # Auto-withdraw all other pending requests for this ride
    other_pending = db.query(RideBooking).filter(
        RideBooking.ride_id == ride.id,
        RideBooking.id != booking_id,
        RideBooking.status == "pending"
    ).all()
    
    withdrawn_count = 0
    for pending_booking in other_pending:
        pending_booking.status = "rejected"
        pending_booking.rejection_reason = "Rider joined another vehicle"
        withdrawn_count += 1
        
        # Notify the passenger that their request was auto-withdrawn
        try:
            notification = UserNotification(
                phone_number=pending_booking.passenger_phone,
                title="Request Auto-Withdrawn",
                message="Your ride request was automatically withdrawn because the driver accepted another passenger.",
                type=NotificationType.RIDE,
                action_type="booking",
                action_value=str(pending_booking.id),
                is_read=False,
                is_deleted=False
            )
            db.add(notification)
        except Exception as e:
            print(f"Error sending auto-withdrawal notification: {str(e)}")
    
    # Update ride available seats
    total_booked_after = get_total_booked_seats(db, ride.id)
    if ride.available_seats <= total_booked_after:
        ride.status = "full"
    
    db.commit()

    # Create notification for accepted passenger
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

    return {
        "message": "Booking accepted", 
        "withdrawn_count": withdrawn_count,
        "withdrawn_reason": "Rider joined another vehicle"
    }


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

    # Cancel all accepted bookings and refund seats
    bookings = db.query(RideBooking).filter(
        RideBooking.ride_id == ride_id,
        RideBooking.status == "accepted"
    ).all()

    for booking in bookings:
        booking.status = "cancelled"
        
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

    # Refund seats if accepted
    if booking.status == "accepted":
        ride.available_seats += booking.seats_booked
        if ride.status == "full":
            ride.status = "active"

    booking.status = "cancelled"
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

    return {"message": "Booking cancelled and seats refunded"}