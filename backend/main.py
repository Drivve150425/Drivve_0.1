# # =========================
# # STANDARD LIBRARIES
# # =========================
# from datetime import datetime, timezone
# import os
# from contextlib import asynccontextmanager

# # =========================
# # FASTAPI & RELATED
# # =========================
# from fastapi import FastAPI, Depends, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# import socketio
# import uvicorn

# # =========================
# # DATABASE & SQLALCHEMY
# # =========================
# from sqlalchemy.orm import Session
# from database import engine, get_db, Base

# # =========================
# # MODELS
# # =========================
# from models import (
#     User,
#     RideBooking,
#     LiveLocation,
#     DCoinRedemption,
# )

# # =========================
# # SCHEMAS & VALIDATION
# # =========================
# from pydantic import BaseModel, EmailStr

# # =========================
# # ENV CONFIG
# # =========================
# from dotenv import load_dotenv

# load_dotenv()
# EMAIL_USER = os.getenv("EMAIL_USER")

# # =========================
# # CREATE SOCKET.IO SERVER
# # =========================
# sio = socketio.AsyncServer(
#     cors_allowed_origins='*',
#     async_mode='asgi',
#     logger=True,
#     engineio_logger=True
# )

# # =========================
# # LIFESPAN MANAGER
# # =========================
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     print("🚀 Starting DRIVVE Server...")
    
#     # Setup database tables
#     try:
#         print("🏗️ Setting up database tables...")
#         Base.metadata.create_all(bind=engine)
#         print("✅ Database tables ready!")
#     except Exception as e:
#         print(f"⚠️ Database setup warning: {e}")
    
#     # Setup PostGIS
#     setup_postgis_and_ride_columns()
    
#     # Set sio instance in ride router
#     from routers import ride
#     ride.set_sio_instance(sio)
    
#     yield
    
#     print("🛑 Shutting down DRIVVE Server...")

# # =========================
# # CREATE FASTAPI APP
# # =========================
# app = FastAPI(
#     title="DRIVVE API",
#     description="DRIVVE Carpooling API",
#     version="2.0.1",
#     lifespan=lifespan
# )

# # =========================
# # CORS MIDDLEWARE
# # =========================
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # =========================
# # SOCKET EVENT HANDLERS
# # =========================
# @sio.on('connect')
# def connect(sid, environ):
#     print(f"🔌 Client connected: {sid}")

# @sio.on('disconnect')
# def disconnect(sid):
#     print(f"🔌 Client disconnected: {sid}")

# @sio.on('join-ride-room')
# def join_ride_room(sid, ride_id):
#     room_name = f"ride_{ride_id}"
#     sio.enter_room(sid, room_name)
#     print(f"📡 Client {sid} joined ride room: {room_name}")

# @sio.on('join-user-room')
# def join_user_room(sid, phone_number):
#     room_name = f"user_{phone_number}"
#     sio.enter_room(sid, room_name)
#     print(f"📡 Client {sid} joined user room: {room_name}")

# @sio.on('leave-ride-room')
# def leave_ride_room(sid, ride_id):
#     room_name = f"ride_{ride_id}"
#     sio.leave_room(sid, room_name)
#     print(f"📡 Client {sid} left ride room: {room_name}")

# # =========================
# # BASIC ENDPOINTS
# # =========================
# @app.get("/")
# async def root():
#     return {
#         "message": "DRIVVE API v2.0.1 - Working! 🚀",
#         "status": "active",
#         "timestamp": datetime.now(timezone.utc).isoformat(),
#         "network": "accessible"
#     }

# @app.get("/health")
# async def health_check():
#     try:
#         # Check database connection
#         db = next(get_db())
#         db.execute("SELECT 1")
#         db.close()
        
#         return {
#             "status": "healthy ✅",
#             "version": "2.0.1",
#             "timestamp": datetime.now(timezone.utc).isoformat(),
#             "server": "FastAPI Running",
#             "database": "connected"
#         }
#     except Exception as e:
#         return {
#             "status": "error ❌",
#             "error": str(e),
#             "timestamp": datetime.now(timezone.utc).isoformat()
#         }

