# from datetime import datetime, timezone
# from sqlalchemy import BigInteger, Column, Integer, String, DateTime, Boolean, Text, Enum, Date, JSON,Float, UniqueConstraint
# from sqlalchemy.sql import func
# from database import Base
# import enum
# from sqlalchemy.orm import relationship
# from sqlalchemy import ForeignKey


# class UserType(enum.Enum):
#     DRIVER = "driver"
#     PASSENGER = "passenger"
#     BOTH = "both"

# class UserStatus(enum.Enum):
#     PENDING = "pending"          # Phone verified, profile incomplete
#     ACTIVE = "active"            # Profile completed
#     SUSPENDED = "suspended"      # Account suspended

# class OTPVerification(Base):
#     __tablename__ = "otp_verifications"
    
#     id = Column(Integer, primary_key=True, index=True)
#     phone_number = Column(String(20), nullable=False)
#     otp_code = Column(String(6), nullable=False)
#     is_verified = Column(Boolean, default=False, nullable=False)

#     expires_at = Column(DateTime(timezone=True), nullable=False)
#     created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

# class EmailOTP(Base):
#     __tablename__ = "email_otps"
    
#     id = Column(Integer, primary_key=True, index=True)
#     email = Column(String(255), nullable=False, index=True)
#     otp = Column(String(6), nullable=False)
#     expires_at = Column(DateTime(timezone=True), nullable=False)
#     verified = Column(Boolean, default=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
# class Ride(Base):
#     __tablename__ = "rides"

#     id = Column(Integer, primary_key=True, index=True)

#     # Driver
#     phone_number = Column(String(20), index=True, nullable=False)
#     user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

#     # Route Info
#     origin = Column(String(255), nullable=False)
#     destination = Column(String(255), nullable=False)

#     origin_lat = Column(Float, nullable=True)
#     origin_lon = Column(Float, nullable=True)

#     destination_lat = Column(Float, nullable=True)
#     destination_lon = Column(Float, nullable=True)

#     route_coordinates = Column(JSON, nullable=True)


#     departure_time = Column(DateTime(timezone=True), nullable=False)
#       # ✅ NEW: Expected end time for overlap checking
#     expected_end_time = Column(DateTime(timezone=True), nullable=True)
    
#     # ✅ NEW: Duration in minutes for overlap checking
#     duration_minutes = Column(Integer, default=60, nullable=True)

#     # Route summary
#     distance_km = Column(Float, nullable=True)
#     duration_text = Column(String(100), nullable=True)

#     total_estimated_price = Column(Float, nullable=True)

#     # Seats & pricing
#     available_seats = Column(Integer, nullable=False)
#     price_per_seat = Column(Float, nullable=False)

#     # Preferences (Step3)
#     preferences = Column(JSON, nullable=True)

#     # Vehicle
#     vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
#         # ✅ NEW: Women only ride filter
#     women_only = Column(Boolean, default=False, nullable=True)

#     status = Column(String(20), default="active")
#     is_deleted = Column(Boolean, default=False)

#     created_at = Column(DateTime(timezone=True), server_default=func.now())

#     # Relationships
#     bookings = relationship("RideBooking", back_populates="ride")
#     # ADD THIS FIELD
#     started_at = Column(DateTime(timezone=True), nullable=True)
    
#     # In Ride class
#     cancellation_reason = Column(String(255), nullable=True)
#     modification_requests = relationship("ModificationRequest", back_populates="ride", cascade="all, delete-orphan")
# class RideBooking(Base):
#     __tablename__ = "ride_bookings"

#     id = Column(Integer, primary_key=True, index=True)

#     ride_id = Column(Integer, ForeignKey("rides.id"), nullable=False)
#     passenger_phone = Column(String(20), index=True, nullable=False)
#     passenger_id = Column(Integer, ForeignKey("users.id"), nullable=True)

#     seats_booked = Column(Integer, nullable=False)
#     total_amount = Column(Float, nullable=False)

#     # Rider original pickup / drop coordinates
#     pickup_lat = Column(Float, nullable=True)
#     pickup_lon = Column(Float, nullable=True)
#     drop_lat = Column(Float, nullable=True)
#     drop_lon = Column(Float, nullable=True)

#     # Intersection points on driver's route
#     intersection_pickup_lat = Column(Float, nullable=True)
#     intersection_pickup_lon = Column(Float, nullable=True)
#     intersection_drop_lat = Column(Float, nullable=True)
#     intersection_drop_lon = Column(Float, nullable=True)

#     # Walk distances in meters
#     pickup_walk_distance_m = Column(Integer, nullable=True)
#     drop_walk_distance_m = Column(Integer, nullable=True)

#     status = Column(String(20), default="pending")
#     # pending | accepted | rejected | cancelled | completed

#     created_at = Column(DateTime(timezone=True), server_default=func.now())

#     ride = relationship("Ride", back_populates="bookings")
#     cancellation_reason = Column(String(255), nullable=True)
#     modification_requests = relationship("ModificationRequest", back_populates="booking", cascade="all, delete-orphan")
# class ShareActivity(Base):
#     __tablename__ = "share_activity"

#     id = Column(Integer, primary_key=True, index=True)

#     phone_number = Column(String(20), index=True, nullable=False)
#     referral_code = Column(String(50), nullable=False)

#     share_count = Column(Integer, default=1)

#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(
#         DateTime(timezone=True),
#         server_default=func.now(),
#         onupdate=func.now()
#     )

# class SavedAddress(Base):
#     __tablename__ = "saved_addresses"

#     id = Column(Integer, primary_key=True, index=True)
#     phone_number = Column(String(20), index=True, nullable=False)

#     label = Column(String(50))
#     type = Column(String(20))
#     full_address = Column(String(255))

#     house = Column(String(100))
#     area = Column(String(100))
#     instructions = Column(String(255))

#     is_default = Column(Boolean, default=False)

#     created_at = Column(DateTime, server_default=func.now())
#     updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

# class Vehicle(Base):
#     __tablename__ = "vehicles"

#     id = Column(Integer, primary_key=True, index=True)
#     phone_number = Column(String, index=True)

#     vehicle_type = Column(String)     # Car / Bike
#     body_type = Column(String)        # SUV, Sedan
#     fuel_type = Column(String)        # Petrol, Diesel

