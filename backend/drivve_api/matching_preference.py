from typing import Any
from pydantic import BaseModel
from models import MatchingPreferenceMaster,MatchingPreferenceUser
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

from fastapi import APIRouter

router = APIRouter()

# ================= GET MASTER =================
@router.get("/api/v1/matching-preferences/master")
def get_matching_preference_master(db: Session = Depends(get_db)):
    return (
        db.query(MatchingPreferenceMaster)
        .filter(
            MatchingPreferenceMaster.is_deleted == False,
            MatchingPreferenceMaster.is_active == True
        )
        .order_by(MatchingPreferenceMaster.id.asc())
        .all()
    )


# ================= GET USER VALUES =================
@router.get("/api/v1/matching-preferences/user")
def get_user_matching_preferences(
    phone_number: str,
    db: Session = Depends(get_db)
):
    rows = db.query(MatchingPreferenceUser)\
        .filter(MatchingPreferenceUser.phone_number == phone_number)\
        .all()

    return {r.preference_key: r.value for r in rows}


# ================= SAVE / UPDATE =================
class MatchingPreferenceSave(BaseModel):
    phone_number: str
    preference_key: str
    value: Any


@router.post("/api/v1/matching-preferences/user")
def save_matching_preference(
    data: MatchingPreferenceSave,
    db: Session = Depends(get_db)
):
    row = db.query(MatchingPreferenceUser).filter(
        MatchingPreferenceUser.phone_number == data.phone_number,
        MatchingPreferenceUser.preference_key == data.preference_key
    ).first()

    if row:
        row.value = data.value
    else:
        row = MatchingPreferenceUser(
            phone_number=data.phone_number,
            preference_key=data.preference_key,
            value=data.value
        )
        db.add(row)

    db.commit()
    return {"success": True}