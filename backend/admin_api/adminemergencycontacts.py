from backend.admin_api import adminlog_activity
from models import   EmergencyContact
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from drivve_api.app_config import create_app
app = create_app()
@app.get("/api/v1/admin/emergency-contacts")
def get_admin_emergency_contacts(db: Session = Depends(get_db)):
    return db.query(EmergencyContact).filter(
        EmergencyContact.is_system == True,
        EmergencyContact.is_deleted == False
    ).order_by(EmergencyContact.created_at.desc()).all()

@app.post("/api/v1/admin/emergency-contacts/create")
def create_admin_emergency_contact(data: dict, db: Session = Depends(get_db)):
    contact = EmergencyContact(
        phone_number="SYSTEM",
        contact_name=data["contact_name"],
        contact_number=data["contact_number"],
        share_live_location=data.get("share_live_location", False),
        is_system=True
    )

    db.add(contact)
    db.commit()
    db.refresh(contact)

    adminlog_activity(
        db,
        module="EMERGENCY_CONTACT",
        action="CREATE",
        entity_id=contact.id,
        entity_name=contact.contact_name,
        description="System emergency contact created"
    )

    return {"success": True}
@app.post("/api/v1/admin/emergency-contacts/update")
def update_admin_emergency_contact(data: dict, db: Session = Depends(get_db)):
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == data["id"],
        EmergencyContact.is_system == True,
        EmergencyContact.is_deleted == False
    ).first()

    if not contact:
        raise HTTPException(404, "Contact not found")

    contact.contact_name = data.get("contact_name", contact.contact_name)
    contact.contact_number = data.get("contact_number", contact.contact_number)
    contact.share_live_location = data.get(
        "share_live_location",
        contact.share_live_location
    )

    db.commit()

    adminlog_activity(
        db,
        module="EMERGENCY_CONTACT",
        action="UPDATE",
        entity_id=contact.id,
        entity_name=contact.contact_name,
        description="System emergency contact updated"
    )

    return {"success": True}
@app.post("/api/v1/admin/emergency-contacts/delete")
def delete_admin_emergency_contact(data: dict, db: Session = Depends(get_db)):
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == data["id"],
        EmergencyContact.is_system == True,
        EmergencyContact.is_deleted == False
    ).first()

    if not contact:
        raise HTTPException(404, "Contact not found")

    contact.is_deleted = True
    db.commit()

    adminlog_activity(
        db,
        module="EMERGENCY_CONTACT",
        action="DELETE",
        entity_id=contact.id,
        entity_name=contact.contact_name,
        description="System emergency contact deleted"
    )

    return {"success": True}
@app.post("/api/v1/admin/emergency-contacts/status")
def toggle_emergency_contact_status(data: dict, db: Session = Depends(get_db)):
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == data["id"],
        EmergencyContact.is_system == True,
        EmergencyContact.is_deleted == False
    ).first()

    if not contact:
        raise HTTPException(404, "Contact not found")

    contact.is_active = data["is_active"]
    db.commit()

    adminlog_activity(
        db,
        module="EMERGENCY_CONTACT",
        action="ACTIVATE" if data["is_active"] else "DEACTIVATE",
        entity_id=contact.id,
        entity_name=contact.contact_name,
        description=f"Emergency contact status changed"
    )

    return {"success": True}
