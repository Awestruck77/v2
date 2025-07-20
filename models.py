"""
Database models for Game Price Tracker
"""

from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy import Index

db = SQLAlchemy()

class User(UserMixin, db.Model):
    """User model"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    username = db.Column(db.String(100), unique=True, nullable=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Profile
    first_name = db.Column(db.String(100), nullable=True)
    last_name = db.Column(db.String(100), nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    
    # Preferences
    preferred_currency = db.Column(db.String(3), default='USD')
    preferred_region = db.Column(db.String(2), default='US')
    theme_preference = db.Column(db.String(20), default='game')
    
    # Notification settings
    email_notifications = db.Column(db.Boolean, default=True)
    price_alert_notifications = db.Column(db.Boolean, default=True)
    deal_notifications = db.Column(db.Boolean, default=False)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    wishlist_items = db.relationship('UserWishlist', back_populates='user', cascade='all, delete-orphan')
    price_alerts = db.relationship('PriceAlert', back_populates='user', cascade='all, delete-orphan')

class Store(db.Model):
    """Store model"""
    __tablename__ = 'stores'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    base_url = db.Column(db.String(255), nullable=False)
    logo_url = db.Column(db.String(500), nullable=True)
    
    # Store configuration
    is_active = db.Column(db.Boolean, default=True)
    supports_regions = db.Column(db.Text, nullable=True)  # JSON string
    
    # API configuration
    api_endpoint = db.Column(db.String(255), nullable=True)
    rate_limit_per_minute = db.Column(db.Integer, default=60)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    deals = db.relationship('Deal', back_populates='store')
    game_stores = db.relationship('GameStore', back_populates='store')

class Game(db.Model):
    """Game model"""
    __tablename__ = 'games'
    
    id = db.Column(db.Integer, primary_key=True)
    igdb_id = db.Column(db.Integer, unique=True, nullable=True, index=True)
    steam_app_id = db.Column(db.Integer, unique=True, nullable=True, index=True)
    
    # Basic game information
    title = db.Column(db.String(255), nullable=False, index=True)
    slug = db.Column(db.String(255), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    
    # Metadata
    release_date = db.Column(db.DateTime, nullable=True)
    developer = db.Column(db.String(255), nullable=True)
    publisher = db.Column(db.String(255), nullable=True)
    genres = db.Column(db.Text, nullable=True)  # JSON string
    platforms = db.Column(db.Text, nullable=True)  # JSON string
    
    # Images
    cover_image_url = db.Column(db.String(500), nullable=True)
    header_image_url = db.Column(db.String(500), nullable=True)
    screenshots = db.Column(db.Text, nullable=True)  # JSON string
    
    # Ratings
    metacritic_score = db.Column(db.Integer, nullable=True)
    user_rating = db.Column(db.Float, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    deals = db.relationship('Deal', back_populates='game', cascade='all, delete-orphan')
    game_stores = db.relationship('GameStore', back_populates='game', cascade='all, delete-orphan')
    wishlist_items = db.relationship('UserWishlist', back_populates='game')
    price_alerts = db.relationship('PriceAlert', back_populates='game')
    
    # Indexes
    __table_args__ = (
        Index('idx_game_title_search', 'title'),
        Index('idx_game_release_date', 'release_date'),
        Index('idx_game_metacritic', 'metacritic_score'),
    )

class GameStore(db.Model):
    """Game availability on specific stores"""
    __tablename__ = 'game_stores'
    
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'), nullable=False)
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    
    # Store-specific identifiers
    store_game_id = db.Column(db.String(255), nullable=True)
    store_url = db.Column(db.String(500), nullable=True)
    
    # Availability
    is_available = db.Column(db.Boolean, default=True)
    release_date_store = db.Column(db.DateTime, nullable=True)
    
    # Current pricing
    current_price = db.Column(db.Float, nullable=True)
    original_price = db.Column(db.Float, nullable=True)
    discount_percentage = db.Column(db.Float, nullable=True)
    currency = db.Column(db.String(3), default='USD')
    region = db.Column(db.String(2), default='US')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_price_check = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    game = db.relationship('Game', back_populates='game_stores')
    store = db.relationship('Store', back_populates='game_stores')
    
    # Indexes
    __table_args__ = (
        Index('idx_game_store_unique', 'game_id', 'store_id', unique=True),
        Index('idx_game_store_price', 'current_price'),
        Index('idx_game_store_discount', 'discount_percentage'),
    )

class Deal(db.Model):
    """Price deals and historical data"""
    __tablename__ = 'deals'
    
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'), nullable=False)
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    
    # Deal information
    title = db.Column(db.String(255), nullable=False)
    deal_url = db.Column(db.String(500), nullable=False)
    
    # Pricing
    sale_price = db.Column(db.Float, nullable=False)
    normal_price = db.Column(db.Float, nullable=False)
    savings_percentage = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    region = db.Column(db.String(2), default='US')
    
    # Deal metadata
    deal_rating = db.Column(db.Float, nullable=True)
    is_on_sale = db.Column(db.Boolean, default=True)
    deal_start_date = db.Column(db.DateTime, nullable=True)
    deal_end_date = db.Column(db.DateTime, nullable=True)
    
    # External identifiers
    external_deal_id = db.Column(db.String(255), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    game = db.relationship('Game', back_populates='deals')
    store = db.relationship('Store', back_populates='deals')
    
    # Indexes
    __table_args__ = (
        Index('idx_deal_price', 'sale_price'),
        Index('idx_deal_savings', 'savings_percentage'),
        Index('idx_deal_active', 'is_on_sale'),
        Index('idx_deal_created', 'created_at'),
    )

class UserWishlist(db.Model):
    """User wishlist items"""
    __tablename__ = 'user_wishlist'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'), nullable=False)
    
    # Wishlist metadata
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text, nullable=True)
    priority = db.Column(db.Integer, default=1)  # 1=low, 2=medium, 3=high
    
    # Price tracking
    target_price = db.Column(db.Float, nullable=True)
    target_discount = db.Column(db.Float, nullable=True)  # Percentage
    
    # Relationships
    user = db.relationship('User', back_populates='wishlist_items')
    game = db.relationship('Game', back_populates='wishlist_items')
    
    # Unique constraint
    __table_args__ = (
        Index('idx_user_game_wishlist', 'user_id', 'game_id', unique=True),
    )

class PriceAlert(db.Model):
    """Price alerts for games"""
    __tablename__ = 'price_alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'), nullable=False)
    
    # Alert configuration
    target_price = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    region = db.Column(db.String(2), default='US')
    
    # Alert status
    is_active = db.Column(db.Boolean, default=True)
    is_triggered = db.Column(db.Boolean, default=False)
    triggered_at = db.Column(db.DateTime, nullable=True)
    triggered_price = db.Column(db.Float, nullable=True)
    triggered_store = db.Column(db.String(100), nullable=True)
    
    # Notification settings
    email_sent = db.Column(db.Boolean, default=False)
    email_sent_at = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='price_alerts')
    game = db.relationship('Game', back_populates='price_alerts')