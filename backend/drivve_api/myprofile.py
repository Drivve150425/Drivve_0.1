from datetime import datetime, timezone
import os
from typing import Optional
import uuid
from pydantic import BaseModel
from models import User
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, File, Form, HTTPException, UploadFile
import requests
from fastapi import APIRouter
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
BASE_URL = os.getenv("BASE_URLS")


# ─────────────────────────────────────────────────────────────────────────────
# Helper: Upload file to Supabase Storage
# ─────────────────────────────────────────────────────────────────────────────

def upload_to_supabase(file_bytes, file_path):
    url = f"{SUPABASE_URL}/storage/v1/object/drivve/{file_path}?upsert=true"
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
        "Content-Type": "image/jpeg",
    }
    response = requests.put(url, headers=headers, data=file_bytes)
    if response.status_code not in [200, 201]:
        raise Exception(f"Upload failed: {response.text}")
    return f"{SUPABASE_URL}/storage/v1/object/public/drivve/{file_path}"


# ─────────────────────────────────────────────────────────────────────────────
# Helper: safe attribute read (returns False if column doesn't exist yet)
# ─────────────────────────────────────────────────────────────────────────────

def safe_bool(obj, attr):
    try:
        return bool(getattr(obj, attr))
    except AttributeError:
        return False


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/users/profile   (private — own profile)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/api/v1/users/profile")
async def get_user_profile(phone_number: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == phone_number).first()

    if not user:
        return {"success": False, "message": "User not found"}

    return {
        "success": True,
        "user": {
            "phone_number":    user.phone_number,
            "first_name":      user.first_name,
            "last_name":       user.last_name,
            "full_name":       user.full_name,
            "email":           user.email,
            "gender":          user.gender,
            "date_of_birth":   user.date_of_birth.isoformat() if user.date_of_birth else None,
            "state":           user.state,
            "city":            user.city,
            "profile_picture": user.profile_picture,
            "created_at":      user.created_at.isoformat() if user.created_at else None,
            "bio":             user.bio,
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/users/profile-public   (public — view another user's profile)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/api/v1/users/profile-public")
async def get_public_user_profile(
    phone_number: str = None,
    user_id: str = None,
    db: Session = Depends(get_db),
):
    """
    Public profile view for drivers / passengers.
    Pass either phone_number or user_id (the custom D-XXXXX id).
    """

    # ── Resolve user ──────────────────────────────────────────────────────────
    query = db.query(User)
    if user_id:
        user = query.filter(User.user_id == user_id).first()
    elif phone_number:
        user = query.filter(User.phone_number == phone_number).first()
    else:
        raise HTTPException(status_code=400, detail="Provide phone_number or user_id")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ── Vehicle ───────────────────────────────────────────────────────────────
    # Only selects columns that actually exist in the vehicles table.
    # 'type' is intentionally excluded — add it back after running the migration.
    vehicle_sql = text("""
        SELECT make, model, color, year, registration_number, photo_url
        FROM vehicles
        WHERE phone_number = :phone
        ORDER BY id DESC
        LIMIT 1
    """)
    vehicle_row = db.execute(vehicle_sql, {"phone": user.phone_number}).mappings().first()

    # ── Ride statistics ───────────────────────────────────────────────────────
    posted_rides_count = db.execute(
        text("""
            SELECT COUNT(*) FROM rides
            WHERE phone_number = :phone
              AND status != 'cancelled'
              AND is_deleted = false
        """),
        {"phone": user.phone_number},
    ).scalar() or 0

    booked_rides_count = db.execute(
        text("""
            SELECT COUNT(*) FROM ride_bookings
            WHERE passenger_phone = :phone
              AND status != 'cancelled'
        """),
        {"phone": user.phone_number},
    ).scalar() or 0

    cancelled_rides_count = db.execute(
        text("""
            SELECT COUNT(*) FROM rides
            WHERE phone_number = :phone
              AND status = 'cancelled'
              AND is_deleted = false
        """),
        {"phone": user.phone_number},
    ).scalar() or 0

    # ── On-time rate ──────────────────────────────────────────────────────────
    # Requires actual_departure_time column. Falls back to 98 if missing.
    try:
        on_time_rate = db.execute(
            text("""
                SELECT ROUND(
                    100.0 * COUNT(CASE WHEN actual_departure_time <= departure_time THEN 1 END)
                    / NULLIF(COUNT(*), 0)
                )
                FROM rides
                WHERE phone_number = :phone
                  AND status = 'completed'
                  AND is_deleted = false
            """),
            {"phone": user.phone_number},
        ).scalar() or 98
    except Exception:
        on_time_rate = 98

    # ── Response rate ─────────────────────────────────────────────────────────
    # Requires responded_at column. Falls back to 95 if missing.
    try:
        response_rate = db.execute(
            text("""
                SELECT ROUND(
                    100.0 * COUNT(CASE WHEN rb.responded_at IS NOT NULL THEN 1 END)
                    / NULLIF(COUNT(*), 0)
                )
                FROM ride_bookings rb
                JOIN rides r ON r.id = rb.ride_id
                WHERE r.phone_number = :phone
                  AND rb.created_at >= NOW() - INTERVAL '90 days'
            """),
            {"phone": user.phone_number},
        ).scalar() or 95
    except Exception:
        response_rate = 95

    # ── Reviews ───────────────────────────────────────────────────────────────
    # Returns [] gracefully if the ratings table does not exist yet.
    reviews = []
    try:
        review_rows = db.execute(
            text("""
                SELECT
                    rat.rating,
                    rat.comment,
                    rat.created_at AS date,
                    u.full_name    AS reviewer_name,
                    u.profile_picture AS reviewer_photo,
                    CONCAT(
                        COALESCE(rb.pickup_location,  ''),
                        CASE WHEN rb.dropoff_location IS NOT NULL THEN ' → ' ELSE '' END,
                        COALESCE(rb.dropoff_location, '')
                    ) AS route
                FROM ratings rat
                JOIN users u ON u.phone_number = rat.rater_phone
                LEFT JOIN ride_bookings rb ON rb.id = rat.booking_id
                WHERE rat.ratee_phone = :phone
                ORDER BY rat.created_at DESC
                LIMIT 10
            """),
            {"phone": user.phone_number},
        ).mappings().all()

        reviews = [
            {
                "reviewer_name":  row["reviewer_name"],
                "reviewer_photo": row["reviewer_photo"],
                "rating":         row["rating"],
                "comment":        row["comment"],
                "date":           row["date"].isoformat() if row["date"] else None,
                "route":          row["route"] if row["route"] and row["route"].strip(" →") else None,
            }
            for row in review_rows
        ]
    except Exception as e:
        print(f"[profile-public] reviews fetch skipped (ratings table may not exist): {e}")

    # ── Travel preferences ────────────────────────────────────────────────────
    # Reads from travel_preferences JSONB column. Falls back to defaults if missing.
    try:
        raw_prefs = user.travel_preferences
        if isinstance(raw_prefs, dict):
            travel_preferences = {
                "music":   raw_prefs.get("music",   True),
                "ac":      raw_prefs.get("ac",      True),
                "pets":    raw_prefs.get("pets",    False),
                "smoking": raw_prefs.get("smoking", False),
            }
        else:
            travel_preferences = {"music": True, "ac": True, "pets": False, "smoking": False}
    except AttributeError:
        travel_preferences = {"music": True, "ac": True, "pets": False, "smoking": False}

    # ── Verifications ─────────────────────────────────────────────────────────
    verifications = {
        "phone":     bool(user.phone_number),
        "email":     bool(user.email),
        "id":        safe_bool(user, "id_verified"),
        "corporate": safe_bool(user, "corporate_verified"),
    }

    # ── Computed badges ───────────────────────────────────────────────────────
    avg_rating    = float(user.avg_rating or 0)
    total_ratings = int(user.total_ratings or 0)

    badges = []
    if user.profile_completed:
        badges.append({
            "key":   "safe_driver",
            "title": "Safe Driver",
            "desc":  "Completed identity verification and background checks.",
        })
    if avg_rating >= 4.5 and total_ratings > 0:
        badges.append({
            "key":   "top_rated",
            "title": "Top Rated",
            "desc":  f"Average rating of {avg_rating:.1f} stars from {total_ratings} reviews.",
        })
    if int(posted_rides_count) >= 50:
        badges.append({
            "key":   "experienced",
            "title": "Experienced",
            "desc":  "Completed 50+ rides on the platform.",
        })

    # ── Compose final response ────────────────────────────────────────────────
    return {
        "success": True,
        "user": {
            # Core identity
            "user_id":           user.user_id,
            "phone_number":      user.phone_number,
            "full_name":         user.full_name,
            "first_name":        user.first_name,
            "last_name":         user.last_name,
            "profile_picture":   user.profile_picture,
            "bio":               user.bio or "Friendly driver, love meeting new people!",
            "state":             user.state,
            "city":              user.city,
            "gender":            user.gender,
            "profile_completed": user.profile_completed,
            "avg_rating":        avg_rating,
            "total_ratings":     total_ratings,
            "created_at":        user.created_at.isoformat() if user.created_at else None,

            # Extended fields for ViewProfileScreen
            "verifications":      verifications,
            "travel_preferences": travel_preferences,
            "reviews":            reviews,
            "badges":             badges,

            # Stats
            "stats": {
                "posted_rides":    int(posted_rides_count),
                "booked_rides":    int(booked_rides_count),
                "cancelled_rides": int(cancelled_rides_count),
                "on_time_rate":    int(on_time_rate),
                "response_rate":   int(response_rate),
            },

            # Vehicle — 'type' excluded until migration is run
            "vehicle": {
                "make":                vehicle_row.get("make")                if vehicle_row else None,
                "model":               vehicle_row.get("model")               if vehicle_row else None,
                "color":               vehicle_row.get("color")               if vehicle_row else None,
                "year":                vehicle_row.get("year")                if vehicle_row else None,
                "type":                None,   # placeholder until ALTER TABLE migration
                "registration_number": vehicle_row.get("registration_number") if vehicle_row else None,
                "photo_url":           vehicle_row.get("photo_url")           if vehicle_row else None,
            } if vehicle_row else None,
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# PUT /api/v1/users/update-profile-picture
# ─────────────────────────────────────────────────────────────────────────────

@router.put("/api/v1/users/update-profile-picture")
async def update_profile_picture(
    phone_number: str = Form(...),
    profile_picture: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.phone_number == phone_number).first()
    if not user:
        raise HTTPException(404, "User not found")

    try:
        filename   = f"{uuid.uuid4()}.jpg"
        file_path  = f"profile/{filename}"
        file_bytes = await profile_picture.read()
        image_url  = upload_to_supabase(file_bytes, file_path)
        user.profile_picture = image_url
        db.commit()
        return {"success": True, "profile_picture": image_url}
    except Exception as e:
        db.rollback()
        print("IMAGE UPDATE ERROR:", e)
        raise HTTPException(500, "Failed to upload image")


# ─────────────────────────────────────────────────────────────────────────────
# PUT /api/v1/users/updateprofile
# ─────────────────────────────────────────────────────────────────────────────

class UpdateProfileRequest(BaseModel):
    phone_number:       str
    first_name:         Optional[str] = None
    last_name:          Optional[str] = None
    email:              Optional[str] = None
    gender:             Optional[str] = None
    date_of_birth:      Optional[str] = None
    state:              Optional[str] = None
    city:               Optional[str] = None
    bio:                Optional[str] = None
    travel_preferences: Optional[dict] = None


@router.put("/api/v1/users/updateprofile")
async def update_user_profile(data: UpdateProfileRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == data.phone_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    payload = data.dict(exclude_unset=True)

    for field in ["first_name", "last_name", "email", "gender", "state", "city", "bio"]:
        if payload.get(field) is not None:
            setattr(user, field, payload[field])

    if payload.get("first_name") or payload.get("last_name"):
        user.full_name = f"{user.first_name or ''} {user.last_name or ''}".strip()

    if payload.get("date_of_birth"):
        user.date_of_birth = datetime.strptime(payload["date_of_birth"], "%Y-%m-%d")

    if payload.get("travel_preferences") is not None:
        try:
            existing = user.travel_preferences or {}
            existing.update(payload["travel_preferences"])
            user.travel_preferences = existing
        except AttributeError:
            pass

    user.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {"success": True, "message": "Profile updated successfully"}


# ─────────────────────────────────────────────────────────────────────────────
# PUT /api/v1/users/update-travel-preferences
# ─────────────────────────────────────────────────────────────────────────────

class UpdateTravelPrefsRequest(BaseModel):
    phone_number: str
    music:        Optional[bool] = None
    ac:           Optional[bool] = None
    pets:         Optional[bool] = None
    smoking:      Optional[bool] = None


@router.put("/api/v1/users/update-travel-preferences")
async def update_travel_preferences(
    data: UpdateTravelPrefsRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.phone_number == data.phone_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = data.dict(exclude_unset=True, exclude={"phone_number"})
    if not updates:
        raise HTTPException(status_code=400, detail="No preference fields provided")

    try:
        existing = user.travel_preferences or {}
        existing.update(updates)
        user.travel_preferences = existing
    except AttributeError:
        raise HTTPException(
            status_code=500,
            detail="travel_preferences column not yet added. Run: ALTER TABLE users ADD COLUMN travel_preferences JSONB DEFAULT '{}'",
        )

    user.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "success": True,
        "message": "Travel preferences updated",
        "travel_preferences": user.travel_preferences,
    }


# ─────────────────────────────────────────────────────────────────────────────
# PUT /api/v1/users/update-avatar
# ─────────────────────────────────────────────────────────────────────────────

class UpdateAvatarRequest(BaseModel):
    phone_number: str
    avatar_name:  str


@router.put("/api/v1/users/update-avatar")
async def update_avatar(data: UpdateAvatarRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == data.phone_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        avatar_file_path = f"avatars/{data.avatar_name}"
        avatar_url = f"{SUPABASE_URL}/storage/v1/object/public/drivve/{avatar_file_path}"
        user.profile_picture = avatar_url
        user.updated_at = datetime.now(timezone.utc)
        db.commit()
        return {
            "success": True,
            "profile_picture": avatar_url,
            "avatar_name": data.avatar_name,
        }
    except Exception as e:
        db.rollback()
        print(f"Avatar update error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update avatar: {str(e)}")
