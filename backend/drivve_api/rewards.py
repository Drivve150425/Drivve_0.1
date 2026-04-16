from models import RideBooking,RideRewardMaster,DCoinRedemption,RideReward
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException

from fastapi import APIRouter

router = APIRouter()
def credit_if_not_done(db: Session, booking: RideBooking):
    if not booking.phone_number:
        return

    already = db.query(DCoinRedemption).filter(
        DCoinRedemption.phone_number == booking.phone_number,
        DCoinRedemption.reason == f"Ride Completed Bonus #{booking.id}"
    ).first()

    if already:
        return

    coins = 25             
    rupees = 1             

    credit = DCoinRedemption(
        phone_number=booking.phone_number,
        coins=coins,
        rupees=rupees,
        type="CREDIT",
        reason=f"Ride Completed Bonus #{booking.id}"
    )

    db.add(credit)
    db.commit()

@router.get("/api/v1/rewards")
def get_rewards(phone_number: str, db: Session = Depends(get_db)):

    completed_bookings = db.query(RideBooking).filter(
        RideBooking.passenger_phone == phone_number,
        RideBooking.status == "completed"
    ).all()

    for booking in completed_bookings:
        credit_if_not_done(db, booking)

    completed_rides = len(completed_bookings)

    rewards = db.query(RideRewardMaster)\
        .filter(RideRewardMaster.is_active == True)\
        .order_by(RideRewardMaster.rides_required.asc())\
        .all()

    credited = db.query(RideReward.reward_id)\
        .filter(RideReward.phone_number == phone_number)\
        .all()

    credited_ids = {r.reward_id for r in credited}
    
    # Get total D-Coins balance
    all_transactions = db.query(DCoinRedemption).filter(
        DCoinRedemption.phone_number == phone_number
    ).all()
    
    total_balance = sum(t.coins for t in all_transactions if t.type == "CREDIT") - \
                    sum(t.coins for t in all_transactions if t.type == "DEBIT")

    return {
        "completed_rides": completed_rides,
        "total_dcoins_balance": total_balance,  # Add this
        "rewards": [
            {
                "id": r.id,
                "title": r.title,
                "rides_required": r.rides_required,
                "reward_points": r.reward_points,
            }
            for r in rewards
        ],
        "credited_rewards": list(credited_ids)
    }
@router.post("/api/v1/rewards/credit")
def credit_reward(data: dict, db: Session = Depends(get_db)):

    phone = data.get("phone_number")
    reward_id = data.get("reward_id")

    reward = db.query(RideRewardMaster).filter(
        RideRewardMaster.id == reward_id
    ).first()

    if not reward:
        raise HTTPException(404, "Reward not found")

    already = db.query(RideReward).filter(
        RideReward.phone_number == phone,
        RideReward.reward_id == reward_id
    ).first()

    if already:
        return {"alreadyCredited": True}

    # ✅ CREDIT WALLET
    wallet = DCoinRedemption(
        phone_number=phone,
        coins=reward.reward_points,
        rupees=reward.reward_points / 25,
        type="CREDIT",
        reason="Ride Reward"
    )

    credited = RideReward(
        phone_number=phone,
        reward_id=reward.id,
        coins=reward.reward_points
    )

    db.add(wallet)
    db.add(credited)
    db.commit()

    return {"success": True}