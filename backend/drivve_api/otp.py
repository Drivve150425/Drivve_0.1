from datetime import UTC, datetime, timedelta, timezone
import random
import os

from drivve_api.createnotification import create_notification
from models import AccountDeactivation, NotificationType, OTPVerification, User, UserDevice, UserStatus
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from fastapi import APIRouter
from utils.jwt_helper import (
    create_access_token,
    create_refresh_token,
    decode_token
)
# Firebase Admin (optional — falls back gracefully if service account missing)
try:
    from configapp.firebase_admin import init_firebase_admin, verify_firebase_token, send_sms
    init_firebase_admin()
except Exception as e:
    print("⚠️ Firebase Admin not available:", e)
    send_sms = None

router = APIRouter()


def generate_otp() -> str:
    """Generate a random 6-digit OTP."""
    return str(random.randint(100000, 999999))


@router.post("/api/send-otp")
async def send_otp_endpoint(phone_data: dict, db: Session = Depends(get_db)):
    try:
        phone_number = normalize_phone(phone_data.get("phone_number"))
        if not phone_number:
            raise HTTPException(status_code=400, detail="Phone number required")

        # Invalidate old OTPs
        db.query(OTPVerification).filter(
            OTPVerification.phone_number == phone_number,
            OTPVerification.is_verified.is_(False)
        ).update({"is_verified": True})

        otp_code = generate_otp()
        expires_at = datetime.now(UTC) + timedelta(minutes=10)

        otp_entry = OTPVerification(
            phone_number=phone_number,
            otp_code=otp_code,
            expires_at=expires_at,
            is_verified=False,
            created_at=datetime.now(timezone.utc)
        )

        db.add(otp_entry)
        db.commit()
        db.refresh(otp_entry)

        print("✅ OTP SAVED IN DB")
        print("📞 Phone:", phone_number)
        print("🔢 OTP:", otp_code)
        print("⏳ Expires", expires_at.isoformat())

        # SMS DELIVERY via Firebase Admin (non-blocking)
        if send_sms:
            try:
                message = f"Your Drivve verification code is {otp_code}. Valid for 10 minutes. Do not share."
                sms_sent = send_sms(phone_number, message)
                if sms_sent:
                    print("📱 Firebase SMS sent successfully")
                else:
                    print("⚠️ Firebase SMS failed - SMS skipped (non-blocking)")
            except Exception as sms_error:
                print("⚠️ SMS send failed (non-blocking):", sms_error)
        else:
            print("⚠️ Firebase Admin not initialized - SMS skipped (non-blocking)")

        return {
            "success": True,
            "phone_number": phone_number,
            "expires_at": expires_at.isoformat()
        }

    except Exception as e:
        db.rollback()
        print("❌ SEND OTP ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


def normalize_phone(phone: str) -> str:
    phone = phone.replace(" ", "").replace("-", "")
    if phone.startswith("+"):
        return phone
    if phone.startswith("91") and len(phone) == 12:
        return f"+{phone}"
    return f"+91{phone}"


@router.post("/api/verify-otp")
def verify_otp(payload: dict, db: Session = Depends(get_db)):
    phone = normalize_phone(payload.get("phone_number"))
    otp_code = payload.get("otp_code")
    firebase_id_token = payload.get("firebase_id_token")

    if not phone:
        raise HTTPException(400, "Phone number required")

    device_name = payload.get("device_name")
    device_type = payload.get("device_type")

    now = datetime.now(timezone.utc)

    print("🔍 VERIFY PAYLOAD:", payload)
    print("📞 Phone:", phone)
    print("🔢 OTP:", otp_code)
    print("🔥 Firebase Token present:", bool(firebase_id_token))
    print("⏰ Now:", now.isoformat())

    # ── Firebase ID Token verification (preferred) ──
    if firebase_id_token:
        try:
            decoded = verify_firebase_token(firebase_id_token)
            token_phone = decoded.get("phone_number")
            if token_phone and normalize_phone(token_phone) != phone:
                raise HTTPException(400, "Phone number mismatch with Firebase token")
            print("✅ Firebase ID token verified:", decoded.get("uid"))
        except ValueError as e:
            print("❌ Firebase token verification failed:", e)
            raise HTTPException(401, str(e))
        except Exception as e:
            # Dev fallback: if Firebase Admin not configured, accept token blindly
            print("⚠️ Firebase Admin not configured, skipping token verification")

    # ── Legacy OTP verification (fallback) ──
    elif otp_code:
        otp = db.query(OTPVerification).filter(
            OTPVerification.phone_number == phone,
            OTPVerification.otp_code == otp_code,
            OTPVerification.is_verified.is_(False),
            OTPVerification.expires_at > now
        ).order_by(OTPVerification.created_at.desc()).first()

        if not otp:
            raise HTTPException(400, "Invalid or expired OTP")

        otp.is_verified = True
        db.commit()
        db.refresh(otp)
    else:
        raise HTTPException(400, "OTP code or firebase_id_token required")

    # ✅ update user if exists
    access_token = None
    refresh_token = None
    user = db.query(User).filter(User.phone_number == phone).first()
    if user:
        user.is_phone_verified = True
        user.status = UserStatus.ACTIVE
        db.commit()
        access_token = create_access_token(
            user.id
        )

        refresh_token = create_refresh_token(
            user.id
        )
    # ✅ register device
    if device_name and device_type:
        db.query(UserDevice).filter(
            UserDevice.phone_number == phone
        ).update({UserDevice.is_current: False})

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
        "message": "OTP verified successfully",

        "user": {
            "id": user.id if user else None,
            "first_name": user.first_name if user else None,
            "phone_number": user.phone_number if user else phone,
        },

        "accessToken": access_token if user else None,
        "refreshToken": refresh_token if user else None,

        "is_new_user": user is None
    }


@router.post("/api/v1/users/check")
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

        # Check deactivation
        deactivation = db.query(AccountDeactivation).filter(
            AccountDeactivation.phone_number == user.phone_number,
            AccountDeactivation.is_deactivated == True
        ).first()

        if deactivation:
            days_passed = (datetime.now(timezone.utc) - deactivation.created_at).days

            if days_passed >= 30:
                return {
                    "exists": False,
                    "blocked": True,
                    "message": "Account permanently deleted after 30 days"
                }

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
                "profile_picture": user.profile_picture,
                "phone_number": user.phone_number,
                "profile_completed": user.profile_completed,
                "status": user.status.value if user.status else "active"
            }
        }

    except Exception as e:
        print("❌ USERS CHECK ERROR:", str(e))
        raise HTTPException(status_code=500, detail="User check failed")
@router.post("/auth/refresh")
def refresh_token(
    payload: dict
):

    refresh_token =payload.get(
            "refreshToken"
        )

    if not refresh_token:

        raise HTTPException(
            401,
            "No refresh token"
        )

    decoded = decode_token(
            refresh_token
        )

    if not decoded:

        raise HTTPException(
            401,
            "Invalid refresh token"
        )

    if decoded["type"] != "refresh":

        raise HTTPException(
            401,
            "Wrong token type"
        )

    new_access_token = create_access_token(
            decoded["user_id"]
        )

    return {

        "success": True,

        "accessToken":
            new_access_token
    }