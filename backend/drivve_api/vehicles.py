import shutil
import uuid
import json
from typing import List, Optional
from fastapi.encoders import jsonable_encoder
from fastapi.staticfiles import StaticFiles
import requests
from models import Vehicle
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

def delete_from_supabase(file_url):
    if not file_url:
        return

    try:
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

# ===================== GET =====================
@router.get("/api/v1/vehicles")
def get_vehicles(phone_number: str, db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle)\
        .filter(Vehicle.phone_number == phone_number)\
        .order_by(Vehicle.created_at.desc())\
        .all()

    # Parse multiple photos from notes if they exist
    result = []
    for v in vehicles:
        v_dict = jsonable_encoder(v)
        
        # Check if notes contains photo URLs (stored as JSON)
        if v.notes and v.notes.startswith('{"photos":'):
            try:
                photos_data = json.loads(v.notes)
                v_dict['photos'] = photos_data.get('photos', [])
                # Remove the JSON from notes for display
                v_dict['notes'] = photos_data.get('notes', '')
            except:
                v_dict['photos'] = [v.photo_url] if v.photo_url else []
        else:
            # Single photo for backward compatibility
            v_dict['photos'] = [v.photo_url] if v.photo_url else []
        
        result.append(v_dict)

    return {"vehicles": result}

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
    photos: List[UploadFile] = File(None),  # Multiple photos
    db: Session = Depends(get_db)
):
    # Validate at least one photo is provided
    if not photos or len(photos) == 0:
        raise HTTPException(400, "At least one vehicle photo is required")
    
    photo_urls = []
    main_photo_url = None
    
    # Upload multiple photos (max 5)
    for idx, photo in enumerate(photos[:5]):  # Limit to 5 photos
        if photo:
            file_bytes = await photo.read()
            filename = f"{uuid.uuid4()}.jpg"
            file_path = f"vehicles/{filename}"
            photo_url = upload_to_supabase(file_bytes, file_path)
            photo_urls.append(photo_url)
            if idx == 0:  # First photo as main
                main_photo_url = photo_url

    # Store multiple photos in notes as JSON, keep original notes separately
    if photo_urls:
        photos_data = {
            "photos": photo_urls,
            "notes": notes or ""
        }
        notes_with_photos = json.dumps(photos_data)
    else:
        notes_with_photos = notes

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
        notes=notes_with_photos,  # Store photos JSON in notes
        photo_url=main_photo_url,  # Store first photo for backward compatibility
    )

    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)

    return {"success": True, "vehicle_id": vehicle.id}

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
    photos: List[UploadFile] = File(None),
    existing_photo_urls: str = Form(None),  # JSON string of existing URLs to keep
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")

    # Parse existing photo URLs to keep
    existing_urls = []
    if existing_photo_urls:
        try:
            existing_urls = json.loads(existing_photo_urls)
        except:
            existing_urls = []

    # Get old photos from vehicle
    old_photos = []
    original_notes = ""
    
    if vehicle.notes and vehicle.notes.startswith('{"photos":'):
        try:
            old_data = json.loads(vehicle.notes)
            old_photos = old_data.get('photos', [])
            original_notes = old_data.get('notes', '')
        except:
            old_photos = []
            original_notes = vehicle.notes or ""
    else:
        old_photos = [vehicle.photo_url] if vehicle.photo_url else []
        original_notes = vehicle.notes or ""

    # Validate that after update, at least one photo exists
    total_photos_after_update = len(existing_urls) + (len(photos) if photos else 0)
    if total_photos_after_update == 0:
        raise HTTPException(400, "At least one vehicle photo is required")

    # Delete photos that are not in existing_urls
    for old_photo in old_photos:
        if old_photo and old_photo not in existing_urls:
            delete_from_supabase(old_photo)

    # Upload new photos
    new_photo_urls = []
    if photos:
        for photo in photos[:5]:  # Limit to 5 photos total
            if photo:
                file_bytes = await photo.read()
                filename = f"{uuid.uuid4()}.jpg"
                file_path = f"vehicles/{filename}"
                photo_url = upload_to_supabase(file_bytes, file_path)
                new_photo_urls.append(photo_url)

    # Combine existing and new photos (max 5)
    all_photo_urls = (existing_urls + new_photo_urls)[:5]
    
    # Store photos in notes as JSON
    if all_photo_urls:
        photos_data = {
            "photos": all_photo_urls,
            "notes": notes if notes is not None else original_notes
        }
        final_notes = json.dumps(photos_data)
    else:
        final_notes = notes if notes is not None else original_notes

    # Update vehicle fields
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
    vehicle.notes = final_notes
    vehicle.photo_url = all_photo_urls[0] if all_photo_urls else None  # Update main photo

    db.commit()
    return {"success": True}

# ===================== DELETE =====================
@router.delete("/api/v1/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    
    # Delete all photos from Supabase
    photo_urls = []
    if vehicle.notes and vehicle.notes.startswith('{"photos":'):
        try:
            photos_data = json.loads(vehicle.notes)
            photo_urls = photos_data.get('photos', [])
        except:
            pass
    
    if not photo_urls and vehicle.photo_url:
        photo_urls = [vehicle.photo_url]
    
    for photo_url in photo_urls:
        if photo_url:
            delete_from_supabase(photo_url)

    db.delete(vehicle)
    db.commit()
    return {"success": True}