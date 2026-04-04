from models import AboutUs, UserNotification
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException

from fastapi import APIRouter

router = APIRouter()
@router.get("/api/v1/notifications")
def get_notifications(
    phone_number: str,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    offset = (page - 1) * limit

    notifications = (
        db.query(UserNotification)
        .filter(
            UserNotification.phone_number == phone_number,
            UserNotification.is_deleted == False
        )
        .order_by(UserNotification.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "success": True,
        "notifications": notifications
    }


@router.post("/api/v1/notifications/read")
def mark_notification_read(data: dict, db: Session = Depends(get_db)):
    notif = db.query(UserNotification).filter(
        UserNotification.id == data["id"]
    ).first()

    if not notif:
        raise HTTPException(404, "Notification not found")

    notif.is_read = True
    db.commit()

    return {"success": True}
@router.post("/api/v1/notifications/clear")
def clear_notifications(phone_number: str, db: Session = Depends(get_db)):
    db.query(UserNotification).filter(
        UserNotification.phone_number == phone_number
    ).update({"is_deleted": True})

    db.commit()
    return {"success": True}
