# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from sqlalchemy import text
# from database import get_db
# from models import Ride, RideBooking, User, RideSession, RideSessionRider
# from datetime import datetime, timedelta
# import secrets

# router = APIRouter()


# def normalize_phone(phone: str) -> str:
#     phone = phone.replace(" ", "").replace("-", "")
#     if phone.startswith("+91"):
#         return phone
#     if phone.startswith("91") and len(phone) == 12:
#         return f"+{phone}"
#     if phone.startswith("+"):
#         return phone
#     return f"+91{phone}"


# def phone_last10(phone: str) -> str:
#     """Compare phone numbers by India last-10 digits to avoid formatting mismatches."""
#     if not phone:
#         return ""
#     digits = "".join(ch for ch in str(phone) if ch.isdigit())
#     return digits[-10:] if len(digits) >= 10 else digits


# @router.post("/ride-sessions/start/{ride_id}")
# async def start_ride_session(ride_id: int, payload: dict, db: Session = Depends(get_db)):
#     driver_phone = normalize_phone(payload.get("driver_phone", ""))

#     ride = db.query(Ride).filter(Ride.id == ride_id).first()
#     if not ride:
#         raise HTTPException(status_code=404, detail="Ride not found")

#     if not driver_phone:
#         raise HTTPException(status_code=403, detail="Only ride driver can start this ride")

#     # Phone numbers may have different formatting across client/server; compare by last-10 digits.
#     ride_last10 = phone_last10(normalize_phone(ride.phone_number))
#     driver_last10 = phone_last10(driver_phone)
#     if ride_last10 != driver_last10:
#         raise HTTPException(status_code=403, detail="Only ride driver can start this ride")

#     existing = db.query(RideSession).filter(
#         RideSession.ride_id == ride_id,
#         RideSession.status.in_(["driver_started", "boarding", "en_route"])
#     ).first()

#     if existing:
#         return {
#             "message": "Ride session already active",
#             "session_id": existing.id,
#             "status": existing.status
#         }

#     accepted_bookings = db.query(RideBooking).filter(
#         RideBooking.ride_id == ride_id,
#         RideBooking.status == "accepted"
#     ).all()

#     if not accepted_bookings:
#         raise HTTPException(status_code=400, detail="No accepted riders found for this ride")

#     qr_token = secrets.token_hex(16)

#     session = RideSession(
#         ride_id=ride_id,
#         driver_phone=driver_phone,
#         status="driver_started",
#         current_phase="boarding",
#         qr_code_token=qr_token,
#         qr_expires_at=datetime.utcnow() + timedelta(hours=8),
#         started_at=datetime.utcnow()
#     )
#     db.add(session)
#     db.flush()

#     rider_rows = []
#     for booking in accepted_bookings:
#         rider_user = db.query(User).filter(User.phone_number == booking.passenger_phone).first()

#         rider_row = RideSessionRider(
#             session_id=session.id,
#             booking_id=booking.id,
#             rider_phone=booking.passenger_phone,
#             rider_name=rider_user.full_name if rider_user else None,
#             rider_photo=rider_user.profile_picture if rider_user else None,
#             pickup_location=getattr(booking, "pickup_location", ride.origin),
#             dropoff_location=getattr(booking, "dropoff_location", ride.destination),
#             status="accepted"
#         )
#         db.add(rider_row)
#         rider_rows.append(rider_row)

#     ride.status = "active"
#     db.commit()
#     db.refresh(session)

#     return {
#         "message": "Ride started successfully",
#         "session_id": session.id,
#         "ride_id": ride.id,
#         "status": session.status,
#         "current_phase": session.current_phase,
#         "qr_code_token": session.qr_code_token
#     }


# @router.get("/ride-sessions/driver/{ride_id}")
# async def get_driver_session(ride_id: int, driver_phone: str, db: Session = Depends(get_db)):
#     driver_phone = normalize_phone(driver_phone)

#     session = db.query(RideSession).filter(
#         RideSession.ride_id == ride_id,
#         RideSession.driver_phone == driver_phone
#     ).order_by(RideSession.id.desc()).first()

#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")

#     ride = db.query(Ride).filter(Ride.id == ride_id).first()

#     riders = []
#     boarded_count = 0
#     dropped_count = 0

