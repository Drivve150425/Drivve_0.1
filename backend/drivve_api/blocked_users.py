from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from models import BlockedUser

from fastapi import APIRouter

router = APIRouter()
# =========================
# BLOCKED USERS
# =========================

@router.get("/api/v1/blocked-users")
def get_blocked_users(phone_number: str, db: Session = Depends(get_db)):
    users = db.query(BlockedUser).filter_by(owner_phone=phone_number).all()

    return {
        "success": True,
        "blocked_users": [
            {
                "id": u.id,
                "name": u.blocked_name,
                "phone": u.blocked_phone
            }
            for u in users
        ]
    }


@router.delete("/api/v1/blocked-users/{id}")
def unblock_user(id: int, db: Session = Depends(get_db)):
    block = db.query(BlockedUser).filter_by(id=id).first()

    if not block:
        raise HTTPException(404, "User not found")

    db.delete(block)
    db.commit()

    return {"success": True}