"""
Configuration settings for the Game Price Tracker API
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "Game Price Tracker"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = "sqlite:///./gametracker.db"
    
    # External APIs
    IGDB_CLIENT_ID: Optional[str] = None
    IGDB_CLIENT_SECRET: Optional[str] = None
    STEAM_API_KEY: Optional[str] = None
    
    # CORS and Security
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Redis (for caching and background tasks)
    REDIS_URL: str = "redis://localhost:6379"
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Background tasks
    PRICE_UPDATE_INTERVAL_HOURS: int = 6
    DEAL_DISCOVERY_INTERVAL_HOURS: int = 2
    
    # Email notifications (optional)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()

# Validate required settings in production
if settings.ENVIRONMENT == "production":
    required_settings = [
        "SECRET_KEY",
        "DATABASE_URL",
        "IGDB_CLIENT_ID",
        "IGDB_CLIENT_SECRET"
    ]
    
    missing_settings = []
    for setting in required_settings:
        if not getattr(settings, setting):
            missing_settings.append(setting)
    
    if missing_settings:
        raise ValueError(f"Missing required settings: {', '.join(missing_settings)}")