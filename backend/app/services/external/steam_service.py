"""
Steam Web API integration service
"""

import httpx
import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

from app.core.config import settings

logger = logging.getLogger(__name__)


class SteamService:
    """Service for interacting with Steam Web API"""
    
    BASE_URL = "https://store.steampowered.com/api"
    APP_LIST_URL = "https://api.steampowered.com/ISteamApps/GetAppList/v2/"
    
    def __init__(self):
        self.session = None
        self.app_list_cache = None
        self.cache_timestamp = None
    
    async def _get_session(self) -> httpx.AsyncClient:
        """Get or create HTTP session"""
        if self.session is None:
            self.session = httpx.AsyncClient(
                timeout=30.0,
                headers={
                    "User-Agent": "GamePriceTracker/1.0"
                }
            )
        return self.session
    
    async def get_app_list(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """Get list of all Steam apps"""
        
        # Check cache (refresh every 24 hours)
        if (not force_refresh and 
            self.app_list_cache and 
            self.cache_timestamp and 
            (datetime.utcnow() - self.cache_timestamp).total_seconds() < 86400):
            return self.app_list_cache
        
        try:
            session = await self._get_session()
            response = await session.get(self.APP_LIST_URL)
            response.raise_for_status()
            
            data = response.json()
            apps = data.get("applist", {}).get("apps", [])
            
            # Cache the result
            self.app_list_cache = apps
            self.cache_timestamp = datetime.utcnow()
            
            logger.info(f"Retrieved {len(apps)} Steam apps")
            return apps
            
        except Exception as e:
            logger.error(f"Error fetching Steam app list: {str(e)}")
            return []
    
    async def get_app_details(self, app_id: int, region: str = "US") -> Optional[Dict[str, Any]]:
        """Get detailed information for a Steam app"""
        
        try:
            session = await self._get_session()
            
            params = {
                "appids": app_id,
                "cc": region.lower(),
                "l": "english"
            }
            
            url = f"{self.BASE_URL}/appdetails"
            response = await session.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            app_data = data.get(str(app_id))
            
            if not app_data or not app_data.get("success"):
                logger.warning(f"Steam app {app_id} not found or not successful")
                return None
            
            return app_data.get("data")
            
        except Exception as e:
            logger.error(f"Error fetching Steam app {app_id}: {str(e)}")
            return None
    
    async def search_games(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search for games on Steam"""
        
        try:
            # Get app list if not cached
            apps = await self.get_app_list()
            
            # Simple text search
            query_lower = query.lower()
            matches = []
            
            for app in apps:
                if query_lower in app.get("name", "").lower():
                    matches.append(app)
                    if len(matches) >= limit:
                        break
            
            # Get detailed info for matches
            detailed_matches = []
            for app in matches[:10]:  # Limit API calls
                details = await self.get_app_details(app["appid"])
                if details:
                    detailed_matches.append({
                        **app,
                        "details": details
                    })
                
                # Rate limiting
                await asyncio.sleep(0.1)
            
            return detailed_matches
            
        except Exception as e:
            logger.error(f"Error searching Steam games: {str(e)}")
            return []
    
    async def get_price_info(self, app_id: int, region: str = "US") -> Optional[Dict[str, Any]]:
        """Get current price information for a Steam app"""
        
        app_details = await self.get_app_details(app_id, region)
        
        if not app_details:
            return None
        
        price_overview = app_details.get("price_overview")
        if not price_overview:
            # Free game
            return {
                "currency": "USD",
                "initial": 0,
                "final": 0,
                "discount_percent": 0,
                "is_free": True
            }
        
        return {
            "currency": price_overview.get("currency", "USD"),
            "initial": price_overview.get("initial", 0) / 100,  # Convert cents to dollars
            "final": price_overview.get("final", 0) / 100,
            "discount_percent": price_overview.get("discount_percent", 0),
            "is_free": False
        }
    
    async def get_multiple_app_details(self, app_ids: List[int], region: str = "US") -> Dict[int, Dict[str, Any]]:
        """Get details for multiple Steam apps with rate limiting"""
        
        results = {}
        
        for app_id in app_ids:
            try:
                details = await self.get_app_details(app_id, region)
                if details:
                    results[app_id] = details
                
                # Rate limiting - Steam allows ~200 requests per 5 minutes
                await asyncio.sleep(1.5)
                
            except Exception as e:
                logger.error(f"Error fetching Steam app {app_id}: {str(e)}")
                continue
        
        return results
    
    async def get_featured_games(self, region: str = "US") -> List[Dict[str, Any]]:
        """Get featured games from Steam"""
        
        try:
            session = await self._get_session()
            
            params = {
                "cc": region.lower(),
                "l": "english"
            }
            
            url = "https://store.steampowered.com/api/featured"
            response = await session.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            featured_games = []
            
            # Get featured items
            if "featured_win" in data:
                for item in data["featured_win"]:
                    featured_games.append({
                        "id": item.get("id"),
                        "name": item.get("name"),
                        "discounted": item.get("discounted", False),
                        "discount_percent": item.get("discount_percent", 0),
                        "original_price": item.get("original_price", 0) / 100,
                        "final_price": item.get("final_price", 0) / 100,
                        "currency": item.get("currency", "USD"),
                        "large_capsule_image": item.get("large_capsule_image"),
                        "small_capsule_image": item.get("small_capsule_image"),
                        "windows_available": item.get("windows_available", False),
                        "mac_available": item.get("mac_available", False),
                        "linux_available": item.get("linux_available", False)
                    })
            
            return featured_games
            
        except Exception as e:
            logger.error(f"Error fetching Steam featured games: {str(e)}")
            return []
    
    async def close(self):
        """Close the HTTP session"""
        if self.session:
            await self.session.aclose()
            self.session = None