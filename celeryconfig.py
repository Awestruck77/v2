"""
Celery configuration for Game Price Tracker
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Broker settings
broker_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
result_backend = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

# Task settings
task_serializer = 'json'
accept_content = ['json']
result_serializer = 'json'
timezone = 'UTC'
enable_utc = True

# Worker settings
worker_prefetch_multiplier = 1
task_acks_late = True
worker_max_tasks_per_child = 1000

# Beat settings
beat_scheduler = 'celery.beat:PersistentScheduler'
beat_schedule_filename = 'celerybeat-schedule'

# Task routing
task_routes = {
    'tasks.update_game_prices': {'queue': 'price_updates'},
    'tasks.check_price_alerts': {'queue': 'alerts'},
    'tasks.cleanup_old_deals': {'queue': 'maintenance'},
    'tasks.send_weekly_digest': {'queue': 'emails'},
}

# Result expiration
result_expires = 3600  # 1 hour