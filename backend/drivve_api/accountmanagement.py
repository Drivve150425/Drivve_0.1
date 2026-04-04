from datetime import datetime, timedelta, timezone

from models import  AccountDeactivation, User, UserDevice, UserStatus
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException

from fastapi import APIRouter

router = APIRouter()

@router.post("/api/v1/account/deactivate")
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

