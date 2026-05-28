# import base64
# from datetime import datetime, timedelta, timezone

# import os
# import random
# import string
# from typing import Dict, Optional
# import uuid

# import requests
# import resend
# from user_id_generator import generate_user_id
# from pydantic import BaseModel, EmailStr
# from models import User, UserStatus,Vehicle,MatchingPreferenceUser,Ride, RideFeedback
# from database import get_db
# from sqlalchemy.orm import Session
# from fastapi import Depends, HTTPException, APIRouter
# from gotrue import SyncGoTrueClient
# from dotenv import load_dotenv
# load_dotenv()
# from utils.jwt_helper import (
#     create_access_token,
#     create_refresh_token
# )
# router = APIRouter()

# BASE_URL = os.getenv("BASE_URLS")
# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")


# # ================= SUPABASE UPLOAD =================

# def upload_to_supabase(file_bytes, file_path):
#     url = f"{SUPABASE_URL}/storage/v1/object/drivve/{file_path}?upsert=true"

#     headers = {
#         "Authorization": f"Bearer {SUPABASE_KEY}",
#         "apikey": SUPABASE_KEY,
#         "Content-Type": "image/jpeg"
#     }

#     response = requests.put(url, headers=headers, data=file_bytes)

#     if response.status_code not in [200, 201]:
#         raise Exception(f"Upload failed: {response.text}")

#     return f"{SUPABASE_URL}/storage/v1/object/public/drivve/{file_path}"


# # ================= EMAIL OTP =================
# SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE")

# auth_client = SyncGoTrueClient(
#     url=f"{SUPABASE_URL}/auth/v1",
#     headers={
#         "apikey": SUPABASE_ANON_KEY
#     }
# )

# class EmailOTPRequest(BaseModel):
#     email: EmailStr

# class EmailOTPVerify(BaseModel):
#     email: EmailStr
#     otp: str
# email_otp_store: Dict[str, Dict] = {}
# EMAIL_USER =os.getenv("EMAIL_USER")
# EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD") 
# EMAIL_FROM = os.getenv("EMAIL_FROM")


# def generate_otp():
#     return ''.join(random.choices(string.digits, k=6))
# import smtplib
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart


# @router.post("/auth/send-email-otp")
# async def send_email_otp(request: EmailOTPRequest):

#     try:
#         otp = generate_otp()

#         # Store OTP for 5 mins
#         email_otp_store[request.email] = {
#             "otp": otp,
#             "expires": datetime.utcnow() + timedelta(minutes=5)
#         }


#         html = f"""
#         <div style="font-family: Arial;">
#             <h2>DRIVVE Email Verification</h2>
#             <p>Your OTP is:</p>
#             <h1>{otp}</h1>
#             <p>Valid for 5 minutes.</p>
#         </div>
#         """


        
#         resend.api_key = os.getenv("RESEND_API_KEY")

#         resend.Emails.send({
#             "from": EMAIL_FROM,
#             "to": [request.email],
#             "subject": "DRIVVE Email Verification OTP",
#             "html": html
#         })

#         return {
#             "success": True,
#             "message": "OTP sent successfully"
#         }

#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )
# @router.post("/auth/verify-email-otp")
# async def verify_email_otp(request: EmailOTPVerify):

#     data = email_otp_store.get(request.email)

#     if not data:
#         raise HTTPException(
#             status_code=400,
#             detail="OTP not found"
#         )

#     if datetime.utcnow() > data["expires"]:
#         del email_otp_store[request.email]

#         raise HTTPException(
#             status_code=400,
#             detail="OTP expired"
#         )

#     if data["otp"] != request.otp:
#         raise HTTPException(
#             status_code=400,
#             detail="Invalid OTP"
#         )

#     del email_otp_store[request.email]

#     return {
#         "success": True,
#         "message": "Email verified successfully"
#     }

# def get_email_html(otp: str) -> str:
#     return f"<h2>Your OTP: {otp}</h2>"


# # ================= CREATE PROFILE =================

# @router.post("/api/v1/users/create")
# async def create_user_profile(profile_data: dict, db: Session = Depends(get_db)):
#     try:
#         phone_number = profile_data.get("phone_number")
#         first_name = profile_data.get("first_name")
#         last_name = profile_data.get("last_name")

#         if not phone_number or not first_name:
#             raise HTTPException(400, "Phone number and first name required")

#         user = db.query(User).filter(
#             User.phone_number == phone_number
#         ).first()

#         if not user:
#             user = User(
#                 phone_number=phone_number,
#                 country_code=profile_data.get("country_code", "+91"),
#                 is_phone_verified=True,
#                 status=UserStatus.PENDING,
#                 profile_completed=False
#             )
#             db.add(user)

#         # ================= IMAGE / AVATAR =================

#         avatar_name = profile_data.get("avatar")
#         base64_image = profile_data.get("profile_image")

#         # 🔥 PRIORITY: IMAGE > AVATAR
#         if base64_image:
#             try:
#                 if "base64," in base64_image:
#                     base64_image = base64_image.split("base64,")[1]

#                 missing_padding = len(base64_image) % 4
#                 if missing_padding:
#                     base64_image += "=" * (4 - missing_padding)

#                 image_bytes = base64.b64decode(base64_image)

#                 filename = f"{uuid.uuid4()}.jpg"
#                 file_path = f"profile/{filename}"

#                 image_url = upload_to_supabase(image_bytes, file_path)

#                 user.profile_picture = image_url

#             except Exception as e:
#                 raise HTTPException(500, f"Image upload failed: {str(e)}")

