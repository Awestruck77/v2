"""
Production WSGI entry point for Game Price Tracker
"""

from app import app
from models import db

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    app.run(host='0.0.0.0', port=8000, debug=False)