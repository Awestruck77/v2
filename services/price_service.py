"""
Price service for managing price history and alerts
"""

from sqlalchemy import and_, desc
from models import Deal, PriceAlert, User
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class PriceService:
    """Service for price-related operations"""
    
    def __init__(self, db):
        self.db = db
    
    def get_price_history(self, game_id, days=30, store_id=None, region='US'):
        """Get price history for a game"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            deals_query = Deal.query.filter(
                Deal.game_id == game_id,
                Deal.region == region,
                Deal.created_at >= start_date
            )
            
            if store_id:
                deals_query = deals_query.filter(Deal.store_id == store_id)
            
            deals = deals_query.order_by(Deal.created_at).all()
            
            # Group by store and format for charting
            history_by_store = {}
            for deal in deals:
                store_name = deal.store.name if deal.store else 'Unknown'
                if store_name not in history_by_store:
                    history_by_store[store_name] = []
                
                history_by_store[store_name].append({
                    'date': deal.created_at.isoformat(),
                    'price': float(deal.sale_price),
                    'original_price': float(deal.normal_price),
                    'discount': float(deal.savings_percentage)
                })
            
            return {
                'game_id': game_id,
                'region': region,
                'days': days,
                'history': history_by_store
            }
        except Exception as e:
            logger.error(f"Error getting price history: {str(e)}")
            return {}
    
    def create_price_alert(self, user_id, game_id, target_price, currency='USD', region='US'):
        """Create a price alert"""
        try:
            # Check if alert already exists
            existing_alert = PriceAlert.query.filter_by(
                user_id=user_id,
                game_id=game_id,
                is_active=True
            ).first()
            
            if existing_alert:
                # Update existing alert
                existing_alert.target_price = target_price
                existing_alert.currency = currency
                existing_alert.region = region
                existing_alert.updated_at = datetime.utcnow()
                self.db.session.commit()
                return existing_alert
            
            # Create new alert
            alert = PriceAlert(
                user_id=user_id,
                game_id=game_id,
                target_price=target_price,
                currency=currency,
                region=region
            )
            
            self.db.session.add(alert)
            self.db.session.commit()
            
            return alert
        except Exception as e:
            logger.error(f"Error creating price alert: {str(e)}")
            self.db.session.rollback()
            return None
    
    def check_price_alerts(self):
        """Check all active price alerts and trigger notifications"""
        try:
            active_alerts = PriceAlert.query.filter_by(
                is_active=True,
                is_triggered=False
            ).all()
            
            triggered_count = 0
            
            for alert in active_alerts:
                # Get current best price for the game
                best_deal = Deal.query.filter(
                    Deal.game_id == alert.game_id,
                    Deal.region == alert.region,
                    Deal.is_on_sale == True
                ).order_by(Deal.sale_price).first()
                
                if best_deal and best_deal.sale_price <= alert.target_price:
                    # Trigger alert
                    alert.is_triggered = True
                    alert.triggered_at = datetime.utcnow()
                    alert.triggered_price = best_deal.sale_price
                    alert.triggered_store = best_deal.store.name if best_deal.store else 'Unknown'
                    
                    # Send notification (implement email/push notification here)
                    self._send_price_alert_notification(alert, best_deal)
                    
                    triggered_count += 1
            
            self.db.session.commit()
            
            logger.info(f"Checked price alerts: {triggered_count} triggered")
            return triggered_count
        except Exception as e:
            logger.error(f"Error checking price alerts: {str(e)}")
            self.db.session.rollback()
            return 0
    
    def _send_price_alert_notification(self, alert, deal):
        """Send price alert notification to user"""
        try:
            # This would integrate with email service or push notifications
            logger.info(f"Price alert triggered for user {alert.user_id}: "
                       f"Game {alert.game_id} now ${deal.sale_price} at {deal.store.name}")
            
            # Mark email as sent
            alert.email_sent = True
            alert.email_sent_at = datetime.utcnow()
            
        except Exception as e:
            logger.error(f"Error sending price alert notification: {str(e)}")
    
    def get_user_alerts(self, user_id, active_only=True):
        """Get price alerts for a user"""
        try:
            alerts_query = PriceAlert.query.filter_by(user_id=user_id)
            
            if active_only:
                alerts_query = alerts_query.filter_by(is_active=True)
            
            alerts = alerts_query.order_by(desc(PriceAlert.created_at)).all()
            
            return alerts
        except Exception as e:
            logger.error(f"Error getting user alerts: {str(e)}")
            return []
    
    def delete_price_alert(self, alert_id, user_id):
        """Delete a price alert"""
        try:
            alert = PriceAlert.query.filter_by(
                id=alert_id,
                user_id=user_id
            ).first()
            
            if alert:
                self.db.session.delete(alert)
                self.db.session.commit()
                return True
            
            return False
        except Exception as e:
            logger.error(f"Error deleting price alert: {str(e)}")
            self.db.session.rollback()
            return False
    
    def get_lowest_price(self, game_id, region='US', days=30):
        """Get the lowest price for a game in the specified period"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            lowest_deal = Deal.query.filter(
                Deal.game_id == game_id,
                Deal.region == region,
                Deal.created_at >= start_date
            ).order_by(Deal.sale_price).first()
            
            return lowest_deal
        except Exception as e:
            logger.error(f"Error getting lowest price: {str(e)}")
            return None