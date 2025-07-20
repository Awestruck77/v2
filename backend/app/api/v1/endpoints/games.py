"""
Game-related API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import logging

from app.core.database import get_db
from app.services.game_service import GameService
from app.schemas.game import GameResponse, GameDetailResponse, GameSearchResponse
from app.schemas.common import PaginationParams

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[GameResponse])
async def get_games(
    skip: int = Query(0, ge=0, description="Number of games to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of games to return"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    min_rating: Optional[float] = Query(None, ge=0, le=10, description="Minimum rating"),
    db: AsyncSession = Depends(get_db)
):
    """Get list of games with optional filters"""
    try:
        game_service = GameService(db)
        games = await game_service.get_games(
            skip=skip,
            limit=limit,
            genre=genre,
            platform=platform,
            min_rating=min_rating
        )
        return games
    except Exception as e:
        logger.error(f"Error fetching games: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{game_id}", response_model=GameDetailResponse)
async def get_game(
    game_id: int,
    region: str = Query("US", description="Region code for pricing"),
    currency: str = Query("USD", description="Currency code"),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed game information"""
    try:
        game_service = GameService(db)
        game = await game_service.get_game_detail(game_id, region, currency)
        
        if not game:
            raise HTTPException(status_code=404, detail="Game not found")
        
        return game
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching game {game_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{game_id}/price-history")
async def get_price_history(
    game_id: int,
    store_id: Optional[int] = Query(None, description="Filter by store"),
    days: int = Query(30, ge=1, le=365, description="Number of days of history"),
    region: str = Query("US", description="Region code"),
    db: AsyncSession = Depends(get_db)
):
    """Get price history for a game"""
    try:
        game_service = GameService(db)
        history = await game_service.get_price_history(
            game_id=game_id,
            store_id=store_id,
            days=days,
            region=region
        )
        return history
    except Exception as e:
        logger.error(f"Error fetching price history for game {game_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{game_id}/refresh")
async def refresh_game_data(
    game_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Manually refresh game data from external APIs"""
    try:
        game_service = GameService(db)
        success = await game_service.refresh_game_data(game_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Game not found")
        
        return {"message": "Game data refresh initiated"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing game {game_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{game_id}/similar")
async def get_similar_games(
    game_id: int,
    limit: int = Query(10, ge=1, le=20, description="Number of similar games"),
    db: AsyncSession = Depends(get_db)
):
    """Get games similar to the specified game"""
    try:
        game_service = GameService(db)
        similar_games = await game_service.get_similar_games(game_id, limit)
        return similar_games
    except Exception as e:
        logger.error(f"Error fetching similar games for {game_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")