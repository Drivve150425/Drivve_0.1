import base64
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
import random
import string
from typing import Dict
import uuid

import requests
from user_id_generator import generate_user_id
import aiosmtplib
from pydantic import BaseModel, EmailStr
from models import  User, UserStatus
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException

from fastapi import APIRouter

router = APIRouter()
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URLS")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
print("URL:", SUPABASE_URL)
print("KEY:", SUPABASE_KEY)
def upload_to_supabase(file_bytes, file_path):
    url = f"{SUPABASE_URL}/storage/v1/object/drivve/{file_path}?upsert=true"

    headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "apikey": SUPABASE_KEY,
            "Content-Type": "image/jpeg"
        }

    response = requests.put(url, headers=headers, data=file_bytes)

    if response.status_code not in [200, 201]:
        raise Exception(f"Upload failed: {response.text}")

    return f"{SUPABASE_URL}/storage/v1/object/public/drivve/{file_path}"
class EmailOTPRequest(BaseModel):
    email: EmailStr
# In-memory storage for email OTPs
email_otp_store: Dict[str, Dict] = {}
EMAIL_USER = os.getenv("EMAIL_USER", "your-email@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "your-app-password")
EMAIL_FROM = os.getenv("EMAIL_FROM", "DRIVVE <noreply@drivve.com>")

# PROFILE_UPLOAD_DIR = "uploads/profile_pictures"
# os.makedirs(PROFILE_UPLOAD_DIR, exist_ok=True)

class EmailOTPVerify(BaseModel):
    email: EmailStr
    otp: str

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def cleanup_expired_email_otps():
    """Remove expired OTPs"""
    current_time = datetime.now(timezone.utc)

    expired = [email for email, data in email_otp_store.items()
               if current_time > data["expires_at"]]
    for email in expired:
        del email_otp_store[email]
        print(f"🗑️ Cleaned up expired OTP for {email}")


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

@router.post("/auth/send-email-otp")
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


@router.post("/auth/verify-email-otp")
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
        

def build_image_url(path: str | None):
    if not path:
        return None
    if path.startswith("http"):
        return path
    if path.startswith("/"):
        return f"{BASE_URL}{path}"
    return f"{BASE_URL}/{path}"

@router.post("/api/v1/users/create")
async def create_user_profile(profile_data: dict, db: Session = Depends(get_db)):
    try:

        phone_number = profile_data.get("phone_number")
        first_name = profile_data.get("first_name")
        last_name = profile_data.get("last_name")

        if not phone_number or not first_name:
            raise HTTPException(
                status_code=400,
                detail="Phone number and first name required"
            )

        # ✅ Check user
        user = db.query(User).filter(
            User.phone_number == phone_number
        ).first()

        if not user:
            user = User(
                phone_number=phone_number,
                country_code=profile_data.get("country_code", "+91"),
                is_phone_verified=True,
                status=UserStatus.PENDING,
                profile_completed=False
            )
            db.add(user)

        # ================= IMAGE =================


        image_url = None
        base64_image = profile_data.get("profile_image")

        if base64_image:
            try:
                if "base64," in base64_image:
                    base64_image = base64_image.split("base64,")[1]

                # Fix padding
                missing_padding = len(base64_image) % 4
                if missing_padding:
                    base64_image += "=" * (4 - missing_padding)

                image_bytes = base64.b64decode(base64_image)

                filename = f"{uuid.uuid4()}.jpg"
                file_path = f"profile/{filename}"   # 👈 folder inside drivve bucket

                image_url = upload_to_supabase(image_bytes, file_path)
            except Exception as img_error:
                print("SUPABASE IMAGE ERROR:", img_error)
                raise HTTPException(
                    status_code=500,
                    detail=f"Image upload failed: {str(img_error)}"
                )

        # ================= DATE FIX =================

        dob = profile_data.get("date_of_birth")

        parsed_dob = None
        if dob:
            try:
                parsed_dob = datetime.strptime(
                    dob, "%Y-%m-%d"
                ).date()
            except:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid date format. Use YYYY-MM-DD"
                )

        # ================= UPDATE =================

        user.user_id = generate_user_id(
            first_name, last_name, phone_number
        )

        user.first_name = first_name
        user.last_name = last_name
        user.full_name = f"{first_name} {last_name or ''}".strip()
        user.email = profile_data.get("email")
        user.email_verified = profile_data.get("email_verified", False)
        user.date_of_birth = parsed_dob
        user.gender = profile_data.get("gender")
        user.state = profile_data.get("state")
        user.city = profile_data.get("city")
        user.referral_code = profile_data.get("referral_code")

        user.profile_picture =image_url


        user.avatar = profile_data.get("avatar")
        user.profile_completed = True
        user.status = UserStatus.ACTIVE
        user.updated_at = datetime.now(timezone.utc)

        # ✅ SINGLE COMMIT
        db.commit()
        db.refresh(user)

        return {
            "success": True,
            "message": "Profile created successfully ✅",
            "user_id": user.user_id,
"profile_picture": user.profile_picture or (
    f"{SUPABASE_URL}/storage/v1/object/public/drivve/{user.avatar}"
    if user.avatar else None
) 
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print("CREATE PROFILE ERROR:", str(e))
        raise HTTPException(500, str(e))