#     make = Column(String, index=True)
#     model = Column(String, index=True)

#     year = Column(Integer)
#     registration_number = Column(String, unique=True)
#     color = Column(String)
#     max_seats = Column(Integer)

#     notes = Column(Text)
#     photo_url = Column(String, nullable=True)  # ✅ NEW
#     created_at = Column(DateTime, server_default=func.now())
#     updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
# class EmergencyContact(Base):
#     __tablename__ = "emergency_contacts"

#     id = Column(Integer, primary_key=True, index=True)

#     phone_number = Column(String(20), index=True, nullable=False)
#     contact_name = Column(String(100), nullable=False)
#     contact_number = Column(String(20), nullable=False)

#     is_system = Column(Boolean, default=False)
#     share_live_location = Column(Boolean, default=False)

#     is_active = Column(Boolean, default=True)     # ✅ NEW
#     is_deleted = Column(Boolean, default=False)

#     created_at = Column(DateTime, server_default=func.now())
#     updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

# class Promotion(Base):
#     __tablename__ = "promotions"

#     id = Column(Integer, primary_key=True, index=True)
#     company_name = Column(String(100), nullable=False)
#     title = Column(String(150), nullable=False)
#     description = Column(Text)
#     promo_code = Column(String(50))
#     image_url = Column(String(500))

#     valid_from = Column(Date)
#     valid_till = Column(Date)

#     is_active = Column(Boolean, default=True)
#     is_deleted = Column(Boolean, default=False)

#     created_at = Column(DateTime, server_default=func.now())
#     updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

#     redemptions = relationship(
#         "PromotionRedemption",
#         back_populates="promotion",
#         cascade="all, delete"
#     )


# class PromotionRedemption(Base):
#     __tablename__ = "promotion_redemptions"

#     id = Column(Integer, primary_key=True, index=True)

#     promotion_id = Column(
#         Integer,
#         ForeignKey("promotions.id", ondelete="CASCADE"),
#         nullable=False
#     )

#     phone_number = Column(String(20), nullable=False)
#     redeemed_at = Column(DateTime, server_default=func.now())

#     promotion = relationship(
#         "Promotion",
#         back_populates="redemptions"
#     )


# class DCoinRedemption(Base):
#     __tablename__ = "dcoin_redemptions"

#     id = Column(Integer, primary_key=True, index=True)
#     phone_number = Column(String(20), index=True, nullable=False)
#     redeem_code = Column(String(12), unique=True, nullable=True)
#     coins = Column(Integer, nullable=False)
#     rupees = Column(Float, nullable=False)
#     type = Column(String(10))  # CREDIT / DEBIT
#     reason = Column(String(100))
#     created_at = Column(DateTime(timezone=True), server_default=func.now())

# class RideRewardMaster(Base):
#     __tablename__ = "ride_rewards_master"

#     id = Column(Integer, primary_key=True, index=True)

#     title = Column(String(100), nullable=False)
#     rides_required = Column(Integer, nullable=False)
#     reward_points = Column(Integer, nullable=False)

#     is_active = Column(Boolean, default=True)
#     is_deleted = Column(Boolean, default=False)

#     created_at = Column(DateTime, server_default=func.now())
#     updated_at = Column(
#         DateTime(timezone=True),
#         server_default=func.now(),
#         onupdate=func.now()
#     )



# class RideReward(Base):
#     __tablename__ = "ride_rewards"

#     id = Column(Integer, primary_key=True, index=True)
#     phone_number = Column(String(20), index=True, nullable=False)
#     reward_id = Column(Integer, nullable=False)
#     coins = Column(Integer, nullable=False)
#     credited_at = Column(DateTime(timezone=True), server_default=func.now())
# class FAQ(Base):
#     __tablename__ = "faqs"

#     id = Column(Integer, primary_key=True, index=True,autoincrement=True)
#     category = Column(String(50), nullable=False)
#     question = Column(String(255), nullable=False)
#     answer = Column(Text, nullable=False)
#     is_active = Column(Boolean, default=True)
#     is_deleted = Column(Boolean, default=False)
#     created_at = Column(
#         DateTime(timezone=True),
#         server_default=func.now()
#     )

#     updated_at = Column(
#         DateTime(timezone=True),
#         server_default=func.now(),
#         onupdate=func.now()
#     )

# class AboutUs(Base):
#     __tablename__ = "about_us"

#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String(150), nullable=False)
#     content = Column(Text, nullable=False)
#     is_active = Column(Boolean, default=True)
#     is_deleted = Column(Boolean, default=False)
#     sort_order = Column(Integer, default=0)

#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# from sqlalchemy import Column, Integer, String, DateTime, JSON
# from sqlalchemy.sql import func
# from database import Base

# # ================== MASTER TABLE ==================
# class MatchingPreferenceMaster(Base):
#     __tablename__ = "matching_preference_master"

#     id = Column(Integer, primary_key=True, index=True)

#     key = Column(String(50), unique=True, nullable=False)
#     label = Column(String(100), nullable=False)
#     category = Column(String(100), nullable=False)

#     input_type = Column(String(20), nullable=False)
#     # toggle | single_select | multi_select

#     options = Column(JSON, nullable=True)
#     is_active = Column(Boolean, default=True)
#     is_deleted = Column(Boolean, default=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(
#         DateTime(timezone=True),
#         server_default=func.now(),
#         onupdate=func.now()
#     )


# # ================== USER TABLE ==================
# class MatchingPreferenceUser(Base):
#     __tablename__ = "matching_preference_user"

#     id = Column(Integer, primary_key=True, index=True)

#     phone_number = Column(String(20), index=True, nullable=False)
#     preference_key = Column(String(50), nullable=False)

#     value = Column(JSON, nullable=False)

#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(
#         DateTime(timezone=True),
#         server_default=func.now(),
#         onupdate=func.now()
#     )
# # Add to models.py
# from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Enum, Date, JSON, ForeignKey
# from sqlalchemy.sql import func
# from database import Base
# import enum

# # In models.py - Update DocumentType enum
# class DocumentType(enum.Enum):
#     AADHAR = "aadhar"  # Changed from "AADHAR" to "aadhar"
#     DL = "dl"  # Driving License
#     RC = "rc"  # Registration Certificate
#     PAN = "pan"
#     PASSPORT = "passport"
    
