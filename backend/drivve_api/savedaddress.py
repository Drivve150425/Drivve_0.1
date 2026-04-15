from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import SavedAddress
from typing import List
from fastapi.responses import JSONResponse

router = APIRouter()
from pydantic import BaseModel
from typing import Optional

class AddressCreate(BaseModel):
    phone_number: str
    label: Optional[str] = None
    type: Optional[str] = None
    full_address: str
    house: Optional[str] = None
    area: Optional[str] = None
    instructions: Optional[str] = None
    is_default: bool = False


class AddressResponse(BaseModel):
    id: int
    phone_number: str
    label: Optional[str]
    type: Optional[str]
    full_address: Optional[str]
    house: Optional[str]
    area: Optional[str]
    instructions: Optional[str]
    is_default: bool

    class Config:
        from_attributes = True   # FastAPI new version (important)

# ✅ GET ADDRESSES
@router.get("/api/v1/addresses", response_model=List[AddressResponse])
def get_addresses(phone_number: str, db: Session = Depends(get_db)):
    try:
        addresses = db.query(SavedAddress).filter(
            SavedAddress.phone_number == phone_number
        ).order_by(SavedAddress.is_default.desc()).all()

        return addresses

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ✅ SAVE ADDRESS
@router.post("/api/v1/addresses", response_model=AddressResponse)
def save_address(data: AddressCreate, db: Session = Depends(get_db)):
    try:
        data = data.dict()

        # reset default
        if data.get("is_default"):
            db.query(SavedAddress).filter(
                SavedAddress.phone_number == data["phone_number"]
            ).update({"is_default": False})

        address = SavedAddress(**data)

        db.add(address)
        db.commit()
        db.refresh(address)

        return address

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ✅ UPDATE ADDRESS
@router.put("/api/v1/addresses/{address_id}", response_model=AddressResponse)
def update_address(address_id: int, data: AddressCreate, db: Session = Depends(get_db)):
    try:
        address = db.query(SavedAddress).filter(
            SavedAddress.id == address_id
        ).first()

        if not address:
            raise HTTPException(status_code=404, detail="Address not found")

        update_data = data.dict(exclude_unset=True)

        for key, value in update_data.items():
            setattr(address, key, value)

        db.commit()
        db.refresh(address)

        return address

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ✅ DELETE ADDRESS
@router.delete("/api/v1/addresses/{address_id}")
def delete_address(address_id: int, db: Session = Depends(get_db)):
    try:
        address = db.query(SavedAddress).filter(
            SavedAddress.id == address_id
        ).first()

        if not address:
            raise HTTPException(status_code=404, detail="Address not found")

        db.delete(address)
        db.commit()

        return {"success": True}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})