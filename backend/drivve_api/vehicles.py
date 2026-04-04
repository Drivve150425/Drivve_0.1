import shutil
import uuid
from fastapi.encoders import jsonable_encoder
from fastapi.staticfiles import StaticFiles
import requests
from models import  Vehicle
import os
from fastapi import Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from database import get_db

from fastapi import APIRouter

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")


# ===================== SUPABASE UPLOAD =====================
def upload_to_supabase(file_bytes, file_path):
    url = f"{SUPABASE_URL}/storage/v1/object/drivve/{file_path}?upsert=true"

    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
        "Content-Type": "image/jpeg"
    }

    response = requests.put(url, headers=headers, data=file_bytes)

    if response.status_code not in [200, 201]:
        raise Exception(f"Upload failed: {response.text}")

    return f"{SUPABASE_URL}/storage/v1/object/public/drivve/{file_path}"




# ===================== GET =====================
@router.get("/api/v1/vehicles")
def get_vehicles(phone_number: str, db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle)\
        .filter(Vehicle.phone_number == phone_number)\
        .order_by(Vehicle.created_at.desc())\
        .all()

    return {"vehicles": jsonable_encoder(vehicles)}

# ===================== ADD =====================
@router.post("/api/v1/vehicles")
async def add_vehicle(
    phone_number: str = Form(...),
    vehicle_type: str = Form(...),
    body_type: str = Form(...),
    fuel_type: str = Form(...),
    make: str = Form(...),
    model: str = Form(...),
    year: int = Form(...),
    registration_number: str = Form(...),
    color: str = Form(None),
    max_seats: int = Form(...),
    notes: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    photo_path = None
    if photo:
        file_bytes = await photo.read()

        filename = f"{uuid.uuid4()}.jpg"
        file_path = f"vehicles/{filename}"   # 📁 folder inside bucket

        photo_path = upload_to_supabase(file_bytes, file_path)

    vehicle = Vehicle(
        phone_number=phone_number,
        vehicle_type=vehicle_type,
        body_type=body_type,
        fuel_type=fuel_type,
        make=make,
        model=model,
        year=year,
        registration_number=registration_number,
        color=color,
        max_seats=max_seats,
        notes=notes,
        photo_url=photo_path,
    )

    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)

    return {"success": True}

# ===================== UPDATE =====================
@router.put("/api/v1/vehicles/{vehicle_id}")
async def update_vehicle(
    vehicle_id: int,
    phone_number: str = Form(...),
    vehicle_type: str = Form(...),
    body_type: str = Form(...),
    fuel_type: str = Form(...),
    make: str = Form(...),
    model: str = Form(...),
    year: int = Form(...),
    registration_number: str = Form(...),
    color: str = Form(None),
    max_seats: int = Form(...),
    notes: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")

    if photo:
            file_bytes = await photo.read()

            filename = f"{uuid.uuid4()}.jpg"
            file_path = f"vehicles/{filename}"

            vehicle.photo_url = upload_to_supabase(file_bytes, file_path)

    vehicle.phone_number = phone_number
    vehicle.vehicle_type = vehicle_type
    vehicle.body_type = body_type
    vehicle.fuel_type = fuel_type
    vehicle.make = make
    vehicle.model = model
    vehicle.year = year
    vehicle.registration_number = registration_number
    vehicle.color = color
    vehicle.max_seats = max_seats
    vehicle.notes = notes

    db.commit()
    return {"success": True}

# ===================== DELETE =====================
@router.delete("/api/v1/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    delete_from_supabase(vehicle.photo_url)

    db.delete(vehicle)
    db.commit()
    return {"success": True}
def delete_from_supabase(file_url):
    if not file_url:
        return

    try:
        # Extract path after bucket name
        parts = file_url.split("/storage/v1/object/public/drivve/")
        if len(parts) < 2:
            return
        
        file_path = parts[1]

        url = f"{SUPABASE_URL}/storage/v1/object/drivve/{file_path}"

        headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "apikey": SUPABASE_KEY
        }

        response = requests.delete(url, headers=headers)

        if response.status_code not in [200, 204]:
            print("Delete failed:", response.text)

    except Exception as e:
        print("Supabase delete error:", e)