#     for rider in session.riders:
#         if rider.status in ["boarded", "dropped_off", "completed"]:
#             boarded_count += 1
#         if rider.status in ["dropped_off", "completed"]:
#             dropped_count += 1

#         riders.append({
#             "id": rider.id,
#             "booking_id": rider.booking_id,
#             "rider_phone": rider.rider_phone,
#             "rider_name": rider.rider_name,
#             "rider_photo": rider.rider_photo,
#             "pickup_location": rider.pickup_location,
#             "dropoff_location": rider.dropoff_location,
#             "status": rider.status,
#             "boarded_at": rider.boarded_at.isoformat() if rider.boarded_at else None,
#             "dropped_off_at": rider.dropped_off_at.isoformat() if rider.dropped_off_at else None,
#             "completed_at": rider.completed_at.isoformat() if rider.completed_at else None,
#         })

#     return {
#         "session_id": session.id,
#         "ride_id": ride_id,
#         "ride_origin": ride.origin if ride else None,
#         "ride_destination": ride.destination if ride else None,
#         "status": session.status,
#         "current_phase": session.current_phase,
#         "qr_code_token": session.qr_code_token,
#         "boarded_count": boarded_count,
#         "dropped_count": dropped_count,
#         "total_riders": len(session.riders),
#         "sos_active": session.sos_active,
#         "emergency_stop_active": session.emergency_stop_active,
#         "riders": riders
#     }


# @router.get("/ride-sessions/rider/{booking_id}")
# async def get_rider_session(booking_id: int, rider_phone: str, db: Session = Depends(get_db)):
#     rider_phone = normalize_phone(rider_phone)

#     rider_session = db.query(RideSessionRider).filter(
#         RideSessionRider.booking_id == booking_id,
#         RideSessionRider.rider_phone == rider_phone
#     ).order_by(RideSessionRider.id.desc()).first()

#     if not rider_session:
#         raise HTTPException(status_code=404, detail="Rider session not found")

#     session = db.query(RideSession).filter(RideSession.id == rider_session.session_id).first()
#     ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
#     driver = db.query(User).filter(User.phone_number == session.driver_phone).first()

#     return {
#         "session_id": session.id,
#         "booking_id": booking_id,
#         "ride_id": session.ride_id,
#         "session_status": session.status,
#         "current_phase": session.current_phase,
#         "driver_phone": session.driver_phone,
#         "driver_name": driver.full_name if driver else "Driver",
#         "driver_photo": driver.profile_picture if driver else None,
#         "origin": ride.origin if ride else None,
#         "destination": ride.destination if ride else None,
#         "rider_status": rider_session.status,
#         "pickup_location": rider_session.pickup_location,
#         "dropoff_location": rider_session.dropoff_location,
#         "current_lat": session.current_lat,
#         "current_lng": session.current_lng,
#         "sos_active": session.sos_active,
#         "emergency_stop_active": session.emergency_stop_active
#     }


# @router.post("/ride-sessions/{session_id}/reached-pickup")
# async def rider_reached_pickup(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     booking_id = payload.get("booking_id")
#     rider_phone = normalize_phone(payload.get("rider_phone", ""))

#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id,
#         RideSessionRider.rider_phone == rider_phone
#     ).first()

#     if not rider:
#         raise HTTPException(status_code=404, detail="Rider not found in session")

#     rider.status = "reached_pickup"
#     rider.reached_pickup_at = datetime.utcnow()
#     db.commit()

#     return {"message": "Pickup arrival marked", "status": rider.status}


# @router.post("/ride-sessions/{session_id}/scan-qr")
# async def scan_driver_qr(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     booking_id = payload.get("booking_id")
#     rider_phone = normalize_phone(payload.get("rider_phone", ""))
#     qr_code_token = payload.get("qr_code_token")

#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")

#     if session.qr_code_token != qr_code_token:
#         raise HTTPException(status_code=400, detail="Invalid QR code")

#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id,
#         RideSessionRider.rider_phone == rider_phone
#     ).first()

#     if not rider:
#         raise HTTPException(status_code=404, detail="Rider not found")

#     rider.status = "boarded"
#     rider.boarded_at = datetime.utcnow()

#     all_boarded = all(r.status in ["boarded", "dropped_off", "completed"] for r in session.riders)
#     if all_boarded:
#         session.status = "en_route"
#         session.current_phase = "en_route"
#     else:
#         session.status = "boarding"
#         session.current_phase = "boarding"