#     # You can keep both uppercase and lowercase support
#     @classmethod
#     def get(cls, value):
#         """Get enum value from string, case-insensitive"""
#         value_lower = value.lower()
#         for member in cls:
#             if member.value.lower() == value_lower:
#                 return member
#         raise ValueError(f"Invalid document type: {value}")

# class DocumentStatus(enum.Enum):
#     PENDING = "pending"
#     UNDER_REVIEW = "under_review"
#     APPROVED = "approved"
#     REJECTED = "rejected"
#     EXPIRED = "expired"

# class DocumentVerification(Base):
#     __tablename__ = "document_verifications"
    
#     id = Column(Integer, primary_key=True, index=True)
    
#     # User Information
#     phone_number = Column(String(20), index=True, nullable=False)
#     user_id = Column(String(20), index=True, nullable=True)  # From users table
    
#     # Document Details
#     document_type = Column(Enum(DocumentType), nullable=False)
#     document_number = Column(String(50), nullable=False, unique=True)
#     document_name = Column(String(100), nullable=False)  # e.g., "John Doe"
    
#     # Document Specific Fields (JSON storage for flexibility)
#     document_data = Column(JSON, nullable=True)  # Stores type-specific fields
    
#     # Image Paths
#     front_image_path = Column(String(500), nullable=False)
#     back_image_path = Column(String(500), nullable=True)  # Some docs don't have back
#     selfie_image_path = Column(String(500), nullable=False)
    
#     # Verification Status
#     status = Column(Enum(DocumentStatus), default=DocumentStatus.PENDING)
#     verified_by = Column(String(100), nullable=True)  # Admin who verified
#     verified_at = Column(DateTime(timezone=True), nullable=True)
#     rejection_reason = Column(Text, nullable=True)
    
#     # Expiry Information
#     issue_date = Column(Date, nullable=True)
#     expiry_date = Column(Date, nullable=True)
#     is_expired = Column(Boolean, default=False)
#     is_deleted=Column(Boolean, default=False)
    
#     # Timestamps
#     submitted_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())
#     created_at = Column(DateTime(timezone=True), server_default=func.now())

# class AdminUser(Base):
#     __tablename__ = "admin_users"
    
#     id = Column(Integer, primary_key=True, index=True)
#     username = Column(String(100), unique=True, nullable=False)
#     email = Column(String(255), unique=True, nullable=False)
#     full_name = Column(String(200), nullable=False)
#     password_hash = Column(String(255), nullable=False)
#     is_active = Column(Boolean, default=True)
#     is_superadmin = Column(Boolean, default=False)
#     permissions = Column(JSON, default=list)  # List of permissions
    
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     last_login = Column(DateTime(timezone=True), nullable=True)

# class VerificationLog(Base):
#     __tablename__ = "verification_logs"
    
#     id = Column(Integer, primary_key=True, index=True)
#     document_id = Column(Integer, ForeignKey('document_verifications.id'), nullable=False)
#     admin_id = Column(Integer, ForeignKey('admin_users.id'), nullable=False)  # ❌
#     action = Column(String(50), nullable=False)  # approve, reject, request_changes
#     notes = Column(Text, nullable=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
    
# class UserSettings(Base):
#     __tablename__ = "user_account_settings"

#     id = Column(Integer, primary_key=True, index=True)
#     phone_number = Column(String(20), unique=True, index=True, nullable=False)

#     # Privacy
#     contact_visibility = Column(Boolean, default=True)

#     # Notifications
#     ride_updates = Column(Boolean, default=True)
#     chat_messages = Column(Boolean, default=True)
#     promotions = Column(Boolean, default=False)
#     newsletters = Column(Boolean, default=False)
#     sms_alerts = Column(Boolean, default=True)

#     created_at = Column(DateTime, server_default=func.now())
#     updated_at = Column(DateTime, onupdate=func.now())
# class BlockedUser(Base):
#     __tablename__ = "blocked_account_users"

#     id = Column(Integer, primary_key=True, index=True)
#     owner_phone = Column(String(20), index=True, nullable=False)
#     blocked_phone = Column(String(20), nullable=False)
#     blocked_name = Column(String(100))

#     created_at = Column(DateTime, server_default=func.now())
#     updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
# class UserDevice(Base):
#     __tablename__ = "user_account_devices"

#     id = Column(Integer, primary_key=True, index=True)
#     phone_number = Column(String(20), index=True, nullable=False)

#     device_name = Column(String(100))
#     device_type = Column(String(20))
#     is_current = Column(Boolean, default=False)

#     last_active = Column(DateTime(timezone=True))   # ✅
#     created_at = Column(DateTime(timezone=True), server_default=func.now())  # ✅

# class AccountDeactivation(Base):
#     __tablename__ = "account_deactivations"

#     id = Column(Integer, primary_key=True, index=True)
#     phone_number = Column(String(20), index=True, nullable=False)

#     reason = Column(Text, nullable=True)

#     is_deactivated = Column(Boolean, default=True)   # active deactivation
#     reactivated_at = Column(DateTime, nullable=True)

#     created_at = Column(DateTime(timezone=True), server_default=func.now())


# class FeedbackType(enum.Enum):
#     APP = "app"
#     RIDE = "ride"
#     DRIVER = "driver"
#     PASSENGER = "passenger"


# class UserFeedback(Base):
#     __tablename__ = "user_feedback"

#     id = Column(Integer, primary_key=True, index=True)
#     phone_number = Column(String(20), index=True)
#     rating = Column(Integer)  # 1–5
#     reason = Column(Text, nullable=True)
#     created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
# class RideFeedback(Base):
#     __tablename__ = "ride_feedback"

#     id = Column(Integer, primary_key=True)

#     ride_booking_id = Column(
#         Integer,
#         ForeignKey("ride_bookings.id"),
#         nullable=False,
#         index=True
#     )

#     # who gave feedback
#     feedback_by_user_id = Column(
#         Integer,
#         ForeignKey("users.id"),
#         nullable=False,
#         index=True
#     )

#     # who received feedback
#     feedback_for_user_id = Column(
#         Integer,
#         ForeignKey("users.id"),
#         nullable=False,
#         index=True
#     )

#     rating = Column(Integer, nullable=False)
#     reason = Column(String(120))
#     comment = Column(Text)

#     created_at = Column(DateTime(timezone=True), server_default=func.now())

