"""
Game Price Tracker - Main Flask Application
"""
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///gametracker.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
login_manager = LoginManager(app)
login_manager.login_view = 'auth.login'
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import models and services
try:
    from models import User, Game, Store, Deal, UserWishlist, PriceAlert
    from services.game_service import GameService
    from services.deal_service import DealService
    from services.price_service import PriceService
    from services.external_apis import SteamAPI, EpicAPI, GOGAPI
except ImportError as e:
    print(f"Import error: {e}")
    # Create minimal models for initial setup
    class User(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        email = db.Column(db.String(255), unique=True, nullable=False)
        password_hash = db.Column(db.String(255), nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    class Game(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        title = db.Column(db.String(255), nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    class Store(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(100), nullable=False)
        slug = db.Column(db.String(100), nullable=False)
    
    class Deal(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        title = db.Column(db.String(255), nullable=False)
        sale_price = db.Column(db.Float, nullable=False)
        normal_price = db.Column(db.Float, nullable=False)
        savings_percentage = db.Column(db.Float, nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    class UserWishlist(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, nullable=False)
        game_id = db.Column(db.Integer, nullable=False)
    
    class PriceAlert(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, nullable=False)
        game_id = db.Column(db.Integer, nullable=False)
        target_price = db.Column(db.Float, nullable=False)
    
    # Create minimal services
    class GameService:
        def __init__(self, db): self.db = db
        def search_games(self, **kwargs): return []
        def get_game_details(self, game_id): return None
        def get_similar_games(self, game_id, limit=6): return []
    
    class DealService:
        def __init__(self, db): self.db = db
        def get_hot_deals(self, **kwargs): return []
        def get_recent_deals(self, **kwargs): return []
        def get_free_games(self, **kwargs): return []
        def get_deals(self, **kwargs): return []
        def get_store_deals(self, store_id, **kwargs): return []
    
    class PriceService:
        def __init__(self, db): self.db = db
        def get_price_history(self, game_id, **kwargs): return {}
        def check_price_alerts(self): return 0

# User loader for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Initialize services
game_service = GameService(db)
deal_service = DealService(db)
price_service = PriceService(db)

# Routes
@app.route('/')
def index():
    """Main dashboard page"""
    try:
        # Get user's preferred region
        region = session.get('region', 'US')
        
        # Get latest deals
        hot_deals = deal_service.get_hot_deals(limit=20, region=region)
        
        # Get dashboard stats
        stats = {
            'active_offers': len(hot_deals),
            'ending_soon': len([d for d in hot_deals if d.deal_end_date and 
                              d.deal_end_date < datetime.utcnow() + timedelta(days=2)]),
            'total_value': sum(d.normal_price for d in hot_deals),
            'your_savings': 85 if current_user.is_authenticated else 0
        }
        
        return render_template('index.html', 
                             deals=hot_deals, 
                             stats=stats, 
                             region=region)
    except Exception as e:
        logger.error(f"Error loading index page: {str(e)}")
        flash('Error loading deals. Please try again.', 'error')
        return render_template('index.html', deals=[], stats={})

@app.route('/api/deals')
def api_deals():
    """API endpoint for deals"""
    try:
        region = request.args.get('region', 'US')
        limit = int(request.args.get('limit', 20))
        store_id = request.args.get('store_id')
        
        deals = deal_service.get_deals(
            region=region,
            limit=limit,
            store_id=store_id
        )
        
        return jsonify([{
            'id': deal.id,
            'title': deal.title,
            'game_title': deal.game.title if deal.game else deal.title,
            'store_name': deal.store.name if deal.store else 'Unknown',
            'sale_price': float(deal.sale_price),
            'normal_price': float(deal.normal_price),
            'savings_percentage': float(deal.savings_percentage),
            'deal_url': deal.deal_url,
            'image_url': deal.game.cover_image_url if deal.game else None,
            'rating': deal.game.metacritic_score if deal.game else None,
            'created_at': deal.created_at.isoformat()
        } for deal in deals])
    except Exception as e:
        logger.error(f"Error fetching deals: {str(e)}")
        return jsonify({'error': 'Failed to fetch deals'}), 500

@app.route('/search')
def search():
    """Advanced search page"""
    query = request.args.get('q', '')
    genre = request.args.get('genre', '')
    min_rating = request.args.get('min_rating', 0, type=int)
    max_price = request.args.get('max_price', 999, type=float)
    
    games = game_service.search_games(
        query=query,
        genre=genre,
        min_rating=min_rating,
        max_price=max_price
    )
    
    return render_template('search.html', 
                         games=games, 
                         query=query,
                         genre=genre,
                         min_rating=min_rating,
                         max_price=max_price)

@app.route('/game/<int:game_id>')
def game_details(game_id):
    """Game details page"""
    try:
        game = game_service.get_game_details(game_id)
        if not game:
            flash('Game not found.', 'error')
            return redirect(url_for('index'))
        
        # Get price history
        price_history = price_service.get_price_history(game_id, days=30)
        
        # Get similar games
        similar_games = game_service.get_similar_games(game_id, limit=6)
        
        return render_template('game_details.html',
                             game=game,
                             price_history=price_history,
                             similar_games=similar_games)
    except Exception as e:
        logger.error(f"Error loading game details: {str(e)}")
        flash('Error loading game details.', 'error')
        return redirect(url_for('index'))

@app.route('/wishlist')
@login_required
def wishlist():
    """User wishlist page"""
    try:
        wishlist_items = UserWishlist.query.filter_by(user_id=current_user.id).all()
        games = [item.game for item in wishlist_items]
        
        # Calculate wishlist stats
        stats = {
            'total_games': len(games),
            'on_sale': len([g for g in games if g.deals and any(d.is_on_sale for d in g.deals)]),
            'price_alerts': PriceAlert.query.filter_by(user_id=current_user.id, is_active=True).count(),
            'total_value': sum(min([d.sale_price for d in g.deals] or [0]) for g in games)
        }
        
        return render_template('wishlist.html', games=games, stats=stats)
    except Exception as e:
        logger.error(f"Error loading wishlist: {str(e)}")
        flash('Error loading wishlist.', 'error')
        return render_template('wishlist.html', games=[], stats={})

@app.route('/api/wishlist/add', methods=['POST'])
@login_required
def add_to_wishlist():
    """Add game to wishlist"""
    try:
        game_id = request.json.get('game_id')
        
        # Check if already in wishlist
        existing = UserWishlist.query.filter_by(
            user_id=current_user.id,
            game_id=game_id
        ).first()
        
        if existing:
            return jsonify({'error': 'Game already in wishlist'}), 400
        
        # Add to wishlist
        wishlist_item = UserWishlist(
            user_id=current_user.id,
            game_id=game_id,
            added_at=datetime.utcnow()
        )
        db.session.add(wishlist_item)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Added to wishlist'})
    except Exception as e:
        logger.error(f"Error adding to wishlist: {str(e)}")
        return jsonify({'error': 'Failed to add to wishlist'}), 500

@app.route('/api/wishlist/remove', methods=['POST'])
@login_required
def remove_from_wishlist():
    """Remove game from wishlist"""
    try:
        game_id = request.json.get('game_id')
        
        wishlist_item = UserWishlist.query.filter_by(
            user_id=current_user.id,
            game_id=game_id
        ).first()
        
        if wishlist_item:
            db.session.delete(wishlist_item)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Removed from wishlist'})
        
        return jsonify({'error': 'Game not in wishlist'}), 404
    except Exception as e:
        logger.error(f"Error removing from wishlist: {str(e)}")
        return jsonify({'error': 'Failed to remove from wishlist'}), 500

@app.route('/deals')
def deals():
    """Deals page with categories"""
    try:
        region = session.get('region', 'US')
        
        # Get different categories of deals
        hot_deals = deal_service.get_hot_deals(limit=12, region=region)
        new_deals = deal_service.get_recent_deals(limit=12, region=region)
        free_games = deal_service.get_free_games(limit=12, region=region)
        
        return render_template('deals.html',
                             hot_deals=hot_deals,
                             new_deals=new_deals,
                             free_games=free_games)
    except Exception as e:
        logger.error(f"Error loading deals page: {str(e)}")
        flash('Error loading deals.', 'error')
        return render_template('deals.html', hot_deals=[], new_deals=[], free_games=[])

@app.route('/free-games')
def free_games():
    """Free games page"""
    try:
        region = session.get('region', 'US')
        free_games = deal_service.get_free_games(limit=20, region=region)
        
        return render_template('free_games.html', games=free_games)
    except Exception as e:
        logger.error(f"Error loading free games: {str(e)}")
        flash('Error loading free games.', 'error')
        return render_template('free_games.html', games=[])

@app.route('/store/<store_name>')
def store_page(store_name):
    """Individual store page"""
    try:
        store = Store.query.filter_by(slug=store_name).first()
        if not store:
            flash('Store not found.', 'error')
            return redirect(url_for('index'))
        
        region = session.get('region', 'US')
        deals = deal_service.get_store_deals(store.id, region=region, limit=20)
        
        # Calculate store stats
        stats = {
            'active_deals': len(deals),
            'avg_discount': sum(d.savings_percentage for d in deals) / len(deals) if deals else 0,
            'avg_rating': 8.5,  # Mock data
            'total_savings': sum(d.normal_price - d.sale_price for d in deals)
        }
        
        return render_template('store.html', store=store, deals=deals, stats=stats)
    except Exception as e:
        logger.error(f"Error loading store page: {str(e)}")
        flash('Error loading store page.', 'error')
        return redirect(url_for('index'))

@app.route('/settings')
@login_required
def settings():
    """User settings page"""
    return render_template('settings.html', user=current_user)

@app.route('/api/settings', methods=['POST'])
@login_required
def update_settings():
    """Update user settings"""
    try:
        data = request.json
        
        # Update user preferences
        if 'preferred_currency' in data:
            current_user.preferred_currency = data['preferred_currency']
        if 'preferred_region' in data:
            current_user.preferred_region = data['preferred_region']
        if 'theme_preference' in data:
            current_user.theme_preference = data['theme_preference']
        if 'email_notifications' in data:
            current_user.email_notifications = data['email_notifications']
        
        db.session.commit()
        
        # Update session
        session['region'] = current_user.preferred_region
        
        return jsonify({'success': True, 'message': 'Settings updated'})
    except Exception as e:
        logger.error(f"Error updating settings: {str(e)}")
        return jsonify({'error': 'Failed to update settings'}), 500

@app.route('/api/region', methods=['POST'])
def set_region():
    """Set user's preferred region"""
    try:
        region = request.json.get('region', 'US')
        session['region'] = region
        
        if current_user.is_authenticated:
            current_user.preferred_region = region
            db.session.commit()
        
        return jsonify({'success': True, 'region': region})
    except Exception as e:
        logger.error(f"Error setting region: {str(e)}")
        return jsonify({'error': 'Failed to set region'}), 500

# Authentication routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if request.method == 'POST':
        try:
            data = request.json if request.is_json else request.form
            email = data.get('email')
            password = data.get('password')
            
            user = User.query.filter_by(email=email).first()
            
            if user and check_password_hash(user.password_hash, password):
                login_user(user)
                session['region'] = user.preferred_region
                
                if request.is_json:
                    return jsonify({'success': True, 'message': 'Logged in successfully'})
                else:
                    flash('Logged in successfully!', 'success')
                    return redirect(url_for('index'))
            else:
                if request.is_json:
                    return jsonify({'error': 'Invalid credentials'}), 401
                else:
                    flash('Invalid email or password.', 'error')
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            if request.is_json:
                return jsonify({'error': 'Login failed'}), 500
            else:
                flash('Login failed. Please try again.', 'error')
    
    return render_template('auth/login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """User registration"""
    if request.method == 'POST':
        try:
            data = request.json if request.is_json else request.form
            email = data.get('email')
            password = data.get('password')
            username = data.get('username', '')
            
            # Check if user exists
            if User.query.filter_by(email=email).first():
                if request.is_json:
                    return jsonify({'error': 'Email already registered'}), 400
                else:
                    flash('Email already registered.', 'error')
                    return render_template('auth/register.html')
            
            # Create new user
            user = User(
                email=email,
                username=username,
                password_hash=generate_password_hash(password),
                created_at=datetime.utcnow()
            )
            db.session.add(user)
            db.session.commit()
            
            login_user(user)
            
            if request.is_json:
                return jsonify({'success': True, 'message': 'Account created successfully'})
            else:
                flash('Account created successfully!', 'success')
                return redirect(url_for('index'))
                
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            if request.is_json:
                return jsonify({'error': 'Registration failed'}), 500
            else:
                flash('Registration failed. Please try again.', 'error')
    
    return render_template('auth/register.html')

@app.route('/logout')
@login_required
def logout():
    """User logout"""
    logout_user()
    session.pop('region', None)
    flash('Logged out successfully.', 'success')
    return redirect(url_for('index'))

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('errors/500.html'), 500

# CLI commands for database initialization
@app.cli.command()
def init_db():
    """Initialize the database with sample data"""
    db.create_all()
    
    # Create sample stores
    stores = [
        Store(name='Steam', slug='steam', base_url='https://store.steampowered.com', is_active=True),
        Store(name='Epic Games', slug='epic', base_url='https://store.epicgames.com', is_active=True),
        Store(name='GOG', slug='gog', base_url='https://www.gog.com', is_active=True),
        Store(name='Humble Store', slug='humble', base_url='https://www.humblebundle.com/store', is_active=True),
        Store(name='Fanatical', slug='fanatical', base_url='https://www.fanatical.com', is_active=True)
    ]
    
    for store in stores:
        if not Store.query.filter_by(slug=store.slug).first():
            db.session.add(store)
    
    db.session.commit()
    print("Database initialized with sample data!")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)