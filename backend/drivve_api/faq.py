from models import FAQ
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

from fastapi import APIRouter

router = APIRouter()
@router.get("/api/v1/support/faqs")
def get_faqs(
    category: str | None = None,
    db: Session = Depends(get_db)
):
    query = (
        db.query(FAQ)
        .filter(
            FAQ.is_active == True,
            FAQ.is_deleted == False
        )
    )

    if category:
        query = query.filter(FAQ.category == category)

    return [
        {
            "id": f.id,
            "category": f.category,
            "question": f.question,
            "answer": f.answer
        }
        for f in query.order_by(FAQ.id.asc()).all()
    ]
@router.get("/api/v1/support/faq-categories")
def get_faq_categories(db: Session = Depends(get_db)):
    categories = db.query(FAQ.category)\
        .filter(FAQ.is_active == True)\
        .distinct()\
        .order_by(FAQ.category.asc())\
        .all()

    return [c[0] for c in categories]