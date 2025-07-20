"""
Background tasks for Game Price Tracker
"""

from celery import Celery
from datetime import datetime, timedelta
import logging
import os

# Initialize Celery
celery = Celery('game_tracker')
celery.config_from_object('celeryconfig')

logger = logging.getLogger(__name__)

@celery.task
def update_game_prices():
    """Background task to update game prices"""
    try:
        from app import app, db
        from services.external_apis import PriceUpdateService
        
        with app.app_context():
            price_service = PriceUpdateService(db)
            updated_count = price_service.update_all_prices()
            
            logger.info(f"Price update completed: {updated_count} deals updated")
            return f"Updated {updated_count} deals"
    except Exception as e:
        logger.error(f"Error updating prices: {str(e)}")
        return f"Error: {str(e)}"

@celery.task
def check_price_alerts():
    """Background task to check price alerts"""
    try:
        from app import app, db
        from services.price_service import PriceService
        
        with app.app_context():
            price_service = PriceService(db)
            triggered_count = price_service.check_price_alerts()
            
            logger.info(f"Price alerts checked: {triggered_count} triggered")
            return f"Triggered {triggered_count} alerts"
    except Exception as e:
        logger.error(f"Error checking price alerts: {str(e)}")
        return f"Error: {str(e)}"

@celery.task
def cleanup_old_deals():
    """Background task to clean up old deals"""
    try:
        from app import app, db
        from models import Deal
        
        with app.app_context():
            # Delete deals older than 90 days
            cutoff_date = datetime.utcnow() - timedelta(days=90)
            
            old_deals = Deal.query.filter(Deal.created_at < cutoff_date).all()
            count = len(old_deals)
            
            for deal in old_deals:
                db.session.delete(deal)
            
            db.session.commit()
            
            logger.info(f"Cleaned up {count} old deals")
            return f"Cleaned up {count} old deals"
    except Exception as e:
        logger.error(f"Error cleaning up deals: {str(e)}")
        db.session.rollback()
        return f"Error: {str(e)}"

@celery.task
def send_weekly_digest():
    """Send weekly digest of best deals to users"""
    try:
        from app import app, db
        from models import User, Deal
        from services.email_service import EmailService
        
        with app.app_context():
            # Get users who want email notifications
            users = User.query.filter_by(
                email_notifications=True,
                is_active=True
            ).all()
            
            # Get best deals from the past week
            week_ago = datetime.utcnow() - timedelta(days=7)
            best_deals = Deal.query.filter(
                Deal.created_at >= week_ago,
                Deal.savings_percentage >= 50
            ).order_by(Deal.savings_percentage.desc()).limit(10).all()
            
            if not best_deals:
                return "No deals to send"
            
            email_service = EmailService()
            sent_count = 0
            
            for user in users:
                try:
                    email_service.send_weekly_digest(user, best_deals)
                    sent_count += 1
                except Exception as e:
                    logger.error(f"Failed to send digest to {user.email}: {str(e)}")
            
            logger.info(f"Weekly digest sent to {sent_count} users")
            return f"Sent digest to {sent_count} users"
    except Exception as e:
        logger.error(f"Error sending weekly digest: {str(e)}")
        return f"Error: {str(e)}"

# Periodic task scheduling
from celery.schedules import crontab

celery.conf.beat_schedule = {
    'update-prices': {
        'task': 'tasks.update_game_prices',
        'schedule': crontab(minute=0, hour='*/6'),  # Every 6 hours
    },
    'check-alerts': {
        'task': 'tasks.check_price_alerts',
        'schedule': crontab(minute='*/30'),  # Every 30 minutes
    },
    'cleanup-deals': {
        'task': 'tasks.cleanup_old_deals',
        'schedule': crontab(minute=0, hour=2),  # Daily at 2 AM
    },
    'weekly-digest': {
        'task': 'tasks.send_weekly_digest',
        'schedule': crontab(minute=0, hour=9, day_of_week=1),  # Monday at 9 AM
    },
}

celery.conf.timezone = 'UTC'