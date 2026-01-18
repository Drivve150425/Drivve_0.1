from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Enum, Date, JSON,Float
from sqlalchemy.sql import func
from database import Base
import enum
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey


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
    # About / Bio
    bio = Column(String(500), nullable=True)


class OTPVerification(Base):
    __tablename__ = "otp_verifications"
    
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), nullable=False)
    otp_code = Column(String(6), nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

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
    phone_number = Column(String(20), index=True)  # ✅ ADD THIS

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ShareActivity(Base):
    __tablename__ = "share_activity"

    id = Column(Integer, primary_key=True, index=True)

    phone_number = Column(String(20), index=True, nullable=False)
    referral_code = Column(String(50), nullable=False)

    share_count = Column(Integer, default=1)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

class SavedAddress(Base):
    __tablename__ = "saved_addresses"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), index=True, nullable=False)

    label = Column(String(50))
    type = Column(String(20))
    full_address = Column(String(255))

    house = Column(String(100))
    area = Column(String(100))
    instructions = Column(String(255))

    is_default = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, index=True)

    vehicle_type = Column(String)     # Car / Bike
    body_type = Column(String)        # SUV, Sedan
    fuel_type = Column(String)        # Petrol, Diesel

    make = Column(String, index=True)
    model = Column(String, index=True)

    year = Column(Integer)
    registration_number = Column(String, unique=True)
    color = Column(String)
    max_seats = Column(Integer)

    notes = Column(Text)
    photo_url = Column(String, nullable=True)  # ✅ NEW
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True)

    phone_number = Column(String(20), index=True, nullable=False)
    contact_name = Column(String(100), nullable=False)
    contact_number = Column(String(20), nullable=False)

    is_system = Column(Boolean, default=False)
    share_live_location = Column(Boolean, default=False)

    is_active = Column(Boolean, default=True)     # ✅ NEW
    is_deleted = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Promotion(Base):
    __tablename__ = "promotions"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(100), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text)
    promo_code = Column(String(50))
    image_url = Column(String(500))

    valid_from = Column(Date)
    valid_till = Column(Date)

    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    redemptions = relationship(
        "PromotionRedemption",
        back_populates="promotion",
        cascade="all, delete"
    )


class PromotionRedemption(Base):
    __tablename__ = "promotion_redemptions"

    id = Column(Integer, primary_key=True, index=True)

    promotion_id = Column(
        Integer,
        ForeignKey("promotions.id", ondelete="CASCADE"),
        nullable=False
    )

    phone_number = Column(String(20), nullable=False)
    redeemed_at = Column(DateTime, server_default=func.now())

    promotion = relationship(
        "Promotion",
        back_populates="redemptions"
    )


class DCoinRedemption(Base):
    __tablename__ = "dcoin_redemptions"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), index=True, nullable=False)
    redeem_code = Column(String(12), unique=True, nullable=True)
    coins = Column(Integer, nullable=False)
    rupees = Column(Float, nullable=False)
    type = Column(String(10))  # CREDIT / DEBIT
    reason = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class RideRewardMaster(Base):
    __tablename__ = "ride_rewards_master"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(100), nullable=False)
    rides_required = Column(Integer, nullable=False)
    reward_points = Column(Integer, nullable=False)

    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )



class RideReward(Base):
    __tablename__ = "ride_rewards"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), index=True, nullable=False)
    reward_id = Column(Integer, nullable=False)
    coins = Column(Integer, nullable=False)
    credited_at = Column(DateTime(timezone=True), server_default=func.now())
class FAQ(Base):
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False)
    question = Column(String(255), nullable=False)
    answer = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

class AboutUs(Base):
    __tablename__ = "about_us"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from database import Base

# ================== MASTER TABLE ==================
class MatchingPreferenceMaster(Base):
    __tablename__ = "matching_preference_master"

    id = Column(Integer, primary_key=True, index=True)

    key = Column(String(50), unique=True, nullable=False)
    label = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)

    input_type = Column(String(20), nullable=False)
    # toggle | single_select | multi_select

    options = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )


