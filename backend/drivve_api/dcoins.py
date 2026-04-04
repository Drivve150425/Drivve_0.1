from datetime import datetime, timezone
from utils.redeem_code import generate_redeem_code
from models import DCoinRedemption, ShareActivity
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException

from fastapi import APIRouter

router = APIRouter()
@router.post("/api/v1/dcoins/redeem")
def redeem_dcoins(data: dict, db: Session = Depends(get_db)):
    phone = data.get("phone_number")
    if not phone:
        raise HTTPException(400, "Phone number required")

    credits = db.query(DCoinRedemption).filter(
        DCoinRedemption.phone_number == phone,
        DCoinRedemption.type == "CREDIT"
    ).all()

    balance_coins = sum(r.coins for r in credits)

    if balance_coins <= 0:
        raise HTTPException(400, "Insufficient balance")

    redeem_code = generate_redeem_code()

    db.add(DCoinRedemption(
        phone_number=phone,
        coins=balance_coins,
        rupees=balance_coins // 25,
        type="DEBIT",
        reason="Wallet Redemption",
        redeem_code=redeem_code
    ))

    # RESET SHARE COUNT
    share = db.query(ShareActivity).filter(
        ShareActivity.phone_number == phone
    ).first()

    if share:
        share.share_count = 0
        share.updated_at = datetime.now(timezone.utc)

    db.commit()

    return {
        "success": True,
        "redeem_code": redeem_code,
        "coins": balance_coins,
        "rupees": balance_coins // 25
    }


@router.get("/api/v1/dcoins/history")
def dcoin_history(phone_number: str, db: Session = Depends(get_db)):
    rows = db.query(DCoinRedemption)\
        .filter(DCoinRedemption.phone_number == phone_number)\
        .order_by(DCoinRedemption.created_at.desc())\
        .all()

    return [
        {
            "id": r.id,
            "type": r.type,          # CREDIT / DEBIT
            "coins": r.coins,
            "rupees": r.rupees,
            "reason": r.reason,
            "redeem_code": r.redeem_code,
            "created_at": r.created_at
        }
        for r in rows
    ]