from datetime import date, datetime, timedelta, timezone
import os
from typing import List, Optional

from pydantic import BaseModel
from sqlalchemy import desc, func

from backend.admin_api import adminlog_activity
from backend.drivve_api.createprofile import build_image_url
from backend.drivve_api.document import get_document_icon
from models import  AboutUs, AdminUser, DocumentStatus, DocumentType, DocumentVerification, Ride, User, UserStatus, VerificationLog
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, Query, UploadFile
from drivve_api.app_config import create_app

# File validation constants
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
app = create_app()
async def validate_image_file(upload_file: UploadFile) -> bool:
    """Validate image file"""
    if not upload_file:
        return False
    
    # Check file size
    upload_file.file.seek(0, 2)  # Seek to end
    file_size = upload_file.file.tell()
    upload_file.file.seek(0)  # Reset to beginning
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Check file extension
    filename = upload_file.filename or ""
    file_extension = os.path.splitext(filename)[1].lower()
    
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check MIME type
    content_type = upload_file.content_type or ""
    if not content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is not an image"
        )
    
    return True


# ========================= PYDANTIC MODELS =========================

class DocumentUploadRequest(BaseModel):
    phone_number: str
    document_type: str
    document_number: str
    document_name: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    vehicle_number: Optional[str] = None
    document_data: Optional[dict] = None

class DocumentUpdateStatus(BaseModel):
    document_id: int
    status: str  # "approved", "rejected"
    rejection_reason: Optional[str] = None
    admin_username: str

class DocumentFilter(BaseModel):
    status: Optional[str] = None
    document_type: Optional[str] = None
    phone_number: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    page: int = 1
    limit: int = 20

class DocumentResponse(BaseModel):
    id: int
    phone_number: str
    user_id: Optional[str]
    document_type: str
    document_number: str
    document_name: str
    status: str
    front_image_url: Optional[str]
    back_image_url: Optional[str]
    selfie_image_url: Optional[str]
    issue_date: Optional[str]
    expiry_date: Optional[str]
    is_expired: bool
    submitted_at: str
    updated_at: Optional[str]
    verified_by: Optional[str]
    verified_at: Optional[str]
    rejection_reason: Optional[str]
    document_data: Optional[dict]

# ========================= DOCUMENT ENDPOINTS =========================

@app.get("/api/v1/documents/stats")
async def get_document_stats(
    time_range: str = Query("all", description="Time range: all, today, week, month"),
    db: Session = Depends(get_db)
):
    """
    Get document verification statistics
    """
    try:
        from sqlalchemy import func
        
        # Base query
        query = db.query(DocumentVerification)
        # .filter(
        #     DocumentVerification.is_deleted == False
        # )

        
        # Apply time filter
        today = datetime.now(timezone.utc).date()
        if time_range == "today":
            query = query.filter(func.date(DocumentVerification.submitted_at) == today)
        elif time_range == "week":
            week_ago = today - timedelta(days=7)
            query = query.filter(DocumentVerification.submitted_at >= week_ago)
        elif time_range == "month":
            month_ago = today - timedelta(days=30)
            query = query.filter(DocumentVerification.submitted_at >= month_ago)
        
        total = query.count()
        # pending = query.filter(DocumentVerification.status == DocumentStatus.PENDING).count()
        under_review = query.filter(DocumentVerification.status == DocumentStatus.UNDER_REVIEW).count()
        pending = query.filter(
            DocumentVerification.status == DocumentStatus.PENDING,
            DocumentVerification.is_deleted == False
        ).count()

        approved = query.filter(
            DocumentVerification.status == DocumentStatus.APPROVED,
            DocumentVerification.is_deleted == False
        ).count()

        rejected = query.filter(
            DocumentVerification.status == DocumentStatus.REJECTED,
            DocumentVerification.is_deleted == False
        ).count()

        deleted_document = query.filter(
            DocumentVerification.is_deleted == True
        ).count()


        expired = query.filter(DocumentVerification.is_expired == True).count()
        # deleted_document = query.filter(DocumentVerification.is_deleted == True).count()
        print("📊 Document Stats Query Executed", deleted_document)
        # Get counts by document type
        doc_type_counts = {}
        for doc_type in DocumentType:
            count = query.filter(DocumentVerification.document_type == doc_type).count()
            doc_type_counts[doc_type.value] = count
        
        # Get daily submissions for last 7 days
        daily_stats = []
        for i in range(6, -1, -1):
            date_val = today - timedelta(days=i)
            count = db.query(DocumentVerification).filter(
                func.date(DocumentVerification.submitted_at) == date_val
            ).count()
            daily_stats.append({
                "date": date_val.isoformat(),
                "count": count
            })
        
        return {
            "success": True,
            "stats": {
                "total": total,
                "pending": pending,
                "under_review": under_review,
                "approved": approved,
                "rejected": rejected,
                "expired": expired,
                "deleted": deleted_document,
                "approval_rate": round((approved / total * 100), 2) if total > 0 else 0,
                "rejection_rate": round((rejected / total * 100), 2) if total > 0 else 0
            },
            "document_type_stats": doc_type_counts,
            "daily_stats": daily_stats,
            "time_range": time_range
        }
        
    except Exception as e:
        print(f"❌ Get document stats error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get statistics: {str(e)}"
        )


