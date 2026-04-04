from models import AboutUs
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

from fastapi import APIRouter

router = APIRouter()

@router.get("/api/v1/about-us")
def get_about_us(db: Session = Depends(get_db)):
    records = (
        db.query(AboutUs)
        .filter(
            AboutUs.is_active == True,
            AboutUs.is_deleted == False
        )
        .order_by(AboutUs.sort_order.asc(), AboutUs.id.asc())
        .all()
    )

    return [
        {
            "id": r.id,
            "title": r.title,
            "content": r.content
        }
        for r in records
    ]
