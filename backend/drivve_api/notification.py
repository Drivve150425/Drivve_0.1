from models import UserSettings
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

from fastapi import APIRouter

router = APIRouter()

# =========================
# NOTIFICATION SETTINGS
# =========================

@router.get("/api/v1/settings/notifications")
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


@router.put("/api/v1/settings/notifications")
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
