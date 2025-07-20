"""
Game service for business logic
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, asc
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from app.models.game import Game, GameStore, Deal
from app.models.store import Store
from app.services.external.igdb_service import IGDBService
from app.services.external.steam_service import SteamService
from app.schemas.game import GameResponse, GameDetailResponse

logger = logging.getLogger(__name__)


class GameService:
    """Service for game-related operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.igdb_service = IGDBService()
        self.steam_service = SteamService()
    
    async def get_games(
        self,
        skip: int = 0,
        limit: int = 20,
        genre: Optional[str] = None,
        platform: Optional[str] = None,
        min_rating: Optional[float] = None
    ) -> List[GameResponse]:
        """Get games with optional filters"""
        
        query = select(Game).options(
            selectinload(Game.game_stores).selectinload(GameStore.store),
            selectinload(Game.deals)
        )
        
        # Apply filters
        conditions = []
        
        if genre:
            conditions.append(Game.genres.contains(genre))
        
        if platform:
            conditions.append(Game.platforms.contains(platform))
        
        if min_rating:
            conditions.append(Game.metacritic_score >= min_rating * 10)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        # Order by popularity (metacritic score)
        query = query.order_by(desc(Game.metacritic_score))
        
        result = await self.db.execute(query)
        games = result.scalars().all()
        
        return [self._game_to_response(game) for game in games]
    
    async def get_game_detail(
        self,
        game_id: int,
        region: str = "US",
        currency: str = "USD"
    ) -> Optional[GameDetailResponse]:
        """Get detailed game information"""
        
        query = select(Game).options(
            selectinload(Game.game_stores).selectinload(GameStore.store),
            selectinload(Game.deals).selectinload(Deal.store)
        ).where(Game.id == game_id)
        
        result = await self.db.execute(query)
        game = result.scalar_one_or_none()
        
        if not game:
            return None
        
        return self._game_to_detail_response(game, region, currency)
    
    async def get_price_history(
        self,
        game_id: int,
        store_id: Optional[int] = None,
        days: int = 30,
        region: str = "US"
    ) -> Dict[str, Any]:
        """Get price history for a game"""
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        query = select(Deal).options(
            selectinload(Deal.store)
        ).where(
            and_(
                Deal.game_id == game_id,
                Deal.region == region,
                Deal.created_at >= start_date
            )
        )
        
        if store_id:
            query = query.where(Deal.store_id == store_id)
        
        query = query.order_by(asc(Deal.created_at))
        
        result = await self.db.execute(query)
        deals = result.scalars().all()
        
        # Group by store and format for charting
        history_by_store = {}
        for deal in deals:
            store_name = deal.store.name
            if store_name not in history_by_store:
                history_by_store[store_name] = []
            
            history_by_store[store_name].append({
                "date": deal.created_at.isoformat(),
                "price": deal.sale_price,
                "original_price": deal.normal_price,
                "discount": deal.savings_percentage
            })
        
        return {
            "game_id": game_id,
            "region": region,
            "days": days,
            "history": history_by_store
        }
    
    async def refresh_game_data(self, game_id: int) -> bool:
        """Refresh game data from external APIs"""
        
        # Get game from database
        query = select(Game).where(Game.id == game_id)
        result = await self.db.execute(query)
        game = result.scalar_one_or_none()
        
        if not game:
            return False
        
        try:
            # Refresh from IGDB if we have an IGDB ID
            if game.igdb_id:
                igdb_data = await self.igdb_service.get_game_details(game.igdb_id)
                if igdb_data:
                    await self._update_game_from_igdb(game, igdb_data)
            
            # Refresh from Steam if we have a Steam App ID
            if game.steam_app_id:
                steam_data = await self.steam_service.get_app_details(game.steam_app_id)
                if steam_data:
                    await self._update_game_from_steam(game, steam_data)
            
            game.updated_at = datetime.utcnow()
            await self.db.commit()
            
            return True
            
        except Exception as e:
            logger.error(f"Error refreshing game {game_id}: {str(e)}")
            await self.db.rollback()
            return False
    
    async def get_similar_games(self, game_id: int, limit: int = 10) -> List[GameResponse]:
        """Get games similar to the specified game"""
        
        # Get the source game
        query = select(Game).where(Game.id == game_id)
        result = await self.db.execute(query)
        source_game = result.scalar_one_or_none()
        
        if not source_game:
            return []
        
        # Find similar games based on genres and developer
        query = select(Game).options(
            selectinload(Game.game_stores).selectinload(GameStore.store),
            selectinload(Game.deals)
        ).where(
            and_(
                Game.id != game_id,
                or_(
                    Game.genres.contains(source_game.genres.split(',')[0] if source_game.genres else ''),
                    Game.developer == source_game.developer
                )
            )
        ).order_by(desc(Game.metacritic_score)).limit(limit)
        
        result = await self.db.execute(query)
        similar_games = result.scalars().all()
        
        return [self._game_to_response(game) for game in similar_games]
    
    def _game_to_response(self, game: Game) -> GameResponse:
        """Convert Game model to GameResponse"""
        
        # Get best current deal
        best_deal = None
        if game.deals:
            best_deal = min(game.deals, key=lambda d: d.sale_price)
        
        return GameResponse(
            id=game.id,
            title=game.title,
            slug=game.slug,
            description=game.description,
            cover_image_url=game.cover_image_url,
            release_date=game.release_date,
            developer=game.developer,
            publisher=game.publisher,
            genres=game.genres.split(',') if game.genres else [],
            platforms=game.platforms.split(',') if game.platforms else [],
            metacritic_score=game.metacritic_score,
            user_rating=game.user_rating,
            best_price=best_deal.sale_price if best_deal else None,
            best_price_store=best_deal.store.name if best_deal else None,
            deal_count=len(game.deals)
        )
    
    def _game_to_detail_response(
        self,
        game: Game,
        region: str,
        currency: str
    ) -> GameDetailResponse:
        """Convert Game model to GameDetailResponse"""
        
        # Filter deals by region
        region_deals = [d for d in game.deals if d.region == region]
        
        # Get store availability
        store_prices = []
        for game_store in game.game_stores:
            if game_store.region == region and game_store.is_available:
                store_prices.append({
                    "store_id": game_store.store_id,
                    "store_name": game_store.store.name,
                    "current_price": game_store.current_price,
                    "original_price": game_store.original_price,
                    "discount_percentage": game_store.discount_percentage,
                    "store_url": game_store.store_url,
                    "currency": game_store.currency
                })
        
        return GameDetailResponse(
            id=game.id,
            title=game.title,
            slug=game.slug,
            description=game.description,
            cover_image_url=game.cover_image_url,
            header_image_url=game.header_image_url,
            screenshots=game.screenshots.split(',') if game.screenshots else [],
            release_date=game.release_date,
            developer=game.developer,
            publisher=game.publisher,
            genres=game.genres.split(',') if game.genres else [],
            platforms=game.platforms.split(',') if game.platforms else [],
            metacritic_score=game.metacritic_score,
            user_rating=game.user_rating,
            store_prices=store_prices,
            deal_count=len(region_deals),
            lowest_price=min([d.sale_price for d in region_deals]) if region_deals else None,
            highest_discount=max([d.savings_percentage for d in region_deals]) if region_deals else None
        )
    
    async def _update_game_from_igdb(self, game: Game, igdb_data: Dict[str, Any]):
        """Update game with IGDB data"""
        
        if 'name' in igdb_data:
            game.title = igdb_data['name']
        
        if 'summary' in igdb_data:
            game.description = igdb_data['summary']
        
        if 'first_release_date' in igdb_data:
            game.release_date = datetime.fromtimestamp(igdb_data['first_release_date'])
        
        # Update other fields as needed
        
    async def _update_game_from_steam(self, game: Game, steam_data: Dict[str, Any]):
        """Update game with Steam data"""
        
        if 'name' in steam_data:
            game.title = steam_data['name']
        
        if 'short_description' in steam_data:
            game.description = steam_data['short_description']
        
        # Update other fields as needed