#     db.commit()

#     return {
#         "message": "Boarding successful",
#         "rider_status": rider.status,
#         "session_status": session.status,
#         "current_phase": session.current_phase
#     }


# @router.post("/ride-sessions/{session_id}/riders/{booking_id}/mark-boarded")
# async def driver_mark_boarded(session_id: int, booking_id: int, payload: dict, db: Session = Depends(get_db)):
#     driver_phone = normalize_phone(payload.get("driver_phone", ""))

#     session = db.query(RideSession).filter(
#         RideSession.id == session_id,
#         RideSession.driver_phone == driver_phone
#     ).first()

#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")

#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id
#     ).first()

#     if not rider:
#         raise HTTPException(status_code=404, detail="Rider not found")

#     rider.status = "boarded"
#     rider.boarded_at = datetime.utcnow()

#     all_boarded = all(
#         r.status in ["boarded", "dropped_off", "completed"] for r in session.riders
#     )
#     session.status = "en_route" if all_boarded else "boarding"
#     session.current_phase = "en_route" if all_boarded else "boarding"

#     db.commit()

#     return {
#         "message": "Rider marked as boarded",
#         "rider_status": rider.status,
#         "session_status": session.status,
#         "current_phase": session.current_phase
#     }


# @router.post("/ride-sessions/{session_id}/riders/{booking_id}/drop-off")
# async def driver_dropoff_rider(session_id: int, booking_id: int, payload: dict, db: Session = Depends(get_db)):
#     driver_phone = normalize_phone(payload.get("driver_phone", ""))

#     session = db.query(RideSession).filter(
#         RideSession.id == session_id,
#         RideSession.driver_phone == driver_phone
#     ).first()

#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")

#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id
#     ).first()

#     if not rider:
#         raise HTTPException(status_code=404, detail="Rider not found")

#     rider.status = "dropped_off"
#     rider.dropped_off_at = datetime.utcnow()

#     all_dropped = all(r.status in ["dropped_off", "completed"] for r in session.riders if r.status != "skipped")
#     if all_dropped:
#         session.current_phase = "completed"

#     db.commit()

#     return {
#         "message": "Rider dropped off successfully",
#         "rider_status": rider.status,
#         "current_phase": session.current_phase
#     }


# @router.post("/ride-sessions/{session_id}/mark-completed")
# async def rider_mark_completed(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     booking_id = payload.get("booking_id")
#     rider_phone = normalize_phone(payload.get("rider_phone", ""))

#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id,
#         RideSessionRider.rider_phone == rider_phone
#     ).first()

#     if not rider:
#         raise HTTPException(status_code=404, detail="Rider not found")

#     rider.status = "completed"
#     rider.completed_at = datetime.utcnow()
#     db.commit()

#     return {"message": "Ride marked completed", "status": rider.status}


# @router.post("/ride-sessions/{session_id}/complete")
# async def complete_ride(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     driver_phone = normalize_phone(payload.get("driver_phone", ""))

#     session = db.query(RideSession).filter(
#         RideSession.id == session_id,
#         RideSession.driver_phone == driver_phone
#     ).first()

#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")

#     all_done = all(r.status in ["dropped_off", "completed"] for r in session.riders if r.status != "skipped")
#     if not all_done:
#         raise HTTPException(status_code=400, detail="All riders must be dropped before completing the ride")

#     session.status = "completed"
#     session.current_phase = "completed"
#     session.completed_at = datetime.utcnow()

#     ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
#     if ride:
#         ride.status = "completed"

#     db.commit()

#     return {
#         "message": "Ride completed successfully",
#         "status": session.status
#     }


# @router.post("/ride-sessions/{session_id}/rate-rider")
# async def rate_rider(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     booking_id = payload.get("booking_id")
#     rating = payload.get("rating")
#     feedback = payload.get("feedback", "")

#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id
#     ).first()

#     if not rider:
#         raise HTTPException(status_code=404, detail="Rider not found")

#     rider.driver_rating = rating
#     rider.driver_feedback = feedback
#     db.commit()

#     return {"message": "Rider rated successfully"}


# @router.post("/ride-sessions/{session_id}/rate-driver")
# async def rate_driver(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     booking_id = payload.get("booking_id")
#     rating = payload.get("rating")
#     feedback = payload.get("feedback", "")

