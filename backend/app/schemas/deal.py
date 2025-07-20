"""
Pydantic schemas for deal-related data
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class DealBase(BaseModel):
    """Base deal schema"""
    title: str = Field(..., description="Deal title")
    deal_url: str = Field(..., description="URL to the deal")
    sale_price: float = Field(..., ge=0, description="Sale price")
    normal_price: float = Field(..., ge=0, description="Normal price")
    savings_percentage: float = Field(..., ge=0, le=100, description="Savings percentage")


class DealResponse(DealBase):
    """Deal response schema"""
    id: int
    game_id: int
    store_id: int
    game_title: str
    store_name: str
    store_logo_url: Optional[str] = None
    currency: str = "USD"
    region: str = "US"
    deal_rating: Optional[float] = None
    is_on_sale: bool = True
    deal_start_date: Optional[datetime] = None
    deal_end_date: Optional[datetime] = None
    game_cover_image: Optional[str] = None
    game_metacritic_score: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class DealCreate(DealBase):
    """Schema for creating a new deal"""
    game_id: int
    store_id: int
    currency: str = "USD"
    region: str = "US"
    deal_rating: Optional[float] = None
    is_on_sale: bool = True
    deal_start_date: Optional[datetime] = None
    deal_end_date: Optional[datetime] = None
    external_deal_id: Optional[str] = None


class DealUpdate(BaseModel):
    """Schema for updating a deal"""
    sale_price: Optional[float] = Field(None, ge=0)
    normal_price: Optional[float] = Field(None, ge=0)
    savings_percentage: Optional[float] = Field(None, ge=0, le=100)
    deal_url: Optional[str] = None
    is_on_sale: Optional[bool] = None
    deal_end_date: Optional[datetime] = None


class DealFilterParams(BaseModel):
    """Deal filter parameters"""
    store_id: Optional[int] = None
    min_discount: Optional[float] = Field(None, ge=0, le=100)
    max_price: Optional[float] = Field(None, ge=0)
    min_rating: Optional[float] = Field(None, ge=0, le=10)
    genre: Optional[str] = None
    platform: Optional[str] = None
    region: str = "US"
    currency: str = "USD"
    sort_by: str = Field("savings", regex="^(savings|price|rating|recent)$")


class DealStatsResponse(BaseModel):
    """Deal statistics response"""
    total_deals: int
    active_deals: int
    average_discount: float
    total_savings: float
    deals_by_store: dict
    top_discounts: List[DealResponse]
    recent_deals_count: int
    free_games_count: int