# @app.post("/api/v1/rides/complete")
# def complete_ride(data: dict, db: Session = Depends(get_db)):
#     ride_booking_id = data.get("ride_booking_id")

#     if not ride_booking_id:
#         raise HTTPException(400, "ride_booking_id required")

#     booking = db.query(RideBooking).filter(
#         RideBooking.id == ride_booking_id
#     ).first()

#     if not booking:
#         raise HTTPException(404, "Ride booking not found")

#     if not booking.phone_number:
#         raise HTTPException(
#             status_code=400,
#             detail="Ride booking phone_number is NULL"
#         )

#     if booking.status == "completed":
#         return {"alreadyCompleted": True, "message": "Ride already completed"}

#     booking.status = "completed"
#     db.commit()
#     db.refresh(booking)

#     coins = 25
#     rupees = coins / 25

#     credit = DCoinRedemption(
#         phone_number=booking.phone_number,
#         coins=coins,
#         rupees=rupees,
#         type="CREDIT",
#         reason="Ride Completed Bonus"
#     )

#     db.add(credit)
#     db.commit()

#     return {"success": True, "coins": coins, "rupees": rupees}

# @app.get("/api/v1/users/{user_id}/rating")
# def get_user_rating(user_id: int, db: Session = Depends(get_db)):
#     user = db.get(User, user_id)
#     if not user:
#         raise HTTPException(404, "User not found")
#     return {
#         "avg_rating": user.avg_rating,
#         "total_ratings": user.total_ratings
#     }

# class LiveLocationPayload(BaseModel):
#     contact_id: int
#     lat: float
#     lng: float

# @app.post("/api/v1/live-location/update")
# def update_live_location(payload: LiveLocationPayload, db: Session = Depends(get_db)):
#     location = db.query(LiveLocation).filter(LiveLocation.contact_id == payload.contact_id).first()
#     if location:
#         location.lat = payload.lat
#         location.lng = payload.lng
#         location.updated_at = datetime.utcnow()
#     else:
#         location = LiveLocation(
#             contact_id=payload.contact_id,
#             lat=payload.lat,
#             lng=payload.lng,
#             updated_at=datetime.utcnow(),
#         )
#         db.add(location)
#     db.commit()
#     return {"success": True, "contact_id": payload.contact_id, "lat": payload.lat, "lng": payload.lng}

# # =========================
# # IMPORT AND INCLUDE ROUTERS
# # =========================
# from drivve_api.otp import router as otp_router
# from drivve_api.accountmanagement import router as account_router
# from drivve_api.blocked_users import router as blocked_users_router
# from drivve_api.dcoins import router as dcoins_router
# from drivve_api.document import router as document_router
# from drivve_api.emergency_contact import router as emergency_router
# from drivve_api.faq import router as faq_router
# from drivve_api.feedback import router as feedback_router
# from drivve_api.loginactivity import router as login_activity_router
# from drivve_api.matching_preference import router as matching_router
# from drivve_api.notification import router as notification_router
# from drivve_api.promotions import router as promotions_router
# from drivve_api.rewards import router as rewards_router
# from drivve_api.ridefeedback import router as ride_feedback_router
# from drivve_api.savedaddress import router as saved_address_router
# from drivve_api.securitysetting import router as security_router
# from drivve_api.shareapp import router as share_router
# from drivve_api.usernotification import router as user_notification_router
# from drivve_api.vehicles import router as vehicles_router
# from drivve_api.about_us import router as about_router
# from drivve_api.createprofile import router as createprofile_router
# from drivve_api.myprofile import router as profile_router
# from drivve_api.chat import router as chat_router
# from drivve_api.chat_socket import socket_app
# from routers import ride_session
# from routers.routes import router as riderrouter
# from routers.ride import router as ridesrouter
# from routers.my_rides import router as myrides_router

