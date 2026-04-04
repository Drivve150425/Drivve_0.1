from pydantic import BaseModel

from models import ShareActivity,DCoinRedemption
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

from fastapi import APIRouter

router = APIRouter()

class ShareRequest(BaseModel):
    phone_number: str
    referral_code: str

@router.post("/api/v1/referral/share")
async def record_share(data: ShareRequest, db: Session = Depends(get_db)):

    record = db.query(ShareActivity).filter(
        ShareActivity.phone_number == data.phone_number,
        ShareActivity.referral_code == data.referral_code
    ).first()

    if record:
        record.share_count += 1
    else:
        record = ShareActivity(
            phone_number=data.phone_number,
            referral_code=data.referral_code,
            share_count=1
        )
        db.add(record)

    # ✅ ADD CREDIT ENTRY
    credit = DCoinRedemption(
        phone_number=data.phone_number,
        coins=25,
        rupees=1,
        type="CREDIT",
        reason="Referral Share Bonus"
    )
    db.add(credit)

    db.commit()

    return {
        "success": True,
        "message": "Share recorded successfully",
        "share_count": record.share_count
    }


@router.get("/api/v1/referral/stats")
async def referral_stats(phone_number: str, db: Session = Depends(get_db)):
    record = db.query(ShareActivity).filter(
        ShareActivity.phone_number == phone_number
    ).first()

    if not record:
        return {"share_count": 0}

    return {
        "share_count": record.share_count,
        "last_shared_at": record.updated_at
    }
