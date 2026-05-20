# =========================
# STANDARD LIBRARIES
# =========================
from datetime import datetime, timezone, UTC

# =========================
# FASTAPI & RELATED
# =========================
from fastapi import (
    Depends,
    HTTPException,
)
# =========================
# DATABASE & SQLALCHEMY
# =========================
from sqlalchemy.orm import Session
import uvicorn

from drivve_api.app_config import create_app
from drivve_api.createprofile import EMAIL_USER
from database import engine, get_db, Base

# =========================
# MODELS
# =========================
from models import (
    User,
    RideBooking,
    LiveLocation,
    DCoinRedemption,
)

# =========================
# SCHEMAS & VALIDATION
# =========================
from pydantic import BaseModel, EmailStr

# =========================
# SECURITY
# =========================

# =========================
# ENV CONFIG
# =========================
from dotenv import load_dotenv

load_dotenv()


app = create_app()


# Create tables
try:
    print("🏗️ Setting up database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables ready!")
except Exception as e:
    print(f"⚠️ Database setup warning: {e}")


@app.get("/")
async def root():
    return {
        "message": "DRIVVE API v2.0.1 - Working! 🚀",
        "status": "active",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "network": "accessible",
        "endpoints": [
            "/health - Server health"
            
        ]
    }


@app.get("/health")
async def health_check():
    try:
        return {
            "status": "healthy ✅",
            "version": "2.0.1",
            "timestamp":datetime.now(timezone.utc).isoformat(),
            "server": "FastAPI Running",
            "network": "accessible on 0.0.0.0:8000",
            "database": "connected",
            "email_service": "configured" if EMAIL_USER != "your-email@gmail.com" else "not configured",
            "message": "All systems operational"
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

    print("🚦 COMPLETE RIDE CALLED WITH:", data)

    if not ride_booking_id:
        raise HTTPException(400, "ride_booking_id required")

    booking = db.query(RideBooking).filter(
        RideBooking.id == ride_booking_id
    ).first()

    print("📦 BOOKING FOUND:", booking)

    if not booking:
        raise HTTPException(404, "Ride booking not found")

    print("📞 BOOKING PHONE:", booking.phone_number)
    print("📌 BOOKING STATUS:", booking.status)

    if not booking.phone_number:
        raise HTTPException(
            status_code=400,
            detail="Ride booking phone_number is NULL"
        )

    if booking.status == "completed":
        return {
            "alreadyCompleted": True,
            "message": "Ride already completed"
        }

    # STEP 1: MARK COMPLETED
    booking.status = "completed"
    db.commit()
    db.refresh(booking)

    print("✅ RIDE MARKED COMPLETED")

    # STEP 2: CREDIT WALLET
    coins = 25
    rupees = coins / 25

    credit = DCoinRedemption(
        phone_number=booking.phone_number,
        coins=coins,
        rupees=rupees,
        type="CREDIT",
        reason="Ride Completed Bonus"
    )

    db.add(credit)
    db.commit()
    db.refresh(credit)

    print("💰 DCOIN INSERTED:", credit.id)

    return {
        "success": True,
        "coins": coins,
        "rupees": rupees
    }


class SupportEmailRequest(BaseModel):
    email: EmailStr
    message: str
#admin

# @app.post("/api/v1/support/email")
# async def send_support_email(data: SupportEmailRequest):
#     try:
#         await send_email(
#             to_email="support@drivve.com",
#             otp=f"Support Request\n\nFrom: {data.email}\n\n{data.message}"
#         )
#         return {
#             "success": True,
#             "message": "Support request sent successfully"
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


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
def update_live_location(
    payload: LiveLocationPayload,
    db: Session = Depends(get_db)
):
    location = (
        db.query(LiveLocation)
        .filter(LiveLocation.contact_id == payload.contact_id)
        .first()
    )

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

    return {
        "success": True,
        "contact_id": payload.contact_id,
        "lat": payload.lat,
        "lng": payload.lng,
    }

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

# Mount Socket.IO ASGI app at /socket.io/
app.mount("/socket.io", socket_app)
from fastapi.staticfiles import StaticFiles
from routers.routes import router as riderrouter
from routers.routes import router as routes_router

from routers.ride import router as ridesrouter
from routers.my_rides import router as myrides_router
app.include_router(riderrouter)
app.include_router(routes_router)
app.include_router(ridesrouter)
app.include_router(myrides_router)



from sqlalchemy import text
from database import engine

def setup_postgis_and_ride_columns():
    try:
        with engine.begin() as conn:
            print("🚀 Running PostGIS setup...")

            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            print("✅ PostGIS extension checked")

            conn.execute(text("""
                ALTER TABLE rides
                ADD COLUMN IF NOT EXISTS route_coordinates JSONB
            """))
            print("✅ route_coordinates checked")

            conn.execute(text("""
                ALTER TABLE rides
                ADD COLUMN IF NOT EXISTS origin_lon DOUBLE PRECISION
            """))
            print("✅ origin_lon checked")

            conn.execute(text("""
                ALTER TABLE rides
                ADD COLUMN IF NOT EXISTS origin_lat DOUBLE PRECISION
            """))
            print("✅ origin_lat checked")

            conn.execute(text("""
                ALTER TABLE rides
                ADD COLUMN IF NOT EXISTS destination_lon DOUBLE PRECISION
            """))
            print("✅ destination_lon checked")

            conn.execute(text("""
                ALTER TABLE rides
                ADD COLUMN IF NOT EXISTS destination_lat DOUBLE PRECISION
            """))
            print("✅ destination_lat checked")

            conn.execute(text("""
                ALTER TABLE rides
                ADD COLUMN IF NOT EXISTS route_line geometry(LineString, 4326)
            """))
            print("✅ route_line checked")

            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_rides_route_line_gist
                ON rides
                USING GIST (route_line)
            """))
            print("✅ route_line index checked")

    except Exception as e:
        print("❌ PostGIS setup failed:", str(e))


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     print("🚀 App startup: initializing resources...")
#     setup_postgis_and_ride_columns()
#     yield
#     print("🛑 App shutdown: cleanup complete")

# app = FastAPI(
#     title="DRIVVE API Working",
#     description="DRIVVE Carpooling API",
#     version="2.0.1"
# )

if __name__ == "__main__":
    print("🚀 Starting DRIVVE Working Server...")
    print("🌐 Network accessible on:")
    print("   - http://localhost:8000")

    print("=" * 60)
   
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        access_log=True
    )
