"""
Configuration settings for Game Price Tracker
"""

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///gametracker.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Redis configuration
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
    CACHE_TYPE = 'redis'
    CACHE_REDIS_URL = REDIS_URL
    
    # External API keys
    STEAM_API_KEY = os.getenv('STEAM_API_KEY')
    IGDB_CLIENT_ID = os.getenv('IGDB_CLIENT_ID')
    IGDB_CLIENT_SECRET = os.getenv('IGDB_CLIENT_SECRET')
    
    # Email configuration
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    
    # Rate limiting
    RATELIMIT_STORAGE_URL = REDIS_URL
    
    # Pagination
    GAMES_PER_PAGE = 20
    DEALS_PER_PAGE = 20
    
    # Background tasks
    PRICE_UPDATE_INTERVAL_HOURS = int(os.getenv('PRICE_UPDATE_INTERVAL_HOURS', 6))
    DEAL_DISCOVERY_INTERVAL_HOURS = int(os.getenv('DEAL_DISCOVERY_INTERVAL_HOURS', 2))

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_ECHO = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    
    # Security settings
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Database connection pooling
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 120,
        'pool_pre_ping': True
    }

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}