#     rider = db.query(RideSessionRider).filter(
#         RideSessionRider.session_id == session_id,
#         RideSessionRider.booking_id == booking_id
#     ).first()

#     if not rider:
#         raise HTTPException(status_code=404, detail="Session rider not found")

#     rider.rider_rating = rating
#     rider.rider_feedback = feedback
#     db.commit()

#     return {"message": "Driver rated successfully"}


# @router.post("/ride-sessions/{session_id}/location")
# async def update_driver_location(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")

#     session.current_lat = payload.get("lat")
#     session.current_lng = payload.get("lng")
#     db.commit()

#     return {"message": "Location updated"}


# @router.post("/ride-sessions/{session_id}/sos")
# async def trigger_sos(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")

#     session.sos_active = True
#     session.emergency_note = payload.get("note")
#     db.commit()

#     return {"message": "SOS triggered successfully"}


# @router.post("/ride-sessions/{session_id}/emergency-stop")
# async def trigger_emergency_stop(session_id: int, payload: dict, db: Session = Depends(get_db)):
#     session = db.query(RideSession).filter(RideSession.id == session_id).first()
#     if not session:
#         raise HTTPException(status_code=404, detail="Ride session not found")

#     session.emergency_stop_active = True
#     session.status = "emergency_stopped"
#     session.emergency_note = payload.get("note")
#     db.commit()

#     return {"message": "Emergency stop activated", "status": session.status}
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import Ride, RideBooking, User, RideSession, RideSessionRider
from datetime import datetime, timedelta
import secrets

router = APIRouter()


def normalize_phone(phone: str) -> str:
    phone = phone.replace(" ", "").replace("-", "")
    if phone.startswith("+91"):
        return phone
    if phone.startswith("91") and len(phone) == 12:
        return f"+{phone}"
    if phone.startswith("+"):
        return phone
    return f"+91{phone}"


def phone_last10(phone: str) -> str:
    """Compare phone numbers by India last-10 digits to avoid formatting mismatches."""
    if not phone:
        return ""
    digits = "".join(ch for ch in str(phone) if ch.isdigit())
    return digits[-10:] if len(digits) >= 10 else digits


@router.post("/ride-sessions/start/{ride_id}")
async def start_ride_session(ride_id: int, payload: dict, db: Session = Depends(get_db)):
    driver_phone = normalize_phone(payload.get("driver_phone", ""))

    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if not driver_phone:
        raise HTTPException(status_code=403, detail="Only ride driver can start this ride")

    # Phone numbers may have different formatting across client/server; compare by last-10 digits.
    ride_last10 = phone_last10(normalize_phone(ride.phone_number))
    driver_last10 = phone_last10(driver_phone)
    if ride_last10 != driver_last10:
        raise HTTPException(status_code=403, detail="Only ride driver can start this ride")

    existing = db.query(RideSession).filter(
        RideSession.ride_id == ride_id,
        RideSession.status.in_(["driver_started", "boarding", "en_route"])
    ).first()

    if existing:
        return {
            "message": "Ride session already active",
            "session_id": existing.id,
            "status": existing.status
        }

    accepted_bookings = db.query(RideBooking).filter(
        RideBooking.ride_id == ride_id,
        RideBooking.status == "accepted"
    ).all()

    if not accepted_bookings:
        raise HTTPException(status_code=400, detail="No accepted riders found for this ride")

    qr_token = secrets.token_hex(16)

    session = RideSession(
        ride_id=ride_id,
        driver_phone=driver_phone,
        status="driver_started",
        current_phase="boarding",
        qr_code_token=qr_token,
        qr_expires_at=datetime.utcnow() + timedelta(hours=8),
        started_at=datetime.utcnow()
    )
    db.add(session)
    db.flush()

    rider_rows = []
    for booking in accepted_bookings:
        rider_user = db.query(User).filter(User.phone_number == booking.passenger_phone).first()

        rider_row = RideSessionRider(
            session_id=session.id,
            booking_id=booking.id,
            rider_phone=booking.passenger_phone,
            rider_name=rider_user.full_name if rider_user else None,
            rider_photo=rider_user.profile_picture if rider_user else None,
            pickup_location=getattr(booking, "pickup_location", ride.origin),
            dropoff_location=getattr(booking, "dropoff_location", ride.destination),
            status="accepted"
        )
        db.add(rider_row)
        rider_rows.append(rider_row)

    ride.status = "active"
    ride.started_at = datetime.utcnow()
    db.commit()
    db.refresh(session)

    return {
        "message": "Ride started successfully",
        "session_id": session.id,
        "ride_id": ride.id,
        "status": session.status,
        "current_phase": session.current_phase,
        "qr_code_token": session.qr_code_token
    }


