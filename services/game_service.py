"""
Game service for business logic
"""

from sqlalchemy import and_, or_, desc
from models import Game, Deal, Store
from datetime import datetime, timedelta
import json
import logging

logger = logging.getLogger(__name__)

class GameService:
    """Service for game-related operations"""
    
    def __init__(self, db):
        self.db = db
    
    def search_games(self, query='', genre='', min_rating=0, max_price=999, limit=20):
        """Search games with filters"""
        try:
            games_query = Game.query
            
            # Apply filters
            if query:
                games_query = games_query.filter(
                    Game.title.ilike(f'%{query}%')
                )
            
            if genre:
                games_query = games_query.filter(
                    Game.genres.ilike(f'%{genre}%')
                )
            
            if min_rating > 0:
                games_query = games_query.filter(
                    Game.metacritic_score >= min_rating
                )
            
            # Join with deals to filter by price
            if max_price < 999:
                games_query = games_query.join(Deal).filter(
                    Deal.sale_price <= max_price
                )
            
            games = games_query.order_by(desc(Game.metacritic_score)).limit(limit).all()
            
            return games
        except Exception as e:
            logger.error(f"Error searching games: {str(e)}")
            return []
    
    def get_game_details(self, game_id):
        """Get detailed game information"""
        try:
            game = Game.query.get(game_id)
            return game
        except Exception as e:
            logger.error(f"Error getting game details: {str(e)}")
            return None
    
    def get_similar_games(self, game_id, limit=6):
        """Get games similar to the specified game"""
        try:
            source_game = Game.query.get(game_id)
            if not source_game:
                return []
            
            # Find similar games based on genres and developer
            similar_games = Game.query.filter(
                and_(
                    Game.id != game_id,
                    or_(
                        Game.genres.ilike(f'%{source_game.genres.split(",")[0] if source_game.genres else ""}%'),
                        Game.developer == source_game.developer
                    )
                )
            ).order_by(desc(Game.metacritic_score)).limit(limit).all()
            
            return similar_games
        except Exception as e:
            logger.error(f"Error getting similar games: {str(e)}")
            return []
    
    def get_featured_games(self, limit=10):
        """Get featured games"""
        try:
            # Get games with high ratings and recent deals
            featured = Game.query.join(Deal).filter(
                Game.metacritic_score >= 80,
                Deal.is_on_sale == True
            ).order_by(desc(Game.metacritic_score)).limit(limit).all()
            
            return featured
        except Exception as e:
            logger.error(f"Error getting featured games: {str(e)}")
            return []
    
    def create_game(self, title, **kwargs):
        """Create a new game"""
        try:
            # Generate slug from title
            slug = title.lower().replace(' ', '-').replace(':', '').replace("'", '')
            
            game = Game(
                title=title,
                slug=slug,
                **kwargs
            )
            
            self.db.session.add(game)
            self.db.session.commit()
            
            return game
        except Exception as e:
            logger.error(f"Error creating game: {str(e)}")
            self.db.session.rollback()
            return None
    
    def update_game(self, game_id, **kwargs):
        """Update game information"""
        try:
            game = Game.query.get(game_id)
            if not game:
                return None
            
            for key, value in kwargs.items():
                if hasattr(game, key):
                    setattr(game, key, value)
            
            game.updated_at = datetime.utcnow()
            self.db.session.commit()
            
            return game
        except Exception as e:
            logger.error(f"Error updating game: {str(e)}")
            self.db.session.rollback()
            return None