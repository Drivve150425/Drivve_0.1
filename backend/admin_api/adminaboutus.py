from typing import List

from pydantic import BaseModel

from backend.admin_api import adminlog_activity
from models import  AboutUs
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from drivve_api.app_config import create_app

app = create_app()
@app.get("/api/v1/admin/about-us")
def get_about_us(db: Session = Depends(get_db)):
    return (
        db.query(AboutUs)
        .filter(AboutUs.is_deleted == False)
        .order_by(AboutUs.sort_order.asc(), AboutUs.id.asc())
        .all()
    )

class AboutUsReorder(BaseModel):
    id: int
    sort_order: int
@app.post("/api/v1/admin/about-us/reorder")
def reorder_about_us(
    items: List[AboutUsReorder],
    db: Session = Depends(get_db)
):
    for item in items:
        db.query(AboutUs).filter(
            AboutUs.id == item.id
        ).update(
            {"sort_order": item.sort_order}
        )

    db.commit()
    return {"message": "Order updated successfully"}


@app.post("/api/v1/admin/about-us/create")
def create_about_us(payload: dict, db: Session = Depends(get_db)):
    item = AboutUs(
        title=payload["title"],
        content=payload["content"],
        is_active=True
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    adminlog_activity(
        db,
        module="About Us",
        action="create",
        description=f"Created About Us entry with ID {item.id}",
        entity_id=item.id,
        entity_name=item.title
    )
    return {"success": True, "id": item.id}
@app.post("/api/v1/admin/about-us/update")
def update_about_us(payload: dict, db: Session = Depends(get_db)):
    item = db.query(AboutUs).filter(
        AboutUs.id == payload["id"],
        AboutUs.is_deleted == False
    ).first()

    if not item:
        raise HTTPException(404, "About Us not found")

    item.title = payload["title"]
    item.content = payload["content"]

    db.commit()
    adminlog_activity(
        db,
        module="About Us",
        action="update",
        description=f"Updated About Us entry with ID {item.id}",
        entity_id=item.id,
        entity_name=item.title
    )
    return {"success": True}
@app.post("/api/v1/admin/about-us/status")
def toggle_about_us_status(payload: dict, db: Session = Depends(get_db)):
    item = db.query(AboutUs).filter(
        AboutUs.id == payload["id"]
    ).first()

    if not item:
        raise HTTPException(404, "About Us not found")

    if item.is_deleted:
        raise HTTPException(
            status_code=400,
            detail="Cannot change status of deleted item"
        )

    item.is_active = payload["is_active"]
    db.commit()

    return {"success": True, "is_active": item.is_active}

@app.post("/api/v1/admin/about-us/delete")
def delete_about_us(payload: dict, db: Session = Depends(get_db)):
    item = db.query(AboutUs).filter_by(id=payload["id"]).first()
    item.is_deleted = True
    db.commit()
    adminlog_activity(
        db,
        module="About Us",
        action="delete",
        description=f"Deleted About Us entry with ID {item.id}",
        entity_id=item.id,
        entity_name=item.title
    )
    return {"success": True}