#     # ⭐ relationships
#     feedback_by = relationship("User", foreign_keys=[feedback_by_user_id])
#     feedback_for = relationship("User", foreign_keys=[feedback_for_user_id])

#     __table_args__ = (
#         UniqueConstraint(
#             'ride_booking_id',
#             'feedback_by_user_id',
#             name='unique_feedback_per_user_per_ride'
#         ),
#     )

# class ActivityLog(Base):
#     __tablename__ = "activity_logs"

#     id = Column(Integer, primary_key=True, index=True)

#     module = Column(String(100), nullable=False)
#     # FAQ | ABOUT_US | MATCHING_PREFERENCE | etc.

#     action = Column(String(50), nullable=False)
#     # CREATE | UPDATE | DELETE | ACTIVATE | DEACTIVATE

#     entity_id = Column(Integer, nullable=True)
#     entity_name = Column(String(150), nullable=True)

#     description = Column(Text, nullable=False)

#     created_at = Column(DateTime(timezone=True), server_default=func.now())
# from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
# from sqlalchemy.orm import relationship
# from database import Base

# class State(Base):
#     __tablename__ = "states"

#     id = Column(Integer, primary_key=True)
#     name = Column(String(100), unique=True, nullable=False)
#     active = Column(Boolean, default=True)

#     cities = relationship(
#         "City",
#         back_populates="state",
#         cascade="all, delete"
#     )


# class City(Base):
#     __tablename__ = "cities"

#     id = Column(Integer, primary_key=True)
#     name = Column(String(100), nullable=False)
#     active = Column(Boolean, default=True)

#     state_id = Column(Integer, ForeignKey("states.id", ondelete="CASCADE"))
#     state = relationship("State", back_populates="cities")



# class NotificationType(enum.Enum):
#     RIDE = "ride"
#     REWARD = "reward"
#     PROMOTION = "promotion"
#     DOCUMENT = "document"
#     SYSTEM = "system"


# class UserNotification(Base):
#     __tablename__ = "user_notifications"

#     id = Column(Integer, primary_key=True, index=True)

#     phone_number = Column(String(20), index=True, nullable=False)

#     title = Column(String(150), nullable=False)
#     message = Column(Text, nullable=False)

#     type = Column(Enum(NotificationType), nullable=False)

#     is_read = Column(Boolean, default=False)
#     is_deleted = Column(Boolean, default=False)

#     # Optional deep-link / navigation payload
#     action_type = Column(String(50), nullable=True)
#     action_value = Column(String(100), nullable=True)

#     created_at = Column(DateTime(timezone=True), server_default=func.now())
# class LiveLocation(Base):
#     __tablename__ = "live_locations"

#     id = Column(Integer, primary_key=True, index=True)
#     contact_id = Column(Integer, index=True, nullable=False)

#     lat = Column(Float, nullable=False)
#     lng = Column(Float, nullable=False)

#     updated_at = Column(DateTime, default=datetime.utcnow)


# # ================== CHAT TABLES ==================

# class Conversation(Base):
#     __tablename__ = "conversations"

#     id = Column(Integer, primary_key=True, index=True)
#     participant_1_phone = Column(String(20), index=True, nullable=False)
#     participant_2_phone = Column(String(20), index=True, nullable=False)
#     ride_id = Column(Integer, ForeignKey("rides.id"), nullable=True)

#     last_message = Column(Text, nullable=True)
#     last_message_time = Column(DateTime(timezone=True), nullable=True)
#     last_message_type = Column(String(20), default="text")
#     hidden_for_user_1 = Column(Boolean, default=False)
#     hidden_for_user_2 = Column(Boolean, default=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())


# class ChatMessage(Base):
#     __tablename__ = "chat_messages"

#     id = Column(Integer, primary_key=True, index=True)
#     conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
#     sender_phone = Column(String(20), index=True, nullable=False)

#     text = Column(Text, nullable=False)
#     type = Column(String(20), default="text")   # text | voice
#     file_url = Column(String(500), nullable=True)
#     status = Column(String(20), default="sent") # sent | delivered | seen

#     created_at = Column(DateTime(timezone=True), server_default=func.now())

# class DBList(Base):
#     __tablename__ = "db_list"

#     id = Column(BigInteger, primary_key=True, index=True)
#     vehicle_type = Column(String)

#     body_type = Column(String)
#     sub_category = Column(String)
#     make_company_name = Column(String)
#     model_name = Column(String)

#     claimed_mileage_petrol = Column(String)
#     claimed_mileage_cng = Column(String)
#     claimed_mileage_lpg = Column(String)
#     claimed_mileage_diesel = Column(String)
#     claimed_range_ev = Column(String)
#     claimed_mileage_hybrid = Column(String)

#     actual_mileage_petrol = Column(String)
#     actual_mileage_cng = Column(String)
#     actual_mileage_lpg = Column(String)
#     actual_mileage_diesel = Column(String)
#     actual_range_ev = Column(String)
#     actual_mileage_hybrid = Column(String)

#     fuel_type = Column(String)

#     seating_capacity = Column(String)

#     created_at = Column(DateTime)
# # Add this class to your models.py file

# class BlockedUsers(Base):
#     __tablename__ = "blocked_users"
    
#     id = Column(Integer, primary_key=True, index=True)
#     blocker_phone = Column(String(20), nullable=False, index=True)
#     blocked_phone = Column(String(20), nullable=False, index=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
    
#     # Add unique constraint to prevent duplicate blocks
#     __table_args__ = (
#         UniqueConstraint('blocker_phone', 'blocked_phone', name='unique_block'),
#     )

# # ===== ADD TO models.py =====

# from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Boolean
# from sqlalchemy.orm import relationship
# from datetime import datetime
# from database import Base


# class RideSession(Base):
#     __tablename__ = "ride_sessions"

#     id = Column(Integer, primary_key=True, index=True)
#     ride_id = Column(Integer, ForeignKey("rides.id"), nullable=False, index=True)
#     driver_phone = Column(String, nullable=False, index=True)

#     status = Column(String, default="driver_started")  # driver_started, boarding, en_route, completed, emergency_stopped
#     current_phase = Column(String, default="boarding")  # boarding, en_route, completed

#     current_lat = Column(Float, nullable=True)
#     current_lng = Column(Float, nullable=True)

