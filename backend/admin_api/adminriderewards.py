from pydantic import BaseModel
from backend.admin_api import adminlog_activity
from models import   RideRewardMaster
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from drivve_api.app_config import create_app
app = create_app()
@app.get("/api/v1/admin/ride-rewards")
def get_ride_rewards(db: Session = Depends(get_db)):
    return (
        db.query(RideRewardMaster)
        .filter(RideRewardMaster.is_deleted == False)
        .order_by(RideRewardMaster.rides_required.asc())
        .all()
    )

class RideRewardCreate(BaseModel):
    title: str
    rides_required: int
    reward_points: int

@app.post("/api/v1/admin/ride-rewards/create")
def create_ride_reward(data: RideRewardCreate, db: Session = Depends(get_db)):
    reward = RideRewardMaster(
        title=data.title,
        rides_required=data.rides_required,
        reward_points=data.reward_points,
        is_active=True
    )
    db.add(reward)
    db.commit()
    db.refresh(reward)

    adminlog_activity(
        db,
        module="RIDE_REWARD",
        action="CREATE",
        entity_id=reward.id,
        entity_name=reward.title,
        description=f"Ride reward '{reward.title}' created"
    )

    return {"success": True, "id": reward.id}
@app.post("/api/v1/admin/ride-rewards/update")
def update_ride_reward(payload: dict, db: Session = Depends(get_db)):
    reward = db.query(RideRewardMaster).filter(
        RideRewardMaster.id == payload["id"],
        RideRewardMaster.is_deleted == False
    ).first()

    if not reward:
        raise HTTPException(404, "Reward not found")

    reward.title = payload["title"]
    reward.rides_required = payload["rides_required"]
    reward.reward_points = payload["reward_points"]

    db.commit()

    adminlog_activity(
        db,
        module="RIDE_REWARD",
        action="UPDATE",
        entity_id=reward.id,
        entity_name=reward.title,
        description=f"Ride reward '{reward.title}' updated"
    )

    return {"success": True}
@app.post("/api/v1/admin/ride-rewards/status")
def toggle_ride_reward_status(payload: dict, db: Session = Depends(get_db)):
    reward = db.query(RideRewardMaster).filter(
        RideRewardMaster.id == payload["id"],
        RideRewardMaster.is_deleted == False
    ).first()

    reward.is_active = payload["is_active"]
    db.commit()

    adminlog_activity(
        db,
        module="RIDE_REWARD",
        action="ACTIVATE" if payload["is_active"] else "DEACTIVATE",
        entity_id=reward.id,
        entity_name=reward.title,
        description=f"Ride reward '{reward.title}' status changed"
    )

    return {"success": True}
@app.post("/api/v1/admin/ride-rewards/delete")
def delete_ride_reward(payload: dict, db: Session = Depends(get_db)):
    reward = db.query(RideRewardMaster).filter(
        RideRewardMaster.id == payload["id"],
        RideRewardMaster.is_deleted == False
    ).first()

    reward.is_deleted = True
    reward.is_active = False
    db.commit()

    adminlog_activity(
        db,
        module="RIDE_REWARD",
        action="DELETE",
        entity_id=reward.id,
        entity_name=reward.title,
        description=f"Ride reward '{reward.title}' deleted"
    )

    return {"success": True}