
from datetime import UTC, datetime, timedelta, timezone

from drivve_api.createnotification import create_notification
from models import  AccountDeactivation, NotificationType, OTPVerification, User, UserDevice, UserStatus
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException

from fastapi import APIRouter

router = APIRouter()
@router.post("/api/send-otp")
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
        create_notification(
            db=db,
            phone_number=phone_number,
            title="OTP Sent",
            message="An OTP has been sent to your registered mobile number.",
            ntype=NotificationType.SYSTEM
        )

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
                        "profile_picture": user.profile_picture,  # ⭐ ADD THIS

                "phone_number": user.phone_number,
                "profile_completed": user.profile_completed,
                "status": user.status.value if user.status else "active"
            }
        }

    except Exception as e:
        print("❌ USERS CHECK ERROR:", str(e))
        raise HTTPException(status_code=500, detail="User check failed")


