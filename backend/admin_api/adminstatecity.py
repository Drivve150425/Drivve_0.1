
from typing import List

from pydantic import BaseModel
from backend.admin_api import adminlog_activity
from models import   City, State
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from drivve_api.app_config import create_app
app = create_app()
class CityOut(BaseModel):
    id: int
    name: str
    active: bool

    class Config:
        orm_mode = True


class StateOut(BaseModel):
    id: int
    name: str
    active: bool
    cities: List[CityOut]

    class Config:
        orm_mode = True
@app.post("/api/v1/admin/state-city/list", response_model=list[StateOut])
def list_states(db: Session = Depends(get_db)):
    return db.query(State).order_by(State.name).all()
@app.post("/api/v1/admin/state/add")
def add_state(data: dict, db: Session = Depends(get_db)):
    if db.query(State).filter_by(name=data["name"]).first():
        raise HTTPException(400, "State already exists")

    db.add(State(name=data["name"]))
    db.commit()
    adminlog_activity(
        db,
        module="STATE_CITY",
        action="ADD_STATE",
        description=f"Added state '{data['name']}'"
    )
    return {"success": True}
@app.post("/api/v1/admin/state/add")
def add_state(data: dict, db: Session = Depends(get_db)):
    if db.query(State).filter_by(name=data["name"]).first():
        raise HTTPException(400, "State already exists")

    db.add(State(name=data["name"]))
    db.commit()
    adminlog_activity(
        db,
        module="STATE_CITY",
        action="ADD_STATE",
        description=f"Added state '{data['name']}'"
    )
    return {"success": True}
@app.post("/api/v1/admin/state/update")
def update_state(data: dict, db: Session = Depends(get_db)):
    state = db.get(State, data["id"])
    if not state:
        raise HTTPException(404)

    state.name = data.get("name", state.name)
    state.active = data.get("active", state.active)
    db.commit()
    adminlog_activity(
        db,
        module="STATE_CITY",
        action="UPDATE_STATE",
        description=f"Updated state '{state.name}'"
    )
    return {"success": True}
@app.post("/api/v1/admin/state/delete")
def delete_state(data: dict, db: Session = Depends(get_db)):
    state = db.get(State, data["id"])
    if not state:
        raise HTTPException(404)

    db.delete(state)
    db.commit()
    adminlog_activity(
        db,
        module="STATE_CITY",
        action="DELETE_STATE",
        description=f"Deleted state '{state.name}'"
    )
    return {"success": True}
@app.post("/api/v1/admin/city/add")
def add_city(data: dict, db: Session = Depends(get_db)):
    db.add(City(
        name=data["name"],
        state_id=data["state_id"]
    ))
    db.commit()
    adminlog_activity(
        db,
        module="STATE_CITY",
        action="ADD_CITY",
        description=f"Added city '{data['name']}'"
    )
    return {"success": True}

@app.post("/api/v1/admin/city/update")
def update_city(data: dict, db: Session = Depends(get_db)):
    city = db.get(City, data["id"])
    if not city:
        raise HTTPException(404)

    city.name = data.get("name", city.name)
    city.active = data.get("active", city.active)
    db.commit()
    adminlog_activity(
        db,
        module="STATE_CITY",
        action="UPDATE_CITY",
        description=f"Updated city '{city.name}'"
    )
    return {"success": True}
@app.post("/api/v1/admin/city/delete")
def delete_city(data: dict, db: Session = Depends(get_db)):
    city = db.get(City, data["id"])
    if not city:
        raise HTTPException(404)

    db.delete(city)
    db.commit()
    adminlog_activity(
        db,
        module="STATE_CITY",
        action="DELETE_CITY",
        description=f"Deleted city '{city.name}'"
    )
    return {"success": True}