"""
Deal service for managing game deals
"""

from sqlalchemy import and_, desc, asc
from models import Deal, Game, Store
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class DealService:
    """Service for deal-related operations"""
    
    def __init__(self, db):
        self.db = db
    
    def get_deals(self, region='US', limit=20, store_id=None, min_discount=0):
        """Get deals with filters"""
        try:
            deals_query = Deal.query.filter(
                Deal.region == region,
                Deal.is_on_sale == True
            )
            
            if store_id:
                deals_query = deals_query.filter(Deal.store_id == store_id)
            
            if min_discount > 0:
                deals_query = deals_query.filter(Deal.savings_percentage >= min_discount)
            
            deals = deals_query.order_by(desc(Deal.savings_percentage)).limit(limit).all()
            
            return deals
        except Exception as e:
            logger.error(f"Error getting deals: {str(e)}")
            return []
    
    def get_hot_deals(self, limit=20, region='US'):
        """Get the hottest deals (highest savings)"""
        try:
            deals = Deal.query.filter(
                Deal.region == region,
                Deal.is_on_sale == True,
                Deal.savings_percentage >= 50
            ).order_by(desc(Deal.savings_percentage)).limit(limit).all()
            
            return deals
        except Exception as e:
            logger.error(f"Error getting hot deals: {str(e)}")
            return []
    
    def get_recent_deals(self, limit=20, region='US', hours=24):
        """Get recently added deals"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            deals = Deal.query.filter(
                Deal.region == region,
                Deal.is_on_sale == True,
                Deal.created_at >= cutoff_time
            ).order_by(desc(Deal.created_at)).limit(limit).all()
            
            return deals
        except Exception as e:
            logger.error(f"Error getting recent deals: {str(e)}")
            return []
    
    def get_free_games(self, limit=20, region='US'):
        """Get currently free games"""
        try:
            deals = Deal.query.filter(
                Deal.region == region,
                Deal.sale_price == 0,
                Deal.is_on_sale == True
            ).order_by(desc(Deal.created_at)).limit(limit).all()
            
            return deals
        except Exception as e:
            logger.error(f"Error getting free games: {str(e)}")
            return []
    
    def get_ending_soon_deals(self, limit=20, region='US', hours=48):
        """Get deals ending soon"""
        try:
            cutoff_time = datetime.utcnow() + timedelta(hours=hours)
            
            deals = Deal.query.filter(
                Deal.region == region,
                Deal.is_on_sale == True,
                Deal.deal_end_date.isnot(None),
                Deal.deal_end_date <= cutoff_time
            ).order_by(asc(Deal.deal_end_date)).limit(limit).all()
            
            return deals
        except Exception as e:
            logger.error(f"Error getting ending soon deals: {str(e)}")
            return []
    
    def get_store_deals(self, store_id, region='US', limit=20):
        """Get deals from a specific store"""
        try:
            deals = Deal.query.filter(
                Deal.store_id == store_id,
                Deal.region == region,
                Deal.is_on_sale == True
            ).order_by(desc(Deal.savings_percentage)).limit(limit).all()
            
            return deals
        except Exception as e:
            logger.error(f"Error getting store deals: {str(e)}")
            return []
    
    def create_deal(self, game_id, store_id, **kwargs):
        """Create a new deal"""
        try:
            deal = Deal(
                game_id=game_id,
                store_id=store_id,
                **kwargs
            )
            
            self.db.session.add(deal)
            self.db.session.commit()
            
            return deal
        except Exception as e:
            logger.error(f"Error creating deal: {str(e)}")
            self.db.session.rollback()
            return None
    
    def update_deal(self, deal_id, **kwargs):
        """Update deal information"""
        try:
            deal = Deal.query.get(deal_id)
            if not deal:
                return None
            
            for key, value in kwargs.items():
                if hasattr(deal, key):
                    setattr(deal, key, value)
            
            deal.updated_at = datetime.utcnow()
            self.db.session.commit()
            
            return deal
        except Exception as e:
            logger.error(f"Error updating deal: {str(e)}")
            self.db.session.rollback()
            return None
    
    def get_deal_stats(self, region='US'):
        """Get deal statistics"""
        try:
            total_deals = Deal.query.filter(Deal.region == region).count()
            active_deals = Deal.query.filter(
                Deal.region == region,
                Deal.is_on_sale == True
            ).count()
            
            avg_discount = self.db.session.query(
                self.db.func.avg(Deal.savings_percentage)
            ).filter(
                Deal.region == region,
                Deal.is_on_sale == True
            ).scalar() or 0
            
            free_games_count = Deal.query.filter(
                Deal.region == region,
                Deal.sale_price == 0,
                Deal.is_on_sale == True
            ).count()
            
            return {
                'total_deals': total_deals,
                'active_deals': active_deals,
                'average_discount': round(avg_discount, 2),
                'free_games_count': free_games_count
            }
        except Exception as e:
            logger.error(f"Error getting deal stats: {str(e)}")
            return {}