#     qr_code_token = Column(String, nullable=True)
#     qr_expires_at = Column(DateTime, nullable=True)

#     sos_active = Column(Boolean, default=False)
#     emergency_stop_active = Column(Boolean, default=False)
#     emergency_note = Column(Text, nullable=True)

#     started_at = Column(DateTime, default=datetime.utcnow)
#     completed_at = Column(DateTime, nullable=True)
#     created_at = Column(DateTime, default=datetime.utcnow)

#     ride = relationship("Ride", backref="ride_sessions")
#     riders = relationship("RideSessionRider", back_populates="session", cascade="all, delete-orphan")

# class RideSessionRider(Base):
#     __tablename__ = "ride_session_riders"

#     id = Column(Integer, primary_key=True, index=True)
#     session_id = Column(Integer, ForeignKey("ride_sessions.id"), nullable=False, index=True)
#     booking_id = Column(Integer, ForeignKey("ride_bookings.id"), nullable=False, index=True)

#     rider_phone = Column(String, nullable=False, index=True)
#     rider_name = Column(String, nullable=True)
#     rider_photo = Column(String, nullable=True)

#     pickup_location = Column(String, nullable=True)
#     dropoff_location = Column(String, nullable=True)

#     pickup_lat = Column(Float, nullable=True)
#     pickup_lng = Column(Float, nullable=True)
#     dropoff_lat = Column(Float, nullable=True)
#     dropoff_lng = Column(Float, nullable=True)

#     status = Column(String, default="accepted")
#     reached_pickup_at = Column(DateTime, nullable=True)
#     boarded_at = Column(DateTime, nullable=True)
#     dropped_off_at = Column(DateTime, nullable=True)
#     completed_at = Column(DateTime, nullable=True)

#     # ✅ ADD THESE TWO LINES:
#     pickup_confirmed = Column(Boolean, default=False)
#     dropoff_confirmed = Column(Boolean, default=False)

#     driver_rating = Column(Integer, nullable=True)
#     driver_feedback = Column(Text, nullable=True)

#     rider_rating = Column(Integer, nullable=True)
#     rider_feedback = Column(Text, nullable=True)

#     created_at = Column(DateTime, default=datetime.utcnow)

#     session = relationship("RideSession", back_populates="riders")
# # Add this model to your models.py
# class RideSeatModificationRequest(Base):
#     __tablename__ = "ride_seat_modification_requests"
    
#     id = Column(Integer, primary_key=True, index=True)
#     booking_id = Column(Integer, ForeignKey("ride_bookings.id"), nullable=False)
#     ride_id = Column(Integer, ForeignKey("rides.id"), nullable=False)
#     passenger_phone = Column(String, nullable=False)
#     driver_phone = Column(String, nullable=False)
#     current_seats = Column(Integer, nullable=False)
#     requested_seats = Column(Integer, nullable=False)
#     status = Column(String, default="pending")
#     rejection_reason = Column(String, nullable=True)
#     created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))
#     approved_at = Column(DateTime(timezone=True), nullable=True)
#     rejected_at = Column(DateTime(timezone=True), nullable=True)
#     cancelled_at = Column(DateTime(timezone=True), nullable=True)
    
#     booking = relationship("RideBooking", backref="seat_modification_requests")
#     ride = relationship("Ride", backref="seat_modification_requests")  # This conflicts!
# class ModificationRequest(Base):
#     __tablename__ = "modification_requests"
    
#     id = Column(Integer, primary_key=True, index=True)
#     booking_id = Column(Integer, ForeignKey("ride_bookings.id"), nullable=False)
#     ride_id = Column(Integer, ForeignKey("rides.id"), nullable=False)
#     passenger_phone = Column(String(20), nullable=False, index=True)
#     current_seats = Column(Integer, nullable=False)
#     requested_seats = Column(Integer, nullable=False)
#     status = Column(String(20), default="pending")  # pending, approved, rejected, cancelled
#     rejection_reason = Column(Text, nullable=True)
#     created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
#     approved_at = Column(DateTime(timezone=True), nullable=True)
#     rejected_at = Column(DateTime(timezone=True), nullable=True)
#     cancelled_at = Column(DateTime(timezone=True), nullable=True)
    
#     # Relationships - Use back_populates, NOT backref
#     booking = relationship("RideBooking", back_populates="modification_requests")
#     ride = relationship("Ride", back_populates="modification_requests")  # No backref here!
# class User(Base):
#     __tablename__ = "users"
    
#     id = Column(Integer, primary_key=True, index=True)
    
#     # NEW: Custom User ID (D-AJ8600 format)
#     user_id = Column(String(10), unique=True, index=True, nullable=True)  # Will be generated
    
#     # Phone verification
#     phone_number = Column(String(20), unique=True, index=True, nullable=False)
#     country_code = Column(String(10), nullable=False, default="+91")
#     is_phone_verified = Column(Boolean, default=False)
    
#     # Profile information (from Create Profile screen)
#     first_name = Column(String(100), nullable=True)
#     last_name = Column(String(100), nullable=True)
#     full_name = Column(String(200), nullable=True)  # Computed field
#     email = Column(String(255), nullable=True)
#     email_verified = Column(Boolean, default=False)
#     date_of_birth = Column(Date, nullable=True)
#     gender = Column(String(50), nullable=True)
    
#     # Location
#     state = Column(String(100), nullable=True)
#     city = Column(String(100), nullable=True)
    
#     # Profile image and avatar

#     profile_picture = Column(Text, nullable=True)
#     avatar = Column(JSON, nullable=True)  # Avatar data as JSON
    
#     # Additional info
#     referral_code = Column(String(20), nullable=True)
    
#     # User status and type
#     user_type = Column(Enum(UserType), nullable=True)
#     status = Column(Enum(UserStatus), default=UserStatus.PENDING)
#     profile_completed = Column(Boolean, default=False)
    
#     # Driver specific info (if user_type includes DRIVER)
#     has_vehicle = Column(Boolean, default=False)
#     vehicle_type = Column(String(50), nullable=True)
#     vehicle_number = Column(String(20), nullable=True)
#     license_number = Column(String(50), nullable=True)
    
#     # Timestamps
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())
#     # About / Bio
#     bio = Column(String(500), nullable=True)
#     avg_rating = Column(Float, default=5.0)
#     total_ratings = Column(Integer, default=0)
  
