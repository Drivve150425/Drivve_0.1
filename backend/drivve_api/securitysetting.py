from models import UserSettings
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

from fastapi import APIRouter

router = APIRouter()
@router.get("/api/v1/settings/security")
def get_security_settings(phone_number: str, db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter_by(phone_number=phone_number).first()

    if not settings:
        settings = UserSettings(phone_number=phone_number)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return {
        "success": True,
        "settings": {
            "contact_visibility": settings.contact_visibility
        }
    }


@router.put("/api/v1/settings/security")
def update_security_settings(data: dict, db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter_by(
        phone_number=data["phone_number"]
    ).first()

    if not settings:
        settings = UserSettings(phone_number=data["phone_number"])
        db.add(settings)

    settings.contact_visibility = data.get("contact_visibility", True)
    db.commit()

    return {"success": True}


