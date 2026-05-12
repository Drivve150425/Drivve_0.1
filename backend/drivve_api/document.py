from datetime import date, datetime, timezone
import os
from typing import Optional
import uuid
from xml.dom.minidom import Document

from pydantic import BaseModel
from sqlalchemy import desc, or_
from drivve_api.createnotification import create_notification
from models import  DocumentStatus, DocumentType, DocumentVerification, NotificationType, User, UserNotification, VerificationLog
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, File, Form, HTTPException, Query, Request, UploadFile

from fastapi import APIRouter

router = APIRouter()
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URLS")
import requests

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

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

@router.get("/api/v1/documents/types")
async def get_document_types():
    """
    Get available document types with required fields
    """
    return {
        "success": True,
        "document_types": [
            {
                "type": "aadhar",
                "name": "Aadhar Card",
                "description": "Government issued identity card",
                "required_fields": ["document_number", "document_name"],
                "has_back_side": True,
                "icon": "id-card"
            },
            {
                "type": "dl",
                "name": "Driving License",
                "description": "Valid driving license",
                "required_fields": ["document_number", "document_name", "expiry_date"],
                "has_back_side": True,
                "icon": "car"
            },
            {
                "type": "rc",
                "name": "Registration Certificate",
                "description": "Vehicle registration certificate",
                "required_fields": ["document_number", "document_name", "vehicle_number", "expiry_date"],
                "has_back_side": False,
                "icon": "file-contract"
            },
            {
                "type": "pan",
                "name": "PAN Card",
                "description": "Permanent Account Number card",
                "required_fields": ["document_number", "document_name"],
                "has_back_side": False,
                "icon": "credit-card"
            },
            {
                "type": "passport",
                "name": "Passport",
                "description": "Valid passport",
                "required_fields": ["document_number", "document_name", "expiry_date"],
                "has_back_side": True,
                "icon": "passport"
            }
        ]
    }
    
def get_document_icon(doc_type: str) -> str:
    """Get icon name for document type"""
    icons = {
        "aadhar": "id-card",
        "dl": "car",
        "rc": "file-contract",
        "pan": "credit-card",
        "passport": "passport"
    }
    return icons.get(doc_type.lower(), "file-alt")
@router.get("/api/v1/documents/user/{phone_number}")
async def get_user_documents(
    phone_number: str,
    db: Session = Depends(get_db)
):
    """
    Get all documents for a user
    """
    try:
        documents = db.query(DocumentVerification).filter(
            DocumentVerification.phone_number == phone_number,
            DocumentVerification.is_deleted == False   # ✅ ADD HERE
        ).order_by(DocumentVerification.created_at.desc()).all()

        result = []
        for doc in documents:
            # Get user info
            user = db.query(User).filter(User.phone_number == doc.phone_number).first()
            
            result.append({
                "id": doc.id,
                "phone_number": doc.phone_number,
                "user_id": doc.user_id,
                "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
                "document_type": getattr(doc.document_type, "value", doc.document_type),
                "document_number": doc.document_number,
                "document_name": doc.document_name,
                "status": getattr(doc.status, "value", doc.status),
                "front_image_url": doc.front_image_path,
            "back_image_url": doc.back_image_path,
            "selfie_image_url": doc.selfie_image_path,
                "issue_date": doc.issue_date.isoformat() if doc.issue_date else None,
                "expiry_date": doc.expiry_date.isoformat() if doc.expiry_date else None,
                "is_expired": doc.is_expired,
                "submitted_at": doc.submitted_at.isoformat() if doc.submitted_at else None,
                "verified_by": doc.verified_by,
                "verified_at": doc.verified_at.isoformat() if doc.verified_at else None,
                "rejection_reason": doc.rejection_reason,
                "document_data": doc.document_data,
                "icon": get_document_icon(doc.document_type.value)
            })
        
        return {
            "success": True,
            "documents": result,
            "total": len(result)
        }
        
    except Exception as e:
        print(f"❌ Get user documents error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch documents: {str(e)}"
        )

