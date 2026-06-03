import shutil
import uuid
import json
from typing import List, Optional
from fastapi.encoders import jsonable_encoder
from fastapi.staticfiles import StaticFiles
from models import Ride, Vehicle, RideSession
import os
from fastapi import Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from database import get_db
from fastapi import APIRouter
from models import DBList
from datetime import datetime, timezone

# Azure Blob Storage imports
from azure.storage.blob import BlobServiceClient, ContentSettings
from azure.core.exceptions import AzureError

router = APIRouter()

# Azure Storage Configuration
AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")
AZURE_STORAGE_URL = os.getenv("AZURE_STORAGE_URL")

# Initialize Azure Blob Service Client
try:
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
    container_client = blob_service_client.get_container_client(AZURE_CONTAINER_NAME)
    # Create container if it doesn't exist
    try:
        container_client.create_container()
    except Exception as e:
        # Container already exists
        pass
except Exception as e:
    print(f"Failed to initialize Azure Blob Storage: {str(e)}")
    blob_service_client = None


# ===================== AZURE BLOB STORAGE FUNCTIONS =====================

def upload_to_azure(file_bytes, file_path, content_type="image/jpeg"):
    """
    Upload a file to Azure Blob Storage
    
    Args:
        file_bytes: Bytes of the file to upload
        file_path: Path within the container (e.g., "vehicles/123.jpg")
        content_type: MIME type of the file
    
    Returns:
        Public URL of the uploaded file
    """
    if not blob_service_client:
        raise Exception("Azure Blob Storage client not initialized")
    
    try:
        # Get blob client
        blob_client = blob_service_client.get_blob_client(
            container=AZURE_CONTAINER_NAME, 
            blob=file_path
        )
        
        # Upload the file
        blob_client.upload_blob(
            file_bytes, 
            overwrite=True,
            content_settings=ContentSettings(content_type=content_type)
        )
        
        # Generate public URL
        public_url = f"{AZURE_STORAGE_URL}/{AZURE_CONTAINER_NAME}/{file_path}"
        
        return public_url
        
    except AzureError as e:
        raise Exception(f"Azure upload failed: {str(e)}")
    except Exception as e:
        raise Exception(f"Upload failed: {str(e)}")


def delete_from_azure(file_url):
    """
    Delete a file from Azure Blob Storage
    """
    if not file_url:
        return

    try:
        # Extract the blob path from the URL
        # URL format: https://{storage_url}/{container}/{file_path}
        parts = file_url.split(f"{AZURE_STORAGE_URL}/{AZURE_CONTAINER_NAME}/")
        if len(parts) < 2:
            # Try alternative format without container in URL
            parts = file_url.split(f"{AZURE_CONTAINER_NAME}/")
            if len(parts) < 2:
                return
        
        file_path = parts[1]
        
        # Get blob client and delete
        blob_client = blob_service_client.get_blob_client(
            container=AZURE_CONTAINER_NAME,
            blob=file_path
        )
        
        blob_client.delete_blob()
        
    except Exception as e:
        print(f"Azure delete error: {e}")


# ===================== HELPER FUNCTION =====================

def has_ongoing_ride(db: Session, vehicle_id: int) -> tuple:
    """
    Check if vehicle has an ongoing ride that locks it.
    Returns (has_ongoing_ride, ride_details)
    """
    ongoing_ride = db.query(Ride).filter(
        Ride.vehicle_id == vehicle_id,
        Ride.is_deleted == False,
        Ride.status == 'ongoing'  # Only 'ongoing' status locks the vehicle
    ).first()
    
    if ongoing_ride:
        ride_details = {
            "ride_id": ongoing_ride.id,
            "status": ongoing_ride.status,
            "departure_time": ongoing_ride.departure_time.isoformat() if ongoing_ride.departure_time else None,
            "origin": ongoing_ride.origin,
            "destination": ongoing_ride.destination
        }
        return True, ride_details
    
    return False, None


# ===================== GET VEHICLES =====================

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


