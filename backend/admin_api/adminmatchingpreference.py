from backend.admin_api import adminlog_activity
from models import FAQ, MatchingPreferenceMaster
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from drivve_api.app_config import create_app
app = create_app()

@app.get("/api/v1/admin/matching-preferences")
def get_preferences(db: Session = Depends(get_db)):
    return db.query(MatchingPreferenceMaster)\
        .filter(MatchingPreferenceMaster.is_deleted == False)\
        .order_by(MatchingPreferenceMaster.id.asc())\
        .all()
@app.post("/api/v1/admin/matching-preferences/create")
def create_pref(payload: dict, db: Session = Depends(get_db)):
    pref = MatchingPreferenceMaster(**payload)
    db.add(pref)
    db.commit()
    adminlog_activity(
        db,
        module="Matching Preferences",
        action="create",
        description=f"Created matching preference with ID {pref.id}",
        entity_id=pref.id,
        entity_name=pref.label
    )
    return {"success": True}
@app.post("/api/v1/admin/matching-preferences/update")
def update_pref(payload: dict, db: Session = Depends(get_db)):
    pref = db.query(MatchingPreferenceMaster).filter_by(id=payload["id"]).first()
    if not pref:
        raise HTTPException(404, "Not found")

    for key in ["key", "label", "category", "input_type", "options"]:
        setattr(pref, key, payload.get(key))

    db.commit()
    adminlog_activity(
        db,
        module="Matching Preferences",
        action="update",
        description=f"Updated matching preference with ID {pref.id}",
        entity_id=pref.id,
        entity_name=pref.label
    )   
    return {"success": True}
@app.post("/api/v1/admin/matching-preferences/status")
def change_status(payload: dict, db: Session = Depends(get_db)):
    pref = db.query(MatchingPreferenceMaster).filter_by(id=payload["id"]).first()
    pref.is_active = payload["is_active"]
    db.commit()
    adminlog_activity(
        db,
        module="Matching Preferences",
        action="status change",
        description=f"Changed status of matching preference with ID {pref.id} to {'Active' if pref.is_active else 'Inactive'}",
        entity_id=pref.id,
        entity_name=pref.label
    )
    return {"success": True}
@app.post("/api/v1/admin/matching-preferences/delete")
def delete_pref(payload: dict, db: Session = Depends(get_db)):
    pref = db.query(MatchingPreferenceMaster).filter_by(id=payload["id"]).first()
    pref.is_deleted = True
    db.commit()
    adminlog_activity(
        db,
        module="Matching Preferences",
        action="delete",
        description=f"Deleted matching preference with ID {pref.id}",
        entity_id=pref.id,
        entity_name=pref.label
    )
    return {"success": True}