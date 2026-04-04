from fastapi.encoders import jsonable_encoder

from models import Promotion,PromotionRedemption
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException

from fastapi import APIRouter

router = APIRouter()
@router.get("/api/v1/promotions")
def get_promotions(
    phone_number: str | None = None,
    db: Session = Depends(get_db)
):
    today = date.today()

    promotions = (
        db.query(Promotion)
        .filter(
            Promotion.is_active == True,
            Promotion.is_deleted == False,
            Promotion.valid_from <= today,
            Promotion.valid_till >= today
        )
        .order_by(Promotion.created_at.desc())
        .all()
    )

    # Hide redeemed promotions for same phone
    if phone_number:
        redeemed_ids = db.query(
            PromotionRedemption.promotion_id
        ).filter(
            PromotionRedemption.phone_number == phone_number
        ).all()

        redeemed_ids = {r.promotion_id for r in redeemed_ids}
        promotions = [p for p in promotions if p.id not in redeemed_ids]

    return {
        "promotions": jsonable_encoder(promotions)
    }
from datetime import date, datetime, timezone

@router.post("/api/v1/promotions/redeem")
def redeem_promotion(data: dict, db: Session = Depends(get_db)):
    promo_id = data.get("promo_id")
    phone_number = data.get("phone_number")

    if not promo_id or not phone_number:
        raise HTTPException(400, "promo_id and phone_number required")

    promo = db.query(Promotion).filter(
        Promotion.id == promo_id,
        Promotion.is_active == True,
        Promotion.is_deleted == False
    ).first()

    if not promo:
        raise HTTPException(404, "Promotion not found")

    already = db.query(PromotionRedemption).filter(
        PromotionRedemption.promotion_id == promo_id,
        PromotionRedemption.phone_number == phone_number
    ).first()

    if already:
        return {"alreadyRedeemed": True}

    redemption = PromotionRedemption(
        promotion_id=promo_id,
        phone_number=phone_number
    )

    db.add(redemption)
    db.commit()

    return {"success": True}