#         elif avatar_name:
#             user.profile_picture = (
#                 f"{SUPABASE_URL}/storage/v1/object/public/drivve/avatars/{avatar_name}"
#             )

#         else:
#             user.profile_picture = None

#         # ================= OTHER FIELDS =================

#         user.user_id = generate_user_id(first_name, last_name, phone_number)
#         user.first_name = first_name
#         user.last_name = last_name
#         user.full_name = f"{first_name} {last_name or ''}".strip()
#         user.email = profile_data.get("email")
#         user.email_verified = profile_data.get("email_verified", False)

#         dob = profile_data.get("date_of_birth")
#         if dob:
#             user.date_of_birth = datetime.strptime(dob, "%Y-%m-%d").date()

#         user.gender = profile_data.get("gender")
#         user.state = profile_data.get("state")
#         user.city = profile_data.get("city")
#         user.referral_code = profile_data.get("referral_code")

#         user.profile_completed = True
#         user.status = UserStatus.ACTIVE
#         user.updated_at = datetime.now(timezone.utc)

#         db.commit()
#         db.refresh(user)
#         access_token = create_access_token(user.id)
#         refresh_token = create_refresh_token(user.id)
#         return {
#                 "success": True,
#                 "message": "Profile created successfully ✅",
#                 "user_id": user.user_id,
#                 "profile_picture": user.profile_picture,

#                 "accessToken": access_token,
#                 "refreshToken": refresh_token,

#                 "user": {
#                     "id": user.id,
#                     "user_id": user.user_id,
#                     "phone_number": user.phone_number,
#                     "first_name": user.first_name,
#                     "last_name": user.last_name,
#                     "email": user.email,
#                 }
#         }

#     except Exception as e:
#         db.rollback()
#         raise HTTPException(500, str(e))
    
    
# # ================= ADMIN - GET ALL USERS =================

# @router.get("/api/v1/admin/users/list")
# async def get_all_users(db: Session = Depends(get_db)):
#     """Get all users for admin filter dropdown"""
#     try:
#         users = db.query(User).filter(
#             User.status == UserStatus.ACTIVE,
#             User.profile_completed == True
#         ).all()
        
#         users_data = []
#         for user in users:
#             users_data.append({
#                 "user_id": user.user_id,  # String like "D-SV2310"
#                 "name": user.full_name or f"{user.first_name} {user.last_name or ''}".strip(),
#                 "phone": user.phone_number,
#                 "email": user.email or ""
#             })
        
#         return {
#             "success": True,
#             "users": users_data
#         }
#     except Exception as e:
#         print(f"❌ Error in get_all_users: {str(e)}")
#         raise HTTPException(500, str(e))
    
    
# @router.get("/api/v1/users/profile-public")
# async def get_public_profile(
#     phone_number: Optional[str] = None,
#     user_id: Optional[str] = None,
#     db: Session = Depends(get_db)
# ):
#     """
#     Get public profile information for a user
#     """
#     try:
#         # Find the user
#         user = None
#         if user_id:
#             user = db.query(User).filter(User.user_id == user_id).first()
#         elif phone_number:
#             user = db.query(User).filter(User.phone_number == phone_number).first()
#         else:
#             raise HTTPException(400, "Either phone_number or user_id is required")
        
#         if not user:
#             raise HTTPException(404, "User not found")
        
#         # 1. Get vehicle info
#         vehicle = db.query(Vehicle).filter(
#             Vehicle.phone_number == user.phone_number
#         ).order_by(Vehicle.created_at.desc()).first()
        
#         vehicle_data = None
#         if vehicle:
#             photos = []
#             if vehicle.notes and vehicle.notes.startswith('{"photos":'):
#                 try:
#                     import json
#                     photos_data = json.loads(vehicle.notes)
#                     photos = photos_data.get('photos', [])
#                 except:
#                     photos = [vehicle.photo_url] if vehicle.photo_url else []
#             else:
#                 photos = [vehicle.photo_url] if vehicle.photo_url else []
            
#             vehicle_data = {
#                 "id": vehicle.id,
#                 "vehicle_type": vehicle.vehicle_type,
#                 "body_type": vehicle.body_type,
#                 "fuel_type": vehicle.fuel_type,
#                 "make": vehicle.make,
#                 "model": vehicle.model,
#                 "year": vehicle.year,
#                 "registration_number": vehicle.registration_number,
#                 "color": vehicle.color,
#                 "max_seats": vehicle.max_seats,
#                 "photo_url": vehicle.photo_url,
#                 "photos": photos,
#                 "type": vehicle.vehicle_type  # Add this for compatibility
#             }
        
#         # 2. ⭐ GET TRAVEL PREFERENCES from MatchingPreferenceUser table ⭐
#         preferences = db.query(MatchingPreferenceUser).filter(
#             MatchingPreferenceUser.phone_number == user.phone_number
#         ).all()
        
#         # Initialize default travel preferences
#         travel_preferences = {
#             "music": True,    # Default: allowed
#             "ac": True,       # Default: available  
#             "pets": False,    # Default: not allowed
#             "smoking": False  # Default: not allowed
#         }
        
#         # Override with actual user preferences from database
#         for pref in preferences:
#             key = pref.preference_key
#             value = pref.value
            
