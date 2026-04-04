from models import EmergencyContact
from database import SessionLocal, get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, Query

from fastapi import APIRouter

router = APIRouter()

def seed_emergency_contacts(db):
    defaults = [
        {
            "contact_name": "Women Helpline",
            "contact_number": "181"
        },
        {
            "contact_name": "Emergency (Govt)",
            "contact_number": "112"
        }
    ]

    for d in defaults:
        exists = db.query(EmergencyContact).filter(
            EmergencyContact.contact_number == d["contact_number"],
            EmergencyContact.is_system == True,
            EmergencyContact.is_deleted == False
        ).first()

        if not exists:
            db.add(EmergencyContact(
                phone_number="SYSTEM",
                contact_name=d["contact_name"],
                contact_number=d["contact_number"],
                is_system=True,
                share_live_location=False
            ))
def run_emergency_contact_seeder():
    db = SessionLocal()
    try:
        seed_emergency_contacts(db)
        db.commit()
        print("🚨 Emergency contacts seeded successfully")
    except Exception as e:
        db.rollback()
        print("❌ Emergency contact seeding failed:", str(e))
    finally:
        db.close()

@router.get("/api/v1/emergency-contacts")
def get_emergency_contacts(phone_number: str, db: Session = Depends(get_db)):
    system_contacts = db.query(EmergencyContact).filter(
        EmergencyContact.is_system == True,
        EmergencyContact.is_active == True,
        EmergencyContact.is_deleted == False
    ).all()

    user_contacts = db.query(EmergencyContact).filter(
        EmergencyContact.phone_number == phone_number,
        EmergencyContact.is_system == False,
        EmergencyContact.is_deleted == False
    ).all()

    return {
        "system": system_contacts,
        "user": user_contacts
    }

@router.post("/api/v1/emergency-contacts")
def add_emergency_contact(data: dict, db: Session = Depends(get_db)):
    phone = data.get("phone_number")

    count = db.query(EmergencyContact).filter(
        EmergencyContact.phone_number == phone,
        EmergencyContact.is_system == False,
        EmergencyContact.is_deleted == False
    ).count()

    if count >= 3:
        raise HTTPException(400, "Maximum 3 contacts allowed")

    contact = EmergencyContact(
        phone_number=phone,
        contact_name=data["contact_name"],
        contact_number=data["contact_number"],
        share_live_location=data.get("share_live_location", False),
        is_system=False
    )

    db.add(contact)
    db.commit()
    return {"success": True}
@router.put("/api/v1/emergency-contacts/{contact_id}")
def update_emergency_contact(
    contact_id: int,
    data: dict,
    phone_number: str,
    db: Session = Depends(get_db)
):
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id,
        EmergencyContact.phone_number == phone_number,
        EmergencyContact.is_system == False,
        EmergencyContact.is_deleted == False
    ).first()

    if not contact:
        raise HTTPException(403, "Not allowed")

    contact.contact_name = data.get("contact_name", contact.contact_name)
    contact.contact_number = data.get("contact_number", contact.contact_number)
    contact.share_live_location = data.get(
        "share_live_location",
        contact.share_live_location
    )

    db.commit()
    return {"success": True}
@router.delete("/api/v1/emergency-contacts/{contact_id}")
def delete_emergency_contact(
    contact_id: int,
    phone_number: str = Query(...),   # ✅ REQUIRED QUERY
    db: Session = Depends(get_db)
):
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id,
        EmergencyContact.phone_number == phone_number,
        EmergencyContact.is_system == False,
        EmergencyContact.is_deleted == False
    ).first()

    if not contact:
        raise HTTPException(403, "Not allowed")

    contact.is_deleted = True
    db.commit()
    return {"success": True}