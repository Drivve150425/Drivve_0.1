import base64
from datetime import datetime, timedelta, timezone

import os
import random
import string
from typing import Dict
import uuid

import requests
from user_id_generator import generate_user_id
from pydantic import BaseModel, EmailStr
from models import User, UserStatus
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter
from gotrue import SyncGoTrueClient
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
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE")

auth_client = SyncGoTrueClient(
    url=f"{SUPABASE_URL}/auth/v1",
    headers={
        "apikey": SUPABASE_ANON_KEY
    }
)

class EmailOTPRequest(BaseModel):
    email: EmailStr

class EmailOTPVerify(BaseModel):
    email: EmailStr
    otp: str
email_otp_store: Dict[str, Dict] = {}
EMAIL_USER =" os.getenv("EMAIL_USER")"
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD") 
EMAIL_FROM = os.getenv("EMAIL_FROM")


def generate_otp():
    return ''.join(random.choices(string.digits, k=6))
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


@router.post("/auth/send-email-otp")
async def send_email_otp(request: EmailOTPRequest):

    try:
        otp = generate_otp()

        # Store OTP for 5 mins
        email_otp_store[request.email] = {
            "otp": otp,
            "expires": datetime.utcnow() + timedelta(minutes=5)
        }

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "DRIVVE Email Verification OTP"
        msg["From"] = EMAIL_FROM
        msg["To"] = request.email

        html = f"""
        <div style="font-family: Arial;">
            <h2>DRIVVE Email Verification</h2>
            <p>Your OTP is:</p>
            <h1>{otp}</h1>
            <p>Valid for 5 minutes.</p>
        </div>
        """

        msg.attach(MIMEText(html, "html"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.sendmail(
            EMAIL_USER,
            request.email,
            msg.as_string()
        )
        server.quit()

        return {
            "success": True,
            "message": "OTP sent successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
@router.post("/auth/verify-email-otp")
async def verify_email_otp(request: EmailOTPVerify):

    data = email_otp_store.get(request.email)

    if not data:
        raise HTTPException(
            status_code=400,
            detail="OTP not found"
        )

    if datetime.utcnow() > data["expires"]:
        del email_otp_store[request.email]

        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )

    if data["otp"] != request.otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    del email_otp_store[request.email]

    return {
        "success": True,
        "message": "Email verified successfully"
    }

def get_email_html(otp: str) -> str:
    return f"<h2>Your OTP: {otp}</h2>"


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