@app.get("/api/v1/documents/pending")
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
                "status": getattr(doc.status, "value", doc.status),
                 "front_image_url": build_image_url(doc.front_image_path),
            "back_image_url": build_image_url(doc.back_image_path),
            "selfie_image_url": build_image_url(doc.selfie_image_path),
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

@app.post("/api/v1/documents/search")
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
                "document_type": getattr(doc.document_type, "value", doc.document_type),
                "document_number": doc.document_number,
                "document_name": doc.document_name,
                "status": getattr(doc.status, "value", doc.status),
               "front_image_url": build_image_url(doc.front_image_path),
            "back_image_url": build_image_url(doc.back_image_path),
            "selfie_image_url": build_image_url(doc.selfie_image_path),
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

@app.put("/api/v1/documents/status")
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

@app.put("/api/v1/documents/{document_id}/review")
async def request_document_review(
    document_id: int,
    admin_username: str,
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Request additional review for document
    """
    try:
        document = db.query(DocumentVerification).filter(
            DocumentVerification.id == document_id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document.status = DocumentStatus.UNDER_REVIEW
        document.verified_by = admin_username
        document.updated_at = datetime.now(timezone.utc)

        
        # Log the action
        log = VerificationLog(
            document_id=document.id,
            admin_id=1,
            action="request_review",
            notes=notes or "Additional information requested"
        )
        db.add(log)
        
        db.commit()
        
        return {
            "success": True,
            "message": "Document marked for review",
            "document_id": document.id,
            "status": document.status.value
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Request document review error: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to request document review: {str(e)}"
        )

@app.get("/api/v1/documents/expiring-soon")
async def get_expiring_documents(
    days_threshold: int = 30,
    db: Session = Depends(get_db)
):
    """
    Get documents expiring soon
    """
    try:
        today = date.today()
        threshold_date = today + timedelta(days=days_threshold)
        
        documents = db.query(DocumentVerification).filter(
            DocumentVerification.expiry_date.isnot(None),
            DocumentVerification.expiry_date >= today,
            DocumentVerification.expiry_date <= threshold_date,
            DocumentVerification.status == DocumentStatus.APPROVED,
            DocumentVerification.is_deleted == False   # ✅ ADD
        ).order_by(DocumentVerification.expiry_date.asc()).all()
        
        result = []
        for doc in documents:
            user = db.query(User).filter(User.phone_number == doc.phone_number).first()
            
            # Calculate days until expiry
            days_until_expiry = (doc.expiry_date - today).days
            
            result.append({
                "id": doc.id,
                "phone_number": doc.phone_number,
                "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
                "document_type": getattr(doc.document_type, "value", doc.document_type),
                "document_number": doc.document_number,
                "document_name": doc.document_name,
                "expiry_date": doc.expiry_date.isoformat(),
                "days_until_expiry": days_until_expiry,
                "is_expired": doc.is_expired
            })
        
        return {
            "success": True,
            "documents": result,
            "total": len(result),
            "threshold_days": days_threshold
        }
        
    except Exception as e:
        print(f"❌ Get expiring documents error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch expiring documents: {str(e)}"
        )

@app.post("/api/v1/documents/bulk-action")
async def bulk_action_documents(
    document_ids: List[int],
    action: str,  # approve, reject, delete, mark_review
    admin_username: str,
    rejection_reason: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Perform bulk actions on documents
    """
    try:
        if not document_ids:
            raise HTTPException(status_code=400, detail="No documents selected")
        
        if action not in ["approve", "reject", "delete", "mark_review"]:
            raise HTTPException(status_code=400, detail="Invalid action")
        
        success_count = 0
        failed_count = 0
        results = []
        
        for doc_id in document_ids:
            try:
                document = db.query(DocumentVerification).filter(
                    DocumentVerification.id == doc_id
                ).first()
                
                if not document:
                    results.append({"id": doc_id, "success": False, "message": "Document not found"})
                    failed_count += 1
                    continue
                
                if action == "approve":
                    document.status = DocumentStatus.APPROVED
                    document.verified_by = admin_username
                    document.verified_at = datetime.now(timezone.utc)

                    document.rejection_reason = None
                    
                    log = VerificationLog(
                        document_id=document.id,
                        admin_id=1,
                        action="approve",
                        notes="Bulk approval"
                    )
                    db.add(log)
                    
                elif action == "reject":
                    if not rejection_reason:
                        results.append({"id": doc_id, "success": False, "message": "Rejection reason required"})
                        failed_count += 1
                        continue
                    
                    document.status = DocumentStatus.REJECTED
                    document.verified_by = admin_username
                    document.verified_at = datetime.now(timezone.utc)

                    document.rejection_reason = rejection_reason
                    
                    log = VerificationLog(
                        document_id=document.id,
                        admin_id=1,
                        action="reject",
                        notes=f"Bulk rejection: {rejection_reason}"
                    )
                    db.add(log)
                    
                elif action == "mark_review":
                    document.status = DocumentStatus.UNDER_REVIEW
                    
                    log = VerificationLog(
                        document_id=document.id,
                        admin_id=1,
                        action="request_review",
                        notes="Bulk review request"
                    )
                    db.add(log)
                    
                elif action == "delete":
                    # Check if approved
                    if document.status == DocumentStatus.APPROVED:
                        results.append({"id": doc_id, "success": False, "message": "Cannot delete approved document"})
                        failed_count += 1
                        continue
                    
                    # Delete files
                    try:
                        if document.front_image_path and os.path.exists(document.front_image_path):
                            os.remove(document.front_image_path)
                        if document.back_image_path and os.path.exists(document.back_image_path):
                            os.remove(document.back_image_path)
                        if document.selfie_image_path and os.path.exists(document.selfie_image_path):
                            os.remove(document.selfie_image_path)
                    except Exception as e:
                        print(f"⚠️ File deletion error for doc {doc_id}: {e}")
                    
                    log = VerificationLog(
                        document_id=document.id,
                        admin_id=1,
                        action="delete",
                        notes=f"Bulk deletion by {admin_username}"
                    )
                    db.add(log)
                    
                    db.delete(document)
                
                document.updated_at = datetime.now(timezone.utc)

                success_count += 1
                results.append({"id": doc_id, "success": True, "message": f"Document {action}d"})
                
            except Exception as e:
                results.append({"id": doc_id, "success": False, "message": str(e)})
                failed_count += 1
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Bulk action completed: {success_count} successful, {failed_count} failed",
            "total": len(document_ids),
            "success_count": success_count,
            "failed_count": failed_count,
            "results": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Bulk action error: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to perform bulk action: {str(e)}"
        )