# ================== USER TABLE ==================
class MatchingPreferenceUser(Base):
    __tablename__ = "matching_preference_user"

    id = Column(Integer, primary_key=True, index=True)

    phone_number = Column(String(20), index=True, nullable=False)
    preference_key = Column(String(50), nullable=False)

    value = Column(JSON, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
# Add to models.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Enum, Date, JSON, ForeignKey
from sqlalchemy.sql import func
from database import Base
import enum

# In models.py - Update DocumentType enum
class DocumentType(enum.Enum):
    AADHAR = "aadhar"  # Changed from "AADHAR" to "aadhar"
    DL = "dl"  # Driving License
    RC = "rc"  # Registration Certificate
    PAN = "pan"
    PASSPORT = "passport"
    
    # You can keep both uppercase and lowercase support
    @classmethod
    def get(cls, value):
        """Get enum value from string, case-insensitive"""
        value_lower = value.lower()
        for member in cls:
            if member.value.lower() == value_lower:
                return member
        raise ValueError(f"Invalid document type: {value}")

class DocumentStatus(enum.Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"

class DocumentVerification(Base):
    __tablename__ = "document_verifications"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # User Information
    phone_number = Column(String(20), index=True, nullable=False)
    user_id = Column(String(20), index=True, nullable=True)  # From users table
    
    # Document Details
    document_type = Column(Enum(DocumentType), nullable=False)
    document_number = Column(String(50), nullable=False, unique=True)
    document_name = Column(String(100), nullable=False)  # e.g., "John Doe"
    
    # Document Specific Fields (JSON storage for flexibility)
    document_data = Column(JSON, nullable=True)  # Stores type-specific fields
    
    # Image Paths
    front_image_path = Column(String(500), nullable=False)
    back_image_path = Column(String(500), nullable=True)  # Some docs don't have back
    selfie_image_path = Column(String(500), nullable=False)
    
    # Verification Status
    status = Column(Enum(DocumentStatus), default=DocumentStatus.PENDING)
    verified_by = Column(String(100), nullable=True)  # Admin who verified
    verified_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Expiry Information
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    is_expired = Column(Boolean, default=False)
    
    # Timestamps
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superadmin = Column(Boolean, default=False)
    permissions = Column(JSON, default=list)  # List of permissions
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

class VerificationLog(Base):
    __tablename__ = "verification_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey('document_verifications.id'), nullable=False)
    admin_id = Column(Integer, ForeignKey('admin_users.id'), nullable=False)  # ❌
    action = Column(String(50), nullable=False)  # approve, reject, request_changes
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
class UserSettings(Base):
    __tablename__ = "user_account_settings"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), unique=True, index=True, nullable=False)

    # Privacy
    contact_visibility = Column(Boolean, default=True)

    # Notifications
    ride_updates = Column(Boolean, default=True)
    chat_messages = Column(Boolean, default=True)
    promotions = Column(Boolean, default=False)
    newsletters = Column(Boolean, default=False)
    sms_alerts = Column(Boolean, default=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
class BlockedUser(Base):
    __tablename__ = "blocked_account_users"

    id = Column(Integer, primary_key=True, index=True)
    owner_phone = Column(String(20), index=True, nullable=False)
    blocked_phone = Column(String(20), nullable=False)
    blocked_name = Column(String(100))

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
class UserDevice(Base):
    __tablename__ = "user_account_devices"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), index=True, nullable=False)

    device_name = Column(String(100))
    device_type = Column(String(20))
    is_current = Column(Boolean, default=False)

    last_active = Column(DateTime(timezone=True))   # ✅
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # ✅

class AccountDeactivation(Base):
    __tablename__ = "account_deactivations"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), index=True, nullable=False)

    reason = Column(Text, nullable=True)

    is_deactivated = Column(Boolean, default=True)   # active deactivation
    reactivated_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FeedbackType(enum.Enum):
    APP = "app"
    RIDE = "ride"
    DRIVER = "driver"
    PASSENGER = "passenger"


class UserFeedback(Base):
    __tablename__ = "user_feedback"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), index=True)
    rating = Column(Integer)  # 1–5
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    
class RideFeedback(Base):
    __tablename__ = "ride_feedback"

    id = Column(Integer, primary_key=True, index=True)

    ride_booking_id = Column(Integer, index=True, nullable=False)
    phone_number = Column(String(20), index=True, nullable=False)

    rating = Column(Integer, nullable=False)   # 1–5
    reason = Column(String(100), nullable=True)
    comment = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    
class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)

    module = Column(String(100), nullable=False)
    # FAQ | ABOUT_US | MATCHING_PREFERENCE | etc.

    action = Column(String(50), nullable=False)
    # CREATE | UPDATE | DELETE | ACTIVATE | DEACTIVATE

    entity_id = Column(Integer, nullable=True)
    entity_name = Column(String(150), nullable=True)

    description = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    active = Column(Boolean, default=True)

    cities = relationship(
        "City",
        back_populates="state",
        cascade="all, delete"
    )


class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    active = Column(Boolean, default=True)

    state_id = Column(Integer, ForeignKey("states.id", ondelete="CASCADE"))
    state = relationship("State", back_populates="cities")
