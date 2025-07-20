"""
Seed script to populate the database with initial data
"""

import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.core.database import AsyncSessionLocal, engine, Base
from app.models.store import Store
from app.models.game import Game
from app.services.external.steam_service import SteamService
from app.services.external.igdb_service import IGDBService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_tables():
    """Create all database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created")


async def seed_stores():
    """Seed initial store data"""
    stores_data = [
        {
            "name": "Steam",
            "slug": "steam",
            "base_url": "https://store.steampowered.com",
            "logo_url": "https://store.steampowered.com/public/shared/images/header/logo_steam.svg",
            "is_active": True,
            "supports_regions": '["US", "EU", "UK", "CA", "AU"]',
            "api_endpoint": "https://store.steampowered.com/api",
            "rate_limit_per_minute": 200
        },
        {
            "name": "Epic Games Store",
            "slug": "epic",
            "base_url": "https://store.epicgames.com",
            "logo_url": "https://cdn2.unrealengine.com/Epic+Games+Node%2Fxlarge_whitetext_blackback_epiclogo_504x512_1529964470588-503x512-ac795e81c54b27aaa2e196456dd307bfe4ca3ca4.jpg",
            "is_active": True,
            "supports_regions": '["US", "EU", "UK", "CA", "AU"]',
            "rate_limit_per_minute": 60
        },
        {
            "name": "GOG",
            "slug": "gog",
            "base_url": "https://www.gog.com",
            "logo_url": "https://www.gog.com/galaxy/client/gog_logo.svg",
            "is_active": True,
            "supports_regions": '["US", "EU", "UK", "CA", "AU"]',
            "rate_limit_per_minute": 60
        },
        {
            "name": "Humble Store",
            "slug": "humble",
            "base_url": "https://www.humblebundle.com/store",
            "logo_url": "https://hb.imgix.net/fec566de2b11faa5c58cd2d6449e7224d2496a50.png",
            "is_active": True,
            "supports_regions": '["US", "EU", "UK", "CA", "AU"]',
            "rate_limit_per_minute": 60
        },
        {
            "name": "Fanatical",
            "slug": "fanatical",
            "base_url": "https://www.fanatical.com",
            "logo_url": "https://www.fanatical.com/static/images/fanatical-logo.svg",
            "is_active": True,
            "supports_regions": '["US", "EU", "UK", "CA", "AU"]',
            "rate_limit_per_minute": 60
        }
    ]
    
    async with AsyncSessionLocal() as db:
        for store_data in stores_data:
            store = Store(**store_data)
            db.add(store)
        
        await db.commit()
        logger.info(f"Seeded {len(stores_data)} stores")


async def seed_sample_games():
    """Seed some sample games for testing"""
    sample_games = [
        {
            "title": "Cyberpunk 2077",
            "slug": "cyberpunk-2077",
            "description": "Cyberpunk 2077 is an open-world, action-adventure RPG set in the dark future of Night City.",
            "steam_app_id": 1091500,
            "developer": "CD PROJEKT RED",
            "publisher": "CD PROJEKT RED",
            "genres": "RPG,Action,Open World",
            "platforms": "Windows,PlayStation,Xbox",
            "metacritic_score": 86,
            "cover_image_url": "https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg",
            "release_date": datetime(2020, 12, 10)
        },
        {
            "title": "The Witcher 3: Wild Hunt",
            "slug": "witcher-3-wild-hunt",
            "description": "As war rages on throughout the Northern Realms, you take on the greatest contract of your life.",
            "steam_app_id": 292030,
            "developer": "CD PROJEKT RED",
            "publisher": "CD PROJEKT RED",
            "genres": "RPG,Open World,Fantasy",
            "platforms": "Windows,PlayStation,Xbox,Nintendo Switch",
            "metacritic_score": 93,
            "cover_image_url": "https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg",
            "release_date": datetime(2015, 5, 18)
        },
        {
            "title": "Hades",
            "slug": "hades",
            "description": "Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler.",
            "steam_app_id": 1145360,
            "developer": "Supergiant Games",
            "publisher": "Supergiant Games",
            "genres": "Action,Roguelike,Indie",
            "platforms": "Windows,macOS,Nintendo Switch,PlayStation,Xbox",
            "metacritic_score": 93,
            "cover_image_url": "https://cdn.akamai.steamstatic.com/steam/apps/1145360/header.jpg",
            "release_date": datetime(2020, 9, 17)
        }
    ]
    
    async with AsyncSessionLocal() as db:
        for game_data in sample_games:
            game = Game(**game_data)
            db.add(game)
        
        await db.commit()
        logger.info(f"Seeded {len(sample_games)} sample games")


async def main():
    """Main seeding function"""
    logger.info("Starting database seeding...")
    
    try:
        # Create tables
        await create_tables()
        
        # Seed stores
        await seed_stores()
        
        # Seed sample games
        await seed_sample_games()
        
        logger.info("Database seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"Error during seeding: {str(e)}")
        raise


if __name__ == "__main__":
    asyncio.run(main())