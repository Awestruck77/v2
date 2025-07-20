"""
Deal-related API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import logging

from app.core.database import get_db
from app.services.deal_service import DealService
from app.schemas.deal import DealResponse, DealFilterParams

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[DealResponse])
async def get_deals(
    skip: int = Query(0, ge=0, description="Number of deals to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of deals to return"),
    store_id: Optional[int] = Query(None, description="Filter by store"),
    min_discount: Optional[float] = Query(None, ge=0, le=100, description="Minimum discount percentage"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    region: str = Query("US", description="Region code"),
    currency: str = Query("USD", description="Currency code"),
    sort_by: str = Query("savings", description="Sort by: savings, price, rating, recent"),
    db: AsyncSession = Depends(get_db)
):
    """Get current deals with filters"""
    try:
        deal_service = DealService(db)
        deals = await deal_service.get_deals(
            skip=skip,
            limit=limit,
            store_id=store_id,
            min_discount=min_discount,
            max_price=max_price,
            region=region,
            currency=currency,
            sort_by=sort_by
        )
        return deals
    except Exception as e:
        logger.error(f"Error fetching deals: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/hot", response_model=List[DealResponse])
async def get_hot_deals(
    limit: int = Query(10, ge=1, le=50, description="Number of hot deals"),
    region: str = Query("US", description="Region code"),
    db: AsyncSession = Depends(get_db)
):
    """Get the hottest deals (highest savings)"""
    try:
        deal_service = DealService(db)
        deals = await deal_service.get_hot_deals(limit=limit, region=region)
        return deals
    except Exception as e:
        logger.error(f"Error fetching hot deals: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/recent", response_model=List[DealResponse])
async def get_recent_deals(
    limit: int = Query(20, ge=1, le=50, description="Number of recent deals"),
    hours: int = Query(24, ge=1, le=168, description="Hours to look back"),
    region: str = Query("US", description="Region code"),
    db: AsyncSession = Depends(get_db)
):
    """Get recently added deals"""
    try:
        deal_service = DealService(db)
        deals = await deal_service.get_recent_deals(
            limit=limit,
            hours=hours,
            region=region
        )
        return deals
    except Exception as e:
        logger.error(f"Error fetching recent deals: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/free", response_model=List[DealResponse])
async def get_free_games(
    limit: int = Query(20, ge=1, le=50, description="Number of free games"),
    region: str = Query("US", description="Region code"),
    db: AsyncSession = Depends(get_db)
):
    """Get currently free games"""
    try:
        deal_service = DealService(db)
        deals = await deal_service.get_free_games(limit=limit, region=region)
        return deals
    except Exception as e:
        logger.error(f"Error fetching free games: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/ending-soon", response_model=List[DealResponse])
async def get_ending_soon_deals(
    limit: int = Query(20, ge=1, le=50, description="Number of deals ending soon"),
    hours: int = Query(48, ge=1, le=168, description="Hours until deal ends"),
    region: str = Query("US", description="Region code"),
    db: AsyncSession = Depends(get_db)
):
    """Get deals ending soon"""
    try:
        deal_service = DealService(db)
        deals = await deal_service.get_ending_soon_deals(
            limit=limit,
            hours=hours,
            region=region
        )
        return deals
    except Exception as e:
        logger.error(f"Error fetching ending soon deals: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/stats")
async def get_deal_stats(
    region: str = Query("US", description="Region code"),
    db: AsyncSession = Depends(get_db)
):
    """Get deal statistics"""
    try:
        deal_service = DealService(db)
        stats = await deal_service.get_deal_stats(region=region)
        return stats
    except Exception as e:
        logger.error(f"Error fetching deal stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")