from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database configuration - CORRECTED
POSTGRES_USER = "postgres.stohdpgkkhdfrvfwcrzd"
POSTGRES_PASSWORD = "Shandrivve2026"  # Your actual password ✅
POSTGRES_SERVER = "aws-1-ap-southeast-2.pooler.supabase.com"  # Changed from "db" to "localhost" 
POSTGRES_PORT = "6543"
POSTGRES_DB = "postgres"  # Your database name ✅

# Create database URL
DATABASE_URL=f"postgresql://postgres.stohdpgkkhdfrvfwcrzd:Shandrivve2026@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"
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
# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker

# # Azure PostgreSQL configuration
# POSTGRES_USER = "socialdrivve"
# POSTGRES_PASSWORD = "Drivve%402026"
# POSTGRES_SERVER = "drivvedb.postgres.database.azure.com"
# POSTGRES_PORT = "5432"
# POSTGRES_DB = "postgres"

# # Azure database URL
# DATABASE_URL = (
#     f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
#     f"@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
#     f"?sslmode=require"
# )

# print(f"🔗 DATABASE_URL: {DATABASE_URL}")

# # Create engine
# engine = create_engine(
#     DATABASE_URL,
#     echo=True
# )

# # Session
# SessionLocal = sessionmaker(
#     autocommit=False,
#     autoflush=False,
#     bind=engine
# )

# # Base model
# Base = declarative_base()

# # Dependency
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()