#             # Handle different value formats from MatchingPreferenceUser
#             if isinstance(value, dict):
#                 # If value is a dict like {"value": true}
#                 travel_preferences[key] = value.get('value', travel_preferences.get(key, False))
#             elif isinstance(value, list) and len(value) > 0:
#                 # If value is a list like [{"value": true}]
#                 if isinstance(value[0], dict):
#                     travel_preferences[key] = value[0].get('value', travel_preferences.get(key, False))
#                 else:
#                     travel_preferences[key] = value[0] if value[0] is not None else travel_preferences.get(key, False)
#             elif isinstance(value, bool):
#                 # If value is direct boolean
#                 travel_preferences[key] = value
#             else:
#                 # Fallback
#                 travel_preferences[key] = bool(value) if value is not None else travel_preferences.get(key, False)
        
#         print(f"Travel preferences for {user.phone_number}: {travel_preferences}")  # Debug log
        
#         # 3. Calculate statistics
#         completed_rides_as_driver = db.query(Ride).filter(
#             Ride.phone_number == user.phone_number,
#             Ride.status == "completed"
#         ).count()
        
#         cancelled_rides = db.query(Ride).filter(
#             Ride.phone_number == user.phone_number,
#             Ride.status == "cancelled"
#         ).count()
        
#         on_time_rate = 98
#         response_rate = 95
        
#         # 4. Get reviews
#         reviews_data = []
#         total_rating_sum = 0
#         total_ratings_count = 0
        
#         feedback_received = db.query(RideFeedback).filter(
#             RideFeedback.feedback_for_user_id == user.id,
#             RideFeedback.rating.isnot(None)
#         ).order_by(RideFeedback.created_at.desc()).limit(10).all()
        
#         for feedback in feedback_received:
#             reviewer = db.query(User).filter(User.id == feedback.feedback_by_user_id).first()
            
#             total_rating_sum += feedback.rating
#             total_ratings_count += 1
            
#             reviews_data.append({
#                 "rating": feedback.rating,
#                 "comment": feedback.comment,
#                 "reviewer_name": reviewer.full_name if reviewer else "Anonymous",
#                 "reviewer_photo": reviewer.profile_picture if reviewer else None,
#                 "date": feedback.created_at.isoformat() if feedback.created_at else None,
#                 "route": None
#             })
        
#         avg_rating = total_rating_sum / total_ratings_count if total_ratings_count > 0 else 5.0
        
#         # 5. Prepare profile response
#         profile_data = {
#             "user_id": user.user_id,
#             "phone_number": user.phone_number,
#             "full_name": user.full_name,
#             "first_name": user.first_name,
#             "last_name": user.last_name,
#             "profile_picture": user.profile_picture,
#             "email": user.email,
#             "bio": user.bio or "I am happy to share the ride. Lets Drivve!",
#             "about": user.bio or "I am happy to share the ride. Lets Drivve!",
#             "avg_rating": avg_rating,
#             "total_ratings": total_ratings_count,
#             "created_at": user.created_at.isoformat() if user.created_at else None,
#             "vehicle": vehicle_data,
#             "travel_preferences": travel_preferences,  # ⭐ THIS IS THE KEY FIX ⭐
#             "stats": {
#                 "posted_rides": completed_rides_as_driver,
#                 "cancelled_rides": cancelled_rides,
#                 "on_time_rate": on_time_rate,
#                 "response_rate": response_rate
#             },
#             "reviews": reviews_data,
#             "profile_completed": user.profile_completed,
#         }
        
#         return {
#             "success": True,
#             "user": profile_data
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"❌ Error in get_public_profile: {str(e)}")
#         raise HTTPException(500, f"Failed to fetch profile: {str(e)}")
# import base64
# from datetime import datetime, timedelta, timezone

# import os
# import random
# import string
# from typing import Dict, Optional
# import uuid

# import resend
# from user_id_generator import generate_user_id
# from pydantic import BaseModel, EmailStr
# from models import User, UserStatus, Vehicle, MatchingPreferenceUser, Ride, RideFeedback
# from database import get_db
# from sqlalchemy.orm import Session
# from fastapi import Depends, HTTPException, APIRouter
# from dotenv import load_dotenv
# load_dotenv()
# from utils.jwt_helper import (
#     create_access_token,
#     create_refresh_token
# )

# # Azure Blob Storage imports
# from azure.storage.blob import BlobServiceClient, ContentSettings
# from azure.core.exceptions import AzureError

# router = APIRouter()

# # Azure Storage Configuration
# AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
# AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")
# AZURE_STORAGE_URL = os.getenv("AZURE_STORAGE_URL")

# # Initialize Azure Blob Service Client
# try:
#     blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
#     container_client = blob_service_client.get_container_client(AZURE_CONTAINER_NAME)
#     # Create container if it doesn't exist
#     try:
#         container_client.create_container()
#     except Exception as e:
#         # Container already exists
#         pass
# except Exception as e:
#     print(f"Failed to initialize Azure Blob Storage: {str(e)}")
#     blob_service_client = None


# # ================= AZURE BLOB STORAGE UPLOAD =================

# def upload_to_azure(file_bytes, file_path, content_type="image/jpeg"):
#     """
#     Upload a file to Azure Blob Storage
    
#     Args:
#         file_bytes: Bytes of the file to upload
#         file_path: Path within the container (e.g., "profile/123.jpg")
#         content_type: MIME type of the file
    
#     Returns:
#         Public URL of the uploaded file
#     """
#     if not blob_service_client:
#         raise Exception("Azure Blob Storage client not initialized")
    
#     try:
#         # Get blob client
#         blob_client = blob_service_client.get_blob_client(
#             container=AZURE_CONTAINER_NAME, 
#             blob=file_path
#         )
        