def validate_document_number(doc_type: str, doc_number: str) -> bool:
    """Validate document number based on type"""
    doc_number = doc_number.strip().replace(" ", "")
    
    if not doc_number:
        return False
    
    doc_type_lower = doc_type.lower()
    
    if doc_type_lower == "aadhar":
        # Aadhar: 12 digits
        return len(doc_number) == 12 and doc_number.isdigit()
    
    elif doc_type_lower == "dl":
        # Driving License: varies by state, basic validation
        return len(doc_number) >= 10 and len(doc_number) <= 20
    
    elif doc_type_lower == "rc":
        # Registration Certificate: format like "MH12AB1234"
        return len(doc_number) >= 8 and len(doc_number) <= 15
    
    elif doc_type_lower == "pan":
        # PAN: 10 characters, format like "ABCDE1234F"
        return len(doc_number) == 10
    
    elif doc_type_lower == "passport":
        # Passport: varies, basic validation
        return len(doc_number) >= 6 and len(doc_number) <= 12
    
    return True
async def save_image(upload_file: UploadFile, image_type: str,
                     doc_type: str, doc_number: str,
                     timestamp: str, unique_id: str) -> str:

    if not upload_file:
        return None

    file_bytes = await upload_file.read()

    # Clean document type
    doc_type = doc_type.lower()

    # Generate filename
    filename = f"{doc_number}_{timestamp}_{unique_id}_{image_type}.jpg"

    # Folder structure
    file_path = f"documents/{doc_type}/{image_type}/{filename}"

    # Upload to Supabase
    return upload_to_supabase(file_bytes, file_path)

@router.post("/api/v1/documents/upload")
async def upload_document(
    phone_number: str = Form(...),
    document_type: str = Form(...),
    document_number: str = Form(...),
    document_name: str = Form(...),
    issue_date: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),
    vehicle_number: Optional[str] = Form(None),

    front_image: UploadFile = File(...),
    back_image: Optional[UploadFile] = File(None),
    selfie_image: UploadFile = File(...),

    is_reupload: Optional[bool] = Form(False),
    reupload_document_id: Optional[int] = Form(None),

    db: Session = Depends(get_db)
):
    """
    Upload or Re-upload a KYC document
    """
    front_path = back_path = selfie_path = None

    try:
        # =========================
        # 1️⃣ NORMALIZE INPUT
        # =========================
        phone_number = phone_number.strip()
        document_number = document_number.strip().replace(" ", "")
        document_type = document_type.upper()

        # =========================
        # 2️⃣ VALIDATE DOCUMENT TYPE
        # =========================
        try:
            doc_enum = DocumentType[document_type]
        except KeyError:
            raise HTTPException(400, "Invalid document type")

        # =========================
        # 3️⃣ VALIDATE DOCUMENT NUMBER FORMAT
        # =========================
        if not validate_document_number(document_type.lower(), document_number):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid {document_type} number format"
            )

        # =========================
        # 4️⃣ GLOBAL DUPLICATE CHECK (ACTIVE ONLY)
        # =========================
        existing = db.query(DocumentVerification).filter(
            DocumentVerification.document_number == document_number,
            DocumentVerification.is_deleted == False
        ).first()

        if existing and not is_reupload:
            raise HTTPException(
                status_code=409,
                detail="This document number is already registered"
            )

        if is_reupload and existing and existing.id != reupload_document_id:
            raise HTTPException(
                status_code=409,
                detail="This document number is already in use"
            )

        # =========================
        # 5️⃣ REUPLOAD VALIDATION
        # =========================
        document = None
        if is_reupload:
            if not reupload_document_id:
                raise HTTPException(400, "reupload_document_id required")

            document = db.query(DocumentVerification).filter(
                DocumentVerification.id == reupload_document_id,
                DocumentVerification.phone_number == phone_number,
                DocumentVerification.status == DocumentStatus.REJECTED,
                DocumentVerification.is_deleted == False
            ).first()

            if not document:
                raise HTTPException(404, "Rejected document not found")

        # =========================
        # 6️⃣ PARSE DATES
        # =========================
        issue_date_obj = (
            datetime.strptime(issue_date, "%Y-%m-%d").date()
            if issue_date else None
        )
        expiry_date_obj = (
            datetime.strptime(expiry_date, "%Y-%m-%d").date()
            if expiry_date else None
        )

        is_expired = (
            expiry_date_obj is not None and expiry_date_obj < date.today()
        )

        # =========================
        # 7️⃣ SAVE IMAGES
        # =========================
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        uid = uuid.uuid4().hex[:8]

        front_path = await save_image(
            front_image, "front",
            document_type, document_number,
            timestamp, uid
        )

        if back_image:
            back_path = await save_image(
                back_image, "back",
                document_type, document_number,
                timestamp, uid
            )

        selfie_path = await save_image(
            selfie_image, "selfie",
            document_type, document_number,
            timestamp, uid
        )

        # =========================
        # 8️⃣ PREPARE DOCUMENT DATA
        # =========================
        doc_data = {}
        if vehicle_number:
            doc_data["vehicle_number"] = vehicle_number.strip()

        # =========================
        # 9️⃣ INSERT / UPDATE RECORD
        # =========================
        if is_reupload:
            create_notification(
                db=db,
                phone_number=phone_number,
                title="Document Re-submitted 📄",
                message=f"Your {document.document_type.value.upper()} document has been re-submitted and is under review.",
                ntype=NotificationType.DOCUMENT,
                action_type="document",
                action_value=str(document.id)
            )
            document.document_number = document_number
            document.document_name = document_name
            document.document_data = doc_data or None
            document.front_image_path = front_path
            document.back_image_path = back_path
            document.selfie_image_path = selfie_path
            document.issue_date = issue_date_obj
            document.expiry_date = expiry_date_obj
            document.is_expired = is_expired
            document.status = DocumentStatus.PENDING
            document.rejection_reason = None
            document.verified_by = None
            document.verified_at = None
            document.updated_at = datetime.now(timezone.utc)

            db.add(
                VerificationLog(
                    document_id=document.id,
                    admin_id=1,
                    action="reupload",
                    notes="User reuploaded rejected document"
                )
            )

        else:
            user = db.query(User).filter(User.phone_number == phone_number).first()

            document = DocumentVerification(
                phone_number=phone_number,
                user_id=user.user_id if user else None,
                document_type=doc_enum,
                document_number=document_number,
                document_name=document_name,
                document_data=doc_data or None,
                front_image_path=front_path,
                back_image_path=back_path,
                selfie_image_path=selfie_path,
                issue_date=issue_date_obj,
                expiry_date=expiry_date_obj,
                is_expired=is_expired,
                status=DocumentStatus.PENDING,
                submitted_at=datetime.now(timezone.utc)
            )
            create_notification(
                db=db,
                phone_number=phone_number,
                title="Document Submitted 📄",
                message=f"Your {document.document_type.value.upper()} document has been submitted successfully and is under review.",
                ntype=NotificationType.DOCUMENT,
                action_type="document",
                action_value=str(document.id)
            )

            db.add(document)

        # =========================
        # 🔟 COMMIT
        # =========================
        db.commit()
        db.refresh(document)

        return {
            "success": True,
            "message": "Document submitted successfully",
            "document_id": document.id,
            "status": document.status.value,
            "is_reupload": is_reupload
        }

    # =========================
    # ❌ CLEAN FAILURES
    # =========================
    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        for path in [front_path, back_path, selfie_path]:
            if path and os.path.exists(path):
                os.remove(path)

        print("❌ Document upload failed:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Document upload failed. Please try again."
        )
