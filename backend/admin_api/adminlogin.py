
from datetime import datetime, timezone

from pydantic import BaseModel
from backend.models import AdminUser
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from drivve_api.app_config import create_app
from passlib.context import CryptContext

app = create_app()
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminLoginResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    is_superadmin: bool
    permissions: list
# main.py


@app.post("/api/v1/admin/login", response_model=AdminLoginResponse)
def admin_login(data: AdminLoginRequest, db: Session = Depends(get_db)):

    admin = db.query(AdminUser).filter(
        AdminUser.username == data.username,
        AdminUser.is_active == True
    ).first()

    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Update last login
    admin.last_login = datetime.now(timezone.utc)
    db.commit()

    return AdminLoginResponse(
        id=admin.id,
        username=admin.username,
        full_name=admin.full_name,
        email=admin.email,
        is_superadmin=admin.is_superadmin,
        permissions=admin.permissions or []
    )
# main.py