#         # Upload the file
#         blob_client.upload_blob(
#             file_bytes, 
#             overwrite=True,
#             content_settings=ContentSettings(content_type=content_type)
#         )
        
#         # Generate public URL
#         public_url = f"{AZURE_STORAGE_URL}/{AZURE_CONTAINER_NAME}/{file_path}"
        
#         return public_url
        
#     except AzureError as e:
#         raise Exception(f"Azure upload failed: {str(e)}")
#     except Exception as e:
#         raise Exception(f"Upload failed: {str(e)}")


# # ================= EMAIL OTP =================

# class EmailOTPRequest(BaseModel):
#     email: EmailStr

# class EmailOTPVerify(BaseModel):
#     email: EmailStr
#     otp: str

# email_otp_store: Dict[str, Dict] = {}
# EMAIL_FROM = os.getenv("EMAIL_FROM")


# def generate_otp():
#     return ''.join(random.choices(string.digits, k=6))


# @router.post("/auth/send-email-otp")
# async def send_email_otp(request: EmailOTPRequest):
#     try:
#         otp = generate_otp()

#         # Store OTP for 5 mins
#         email_otp_store[request.email] = {
#             "otp": otp,
#             "expires": datetime.utcnow() + timedelta(minutes=5)
#         }

#         html = f"""
#         <div style="font-family: Arial;">
#             <h2>DRIVVE Email Verification</h2>
#             <p>Your OTP is:</p>
#             <h1>{otp}</h1>
#             <p>Valid for 5 minutes.</p>
#         </div>
#         """
        
#         resend.api_key = os.getenv("RESEND_API_KEY")

#         resend.Emails.send({
#             "from": EMAIL_FROM,
#             "to": [request.email],
#             "subject": "DRIVVE Email Verification OTP",
#             "html": html
#         })

#         return {
#             "success": True,
#             "message": "OTP sent successfully"
#         }

#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )
        

# @router.post("/auth/verify-email-otp")
# async def verify_email_otp(request: EmailOTPVerify):
#     data = email_otp_store.get(request.email)

#     if not data:
#         raise HTTPException(
#             status_code=400,
#             detail="OTP not found"
#         )

#     if datetime.utcnow() > data["expires"]:
#         del email_otp_store[request.email]
#         raise HTTPException(
#             status_code=400,
#             detail="OTP expired"
#         )

#     if data["otp"] != request.otp:
#         raise HTTPException(
#             status_code=400,
#             detail="Invalid OTP"
#         )

#     del email_otp_store[request.email]

#     return {
#         "success": True,
#         "message": "Email verified successfully"
#     }


# # ================= CREATE PROFILE =================

# @router.post("/api/v1/users/create")
# async def create_user_profile(profile_data: dict, db: Session = Depends(get_db)):
#     try:
#         phone_number = profile_data.get("phone_number")
#         first_name = profile_data.get("first_name")
#         last_name = profile_data.get("last_name")

#         if not phone_number or not first_name:
#             raise HTTPException(400, "Phone number and first name required")

#         user = db.query(User).filter(
#             User.phone_number == phone_number
#         ).first()

#         if not user:
#             user = User(
#                 phone_number=phone_number,
#                 country_code=profile_data.get("country_code", "+91"),
#                 is_phone_verified=True,
#                 status=UserStatus.PENDING,
#                 profile_completed=False
#             )
#             db.add(user)

#         # ================= IMAGE / AVATAR =================

#         avatar_name = profile_data.get("avatar")
#         base64_image = profile_data.get("profile_image")

#         # 🔥 PRIORITY: IMAGE > AVATAR
#         if base64_image:
#             try:
#                 if "base64," in base64_image:
#                     base64_image = base64_image.split("base64,")[1]

#                 missing_padding = len(base64_image) % 4
#                 if missing_padding:
#                     base64_image += "=" * (4 - missing_padding)

#                 image_bytes = base64.b64decode(base64_image)

#                 filename = f"{uuid.uuid4()}.jpg"
#                 file_path = f"profile/{filename}"

#                 # Upload to Azure
#                 image_url = upload_to_azure(image_bytes, file_path, "image/jpeg")
#                 user.profile_picture = image_url

#             except Exception as e:
#                 raise HTTPException(500, f"Image upload failed: {str(e)}")

#         elif avatar_name:
#             # Use pre-existing avatar from Azure
#             user.profile_picture = (
#                 f"{AZURE_STORAGE_URL}/{AZURE_CONTAINER_NAME}/avatars/{avatar_name}"
#             )
#         else:
#             user.profile_picture = None

#         # ================= OTHER FIELDS =================

#         user.user_id = generate_user_id(first_name, last_name, phone_number)
#         user.first_name = first_name
#         user.last_name = last_name
#         user.full_name = f"{first_name} {last_name or ''}".strip()
#         user.email = profile_data.get("email")
#         user.email_verified = profile_data.get("email_verified", False)

#         dob = profile_data.get("date_of_birth")
#         if dob:
#             user.date_of_birth = datetime.strptime(dob, "%Y-%m-%d").date()

#         user.gender = profile_data.get("gender")
#         user.state = profile_data.get("state")
#         user.city = profile_data.get("city")
#         user.referral_code = profile_data.get("referral_code")

#         user.profile_completed = True
#         user.status = UserStatus.ACTIVE
#         user.updated_at = datetime.now(timezone.utc)

#         db.commit()
#         db.refresh(user)
        
#         access_token = create_access_token(user.id)
#         refresh_token = create_refresh_token(user.id)
        
