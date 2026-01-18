from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timezone
from typing import Optional

from database import get_db
from models import (
    DocumentVerification,
    DocumentStatus,
    DocumentType,
    User,
    VerificationLog
)

# =========================
# APP INIT
# =========================

app = FastAPI(
    title="Admin Document Approval API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# STATIC FILES (IMAGES)
# =========================

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# =========================
# HEALTH
# =========================

@app.get("/")
def root():
    return {
        "status": "Admin Document API Running",
        "time": datetime.now(timezone.utc)
    }

# =========================
# GET PENDING DOCUMENTS
# =========================

@app.get("/api/v1/documents/pending")
def get_pending_documents(
    status: str = Query("pending"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db)
):
    offset = (page - 1) * limit

    query = db.query(DocumentVerification)

    # Status filter
    if status == "pending":
        query = query.filter(DocumentVerification.status == DocumentStatus.PENDING)
    elif status == "under_review":
        query = query.filter(DocumentVerification.status == DocumentStatus.UNDER_REVIEW)
    elif status == "all":
        pass
    else:
        raise HTTPException(400, "Invalid status")

    total = query.count()

    rows = (
        query
        .order_by(desc(DocumentVerification.submitted_at))
        .offset(offset)
        .limit(limit)
        .all()
    )

    documents = []
    for doc in rows:
        user = db.query(User).filter(
            User.phone_number == doc.phone_number
        ).first()

        documents.append({
            "id": doc.id,
            "phone_number": doc.phone_number,
            "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
            "document_type": doc.document_type.value.upper(),
            "document_number": doc.document_number,
            "document_name": doc.document_name,
            "status": doc.status.value,
            "front_image_url": f"/{doc.front_image_path}",
            "back_image_url": f"/{doc.back_image_path}" if doc.back_image_path else None,
            "selfie_image_url": f"/{doc.selfie_image_path}",
            "submitted_at": doc.submitted_at.isoformat(),
            "rejection_reason": doc.rejection_reason
        })

    return {
        "success": True,
        "documents": documents,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }

# =========================
# APPROVE / REJECT DOCUMENT
# =========================

@app.put("/api/v1/documents/status")
def update_document_status(
    payload: dict,
    db: Session = Depends(get_db)
):
    document_id = payload.get("document_id")
    status = payload.get("status")
    rejection_reason = payload.get("rejection_reason")
    admin_username = payload.get("admin_username", "admin")

    if not document_id or not status:
        raise HTTPException(400, "document_id and status required")

    doc = db.query(DocumentVerification).filter(
        DocumentVerification.id == document_id
    ).first()

    if not doc:
        raise HTTPException(404, "Document not found")

    if status == "approved":
        doc.status = DocumentStatus.APPROVED
        doc.verified_by = admin_username
        doc.verified_at = datetime.now(timezone.utc)
        doc.rejection_reason = None

        log = VerificationLog(
            document_id=doc.id,
            admin_id=1,
            action="approve",
            notes="Approved by admin"
        )
        db.add(log)

    elif status == "rejected":
        if not rejection_reason:
            raise HTTPException(400, "Rejection reason required")

        doc.status = DocumentStatus.REJECTED
        doc.verified_by = admin_username
        doc.verified_at = datetime.now(timezone.utc)
        doc.rejection_reason = rejection_reason

        log = VerificationLog(
            document_id=doc.id,
            admin_id=1,
            action="reject",
            notes=rejection_reason
        )
        db.add(log)

    elif status == "under_review":
        doc.status = DocumentStatus.UNDER_REVIEW

        log = VerificationLog(
            document_id=doc.id,
            admin_id=1,
            action="under_review",
            notes="Marked for review"
        )
        db.add(log)

    else:
        raise HTTPException(400, "Invalid status")

    doc.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "success": True,
        "message": f"Document {status} successfully",
        "document_id": doc.id,
        "status": doc.status.value
    }

# =========================
# RUN SERVER
# =========================

if __name__ == "__main__":
    import uvicorn

    print("🚀 Admin Document Approval Server Started")
    print("🌐 http://localhost:8000")
    print("📚 http://localhost:8000/docs")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True
    )
