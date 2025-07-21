"""
Simplified Game Price Tracker - Flask Application
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gametracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)

# Simple Models
class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    developer = db.Column(db.String(255))
    cover_image_url = db.Column(db.String(500))
    metacritic_score = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Store(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), nullable=False)

class Deal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'))
    store_id = db.Column(db.Integer, db.ForeignKey('store.id'))
    title = db.Column(db.String(255), nullable=False)
    sale_price = db.Column(db.Float, nullable=False)
    normal_price = db.Column(db.Float, nullable=False)
    savings_percentage = db.Column(db.Float, nullable=False)
    deal_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    game = db.relationship('Game', backref='deals')
    store = db.relationship('Store', backref='deals')

# Routes
@app.route('/')
def index():
    """Main dashboard page"""
    # Get sample deals
    deals = Deal.query.order_by(Deal.savings_percentage.desc()).limit(20).all()
    
    # Dashboard stats
    stats = {
        'active_offers': Deal.query.count(),
        'ending_soon': 5,
        'total_value': sum(d.normal_price for d in deals) if deals else 0,
        'your_savings': 75
    }
    
    return render_template('simple_index.html', deals=deals, stats=stats, region='US')

@app.route('/search')
def search():
    """Search page"""
    query = request.args.get('q', '')
    games = []
    
    if query:
        games = Game.query.filter(Game.title.ilike(f'%{query}%')).limit(20).all()
    
    return render_template('simple_search.html', games=games, query=query)

@app.route('/deals')
def deals():
    """Deals page"""
    hot_deals = Deal.query.filter(Deal.savings_percentage >= 50).limit(12).all()
    new_deals = Deal.query.order_by(Deal.created_at.desc()).limit(12).all()
    free_games = Deal.query.filter(Deal.sale_price == 0).limit(12).all()
    
    return render_template('simple_deals.html', 
                         hot_deals=hot_deals, 
                         new_deals=new_deals, 
                         free_games=free_games)

@app.route('/api/deals')
def api_deals():
    """API endpoint for deals"""
    deals = Deal.query.order_by(Deal.savings_percentage.desc()).limit(20).all()
    
    return jsonify([{
        'id': deal.id,
        'title': deal.title,
        'sale_price': float(deal.sale_price),
        'normal_price': float(deal.normal_price),
        'savings_percentage': float(deal.savings_percentage),
        'deal_url': deal.deal_url or '#',
        'store_name': deal.store.name if deal.store else 'Unknown'
    } for deal in deals])

# Initialize database and sample data
@app.before_first_request
def create_tables():
    db.create_all()
    
    # Add sample data if empty
    if Store.query.count() == 0:
        stores = [
            Store(name='Steam', slug='steam'),
            Store(name='Epic Games', slug='epic'),
            Store(name='GOG', slug='gog'),
            Store(name='Humble Store', slug='humble')
        ]
        for store in stores:
            db.session.add(store)
        
        games = [
            Game(title='Cyberpunk 2077', developer='CD Projekt RED', metacritic_score=86),
            Game(title='The Witcher 3', developer='CD Projekt RED', metacritic_score=93),
            Game(title='Grand Theft Auto V', developer='Rockstar Games', metacritic_score=97),
            Game(title='Red Dead Redemption 2', developer='Rockstar Games', metacritic_score=97)
        ]
        for game in games:
            db.session.add(game)
        
        db.session.commit()
        
        # Add sample deals
        deals = [
            Deal(game_id=1, store_id=1, title='Cyberpunk 2077', sale_price=29.99, normal_price=59.99, savings_percentage=50, deal_url='#'),
            Deal(game_id=2, store_id=2, title='The Witcher 3', sale_price=9.99, normal_price=39.99, savings_percentage=75, deal_url='#'),
            Deal(game_id=3, store_id=1, title='Grand Theft Auto V', sale_price=14.99, normal_price=29.99, savings_percentage=50, deal_url='#'),
            Deal(game_id=4, store_id=3, title='Red Dead Redemption 2', sale_price=39.99, normal_price=59.99, savings_percentage=33, deal_url='#')
        ]
        for deal in deals:
            db.session.add(deal)
        
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)