#         return {
#             "success": True,
#             "message": "Profile created successfully ✅",
#             "user_id": user.user_id,
#             "profile_picture": user.profile_picture,
#             "accessToken": access_token,
#             "refreshToken": refresh_token,
#             "user": {
#                 "id": user.id,
#                 "user_id": user.user_id,
#                 "phone_number": user.phone_number,
#                 "first_name": user.first_name,
#                 "last_name": user.last_name,
#                 "email": user.email,
#             }
#         }

#     except Exception as e:
#         db.rollback()
#         raise HTTPException(500, str(e))
    
    
# # ================= ADMIN - GET ALL USERS =================

# @router.get("/api/v1/admin/users/list")
# async def get_all_users(db: Session = Depends(get_db)):
#     """Get all users for admin filter dropdown"""
#     try:
#         users = db.query(User).filter(
#             User.status == UserStatus.ACTIVE,
#             User.profile_completed == True
#         ).all()
        
#         users_data = []
#         for user in users:
#             users_data.append({
#                 "user_id": user.user_id,
#                 "name": user.full_name or f"{user.first_name} {user.last_name or ''}".strip(),
#                 "phone": user.phone_number,
#                 "email": user.email or ""
#             })
        
#         return {
#             "success": True,
#             "users": users_data
#         }
#     except Exception as e:
#         print(f"❌ Error in get_all_users: {str(e)}")
#         raise HTTPException(500, str(e))
    
    
# @router.get("/api/v1/users/profile-public")
# async def get_public_profile(
#     phone_number: Optional[str] = None,
#     user_id: Optional[str] = None,
#     db: Session = Depends(get_db)
# ):
#     """
#     Get public profile information for a user
#     """
#     try:
#         # Find the user
#         user = None
#         if user_id:
#             user = db.query(User).filter(User.user_id == user_id).first()
#         elif phone_number:
#             user = db.query(User).filter(User.phone_number == phone_number).first()
#         else:
#             raise HTTPException(400, "Either phone_number or user_id is required")
        
#         if not user:
#             raise HTTPException(404, "User not found")
        
#         # 1. Get vehicle info
#         vehicle = db.query(Vehicle).filter(
#             Vehicle.phone_number == user.phone_number
#         ).order_by(Vehicle.created_at.desc()).first()
        
#         vehicle_data = None
#         if vehicle:
#             photos = []
#             if vehicle.notes and vehicle.notes.startswith('{"photos":'):
#                 try:
#                     import json
#                     photos_data = json.loads(vehicle.notes)
#                     photos = photos_data.get('photos', [])
#                 except:
#                     photos = [vehicle.photo_url] if vehicle.photo_url else []
#             else:
#                 photos = [vehicle.photo_url] if vehicle.photo_url else []
            
#             vehicle_data = {
#                 "id": vehicle.id,
#                 "vehicle_type": vehicle.vehicle_type,
#                 "body_type": vehicle.body_type,
#                 "fuel_type": vehicle.fuel_type,
#                 "make": vehicle.make,
#                 "model": vehicle.model,
#                 "year": vehicle.year,
#                 "registration_number": vehicle.registration_number,
#                 "color": vehicle.color,
#                 "max_seats": vehicle.max_seats,
#                 "photo_url": vehicle.photo_url,
#                 "photos": photos,
#                 "type": vehicle.vehicle_type
#             }
        
#         # 2. Get travel preferences
#         preferences = db.query(MatchingPreferenceUser).filter(
#             MatchingPreferenceUser.phone_number == user.phone_number
#         ).all()
        
#         # Initialize default travel preferences
#         travel_preferences = {
#             "music": True,
#             "ac": True,
#             "pets": False,
#             "smoking": False
#         }
        
#         # Override with actual user preferences
#         for pref in preferences:
#             key = pref.preference_key
#             value = pref.value
            
#             if isinstance(value, dict):
#                 travel_preferences[key] = value.get('value', travel_preferences.get(key, False))
#             elif isinstance(value, list) and len(value) > 0:
#                 if isinstance(value[0], dict):
#                     travel_preferences[key] = value[0].get('value', travel_preferences.get(key, False))
#                 else:
#                     travel_preferences[key] = value[0] if value[0] is not None else travel_preferences.get(key, False)
#             elif isinstance(value, bool):
#                 travel_preferences[key] = value
#             else:
#                 travel_preferences[key] = bool(value) if value is not None else travel_preferences.get(key, False)
        
#         # 3. Calculate statistics
#         completed_rides_as_driver = db.query(Ride).filter(
#             Ride.phone_number == user.phone_number,
#             Ride.status == "completed"
#         ).count()
        
#         cancelled_rides = db.query(Ride).filter(
#             Ride.phone_number == user.phone_number,
#             Ride.status == "cancelled"
#         ).count()
        
#         on_time_rate = 98
#         response_rate = 95
        
#         # 4. Get reviews
#         reviews_data = []
#         total_rating_sum = 0
#         total_ratings_count = 0
        
#         feedback_received = db.query(RideFeedback).filter(
#             RideFeedback.feedback_for_user_id == user.id,
#             RideFeedback.rating.isnot(None)
#         ).order_by(RideFeedback.created_at.desc()).limit(10).all()
        
#         for feedback in feedback_received:
#             reviewer = db.query(User).filter(User.id == feedback.feedback_by_user_id).first()
            
#             total_rating_sum += feedback.rating
#             total_ratings_count += 1
            
