from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from models import UserDevice

from fastapi import APIRouter

router = APIRouter()
# =========================
# DEVICES
# =========================

@router.get("/api/v1/devices")
def get_devices(phone_number: str, db: Session = Depends(get_db)):

    devices = db.query(UserDevice).filter(
        UserDevice.phone_number == phone_number
    ).order_by(UserDevice.created_at.desc()).all()

    return {
        "success": True,
        "devices": [
            {
                "id": d.id,
                "name": d.device_name,        
                "type": d.device_type,      
                "current": d.is_current,   
                "last_active": d.last_active
            }
            for d in devices
        ]
    }


@router.delete("/api/v1/devices/{device_id}")
def logout_device(device_id: int, db: Session = Depends(get_db)):
    device = db.query(UserDevice).filter_by(id=device_id).first()

    if not device:
        raise HTTPException(404, "Device not found")

    if device.is_current:
        raise HTTPException(400, "Cannot logout current device")

    db.delete(device)
    db.commit()

    return {"success": True}