from datetime import datetime, timezone
from sqlalchemy import BigInteger, Column, Integer, String, DateTime, Boolean, Text, Enum, Date, JSON, Float, UniqueConstraint, ForeignKey
from sqlalchemy.sql import func
from database import Base
import enum
from sqlalchemy.orm import relationship


class UserType(enum.Enum):
    DRIVER = "driver"
    PASSENGER = "passenger"
    BOTH = "both"


class UserStatus(enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"


class NotificationType(enum.Enum):
    RIDE = "ride"
    REWARD = "reward"
    PROMOTION = "promotion"
    DOCUMENT = "document"
    SYSTEM = "system"


class DocumentType(enum.Enum):
    AADHAR = "aadhar"
    DL = "dl"
    RC = "rc"
    PAN = "pan"
    PASSPORT = "passport"
    
    @classmethod
    def get(cls, value):
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


class FeedbackType(enum.Enum):
    APP = "app"
    RIDE = "ride"
    DRIVER = "driver"
    PASSENGER = "passenger"


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


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(10), unique=True, index=True, nullable=True)
    phone_number = Column(String(20), unique=True, index=True, nullable=False)
    country_code = Column(String(10), nullable=False, default="+91")
    is_phone_verified = Column(Boolean, default=False)
    
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    full_name = Column(String(200), nullable=True)
    email = Column(String(255), nullable=True)
    email_verified = Column(Boolean, default=False)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(50), nullable=True)
    
    state = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    
    profile_picture = Column(Text, nullable=True)
    avatar = Column(JSON, nullable=True)
    
    referral_code = Column(String(20), nullable=True)
    
    user_type = Column(Enum(UserType), nullable=True)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING)
    profile_completed = Column(Boolean, default=False)
    
    has_vehicle = Column(Boolean, default=False)
    vehicle_type = Column(String(50), nullable=True)
    vehicle_number = Column(String(20), nullable=True)
    license_number = Column(String(50), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    bio = Column(String(500), nullable=True)
    avg_rating = Column(Float, default=5.0)
    total_ratings = Column(Integer, default=0)
    
    # Relationships
    rides_as_driver = relationship("Ride", foreign_keys="Ride.phone_number", primaryjoin="User.phone_number == Ride.phone_number", back_populates="driver")
    rides_as_passenger = relationship("RideBooking", foreign_keys="RideBooking.passenger_phone", primaryjoin="User.phone_number == RideBooking.passenger_phone", back_populates="passenger")
    sent_messages = relationship("ChatMessage", foreign_keys="ChatMessage.sender_phone", primaryjoin="User.phone_number == ChatMessage.sender_phone")
    conversations_as_participant1 = relationship("Conversation", foreign_keys="Conversation.participant_1_phone", primaryjoin="User.phone_number == Conversation.participant_1_phone")
    conversations_as_participant2 = relationship("Conversation", foreign_keys="Conversation.participant_2_phone", primaryjoin="User.phone_number == Conversation.participant_2_phone")
    notifications = relationship("UserNotification", foreign_keys="UserNotification.phone_number", primaryjoin="User.phone_number == UserNotification.phone_number")
    vehicles = relationship("Vehicle", foreign_keys="Vehicle.phone_number", primaryjoin="User.phone_number == Vehicle.phone_number")
    emergency_contacts = relationship("EmergencyContact", foreign_keys="EmergencyContact.phone_number", primaryjoin="User.phone_number == EmergencyContact.phone_number")
    dcoin_transactions = relationship("DCoinRedemption", foreign_keys="DCoinRedemption.phone_number", primaryjoin="User.phone_number == DCoinRedemption.phone_number")
    ride_rewards = relationship("RideReward", foreign_keys="RideReward.phone_number", primaryjoin="User.phone_number == RideReward.phone_number")
    feedback_given = relationship("RideFeedback", foreign_keys="RideFeedback.feedback_by_user_id", back_populates="feedback_by")
    feedback_received = relationship("RideFeedback", foreign_keys="RideFeedback.feedback_for_user_id", back_populates="feedback_for")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), ForeignKey("users.phone_number"), index=True)
    vehicle_type = Column(String(50))
    body_type = Column(String(50))
    fuel_type = Column(String(50))
    make = Column(String(50), index=True)
    model = Column(String(50), index=True)
    year = Column(Integer)
    registration_number = Column(String(50), unique=True)
    color = Column(String(30))
    max_seats = Column(Integer)
    notes = Column(Text)
    photo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="vehicles")
    rides = relationship("Ride", back_populates="vehicle")