#             reviews_data.append({
#                 "rating": feedback.rating,
#                 "comment": feedback.comment,
#                 "reviewer_name": reviewer.full_name if reviewer else "Anonymous",
#                 "reviewer_photo": reviewer.profile_picture if reviewer else None,
#                 "date": feedback.created_at.isoformat() if feedback.created_at else None,
#                 "route": None
#             })
        
#         avg_rating = total_rating_sum / total_ratings_count if total_ratings_count > 0 else 5.0
        
#         # 5. Prepare profile response
#         profile_data = {
#             "user_id": user.user_id,
#             "phone_number": user.phone_number,
#             "full_name": user.full_name,
#             "first_name": user.first_name,
#             "last_name": user.last_name,
#             "profile_picture": user.profile_picture,
#             "email": user.email,
#             "bio": user.bio or "I am happy to share the ride. Lets Drivve!",
#             "about": user.bio or "I am happy to share the ride. Lets Drivve!",
#             "avg_rating": avg_rating,
#             "total_ratings": total_ratings_count,
#             "created_at": user.created_at.isoformat() if user.created_at else None,
#             "vehicle": vehicle_data,
#             "travel_preferences": travel_preferences,
#             "stats": {
#                 "posted_rides": completed_rides_as_driver,
#                 "cancelled_rides": cancelled_rides,
#                 "on_time_rate": on_time_rate,
#                 "response_rate": response_rate
#             },
#             "reviews": reviews_data,
#             "profile_completed": user.profile_completed,
#         }
        
#         return {
#             "success": True,
#             "user": profile_data
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"❌ Error in get_public_profile: {str(e)}")
#         raise HTTPException(500, f"Failed to fetch profile: {str(e)}")

import base64
from datetime import datetime, timedelta, timezone

import os
import random
import string
from typing import Dict, Optional
import uuid

from pydantic import BaseModel, EmailStr
from models import User, UserStatus, Vehicle, MatchingPreferenceUser, Ride, RideFeedback
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter
from dotenv import load_dotenv
load_dotenv()
from utils.jwt_helper import (
    create_access_token,
    create_refresh_token
)
from user_id_generator import generate_user_id

# Azure Communication Services Email imports
from azure.communication.email import EmailClient

# Azure Blob Storage imports
from azure.storage.blob import BlobServiceClient, ContentSettings
from azure.core.exceptions import AzureError

router = APIRouter()

# Azure Email Configuration
AZURE_EMAIL_CONNECTION_STRING = os.getenv("AZURE_EMAIL_CONNECTION_STRING")
AZURE_EMAIL_FROM = "DoNotReply@drivve.in"  # Fixed sender address as required

# Initialize Azure Email Client
try:
    email_client = EmailClient.from_connection_string(AZURE_EMAIL_CONNECTION_STRING)
except Exception as e:
    print(f"Failed to initialize Azure Email Client: {str(e)}")
    email_client = None

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


# ================= AZURE BLOB STORAGE UPLOAD =================

