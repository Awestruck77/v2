"""
Background task scheduler for price updates and deal discovery
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
import logging
from datetime import datetime

from app.core.config import settings
from app.tasks.price_updater import PriceUpdater
from app.tasks.deal_discovery import DealDiscovery
from app.tasks.notification_sender import NotificationSender

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = AsyncIOScheduler()


def start_scheduler():
    """Start the background task scheduler"""
    
    if scheduler.running:
        logger.warning("Scheduler is already running")
        return
    
    try:
        # Price update task - every 6 hours
        scheduler.add_job(
            PriceUpdater.update_all_prices,
            trigger=IntervalTrigger(hours=settings.PRICE_UPDATE_INTERVAL_HOURS),
            id="price_updater",
            name="Update game prices",
            replace_existing=True,
            max_instances=1
        )
        
        # Deal discovery task - every 2 hours
        scheduler.add_job(
            DealDiscovery.discover_new_deals,
            trigger=IntervalTrigger(hours=settings.DEAL_DISCOVERY_INTERVAL_HOURS),
            id="deal_discovery",
            name="Discover new deals",
            replace_existing=True,
            max_instances=1
        )
        
        # Price alert checker - every 30 minutes
        scheduler.add_job(
            NotificationSender.check_price_alerts,
            trigger=IntervalTrigger(minutes=30),
            id="price_alerts",
            name="Check price alerts",
            replace_existing=True,
            max_instances=1
        )
        
        # Daily cleanup task - every day at 2 AM
        scheduler.add_job(
            cleanup_old_data,
            trigger=CronTrigger(hour=2, minute=0),
            id="daily_cleanup",
            name="Daily data cleanup",
            replace_existing=True,
            max_instances=1
        )
        
        # Weekly deal summary - every Sunday at 9 AM
        scheduler.add_job(
            NotificationSender.send_weekly_deal_summary,
            trigger=CronTrigger(day_of_week=6, hour=9, minute=0),
            id="weekly_summary",
            name="Weekly deal summary",
            replace_existing=True,
            max_instances=1
        )
        
        scheduler.start()
        logger.info("Background scheduler started successfully")
        
        # Log scheduled jobs
        for job in scheduler.get_jobs():
            logger.info(f"Scheduled job: {job.name} (ID: {job.id})")
            
    except Exception as e:
        logger.error(f"Failed to start scheduler: {str(e)}")
        raise


def stop_scheduler():
    """Stop the background task scheduler"""
    
    if not scheduler.running:
        logger.warning("Scheduler is not running")
        return
    
    try:
        scheduler.shutdown(wait=True)
        logger.info("Background scheduler stopped successfully")
    except Exception as e:
        logger.error(f"Failed to stop scheduler: {str(e)}")


async def cleanup_old_data():
    """Clean up old price history and expired deals"""
    
    logger.info("Starting daily data cleanup...")
    
    try:
        from app.core.database import AsyncSessionLocal
        from app.models.game import Deal
        from sqlalchemy import delete
        from datetime import timedelta
        
        async with AsyncSessionLocal() as db:
            # Delete deals older than 90 days
            cutoff_date = datetime.utcnow() - timedelta(days=90)
            
            delete_query = delete(Deal).where(Deal.created_at < cutoff_date)
            result = await db.execute(delete_query)
            
            await db.commit()
            
            deleted_count = result.rowcount
            logger.info(f"Cleaned up {deleted_count} old deals")
            
    except Exception as e:
        logger.error(f"Error during data cleanup: {str(e)}")


def get_scheduler_status():
    """Get current scheduler status"""
    
    if not scheduler.running:
        return {"status": "stopped", "jobs": []}
    
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
            "trigger": str(job.trigger)
        })
    
    return {
        "status": "running",
        "jobs": jobs,
        "job_count": len(jobs)
    }


# Manual task triggers for testing/admin use
async def trigger_price_update():
    """Manually trigger price update"""
    logger.info("Manually triggering price update...")
    await PriceUpdater.update_all_prices()


async def trigger_deal_discovery():
    """Manually trigger deal discovery"""
    logger.info("Manually triggering deal discovery...")
    await DealDiscovery.discover_new_deals()


async def trigger_price_alerts():
    """Manually trigger price alert check"""
    logger.info("Manually triggering price alert check...")
    await NotificationSender.check_price_alerts()