@app.get("/api/v1/documents/recent-activity")
async def get_recent_activity(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get recent document verification activity
    """
    try:
        # Get recent document updates
        documents = db.query(DocumentVerification).filter(
            DocumentVerification.updated_at.isnot(None)
        ).order_by(desc(DocumentVerification.updated_at)).limit(limit).all()
        
        # Get recent verification logs
        logs = db.query(VerificationLog).order_by(
            desc(VerificationLog.created_at)
        ).limit(limit).all()
        
        activity = []
        
        # Add document updates
        for doc in documents:
            if doc.updated_at:
                user = db.query(User).filter(User.phone_number == doc.phone_number).first()
                
                activity.append({
                    "type": "document_update",
                    "document_id": doc.id,
                    "document_type": getattr(doc.document_type, "value", doc.document_type),
                    "document_number": doc.document_number,
                    "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
                    "action": f"Status changed to {doc.status.value}",
                    "timestamp": doc.updated_at.isoformat(),
                    "icon": get_document_icon(doc.document_type.value)
                })
        
        # Add verification logs
        for log in logs:
            doc = db.query(DocumentVerification).filter(
                DocumentVerification.id == log.document_id
            ).first()
            
            if doc:
                user = db.query(User).filter(User.phone_number == doc.phone_number).first()
                admin = db.query(AdminUser).filter(AdminUser.id == log.admin_id).first()
                
                activity.append({
                    "type": "verification_log",
                    "document_id": doc.id,
                    "document_type": getattr(doc.document_type, "value", doc.document_type),
                    "document_number": doc.document_number,
                    "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
                    "admin_name": admin.full_name if admin else "Unknown",
                    "action": log.action,
                    "notes": log.notes,
                    "timestamp": log.created_at.isoformat() if log.created_at else None,
                    "icon": "clipboard-check" if log.action == "approve" else "exclamation-triangle"
                })
        
        # Sort by timestamp
        activity.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return {
            "success": True,
            "activity": activity[:limit],
            "total": len(activity)
        }
        
    except Exception as e:
        print(f"❌ Get recent activity error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch recent activity: {str(e)}"
        )
@app.get("/api/v1/admin/documents")
def admin_list_documents(
    status: str = "pending",
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(DocumentVerification).filter(
        DocumentVerification.is_deleted == False
    )

    if status != "all":
        query = query.filter(
            DocumentVerification.status == DocumentStatus(status)
        )

    total = query.count()

    docs = (
        query
        .order_by(DocumentVerification.submitted_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    result = []
    for doc in docs:
        user = db.query(User).filter(
            User.phone_number == doc.phone_number
        ).first()

        result.append({
            "id": doc.id,
            "phone_number": doc.phone_number,
            "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
            "document_type": getattr(doc.document_type, "value", doc.document_type),
            "document_number": doc.document_number,
            "status": getattr(doc.status, "value", doc.status),
            "submitted_at": doc.submitted_at.isoformat(),
           "front_image_url": build_image_url(doc.front_image_path),
            "back_image_url": build_image_url(doc.back_image_path),
            "selfie_image_url": build_image_url(doc.selfie_image_path),
            "rejection_reason": doc.rejection_reason
        })

    return {
        "documents": result,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total
        }
    }
class DocumentUpdateStatus(BaseModel):
    document_id: int
    status: str                # approved | rejected
    rejection_reason: Optional[str] = None
    admin_username: str
@app.put("/api/v1/documents/status")
def update_document_status(
    data: DocumentUpdateStatus,
    db: Session = Depends(get_db)
):
    document = db.query(DocumentVerification).filter(
        DocumentVerification.id == data.document_id
    ).first()

    if not document:
        raise HTTPException(404, "Document not found")

    if data.status == "approved":
        document.status = DocumentStatus.APPROVED
        document.rejection_reason = None

    elif data.status == "rejected":
        if not data.rejection_reason:
            raise HTTPException(400, "Rejection reason required")
        document.status = DocumentStatus.REJECTED
        document.rejection_reason = data.rejection_reason

    else:
        raise HTTPException(400, "Invalid status")

    document.verified_by = data.admin_username
    document.verified_at = datetime.now(timezone.utc)
    document.updated_at = datetime.now(timezone.utc)

    # 🔒 Audit log
    db.add(
        VerificationLog(
            document_id=document.id,
            admin_id=1,  # replace with admin session id later
            action=data.status,
            notes=data.rejection_reason
        )
    )
    adminlog_activity(
        db,
        module="DOCUMENT_VERIFICATION",
        action=data.status.upper(),
        entity_id=document.id,
        entity_name=document.document_name,
        description=f"Document ID {document.id} marked as {data.status}"
    )
    db.commit()

    return {
        "success": True,
        "document_id": document.id,
        "status": document.status.value
    }
@app.get("/api/v1/admin/documents/{document_id}/history")
def get_document_history(
    document_id: int,
    db: Session = Depends(get_db)
):
    logs = (
        db.query(VerificationLog)
        .filter(VerificationLog.document_id == document_id)
        .order_by(VerificationLog.created_at.desc())
        .all()
    )
    adminlog_activity(
        db,
        module="DOCUMENT_VERIFICATION",
        action="VIEW_HISTORY",
        entity_id=document_id,
        description=f"Viewed verification history for document ID {document_id}"
    )
    return [
        {
            "id": log.id,
            "action": log.action,
            "notes": log.notes,
            "created_at": log.created_at.isoformat()
        }
        for log in logs
    ]
@app.put("/api/v1/admin/documents/{document_id}/review")
def mark_under_review(
    document_id: int,
    admin_username: str,
    db: Session = Depends(get_db)
):
    doc = db.query(DocumentVerification).get(document_id)

    if not doc:
        raise HTTPException(404, "Document not found")

    doc.status = DocumentStatus.UNDER_REVIEW
    doc.verified_by = admin_username
    doc.updated_at = datetime.now(timezone.utc)

    db.add(
        VerificationLog(
            document_id=doc.id,
            admin_id=1,
            action="under_review",
            notes="Marked under review"
        )
    )
    adminlog_activity(
        db,
        module="DOCUMENT_VERIFICATION",
        action="UNDER_REVIEW",
        entity_id=doc.id,
        entity_name=doc.document_name,
        description=f"Document ID {doc.id} marked as under review"
    )
    db.commit()
    return {"success": True}

@app.get("/api/v1/admin/documen/stats")
def admin_user_stats(db: Session = Depends(get_db)):

    total_users = db.query(User).count()

    active_users = db.query(User).filter(
        User.status == UserStatus.ACTIVE
    ).count()

    suspended_users = db.query(User).filter(
        User.status == UserStatus.SUSPENDED
    ).count()

   

    daily_rides = db.query(Ride).filter(
        func.date(Ride.created_at) == date.today()
    ).count()

    return {
        "stats": {
            "total_users": total_users,
            "active_users": active_users,
            "suspended_users": suspended_users,
            "daily_rides": daily_rides
        }
    }


@app.get("/api/v1/admin/documents/deleted")
def admin_list_deleted_documents(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    document_type: Optional[str] = None,
    phone_number: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Admin: Get ONLY deleted documents
    """

    query = db.query(DocumentVerification).filter(
        DocumentVerification.is_deleted == True
    )

    # 🔹 Optional filters
    if document_type:
        try:
            query = query.filter(
                DocumentVerification.document_type == DocumentType(document_type.upper())
            )
        except ValueError:
            raise HTTPException(400, "Invalid document type")

    if phone_number:
        query = query.filter(DocumentVerification.phone_number.contains(phone_number))

    if start_date:
        try:
            query = query.filter(
                DocumentVerification.deleted_at >= datetime.strptime(start_date, "%Y-%m-%d")
            )
        except ValueError:
            raise HTTPException(400, "Invalid start_date format (YYYY-MM-DD)")

    if end_date:
        try:
            query = query.filter(
                DocumentVerification.deleted_at <= datetime.strptime(end_date, "%Y-%m-%d")
            )
        except ValueError:
            raise HTTPException(400, "Invalid end_date format (YYYY-MM-DD)")
    
    total = query.count()

    docs = (
        query
        .order_by(DocumentVerification.deleted_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    result = []
    for doc in docs:
        user = db.query(User).filter(
            User.phone_number == doc.phone_number
        ).first()

        result.append({
            "id": doc.id,
            "phone_number": doc.phone_number,
            "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
            "document_type": getattr(doc.document_type, "value", doc.document_type),
            "document_number": doc.document_number,
            "status": "deleted",
            "deleted_at": doc.deleted_at.isoformat() if doc.deleted_at else None,
            "deleted_by": doc.deleted_by,
            "submitted_at": doc.submitted_at.isoformat() if doc.submitted_at else None,
            "front_image_url": build_image_url(doc.front_image_path),
            "back_image_url": build_image_url(doc.back_image_path),
            "selfie_image_url": build_image_url(doc.selfie_image_path),
            "rejection_reason": doc.rejection_reason
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