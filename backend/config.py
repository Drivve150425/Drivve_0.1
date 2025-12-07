"""
DRIVVE API Configuration
"""
import os

class Settings:
    # API Settings
    API_TITLE = "DRIVVE API"
    API_VERSION = "2.0.1"
    API_DESCRIPTION = "DRIVVE Carpooling Application API"
    
    # Server Settings
    HOST = "0.0.0.0"  # Network accessible
    PORT = 8000
    DEBUG = True  # Set to False in production
    
    # Database Settings
    POSTGRES_USER = "postgres"
    POSTGRES_PASSWORD = "Drivve"
    POSTGRES_SERVER = "localhost"
    POSTGRES_PORT = "5432"
    POSTGRES_DB = "db_drivve"
    
    # CORS Settings
    ALLOWED_ORIGINS = [
        "*",  # Allow all for development
        "http://localhost:19000",
        "http://192.168.1.3:19000",
        "exp://192.168.1.3:19000"
    ]

settings = Settings()
