import base64
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
import random
import string
from typing import Dict
import uuid
import smtplib
import aiosmtplib
import requests
from user_id_generator import generate_user_id
from pydantic import BaseModel, EmailStr
from models import User, UserStatus
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter

from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

BASE_URL = os.getenv("BASE_URLS")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")


# ================= SUPABASE UPLOAD =================

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


# ================= EMAIL OTP =================

class EmailOTPRequest(BaseModel):
    email: EmailStr

class EmailOTPVerify(BaseModel):
    email: EmailStr
    otp: str

email_otp_store: Dict[str, Dict] = {}

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM", "DRIVVE <noreply@drivve.com>")


def generate_otp():
    return ''.join(random.choices(string.digits, k=6))
async def send_email(to_email: str, otp: str):

    message = MIMEMultipart("alternative")
    message["From"] = EMAIL_FROM
    message["To"] = to_email
    message["Subject"] = "DRIVVE - Email Verification Code"

    html_part = MIMEText(get_email_html(otp), "html")
    message.attach(html_part)

    try:

        smtp = aiosmtplib.SMTP(
            hostname="smtp.gmail.com",
            port=465,
            use_tls=True,
            timeout=30
        )

        await smtp.connect()

        await smtp.login(EMAIL_USER, EMAIL_PASSWORD)

        await smtp.send_message(message)

        await smtp.quit()

        print(f"✅ Email sent successfully to {to_email}")

    except Exception as e:

        print(f"❌ Email send error: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail=f"Failed to send email: {str(e)}"
        )

def get_email_html(otp: str) -> str:
    return f"<h2>Your OTP: {otp}</h2>"


@router.post("/auth/send-email-otp")
async def send_email_otp(request: EmailOTPRequest):
    email = request.email.lower()
    otp = generate_otp()

    email_otp_store[email] = {
        "otp": otp,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=5)
    }

    await send_email(email, otp)

    return {"success": True}


@router.post("/auth/verify-email-otp")
async def verify_email_otp(request: EmailOTPVerify):
    email = request.email.lower()

    if email not in email_otp_store:
        raise HTTPException(404, "OTP not found")

    if email_otp_store[email]["otp"] != request.otp:
        raise HTTPException(400, "Invalid OTP")

    del email_otp_store[email]

    return {"success": True}


# ================= CREATE PROFILE =================

@router.post("/api/v1/users/create")
async def create_user_profile(profile_data: dict, db: Session = Depends(get_db)):
    try:
        phone_number = profile_data.get("phone_number")
        first_name = profile_data.get("first_name")
        last_name = profile_data.get("last_name")

        if not phone_number or not first_name:
            raise HTTPException(400, "Phone number and first name required")

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

        # ================= IMAGE / AVATAR =================

        avatar_name = profile_data.get("avatar")
        base64_image = profile_data.get("profile_image")

        # 🔥 PRIORITY: IMAGE > AVATAR
        if base64_image:
            try:
                if "base64," in base64_image:
                    base64_image = base64_image.split("base64,")[1]

                missing_padding = len(base64_image) % 4
                if missing_padding:
                    base64_image += "=" * (4 - missing_padding)

                image_bytes = base64.b64decode(base64_image)

                filename = f"{uuid.uuid4()}.jpg"
                file_path = f"profile/{filename}"

                image_url = upload_to_supabase(image_bytes, file_path)

                user.profile_picture = image_url

            except Exception as e:
                raise HTTPException(500, f"Image upload failed: {str(e)}")

        elif avatar_name:
            user.profile_picture = (
                f"{SUPABASE_URL}/storage/v1/object/public/drivve/avatars/{avatar_name}"
            )

        else:
            user.profile_picture = None

        # ================= OTHER FIELDS =================

        user.user_id = generate_user_id(first_name, last_name, phone_number)
        user.first_name = first_name
        user.last_name = last_name
        user.full_name = f"{first_name} {last_name or ''}".strip()
        user.email = profile_data.get("email")
        user.email_verified = profile_data.get("email_verified", False)

        dob = profile_data.get("date_of_birth")
        if dob:
            user.date_of_birth = datetime.strptime(dob, "%Y-%m-%d").date()

        user.gender = profile_data.get("gender")
        user.state = profile_data.get("state")
        user.city = profile_data.get("city")
        user.referral_code = profile_data.get("referral_code")

        user.profile_completed = True
        user.status = UserStatus.ACTIVE
        user.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(user)

        return {
            "success": True,
            "message": "Profile created successfully ✅",
            "user_id": user.user_id,
            "profile_picture": user.profile_picture
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))
    
    
# ================= ADMIN - GET ALL USERS =================

@router.get("/api/v1/admin/users/list")
async def get_all_users(db: Session = Depends(get_db)):
    """Get all users for admin filter dropdown"""
    try:
        users = db.query(User).filter(
            User.status == UserStatus.ACTIVE,
            User.profile_completed == True
        ).all()
        
        users_data = []
        for user in users:
            users_data.append({
                "user_id": user.user_id,  # String like "D-SV2310"
                "name": user.full_name or f"{user.first_name} {user.last_name or ''}".strip(),
                "phone": user.phone_number,
                "email": user.email or ""
            })
        
        return {
            "success": True,
            "users": users_data
        }
    except Exception as e:
        print(f"❌ Error in get_all_users: {str(e)}")
        raise HTTPException(500, str(e))