from backend.admin_api import adminlog_activity
from models import FAQ
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from drivve_api.app_config import create_app

app = create_app()

@app.get("/api/v1/admin/faqs")
def get_all_faqs(db: Session = Depends(get_db)):
    return (
        db.query(FAQ)
        .filter(FAQ.is_deleted == False)
        .order_by(FAQ.id.desc())
        .all()
    )
@app.post("/api/v1/admin/faqs/create")
def create_faq(payload: dict, db: Session = Depends(get_db)):
    faq = FAQ(
        category=payload["category"],
        question=payload["question"],
        answer=payload["answer"],
        is_active=True
    )
    db.add(faq)
    db.commit()
    db.refresh(faq)
    adminlog_activity(
        db,
        module="FAQ",
        action="CREATE",
        entity_id=faq.id,
        entity_name=faq.question,
        description=f"FAQ '{faq.question}' created"
    )
    return {"success": True, "id": faq.id}
@app.post("/api/v1/admin/faqs/update")
def update_faq(payload: dict, db: Session = Depends(get_db)):
    faq = db.query(FAQ).filter(
        FAQ.id == payload["id"],
        FAQ.is_deleted == False
    ).first()

    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    faq.category = payload["category"]
    faq.question = payload["question"]
    faq.answer = payload["answer"]

    db.commit()
    adminlog_activity(
        db,
        module="FAQ",
        action="UPDATE",
        entity_id=faq.id,
        entity_name=faq.question,
        description=f"FAQ '{faq.question}' updated"
    )

    return {"success": True}
@app.post("/api/v1/admin/faqs/status")
def change_faq_status(payload: dict, db: Session = Depends(get_db)):
    faq = db.query(FAQ).filter(
        FAQ.id == payload["id"],
        FAQ.is_deleted == False
    ).first()

    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    faq.is_active = payload["is_active"]
    db.commit()
    adminlog_activity(
        db,
        module="FAQ",
        action="STATUS CHANGE",
        entity_id=faq.id,
        entity_name=faq.question,
        description=f"FAQ '{faq.question}' status changed to {'Active' if faq.is_active else 'Inactive'}"
    )

    return {
        "success": True,
        "id": faq.id,
        "is_active": faq.is_active
    }
@app.post("/api/v1/admin/faqs/delete")
def delete_faq(payload: dict, db: Session = Depends(get_db)):
    faq = db.query(FAQ).filter(
        FAQ.id == payload["id"],
        FAQ.is_deleted == False
    ).first()

    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    faq.is_deleted = True
    faq.is_active = False

    db.commit()
    adminlog_activity(
        db,
        module="FAQ",
        action="DELETE",
        entity_id=faq.id,
        entity_name=faq.question,
        description=f"FAQ '{faq.question}' deleted"
    )

    return {"success": True}

