
from datetime import datetime, timezone
import os
import shutil
from typing import Optional
import uuid
from pydantic import BaseModel
from models import  User
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, File, Form, HTTPException, UploadFile
from drivve_api.app_config import create_app
import requests

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
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
from fastapi import APIRouter

router = APIRouter()
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URLS")

@router.get("/api/v1/users/profile")
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


@router.put("/api/v1/users/update-profile-picture")
async def update_profile_picture(
    phone_number: str = Form(...),
    profile_picture: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.phone_number == phone_number
    ).first()

    if not user:
        raise HTTPException(404, "User not found")

    try:

        filename = f"{uuid.uuid4()}.jpg"
        file_path = f"profile/{filename}"

        file_bytes = await profile_picture.read()

        image_url = upload_to_supabase(file_bytes, file_path)

        user.profile_picture = image_url
        db.commit()

        return {
            "success": True,
            "profile_picture": image_url
        }

    except Exception as e:
        db.rollback()
        print("IMAGE UPDATE ERROR:", e)
        raise HTTPException(500, "Failed to upload image")

@router.put("/api/v1/users/updateprofile")
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


class UpdateAvatarRequest(BaseModel):
    phone_number: str
    avatar_name: str   # avatarD1.svg
@router.put("/api/v1/users/update-avatar")
async def update_avatar(data: UpdateAvatarRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == data.phone_number).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        # Define the avatar file path in Supabase
        avatar_filename = data.avatar_name
        avatar_file_path = f"avatars/{avatar_filename}"
        
        # Check if the avatar file exists in your local assets
        # You need to upload these SVG files to Supabase first
        avatar_url = f"{SUPABASE_URL}/storage/v1/object/public/drivve/{avatar_file_path}"
        
        # Update user's profile_picture with the avatar URL
        user.profile_picture = avatar_url
        user.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        
        return {
            "success": True,
            "profile_picture": avatar_url,
            "avatar_name": avatar_filename
        }
        
    except Exception as e:
        db.rollback()
        print(f"Avatar update error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update avatar: {str(e)}")