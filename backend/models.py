from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Enum, Date, JSON
from sqlalchemy.sql import func
from database import Base
import enum

class UserType(enum.Enum):
    DRIVER = "driver"
    PASSENGER = "passenger"
    BOTH = "both"

class UserStatus(enum.Enum):
    PENDING = "pending"          # Phone verified, profile incomplete
    ACTIVE = "active"            # Profile completed
    SUSPENDED = "suspended"      # Account suspended

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # NEW: Custom User ID (D-AJ8600 format)
    user_id = Column(String(10), unique=True, index=True, nullable=True)  # Will be generated
    
    # Phone verification
    phone_number = Column(String(20), unique=True, index=True, nullable=False)
    country_code = Column(String(10), nullable=False, default="+91")
    is_phone_verified = Column(Boolean, default=False)
    
    # Profile information (from Create Profile screen)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    full_name = Column(String(200), nullable=True)  # Computed field
    email = Column(String(255), nullable=True)
    email_verified = Column(Boolean, default=False)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(50), nullable=True)
    
    # Location
    state = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    
    # Profile image and avatar
    profile_picture = Column(String(500), nullable=True)  # URL or path
    avatar = Column(JSON, nullable=True)  # Avatar data as JSON
    
    # Additional info
    referral_code = Column(String(20), nullable=True)
    
    # User status and type
    user_type = Column(Enum(UserType), nullable=True)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING)
    profile_completed = Column(Boolean, default=False)
    
    # Driver specific info (if user_type includes DRIVER)
    has_vehicle = Column(Boolean, default=False)
    vehicle_type = Column(String(50), nullable=True)
    vehicle_number = Column(String(20), nullable=True)
    license_number = Column(String(50), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class OTPVerification(Base):
    __tablename__ = "otp_verifications"
    
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), nullable=False)
    otp_code = Column(String(6), nullable=False)
    is_verified = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class EmailOTP(Base):
    __tablename__ = "email_otps"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    otp = Column(String(6), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Ride(Base):
    __tablename__ = "rides"
    
    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, nullable=False)
    origin = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    departure_time = Column(DateTime(timezone=True), nullable=False)
    available_seats = Column(Integer, nullable=False)
    price_per_seat = Column(Integer, nullable=False)
    vehicle_type = Column(String(50), nullable=False)
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class RideBooking(Base):
    __tablename__ = "ride_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    ride_id = Column(Integer, nullable=False)
    passenger_id = Column(Integer, nullable=False)
    seats_booked = Column(Integer, nullable=False)
    total_amount = Column(Integer, nullable=False)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