@router.get("/ride-sessions/driver/{ride_id}")
async def get_driver_session(ride_id: int, driver_phone: str, db: Session = Depends(get_db)):
    driver_phone = normalize_phone(driver_phone)

    session = db.query(RideSession).filter(
        RideSession.ride_id == ride_id,
        RideSession.driver_phone == driver_phone
    ).order_by(RideSession.id.desc()).first()

    if not session:
        raise HTTPException(status_code=404, detail="Ride session not found")

    ride = db.query(Ride).filter(Ride.id == ride_id).first()

    riders = []
    boarded_count = 0
    dropped_count = 0

    for rider in session.riders:
        if rider.status in ["boarded", "dropped_off", "completed"]:
            boarded_count += 1
        if rider.status in ["dropped_off", "completed"]:
            dropped_count += 1

        riders.append({
            "id": rider.id,
            "booking_id": rider.booking_id,
            "rider_phone": rider.rider_phone,
            "rider_name": rider.rider_name or f"Rider {rider.rider_phone[-4:]}",
            "rider_photo": rider.rider_photo,
            "pickup_location": rider.pickup_location,
            "dropoff_location": rider.dropoff_location,
            "status": rider.status,
            "boarded_at": rider.boarded_at.isoformat() if rider.boarded_at else None,
            "dropped_off_at": rider.dropped_off_at.isoformat() if rider.dropped_off_at else None,
            "completed_at": rider.completed_at.isoformat() if rider.completed_at else None,
        })

    return {
        "session_id": session.id,
        "ride_id": ride_id,
        "ride_origin": ride.origin if ride else None,
        "ride_destination": ride.destination if ride else None,
        "departure_time": ride.departure_time.isoformat() if ride and ride.departure_time else None,  # ✅ ADD THIS
        "status": session.status,
        "current_phase": session.current_phase,
        "qr_code_token": session.qr_code_token,
        "boarded_count": boarded_count,
        "dropped_count": dropped_count,
        "total_riders": len(session.riders),
        "sos_active": session.sos_active,
        "emergency_stop_active": session.emergency_stop_active,
        "riders": riders
    }


@router.get("/ride-sessions/rider/{booking_id}")
async def get_rider_session(booking_id: int, rider_phone: str, db: Session = Depends(get_db)):
    rider_phone = normalize_phone(rider_phone)

    rider_session = db.query(RideSessionRider).filter(
        RideSessionRider.booking_id == booking_id,
        RideSessionRider.rider_phone == rider_phone
    ).order_by(RideSessionRider.id.desc()).first()

    if not rider_session:
        raise HTTPException(status_code=404, detail="Rider session not found")

    session = db.query(RideSession).filter(RideSession.id == rider_session.session_id).first()
    ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
    driver = db.query(User).filter(User.phone_number == session.driver_phone).first()

    return {
        "session_id": session.id,
        "booking_id": booking_id,
        "ride_id": session.ride_id,
        "session_status": session.status,
        "current_phase": session.current_phase,
        "driver_phone": session.driver_phone,
        "driver_name": driver.full_name if driver else "Driver",
        "driver_photo": driver.profile_picture if driver else None,
        "origin": ride.origin if ride else None,
        "destination": ride.destination if ride else None,
        "rider_status": rider_session.status,
        "pickup_location": rider_session.pickup_location,
        "dropoff_location": rider_session.dropoff_location,
        "current_lat": session.current_lat,
        "current_lng": session.current_lng,
        "sos_active": session.sos_active,
        "emergency_stop_active": session.emergency_stop_active
    }