# app.include_router(otp_router)
# app.include_router(account_router)
# app.include_router(blocked_users_router)
# app.include_router(dcoins_router)
# app.include_router(document_router)
# app.include_router(emergency_router)
# app.include_router(faq_router)
# app.include_router(feedback_router)
# app.include_router(login_activity_router)
# app.include_router(matching_router)
# app.include_router(notification_router)
# app.include_router(promotions_router)
# app.include_router(rewards_router)
# app.include_router(ride_feedback_router)
# app.include_router(saved_address_router)
# app.include_router(security_router)
# app.include_router(share_router)
# app.include_router(user_notification_router)
# app.include_router(vehicles_router)
# app.include_router(about_router)
# app.include_router(createprofile_router)
# app.include_router(profile_router)
# app.include_router(chat_router)
# app.include_router(riderrouter)
# app.include_router(ridesrouter)
# app.include_router(myrides_router)
# app.include_router(ride_session.router)

# # Mount Socket.IO ASGI app
# app.mount("/socket.io", socket_app)

# # =========================
# # POSTGIS SETUP FUNCTION
# # =========================
# from sqlalchemy import text

# def setup_postgis_and_ride_columns():
#     try:
#         with engine.begin() as conn:
#             print("🚀 Running PostGIS setup...")
#             conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
#             print("✅ PostGIS extension checked")

#             conn.execute(text("ALTER TABLE rides ADD COLUMN IF NOT EXISTS route_coordinates JSONB"))
#             print("✅ route_coordinates checked")

#             conn.execute(text("ALTER TABLE rides ADD COLUMN IF NOT EXISTS origin_lon DOUBLE PRECISION"))
#             print("✅ origin_lon checked")

#             conn.execute(text("ALTER TABLE rides ADD COLUMN IF NOT EXISTS origin_lat DOUBLE PRECISION"))
#             print("✅ origin_lat checked")

#             conn.execute(text("ALTER TABLE rides ADD COLUMN IF NOT EXISTS destination_lon DOUBLE PRECISION"))
#             print("✅ destination_lon checked")

#             conn.execute(text("ALTER TABLE rides ADD COLUMN IF NOT EXISTS destination_lat DOUBLE PRECISION"))
#             print("✅ destination_lat checked")

#             conn.execute(text("ALTER TABLE rides ADD COLUMN IF NOT EXISTS route_line geometry(LineString, 4326)"))
#             print("✅ route_line checked")

#             conn.execute(text("CREATE INDEX IF NOT EXISTS idx_rides_route_line_gist ON rides USING GIST (route_line)"))
#             print("✅ route_line index checked")

#     except Exception as e:
#         print("❌ PostGIS setup failed:", str(e))

# # =========================
# # RUN THE APP
# # =========================
# if __name__ == "__main__":
#     print("🚀 Starting DRIVVE Server...")
#     print("🌐 Network accessible on:")
#     print("   - http://localhost:8000")
#     print("=" * 60)
   
#     uvicorn.run(
#         app,
#         host="0.0.0.0",
#         port=8000,
#         reload=False,
#         access_log=True
#     )
# =========================
# STANDARD LIBRARIES
# =========================
from datetime import datetime, timezone
import os
from contextlib import asynccontextmanager

# =========================
# FASTAPI & RELATED
# =========================
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import socketio
import uvicorn

# =========================
# DATABASE & SQLALCHEMY
# =========================
from sqlalchemy.orm import Session
from database import engine, get_db, Base

# =========================
# MODELS
# =========================
from models import (
    User,
    RideBooking,
    LiveLocation,
    DCoinRedemption,
    Ride,
    RideSession,
    RideSessionRider,
    ModificationRequest,
    UserNotification,
    Vehicle,
    EmergencyContact,
    Conversation,
    ChatMessage
)

# =========================
# SCHEMAS & VALIDATION
# =========================
from pydantic import BaseModel, EmailStr

# =========================
# ENV CONFIG
# =========================
from dotenv import load_dotenv

load_dotenv()
EMAIL_USER = os.getenv("EMAIL_USER")

