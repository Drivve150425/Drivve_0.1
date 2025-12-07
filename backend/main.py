from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
import random
import string
import uvicorn
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os
from typing import Dict


# Import your existing modules
from database import engine, get_db, Base
from models import User, OTPVerification, UserStatus
from user_id_generator import generate_user_id


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
    current_time = datetime.utcnow()
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
        "timestamp": datetime.utcnow().isoformat(),
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
            "timestamp": datetime.utcnow().isoformat(),
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
            "timestamp": datetime.utcnow().isoformat()
        }


@app.post("/api/send-otp")
async def send_otp(phone_data: dict, db: Session = Depends(get_db)):
    """Send OTP for phone verification"""
    try:
        phone_number = phone_data.get("phone_number")
        country_code = phone_data.get("country_code", "+91")
       
        if not phone_number:
            raise HTTPException(status_code=400, detail="Phone number required")
       
        otp_code = generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=10)
       
        otp_entry = OTPVerification(
            phone_number=phone_number,
            otp_code=otp_code,
            expires_at=expires_at
        )
        db.add(otp_entry)
        db.commit()
       
        return {
            "message": "OTP sent successfully ✅",
            "otp": otp_code,  # Remove in production
            "phone_number": phone_number,
            "expires_in": "10 minutes",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"OTP generation failed: {str(e)}")


@app.post("/api/verify-otp")
async def verify_otp(otp_data: dict, db: Session = Depends(get_db)):
    """Verify OTP and handle user creation"""
    try:
        phone_number = otp_data.get("phone_number")
        otp_code = otp_data.get("otp_code")
        country_code = otp_data.get("country_code", "+91")
       
        if not phone_number or not otp_code:
            raise HTTPException(status_code=400, detail="Phone number and OTP required")
       
        otp_entry = db.query(OTPVerification).filter(
            OTPVerification.phone_number == phone_number,
            OTPVerification.otp_code == otp_code,
            OTPVerification.expires_at > datetime.utcnow(),
            OTPVerification.is_verified == False
        ).first()
       
        if not otp_entry:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
       
        otp_entry.is_verified = True
       
        user = db.query(User).filter(User.phone_number == phone_number).first()
       
        if user:
            user.is_phone_verified = True
            db.commit()
           
            return {
                "message": "OTP verified - Existing user ✅",
                "user_id": user.id,
                "custom_user_id": user.user_id,
                "is_first_time": False,
                "profile_completed": user.profile_completed,
                "status": user.status.value if user.status else "pending",
                "first_name": user.first_name
            }
        else:
            new_user = User(
                phone_number=phone_number,
                country_code=country_code,
                is_phone_verified=True,
                status=UserStatus.PENDING,
                profile_completed=False
            )
            db.add(new_user)
            db.commit()
           
            return {
                "message": "OTP verified - New user created ✅",
                "user_id": new_user.id,
                "custom_user_id": None,
                "is_first_time": True,
                "profile_completed": False,
                "status": "pending"
            }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"OTP verification failed: {str(e)}")


@app.post("/api/v1/users/check")
async def check_user_exists(user_check: dict, db: Session = Depends(get_db)):
    """Check if user exists by phone number"""
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
       
        if user and user.profile_completed:
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
        else:
            return {"exists": False, "user_data": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"User check failed: {str(e)}")


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
        if not user:
            raise HTTPException(status_code=404, detail="User not found. Verify phone first.")
       
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
        user.updated_at = datetime.utcnow()
       
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
        expires_at = datetime.utcnow() + timedelta(minutes=5)
       
        # Store OTP
        email_otp_store[email] = {
            "otp": otp,
            "expires_at": expires_at,
            "created_at": datetime.utcnow()
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
       
        if datetime.utcnow() > stored_data["expires_at"]:
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


# ========================= START SERVER =========================


if __name__ == "__main__":
    print("🚀 Starting DRIVVE Working Server...")
    print("🌐 Network accessible on:")
    print("   - http://localhost:8000")
    print("   - http://192.168.1.43:8000")
    print("📚 API Docs: http://192.168.1.43:8000/docs")
    print("❤️ Health: http://192.168.1.43:8000/health")
    print("=" * 60)
   
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        access_log=True
    )