def upload_to_azure(file_bytes, file_path, content_type="image/jpeg"):
    """
    Upload a file to Azure Blob Storage
    
    Args:
        file_bytes: Bytes of the file to upload
        file_path: Path within the container (e.g., "profile/123.jpg")
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


# ================= EMAIL OTP WITH AZURE =================

class EmailOTPRequest(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None  # User's first name for personalization

class EmailOTPVerify(BaseModel):
    email: EmailStr
    otp: str

email_otp_store: Dict[str, Dict] = {}


def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def get_otp_email_html(first_name: str, otp: str, expiry_minutes: int = 2) -> str:

    return f"""
    <html>
        <body style="
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        ">

            <div style="
                max-width: 600px;
                margin: 0 auto;
                background: white;
                padding: 30px;
            ">

                <!-- Email Content -->

                <p style="
                    font-size: 15px;
                    color: #333;
                    margin-bottom: 20px;
                ">
                    Hey {first_name or 'there'},
                </p>

                <p style="
                    font-size: 15px;
                    color: #333;
                    margin-bottom: 20px;
                ">
                    Your verification code is
                    <strong style="
                        font-size: 24px;
                        letter-spacing: 3px;
                    ">
                        {otp}
                    </strong>.
                </p>

                <p style="
                    font-size: 15px;
                    color: #333;
                    margin-bottom: 20px;
                ">
                    This OTP is valid for
                    <strong>{expiry_minutes} minutes</strong>.
                    Do not share this code with anyone.
                </p>

                <p style="
                    font-size: 15px;
                    color: #333;
                    margin-bottom: 25px;
                ">
                    If you did not request this code,
                    please ignore this email or contact us at
                    <a href="mailto:support@drivve.in">
                        support@drivve.in
                    </a>.
                </p>

                <p style="
                    font-size: 15px;
                    color: #333;
                    margin-top: 30px;
                    margin-bottom: 40px;
                ">
                    Best regards,<br>
                    <strong>Team Drivve</strong>
                </p>

                <!-- Logo at Bottom -->

                <div style="
                    text-align: center;
                    border-top: 1px solid #e5e5e5;
                    padding-top: 20px;
                    margin-top: 20px;
                ">

                    <img
                        src="https://drivvestorage.blob.core.windows.net/drivvestorage/adaptive-icon.png"
                        alt="Drivve Logo"
                        style="
                            max-height: 60px;
                            opacity: 0.9;
                        "
                    />

                </div>

            </div>

        </body>
    </html>
    """


def send_email_via_azure(to_email: str, subject: str, html_content: str) -> bool:
    """
    Send email using Azure Communication Services
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content of the email
    
    Returns:
        True if successful, False otherwise
    """
    if not email_client:
        print("Azure Email client not initialized")
        return False
    
    try:
        message = {
            "senderAddress": AZURE_EMAIL_FROM,
            "recipients": {
                "to": [{"address": to_email}]
            },
            "content": {
                "subject": subject,
                "html": html_content
            }
        }
        
        poller = email_client.begin_send(message)
        result = poller.result()
        print(f"Email sent successfully.")
        return True
        
    except Exception as ex:
        import traceback

        print("========== AZURE EMAIL ERROR ==========")
        print(str(ex))
        traceback.print_exc()
        print("======================================")

        return False


@router.post("/auth/send-email-otp")
async def send_email_otp(request: EmailOTPRequest):
    """
    Send OTP to user's email using Azure Communication Services
    """
    try:
        # Generate OTP
        otp = generate_otp()
        
        # OTP expires in 2 minutes (as per requirement)
        expiry_minutes = 2
        
        # Store OTP in memory
        email_otp_store[request.email] = {
            "otp": otp,
            "expires": datetime.utcnow() + timedelta(minutes=expiry_minutes)
        }
        
        # Generate email HTML with exact format
        html_content = get_otp_email_html(
            first_name=request.first_name,
            otp=otp,
            expiry_minutes=expiry_minutes
        )
        
        # Send email via Azure
        success = send_email_via_azure(
            to_email=request.email,
            subject="Your Drivve One-Time Password (OTP)",
            html_content=html_content
        )
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to send OTP email. Please try again."
            )
        
        return {
            "success": True,
            "message": "OTP sent successfully to your email"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in send_email_otp: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send OTP: {str(e)}"
        )


@router.post("/auth/verify-email-otp")
async def verify_email_otp(request: EmailOTPVerify):
    """
    Verify the OTP sent to user's email
    """
    data = email_otp_store.get(request.email)

    if not data:
        raise HTTPException(
            status_code=400,
            detail="OTP not found or already used"
        )

    if datetime.utcnow() > data["expires"]:
        del email_otp_store[request.email]
        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )

    if data["otp"] != request.otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    # Clear OTP after successful verification
    del email_otp_store[request.email]

    return {
        "success": True,
        "message": "Email verified successfully"
    }


# ================= CREATE PROFILE =================

@router.post("/api/v1/users/create")
async def create_user_profile(profile_data: dict, db: Session = Depends(get_db)):
    try:
        phone_number = profile_data.get("phone_number")
        first_name = profile_data.get("first_name")
        last_name = profile_data.get("last_name")

        if not phone_number or not first_name:
            raise HTTPException(400, "Phone number and first name required")

        user = db.query(User).filter(
            User.phone_number == phone_number
        ).first()

        if not user:
            user = User(
                phone_number=phone_number,
                country_code=profile_data.get("country_code", "+91"),
                is_phone_verified=True,
                status=UserStatus.PENDING,
                profile_completed=False
            )
            db.add(user)

        # ================= IMAGE / AVATAR =================

        avatar_name = profile_data.get("avatar")
        base64_image = profile_data.get("profile_image")

        # 🔥 PRIORITY: IMAGE > AVATAR
        if base64_image:
            try:
                if "base64," in base64_image:
                    base64_image = base64_image.split("base64,")[1]

                missing_padding = len(base64_image) % 4
                if missing_padding:
                    base64_image += "=" * (4 - missing_padding)

                image_bytes = base64.b64decode(base64_image)

                filename = f"{uuid.uuid4()}.jpg"
                file_path = f"profile/{filename}"

                # Upload to Azure
                image_url = upload_to_azure(image_bytes, file_path, "image/jpeg")
                user.profile_picture = image_url

            except Exception as e:
                raise HTTPException(500, f"Image upload failed: {str(e)}")

        elif avatar_name:
            # Use pre-existing avatar from Azure
            user.profile_picture = (
                f"{AZURE_STORAGE_URL}/{AZURE_CONTAINER_NAME}/avatars/{avatar_name}"
            )
        else:
            user.profile_picture = None

        # ================= OTHER FIELDS =================

        user.user_id = generate_user_id(first_name, last_name, phone_number)
        user.first_name = first_name
        user.last_name = last_name
        user.full_name = f"{first_name} {last_name or ''}".strip()
        user.email = profile_data.get("email")
        user.email_verified = profile_data.get("email_verified", False)

        dob = profile_data.get("date_of_birth")
        if dob:
            user.date_of_birth = datetime.strptime(dob, "%Y-%m-%d").date()

        user.gender = profile_data.get("gender")
        user.state = profile_data.get("state")
        user.city = profile_data.get("city")
        user.referral_code = profile_data.get("referral_code")

        user.profile_completed = True
        user.status = UserStatus.ACTIVE
        user.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(user)
        
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        
        return {
            "success": True,
            "message": "Profile created successfully ✅",
            "user_id": user.user_id,
            "profile_picture": user.profile_picture,
            "accessToken": access_token,
            "refreshToken": refresh_token,
            "user": {
                "id": user.id,
                "user_id": user.user_id,
                "phone_number": user.phone_number,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
            }
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))
    
    
# ================= ADMIN - GET ALL USERS =================

@router.get("/api/v1/admin/users/list")
async def get_all_users(db: Session = Depends(get_db)):
    """Get all users for admin filter dropdown"""
    try:
        users = db.query(User).filter(
            User.status == UserStatus.ACTIVE,
            User.profile_completed == True
        ).all()
        
        users_data = []
        for user in users:
            users_data.append({
                "user_id": user.user_id,
                "name": user.full_name or f"{user.first_name} {user.last_name or ''}".strip(),
                "phone": user.phone_number,
                "email": user.email or ""
            })
        
        return {
            "success": True,
            "users": users_data
        }
    except Exception as e:
        print(f"❌ Error in get_all_users: {str(e)}")
        raise HTTPException(500, str(e))
    
    
@router.get("/api/v1/users/profile-public")
async def get_public_profile(
    phone_number: Optional[str] = None,
    user_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get public profile information for a user
    """
    try:
        # Find the user
        user = None
        if user_id:
            user = db.query(User).filter(User.user_id == user_id).first()
        elif phone_number:
            user = db.query(User).filter(User.phone_number == phone_number).first()
        else:
            raise HTTPException(400, "Either phone_number or user_id is required")
        
        if not user:
            raise HTTPException(404, "User not found")
        
        # 1. Get vehicle info
        vehicle = db.query(Vehicle).filter(
            Vehicle.phone_number == user.phone_number
        ).order_by(Vehicle.created_at.desc()).first()
        
        vehicle_data = None
        if vehicle:
            photos = []
            if vehicle.notes and vehicle.notes.startswith('{"photos":'):
                try:
                    import json
                    photos_data = json.loads(vehicle.notes)
                    photos = photos_data.get('photos', [])
                except:
                    photos = [vehicle.photo_url] if vehicle.photo_url else []
            else:
                photos = [vehicle.photo_url] if vehicle.photo_url else []
            
            vehicle_data = {
                "id": vehicle.id,
                "vehicle_type": vehicle.vehicle_type,
                "body_type": vehicle.body_type,
                "fuel_type": vehicle.fuel_type,
                "make": vehicle.make,
                "model": vehicle.model,
                "year": vehicle.year,
                "registration_number": vehicle.registration_number,
                "color": vehicle.color,
                "max_seats": vehicle.max_seats,
                "photo_url": vehicle.photo_url,
                "photos": photos,
                "type": vehicle.vehicle_type
            }
        
        # 2. Get travel preferences
        preferences = db.query(MatchingPreferenceUser).filter(
            MatchingPreferenceUser.phone_number == user.phone_number
        ).all()
        
        # Initialize default travel preferences
        travel_preferences = {
            "music": True,
            "ac": True,
            "pets": False,
            "smoking": False
        }
        
        # Override with actual user preferences
        for pref in preferences:
            key = pref.preference_key
            value = pref.value
            
            if isinstance(value, dict):
                travel_preferences[key] = value.get('value', travel_preferences.get(key, False))
            elif isinstance(value, list) and len(value) > 0:
                if isinstance(value[0], dict):
                    travel_preferences[key] = value[0].get('value', travel_preferences.get(key, False))
                else:
                    travel_preferences[key] = value[0] if value[0] is not None else travel_preferences.get(key, False)
            elif isinstance(value, bool):
                travel_preferences[key] = value
            else:
                travel_preferences[key] = bool(value) if value is not None else travel_preferences.get(key, False)
        
        # 3. Calculate statistics
        completed_rides_as_driver = db.query(Ride).filter(
            Ride.phone_number == user.phone_number,
            Ride.status == "completed"
        ).count()
        
        cancelled_rides = db.query(Ride).filter(
            Ride.phone_number == user.phone_number,
            Ride.status == "cancelled"
        ).count()
        
        on_time_rate = 98
        response_rate = 95
        
        # 4. Get reviews
        reviews_data = []
        total_rating_sum = 0
        total_ratings_count = 0
        
        feedback_received = db.query(RideFeedback).filter(
            RideFeedback.feedback_for_user_id == user.id,
            RideFeedback.rating.isnot(None)
        ).order_by(RideFeedback.created_at.desc()).limit(10).all()
        
        for feedback in feedback_received:
            reviewer = db.query(User).filter(User.id == feedback.feedback_by_user_id).first()
            
            total_rating_sum += feedback.rating
            total_ratings_count += 1
            
            reviews_data.append({
                "rating": feedback.rating,
                "comment": feedback.comment,
                "reviewer_name": reviewer.full_name if reviewer else "Anonymous",
                "reviewer_photo": reviewer.profile_picture if reviewer else None,
                "date": feedback.created_at.isoformat() if feedback.created_at else None,
                "route": None
            })
        
        avg_rating = total_rating_sum / total_ratings_count if total_ratings_count > 0 else 5.0
        
        # 5. Prepare profile response
        profile_data = {
            "user_id": user.user_id,
            "phone_number": user.phone_number,
            "full_name": user.full_name,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "profile_picture": user.profile_picture,
            "email": user.email,
            "bio": user.bio or "I am happy to share the ride. Lets Drivve!",
            "about": user.bio or "I am happy to share the ride. Lets Drivve!",
            "avg_rating": avg_rating,
            "total_ratings": total_ratings_count,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "vehicle": vehicle_data,
            "travel_preferences": travel_preferences,
            "stats": {
                "posted_rides": completed_rides_as_driver,
                "cancelled_rides": cancelled_rides,
                "on_time_rate": on_time_rate,
                "response_rate": response_rate
            },
            "reviews": reviews_data,
            "profile_completed": user.profile_completed,
        }
        
        return {
            "success": True,
            "user": profile_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in get_public_profile: {str(e)}")
        raise HTTPException(500, f"Failed to fetch profile: {str(e)}")