# =========================
# CREATE SOCKET.IO SERVER
# =========================
sio = socketio.AsyncServer(
    cors_allowed_origins='*',
    async_mode='asgi',
    logger=True,
    engineio_logger=True
)

# =========================
# LIFESPAN MANAGER
# =========================
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting DRIVVE Server...")
    
    # Setup database tables
    try:
        print("🏗️ Setting up database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables ready!")
    except Exception as e:
        print(f"⚠️ Database setup warning: {e}")
    
    # Setup PostGIS
    setup_postgis_and_ride_columns()
    
    # Set sio instance in ride router
    from routers import ride
    ride.set_sio_instance(sio)
    
    # Set sio instance in ride_session router
    from routers import ride_session
    ride_session.set_sio_instance(sio)
    
    yield
    
    print("🛑 Shutting down DRIVVE Server...")

# =========================
# CREATE FASTAPI APP
# =========================
app = FastAPI(
    title="DRIVVE API",
    description="DRIVVE Carpooling API",
    version="2.0.1",
    lifespan=lifespan
)

# =========================
# CORS MIDDLEWARE
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# SOCKET EVENT HANDLERS
# =========================
@sio.on('connect')
async def connect(sid, environ):
    print(f"🔌 Client connected: {sid}")

@sio.on('disconnect')
async def disconnect(sid):
    print(f"🔌 Client disconnected: {sid}")

@sio.on('join-ride-room')
async def join_ride_room(sid, ride_id):
    room_name = f"ride_{ride_id}"
    await sio.enter_room(sid, room_name)
    print(f"📡 Client {sid} joined ride room: {room_name}")

@sio.on('join-user-room')
async def join_user_room(sid, phone_number):
    room_name = f"user_{phone_number}"
    await sio.enter_room(sid, room_name)
    print(f"📡 Client {sid} joined user room: {room_name}")

@sio.on('leave-ride-room')
async def leave_ride_room(sid, ride_id):
    room_name = f"ride_{ride_id}"
    await sio.leave_room(sid, room_name)
    print(f"📡 Client {sid} left ride room: {room_name}")

@sio.on('get-driver-location')
async def get_driver_location(sid, data):
    session_id = data.get("session_id")
    if session_id:
        from database import SessionLocal
        db = SessionLocal()
        try:
            session = db.query(RideSession).filter(RideSession.id == session_id).first()
            if session and session.current_lat and session.current_lng:
                await sio.emit("driver-location-update", {
                    "latitude": session.current_lat,
                    "longitude": session.current_lng,
                    "session_id": session_id
                }, room=sid)
        finally:
            db.close()

# =========================
# BASIC ENDPOINTS
# =========================
@app.get("/")
async def root():
    return {
        "message": "DRIVVE API v2.0.1 - Working! 🚀",
        "status": "active",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "network": "accessible"
    }

