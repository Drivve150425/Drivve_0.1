from models import RideBooking, RideRewardMaster, DCoinRedemption, RideReward
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from fastapi import APIRouter
import logging

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def credit_if_not_done(db: Session, booking: RideBooking):
    # FIXED: Use passenger_phone instead of phone_number
    if not booking.passenger_phone:
        logger.warning(f"No passenger_phone for booking #{booking.id}")
        return

    # Check if already credited
    already = db.query(DCoinRedemption).filter(
        DCoinRedemption.phone_number == booking.passenger_phone,  # FIXED
        DCoinRedemption.reason == f"Ride Completed Bonus #{booking.id}"
    ).first()

    if already:
        return

    coins = 25             
    rupees = 1             

    credit = DCoinRedemption(
        phone_number=booking.passenger_phone,  # FIXED: Use passenger_phone
        coins=coins,
        rupees=rupees,
        type="CREDIT",
        reason=f"Ride Completed Bonus #{booking.id}"
    )

    db.add(credit)
    db.commit()
    logger.info(f"✅ Credited 25 coins to {booking.passenger_phone} for ride #{booking.id}")

@router.get("/api/v1/rewards")
def get_rewards(phone_number: str, db: Session = Depends(get_db)):
    try:
        logger.info(f"Fetching rewards for phone: {phone_number}")
        
        # Get completed rides
        completed_bookings = db.query(RideBooking).filter(
            RideBooking.passenger_phone == phone_number,
            RideBooking.status == "completed"
        ).all()
        
        logger.info(f"Found {len(completed_bookings)} completed rides")

        # Auto credit ride bonuses
        for booking in completed_bookings:
            credit_if_not_done(db, booking)

        completed_rides = len(completed_bookings)

        # Get active rewards
        rewards = db.query(RideRewardMaster)\
            .filter(RideRewardMaster.is_active == True)\
            .order_by(RideRewardMaster.rides_required.asc())\
            .all()
        
        logger.info(f"Found {len(rewards)} active rewards")

        # Get credited rewards
        credited = db.query(RideReward.reward_id)\
            .filter(RideReward.phone_number == phone_number)\
            .all()

        credited_ids = [r.reward_id for r in credited]
        
        # Get total D-Coins balance
        all_transactions = db.query(DCoinRedemption).filter(
            DCoinRedemption.phone_number == phone_number
        ).all()
        
        total_credits = sum(t.coins for t in all_transactions if t.type == "CREDIT")
        total_debits = sum(t.coins for t in all_transactions if t.type == "DEBIT")
        total_balance = total_credits - total_debits

        response_data = {
            "completed_rides": completed_rides,
            "total_dcoins_balance": total_balance,
            "rewards": [
                {
                    "id": r.id,
                    "title": r.title,
                    "rides_required": r.rides_required,
                    "reward_points": r.reward_points,
                }
                for r in rewards
            ],
            "credited_rewards": credited_ids
        }
        
        logger.info(f"Returning response with {len(rewards)} rewards")
        return response_data
        
    except Exception as e:
        logger.error(f"Error in get_rewards: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/v1/rewards/credit")
def credit_reward(data: dict, db: Session = Depends(get_db)):
    try:
        phone = data.get("phone_number")
        reward_id = data.get("reward_id")
        
        logger.info(f"Crediting reward {reward_id} to {phone}")

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

        # CREDIT WALLET
        wallet = DCoinRedemption(
            phone_number=phone,
            coins=reward.reward_points,
            rupees=reward.reward_points // 25,
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
        
        logger.info(f"Successfully credited {reward.reward_points} coins to {phone}")
        return {"success": True}
        
    except Exception as e:
        logger.error(f"Error in credit_reward: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))