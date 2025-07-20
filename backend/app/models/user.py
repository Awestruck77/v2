"""
User-related database models
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

from app.core.database import Base


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=True, index=True)
    
    # Authentication
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Profile
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Preferences
    preferred_currency = Column(String(3), default="USD")
    preferred_region = Column(String(2), default="US")
    theme_preference = Column(String(20), default="dark")
    
    # Notification settings
    email_notifications = Column(Boolean, default=True)
    price_alert_notifications = Column(Boolean, default=True)
    deal_notifications = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    wishlist_items = relationship("UserWishlist", back_populates="user", cascade="all, delete-orphan")
    price_alerts = relationship("PriceAlert", back_populates="user", cascade="all, delete-orphan")


class UserWishlist(Base):
    """User wishlist items"""
    __tablename__ = "user_wishlist"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    
    # Wishlist metadata
    added_at = Column(DateTime, default=func.now())
    notes = Column(Text, nullable=True)
    priority = Column(Integer, default=1)  # 1=low, 2=medium, 3=high
    
    # Price tracking
    target_price = Column(Float, nullable=True)
    target_discount = Column(Float, nullable=True)  # Percentage
    
    # Relationships
    user = relationship("User", back_populates="wishlist_items")
    game = relationship("Game", back_populates="wishlist_items")
    
    # Unique constraint
    __table_args__ = (
        {"sqlite_on_conflict": "IGNORE"},
    )


class PriceAlert(Base):
    """Price alerts for games"""
    __tablename__ = "price_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    
    # Alert configuration
    target_price = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    region = Column(String(2), default="US")
    
    # Alert status
    is_active = Column(Boolean, default=True)
    is_triggered = Column(Boolean, default=False)
    triggered_at = Column(DateTime, nullable=True)
    triggered_price = Column(Float, nullable=True)
    triggered_store = Column(String(100), nullable=True)
    
    # Notification settings
    email_sent = Column(Boolean, default=False)
    email_sent_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="price_alerts")
    game = relationship("Game", back_populates="price_alerts")