# ===================== ADD VEHICLE =====================

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
            photo_url = upload_to_azure(file_bytes, file_path, "image/jpeg")
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


# ===================== UPDATE VEHICLE WITH LOCK =====================

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
    existing_photo_urls: str = Form(None),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    
    # Check if vehicle has ongoing ride - BLOCK UPDATE
    has_ongoing, ongoing_ride_details = has_ongoing_ride(db, vehicle_id)
    
    if has_ongoing:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot update vehicle. This vehicle is currently being used for an ongoing ride (ID: {ongoing_ride_details['ride_id']}, Status: ongoing). Please complete the ride first."
        )

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
            delete_from_azure(old_photo)

    # Upload new photos
    new_photo_urls = []
    if photos:
        for photo in photos[:5]:
            if photo:
                file_bytes = await photo.read()
                filename = f"{uuid.uuid4()}.jpg"
                file_path = f"vehicles/{filename}"
                photo_url = upload_to_azure(file_bytes, file_path, "image/jpeg")
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
    vehicle.photo_url = all_photo_urls[0] if all_photo_urls else None

    db.commit()
    
    return {
        "success": True, 
        "message": "Vehicle updated successfully"
    }


# ===================== DELETE VEHICLE WITH LOCK =====================

@router.delete("/api/v1/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    
    # Check if vehicle has ongoing ride - BLOCK DELETE
    has_ongoing, ongoing_ride_details = has_ongoing_ride(db, vehicle_id)
    
    if has_ongoing:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot delete vehicle. This vehicle is currently being used for an ongoing ride (ID: {ongoing_ride_details['ride_id']}, Status: ongoing). Please complete the ride first."
        )
    
    # Delete all photos from Azure
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
            delete_from_azure(photo_url)

    db.delete(vehicle)
    db.commit()
    
    return {"success": True, "message": "Vehicle deleted successfully"}


# ===================== COMPLETE RIDE AND RELEASE VEHICLE =====================

@router.put("/api/v1/rides/{ride_id}/complete-and-release-vehicle")
def complete_ride_and_release_vehicle(ride_id: int, db: Session = Depends(get_db)):
    """Complete a ride and release the vehicle for editing/deletion"""
    
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(404, "Ride not found")
    
    # Check if ride is ongoing
    if ride.status != 'ongoing':
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot complete ride with status '{ride.status}'. Only ongoing rides can be completed."
        )
    
    # Change status to completed to unlock vehicle
    ride.status = 'completed'
    ride.completed_at = datetime.now(timezone.utc)
    
    # Update ride session if exists
    active_session = db.query(RideSession).filter(
        RideSession.ride_id == ride_id,
        RideSession.status.in_(['driver_started', 'boarding', 'en_route'])
    ).first()
    
    if active_session:
        active_session.status = 'completed'
        active_session.ended_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {
        "success": True,
        "message": "Ride completed successfully. Vehicle is now unlocked for editing/deletion.",
        "ride_id": ride_id,
        "vehicle_id": ride.vehicle_id,
        "new_status": "completed"
    }


# ===================== CHECK VEHICLE RIDE STATUS (LEGACY) =====================

@router.get("/api/v1/vehicles/{vehicle_id}/ride-status")
def check_vehicle_ride_status(vehicle_id: int, db: Session = Depends(get_db)):
    """Check if vehicle has any ongoing rides (not completed or cancelled)"""
    
    # Check for active rides with this vehicle
    active_rides = db.query(Ride).filter(
        Ride.vehicle_id == vehicle_id,
        Ride.is_deleted == False,
        Ride.status.notin_(['completed', 'cancelled', 'ended'])
    ).first()
    
    has_ongoing_ride = active_rides is not None
    
    # Get ride details if exists
    ride_details = None
    if has_ongoing_ride:
        ride_details = {
            "ride_id": active_rides.id,
            "status": active_rides.status,
            "departure_time": active_rides.departure_time.isoformat() if active_rides.departure_time else None,
            "origin": active_rides.origin,
            "destination": active_rides.destination
        }
    
    return {
        "has_ongoing_ride": has_ongoing_ride,
        "ride_details": ride_details
    }