@router.delete("/api/v1/documents/{document_id}")
async def delete_document(
    document_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    document = db.query(DocumentVerification).filter(
        DocumentVerification.id == document_id,
        DocumentVerification.is_deleted == False
    ).first()

    if not document:
        raise HTTPException(404, "Document not found")

    # 🔥 SOFT DELETE
    document.is_deleted = True
    document.deleted_at = datetime.now(timezone.utc)
    document.deleted_by = "user"
    document.updated_at = datetime.now(timezone.utc)

    # Optional: force status
    document.status = DocumentStatus.REJECTED

    # Audit log
    db.add(
        VerificationLog(
            document_id=document.id,
            admin_id=1,  # system
            action="soft_delete",
            notes="Document deleted by user"
        )
    )

    db.commit()

    return {
        "success": True,
        "message": "Document deleted successfully"
    }

@router.get("/api/v1/documents/pending")
async def get_pending_documents(
    status: str = "pending",
    document_type: Optional[str] = None,
    phone_number: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Get pending documents for admin approval (with pagination and filters)
    """
    try:
        offset = (page - 1) * limit
        
        query = db.query(DocumentVerification).filter(
            DocumentVerification.is_deleted == False
        )

        
        # Apply filters
        if status == "pending":
            query = query.filter(DocumentVerification.status == DocumentStatus.PENDING)
        elif status == "under_review":
            query = query.filter(DocumentVerification.status == DocumentStatus.UNDER_REVIEW)
        elif status == "all":
            query = query.filter(DocumentVerification.status.in_([
                DocumentStatus.PENDING, 
                DocumentStatus.UNDER_REVIEW,
                DocumentStatus.APPROVED,
                DocumentStatus.REJECTED
            ]))
        elif status:
            try:
                status_enum = DocumentStatus(status)
                query = query.filter(DocumentVerification.status == status_enum)
            except ValueError:
                pass
        
        if document_type:
            try:
                doc_enum = DocumentType(document_type.upper())
                query = query.filter(DocumentVerification.document_type == doc_enum)
            except (KeyError, ValueError):
                pass
        
        if phone_number:
            query = query.filter(DocumentVerification.phone_number == phone_number)
        
        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
                query = query.filter(DocumentVerification.submitted_at >= start_date_obj)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date_obj = datetime.strptime(end_date, "%Y-%m-%d")
                query = query.filter(DocumentVerification.submitted_at <= end_date_obj)
            except ValueError:
                pass
        
        total = query.count()
        documents = query.order_by(DocumentVerification.submitted_at.asc())\
                        .offset(offset).limit(limit).all()
        
        result = []
        for doc in documents:
            # Get user info
            user = db.query(User).filter(User.phone_number == doc.phone_number).first()
            
            result.append({
                "id": doc.id,
                "phone_number": doc.phone_number,
                "user_id": doc.user_id,
                "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
                "user_email": user.email if user else None,
                "document_type": doc.document_type.value.upper(),
                "document_number": doc.document_number,
                "document_name": doc.document_name,
                "status": doc.status.value,
                 "front_image_url": doc.front_image_path,
            "back_image_url": doc.back_image_path,
            "selfie_image_url": doc.selfie_image_path,
                "issue_date": doc.issue_date.isoformat() if doc.issue_date else None,
                 "rejection_reason": doc.rejection_reason,   # ✅ ADD THIS
                "expiry_date": doc.expiry_date.isoformat() if doc.expiry_date else None,
                "is_expired": doc.is_expired,
                "submitted_at": doc.submitted_at.isoformat() if doc.submitted_at else None,
                "document_data": doc.document_data,
                "icon": get_document_icon(doc.document_type.value)
            })
        
        return {
            "success": True,
            "documents": result,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }
        
    except Exception as e:
        print(f"❌ Get pending documents error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch pending documents: {str(e)}"
        )
class DocumentUpdateStatus(BaseModel):
    document_id: int
    status: str  # "approved", "rejected"
    rejection_reason: Optional[str] = None
    admin_username: str

@router.put("/api/v1/documents/status")
async def update_document_status(
    data: DocumentUpdateStatus,
    db: Session = Depends(get_db)
):
    """
    Admin updates document status (approve/reject)
    """
    try:
        document = db.query(DocumentVerification).filter(
            DocumentVerification.id == data.document_id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Update status
        if data.status == "approved":
            document.status = DocumentStatus.APPROVED
            document.verified_by = data.admin_username
            document.verified_at = datetime.now(timezone.utc)

            document.rejection_reason = None
            
            # Log the action
            log = VerificationLog(
                document_id=document.id,
                admin_id=1,  # Should get from admin session
                action="approve",
                notes="Document approved by admin"
            )
            db.add(log)
            
        elif data.status == "rejected":
            if not data.rejection_reason:
                raise HTTPException(status_code=400, detail="Rejection reason required")
            
            document.status = DocumentStatus.REJECTED
            document.verified_by = data.admin_username
            document.verified_at = datetime.now(timezone.utc)

            document.rejection_reason = data.rejection_reason
            
            # Log the action
            log = VerificationLog(
                document_id=document.id,
                admin_id=1,
                action="reject",
                notes=data.rejection_reason
            )
            db.add(log)
        
        elif data.status == "under_review":
            document.status = DocumentStatus.UNDER_REVIEW
            
            # Log the action
            log = VerificationLog(
                document_id=document.id,
                admin_id=1,
                action="under_review",
                notes="Document marked for review"
            )
            db.add(log)
        
        document.updated_at = datetime.now(timezone.utc)

        db.commit()
        
        return {
            "success": True,
            "message": f"Document {data.status} successfully",
            "document_id": document.id,
            "status": document.status.value
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Update document status error: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update document status: {str(e)}"
        )



class DocumentFilter(BaseModel):
    status: Optional[str] = None
    document_type: Optional[str] = None
    phone_number: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    page: int = 1
    limit: int = 20
@router.post("/api/v1/documents/search")
async def search_documents(
    filter_data: DocumentFilter,
    db: Session = Depends(get_db)
):
    """
    Search documents with advanced filters
    """
    try:
        offset = (filter_data.page - 1) * filter_data.limit

        query = db.query(DocumentVerification).filter(
            DocumentVerification.is_deleted == False
        )

        # Apply filters
        if filter_data.status:
            try:
                status_enum = DocumentStatus(filter_data.status)
                query = query.filter(DocumentVerification.status == status_enum)
            except ValueError:
                pass
        
        if filter_data.document_type:
            try:
                doc_enum = DocumentType(filter_data.document_type.upper())
                query = query.filter(DocumentVerification.document_type == doc_enum)
            except (KeyError, ValueError):
                pass
        
        if filter_data.phone_number:
            query = query.filter(
                DocumentVerification.phone_number.like(f"%{filter_data.phone_number}%")
            )
        
        if filter_data.start_date:
            try:
                start_date_obj = datetime.strptime(filter_data.start_date, "%Y-%m-%d")
                query = query.filter(DocumentVerification.submitted_at >= start_date_obj)
            except ValueError:
                pass
        
        if filter_data.end_date:
            try:
                end_date_obj = datetime.strptime(filter_data.end_date, "%Y-%m-%d")
                query = query.filter(DocumentVerification.submitted_at <= end_date_obj)
            except ValueError:
                pass
        
        total = query.count()
        documents = query.order_by(desc(DocumentVerification.submitted_at))\
                        .offset(offset).limit(filter_data.limit).all()
        
        result = []
        for doc in documents:
            user = db.query(User).filter(User.phone_number == doc.phone_number).first()
            
            result.append({
                "id": doc.id,
                "phone_number": doc.phone_number,
                "user_id": doc.user_id,
                "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
                "document_type": doc.document_type.value,
                "document_number": doc.document_number,
                "document_name": doc.document_name,
                "status": doc.status.value,
               "front_image_url": doc.front_image_path,
            "back_image_url": doc.back_image_path,
            "selfie_image_url": doc.selfie_image_path,
                "submitted_at": doc.submitted_at.isoformat() if doc.submitted_at else None,
                "verified_by": doc.verified_by,
                "verified_at": doc.verified_at.isoformat() if doc.verified_at else None
            })
        
        return {
            "success": True,
            "documents": result,
            "pagination": {
                "page": filter_data.page,
                "limit": filter_data.limit,
                "total": total,
                "pages": (total + filter_data.limit - 1) // filter_data.limit
            }
        }
        
    except Exception as e:
        print(f"❌ Search documents error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search documents: {str(e)}"
        )

@router.get("/api/v1/admin/documents/all")
async def get_all_documents(
    status: str = Query("all"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    userId: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        offset = (page - 1) * limit
        query = db.query(DocumentVerification)
        
        # Apply status filters
        if status == "pending":
            query = query.filter(DocumentVerification.status == "pending", DocumentVerification.is_deleted == False)
        elif status == "approved":
            query = query.filter(DocumentVerification.status == "approved", DocumentVerification.is_deleted == False)
        elif status == "rejected":
            query = query.filter(DocumentVerification.status == "rejected", DocumentVerification.is_deleted == False)
        elif status == "deleted":
            query = query.filter(DocumentVerification.is_deleted == True)
        elif status == "expired":
            # 🔧 FIX: Convert to date for comparison
            today = datetime.now(timezone.utc).date()
            query = query.filter(
                DocumentVerification.expiry_date < today,
                DocumentVerification.is_deleted == False
            )
        else:  # all
            query = query.filter(DocumentVerification.is_deleted == False)
        
        # Filter by user_id (string)
        if userId and userId != "all" and userId != "null" and userId.strip():
            query = query.filter(DocumentVerification.user_id == userId)
        
        # Search functionality
        if search:
            query = query.join(User, User.user_id == DocumentVerification.user_id).filter(
                or_(
                    User.full_name.ilike(f"%{search}%"),
                    User.phone_number.ilike(f"%{search}%"),
                    DocumentVerification.document_number.ilike(f"%{search}%")
                )
            )
        
        # Get total count
        total_count = query.count()
        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1
        
        # Get paginated results
        documents = query.order_by(desc(DocumentVerification.submitted_at)).offset(offset).limit(limit).all()
        
        documents_data = []
        for doc in documents:
            user = db.query(User).filter(User.user_id == doc.user_id).first()
            
            # 🔧 FIX: Check expired using date comparison
            is_expired = False
            if doc.expiry_date:
                today = datetime.now(timezone.utc).date()
                is_expired = doc.expiry_date < today
            
            documents_data.append({
                "id": doc.id,
                "document_type": doc.document_type,
                "document_number": doc.document_number,
                "document_name": doc.document_name,
                "status": doc.status,
                "rejection_reason": doc.rejection_reason,
                "user_id": doc.user_id,
                "user_name": user.full_name if user else "Unknown",
                "phone_number": user.phone_number if user else "N/A",
                "front_image_url": doc.front_image_url,
                "back_image_url": doc.back_image_url,
                "selfie_image_url": doc.selfie_image_url,
                "issue_date": doc.issue_date.isoformat() if doc.issue_date else None,
                "expiry_date": doc.expiry_date.isoformat() if doc.expiry_date else None,
                "submitted_at": doc.submitted_at.isoformat() if doc.submitted_at else None,
                "is_expired": is_expired,
                "is_deleted": doc.is_deleted
            })
        
        return {
            "success": True,
            "documents": documents_data,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_count,
                "pages": total_pages
            }
        }
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(500, str(e))


# ================= ADMIN - UPDATE DOCUMENT STATUS =================

class DocumentStatusUpdate(BaseModel):
    document_id: int
    status: str
    rejection_reason: Optional[str] = ""
    admin_username: str

@router.post("/api/v1/admin/documents/update-status")
async def update_document_status(
    request: DocumentStatusUpdate,
    db: Session = Depends(get_db)
):
    """Update document status (approve/reject/restore/soft-delete)"""
    try:
        document = db.query(DocumentVerification).filter(DocumentVerification.id == request.document_id).first()
        
        if not document:
            raise HTTPException(404, "Document not found")
        
        # Update based on status
        if request.status == "approved":
            document.status = "approved"
            document.rejection_reason = None
            document.is_deleted = False
        elif request.status == "rejected":
            document.status = "rejected"
            document.rejection_reason = request.rejection_reason
            document.is_deleted = False
        elif request.status == "deleted":
            document.is_deleted = True
            document.status = "deleted"
        elif request.status == "pending":
            document.is_deleted = False
            document.status = "pending"
        
        document.updated_at = datetime.now(timezone.utc)
        db.commit()
        
        return {
            "success": True,
            "message": f"Document {request.status} successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))


# ================= ADMIN - PERMANENT DELETE =================

class PermanentDeleteRequest(BaseModel):
    document_id: int

@router.delete("/api/v1/admin/documents/permanent-delete")
async def permanent_delete_document(
    request: PermanentDeleteRequest,
    db: Session = Depends(get_db)
):
    """Permanently delete document from database"""
    try:
        document = db.query(DocumentVerification).filter(DocumentVerification.id == request.document_id).first()
        
        if not document:
            raise HTTPException(404, "Document not found")
        
        db.delete(document)
        db.commit()
        
        return {
            "success": True,
            "message": "Document permanently deleted"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))


# ================= ADMIN - GET DOCUMENT STATISTICS =================
@router.get("/api/v1/admin/documents/stats")
async def get_document_stats(
    time_range: str = Query("all"),
    db: Session = Depends(get_db)
):
    try:
        # 🔧 FIX: Use date() for comparison
        today = datetime.now(timezone.utc).date()
        
        total = db.query(DocumentVerification).filter(DocumentVerification.is_deleted == False).count()
        pending = db.query(DocumentVerification).filter(DocumentVerification.status == "pending", DocumentVerification.is_deleted == False).count()
        approved = db.query(DocumentVerification).filter(DocumentVerification.status == "approved", DocumentVerification.is_deleted == False).count()
        rejected = db.query(DocumentVerification).filter(DocumentVerification.status == "rejected", DocumentVerification.is_deleted == False).count()
        deleted = db.query(DocumentVerification).filter(DocumentVerification.is_deleted == True).count()
        
        # 🔧 FIX: Compare date with date
        expired = db.query(DocumentVerification).filter(
            DocumentVerification.expiry_date < today,
            DocumentVerification.is_deleted == False
        ).count()
        
        return {
            "success": True,
            "stats": {
                "total": total,
                "pending": pending,
                "approved": approved,
                "rejected": rejected,
                "deleted": deleted,
                "expired": expired
            }
        }
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {"success": False, "message": str(e), "stats": {}}