@app.get("/health")
async def health_check():
    try:
        # Check database connection
        db = next(get_db())
        db.execute("SELECT 1")
        db.close()
        
        return {
            "status": "healthy ✅",
            "version": "2.0.1",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "server": "FastAPI Running",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "error ❌",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

@app.post("/api/v1/rides/complete")
def complete_ride(data: dict, db: Session = Depends(get_db)):
    ride_booking_id = data.get("ride_booking_id")

    if not ride_booking_id:
        raise HTTPException(400, "ride_booking_id required")

    booking = db.query(RideBooking).filter(
        RideBooking.id == ride_booking_id
    ).first()

    if not booking:
        raise HTTPException(404, "Ride booking not found")

    if not booking.passenger_phone:
        raise HTTPException(
            status_code=400,
            detail="Ride booking passenger_phone is NULL"
        )

    if booking.status == "completed":
        return {"alreadyCompleted": True, "message": "Ride already completed"}

    booking.status = "completed"
    db.commit()
    db.refresh(booking)

    coins = 25
    rupees = coins / 25

    credit = DCoinRedemption(
        phone_number=booking.passenger_phone,
        coins=coins,
        rupees=rupees,
        type="CREDIT",
        reason="Ride Completed Bonus"
    )

    db.add(credit)
    db.commit()

    return {"success": True, "coins": coins, "rupees": rupees}

@app.get("/api/v1/users/{user_id}/rating")
def get_user_rating(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return {
        "avg_rating": user.avg_rating,
        "total_ratings": user.total_ratings
    }

class LiveLocationPayload(BaseModel):
    contact_id: int
    lat: float
    lng: float

@app.post("/api/v1/live-location/update")
def update_live_location(payload: LiveLocationPayload, db: Session = Depends(get_db)):
    location = db.query(LiveLocation).filter(LiveLocation.contact_id == payload.contact_id).first()
    if location:
        location.lat = payload.lat
        location.lng = payload.lng
        location.updated_at = datetime.utcnow()
    else:
        location = LiveLocation(
            contact_id=payload.contact_id,
            lat=payload.lat,
            lng=payload.lng,
            updated_at=datetime.utcnow(),
        )
        db.add(location)
    db.commit()
    return {"success": True, "contact_id": payload.contact_id, "lat": payload.lat, "lng": payload.lng}

# =========================
# IMPORT AND INCLUDE ROUTERS
# =========================
from drivve_api.otp import router as otp_router
from drivve_api.accountmanagement import router as account_router
from drivve_api.blocked_users import router as blocked_users_router
from drivve_api.dcoins import router as dcoins_router
from drivve_api.document import router as document_router
from drivve_api.emergency_contact import router as emergency_router
from drivve_api.faq import router as faq_router
from drivve_api.feedback import router as feedback_router
from drivve_api.loginactivity import router as login_activity_router
from drivve_api.matching_preference import router as matching_router
from drivve_api.notification import router as notification_router
from drivve_api.promotions import router as promotions_router
from drivve_api.rewards import router as rewards_router
from drivve_api.ridefeedback import router as ride_feedback_router
from drivve_api.savedaddress import router as saved_address_router
from drivve_api.securitysetting import router as security_router
from drivve_api.shareapp import router as share_router
from drivve_api.usernotification import router as user_notification_router
from drivve_api.vehicles import router as vehicles_router
from drivve_api.about_us import router as about_router
from drivve_api.createprofile import router as createprofile_router
from drivve_api.myprofile import router as profile_router
from drivve_api.chat import router as chat_router
from drivve_api.chat_socket import socket_app
from routers import ride_session
from routers.routes import router as riderrouter
from routers.ride import router as ridesrouter
from routers.my_rides import router as myrides_router
from routers.ride_feedback import router as ride_feedback_router_new
from routers.modification import router as modification_router

app.include_router(otp_router)
app.include_router(account_router)
app.include_router(blocked_users_router)
app.include_router(dcoins_router)
app.include_router(document_router)
app.include_router(emergency_router)
app.include_router(faq_router)
app.include_router(feedback_router)
app.include_router(login_activity_router)
app.include_router(matching_router)
app.include_router(notification_router)
app.include_router(promotions_router)
app.include_router(rewards_router)
app.include_router(ride_feedback_router)
app.include_router(saved_address_router)
app.include_router(security_router)
app.include_router(share_router)
app.include_router(user_notification_router)
app.include_router(vehicles_router)
app.include_router(about_router)
app.include_router(createprofile_router)
app.include_router(profile_router)
app.include_router(chat_router)
app.include_router(riderrouter)
app.include_router(ridesrouter)
app.include_router(myrides_router)
app.include_router(ride_session.router)
app.include_router(ride_feedback_router_new)
app.include_router(modification_router)

# Mount Socket.IO ASGI app
app.mount("/socket.io", socket_app)

# =========================
# POSTGIS SETUP FUNCTION
# =========================
from sqlalchemy import text

def setup_postgis_and_ride_columns():
    try:
        with engine.begin() as conn:
            print("🚀 Running PostGIS setup...")
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            print("✅ PostGIS extension checked")

            conn.execute(text("ALTER TABLE rides ADD COLUMN IF NOT EXISTS route_coordinates JSONB"))
            print("✅ route_coordinates checked")

            conn.execute(text("ALTER TABLE rides ADD COLUMN IF NOT EXISTS origin_lon DOUBLE PRECISION"))
            print("✅ origin_lon checked")

            conn.execute(text("ALTER TABLE rides ADD COLUMN IF NOT EXISTS origin_lat DOUBLE PRECISION"))
            print("✅ origin_lat checked")

            conn.execute(text("ALTER TABLE rides ADD COLUMN IF NOT EXISTS destination_lon DOUBLE PRECISION"))
            print("✅ destination_lon checked")

            conn.execute(text("ALTER TABLE rides ADD COLUMN IF NOT EXISTS destination_lat DOUBLE PRECISION"))
            print("✅ destination_lat checked")

            conn.execute(text("ALTER TABLE rides ADD COLUMN IF NOT EXISTS route_line geometry(LineString, 4326)"))
            print("✅ route_line checked")

            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_rides_route_line_gist ON rides USING GIST (route_line)"))
            print("✅ route_line index checked")

            # Add missing columns for ride sessions if not exist
            conn.execute(text("ALTER TABLE ride_sessions ADD COLUMN IF NOT EXISTS current_lat DOUBLE PRECISION"))
            conn.execute(text("ALTER TABLE ride_sessions ADD COLUMN IF NOT EXISTS current_lng DOUBLE PRECISION"))
            conn.execute(text("ALTER TABLE ride_sessions ADD COLUMN IF NOT EXISTS sos_active BOOLEAN DEFAULT FALSE"))
            conn.execute(text("ALTER TABLE ride_sessions ADD COLUMN IF NOT EXISTS emergency_stop_active BOOLEAN DEFAULT FALSE"))
            conn.execute(text("ALTER TABLE ride_sessions ADD COLUMN IF NOT EXISTS emergency_note TEXT"))
            print("✅ Ride session columns checked")

            # Add missing columns for ride_session_riders
            conn.execute(text("ALTER TABLE ride_session_riders ADD COLUMN IF NOT EXISTS pickup_lat DOUBLE PRECISION"))
            conn.execute(text("ALTER TABLE ride_session_riders ADD COLUMN IF NOT EXISTS pickup_lng DOUBLE PRECISION"))
            conn.execute(text("ALTER TABLE ride_session_riders ADD COLUMN IF NOT EXISTS dropoff_lat DOUBLE PRECISION"))
            conn.execute(text("ALTER TABLE ride_session_riders ADD COLUMN IF NOT EXISTS dropoff_lng DOUBLE PRECISION"))
            conn.execute(text("ALTER TABLE ride_session_riders ADD COLUMN IF NOT EXISTS driver_rating INTEGER"))
            conn.execute(text("ALTER TABLE ride_session_riders ADD COLUMN IF NOT EXISTS driver_feedback TEXT"))
            conn.execute(text("ALTER TABLE ride_session_riders ADD COLUMN IF NOT EXISTS rider_rating INTEGER"))
            conn.execute(text("ALTER TABLE ride_session_riders ADD COLUMN IF NOT EXISTS rider_feedback TEXT"))
            print("✅ Ride session riders columns checked")

            # Add indexes for better performance
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_ride_sessions_ride_id ON ride_sessions(ride_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_ride_sessions_driver_phone ON ride_sessions(driver_phone)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_ride_session_riders_session_id ON ride_session_riders(session_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_ride_session_riders_booking_id ON ride_session_riders(booking_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_modification_requests_booking_id ON modification_requests(booking_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_modification_requests_status ON modification_requests(status)"))
            print("✅ Database indexes checked")

    except Exception as e:
        print("❌ PostGIS setup failed:", str(e))

# =========================
# RUN THE APP
# =========================
if __name__ == "__main__":
    print("🚀 Starting DRIVVE Server...")
    print("🌐 Network accessible on:")
    print("   - http://localhost:8000")
    print("=" * 60)
   
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        access_log=True
    )