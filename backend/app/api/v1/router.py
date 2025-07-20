"""
Main API router for v1 endpoints
"""

from fastapi import APIRouter

from app.api.v1.endpoints import games, deals, stores, search, wishlist, auth

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(games.router, prefix="/games", tags=["games"])
api_router.include_router(deals.router, prefix="/deals", tags=["deals"])
api_router.include_router(stores.router, prefix="/stores", tags=["stores"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(wishlist.router, prefix="/wishlist", tags=["wishlist"])