# ===================== GET VEHICLE ONGOING STATUS (OPTIMIZED FOR FRONTEND) =====================

@router.get("/api/v1/vehicles/{vehicle_id}/ongoing-status")
def get_vehicle_ongoing_status(vehicle_id: int, db: Session = Depends(get_db)):
    """Get ONLY ongoing ride status for a vehicle (optimized for frontend)"""
    
    # Find active ride where vehicle is being used and status is 'ongoing'
    # Only 'ongoing' status locks the vehicle - NOT 'active', 'full', etc.
    ongoing_ride = db.query(Ride).filter(
        Ride.vehicle_id == vehicle_id,
        Ride.is_deleted == False,
        Ride.status == 'ongoing'  # Only 'ongoing' status locks the vehicle
    ).first()
    
    has_ongoing_ride = ongoing_ride is not None
    
    ride_details = None
    if has_ongoing_ride:
        ride_details = {
            "ride_id": ongoing_ride.id,
            "status": ongoing_ride.status,
            "departure_time": ongoing_ride.departure_time.isoformat() if ongoing_ride.departure_time else None,
            "origin": ongoing_ride.origin,
            "destination": ongoing_ride.destination
        }
    
    return {
        "has_ongoing_ride": has_ongoing_ride,
        "ride_details": ride_details
    }


# ===================== GET VEHICLE DETAILS WITH STATUS =====================

@router.get("/api/v1/vehicles/{vehicle_id}/details")
def get_vehicle_details(vehicle_id: int, db: Session = Depends(get_db)):
    """Get vehicle details including lock status"""
    
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    
    # Check ongoing status
    has_ongoing, ongoing_ride_details = has_ongoing_ride(db, vehicle_id)
    
    # Parse photos
    photos = []
    if vehicle.notes and vehicle.notes.startswith('{"photos":'):
        try:
            photos_data = json.loads(vehicle.notes)
            photos = photos_data.get('photos', [])
            vehicle_notes = photos_data.get('notes', '')
        except:
            photos = [vehicle.photo_url] if vehicle.photo_url else []
            vehicle_notes = vehicle.notes or ""
    else:
        photos = [vehicle.photo_url] if vehicle.photo_url else []
        vehicle_notes = vehicle.notes or ""
    
    return {
        "success": True,
        "vehicle": {
            "id": vehicle.id,
            "phone_number": vehicle.phone_number,
            "vehicle_type": vehicle.vehicle_type,
            "body_type": vehicle.body_type,
            "fuel_type": vehicle.fuel_type,
            "make": vehicle.make,
            "model": vehicle.model,
            "year": vehicle.year,
            "registration_number": vehicle.registration_number,
            "color": vehicle.color,
            "max_seats": vehicle.max_seats,
            "notes": vehicle_notes,
            "photo_url": vehicle.photo_url,
            "photos": photos,
            "created_at": vehicle.created_at.isoformat() if vehicle.created_at else None,
            "is_locked": has_ongoing,
            "ongoing_ride": ongoing_ride_details
        }
    }


# ===================== DB LIST GET =====================

@router.get("/api/v1/db-list")
def get_db_list(
    body_type: Optional[str] = None,
    fuel_type: Optional[str] = None,
    make_company_name: Optional[str] = None,
    model_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(DBList)

    # Filters
    if body_type:
        query = query.filter(DBList.body_type.ilike(f"%{body_type}%"))

    if fuel_type:
        query = query.filter(DBList.fuel_type.ilike(f"%{fuel_type}%"))

    if make_company_name:
        query = query.filter(
            DBList.make_company_name.ilike(f"%{make_company_name}%")
        )

    if model_name:
        query = query.filter(
            DBList.model_name.ilike(f"%{model_name}%")
        )

    data = query.order_by(DBList.id.desc()).all()

    return {
        "success": True,
        "count": len(data),
        "data": jsonable_encoder(data)
    }