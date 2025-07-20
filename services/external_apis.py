"""
External API integrations for game data and pricing
"""

import requests
import time
import logging
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class BaseAPI:
    """Base class for external API integrations"""
    
    def __init__(self, base_url, rate_limit=60):
        self.base_url = base_url
        self.rate_limit = rate_limit
        self.last_request_time = 0
    
    def _rate_limit_check(self):
        """Ensure we don't exceed rate limits"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        min_interval = 60 / self.rate_limit
        
        if time_since_last < min_interval:
            sleep_time = min_interval - time_since_last
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
    
    def _make_request(self, endpoint, params=None):
        """Make HTTP request with rate limiting"""
        self._rate_limit_check()
        
        try:
            url = f"{self.base_url}/{endpoint.lstrip('/')}"
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {str(e)}")
            return None

class SteamAPI(BaseAPI):
    """Steam Web API integration"""
    
    def __init__(self):
        super().__init__('https://store.steampowered.com/api', rate_limit=200)
        self.app_list_cache = None
        self.cache_timestamp = None
    
    def get_app_details(self, app_id, region='US'):
        """Get detailed information for a Steam app"""
        try:
            params = {
                'appids': app_id,
                'cc': region.lower(),
                'l': 'english'
            }
            
            data = self._make_request('appdetails', params)
            
            if data and str(app_id) in data:
                app_data = data[str(app_id)]
                if app_data.get('success'):
                    return app_data.get('data')
            
            return None
        except Exception as e:
            logger.error(f"Error fetching Steam app {app_id}: {str(e)}")
            return None
    
    def search_games(self, query, limit=20):
        """Search for games on Steam"""
        try:
            # This would use Steam's search API or scraping
            # For now, return mock data
            return []
        except Exception as e:
            logger.error(f"Error searching Steam games: {str(e)}")
            return []
    
    def get_price_info(self, app_id, region='US'):
        """Get current price information for a Steam app"""
        app_details = self.get_app_details(app_id, region)
        
        if not app_details:
            return None
        
        price_overview = app_details.get('price_overview')
        if not price_overview:
            return {
                'currency': 'USD',
                'initial': 0,
                'final': 0,
                'discount_percent': 0,
                'is_free': True
            }
        
        return {
            'currency': price_overview.get('currency', 'USD'),
            'initial': price_overview.get('initial', 0) / 100,
            'final': price_overview.get('final', 0) / 100,
            'discount_percent': price_overview.get('discount_percent', 0),
            'is_free': False
        }

class EpicAPI(BaseAPI):
    """Epic Games Store API integration"""
    
    def __init__(self):
        super().__init__('https://store-site-backend-static.ak.epicgames.com', rate_limit=60)
    
    def get_free_games(self):
        """Get current free games from Epic"""
        try:
            data = self._make_request('freeGamesPromotions', {
                'locale': 'en-US',
                'country': 'US',
                'allowCountries': 'US'
            })
            
            if data and 'data' in data:
                games = data['data']['Catalog']['searchStore']['elements']
                free_games = []
                
                for game in games:
                    if game.get('price', {}).get('totalPrice', {}).get('discountPrice') == 0:
                        free_games.append({
                            'id': game.get('id'),
                            'title': game.get('title'),
                            'description': game.get('description'),
                            'image': game.get('keyImages', [{}])[0].get('url'),
                            'url': f"https://store.epicgames.com/en-US/p/{game.get('urlSlug', '')}"
                        })
                
                return free_games
            
            return []
        except Exception as e:
            logger.error(f"Error fetching Epic free games: {str(e)}")
            return []

class GOGAPI(BaseAPI):
    """GOG API integration"""
    
    def __init__(self):
        super().__init__('https://www.gog.com/games/ajax', rate_limit=60)
    
    def search_games(self, query='', limit=20):
        """Search for games on GOG"""
        try:
            params = {
                'mediaType': 'game',
                'search': query,
                'limit': limit
            }
            
            data = self._make_request('filtered', params)
            
            if data and 'products' in data:
                return data['products']
            
            return []
        except Exception as e:
            logger.error(f"Error searching GOG games: {str(e)}")
            return []

class CheapSharkAPI(BaseAPI):
    """CheapShark API for deal aggregation"""
    
    def __init__(self):
        super().__init__('https://www.cheapshark.com/api/1.0', rate_limit=60)
    
    def get_deals(self, **kwargs):
        """Get deals from CheapShark"""
        try:
            params = {
                'pageSize': kwargs.get('limit', 20),
                'sortBy': kwargs.get('sort_by', 'Savings'),
                'desc': 1,
                'onSale': 1 if kwargs.get('on_sale', True) else 0
            }
            
            # Add optional parameters
            if 'store_id' in kwargs:
                params['storeID'] = kwargs['store_id']
            if 'min_rating' in kwargs:
                params['metacritic'] = kwargs['min_rating']
            
            data = self._make_request('deals', params)
            
            return data if data else []
        except Exception as e:
            logger.error(f"Error fetching CheapShark deals: {str(e)}")
            return []
    
    def get_stores(self):
        """Get list of stores from CheapShark"""
        try:
            data = self._make_request('stores')
            return data if data else []
        except Exception as e:
            logger.error(f"Error fetching stores: {str(e)}")
            return []

class PriceUpdateService:
    """Service for updating game prices from external APIs"""
    
    def __init__(self, db):
        self.db = db
        self.steam_api = SteamAPI()
        self.epic_api = EpicAPI()
        self.gog_api = GOGAPI()
        self.cheapshark_api = CheapSharkAPI()
    
    def update_all_prices(self):
        """Update prices for all games"""
        try:
            from models import Game, Deal, Store
            
            logger.info("Starting price update for all games...")
            
            # Get deals from CheapShark
            deals_data = self.cheapshark_api.get_deals(limit=100)
            
            updated_count = 0
            for deal_data in deals_data:
                try:
                    # Find or create game
                    game = self._find_or_create_game(deal_data)
                    if not game:
                        continue
                    
                    # Find or create store
                    store = self._find_or_create_store(deal_data)
                    if not store:
                        continue
                    
                    # Create or update deal
                    deal = self._create_or_update_deal(game, store, deal_data)
                    if deal:
                        updated_count += 1
                
                except Exception as e:
                    logger.error(f"Error processing deal: {str(e)}")
                    continue
            
            self.db.session.commit()
            logger.info(f"Price update completed: {updated_count} deals updated")
            
            return updated_count
        except Exception as e:
            logger.error(f"Error updating prices: {str(e)}")
            self.db.session.rollback()
            return 0
    
    def _find_or_create_game(self, deal_data):
        """Find existing game or create new one"""
        try:
            from models import Game
            
            title = deal_data.get('title', '')
            steam_app_id = deal_data.get('steamAppID')
            
            # Try to find by Steam App ID first
            if steam_app_id:
                game = Game.query.filter_by(steam_app_id=steam_app_id).first()
                if game:
                    return game
            
            # Try to find by title
            game = Game.query.filter_by(title=title).first()
            if game:
                return game
            
            # Create new game
            slug = title.lower().replace(' ', '-').replace(':', '').replace("'", '')
            game = Game(
                title=title,
                slug=slug,
                steam_app_id=steam_app_id,
                cover_image_url=deal_data.get('thumb'),
                metacritic_score=int(deal_data.get('metacriticScore', 0)) if deal_data.get('metacriticScore') else None
            )
            
            self.db.session.add(game)
            self.db.session.flush()  # Get the ID
            
            return game
        except Exception as e:
            logger.error(f"Error finding/creating game: {str(e)}")
            return None
    
    def _find_or_create_store(self, deal_data):
        """Find existing store or create new one"""
        try:
            from models import Store
            
            store_id = deal_data.get('storeID')
            
            # Map CheapShark store IDs to our stores
            store_mapping = {
                '1': 'steam',
                '25': 'epic',
                '7': 'gog',
                '2': 'humble',
                '15': 'fanatical'
            }
            
            store_slug = store_mapping.get(store_id)
            if not store_slug:
                return None
            
            store = Store.query.filter_by(slug=store_slug).first()
            return store
        except Exception as e:
            logger.error(f"Error finding store: {str(e)}")
            return None
    
    def _create_or_update_deal(self, game, store, deal_data):
        """Create or update a deal"""
        try:
            from models import Deal
            
            # Check if deal already exists
            external_deal_id = deal_data.get('dealID')
            existing_deal = Deal.query.filter_by(external_deal_id=external_deal_id).first()
            
            sale_price = float(deal_data.get('salePrice', 0))
            normal_price = float(deal_data.get('normalPrice', 0))
            savings = float(deal_data.get('savings', 0))
            
            if existing_deal:
                # Update existing deal
                existing_deal.sale_price = sale_price
                existing_deal.normal_price = normal_price
                existing_deal.savings_percentage = savings
                existing_deal.updated_at = datetime.utcnow()
                return existing_deal
            else:
                # Create new deal
                deal = Deal(
                    game_id=game.id,
                    store_id=store.id,
                    title=deal_data.get('title', ''),
                    deal_url=f"https://www.cheapshark.com/redirect?dealID={external_deal_id}",
                    sale_price=sale_price,
                    normal_price=normal_price,
                    savings_percentage=savings,
                    external_deal_id=external_deal_id,
                    is_on_sale=sale_price < normal_price
                )
                
                self.db.session.add(deal)
                return deal
        except Exception as e:
            logger.error(f"Error creating/updating deal: {str(e)}")
            return None