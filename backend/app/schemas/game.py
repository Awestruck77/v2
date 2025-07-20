"""
Pydantic schemas for game-related data
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class GameBase(BaseModel):
    """Base game schema"""
    title: str = Field(..., description="Game title")
    slug: str = Field(..., description="URL-friendly game identifier")
    description: Optional[str] = Field(None, description="Game description")


class GameResponse(GameBase):
    """Game response schema"""
    id: int
    cover_image_url: Optional[str] = None
    release_date: Optional[datetime] = None
    developer: Optional[str] = None
    publisher: Optional[str] = None
    genres: List[str] = []
    platforms: List[str] = []
    metacritic_score: Optional[int] = None
    user_rating: Optional[float] = None
    best_price: Optional[float] = None
    best_price_store: Optional[str] = None
    deal_count: int = 0
    
    class Config:
        from_attributes = True


class StorePriceInfo(BaseModel):
    """Store price information"""
    store_id: int
    store_name: str
    current_price: Optional[float] = None
    original_price: Optional[float] = None
    discount_percentage: Optional[float] = None
    store_url: Optional[str] = None
    currency: str = "USD"


class GameDetailResponse(GameBase):
    """Detailed game response schema"""
    id: int
    cover_image_url: Optional[str] = None
    header_image_url: Optional[str] = None
    screenshots: List[str] = []
    release_date: Optional[datetime] = None
    developer: Optional[str] = None
    publisher: Optional[str] = None
    genres: List[str] = []
    platforms: List[str] = []
    metacritic_score: Optional[int] = None
    user_rating: Optional[float] = None
    store_prices: List[StorePriceInfo] = []
    deal_count: int = 0
    lowest_price: Optional[float] = None
    highest_discount: Optional[float] = None
    
    class Config:
        from_attributes = True


class GameSearchResponse(BaseModel):
    """Game search response schema"""
    games: List[GameResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class GameCreate(GameBase):
    """Schema for creating a new game"""
    igdb_id: Optional[int] = None
    steam_app_id: Optional[int] = None
    release_date: Optional[datetime] = None
    developer: Optional[str] = None
    publisher: Optional[str] = None
    genres: List[str] = []
    platforms: List[str] = []
    cover_image_url: Optional[str] = None
    header_image_url: Optional[str] = None
    screenshots: List[str] = []
    metacritic_score: Optional[int] = None


class GameUpdate(BaseModel):
    """Schema for updating a game"""
    title: Optional[str] = None
    description: Optional[str] = None
    developer: Optional[str] = None
    publisher: Optional[str] = None
    genres: Optional[List[str]] = None
    platforms: Optional[List[str]] = None
    cover_image_url: Optional[str] = None
    header_image_url: Optional[str] = None
    screenshots: Optional[List[str]] = None
    metacritic_score: Optional[int] = None
    user_rating: Optional[float] = None


class PriceHistoryPoint(BaseModel):
    """Single point in price history"""
    date: datetime
    price: float
    original_price: float
    discount: float
    store_name: str


class PriceHistoryResponse(BaseModel):
    """Price history response"""
    game_id: int
    region: str
    currency: str
    days: int
    history: Dict[str, List[PriceHistoryPoint]]