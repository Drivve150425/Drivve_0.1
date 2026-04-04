from models import SavedAddress
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException

from fastapi import APIRouter

router = APIRouter()
@router.get("/api/v1/addresses")
def get_addresses(phone_number: str, db: Session = Depends(get_db)):
    return db.query(SavedAddress).filter(
        SavedAddress.phone_number == phone_number
    ).order_by(SavedAddress.is_default.desc()).all()
@router.post("/api/v1/addresses")
def save_address(data: dict, db: Session = Depends(get_db)):
    if data.get("is_default"):
        db.query(SavedAddress).filter(
            SavedAddress.phone_number == data["phone_number"]
        ).update({"is_default": False})

    address = SavedAddress(**data)
    db.add(address)
    db.commit()
    db.refresh(address)
    return address
@router.put("/api/v1/addresses/{address_id}")
def update_address(address_id: int, data: dict, db: Session = Depends(get_db)):
    address = db.query(SavedAddress).filter(
        SavedAddress.id == address_id
    ).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    # ✅ Update ALL fields
    for field in [
        "label",
        "type",
        "full_address",
        "house",
        "area",
        "instructions",
        "is_default",
    ]:
        if field in data:
            setattr(address, field, data[field])

    db.commit()
    db.refresh(address)

    return address

@router.delete("/api/v1/addresses/{address_id}")
def delete_address(address_id: int, db: Session = Depends(get_db)):
    address = db.query(SavedAddress).filter(SavedAddress.id == address_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    db.delete(address)
    db.commit()
    return {"success": True}