class Ride(Base):
    __tablename__ = "rides"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), ForeignKey("users.phone_number"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    origin = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)

    origin_lat = Column(Float, nullable=True)
    origin_lon = Column(Float, nullable=True)
    destination_lat = Column(Float, nullable=True)
    destination_lon = Column(Float, nullable=True)
    route_coordinates = Column(JSON, nullable=True)

    departure_time = Column(DateTime(timezone=True), nullable=False)
    expected_end_time = Column(DateTime(timezone=True), nullable=True)
    duration_minutes = Column(Integer, default=60, nullable=True)

    distance_km = Column(Float, nullable=True)
    duration_text = Column(String(100), nullable=True)
    total_estimated_price = Column(Float, nullable=True)

    available_seats = Column(Integer, nullable=False)
    price_per_seat = Column(Float, nullable=False)

    preferences = Column(JSON, nullable=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    women_only = Column(Boolean, default=False, nullable=True)

    status = Column(String(20), default="active")
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    cancellation_reason = Column(String(255), nullable=True)

    # Relationships
    driver = relationship("User", foreign_keys=[phone_number], primaryjoin="User.phone_number == Ride.phone_number", back_populates="rides_as_driver")
    vehicle = relationship("Vehicle", back_populates="rides")
    bookings = relationship("RideBooking", back_populates="ride", cascade="all, delete-orphan")
    modification_requests = relationship("ModificationRequest", back_populates="ride", cascade="all, delete-orphan")
    ride_sessions = relationship("RideSession", back_populates="ride", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="ride")


class RideBooking(Base):
    __tablename__ = "ride_bookings"

    id = Column(Integer, primary_key=True, index=True)
    ride_id = Column(Integer, ForeignKey("rides.id"), nullable=False)
    passenger_phone = Column(String(20), ForeignKey("users.phone_number"), index=True, nullable=False)
    passenger_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    seats_booked = Column(Integer, nullable=False)
    total_amount = Column(Float, nullable=False)

    pickup_lat = Column(Float, nullable=True)
    pickup_lon = Column(Float, nullable=True)
    drop_lat = Column(Float, nullable=True)
    drop_lon = Column(Float, nullable=True)

    intersection_pickup_lat = Column(Float, nullable=True)
    intersection_pickup_lon = Column(Float, nullable=True)
    intersection_drop_lat = Column(Float, nullable=True)
    intersection_drop_lon = Column(Float, nullable=True)

    pickup_walk_distance_m = Column(Integer, nullable=True)
    drop_walk_distance_m = Column(Integer, nullable=True)

    status = Column(String(20), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    cancellation_reason = Column(String(255), nullable=True)

    # Relationships
    ride = relationship("Ride", back_populates="bookings")
    passenger = relationship("User", foreign_keys=[passenger_phone], primaryjoin="User.phone_number == RideBooking.passenger_phone", back_populates="rides_as_passenger")
    modification_requests = relationship("ModificationRequest", back_populates="booking", cascade="all, delete-orphan")
    session_riders = relationship("RideSessionRider", back_populates="booking", cascade="all, delete-orphan")
    ride_feedback = relationship("RideFeedback", foreign_keys="RideFeedback.ride_booking_id", back_populates="ride_booking")


class ModificationRequest(Base):
    __tablename__ = "modification_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("ride_bookings.id"), nullable=False)
    ride_id = Column(Integer, ForeignKey("rides.id"), nullable=False)
    passenger_phone = Column(String(20), nullable=False, index=True)
    current_seats = Column(Integer, nullable=False)
    requested_seats = Column(Integer, nullable=False)
    status = Column(String(20), default="pending")
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejected_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    booking = relationship("RideBooking", back_populates="modification_requests")
    ride = relationship("Ride", back_populates="modification_requests")


class RideSession(Base):
    __tablename__ = "ride_sessions"

    id = Column(Integer, primary_key=True, index=True)
    ride_id = Column(Integer, ForeignKey("rides.id"), nullable=False, index=True)
    driver_phone = Column(String(20), ForeignKey("users.phone_number"), nullable=False, index=True)

    status = Column(String(20), default="driver_started")
    current_phase = Column(String(20), default="boarding")

    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)

    qr_code_token = Column(String(64), nullable=True)
    qr_expires_at = Column(DateTime(timezone=True), nullable=True)

    sos_active = Column(Boolean, default=False)
    emergency_stop_active = Column(Boolean, default=False)
    emergency_note = Column(Text, nullable=True)

    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    ride = relationship("Ride", back_populates="ride_sessions")
    driver = relationship("User", foreign_keys=[driver_phone], primaryjoin="User.phone_number == RideSession.driver_phone")
    riders = relationship("RideSessionRider", back_populates="session", cascade="all, delete-orphan")


class RideSessionRider(Base):
    __tablename__ = "ride_session_riders"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("ride_sessions.id"), nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("ride_bookings.id"), nullable=False, index=True)

    rider_phone = Column(String(20), ForeignKey("users.phone_number"), nullable=False, index=True)
    rider_name = Column(String(100), nullable=True)
    rider_photo = Column(String(500), nullable=True)

    pickup_location = Column(String(255), nullable=True)
    dropoff_location = Column(String(255), nullable=True)

    pickup_lat = Column(Float, nullable=True)
    pickup_lng = Column(Float, nullable=True)
    dropoff_lat = Column(Float, nullable=True)
    dropoff_lng = Column(Float, nullable=True)

    status = Column(String(20), default="accepted")
    reached_pickup_at = Column(DateTime(timezone=True), nullable=True)
    boarded_at = Column(DateTime(timezone=True), nullable=True)
    dropped_off_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    pickup_confirmed = Column(Boolean, default=False)
    dropoff_confirmed = Column(Boolean, default=False)

    driver_rating = Column(Integer, nullable=True)
    driver_feedback = Column(Text, nullable=True)

    rider_rating = Column(Integer, nullable=True)
    rider_feedback = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    session = relationship("RideSession", back_populates="riders")
    booking = relationship("RideBooking", back_populates="session_riders")
    rider = relationship("User", foreign_keys=[rider_phone], primaryjoin="User.phone_number == RideSessionRider.rider_phone")


class UserNotification(Base):
    __tablename__ = "user_notifications"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), ForeignKey("users.phone_number"), index=True, nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    is_read = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    action_type = Column(String(50), nullable=True)
    action_value = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[phone_number], primaryjoin="User.phone_number == UserNotification.phone_number", back_populates="notifications")


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), ForeignKey("users.phone_number"), index=True, nullable=False)
    contact_name = Column(String(100), nullable=False)
    contact_number = Column(String(20), nullable=False)
    is_system = Column(Boolean, default=False)
    share_live_location = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[phone_number], primaryjoin="User.phone_number == EmergencyContact.phone_number", back_populates="emergency_contacts")


class ShareActivity(Base):
    __tablename__ = "share_activity"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), index=True, nullable=False)
    referral_code = Column(String(50), nullable=False)
    share_count = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    redemptions = relationship("PromotionRedemption", back_populates="promotion", cascade="all, delete")


class PromotionRedemption(Base):
    __tablename__ = "promotion_redemptions"

    id = Column(Integer, primary_key=True, index=True)
    promotion_id = Column(Integer, ForeignKey("promotions.id", ondelete="CASCADE"), nullable=False)
    phone_number = Column(String(20), nullable=False)
    redeemed_at = Column(DateTime(timezone=True), server_default=func.now())

    promotion = relationship("Promotion", back_populates="redemptions")


class DCoinRedemption(Base):
    __tablename__ = "dcoin_redemptions"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), ForeignKey("users.phone_number"), index=True, nullable=False)
    redeem_code = Column(String(12), unique=True, nullable=True)
    coins = Column(Integer, nullable=False)
    rupees = Column(Float, nullable=False)
    type = Column(String(10))
    reason = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[phone_number], primaryjoin="User.phone_number == DCoinRedemption.phone_number", back_populates="dcoin_transactions")


