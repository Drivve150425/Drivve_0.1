from datetime import date

from pydantic import BaseModel

from backend.admin_api import adminlog_activity
from models import   Promotion
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from drivve_api.app_config import create_app

app = create_app()
@app.get("/api/v1/admin/promotions")
def get_promotions_admin(db: Session = Depends(get_db)):
    promos = (
        db.query(Promotion)
        .filter(Promotion.is_deleted == False)
        .order_by(Promotion.created_at.desc())
        .all()
    )

    return [
        {
            "id": p.id,
            "company_name": p.company_name,
            "title": p.title,
            "description": p.description,
            "promo_code": p.promo_code,
            "image_url": p.image_url,
            "valid_from": p.valid_from,
            "valid_till": p.valid_till,
            "is_active": p.is_active,
            "created_at": p.created_at
        }
        for p in promos
    ]

class PromotionCreate(BaseModel):
    company_name: str
    title: str
    description: str | None = None
    promo_code: str | None = None
    image_url: str | None = None
    valid_from: date
    valid_till: date

@app.post("/api/v1/admin/promotions/create")
def create_promotion(data: PromotionCreate, db: Session = Depends(get_db)):
    promo = Promotion(
        **data.dict(),
        is_active=True,
        is_deleted=False
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)

    # Activity Log
    adminlog_activity(
        db,
        module="PROMOTION",
        action="CREATE",
        entity_id=promo.id,
        entity_name=promo.title,
        description=f"Promotion '{promo.title}' created"
    )

    return {"success": True, "promotion_id": promo.id}
@app.post("/api/v1/admin/promotions/update")
def update_promotion(data: dict, db: Session = Depends(get_db)):
    promo = db.query(Promotion).filter(
        Promotion.id == data["id"],
        Promotion.is_deleted == False
    ).first()

    if not promo:
        raise HTTPException(404, "Promotion not found")

    for field in [
        "company_name", "title", "description",
        "promo_code", "image_url",
        "valid_from", "valid_till"
    ]:
        if field in data:
            setattr(promo, field, data[field])

    db.commit()

    adminlog_activity(
        db,
        module="PROMOTION",
        action="UPDATE",
        entity_id=promo.id,
        entity_name=promo.title,
        description=f"Promotion '{promo.title}' updated"
    )

    return {"success": True}
@app.post("/api/v1/admin/promotions/status")
def toggle_promotion_status(data: dict, db: Session = Depends(get_db)):
    promo = db.query(Promotion).filter(
        Promotion.id == data["id"],
        Promotion.is_deleted == False
    ).first()

    promo.is_active = data["is_active"]
    db.commit()

    adminlog_activity(
        db,
        module="PROMOTION",
        action="ACTIVATE" if data["is_active"] else "DEACTIVATE",
        entity_id=promo.id,
        entity_name=promo.title,
        description=f"Promotion '{promo.title}' status changed"
    )

    return {"success": True}
@app.post("/api/v1/admin/promotions/delete")
def delete_promotion(data: dict, db: Session = Depends(get_db)):
    promo = db.query(Promotion).filter(
        Promotion.id == data["id"],
        Promotion.is_deleted == False
    ).first()

    promo.is_deleted = True
    promo.is_active = False
    db.commit()

    adminlog_activity(
        db,
        module="PROMOTION",
        action="DELETE",
        entity_id=promo.id,
        entity_name=promo.title,
        description=f"Promotion '{promo.title}' deleted"
    )

    return {"success": True}