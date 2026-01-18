import shutil
from sqlite3 import Date
from fastapi import FastAPI, Depends, HTTPException, Query, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from flask import json
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import UTC, datetime, timedelta, timezone
from pydantic import BaseModel, EmailStr
import random
import string
import uvicorn
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os
from typing import Any, Dict

from fastapi import Depends, HTTPException, UploadFile, File, Form

# Import your existing modules
from database import SessionLocal, engine, get_db, Base
from models import  AccountDeactivation, ActivityLog, City, DocumentType, FeedbackType, PromotionRedemption, Ride, RideFeedback, State, User, OTPVerification, UserFeedback, UserStatus, SavedAddress, ShareActivity, UserType, Vehicle,EmergencyContact,Promotion
from user_id_generator import generate_user_id
from models import ShareActivity,DocumentStatus, VerificationLog,DCoinRedemption,RideRewardMaster,RideBooking,RideReward,FAQ,AboutUs,MatchingPreferenceUser,MatchingPreferenceMaster,DocumentVerification
from utils.redeem_code import generate_redeem_code
from sqlalchemy import func  # <-- For aggregate functions
load_dotenv()




# Create FastAPI app
app = FastAPI(
    title="DRIVVE API Working",
    description="DRIVVE Carpooling API",
    version="2.0.1"
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create tables
try:
    print("🏗️ Setting up database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables ready!")
except Exception as e:
    print(f"⚠️ Database setup warning: {e}")


# ========================= EMAIL OTP CONFIGURATION =========================


# Email configuration (set these in environment variables)
EMAIL_USER = os.getenv("EMAIL_USER", "your-email@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "your-app-password")
EMAIL_FROM = os.getenv("EMAIL_FROM", "DRIVVE <noreply@drivve.com>")


# In-memory storage for email OTPs
email_otp_store: Dict[str, Dict] = {}


# Pydantic models for email OTP
class EmailOTPRequest(BaseModel):
    email: EmailStr


class EmailOTPVerify(BaseModel):
    email: EmailStr
    otp: str


def generate_otp():
    return ''.join(random.choices(string.digits, k=6))


def get_email_html(otp: str) -> str:
    """Generate beautiful email HTML"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #0B4A8F 0%, #1565C0 100%); padding: 30px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">DRIVVE</h1>
                                <p style="color: #E3F2FD; margin: 10px 0 0 0; font-size: 14px;">Email Verification</p>
                            </td>
                        </tr>
                       
                        <!-- Body -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email</h2>
                                <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                                    Thank you for registering with DRIVVE! Please use the verification code below:
                                </p>
                               
                                <!-- OTP Box -->
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center" style="padding: 20px; background-color: #F5F5F5; border-radius: 8px;">
                                            <h1 style="color: #0B4A8F; font-size: 42px; letter-spacing: 8px; margin: 0;">{otp}</h1>
                                        </td>
                                    </tr>
                                </table>
                               
                                <p style="color: #999999; font-size: 14px; margin: 30px 0 0 0; line-height: 20px;">
                                    This code will expire in <strong>5 minutes</strong>.<br>
                                    If you didn't request this, please ignore this email.
                                </p>
                            </td>
                        </tr>
                       
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #F9F9F9; padding: 20px 30px; text-align: center; border-top: 1px solid #EEEEEE;">
                                <p style="color: #999999; font-size: 12px; margin: 0;">
                                    © 2025 DRIVVE. All rights reserved.<br>
                                    This is an automated message, please do not reply.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


async def send_email(to_email: str, otp: str):
    """Send email using aiosmtplib"""
    message = MIMEMultipart("alternative")
    message["From"] = EMAIL_FROM
    message["To"] = to_email
    message["Subject"] = "DRIVVE - Email Verification Code"
   
    html_part = MIMEText(get_email_html(otp), "html")
    message.attach(html_part)
   
    try:
        await aiosmtplib.send(
            message,
            hostname="smtp.gmail.com",
            port=587,
            username=EMAIL_USER,
            password=EMAIL_PASSWORD,
            start_tls=True,
        )
        print(f"✅ Email sent successfully to {to_email}")
    except Exception as e:
        print(f"❌ Email send error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send email: {str(e)}"
        )


def cleanup_expired_email_otps():
    """Remove expired OTPs"""
    current_time = datetime.now(timezone.utc)

    expired = [email for email, data in email_otp_store.items()
               if current_time > data["expires_at"]]
    for email in expired:
        del email_otp_store[email]
        print(f"🗑️ Cleaned up expired OTP for {email}")


# ========================= EXISTING ENDPOINTS (keep as is) =========================


@app.get("/")
async def root():
    return {
        "message": "DRIVVE API v2.0.1 - Working! 🚀",
        "status": "active",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "network": "accessible",
        "endpoints": [
            "/health - Server health",
            "/docs - API documentation",
            "/api/send-otp - Send phone OTP",
            "/api/verify-otp - Verify phone OTP",
            "/api/v1/users/check - Check user exists",
            "/api/v1/users/create - Create user profile",
            "/auth/send-email-otp - Send email OTP",
            "/auth/verify-email-otp - Verify email OTP"
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

def normalize_phone(phone: str) -> str:
    phone = phone.replace(" ", "").replace("-", "")
    if phone.startswith("+"):
        return phone
    if phone.startswith("91") and len(phone) == 12:
        return f"+{phone}"
    return f"+91{phone}"

from datetime import datetime, timedelta, UTC
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session

@app.post("/api/send-otp")
async def send_otp(phone_data: dict, db: Session = Depends(get_db)):

    try:
        phone_number = normalize_phone(phone_data.get("phone_number"))

        if not phone_number:
            raise HTTPException(status_code=400, detail="Phone number required")

        # ✅ OPTIONAL: invalidate old OTPs
        db.query(OTPVerification).filter(
            OTPVerification.phone_number == phone_number,
            OTPVerification.is_verified.is_(False)
        ).update({"is_verified": True})

        # ✅ generate OTP
        otp_code = "123456"
        expires_at = datetime.now(UTC) + timedelta(minutes=10)

        otp_entry = OTPVerification(
            phone_number=phone_number,
            otp_code=otp_code,
            expires_at=expires_at,
            is_verified=False,
            created_at=datetime.now(timezone.utc)   # ✅ REQUIRED

        )

        db.add(otp_entry)
        db.commit()            # 🔴 COMMIT IS REQUIRED
        db.refresh(otp_entry)

        print("✅ OTP SAVED IN DB")
        print("📞 Phone:", phone_number)
        print("🔢 OTP:", otp_code)
        print("⏳ Expires:", expires_at.isoformat())

        return {
            "success": True,
            "otp": otp_code,          # ⚠️ dev only
            "phone_number": phone_number,
            "expires_at": expires_at.isoformat()
        }

    except Exception as e:
        db.rollback()
        print("❌ SEND OTP ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/verify-otp")
def verify_otp(payload: dict, db: Session = Depends(get_db)):

    phone = normalize_phone(payload.get("phone_number"))
    otp_code = payload.get("otp_code")

    if not phone or not otp_code:
        raise HTTPException(400, "Phone number and OTP required")

    device_name = payload.get("device_name")
    device_type = payload.get("device_type")

    now = datetime.now(timezone.utc)

    print("🔍 VERIFY PAYLOAD:", payload)
    print("📞 Phone:", phone)
    print("🔢 OTP:", otp_code)
    print("⏰ Now:", now.isoformat())

    # ✅ CORRECT QUERY (expiry handled in SQL)
    otp = db.query(OTPVerification).filter(
        OTPVerification.phone_number == phone,
        OTPVerification.otp_code == otp_code,
        OTPVerification.is_verified.is_(False),
        OTPVerification.expires_at > now
    ).order_by(OTPVerification.created_at.desc()).first()

    if not otp:
        raise HTTPException(400, "Invalid or expired OTP")

    # ✅ mark OTP as used
    otp.is_verified = True

    # ✅ update user if exists
    user = db.query(User).filter(User.phone_number == phone).first()
    if user:
        user.is_phone_verified = True
        user.status = UserStatus.ACTIVE

    db.commit()
    db.refresh(otp)

    # ✅ register device (optional)
   # ✅ REGISTER DEVICE (FIXED)
    if device_name and device_type:
        # 1️⃣ Clear previous active devices
        db.query(UserDevice).filter(
            UserDevice.phone_number == phone
        ).update({UserDevice.is_current: False})

        # 2️⃣ Register / update device
        device = db.query(UserDevice).filter_by(
            phone_number=phone,
            device_name=device_name,
            device_type=device_type
        ).first()

        if device:
            device.is_current = True
            device.last_active = datetime.now(timezone.utc)
        else:
            device = UserDevice(
                phone_number=phone,
                device_name=device_name,
                device_type=device_type,
                is_current=True,
                last_active=datetime.now(timezone.utc)
            )
            db.add(device)

        db.commit()

    print("✅ OTP VERIFIED")
    print("📱 Device:", device_name, device_type)

    return {
        "success": True,
        "message": "OTP verified successfully"
    }



from datetime import datetime, timedelta
from datetime import datetime, timedelta
from datetime import datetime, timedelta
from fastapi import HTTPException

@app.post("/api/v1/users/check")
def check_user_exists(user_check: dict, db: Session = Depends(get_db)):
    try:
        phone_number = user_check.get("phone_number")

        if not phone_number:
            raise HTTPException(status_code=400, detail="Phone number required")

        clean_phone = phone_number.replace("+91", "").replace("+", "")

        user = db.query(User).filter(
            (User.phone_number == phone_number) |
            (User.phone_number == clean_phone) |
            (User.phone_number == f"+91{clean_phone}")
        ).first()

        if not user or not user.profile_completed:
            return {"exists": False, "user_data": None}

        # 🔹 Check deactivation
        deactivation = db.query(AccountDeactivation).filter(
            AccountDeactivation.phone_number == user.phone_number,
            AccountDeactivation.is_deactivated == True
        ).first()

        if deactivation:
            days_passed = (datetime.now(timezone.utc) - deactivation.created_at).days

            # ❌ After 30 days → block login
            if days_passed >= 30:
                return {
                    "exists": False,
                    "blocked": True,
                    "message": "Account permanently deleted after 30 days"
                }

            # ✅ Reactivate if login within 30 days
            user.status = UserStatus.ACTIVE
            user.updated_at = datetime.now(timezone.utc)


            db.delete(deactivation)
            db.commit()

        return {
            "exists": True,
            "user_data": {
                "id": user.id,
                "user_id": user.user_id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone_number": user.phone_number,
                "profile_completed": user.profile_completed,
                "status": user.status.value if user.status else "active"
            }
        }

    except Exception as e:
        print("❌ USERS CHECK ERROR:", str(e))
        raise HTTPException(status_code=500, detail="User check failed")




@app.post("/api/v1/users/create")
async def create_user_profile(profile_data: dict, db: Session = Depends(get_db)):
    """Create complete user profile"""
    try:
        phone_number = profile_data.get("phone_number")
        first_name = profile_data.get("first_name")
        last_name = profile_data.get("last_name")
       
        if not phone_number or not first_name:
            raise HTTPException(status_code=400, detail="Phone number and first name required")
       
        user = db.query(User).filter(User.phone_number == phone_number).first()
        # If user doesn't exist (e.g., phone was verified via Firebase), create a skeleton user
        if not user:
            user = User(
                phone_number=phone_number,
                country_code=profile_data.get("country_code", "+91"),
                is_phone_verified=True,
                status=UserStatus.PENDING,
                profile_completed=False
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        custom_user_id = generate_user_id(first_name, last_name, phone_number)
       
        user.user_id = custom_user_id
        user.first_name = first_name
        user.last_name = last_name
        user.full_name = f"{first_name} {last_name or ''}".strip()
        user.email = profile_data.get("email")
        user.email_verified = profile_data.get("email_verified", False)
        user.date_of_birth = profile_data.get("date_of_birth")
        user.gender = profile_data.get("gender")
        user.state = profile_data.get("state")
        user.city = profile_data.get("city")
        user.referral_code = profile_data.get("referral_code")
        user.profile_picture = profile_data.get("profile_image")
        user.avatar = profile_data.get("avatar")
        user.profile_completed = True
        user.status = UserStatus.ACTIVE
        user.updated_at =datetime.now(timezone.utc)

       
        db.commit()
        db.refresh(user)
       
        return {
            "success": True,
            "message": f"Profile created successfully ✅",
            "user_id": custom_user_id,
            "user_data": {
                "id": user.id,
                "user_id": user.user_id,
                "phone_number": user.phone_number,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "profile_completed": user.profile_completed,
                "status": user.status.value
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Profile creation failed: {str(e)}")


# ========================= EMAIL OTP ENDPOINTS (UPDATED) =========================


@app.post("/auth/send-email-otp")
async def send_email_otp(request: EmailOTPRequest):
    """Send OTP to email address"""
    try:
        cleanup_expired_email_otps()
       
        email = request.email.lower()
        otp = generate_otp()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
       
        # Store OTP
        email_otp_store[email] = {
            "otp": otp,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc)

        }
       
        # Send email
        await send_email(email, otp)
       
        print(f"✅ Email OTP sent to {email}: {otp}")
       
        return {
            "success": True,
            "message": "Verification code sent to your email"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Send email OTP error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to send verification email. Please try again."
        )


@app.post("/auth/verify-email-otp")
async def verify_email_otp(request: EmailOTPVerify):
    """Verify email OTP"""
    try:
        email = request.email.lower()
        otp = request.otp.strip()
       
        if email not in email_otp_store:
            raise HTTPException(
                status_code=404,
                detail="OTP not found. Please request a new code."
            )
       
        stored_data = email_otp_store[email]
       
        if datetime.now(timezone.utc) > stored_data["expires_at"]:
            del email_otp_store[email]
            raise HTTPException(
                status_code=410,
                detail="OTP has expired. Please request a new code."
            )
       
        if stored_data["otp"] != otp:
            raise HTTPException(
                status_code=400,
                detail="Invalid verification code. Please try again."
            )
       
        del email_otp_store[email]
       
        print(f"✅ Email verified successfully: {email}")
       
        return {
            "success": True,
            "message": "Email verified successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Verify email OTP error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Email verification failed. Please try again."
        )
@app.get("/api/v1/users/profile")
async def get_user_profile(phone_number: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == phone_number).first()

    if not user:
        return {
            "success": False,
            "message": "User not found"
        }

  

    return {
        "success": True,
        "user": {
            "phone_number": user.phone_number,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "full_name": user.full_name,
            "email": user.email,
            "gender": user.gender,
            "date_of_birth": user.date_of_birth.isoformat() if user.date_of_birth else None,
            "state": user.state,
            "city": user.city,
            "profile_picture": user.profile_picture,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "bio": user.bio,
        }
    }

from typing import Optional
from pydantic import BaseModel

class UpdateProfileRequest(BaseModel):
    phone_number: str
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str]
    gender: Optional[str]
    date_of_birth: Optional[str]
    state: Optional[str]
    city: Optional[str]
    bio: Optional[str]

@app.put("/api/v1/users/profile")
async def update_user_profile(data: UpdateProfileRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == data.phone_number).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    payload = data.dict(exclude_unset=True)

    # Simple fields
    for field in ["first_name", "last_name", "email", "gender", "state", "city","bio"]:
        if payload.get(field) is not None:
            setattr(user, field, payload[field])

    # Full name auto-sync
    if payload.get("first_name") or payload.get("last_name"):
        user.full_name = f"{user.first_name or ''} {user.last_name or ''}".strip()

    # Date of birth
    if payload.get("date_of_birth"):
        user.date_of_birth = datetime.strptime(payload["date_of_birth"], "%Y-%m-%d")

    # ✅ BIO (FIXED)
    if payload.get("bio") is not None:
        user.bio = payload["bio"]

    user.updated_at = datetime.now(timezone.utc)

    db.commit()

    return {"success": True, "message": "Profile updated successfully"}

from pydantic import BaseModel
from models import ShareActivity

class ShareRequest(BaseModel):
    phone_number: str
    referral_code: str

from models import DCoinRedemption

@app.post("/api/v1/referral/share")
async def record_share(data: ShareRequest, db: Session = Depends(get_db)):

    record = db.query(ShareActivity).filter(
        ShareActivity.phone_number == data.phone_number,
        ShareActivity.referral_code == data.referral_code
    ).first()

    if record:
        record.share_count += 1
    else:
        record = ShareActivity(
            phone_number=data.phone_number,
            referral_code=data.referral_code,
            share_count=1
        )
        db.add(record)

    # ✅ ADD CREDIT ENTRY
    credit = DCoinRedemption(
        phone_number=data.phone_number,
        coins=25,
        rupees=1,
        type="CREDIT",
        reason="Referral Share Bonus"
    )
    db.add(credit)

    db.commit()

    return {
        "success": True,
        "message": "Share recorded successfully",
        "share_count": record.share_count
    }

# @app.post("/api/v1/referral/share")
# async def record_share(data: ShareRequest, db: Session = Depends(get_db)):
#     """
#     Record each share action
#     - Increment share_count if user already shared
#     - Otherwise create new record
#     """
#     record = db.query(ShareActivity).filter(
#         ShareActivity.phone_number == data.phone_number,
#         ShareActivity.referral_code == data.referral_code
#     ).first()

#     if record:
#         record.share_count += 1
#         record.updated_at = datetime.utcnow()
#     else:
#         record = ShareActivity(
#             phone_number=data.phone_number,
#             referral_code=data.referral_code,
#             share_count=1
#         )
#         db.add(record)

#     db.commit()

#     return {
#         "success": True,
#         "message": "Share recorded successfully",
#         "share_count": record.share_count
#     }
@app.get("/api/v1/referral/stats")
async def referral_stats(phone_number: str, db: Session = Depends(get_db)):
    record = db.query(ShareActivity).filter(
        ShareActivity.phone_number == phone_number
    ).first()

    if not record:
        return {"share_count": 0}

    return {
        "share_count": record.share_count,
        "last_shared_at": record.updated_at
    }
@app.get("/api/v1/addresses")
def get_addresses(phone_number: str, db: Session = Depends(get_db)):
    return db.query(SavedAddress).filter(
        SavedAddress.phone_number == phone_number
    ).order_by(SavedAddress.is_default.desc()).all()
@app.post("/api/v1/addresses")
def save_address(data: dict, db: Session = Depends(get_db)):
    if data.get("is_default"):
        db.query(SavedAddress).filter(
            SavedAddress.phone_number == data["phone_number"]
        ).update({"is_default": False})

    address = SavedAddress(**data)
    db.add(address)
    db.commit()
    db.refresh(address)
    return address
@app.put("/api/v1/addresses/{address_id}")
def update_address(address_id: int, data: dict, db: Session = Depends(get_db)):
    address = db.query(SavedAddress).filter(
        SavedAddress.id == address_id
    ).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    # ✅ Update ALL fields
    for field in [
        "label",
        "type",
        "full_address",
        "house",
        "area",
        "instructions",
        "is_default",
    ]:
        if field in data:
            setattr(address, field, data[field])

    db.commit()
    db.refresh(address)

    return address

@app.delete("/api/v1/addresses/{address_id}")
def delete_address(address_id: int, db: Session = Depends(get_db)):
    address = db.query(SavedAddress).filter(SavedAddress.id == address_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    db.delete(address)
    db.commit()
    return {"success": True}


UPLOAD_DIR = "uploads/vehicles"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ===================== GET =====================
@app.get("/api/v1/vehicles")
def get_vehicles(phone_number: str, db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle)\
        .filter(Vehicle.phone_number == phone_number)\
        .order_by(Vehicle.created_at.desc())\
        .all()

    return {"vehicles": jsonable_encoder(vehicles)}

# ===================== ADD =====================
@app.post("/api/v1/vehicles")
async def add_vehicle(
    phone_number: str = Form(...),
    vehicle_type: str = Form(...),
    body_type: str = Form(...),
    fuel_type: str = Form(...),
    make: str = Form(...),
    model: str = Form(...),
    year: int = Form(...),
    registration_number: str = Form(...),
    color: str = Form(None),
    max_seats: int = Form(...),
    notes: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    photo_path = None
    if photo:
        filename = f"{phone_number}_{registration_number}.jpg"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(photo.file, f)
        photo_path = f"uploads/vehicles/{filename}"

    vehicle = Vehicle(
        phone_number=phone_number,
        vehicle_type=vehicle_type,
        body_type=body_type,
        fuel_type=fuel_type,
        make=make,
        model=model,
        year=year,
        registration_number=registration_number,
        color=color,
        max_seats=max_seats,
        notes=notes,
        photo_url=photo_path,
    )

    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)

    return {"success": True}

# ===================== UPDATE =====================
@app.put("/api/v1/vehicles/{vehicle_id}")
async def update_vehicle(
    vehicle_id: int,
    phone_number: str = Form(...),
    vehicle_type: str = Form(...),
    body_type: str = Form(...),
    fuel_type: str = Form(...),
    make: str = Form(...),
    model: str = Form(...),
    year: int = Form(...),
    registration_number: str = Form(...),
    color: str = Form(None),
    max_seats: int = Form(...),
    notes: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")

    if photo:
        filename = f"{phone_number}_{registration_number}.jpg"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(photo.file, f)
        vehicle.photo_url = f"uploads/vehicles/{filename}"

    vehicle.phone_number = phone_number
    vehicle.vehicle_type = vehicle_type
    vehicle.body_type = body_type
    vehicle.fuel_type = fuel_type
    vehicle.make = make
    vehicle.model = model
    vehicle.year = year
    vehicle.registration_number = registration_number
    vehicle.color = color
    vehicle.max_seats = max_seats
    vehicle.notes = notes

    db.commit()
    return {"success": True}

# ===================== DELETE =====================
@app.delete("/api/v1/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")

    db.delete(vehicle)
    db.commit()
    return {"success": True}
def seed_emergency_contacts(db):
    defaults = [
        {
            "contact_name": "Women Helpline",
            "contact_number": "181"
        },
        {
            "contact_name": "Emergency (Govt)",
            "contact_number": "112"
        }
    ]

    for d in defaults:
        exists = db.query(EmergencyContact).filter(
            EmergencyContact.contact_number == d["contact_number"],
            EmergencyContact.is_system == True,
            EmergencyContact.is_deleted == False
        ).first()

        if not exists:
            db.add(EmergencyContact(
                phone_number="SYSTEM",
                contact_name=d["contact_name"],
                contact_number=d["contact_number"],
                is_system=True,
                share_live_location=False
            ))
def run_emergency_contact_seeder():
    db = SessionLocal()
    try:
        seed_emergency_contacts(db)
        db.commit()
        print("🚨 Emergency contacts seeded successfully")
    except Exception as e:
        db.rollback()
        print("❌ Emergency contact seeding failed:", str(e))
    finally:
        db.close()
@app.get("/api/v1/emergency-contacts")
def get_emergency_contacts(phone_number: str, db: Session = Depends(get_db)):
    system_contacts = db.query(EmergencyContact).filter(
        EmergencyContact.is_system == True,
        EmergencyContact.is_active == True,
        EmergencyContact.is_deleted == False
    ).all()

    user_contacts = db.query(EmergencyContact).filter(
        EmergencyContact.phone_number == phone_number,
        EmergencyContact.is_system == False,
        EmergencyContact.is_deleted == False
    ).all()

    return {
        "system": system_contacts,
        "user": user_contacts
    }

@app.post("/api/v1/emergency-contacts")
def add_emergency_contact(data: dict, db: Session = Depends(get_db)):
    phone = data.get("phone_number")

    count = db.query(EmergencyContact).filter(
        EmergencyContact.phone_number == phone,
        EmergencyContact.is_system == False,
        EmergencyContact.is_deleted == False
    ).count()

    if count >= 3:
        raise HTTPException(400, "Maximum 3 contacts allowed")

    contact = EmergencyContact(
        phone_number=phone,
        contact_name=data["contact_name"],
        contact_number=data["contact_number"],
        share_live_location=data.get("share_live_location", False),
        is_system=False
    )

    db.add(contact)
    db.commit()
    return {"success": True}
@app.put("/api/v1/emergency-contacts/{contact_id}")
def update_emergency_contact(
    contact_id: int,
    data: dict,
    phone_number: str,
    db: Session = Depends(get_db)
):
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id,
        EmergencyContact.phone_number == phone_number,
        EmergencyContact.is_system == False,
        EmergencyContact.is_deleted == False
    ).first()

    if not contact:
        raise HTTPException(403, "Not allowed")

    contact.contact_name = data.get("contact_name", contact.contact_name)
    contact.contact_number = data.get("contact_number", contact.contact_number)
    contact.share_live_location = data.get(
        "share_live_location",
        contact.share_live_location
    )

    db.commit()
    return {"success": True}
@app.delete("/api/v1/emergency-contacts/{contact_id}")
def delete_emergency_contact(
    contact_id: int,
    phone_number: str,
    db: Session = Depends(get_db)
):
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id,
        EmergencyContact.phone_number == phone_number,
        EmergencyContact.is_system == False,
        EmergencyContact.is_deleted == False
    ).first()

    if not contact:
        raise HTTPException(403, "Not allowed")

    contact.is_deleted = True
    db.commit()
    return {"success": True}

from datetime import date
from datetime import date
from fastapi.encoders import jsonable_encoder

@app.get("/api/v1/promotions")
def get_promotions(
    phone_number: str | None = None,
    db: Session = Depends(get_db)
):
    today = date.today()

    promotions = (
        db.query(Promotion)
        .filter(
            Promotion.is_active == True,
            Promotion.is_deleted == False,
            Promotion.valid_from <= today,
            Promotion.valid_till >= today
        )
        .order_by(Promotion.created_at.desc())
        .all()
    )

    # Hide redeemed promotions for same phone
    if phone_number:
        redeemed_ids = db.query(
            PromotionRedemption.promotion_id
        ).filter(
            PromotionRedemption.phone_number == phone_number
        ).all()

        redeemed_ids = {r.promotion_id for r in redeemed_ids}
        promotions = [p for p in promotions if p.id not in redeemed_ids]

    return {
        "promotions": jsonable_encoder(promotions)
    }
from datetime import datetime, timezone

@app.post("/api/v1/promotions/redeem")
def redeem_promotion(data: dict, db: Session = Depends(get_db)):
    promo_id = data.get("promo_id")
    phone_number = data.get("phone_number")

    if not promo_id or not phone_number:
        raise HTTPException(400, "promo_id and phone_number required")

    promo = db.query(Promotion).filter(
        Promotion.id == promo_id,
        Promotion.is_active == True,
        Promotion.is_deleted == False
    ).first()

    if not promo:
        raise HTTPException(404, "Promotion not found")

    already = db.query(PromotionRedemption).filter(
        PromotionRedemption.promotion_id == promo_id,
        PromotionRedemption.phone_number == phone_number
    ).first()

    if already:
        return {"alreadyRedeemed": True}

    redemption = PromotionRedemption(
        promotion_id=promo_id,
        phone_number=phone_number
    )

    db.add(redemption)
    db.commit()

    return {"success": True}


class PromotionCreate(BaseModel):
    company_name: str
    title: str
    description: str | None = None
    promo_code: str | None = None
    image_url: str | None = None
    valid_from: Date | None = None
    valid_till: Date | None = None

# @app.post("/api/v1/promotions")
# def add_promotion(data: PromotionCreate, db: Session = Depends(get_db)):
#     promo = Promotion(**data.dict())
#     db.add(promo)
#     db.commit()
#     db.refresh(promo)
#     return {"success": True, "promotion": promo}
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
# main.py

@app.post("/api/v1/dcoins/redeem")
def redeem_dcoins(data: dict, db: Session = Depends(get_db)):
    phone = data.get("phone_number")
    if not phone:
        raise HTTPException(400, "Phone number required")

    credits = db.query(DCoinRedemption).filter(
        DCoinRedemption.phone_number == phone,
        DCoinRedemption.type == "CREDIT"
    ).all()

    balance_coins = sum(r.coins for r in credits)

    if balance_coins <= 0:
        raise HTTPException(400, "Insufficient balance")

    redeem_code = generate_redeem_code()

    db.add(DCoinRedemption(
        phone_number=phone,
        coins=balance_coins,
        rupees=balance_coins // 25,
        type="DEBIT",
        reason="Wallet Redemption",
        redeem_code=redeem_code
    ))

    # RESET SHARE COUNT
    share = db.query(ShareActivity).filter(
        ShareActivity.phone_number == phone
    ).first()

    if share:
        share.share_count = 0
        share.updated_at = datetime.now(timezone.utc)

    db.commit()

    return {
        "success": True,
        "redeem_code": redeem_code,
        "coins": balance_coins,
        "rupees": balance_coins // 25
    }


@app.get("/api/v1/dcoins/history")
def dcoin_history(phone_number: str, db: Session = Depends(get_db)):
    rows = db.query(DCoinRedemption)\
        .filter(DCoinRedemption.phone_number == phone_number)\
        .order_by(DCoinRedemption.created_at.desc())\
        .all()

    return [
        {
            "id": r.id,
            "type": r.type,          # CREDIT / DEBIT
            "coins": r.coins,
            "rupees": r.rupees,
            "reason": r.reason,
            "redeem_code": r.redeem_code,
            "created_at": r.created_at
        }
        for r in rows
    ]
@app.get("/api/v1/rewards")
def get_rewards(phone_number: str, db: Session = Depends(get_db)):

    completed_bookings = db.query(RideBooking).filter(
         RideBooking.phone_number == phone_number,
        RideBooking.status == "completed"
    ).all()

    # 🔥 AUTO CREDIT HERE
    for booking in completed_bookings:
        credit_if_not_done(db, booking)

    completed_rides = len(completed_bookings)

    rewards = db.query(RideRewardMaster)\
        .filter(RideRewardMaster.is_active == True)\
        .order_by(RideRewardMaster.rides_required.asc())\
        .all()

    credited = db.query(RideReward.reward_id)\
        .filter(RideReward.phone_number == phone_number)\
        .all()

    credited_ids = {r.reward_id for r in credited}

    return {
        "completed_rides": completed_rides,
        "rewards": [
            {
                "id": r.id,
                "title": r.title,
                "rides_required": r.rides_required,
                "reward_points": r.reward_points,
            }
            for r in rewards
        ],
        "credited_rewards": list(credited_ids)
    }

@app.post("/api/v1/rewards/credit")
def credit_reward(data: dict, db: Session = Depends(get_db)):

    phone = data.get("phone_number")
    reward_id = data.get("reward_id")

    reward = db.query(RideRewardMaster).filter(
        RideRewardMaster.id == reward_id
    ).first()

    if not reward:
        raise HTTPException(404, "Reward not found")

    already = db.query(RideReward).filter(
        RideReward.phone_number == phone,
        RideReward.reward_id == reward_id
    ).first()

    if already:
        return {"alreadyCredited": True}

    # ✅ CREDIT WALLET
    wallet = DCoinRedemption(
        phone_number=phone,
        coins=reward.reward_points,
        rupees=reward.reward_points / 25,
        type="CREDIT",
        reason="Ride Reward"
    )

    credited = RideReward(
        phone_number=phone,
        reward_id=reward.id,
        coins=reward.reward_points
    )

    db.add(wallet)
    db.add(credited)
    db.commit()

    return {"success": True}
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
def credit_if_not_done(db: Session, booking: RideBooking):
    if not booking.phone_number:
        return

    already = db.query(DCoinRedemption).filter(
        DCoinRedemption.phone_number == booking.phone_number,
        DCoinRedemption.reason == f"Ride Completed Bonus #{booking.id}"
    ).first()

    if already:
        return

    coins = 25              # ✅ FIXED
    rupees = 1              # ✅ FIXED

    credit = DCoinRedemption(
        phone_number=booking.phone_number,
        coins=coins,
        rupees=rupees,
        type="CREDIT",
        reason=f"Ride Completed Bonus #{booking.id}"
    )

    db.add(credit)
    db.commit()
@app.get("/api/v1/support/faqs")
def get_faqs(
    category: str | None = None,
    db: Session = Depends(get_db)
):
    query = (
        db.query(FAQ)
        .filter(
            FAQ.is_active == True,
            FAQ.is_deleted == False
        )
    )

    if category:
        query = query.filter(FAQ.category == category)

    return [
        {
            "id": f.id,
            "category": f.category,
            "question": f.question,
            "answer": f.answer
        }
        for f in query.order_by(FAQ.id.asc()).all()
    ]


class SupportEmailRequest(BaseModel):
    email: EmailStr
    message: str
#admin
@app.get("/api/v1/admin/faqs")
def get_all_faqs(db: Session = Depends(get_db)):
    return (
        db.query(FAQ)
        .filter(FAQ.is_deleted == False)
        .order_by(FAQ.id.desc())
        .all()
    )
@app.post("/api/v1/admin/faqs/create")
def create_faq(payload: dict, db: Session = Depends(get_db)):
    faq = FAQ(
        category=payload["category"],
        question=payload["question"],
        answer=payload["answer"],
        is_active=True
    )
    db.add(faq)
    db.commit()
    db.refresh(faq)
    log_activity(
        db,
        module="FAQ",
        action="CREATE",
        entity_id=faq.id,
        entity_name=faq.question,
        description=f"FAQ '{faq.question}' created"
    )
    return {"success": True, "id": faq.id}
@app.post("/api/v1/admin/faqs/update")
def update_faq(payload: dict, db: Session = Depends(get_db)):
    faq = db.query(FAQ).filter(
        FAQ.id == payload["id"],
        FAQ.is_deleted == False
    ).first()

    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    faq.category = payload["category"]
    faq.question = payload["question"]
    faq.answer = payload["answer"]

    db.commit()
    log_activity(
        db,
        module="FAQ",
        action="UPDATE",
        entity_id=faq.id,
        entity_name=faq.question,
        description=f"FAQ '{faq.question}' updated"
    )

    return {"success": True}
@app.post("/api/v1/admin/faqs/status")
def change_faq_status(payload: dict, db: Session = Depends(get_db)):
    faq = db.query(FAQ).filter(
        FAQ.id == payload["id"],
        FAQ.is_deleted == False
    ).first()

    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    faq.is_active = payload["is_active"]
    db.commit()
    log_activity(
        db,
        module="FAQ",
        action="STATUS CHANGE",
        entity_id=faq.id,
        entity_name=faq.question,
        description=f"FAQ '{faq.question}' status changed to {'Active' if faq.is_active else 'Inactive'}"
    )

    return {
        "success": True,
        "id": faq.id,
        "is_active": faq.is_active
    }
@app.post("/api/v1/admin/faqs/delete")
def delete_faq(payload: dict, db: Session = Depends(get_db)):
    faq = db.query(FAQ).filter(
        FAQ.id == payload["id"],
        FAQ.is_deleted == False
    ).first()

    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    faq.is_deleted = True
    faq.is_active = False

    db.commit()
    log_activity(
        db,
        module="FAQ",
        action="DELETE",
        entity_id=faq.id,
        entity_name=faq.question,
        description=f"FAQ '{faq.question}' deleted"
    )

    return {"success": True}


@app.post("/api/v1/support/email")
async def send_support_email(data: SupportEmailRequest):
    try:
        await send_email(
            to_email="support@drivve.com",
            otp=f"Support Request\n\nFrom: {data.email}\n\n{data.message}"
        )
        return {
            "success": True,
            "message": "Support request sent successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/api/v1/support/faq-categories")
def get_faq_categories(db: Session = Depends(get_db)):
    categories = db.query(FAQ.category)\
        .filter(FAQ.is_active == True)\
        .distinct()\
        .order_by(FAQ.category.asc())\
        .all()

    return [c[0] for c in categories]
@app.get("/api/v1/about-us")
def get_about_us(db: Session = Depends(get_db)):
    records = (
        db.query(AboutUs)
        .filter(
            AboutUs.is_active == True,
            AboutUs.is_deleted == False
        )
        .order_by(AboutUs.sort_order.asc(), AboutUs.id.asc())
        .all()
    )

    return [
        {
            "id": r.id,
            "title": r.title,
            "content": r.content
        }
        for r in records
    ]

# ================= GET MASTER =================
@app.get("/api/v1/matching-preferences/master")
def get_matching_preference_master(db: Session = Depends(get_db)):
    return (
        db.query(MatchingPreferenceMaster)
        .filter(
            MatchingPreferenceMaster.is_deleted == False,
            MatchingPreferenceMaster.is_active == True
        )
        .order_by(MatchingPreferenceMaster.id.asc())
        .all()
    )


# ================= GET USER VALUES =================
@app.get("/api/v1/matching-preferences/user")
def get_user_matching_preferences(
    phone_number: str,
    db: Session = Depends(get_db)
):
    rows = db.query(MatchingPreferenceUser)\
        .filter(MatchingPreferenceUser.phone_number == phone_number)\
        .all()

    return {r.preference_key: r.value for r in rows}


# ================= SAVE / UPDATE =================
class MatchingPreferenceSave(BaseModel):
    phone_number: str
    preference_key: str
    value: Any


@app.post("/api/v1/matching-preferences/user")
def save_matching_preference(
    data: MatchingPreferenceSave,
    db: Session = Depends(get_db)
):
    row = db.query(MatchingPreferenceUser).filter(
        MatchingPreferenceUser.phone_number == data.phone_number,
        MatchingPreferenceUser.preference_key == data.preference_key
    ).first()

    if row:
        row.value = data.value
    else:
        row = MatchingPreferenceUser(
            phone_number=data.phone_number,
            preference_key=data.preference_key,
            value=data.value
        )
        db.add(row)

    db.commit()
    return {"success": True}

# ========================= DOCUMENT VERIFICATION SECTION =========================

# Add these imports at the top of your main.py
import shutil
import os
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, validator
import uuid
import traceback
from sqlalchemy import or_, and_, desc

# Import your models
from models import (
    DocumentVerification, DocumentType, DocumentStatus, 
    User, VerificationLog, AdminUser
)

# Document Upload Directories
UPLOAD_BASE_DIR = "uploads/documents"
DOCUMENT_FRONT_DIR = os.path.join(UPLOAD_BASE_DIR, "front")
DOCUMENT_BACK_DIR = os.path.join(UPLOAD_BASE_DIR, "back")
SELFIE_DIR = os.path.join(UPLOAD_BASE_DIR, "selfie")
os.makedirs(DOCUMENT_FRONT_DIR, exist_ok=True)
os.makedirs(DOCUMENT_BACK_DIR, exist_ok=True)
os.makedirs(SELFIE_DIR, exist_ok=True)

# File validation constants
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# ========================= HELPER FUNCTIONS =========================

async def validate_image_file(upload_file: UploadFile) -> bool:
    """Validate image file"""
    if not upload_file:
        return False
    
    # Check file size
    upload_file.file.seek(0, 2)  # Seek to end
    file_size = upload_file.file.tell()
    upload_file.file.seek(0)  # Reset to beginning
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Check file extension
    filename = upload_file.filename or ""
    file_extension = os.path.splitext(filename)[1].lower()
    
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check MIME type
    content_type = upload_file.content_type or ""
    if not content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is not an image"
        )
    
    return True

async def save_image(upload_file: UploadFile, image_type: str, 
                     doc_type: str, doc_number: str, 
                     timestamp: str, unique_id: str) -> str:
    """Save uploaded image and return stored filename"""
    if not upload_file:
        return None
    
    # Get original filename and extension
    original_filename = upload_file.filename or "image.jpg"
    file_extension = os.path.splitext(original_filename)[1].lower()
    
    # Default to jpg if no extension
    if not file_extension:
        file_extension = ".jpg"
    
    # Sanitize document number for filename
    safe_doc_number = "".join(c for c in doc_number if c.isalnum())
    
    # Generate unique filename
    filename = f"{doc_type}_{safe_doc_number}_{timestamp}_{unique_id}_{image_type}{file_extension}"
    
    # Determine directory based on image type
    if image_type == "front":
        save_dir = DOCUMENT_FRONT_DIR
    elif image_type == "back":
        save_dir = DOCUMENT_BACK_DIR
    elif image_type == "selfie":
        save_dir = SELFIE_DIR
    else:
        save_dir = UPLOAD_BASE_DIR
    
    # Ensure directory exists
    os.makedirs(save_dir, exist_ok=True)
    
    # Full path
    file_path = os.path.join(save_dir, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        # Read file in chunks to handle large files
        while True:
            chunk = await upload_file.read(1024 * 1024)  # 1MB chunks
            if not chunk:
                break
            buffer.write(chunk)
    
    # Reset file pointer for potential reuse
    await upload_file.seek(0)
    
    # Return relative path
    return f"uploads/documents/{image_type}/{filename}"

def validate_document_number(doc_type: str, doc_number: str) -> bool:
    """Validate document number based on type"""
    doc_number = doc_number.strip().replace(" ", "")
    
    if not doc_number:
        return False
    
    doc_type_lower = doc_type.lower()
    
    if doc_type_lower == "aadhar":
        # Aadhar: 12 digits
        return len(doc_number) == 12 and doc_number.isdigit()
    
    elif doc_type_lower == "dl":
        # Driving License: varies by state, basic validation
        return len(doc_number) >= 10 and len(doc_number) <= 20
    
    elif doc_type_lower == "rc":
        # Registration Certificate: format like "MH12AB1234"
        return len(doc_number) >= 8 and len(doc_number) <= 15
    
    elif doc_type_lower == "pan":
        # PAN: 10 characters, format like "ABCDE1234F"
        return len(doc_number) == 10
    
    elif doc_type_lower == "passport":
        # Passport: varies, basic validation
        return len(doc_number) >= 6 and len(doc_number) <= 12
    
    return True

def get_document_icon(doc_type: str) -> str:
    """Get icon name for document type"""
    icons = {
        "aadhar": "id-card",
        "dl": "car",
        "rc": "file-contract",
        "pan": "credit-card",
        "passport": "passport"
    }
    return icons.get(doc_type.lower(), "file-alt")

# ========================= PYDANTIC MODELS =========================

class DocumentUploadRequest(BaseModel):
    phone_number: str
    document_type: str
    document_number: str
    document_name: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    vehicle_number: Optional[str] = None
    document_data: Optional[dict] = None

class DocumentUpdateStatus(BaseModel):
    document_id: int
    status: str  # "approved", "rejected"
    rejection_reason: Optional[str] = None
    admin_username: str

class DocumentFilter(BaseModel):
    status: Optional[str] = None
    document_type: Optional[str] = None
    phone_number: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    page: int = 1
    limit: int = 20

class DocumentResponse(BaseModel):
    id: int
    phone_number: str
    user_id: Optional[str]
    document_type: str
    document_number: str
    document_name: str
    status: str
    front_image_url: Optional[str]
    back_image_url: Optional[str]
    selfie_image_url: Optional[str]
    issue_date: Optional[str]
    expiry_date: Optional[str]
    is_expired: bool
    submitted_at: str
    updated_at: Optional[str]
    verified_by: Optional[str]
    verified_at: Optional[str]
    rejection_reason: Optional[str]
    document_data: Optional[dict]

# ========================= DOCUMENT ENDPOINTS =========================

@app.get("/api/v1/documents/types")
async def get_document_types():
    """
    Get available document types with required fields
    """
    return {
        "success": True,
        "document_types": [
            {
                "type": "aadhar",
                "name": "Aadhar Card",
                "description": "Government issued identity card",
                "required_fields": ["document_number", "document_name"],
                "has_back_side": True,
                "icon": "id-card"
            },
            {
                "type": "dl",
                "name": "Driving License",
                "description": "Valid driving license",
                "required_fields": ["document_number", "document_name", "expiry_date"],
                "has_back_side": True,
                "icon": "car"
            },
            {
                "type": "rc",
                "name": "Registration Certificate",
                "description": "Vehicle registration certificate",
                "required_fields": ["document_number", "document_name", "vehicle_number", "expiry_date"],
                "has_back_side": False,
                "icon": "file-contract"
            },
            {
                "type": "pan",
                "name": "PAN Card",
                "description": "Permanent Account Number card",
                "required_fields": ["document_number", "document_name"],
                "has_back_side": False,
                "icon": "credit-card"
            },
            {
                "type": "passport",
                "name": "Passport",
                "description": "Valid passport",
                "required_fields": ["document_number", "document_name", "expiry_date"],
                "has_back_side": True,
                "icon": "passport"
            }
        ]
    }
@app.get("/api/v1/documents/stats")
async def get_document_stats(
    time_range: str = Query("all", description="Time range: all, today, week, month"),
    db: Session = Depends(get_db)
):
    """
    Get document verification statistics
    """
    try:
        from sqlalchemy import func
        
        # Base query
        query = db.query(DocumentVerification)
        
        # Apply time filter
        today = datetime.now(timezone.utc).date()
        if time_range == "today":
            query = query.filter(func.date(DocumentVerification.submitted_at) == today)
        elif time_range == "week":
            week_ago = today - timedelta(days=7)
            query = query.filter(DocumentVerification.submitted_at >= week_ago)
        elif time_range == "month":
            month_ago = today - timedelta(days=30)
            query = query.filter(DocumentVerification.submitted_at >= month_ago)
        
        total = query.count()
        pending = query.filter(DocumentVerification.status == DocumentStatus.PENDING).count()
        under_review = query.filter(DocumentVerification.status == DocumentStatus.UNDER_REVIEW).count()
        approved = query.filter(DocumentVerification.status == DocumentStatus.APPROVED).count()
        rejected = query.filter(DocumentVerification.status == DocumentStatus.REJECTED).count()
        expired = query.filter(DocumentVerification.is_expired == True).count()
        
        # Get counts by document type
        doc_type_counts = {}
        for doc_type in DocumentType:
            count = query.filter(DocumentVerification.document_type == doc_type).count()
            doc_type_counts[doc_type.value] = count
        
        # Get daily submissions for last 7 days
        daily_stats = []
        for i in range(6, -1, -1):
            date_val = today - timedelta(days=i)
            count = db.query(DocumentVerification).filter(
                func.date(DocumentVerification.submitted_at) == date_val
            ).count()
            daily_stats.append({
                "date": date_val.isoformat(),
                "count": count
            })
        
        return {
            "success": True,
            "stats": {
                "total": total,
                "pending": pending,
                "under_review": under_review,
                "approved": approved,
                "rejected": rejected,
                "expired": expired,
                "approval_rate": round((approved / total * 100), 2) if total > 0 else 0,
                "rejection_rate": round((rejected / total * 100), 2) if total > 0 else 0
            },
            "document_type_stats": doc_type_counts,
            "daily_stats": daily_stats,
            "time_range": time_range
        }
        
    except Exception as e:
        print(f"❌ Get document stats error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get statistics: {str(e)}"
        )

@app.post("/api/v1/documents/upload")
async def upload_document(
    phone_number: str = Form(...),
    document_type: str = Form(...),
    document_number: str = Form(...),
    document_name: str = Form(...),
    issue_date: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),
    vehicle_number: Optional[str] = Form(None),
    front_image: UploadFile = File(...),
    back_image: Optional[UploadFile] = File(None),
    selfie_image: UploadFile = File(...),
    is_reupload: Optional[str] = Form(None),  # Add this parameter
    reupload_document_id: Optional[int] = Form(None),  # Add this parameter
    db: Session = Depends(get_db)
):
    """
    Upload document for verification
    """
    try:
        print(f"📤 Document upload started for {phone_number}")
        print(f"🔄 Reupload mode: {is_reupload}, Document ID: {reupload_document_id}")
        
        # Validate document number
        if not validate_document_number(document_type, document_number):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid {document_type.upper()} number format"
            )
        
        # Convert document_type to uppercase for enum matching
        document_type_upper = document_type.upper()
        
        # Validate document type exists in enum
        try:
            doc_enum = DocumentType[document_type_upper]
        except KeyError:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid document type: {document_type}. Valid types: {[e.value for e in DocumentType]}"
            )
        
        # Check if document already exists - MODIFIED LOGIC
        existing_query = db.query(DocumentVerification).filter(
            and_(
                DocumentVerification.phone_number == phone_number,
                DocumentVerification.document_type == doc_enum
            )
        )
        
        # If NOT in reupload mode, check for existing pending/approved documents
        if not is_reupload:
            existing = existing_query.filter(
                DocumentVerification.status.in_([
                    DocumentStatus.PENDING, 
                    DocumentStatus.UNDER_REVIEW, 
                    DocumentStatus.APPROVED
                ])
            ).first()
            
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail=f"You already have a {document_type.upper()} document in {existing.status.value} status"
                )
        
        # If in reupload mode, check if the rejected document exists
        elif is_reupload and reupload_document_id:
            rejected_doc = db.query(DocumentVerification).filter(
                DocumentVerification.id == reupload_document_id,
                DocumentVerification.phone_number == phone_number,
                DocumentVerification.document_type == doc_enum,
                DocumentVerification.status == DocumentStatus.REJECTED
            ).first()
            
            if not rejected_doc:
                raise HTTPException(
                    status_code=404,
                    detail="Rejected document not found for reupload"
                )
            
            # If reuploading with different document number, check if it conflicts
            if document_number != rejected_doc.document_number:
                conflicting = db.query(DocumentVerification).filter(
                    DocumentVerification.document_number == document_number,
                    DocumentVerification.status.in_([
                        DocumentStatus.PENDING, 
                        DocumentStatus.UNDER_REVIEW, 
                        DocumentStatus.APPROVED
                    ])
                ).first()
                
                if conflicting:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Document number already exists in {conflicting.status.value} status"
                    )
        
        # Get user info
        user = db.query(User).filter(User.phone_number == phone_number).first()
        user_id = user.user_id if user else None
        
        # Prepare document data
        document_data = {}
        if vehicle_number:
            document_data["vehicle_number"] = vehicle_number.strip()
        
        # Generate unique identifiers
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        
        # Save images
        front_image_path = await save_image(
            front_image, "front", 
            document_type, document_number, 
            timestamp, unique_id
        )
        
        back_image_path = None
        if back_image:
            back_image_path = await save_image(
                back_image, "back", 
                document_type, document_number, 
                timestamp, unique_id
            )
        
        selfie_image_path = await save_image(
            selfie_image, "selfie", 
            document_type, document_number, 
            timestamp, unique_id
        )
        
        # Parse dates
        issue_date_obj = None
        expiry_date_obj = None
        
        if issue_date:
            try:
                issue_date_obj = datetime.strptime(issue_date, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(
                    status_code=400, 
                    detail="Invalid issue date format. Use YYYY-MM-DD"
                )
        
        if expiry_date:
            try:
                expiry_date_obj = datetime.strptime(expiry_date, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(
                    status_code=400, 
                    detail="Invalid expiry date format. Use YYYY-MM-DD"
                )
        
        # Check if expired
        is_expired = False
        if expiry_date_obj and expiry_date_obj < date.today():
            is_expired = True
        
        # If in reupload mode, update the rejected document instead of creating new
        if is_reupload and reupload_document_id:
            print(f"🔄 Updating rejected document {reupload_document_id}")
            
            document = db.query(DocumentVerification).filter(
                DocumentVerification.id == reupload_document_id
            ).first()
            
            if not document:
                raise HTTPException(status_code=404, detail="Document to reupload not found")
            
            # Update document fields
            document.document_number = document_number
            document.document_name = document_name.strip()
            document.document_data = document_data if document_data else None
            document.front_image_path = front_image_path
            document.back_image_path = back_image_path
            document.selfie_image_path = selfie_image_path
            document.issue_date = issue_date_obj
            document.expiry_date = expiry_date_obj
            document.is_expired = is_expired
            document.status = DocumentStatus.PENDING  # Reset to pending
            document.rejection_reason = None  # Clear rejection reason
            document.verified_by = None  # Clear verification
            document.verified_at = None  # Clear verification timestamp
            document.updated_at = datetime.now(timezone.utc)

            
            # Create verification log for reupload
            log = VerificationLog(
                document_id=document.id,
                admin_id=1,  # User-initiated reupload
                action="reupload",
                notes="User reuploaded rejected document"
            )
            db.add(log)
            
        else:
            # Create new document record
            document = DocumentVerification(
                phone_number=phone_number,
                user_id=user_id,
                document_type=doc_enum,
                document_number=document_number,
                document_name=document_name.strip(),
                document_data=document_data if document_data else None,
                front_image_path=front_image_path,
                back_image_path=back_image_path,
                selfie_image_path=selfie_image_path,
                issue_date=issue_date_obj,
                expiry_date=expiry_date_obj,
                is_expired=is_expired,
                status=DocumentStatus.PENDING,
                submitted_at=datetime.now(timezone.utc)

            )
            
            db.add(document)
        
        db.commit()
        db.refresh(document)
        
        print(f"✅ Document {'reuploaded' if is_reupload else 'uploaded'} successfully: ID {document.id}")
        
        return {
            "success": True,
            "message": f"Document {'reuploaded' if is_reupload else 'uploaded'} successfully. Under verification.",
            "document_id": document.id,
            "is_reupload": bool(is_reupload),
            "status": document.status.value,
            "document_type": document_type.upper(),
            "document_number": document_number,
            "submitted_at": document.submitted_at.isoformat() if document.submitted_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Document upload error: {str(e)}")
        print(traceback.format_exc())
        
        # Cleanup uploaded files if document creation failed
        try:
            # Get paths from saved images (if they were saved)
            if 'front_image_path' in locals() and front_image_path and os.path.exists(front_image_path):
                os.remove(front_image_path)
                print(f"🗑️ Cleaned up front image: {front_image_path}")
            if 'back_image_path' in locals() and back_image_path and os.path.exists(back_image_path):
                os.remove(back_image_path)
                print(f"🗑️ Cleaned up back image: {back_image_path}")
            if 'selfie_image_path' in locals() and selfie_image_path and os.path.exists(selfie_image_path):
                os.remove(selfie_image_path)
                print(f"🗑️ Cleaned up selfie image: {selfie_image_path}")
        except Exception as cleanup_error:
            print(f"⚠️ Cleanup error: {cleanup_error}")
        
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Document upload failed. Please try again."
        )
@app.get("/api/v1/documents/user/{phone_number}")
async def get_user_documents(
    phone_number: str,
    db: Session = Depends(get_db)
):
    """
    Get all documents for a user
    """
    try:
        documents = db.query(DocumentVerification).filter(
            DocumentVerification.phone_number == phone_number
        ).order_by(DocumentVerification.created_at.desc()).all()
        
        result = []
        for doc in documents:
            # Get user info
            user = db.query(User).filter(User.phone_number == doc.phone_number).first()
            
            result.append({
                "id": doc.id,
                "phone_number": doc.phone_number,
                "user_id": doc.user_id,
                "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
                "document_type": doc.document_type.value,
                "document_number": doc.document_number,
                "document_name": doc.document_name,
                "status": doc.status.value,
                "front_image_url": f"/{doc.front_image_path}",
                "back_image_url": f"/{doc.back_image_path}" if doc.back_image_path else None,
                "selfie_image_url": f"/{doc.selfie_image_path}",
                "issue_date": doc.issue_date.isoformat() if doc.issue_date else None,
                "expiry_date": doc.expiry_date.isoformat() if doc.expiry_date else None,
                "is_expired": doc.is_expired,
                "submitted_at": doc.submitted_at.isoformat() if doc.submitted_at else None,
                "verified_by": doc.verified_by,
                "verified_at": doc.verified_at.isoformat() if doc.verified_at else None,
                "rejection_reason": doc.rejection_reason,
                "document_data": doc.document_data,
                "icon": get_document_icon(doc.document_type.value)
            })
        
        return {
            "success": True,
            "documents": result,
            "total": len(result)
        }
        
    except Exception as e:
        print(f"❌ Get user documents error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch documents: {str(e)}"
        )

@app.get("/api/v1/documents/pending")
async def get_pending_documents(
    status: str = "pending",
    document_type: Optional[str] = None,
    phone_number: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Get pending documents for admin approval (with pagination and filters)
    """
    try:
        offset = (page - 1) * limit
        
        query = db.query(DocumentVerification)
        
        # Apply filters
        if status == "pending":
            query = query.filter(DocumentVerification.status == DocumentStatus.PENDING)
        elif status == "under_review":
            query = query.filter(DocumentVerification.status == DocumentStatus.UNDER_REVIEW)
        elif status == "all":
            query = query.filter(DocumentVerification.status.in_([
                DocumentStatus.PENDING, 
                DocumentStatus.UNDER_REVIEW,
                DocumentStatus.APPROVED,
                DocumentStatus.REJECTED
            ]))
        elif status:
            try:
                status_enum = DocumentStatus(status)
                query = query.filter(DocumentVerification.status == status_enum)
            except ValueError:
                pass
        
        if document_type:
            try:
                doc_enum = DocumentType(document_type.upper())
                query = query.filter(DocumentVerification.document_type == doc_enum)
            except (KeyError, ValueError):
                pass
        
        if phone_number:
            query = query.filter(DocumentVerification.phone_number == phone_number)
        
        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
                query = query.filter(DocumentVerification.submitted_at >= start_date_obj)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date_obj = datetime.strptime(end_date, "%Y-%m-%d")
                query = query.filter(DocumentVerification.submitted_at <= end_date_obj)
            except ValueError:
                pass
        
        total = query.count()
        documents = query.order_by(DocumentVerification.submitted_at.asc())\
                        .offset(offset).limit(limit).all()
        
        result = []
        for doc in documents:
            # Get user info
            user = db.query(User).filter(User.phone_number == doc.phone_number).first()
            
            result.append({
                "id": doc.id,
                "phone_number": doc.phone_number,
                "user_id": doc.user_id,
                "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
                "user_email": user.email if user else None,
                "document_type": doc.document_type.value.upper(),
                "document_number": doc.document_number,
                "document_name": doc.document_name,
                "status": doc.status.value,
                "front_image_url": f"/{doc.front_image_path}",
                "back_image_url": f"/{doc.back_image_path}" if doc.back_image_path else None,
                "selfie_image_url": f"/{doc.selfie_image_path}",
                "issue_date": doc.issue_date.isoformat() if doc.issue_date else None,
                 "rejection_reason": doc.rejection_reason,   # ✅ ADD THIS
                "expiry_date": doc.expiry_date.isoformat() if doc.expiry_date else None,
                "is_expired": doc.is_expired,
                "submitted_at": doc.submitted_at.isoformat() if doc.submitted_at else None,
                "document_data": doc.document_data,
                "icon": get_document_icon(doc.document_type.value)
            })
        
        return {
            "success": True,
            "documents": result,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }
        
    except Exception as e:
        print(f"❌ Get pending documents error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch pending documents: {str(e)}"
        )

@app.post("/api/v1/documents/search")
async def search_documents(
    filter_data: DocumentFilter,
    db: Session = Depends(get_db)
):
    """
    Search documents with advanced filters
    """
    try:
        offset = (filter_data.page - 1) * filter_data.limit
        
        query = db.query(DocumentVerification)
        
        # Apply filters
        if filter_data.status:
            try:
                status_enum = DocumentStatus(filter_data.status)
                query = query.filter(DocumentVerification.status == status_enum)
            except ValueError:
                pass
        
        if filter_data.document_type:
            try:
                doc_enum = DocumentType(filter_data.document_type.upper())
                query = query.filter(DocumentVerification.document_type == doc_enum)
            except (KeyError, ValueError):
                pass
        
        if filter_data.phone_number:
            query = query.filter(
                DocumentVerification.phone_number.like(f"%{filter_data.phone_number}%")
            )
        
        if filter_data.start_date:
            try:
                start_date_obj = datetime.strptime(filter_data.start_date, "%Y-%m-%d")
                query = query.filter(DocumentVerification.submitted_at >= start_date_obj)
            except ValueError:
                pass
        
        if filter_data.end_date:
            try:
                end_date_obj = datetime.strptime(filter_data.end_date, "%Y-%m-%d")
                query = query.filter(DocumentVerification.submitted_at <= end_date_obj)
            except ValueError:
                pass
        
        total = query.count()
        documents = query.order_by(desc(DocumentVerification.submitted_at))\
                        .offset(offset).limit(filter_data.limit).all()
        
        result = []
        for doc in documents:
            user = db.query(User).filter(User.phone_number == doc.phone_number).first()
            
            result.append({
                "id": doc.id,
                "phone_number": doc.phone_number,
                "user_id": doc.user_id,
                "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
                "document_type": doc.document_type.value,
                "document_number": doc.document_number,
                "document_name": doc.document_name,
                "status": doc.status.value,
                "front_image_url": f"/{doc.front_image_path}",
                "submitted_at": doc.submitted_at.isoformat() if doc.submitted_at else None,
                "verified_by": doc.verified_by,
                "verified_at": doc.verified_at.isoformat() if doc.verified_at else None
            })
        
        return {
            "success": True,
            "documents": result,
            "pagination": {
                "page": filter_data.page,
                "limit": filter_data.limit,
                "total": total,
                "pages": (total + filter_data.limit - 1) // filter_data.limit
            }
        }
        
    except Exception as e:
        print(f"❌ Search documents error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search documents: {str(e)}"
        )

@app.delete("/api/v1/documents/{document_id}")
async def delete_document(
    document_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Delete document - User can delete any of their documents
    """
    try:
        # Parse request body
        try:
            body = await request.json()
            reason = body.get("reason", "User requested deletion")
        except:
            reason = "User requested deletion"
        
        document = db.query(DocumentVerification).filter(
            DocumentVerification.id == document_id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # ✅ SOLUTION: Delete verification logs first
        db.query(VerificationLog).filter(
            VerificationLog.document_id == document_id
        ).delete()
        
        # Store document info for logging before deletion
        doc_info = {
            "id": document.id,
            "phone_number": document.phone_number,
            "document_type": document.document_type.value,
            "document_number": document.document_number,
            "status": document.status.value
        }
        
        # Delete associated files
        try:
            if document.front_image_path and os.path.exists(document.front_image_path):
                os.remove(document.front_image_path)
                print(f"🗑️ Deleted front image: {document.front_image_path}")
            if document.back_image_path and os.path.exists(document.back_image_path):
                os.remove(document.back_image_path)
                print(f"🗑️ Deleted back image: {document.back_image_path}")
            if document.selfie_image_path and os.path.exists(document.selfie_image_path):
                os.remove(document.selfie_image_path)
                print(f"🗑️ Deleted selfie image: {document.selfie_image_path}")
        except Exception as e:
            print(f"⚠️ File deletion error: {e}")
            # Continue with deletion even if file cleanup fails
        
        # ✅ No need to create log since we're deleting everything
        # Delete the document
        db.delete(document)
        db.commit()
        
        print(f"✅ Document deleted: ID {doc_info['id']}, Type: {doc_info['document_type']}, Status: {doc_info['status']}")
        
        return {
            "success": True,
            "message": "Document deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Delete document error: {str(e)}")
        print(traceback.format_exc())
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete document: {str(e)}"
        )
@app.put("/api/v1/documents/status")
async def update_document_status(
    data: DocumentUpdateStatus,
    db: Session = Depends(get_db)
):
    """
    Admin updates document status (approve/reject)
    """
    try:
        document = db.query(DocumentVerification).filter(
            DocumentVerification.id == data.document_id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Update status
        if data.status == "approved":
            document.status = DocumentStatus.APPROVED
            document.verified_by = data.admin_username
            document.verified_at = datetime.now(timezone.utc)

            document.rejection_reason = None
            
            # Log the action
            log = VerificationLog(
                document_id=document.id,
                admin_id=1,  # Should get from admin session
                action="approve",
                notes="Document approved by admin"
            )
            db.add(log)
            
        elif data.status == "rejected":
            if not data.rejection_reason:
                raise HTTPException(status_code=400, detail="Rejection reason required")
            
            document.status = DocumentStatus.REJECTED
            document.verified_by = data.admin_username
            document.verified_at = datetime.now(timezone.utc)

            document.rejection_reason = data.rejection_reason
            
            # Log the action
            log = VerificationLog(
                document_id=document.id,
                admin_id=1,
                action="reject",
                notes=data.rejection_reason
            )
            db.add(log)
        
        elif data.status == "under_review":
            document.status = DocumentStatus.UNDER_REVIEW
            
            # Log the action
            log = VerificationLog(
                document_id=document.id,
                admin_id=1,
                action="under_review",
                notes="Document marked for review"
            )
            db.add(log)
        
        document.updated_at = datetime.now(timezone.utc)

        db.commit()
        
        return {
            "success": True,
            "message": f"Document {data.status} successfully",
            "document_id": document.id,
            "status": document.status.value
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Update document status error: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update document status: {str(e)}"
        )

@app.put("/api/v1/documents/{document_id}/review")
async def request_document_review(
    document_id: int,
    admin_username: str,
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Request additional review for document
    """
    try:
        document = db.query(DocumentVerification).filter(
            DocumentVerification.id == document_id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document.status = DocumentStatus.UNDER_REVIEW
        document.verified_by = admin_username
        document.updated_at = datetime.now(timezone.utc)

        
        # Log the action
        log = VerificationLog(
            document_id=document.id,
            admin_id=1,
            action="request_review",
            notes=notes or "Additional information requested"
        )
        db.add(log)
        
        db.commit()
        
        return {
            "success": True,
            "message": "Document marked for review",
            "document_id": document.id,
            "status": document.status.value
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Request document review error: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to request document review: {str(e)}"
        )
# @app.delete("/api/v1/documents/{document_id}")
# async def delete_document(
#     document_id: int,
#     request: Request,
#     db: Session = Depends(get_db)
# ):
#     """
#     Delete document - User can delete any of their documents
#     """
#     try:
#         # Parse request body
#         try:
#             body = await request.json()
#             reason = body.get("reason", "User requested deletion")
#         except:
#             reason = "User requested deletion"
        
#         document = db.query(DocumentVerification).filter(
#             DocumentVerification.id == document_id
#         ).first()
        
#         if not document:
#             raise HTTPException(status_code=404, detail="Document not found")
        
#         # NOTE: Users can delete ANY document, including approved ones
#         # No restrictions on status
        
#         # Store document info for logging before deletion
#         doc_info = {
#             "id": document.id,
#             "phone_number": document.phone_number,
#             "document_type": document.document_type.value,
#             "document_number": document.document_number,
#             "status": document.status.value
#         }
        
#         # Delete associated files
#         try:
#             if document.front_image_path and os.path.exists(document.front_image_path):
#                 os.remove(document.front_image_path)
#                 print(f"🗑️ Deleted front image: {document.front_image_path}")
#             if document.back_image_path and os.path.exists(document.back_image_path):
#                 os.remove(document.back_image_path)
#                 print(f"🗑️ Deleted back image: {document.back_image_path}")
#             if document.selfie_image_path and os.path.exists(document.selfie_image_path):
#                 os.remove(document.selfie_image_path)
#                 print(f"🗑️ Deleted selfie image: {document.selfie_image_path}")
#         except Exception as e:
#             print(f"⚠️ File deletion error: {e}")
#             # Continue with deletion even if file cleanup fails
        
#         # Create deletion log
#         try:
#             log = VerificationLog(
#                 document_id=document.id,
#                 admin_id=None,
#                 action="user_delete",
#                 notes=f"Document deleted by user. Status: {doc_info['status']}. Reason: {reason}"
#             )
#             db.add(log)
#         except Exception as log_error:
#             print(f"⚠️ Log creation error: {log_error}")
        
#         # Delete the document
#         db.delete(document)
#         db.commit()
        
#         print(f"✅ Document deleted: ID {doc_info['id']}, Type: {doc_info['document_type']}, Status: {doc_info['status']}")
        
#         return {
#             "success": True,
#             "message": "Document deleted successfully"
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"❌ Delete document error: {str(e)}")
#         print(traceback.format_exc())
#         db.rollback()
#         raise HTTPException(
#             status_code=500,
#             detail=f"Failed to delete document: {str(e)}"
#         )

@app.get("/api/v1/documents/expiring-soon")
async def get_expiring_documents(
    days_threshold: int = 30,
    db: Session = Depends(get_db)
):
    """
    Get documents expiring soon
    """
    try:
        today = date.today()
        threshold_date = today + timedelta(days=days_threshold)
        
        documents = db.query(DocumentVerification).filter(
            DocumentVerification.expiry_date.isnot(None),
            DocumentVerification.expiry_date >= today,
            DocumentVerification.expiry_date <= threshold_date,
            DocumentVerification.status == DocumentStatus.APPROVED
        ).order_by(DocumentVerification.expiry_date.asc()).all()
        
        result = []
        for doc in documents:
            user = db.query(User).filter(User.phone_number == doc.phone_number).first()
            
            # Calculate days until expiry
            days_until_expiry = (doc.expiry_date - today).days
            
            result.append({
                "id": doc.id,
                "phone_number": doc.phone_number,
                "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
                "document_type": doc.document_type.value,
                "document_number": doc.document_number,
                "document_name": doc.document_name,
                "expiry_date": doc.expiry_date.isoformat(),
                "days_until_expiry": days_until_expiry,
                "is_expired": doc.is_expired
            })
        
        return {
            "success": True,
            "documents": result,
            "total": len(result),
            "threshold_days": days_threshold
        }
        
    except Exception as e:
        print(f"❌ Get expiring documents error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch expiring documents: {str(e)}"
        )

@app.post("/api/v1/documents/bulk-action")
async def bulk_action_documents(
    document_ids: List[int],
    action: str,  # approve, reject, delete, mark_review
    admin_username: str,
    rejection_reason: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Perform bulk actions on documents
    """
    try:
        if not document_ids:
            raise HTTPException(status_code=400, detail="No documents selected")
        
        if action not in ["approve", "reject", "delete", "mark_review"]:
            raise HTTPException(status_code=400, detail="Invalid action")
        
        success_count = 0
        failed_count = 0
        results = []
        
        for doc_id in document_ids:
            try:
                document = db.query(DocumentVerification).filter(
                    DocumentVerification.id == doc_id
                ).first()
                
                if not document:
                    results.append({"id": doc_id, "success": False, "message": "Document not found"})
                    failed_count += 1
                    continue
                
                if action == "approve":
                    document.status = DocumentStatus.APPROVED
                    document.verified_by = admin_username
                    document.verified_at = datetime.now(timezone.utc)

                    document.rejection_reason = None
                    
                    log = VerificationLog(
                        document_id=document.id,
                        admin_id=1,
                        action="approve",
                        notes="Bulk approval"
                    )
                    db.add(log)
                    
                elif action == "reject":
                    if not rejection_reason:
                        results.append({"id": doc_id, "success": False, "message": "Rejection reason required"})
                        failed_count += 1
                        continue
                    
                    document.status = DocumentStatus.REJECTED
                    document.verified_by = admin_username
                    document.verified_at = datetime.now(timezone.utc)

                    document.rejection_reason = rejection_reason
                    
                    log = VerificationLog(
                        document_id=document.id,
                        admin_id=1,
                        action="reject",
                        notes=f"Bulk rejection: {rejection_reason}"
                    )
                    db.add(log)
                    
                elif action == "mark_review":
                    document.status = DocumentStatus.UNDER_REVIEW
                    
                    log = VerificationLog(
                        document_id=document.id,
                        admin_id=1,
                        action="request_review",
                        notes="Bulk review request"
                    )
                    db.add(log)
                    
                elif action == "delete":
                    # Check if approved
                    if document.status == DocumentStatus.APPROVED:
                        results.append({"id": doc_id, "success": False, "message": "Cannot delete approved document"})
                        failed_count += 1
                        continue
                    
                    # Delete files
                    try:
                        if document.front_image_path and os.path.exists(document.front_image_path):
                            os.remove(document.front_image_path)
                        if document.back_image_path and os.path.exists(document.back_image_path):
                            os.remove(document.back_image_path)
                        if document.selfie_image_path and os.path.exists(document.selfie_image_path):
                            os.remove(document.selfie_image_path)
                    except Exception as e:
                        print(f"⚠️ File deletion error for doc {doc_id}: {e}")
                    
                    log = VerificationLog(
                        document_id=document.id,
                        admin_id=1,
                        action="delete",
                        notes=f"Bulk deletion by {admin_username}"
                    )
                    db.add(log)
                    
                    db.delete(document)
                
                document.updated_at = datetime.now(timezone.utc)

                success_count += 1
                results.append({"id": doc_id, "success": True, "message": f"Document {action}d"})
                
            except Exception as e:
                results.append({"id": doc_id, "success": False, "message": str(e)})
                failed_count += 1
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Bulk action completed: {success_count} successful, {failed_count} failed",
            "total": len(document_ids),
            "success_count": success_count,
            "failed_count": failed_count,
            "results": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Bulk action error: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to perform bulk action: {str(e)}"
        )

@app.get("/api/v1/documents/recent-activity")
async def get_recent_activity(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get recent document verification activity
    """
    try:
        # Get recent document updates
        documents = db.query(DocumentVerification).filter(
            DocumentVerification.updated_at.isnot(None)
        ).order_by(desc(DocumentVerification.updated_at)).limit(limit).all()
        
        # Get recent verification logs
        logs = db.query(VerificationLog).order_by(
            desc(VerificationLog.created_at)
        ).limit(limit).all()
        
        activity = []
        
        # Add document updates
        for doc in documents:
            if doc.updated_at:
                user = db.query(User).filter(User.phone_number == doc.phone_number).first()
                
                activity.append({
                    "type": "document_update",
                    "document_id": doc.id,
                    "document_type": doc.document_type.value,
                    "document_number": doc.document_number,
                    "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
                    "action": f"Status changed to {doc.status.value}",
                    "timestamp": doc.updated_at.isoformat(),
                    "icon": get_document_icon(doc.document_type.value)
                })
        
        # Add verification logs
        for log in logs:
            doc = db.query(DocumentVerification).filter(
                DocumentVerification.id == log.document_id
            ).first()
            
            if doc:
                user = db.query(User).filter(User.phone_number == doc.phone_number).first()
                admin = db.query(AdminUser).filter(AdminUser.id == log.admin_id).first()
                
                activity.append({
                    "type": "verification_log",
                    "document_id": doc.id,
                    "document_type": doc.document_type.value,
                    "document_number": doc.document_number,
                    "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
                    "admin_name": admin.full_name if admin else "Unknown",
                    "action": log.action,
                    "notes": log.notes,
                    "timestamp": log.created_at.isoformat() if log.created_at else None,
                    "icon": "clipboard-check" if log.action == "approve" else "exclamation-triangle"
                })
        
        # Sort by timestamp
        activity.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return {
            "success": True,
            "activity": activity[:limit],
            "total": len(activity)
        }
        
    except Exception as e:
        print(f"❌ Get recent activity error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch recent activity: {str(e)}"
        )
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import (
    User,
    UserSettings,
    UserDevice,
    BlockedUser,
    UserStatus
)



# =========================
# SECURITY SETTINGS
# =========================

@app.get("/api/v1/settings/security")
def get_security_settings(phone_number: str, db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter_by(phone_number=phone_number).first()

    if not settings:
        settings = UserSettings(phone_number=phone_number)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return {
        "success": True,
        "settings": {
            "contact_visibility": settings.contact_visibility
        }
    }


@app.put("/api/v1/settings/security")
def update_security_settings(data: dict, db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter_by(
        phone_number=data["phone_number"]
    ).first()

    if not settings:
        settings = UserSettings(phone_number=data["phone_number"])
        db.add(settings)

    settings.contact_visibility = data.get("contact_visibility", True)
    db.commit()

    return {"success": True}


# =========================
# NOTIFICATION SETTINGS
# =========================

@app.get("/api/v1/settings/notifications")
def get_notification_settings(phone_number: str, db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter_by(phone_number=phone_number).first()

    if not settings:
        settings = UserSettings(phone_number=phone_number)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return {
        "success": True,
        "notifications": {
            "rideUpdates": settings.ride_updates,
            "chatMessages": settings.chat_messages,
            "promotions": settings.promotions,
            "newsletters": settings.newsletters,
            "smsAlerts": settings.sms_alerts,
        }
    }


@app.put("/api/v1/settings/notifications")
def update_notification_settings(data: dict, db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter_by(
        phone_number=data["phone_number"]
    ).first()

    if not settings:
        settings = UserSettings(phone_number=data["phone_number"])
        db.add(settings)

    settings.ride_updates = data.get("rideUpdates", True)
    settings.chat_messages = data.get("chatMessages", True)
    settings.promotions = data.get("promotions", False)
    settings.newsletters = data.get("newsletters", False)
    settings.sms_alerts = data.get("smsAlerts", True)

    db.commit()
    return {"success": True}


# =========================
# DEVICES
# =========================

@app.get("/api/v1/devices")
def get_devices(phone_number: str, db: Session = Depends(get_db)):

    devices = db.query(UserDevice).filter(
        UserDevice.phone_number == phone_number
    ).order_by(UserDevice.created_at.desc()).all()

    return {
        "success": True,
        "devices": [
            {
                "id": d.id,
                "name": d.device_name,        # ✅ UI expects "name"
                "type": d.device_type,        # ✅ UI expects "type"
                "current": d.is_current,      # 🔥 VERY IMPORTANT
                "last_active": d.last_active
            }
            for d in devices
        ]
    }


@app.delete("/api/v1/devices/{device_id}")
def logout_device(device_id: int, db: Session = Depends(get_db)):
    device = db.query(UserDevice).filter_by(id=device_id).first()

    if not device:
        raise HTTPException(404, "Device not found")

    if device.is_current:
        raise HTTPException(400, "Cannot logout current device")

    db.delete(device)
    db.commit()

    return {"success": True}


# =========================
# BLOCKED USERS
# =========================

@app.get("/api/v1/blocked-users")
def get_blocked_users(phone_number: str, db: Session = Depends(get_db)):
    users = db.query(BlockedUser).filter_by(owner_phone=phone_number).all()

    return {
        "success": True,
        "blocked_users": [
            {
                "id": u.id,
                "name": u.blocked_name,
                "phone": u.blocked_phone
            }
            for u in users
        ]
    }


@app.delete("/api/v1/blocked-users/{id}")
def unblock_user(id: int, db: Session = Depends(get_db)):
    block = db.query(BlockedUser).filter_by(id=id).first()

    if not block:
        raise HTTPException(404, "User not found")

    db.delete(block)
    db.commit()

    return {"success": True}

@app.post("/api/v1/account/deactivate")
def deactivate_account(payload: dict, db: Session = Depends(get_db)):
    phone = payload.get("phone_number")
    reason = payload.get("reason")

    if not phone:
        raise HTTPException(status_code=400, detail="Phone number required")

    user = db.query(User).filter(User.phone_number == phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 1️⃣ Update user status
    user.status = UserStatus.SUSPENDED
    user.updated_at = datetime.now(timezone.utc)


    # 2️⃣ Create deactivation record
    deactivation = AccountDeactivation(
        phone_number=phone,
        reason=reason,
        is_deactivated=True   # ✅ FIXED
    )

    # 3️⃣ Logout all devices
    db.query(UserDevice).filter(
        UserDevice.phone_number == phone
    ).update({UserDevice.is_current: False})

    db.add(deactivation)
    db.commit()

    return {
        "success": True,
        "message": "Account deactivated. It will be deleted after 30 days if no login occurs."
    }

def delete_expired_deactivated_users(db: Session):
    cutoff =datetime.now(timezone.utc) - timedelta(days=30)

    expired = db.query(AccountDeactivation).filter(
        AccountDeactivation.is_active == True,
        AccountDeactivation.deactivated_at < cutoff
    ).all()

    for record in expired:
        user = db.query(User).filter_by(
            phone_number=record.phone_number
        ).first()

        if user:
            db.delete(user)

        db.delete(record)

    db.commit()
from datetime import datetime
from sqlalchemy.orm import Session
from models import UserDevice
from datetime import datetime, timezone,timedelta

def register_device(db, phone_number, device_name, device_type):
    try:
        # Mark all previous devices inactive
        db.query(UserDevice).filter(
            UserDevice.phone_number == phone_number
        ).update({UserDevice.is_current: False})

        device = db.query(UserDevice).filter_by(
            phone_number=phone_number,
            device_name=device_name,
            device_type=device_type
        ).first()

        if device:
            device.is_current = True
            device.last_active = datetime.now(timezone.utc)
        else:
            device = UserDevice(
                phone_number=phone_number,
                device_name=device_name,
                device_type=device_type,
                is_current=True,
                last_active=datetime.now(timezone.utc)
            )
            db.add(device)

        db.commit()
    except Exception as e:
        db.rollback()
        print("❌ Device registration failed:", e)
from pydantic import BaseModel, Field
from models import UserFeedback

class FeedbackRequest(BaseModel):
    phone_number: str
    rating: int = Field(..., ge=1, le=5)
    reason: str | None = None


@app.post("/api/v1/feedback")
def submit_feedback(data: FeedbackRequest, db: Session = Depends(get_db)):
    feedback = UserFeedback(
        phone_number=data.phone_number,
        rating=data.rating,
        reason=data.reason
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return {
        "success": True,
        "message": "Feedback submitted successfully",
        "feedback_id": feedback.id
    }
class RideFeedbackRequest(BaseModel):
    ride_booking_id: int
    phone_number: str
    rating: int = Field(..., ge=1, le=5)
    reason: str | None = None
    comment: str | None = None


@app.post("/api/v1/ride-feedback")
def submit_ride_feedback(
    data: RideFeedbackRequest,
    db: Session = Depends(get_db)
):
    feedback = RideFeedback(
        ride_booking_id=data.ride_booking_id,
        phone_number=data.phone_number,
        rating=data.rating,
        reason=data.reason,
        comment=data.comment,
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return {
        "success": True,
        "message": "Ride feedback submitted",
        "feedback_id": feedback.id
    }
#admin

@app.get("/api/v1/admin/matching-preferences")
def get_preferences(db: Session = Depends(get_db)):
    return db.query(MatchingPreferenceMaster)\
        .filter(MatchingPreferenceMaster.is_deleted == False)\
        .order_by(MatchingPreferenceMaster.id.asc())\
        .all()
@app.post("/api/v1/admin/matching-preferences/create")
def create_pref(payload: dict, db: Session = Depends(get_db)):
    pref = MatchingPreferenceMaster(**payload)
    db.add(pref)
    db.commit()
    log_activity(
        db,
        module="Matching Preferences",
        action="create",
        description=f"Created matching preference with ID {pref.id}",
        entity_id=pref.id,
        entity_name=pref.label
    )
    return {"success": True}
@app.post("/api/v1/admin/matching-preferences/update")
def update_pref(payload: dict, db: Session = Depends(get_db)):
    pref = db.query(MatchingPreferenceMaster).filter_by(id=payload["id"]).first()
    if not pref:
        raise HTTPException(404, "Not found")

    for key in ["key", "label", "category", "input_type", "options"]:
        setattr(pref, key, payload.get(key))

    db.commit()
    log_activity(
        db,
        module="Matching Preferences",
        action="update",
        description=f"Updated matching preference with ID {pref.id}",
        entity_id=pref.id,
        entity_name=pref.label
    )   
    return {"success": True}
@app.post("/api/v1/admin/matching-preferences/status")
def change_status(payload: dict, db: Session = Depends(get_db)):
    pref = db.query(MatchingPreferenceMaster).filter_by(id=payload["id"]).first()
    pref.is_active = payload["is_active"]
    db.commit()
    log_activity(
        db,
        module="Matching Preferences",
        action="status change",
        description=f"Changed status of matching preference with ID {pref.id} to {'Active' if pref.is_active else 'Inactive'}",
        entity_id=pref.id,
        entity_name=pref.label
    )
    return {"success": True}
@app.post("/api/v1/admin/matching-preferences/delete")
def delete_pref(payload: dict, db: Session = Depends(get_db)):
    pref = db.query(MatchingPreferenceMaster).filter_by(id=payload["id"]).first()
    pref.is_deleted = True
    db.commit()
    log_activity(
        db,
        module="Matching Preferences",
        action="delete",
        description=f"Deleted matching preference with ID {pref.id}",
        entity_id=pref.id,
        entity_name=pref.label
    )
    return {"success": True}
@app.get("/api/v1/admin/about-us")
def get_about_us(db: Session = Depends(get_db)):
    return (
        db.query(AboutUs)
        .filter(AboutUs.is_deleted == False)
        .order_by(AboutUs.sort_order.asc(), AboutUs.id.asc())
        .all()
    )



@app.post("/api/v1/admin/about-us/create")
def create_about_us(payload: dict, db: Session = Depends(get_db)):
    item = AboutUs(
        title=payload["title"],
        content=payload["content"],
        is_active=True
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    log_activity(
        db,
        module="About Us",
        action="create",
        description=f"Created About Us entry with ID {item.id}",
        entity_id=item.id,
        entity_name=item.title
    )
    return {"success": True, "id": item.id}
@app.post("/api/v1/admin/about-us/update")
def update_about_us(payload: dict, db: Session = Depends(get_db)):
    item = db.query(AboutUs).filter(
        AboutUs.id == payload["id"],
        AboutUs.is_deleted == False
    ).first()

    if not item:
        raise HTTPException(404, "About Us not found")

    item.title = payload["title"]
    item.content = payload["content"]

    db.commit()
    log_activity(
        db,
        module="About Us",
        action="update",
        description=f"Updated About Us entry with ID {item.id}",
        entity_id=item.id,
        entity_name=item.title
    )
    return {"success": True}
@app.post("/api/v1/admin/about-us/status")
def toggle_about_us_status(payload: dict, db: Session = Depends(get_db)):
    item = db.query(AboutUs).filter(
        AboutUs.id == payload["id"]
    ).first()

    if not item:
        raise HTTPException(404, "About Us not found")

    if item.is_deleted:
        raise HTTPException(
            status_code=400,
            detail="Cannot change status of deleted item"
        )

    item.is_active = payload["is_active"]
    db.commit()

    return {"success": True, "is_active": item.is_active}

@app.post("/api/v1/admin/about-us/delete")
def delete_about_us(payload: dict, db: Session = Depends(get_db)):
    item = db.query(AboutUs).filter_by(id=payload["id"]).first()
    item.is_deleted = True
    db.commit()
    log_activity(
        db,
        module="About Us",
        action="delete",
        description=f"Deleted About Us entry with ID {item.id}",
        entity_id=item.id,
        entity_name=item.title
    )
    return {"success": True}
def log_activity(
    db: Session,
    module: str,
    action: str,
    description: str,
    entity_id: int | None = None,
    entity_name: str | None = None
):
    log = ActivityLog(
        module=module,
        action=action,
        entity_id=entity_id,
        entity_name=entity_name,
        description=description
    )
    db.add(log)
    db.commit()
@app.get("/api/v1/admin/activity-logs")
def get_activity_logs(
    module: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(ActivityLog)

    if module:
        query = query.filter(ActivityLog.module == module)

    return query.order_by(ActivityLog.created_at.desc()).limit(500).all()
@app.get("/api/v1/admin/promotions")
def get_promotions_admin(db: Session = Depends(get_db)):
    promos = (
        db.query(Promotion)
        .filter(Promotion.is_deleted == False)
        .order_by(Promotion.created_at.desc())
        .all()
    )

    return [
        {
            "id": p.id,
            "company_name": p.company_name,
            "title": p.title,
            "description": p.description,
            "promo_code": p.promo_code,
            "image_url": p.image_url,
            "valid_from": p.valid_from,
            "valid_till": p.valid_till,
            "is_active": p.is_active,
            "created_at": p.created_at
        }
        for p in promos
    ]
from pydantic import BaseModel
from datetime import date

class PromotionCreate(BaseModel):
    company_name: str
    title: str
    description: str | None = None
    promo_code: str | None = None
    image_url: str | None = None
    valid_from: date
    valid_till: date

@app.post("/api/v1/admin/promotions/create")
def create_promotion(data: PromotionCreate, db: Session = Depends(get_db)):
    promo = Promotion(
        **data.dict(),
        is_active=True,
        is_deleted=False
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)

    # Activity Log
    log_activity(
        db,
        module="PROMOTION",
        action="CREATE",
        entity_id=promo.id,
        entity_name=promo.title,
        description=f"Promotion '{promo.title}' created"
    )

    return {"success": True, "promotion_id": promo.id}
@app.post("/api/v1/admin/promotions/update")
def update_promotion(data: dict, db: Session = Depends(get_db)):
    promo = db.query(Promotion).filter(
        Promotion.id == data["id"],
        Promotion.is_deleted == False
    ).first()

    if not promo:
        raise HTTPException(404, "Promotion not found")

    for field in [
        "company_name", "title", "description",
        "promo_code", "image_url",
        "valid_from", "valid_till"
    ]:
        if field in data:
            setattr(promo, field, data[field])

    db.commit()

    log_activity(
        db,
        module="PROMOTION",
        action="UPDATE",
        entity_id=promo.id,
        entity_name=promo.title,
        description=f"Promotion '{promo.title}' updated"
    )

    return {"success": True}
@app.post("/api/v1/admin/promotions/status")
def toggle_promotion_status(data: dict, db: Session = Depends(get_db)):
    promo = db.query(Promotion).filter(
        Promotion.id == data["id"],
        Promotion.is_deleted == False
    ).first()

    promo.is_active = data["is_active"]
    db.commit()

    log_activity(
        db,
        module="PROMOTION",
        action="ACTIVATE" if data["is_active"] else "DEACTIVATE",
        entity_id=promo.id,
        entity_name=promo.title,
        description=f"Promotion '{promo.title}' status changed"
    )

    return {"success": True}
@app.post("/api/v1/admin/promotions/delete")
def delete_promotion(data: dict, db: Session = Depends(get_db)):
    promo = db.query(Promotion).filter(
        Promotion.id == data["id"],
        Promotion.is_deleted == False
    ).first()

    promo.is_deleted = True
    promo.is_active = False
    db.commit()

    log_activity(
        db,
        module="PROMOTION",
        action="DELETE",
        entity_id=promo.id,
        entity_name=promo.title,
        description=f"Promotion '{promo.title}' deleted"
    )

    return {"success": True}
@app.get("/api/v1/admin/ride-rewards")
def get_ride_rewards(db: Session = Depends(get_db)):
    return (
        db.query(RideRewardMaster)
        .filter(RideRewardMaster.is_deleted == False)
        .order_by(RideRewardMaster.rides_required.asc())
        .all()
    )
from pydantic import BaseModel

class RideRewardCreate(BaseModel):
    title: str
    rides_required: int
    reward_points: int

@app.post("/api/v1/admin/ride-rewards/create")
def create_ride_reward(data: RideRewardCreate, db: Session = Depends(get_db)):
    reward = RideRewardMaster(
        title=data.title,
        rides_required=data.rides_required,
        reward_points=data.reward_points,
        is_active=True
    )
    db.add(reward)
    db.commit()
    db.refresh(reward)

    log_activity(
        db,
        module="RIDE_REWARD",
        action="CREATE",
        entity_id=reward.id,
        entity_name=reward.title,
        description=f"Ride reward '{reward.title}' created"
    )

    return {"success": True, "id": reward.id}
@app.post("/api/v1/admin/ride-rewards/update")
def update_ride_reward(payload: dict, db: Session = Depends(get_db)):
    reward = db.query(RideRewardMaster).filter(
        RideRewardMaster.id == payload["id"],
        RideRewardMaster.is_deleted == False
    ).first()

    if not reward:
        raise HTTPException(404, "Reward not found")

    reward.title = payload["title"]
    reward.rides_required = payload["rides_required"]
    reward.reward_points = payload["reward_points"]

    db.commit()

    log_activity(
        db,
        module="RIDE_REWARD",
        action="UPDATE",
        entity_id=reward.id,
        entity_name=reward.title,
        description=f"Ride reward '{reward.title}' updated"
    )

    return {"success": True}
@app.post("/api/v1/admin/ride-rewards/status")
def toggle_ride_reward_status(payload: dict, db: Session = Depends(get_db)):
    reward = db.query(RideRewardMaster).filter(
        RideRewardMaster.id == payload["id"],
        RideRewardMaster.is_deleted == False
    ).first()

    reward.is_active = payload["is_active"]
    db.commit()

    log_activity(
        db,
        module="RIDE_REWARD",
        action="ACTIVATE" if payload["is_active"] else "DEACTIVATE",
        entity_id=reward.id,
        entity_name=reward.title,
        description=f"Ride reward '{reward.title}' status changed"
    )

    return {"success": True}
@app.post("/api/v1/admin/ride-rewards/delete")
def delete_ride_reward(payload: dict, db: Session = Depends(get_db)):
    reward = db.query(RideRewardMaster).filter(
        RideRewardMaster.id == payload["id"],
        RideRewardMaster.is_deleted == False
    ).first()

    reward.is_deleted = True
    reward.is_active = False
    db.commit()

    log_activity(
        db,
        module="RIDE_REWARD",
        action="DELETE",
        entity_id=reward.id,
        entity_name=reward.title,
        description=f"Ride reward '{reward.title}' deleted"
    )

    return {"success": True}
@app.get("/api/v1/admin/emergency-contacts")
def get_admin_emergency_contacts(db: Session = Depends(get_db)):
    return db.query(EmergencyContact).filter(
        EmergencyContact.is_system == True,
        EmergencyContact.is_deleted == False
    ).order_by(EmergencyContact.created_at.desc()).all()

@app.post("/api/v1/admin/emergency-contacts/create")
def create_admin_emergency_contact(data: dict, db: Session = Depends(get_db)):
    contact = EmergencyContact(
        phone_number="SYSTEM",
        contact_name=data["contact_name"],
        contact_number=data["contact_number"],
        share_live_location=data.get("share_live_location", False),
        is_system=True
    )

    db.add(contact)
    db.commit()
    db.refresh(contact)

    log_activity(
        db,
        module="EMERGENCY_CONTACT",
        action="CREATE",
        entity_id=contact.id,
        entity_name=contact.contact_name,
        description="System emergency contact created"
    )

    return {"success": True}
@app.post("/api/v1/admin/emergency-contacts/update")
def update_admin_emergency_contact(data: dict, db: Session = Depends(get_db)):
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == data["id"],
        EmergencyContact.is_system == True,
        EmergencyContact.is_deleted == False
    ).first()

    if not contact:
        raise HTTPException(404, "Contact not found")

    contact.contact_name = data.get("contact_name", contact.contact_name)
    contact.contact_number = data.get("contact_number", contact.contact_number)
    contact.share_live_location = data.get(
        "share_live_location",
        contact.share_live_location
    )

    db.commit()

    log_activity(
        db,
        module="EMERGENCY_CONTACT",
        action="UPDATE",
        entity_id=contact.id,
        entity_name=contact.contact_name,
        description="System emergency contact updated"
    )

    return {"success": True}
@app.post("/api/v1/admin/emergency-contacts/delete")
def delete_admin_emergency_contact(data: dict, db: Session = Depends(get_db)):
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == data["id"],
        EmergencyContact.is_system == True,
        EmergencyContact.is_deleted == False
    ).first()

    if not contact:
        raise HTTPException(404, "Contact not found")

    contact.is_deleted = True
    db.commit()

    log_activity(
        db,
        module="EMERGENCY_CONTACT",
        action="DELETE",
        entity_id=contact.id,
        entity_name=contact.contact_name,
        description="System emergency contact deleted"
    )

    return {"success": True}
@app.post("/api/v1/admin/emergency-contacts/status")
def toggle_emergency_contact_status(data: dict, db: Session = Depends(get_db)):
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == data["id"],
        EmergencyContact.is_system == True,
        EmergencyContact.is_deleted == False
    ).first()

    if not contact:
        raise HTTPException(404, "Contact not found")

    contact.is_active = data["is_active"]
    db.commit()

    log_activity(
        db,
        module="EMERGENCY_CONTACT",
        action="ACTIVATE" if data["is_active"] else "DEACTIVATE",
        entity_id=contact.id,
        entity_name=contact.contact_name,
        description=f"Emergency contact status changed"
    )

    return {"success": True}


from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
BASE_URL = "http://192.168.1.13:8000"

def build_image_url(path: str | None):
    if not path:
        return None
    if path.startswith("http"):
        return path
    if path.startswith("/"):
        return f"{BASE_URL}{path}"
    print("Building image URL for path:", path)
    return f"{BASE_URL}/{path}"

from fastapi import Query, HTTPException
from sqlalchemy.orm import Session
from models import DocumentVerification, DocumentStatus
from database import get_db
# @app.get("/api/v1/admin/documents")
# def admin_list_documents(
#     status: str = Query("pending"),
#     page: int = 1,
#     limit: int = 20,
#     db: Session = Depends(get_db)
# ):
#     offset = (page - 1) * limit

#     query = db.query(DocumentVerification)

#     # ✅ ENUM SAFE FILTER
#     if status != "all":
#         try:
#             query = query.filter(
#                 DocumentVerification.status == DocumentStatus(status)
#             )
#         except ValueError:
#             raise HTTPException(400, "Invalid status")

#     total = query.count()

#     documents = (
#         query.order_by(desc(DocumentVerification.submitted_at))
#         .offset(offset)
#         .limit(limit)
#         .all()
#     )

#     result = []
#     for doc in documents:
#         user = db.query(User).filter(
#             User.phone_number == doc.phone_number
#         ).first()

#         result.append({
#             "id": doc.id,
#             "phone_number": doc.phone_number,
#             "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
#             "document_type": doc.document_type.value,
#             "document_number": doc.document_number,
#             "document_name": doc.document_name,
#             "status": doc.status.value,
#             "front_image_url": build_image_url(doc.front_image_path),
#             "back_image_url": build_image_url(doc.back_image_path),
#             "selfie_image_url": build_image_url(doc.selfie_image_path),
#             "issue_date": doc.issue_date.isoformat() if doc.issue_date else None,
#             "expiry_date": doc.expiry_date.isoformat() if doc.expiry_date else None,
#             "is_expired": doc.is_expired,
#             "submitted_at": doc.submitted_at.isoformat(),
#             "verified_by": doc.verified_by,
#             "verified_at": doc.verified_at.isoformat() if doc.verified_at else None,
#             "rejection_reason": doc.rejection_reason,
#             "document_data": doc.document_data
#         })

#     return {
#         "success": True,
#         "documents": result,
#         "pagination": {
#             "page": page,
#             "limit": limit,
#             "total": total,
#             "pages": (total + limit - 1) // limit
#         }
#     }

@app.get("/api/v1/admin/documents")
def admin_list_documents(
    status: str = "pending",
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(DocumentVerification)

    if status != "all":
        try:
            query = query.filter(
                DocumentVerification.status == DocumentStatus(status)
            )
        except ValueError:
            raise HTTPException(400, "Invalid status")

    total = query.count()

    docs = (
        query
        .order_by(DocumentVerification.submitted_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    result = []
    for doc in docs:
        user = db.query(User).filter(
            User.phone_number == doc.phone_number
        ).first()

        result.append({
            "id": doc.id,
            "phone_number": doc.phone_number,
            "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
            "document_type": doc.document_type.value,
            "document_number": doc.document_number,
            "status": doc.status.value,
            "submitted_at": doc.submitted_at.isoformat(),
           "front_image_url": build_image_url(doc.front_image_path),
            "back_image_url": build_image_url(doc.back_image_path),
            "selfie_image_url": build_image_url(doc.selfie_image_path),
            "rejection_reason": doc.rejection_reason
        })

    return {
        "documents": result,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total
        }
    }
class DocumentUpdateStatus(BaseModel):
    document_id: int
    status: str                # approved | rejected
    rejection_reason: Optional[str] = None
    admin_username: str
@app.put("/api/v1/documents/status")
def update_document_status(
    data: DocumentUpdateStatus,
    db: Session = Depends(get_db)
):
    document = db.query(DocumentVerification).filter(
        DocumentVerification.id == data.document_id
    ).first()

    if not document:
        raise HTTPException(404, "Document not found")

    if data.status == "approved":
        document.status = DocumentStatus.APPROVED
        document.rejection_reason = None

    elif data.status == "rejected":
        if not data.rejection_reason:
            raise HTTPException(400, "Rejection reason required")
        document.status = DocumentStatus.REJECTED
        document.rejection_reason = data.rejection_reason

    else:
        raise HTTPException(400, "Invalid status")

    document.verified_by = data.admin_username
    document.verified_at = datetime.now(timezone.utc)
    document.updated_at = datetime.now(timezone.utc)

    # 🔒 Audit log
    db.add(
        VerificationLog(
            document_id=document.id,
            admin_id=1,  # replace with admin session id later
            action=data.status,
            notes=data.rejection_reason
        )
    )
    log_activity(
        db,
        module="DOCUMENT_VERIFICATION",
        action=data.status.upper(),
        entity_id=document.id,
        entity_name=document.document_name,
        description=f"Document ID {document.id} marked as {data.status}"
    )
    db.commit()

    return {
        "success": True,
        "document_id": document.id,
        "status": document.status.value
    }
@app.get("/api/v1/admin/documents/{document_id}/history")
def get_document_history(
    document_id: int,
    db: Session = Depends(get_db)
):
    logs = (
        db.query(VerificationLog)
        .filter(VerificationLog.document_id == document_id)
        .order_by(VerificationLog.created_at.desc())
        .all()
    )
    log_activity(
        db,
        module="DOCUMENT_VERIFICATION",
        action="VIEW_HISTORY",
        entity_id=document_id,
        description=f"Viewed verification history for document ID {document_id}"
    )
    return [
        {
            "id": log.id,
            "action": log.action,
            "notes": log.notes,
            "created_at": log.created_at.isoformat()
        }
        for log in logs
    ]
@app.put("/api/v1/admin/documents/{document_id}/review")
def mark_under_review(
    document_id: int,
    admin_username: str,
    db: Session = Depends(get_db)
):
    doc = db.query(DocumentVerification).get(document_id)

    if not doc:
        raise HTTPException(404, "Document not found")

    doc.status = DocumentStatus.UNDER_REVIEW
    doc.verified_by = admin_username
    doc.updated_at = datetime.now(timezone.utc)

    db.add(
        VerificationLog(
            document_id=doc.id,
            admin_id=1,
            action="under_review",
            notes="Marked under review"
        )
    )
    log_activity(
        db,
        module="DOCUMENT_VERIFICATION",
        action="UNDER_REVIEW",
        entity_id=doc.id,
        entity_name=doc.document_name,
        description=f"Document ID {doc.id} marked as under review"
    )
    db.commit()
    return {"success": True}
from pydantic import BaseModel
from typing import List

class CityOut(BaseModel):
    id: int
    name: str
    active: bool

    class Config:
        orm_mode = True


class StateOut(BaseModel):
    id: int
    name: str
    active: bool
    cities: List[CityOut]

    class Config:
        orm_mode = True
@app.post("/api/v1/admin/state-city/list", response_model=list[StateOut])
def list_states(db: Session = Depends(get_db)):
    return db.query(State).order_by(State.name).all()
@app.post("/api/v1/admin/state/add")
def add_state(data: dict, db: Session = Depends(get_db)):
    if db.query(State).filter_by(name=data["name"]).first():
        raise HTTPException(400, "State already exists")

    db.add(State(name=data["name"]))
    db.commit()
    log_activity(
        db,
        module="STATE_CITY",
        action="ADD_STATE",
        description=f"Added state '{data['name']}'"
    )
    return {"success": True}
@app.post("/api/v1/admin/state/add")
def add_state(data: dict, db: Session = Depends(get_db)):
    if db.query(State).filter_by(name=data["name"]).first():
        raise HTTPException(400, "State already exists")

    db.add(State(name=data["name"]))
    db.commit()
    log_activity(
        db,
        module="STATE_CITY",
        action="ADD_STATE",
        description=f"Added state '{data['name']}'"
    )
    return {"success": True}
@app.post("/api/v1/admin/state/update")
def update_state(data: dict, db: Session = Depends(get_db)):
    state = db.get(State, data["id"])
    if not state:
        raise HTTPException(404)

    state.name = data.get("name", state.name)
    state.active = data.get("active", state.active)
    db.commit()
    log_activity(
        db,
        module="STATE_CITY",
        action="UPDATE_STATE",
        description=f"Updated state '{state.name}'"
    )
    return {"success": True}
@app.post("/api/v1/admin/state/delete")
def delete_state(data: dict, db: Session = Depends(get_db)):
    state = db.get(State, data["id"])
    if not state:
        raise HTTPException(404)

    db.delete(state)
    db.commit()
    log_activity(
        db,
        module="STATE_CITY",
        action="DELETE_STATE",
        description=f"Deleted state '{state.name}'"
    )
    return {"success": True}
@app.post("/api/v1/admin/city/add")
def add_city(data: dict, db: Session = Depends(get_db)):
    db.add(City(
        name=data["name"],
        state_id=data["state_id"]
    ))
    db.commit()
    log_activity(
        db,
        module="STATE_CITY",
        action="ADD_CITY",
        description=f"Added city '{data['name']}'"
    )
    return {"success": True}

@app.post("/api/v1/admin/city/update")
def update_city(data: dict, db: Session = Depends(get_db)):
    city = db.get(City, data["id"])
    if not city:
        raise HTTPException(404)

    city.name = data.get("name", city.name)
    city.active = data.get("active", city.active)
    db.commit()
    log_activity(
        db,
        module="STATE_CITY",
        action="UPDATE_CITY",
        description=f"Updated city '{city.name}'"
    )
    return {"success": True}
@app.post("/api/v1/admin/city/delete")
def delete_city(data: dict, db: Session = Depends(get_db)):
    city = db.get(City, data["id"])
    if not city:
        raise HTTPException(404)

    db.delete(city)
    db.commit()
    log_activity(
        db,
        module="STATE_CITY",
        action="DELETE_CITY",
        description=f"Deleted city '{city.name}'"
    )
    return {"success": True}
# utils/security.py
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

# schemas/admin_auth.py
from pydantic import BaseModel
from typing import List

class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminLoginResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    is_superadmin: bool
    permissions: list
# main.py
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from models import AdminUser

from database import get_db

@app.post("/api/v1/admin/login", response_model=AdminLoginResponse)
def admin_login(data: AdminLoginRequest, db: Session = Depends(get_db)):

    admin = db.query(AdminUser).filter(
        AdminUser.username == data.username,
        AdminUser.is_active == True
    ).first()

    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Update last login
    admin.last_login = datetime.now(timezone.utc)
    db.commit()

    return AdminLoginResponse(
        id=admin.id,
        username=admin.username,
        full_name=admin.full_name,
        email=admin.email,
        is_superadmin=admin.is_superadmin,
        permissions=admin.permissions or []
    )
# main.py
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from models import AdminUser

from pydantic import BaseModel
from typing import List

class AboutUsReorder(BaseModel):
    id: int
    sort_order: int
@app.post("/api/v1/admin/about-us/reorder")
def reorder_about_us(
    items: List[AboutUsReorder],
    db: Session = Depends(get_db)
):
    for item in items:
        db.query(AboutUs).filter(
            AboutUs.id == item.id
        ).update(
            {"sort_order": item.sort_order}
        )

    db.commit()
    return {"message": "Order updated successfully"}
class UserFeedbackCreate(BaseModel):
    phone_number: str = Field(..., max_length=20)
    rating: int = Field(..., ge=1, le=5)
    reason: Optional[str] = None
class UserFeedbackOut(BaseModel):
    id: int
    phone_number: str
    rating: int
    reason: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True
@app.get("/api/v1/admin/feedback", response_model=List[UserFeedbackOut])
def get_feedback(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    feedback = (
        db.query(UserFeedback)
        .order_by(UserFeedback.created_at.desc())
        .limit(limit)
        .all()
    )

    return feedback  # ✅ MUST RETURN A LIST
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

@app.get("/api/v1/admin/documen/stats")
def admin_user_stats(db: Session = Depends(get_db)):

    total_users = db.query(User).count()

    active_users = db.query(User).filter(
        User.status == UserStatus.ACTIVE
    ).count()

    suspended_users = db.query(User).filter(
        User.status == UserStatus.SUSPENDED
    ).count()

   

    daily_rides = db.query(Ride).filter(
        func.date(Ride.created_at) == date.today()
    ).count()

    return {
        "stats": {
            "total_users": total_users,
            "active_users": active_users,
            "suspended_users": suspended_users,
            "daily_rides": daily_rides
        }
    }

if __name__ == "__main__":
    print("🚀 Starting DRIVVE Working Server...")
    print("🌐 Network accessible on:")
    print("   - http://localhost:8000")
    print("   - http://192.168.1.13:8000")
    print("📚 API Docs: http://192.168.1.13:8000/docs")
    print("❤️ Health: http://192.168.1.13:8000/health")
    print("=" * 60)
   
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        access_log=True
    )