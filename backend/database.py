from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database configuration - CORRECTED
POSTGRES_USER = "postgres"
POSTGRES_PASSWORD = "drivve"  # Your actual password ✅
POSTGRES_SERVER = "localhost"  # Changed from "db" to "localhost" 
POSTGRES_PORT = "5432"
POSTGRES_DB = "drivve_db"  # Your database name ✅

# Create database URL
DATABASE_URL = f"postgresql://postgres:drivve@localhost:5432/drivve_db"

print(f"🔗 DATABASE_URL: {DATABASE_URL}")  # For debugging

# Create engine
engine = create_engine(DATABASE_URL, echo=True)  # Added echo for debugging

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