class RideRewardMaster(Base):
    __tablename__ = "ride_rewards_master"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    rides_required = Column(Integer, nullable=False)
    reward_points = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class RideReward(Base):
    __tablename__ = "ride_rewards"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), ForeignKey("users.phone_number"), index=True, nullable=False)
    reward_id = Column(Integer, nullable=False)
    coins = Column(Integer, nullable=False)
    credited_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[phone_number], primaryjoin="User.phone_number == RideReward.phone_number", back_populates="ride_rewards")


class FAQ(Base):
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category = Column(String(50), nullable=False)
    question = Column(String(255), nullable=False)
    answer = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


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


class MatchingPreferenceMaster(Base):
    __tablename__ = "matching_preference_master"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(50), unique=True, nullable=False)
    label = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    input_type = Column(String(20), nullable=False)
    options = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class MatchingPreferenceUser(Base):
    __tablename__ = "matching_preference_user"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), index=True, nullable=False)
    preference_key = Column(String(50), nullable=False)
    value = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class DocumentVerification(Base):
    __tablename__ = "document_verifications"
    
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), index=True, nullable=False)
    user_id = Column(String(20), index=True, nullable=True)
    document_type = Column(Enum(DocumentType), nullable=False)
    document_number = Column(String(50), nullable=False, unique=True)
    document_name = Column(String(100), nullable=False)
    document_data = Column(JSON, nullable=True)
    front_image_path = Column(String(500), nullable=False)
    back_image_path = Column(String(500), nullable=True)
    selfie_image_path = Column(String(500), nullable=False)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.PENDING)
    verified_by = Column(String(100), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    is_expired = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
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
    permissions = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)


class VerificationLog(Base):
    __tablename__ = "verification_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("document_verifications.id"), nullable=False)
    admin_id = Column(Integer, ForeignKey("admin_users.id"), nullable=False)
    action = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserSettings(Base):
    __tablename__ = "user_account_settings"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), unique=True, index=True, nullable=False)
    contact_visibility = Column(Boolean, default=True)
    ride_updates = Column(Boolean, default=True)
    chat_messages = Column(Boolean, default=True)
    promotions = Column(Boolean, default=False)
    newsletters = Column(Boolean, default=False)
    sms_alerts = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class BlockedUser(Base):
    __tablename__ = "blocked_account_users"

    id = Column(Integer, primary_key=True, index=True)
    owner_phone = Column(String(20), index=True, nullable=False)
    blocked_phone = Column(String(20), nullable=False)
    blocked_name = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class UserDevice(Base):
    __tablename__ = "user_account_devices"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), index=True, nullable=False)
    device_name = Column(String(100))
    device_type = Column(String(20))
    is_current = Column(Boolean, default=False)
    last_active = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AccountDeactivation(Base):
    __tablename__ = "account_deactivations"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), index=True, nullable=False)
    reason = Column(Text, nullable=True)
    is_deactivated = Column(Boolean, default=True)
    reactivated_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserFeedback(Base):
    __tablename__ = "user_feedback"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), index=True)
    rating = Column(Integer)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class RideFeedback(Base):
    __tablename__ = "ride_feedback"

    id = Column(Integer, primary_key=True)
    ride_booking_id = Column(Integer, ForeignKey("ride_bookings.id"), nullable=False, index=True)
    feedback_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    feedback_for_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    reason = Column(String(120))
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    feedback_by = relationship("User", foreign_keys=[feedback_by_user_id], back_populates="feedback_given")
    feedback_for = relationship("User", foreign_keys=[feedback_for_user_id], back_populates="feedback_received")
    ride_booking = relationship("RideBooking", back_populates="ride_feedback")

    __table_args__ = (
        UniqueConstraint('ride_booking_id', 'feedback_by_user_id', name='unique_feedback_per_user_per_ride'),
    )


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    module = Column(String(100), nullable=False)
    action = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=True)
    entity_name = Column(String(150), nullable=True)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    active = Column(Boolean, default=True)

    cities = relationship("City", back_populates="state", cascade="all, delete")


class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    active = Column(Boolean, default=True)
    state_id = Column(Integer, ForeignKey("states.id", ondelete="CASCADE"))
    state = relationship("State", back_populates="cities")


class LiveLocation(Base):
    __tablename__ = "live_locations"

    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, index=True, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    participant_1_phone = Column(String(20), index=True, nullable=False)
    participant_2_phone = Column(String(20), index=True, nullable=False)
    ride_id = Column(Integer, ForeignKey("rides.id"), nullable=True)

    last_message = Column(Text, nullable=True)
    last_message_time = Column(DateTime(timezone=True), nullable=True)
    last_message_type = Column(String(20), default="text")
    hidden_for_user_1 = Column(Boolean, default=False)
    hidden_for_user_2 = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    ride = relationship("Ride", back_populates="conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_phone = Column(String(20), index=True, nullable=False)
    text = Column(Text, nullable=False)
    type = Column(String(20), default="text")
    file_url = Column(String(500), nullable=True)
    status = Column(String(20), default="sent")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_phone], primaryjoin="User.phone_number == ChatMessage.sender_phone", back_populates="sent_messages")


class DBList(Base):
    __tablename__ = "db_list"

    id = Column(BigInteger, primary_key=True, index=True)
    vehicle_type = Column(String)
    body_type = Column(String)
    sub_category = Column(String)
    make_company_name = Column(String)
    model_name = Column(String)
    claimed_mileage_petrol = Column(String)
    claimed_mileage_cng = Column(String)
    claimed_mileage_lpg = Column(String)
    claimed_mileage_diesel = Column(String)
    claimed_range_ev = Column(String)
    claimed_mileage_hybrid = Column(String)
    actual_mileage_petrol = Column(String)
    actual_mileage_cng = Column(String)
    actual_mileage_lpg = Column(String)
    actual_mileage_diesel = Column(String)
    actual_range_ev = Column(String)
    actual_mileage_hybrid = Column(String)
    fuel_type = Column(String)
    seating_capacity = Column(String)
    created_at = Column(DateTime(timezone=True))


class BlockedUsers(Base):
    __tablename__ = "blocked_users"
    
    id = Column(Integer, primary_key=True, index=True)
    blocker_phone = Column(String(20), nullable=False, index=True)
    blocked_phone = Column(String(20), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('blocker_phone', 'blocked_phone', name='unique_block'),
    )