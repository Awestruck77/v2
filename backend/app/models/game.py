"""
Game-related database models
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import List, Optional

from app.core.database import Base


class Game(Base):
    """Game model"""
    __tablename__ = "games"
    
    id = Column(Integer, primary_key=True, index=True)
    igdb_id = Column(Integer, unique=True, nullable=True, index=True)
    steam_app_id = Column(Integer, unique=True, nullable=True, index=True)
    
    # Basic game information
    title = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Metadata
    release_date = Column(DateTime, nullable=True)
    developer = Column(String(255), nullable=True)
    publisher = Column(String(255), nullable=True)
    genres = Column(String(500), nullable=True)  # JSON string
    platforms = Column(String(500), nullable=True)  # JSON string
    
    # Images
    cover_image_url = Column(String(500), nullable=True)
    header_image_url = Column(String(500), nullable=True)
    screenshots = Column(Text, nullable=True)  # JSON string
    
    # Ratings
    metacritic_score = Column(Integer, nullable=True)
    user_rating = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    deals = relationship("Deal", back_populates="game", cascade="all, delete-orphan")
    game_stores = relationship("GameStore", back_populates="game", cascade="all, delete-orphan")
    wishlist_items = relationship("UserWishlist", back_populates="game")
    price_alerts = relationship("PriceAlert", back_populates="game")
    
    # Indexes
    __table_args__ = (
        Index('idx_game_title_search', 'title'),
        Index('idx_game_release_date', 'release_date'),
        Index('idx_game_metacritic', 'metacritic_score'),
    )


class Store(Base):
    """Store model"""
    __tablename__ = "stores"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    base_url = Column(String(255), nullable=False)
    logo_url = Column(String(500), nullable=True)
    
    # Store configuration
    is_active = Column(Boolean, default=True)
    supports_regions = Column(String(500), nullable=True)  # JSON string
    
    # API configuration
    api_endpoint = Column(String(255), nullable=True)
    rate_limit_per_minute = Column(Integer, default=60)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    deals = relationship("Deal", back_populates="store")
    game_stores = relationship("GameStore", back_populates="store")


class GameStore(Base):
    """Game availability on specific stores"""
    __tablename__ = "game_stores"
    
    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    
    # Store-specific identifiers
    store_game_id = Column(String(255), nullable=True)  # Store's internal ID
    store_url = Column(String(500), nullable=True)
    
    # Availability
    is_available = Column(Boolean, default=True)
    release_date_store = Column(DateTime, nullable=True)
    
    # Current pricing
    current_price = Column(Float, nullable=True)
    original_price = Column(Float, nullable=True)
    discount_percentage = Column(Float, nullable=True)
    currency = Column(String(3), default="USD")
    region = Column(String(2), default="US")
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_price_check = Column(DateTime, nullable=True)
    
    # Relationships
    game = relationship("Game", back_populates="game_stores")
    store = relationship("Store", back_populates="game_stores")
    
    # Indexes
    __table_args__ = (
        Index('idx_game_store_unique', 'game_id', 'store_id', unique=True),
        Index('idx_game_store_price', 'current_price'),
        Index('idx_game_store_discount', 'discount_percentage'),
    )


class Deal(Base):
    """Price deals and historical data"""
    __tablename__ = "deals"
    
    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    
    # Deal information
    title = Column(String(255), nullable=False)
    deal_url = Column(String(500), nullable=False)
    
    # Pricing
    sale_price = Column(Float, nullable=False)
    normal_price = Column(Float, nullable=False)
    savings_percentage = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    region = Column(String(2), default="US")
    
    # Deal metadata
    deal_rating = Column(Float, nullable=True)
    is_on_sale = Column(Boolean, default=True)
    deal_start_date = Column(DateTime, nullable=True)
    deal_end_date = Column(DateTime, nullable=True)
    
    # External identifiers
    external_deal_id = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    game = relationship("Game", back_populates="deals")
    store = relationship("Store", back_populates="deals")
    
    # Indexes
    __table_args__ = (
        Index('idx_deal_price', 'sale_price'),
        Index('idx_deal_savings', 'savings_percentage'),
        Index('idx_deal_active', 'is_on_sale'),
        Index('idx_deal_created', 'created_at'),
    )