@router.post("/ride-sessions/{session_id}/reached-pickup")
async def rider_reached_pickup(session_id: int, payload: dict, db: Session = Depends(get_db)):
    booking_id = payload.get("booking_id")
    rider_phone = normalize_phone(payload.get("rider_phone", ""))

    rider = db.query(RideSessionRider).filter(
        RideSessionRider.session_id == session_id,
        RideSessionRider.booking_id == booking_id,
        RideSessionRider.rider_phone == rider_phone
    ).first()

    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found in session")

    rider.status = "reached_pickup"
    rider.reached_pickup_at = datetime.utcnow()
    db.commit()

    return {"message": "Pickup arrival marked", "status": rider.status}


@router.post("/ride-sessions/{session_id}/scan-qr")
async def scan_driver_qr(session_id: int, payload: dict, db: Session = Depends(get_db)):
    booking_id = payload.get("booking_id")
    rider_phone = normalize_phone(payload.get("rider_phone", ""))
    qr_code_token = payload.get("qr_code_token")

    session = db.query(RideSession).filter(RideSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Ride session not found")

    if session.qr_code_token != qr_code_token:
        raise HTTPException(status_code=400, detail="Invalid QR code")

    rider = db.query(RideSessionRider).filter(
        RideSessionRider.session_id == session_id,
        RideSessionRider.booking_id == booking_id,
        RideSessionRider.rider_phone == rider_phone
    ).first()

    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")

    if rider.status in ["boarded", "dropped_off", "completed"]:
        raise HTTPException(status_code=400, detail="Rider already boarded")

    rider.status = "boarded"
    rider.boarded_at = datetime.utcnow()

    all_boarded = all(r.status in ["boarded", "dropped_off", "completed"] for r in session.riders)
    if all_boarded:
        session.status = "en_route"
        session.current_phase = "en_route"
    else:
        session.status = "boarding"
        session.current_phase = "boarding"

    db.commit()

    return {
        "message": "Boarding successful",
        "rider_status": rider.status,
        "session_status": session.status,
        "current_phase": session.current_phase
    }


@router.post("/ride-sessions/{session_id}/riders/{booking_id}/mark-boarded")
async def driver_mark_boarded(session_id: int, booking_id: int, payload: dict, db: Session = Depends(get_db)):
    driver_phone = normalize_phone(payload.get("driver_phone", ""))

    session = db.query(RideSession).filter(
        RideSession.id == session_id,
        RideSession.driver_phone == driver_phone
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Ride session not found")

    rider = db.query(RideSessionRider).filter(
        RideSessionRider.session_id == session_id,
        RideSessionRider.booking_id == booking_id
    ).first()

    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")

    if rider.status in ["boarded", "dropped_off", "completed"]:
        raise HTTPException(status_code=400, detail="Rider already boarded")

    rider.status = "boarded"
    rider.boarded_at = datetime.utcnow()

    all_boarded = all(r.status in ["boarded", "dropped_off", "completed"] for r in session.riders)
    if all_boarded:
        session.status = "en_route"
        session.current_phase = "en_route"
    else:
        session.status = "boarding"
        session.current_phase = "boarding"

    db.commit()

    return {
        "message": "Rider marked as boarded",
        "rider_status": rider.status,
        "session_status": session.status,
        "current_phase": session.current_phase
    }


@router.post("/ride-sessions/{session_id}/riders/{booking_id}/drop-off")
async def driver_dropoff_rider(session_id: int, booking_id: int, payload: dict, db: Session = Depends(get_db)):
    driver_phone = normalize_phone(payload.get("driver_phone", ""))

    session = db.query(RideSession).filter(
        RideSession.id == session_id,
        RideSession.driver_phone == driver_phone
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Ride session not found")

    rider = db.query(RideSessionRider).filter(
        RideSessionRider.session_id == session_id,
        RideSessionRider.booking_id == booking_id
    ).first()

    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")

    if rider.status in ["dropped_off", "completed"]:
        raise HTTPException(status_code=400, detail="Rider already dropped off")

    if rider.status != "boarded":
        raise HTTPException(status_code=400, detail="Rider must be boarded before drop off")

    rider.status = "dropped_off"
    rider.dropped_off_at = datetime.utcnow()

    all_dropped = all(r.status in ["dropped_off", "completed"] for r in session.riders)
    if all_dropped:
        session.current_phase = "completed"
        session.status = "en_route"

    db.commit()

    return {
        "message": "Rider dropped off successfully",
        "rider_status": rider.status,
        "current_phase": session.current_phase
    }


@router.post("/ride-sessions/{session_id}/mark-completed")
async def rider_mark_completed(session_id: int, payload: dict, db: Session = Depends(get_db)):
    booking_id = payload.get("booking_id")
    rider_phone = normalize_phone(payload.get("rider_phone", ""))

    rider = db.query(RideSessionRider).filter(
        RideSessionRider.session_id == session_id,
        RideSessionRider.booking_id == booking_id,
        RideSessionRider.rider_phone == rider_phone
    ).first()

    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")

    if rider.status != "dropped_off":
        raise HTTPException(status_code=400, detail="Ride must be completed after drop off")

    rider.status = "completed"
    rider.completed_at = datetime.utcnow()
    db.commit()

    return {"message": "Ride marked completed", "status": rider.status}


@router.post("/ride-sessions/{session_id}/complete")
async def complete_ride(session_id: int, payload: dict, db: Session = Depends(get_db)):
    driver_phone = normalize_phone(payload.get("driver_phone", ""))

    session = db.query(RideSession).filter(
        RideSession.id == session_id,
        RideSession.driver_phone == driver_phone
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Ride session not found")

    all_dropped = all(r.status in ["dropped_off", "completed"] for r in session.riders)
    if not all_dropped:
        raise HTTPException(status_code=400, detail="All riders must be dropped before completing the ride")

    session.status = "completed"
    session.current_phase = "completed"
    session.completed_at = datetime.utcnow()

    ride = db.query(Ride).filter(Ride.id == session.ride_id).first()
    if ride:
        ride.status = "completed"

    db.commit()

    return {
        "message": "Ride completed successfully",
        "status": session.status
    }


@router.post("/ride-sessions/{session_id}/rate-rider")
async def rate_rider(session_id: int, payload: dict, db: Session = Depends(get_db)):
    booking_id = payload.get("booking_id")
    rating = payload.get("rating")
    feedback = payload.get("feedback", "")

    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    rider = db.query(RideSessionRider).filter(
        RideSessionRider.session_id == session_id,
        RideSessionRider.booking_id == booking_id
    ).first()

    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")

    if rider.driver_rating:
        raise HTTPException(status_code=400, detail="Rating already submitted")

    rider.driver_rating = rating
    rider.driver_feedback = feedback
    db.commit()

    return {"message": "Rider rated successfully"}


@router.post("/ride-sessions/{session_id}/rate-driver")
async def rate_driver(session_id: int, payload: dict, db: Session = Depends(get_db)):
    booking_id = payload.get("booking_id")
    rating = payload.get("rating")
    feedback = payload.get("feedback", "")

    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    rider = db.query(RideSessionRider).filter(
        RideSessionRider.session_id == session_id,
        RideSessionRider.booking_id == booking_id
    ).first()

    if not rider:
        raise HTTPException(status_code=404, detail="Session rider not found")

    if rider.rider_rating:
        raise HTTPException(status_code=400, detail="Rating already submitted")

    rider.rider_rating = rating
    rider.rider_feedback = feedback
    db.commit()

    return {"message": "Driver rated successfully"}


@router.post("/ride-sessions/{session_id}/location")
async def update_driver_location(session_id: int, payload: dict, db: Session = Depends(get_db)):
    lat = payload.get("lat")
    lng = payload.get("lng")

    if lat is None or lng is None:
        raise HTTPException(status_code=400, detail="Latitude and longitude required")

    session = db.query(RideSession).filter(RideSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Ride session not found")

    session.current_lat = lat
    session.current_lng = lng
    db.commit()

    return {"message": "Location updated"}


@router.post("/ride-sessions/{session_id}/sos")
async def trigger_sos(session_id: int, payload: dict, db: Session = Depends(get_db)):
    session = db.query(RideSession).filter(RideSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Ride session not found")

    session.sos_active = True
    session.emergency_note = payload.get("note")
    db.commit()

    return {"message": "SOS triggered successfully"}


@router.post("/ride-sessions/{session_id}/emergency-stop")
async def trigger_emergency_stop(session_id: int, payload: dict, db: Session = Depends(get_db)):
    session = db.query(RideSession).filter(RideSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Ride session not found")

    session.emergency_stop_active = True
    session.status = "emergency_stopped"
    session.emergency_note = payload.get("note")
    db.commit()

    return {"message": "Emergency stop activated", "status": session.status}