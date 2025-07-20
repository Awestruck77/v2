# Game Price Tracker - Python Edition

A comprehensive Python web application that tracks game prices and deals across multiple digital storefronts including Steam, Epic Games Store, GOG, Humble Store, and Fanatical.

## 🚀 Features

- **Multi-Store Price Tracking**: Compare prices across Steam, Epic Games, GOG, Humble Store, and Fanatical
- **Real-time Deal Monitoring**: Automated price updates and deal discovery
- **User Wishlist**: Save games and get price drop notifications
- **Advanced Search & Filters**: Find games by title, genre, price range, and discount percentage
- **Price History**: Track price changes over time
- **Regional Pricing**: Support for multiple currencies and regions
- **Responsive Design**: Mobile-friendly interface with dark theme
- **Background Tasks**: Automated price updates and notifications

## 🏗️ Architecture

### Backend (Python + Flask)
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: PostgreSQL (SQLite for development)
- **Task Queue**: Celery with Redis
- **Caching**: Redis for API response caching
- **APIs**: CheapShark, Steam Web API, Epic Games Store, GOG

### Frontend (Server-Side Rendered)
- **Templates**: Jinja2 with Tailwind CSS
- **Styling**: Tailwind CSS with custom game theme
- **JavaScript**: Vanilla JS for interactivity
- **Icons**: Font Awesome

## 📁 Project Structure

```
game-price-tracker/
├── app.py                  # Main Flask application
├── models.py              # Database models
├── config.py              # Configuration settings
├── tasks.py               # Celery background tasks
├── celeryconfig.py        # Celery configuration
├── run.py                 # Production WSGI entry point
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Multi-container setup
├── services/             # Business logic services
│   ├── __init__.py
│   ├── game_service.py   # Game-related operations
│   ├── deal_service.py   # Deal management
│   ├── price_service.py  # Price tracking and alerts
│   └── external_apis.py  # External API integrations
├── templates/            # Jinja2 templates
│   ├── base.html         # Base template
│   ├── index.html        # Homepage
│   ├── search.html       # Advanced search
│   ├── deals.html        # Deals page
│   ├── wishlist.html     # User wishlist
│   └── auth/             # Authentication templates
│       ├── login.html
│       └── register.html
└── migrations/           # Database migrations
    └── env.py
```

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.11+
- PostgreSQL (or use Docker)
- Redis
- API Keys for external services (optional)

### Local Development

1. **Clone and setup virtual environment**:
```bash
git clone <repository-url>
cd game-price-tracker
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Environment Configuration**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup**:
```bash
# Initialize database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Seed initial data
flask init-db
```

4. **Start Services**:
```bash
# Start Redis (if not using Docker)
redis-server

# Start Flask application
python app.py

# Start Celery worker (in another terminal)
celery -A tasks.celery worker --loglevel=info

# Start Celery beat (in another terminal)
celery -A tasks.celery beat --loglevel=info
```

### Docker Development (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Initialize database
docker-compose exec web flask init-db

# Stop services
docker-compose down
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gametracker

# Redis
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key-here

# External APIs (optional)
STEAM_API_KEY=your_steam_api_key
IGDB_CLIENT_ID=your_igdb_client_id
IGDB_CLIENT_SECRET=your_igdb_client_secret

# Email (optional)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

## 📊 API Endpoints

### Game & Deal Endpoints
- `GET /` - Homepage with latest deals
- `GET /search` - Advanced search page
- `GET /deals` - Deals page with categories
- `GET /game/<id>` - Game details page
- `GET /api/deals` - JSON API for deals
- `POST /api/region` - Set user region

### User Features
- `GET /wishlist` - User wishlist (requires login)
- `POST /api/wishlist/add` - Add game to wishlist
- `POST /api/wishlist/remove` - Remove from wishlist
- `POST /api/settings` - Update user settings

### Authentication
- `GET /login` - Login page
- `POST /login` - Process login
- `GET /register` - Registration page
- `POST /register` - Process registration
- `GET /logout` - Logout user

## 🔄 Background Tasks

The application runs several background tasks using Celery:

1. **Price Updates**: Refresh game prices every 6 hours
2. **Price Alerts**: Check for price drops every 30 minutes
3. **Data Cleanup**: Remove old deals daily at 2 AM
4. **Weekly Digest**: Send deal summary emails on Mondays

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**:
```bash
# Set production environment variables
export FLASK_ENV=production
export DATABASE_URL=your_production_db_url
export REDIS_URL=your_production_redis_url
export SECRET_KEY=your_production_secret_key
```

2. **Database Migration**:
```bash
flask db upgrade
flask init-db
```

3. **Start Services**:
```bash
# Web server
gunicorn --bind 0.0.0.0:8000 --workers 4 run:app

# Background workers
celery -A tasks.celery worker --loglevel=info --concurrency=4
celery -A tasks.celery beat --loglevel=info
```

### Docker Production

```bash
# Build and deploy
docker-compose -f docker-compose.yml up -d

# Scale workers
docker-compose up -d --scale worker=3
```

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-flask

# Run tests
pytest

# Run with coverage
pytest --cov=app
```

## 📈 Performance Considerations

- **Caching**: Redis for API response caching (30-minute TTL)
- **Rate Limiting**: Implemented for all external API calls
- **Database Indexing**: Optimized queries for game search
- **Background Processing**: Celery for heavy operations
- **Connection Pooling**: PostgreSQL connection pooling

## 🔒 Security

- **Password Hashing**: bcrypt for secure password storage
- **Session Management**: Flask-Login for user sessions
- **CSRF Protection**: Flask-WTF for form protection
- **Input Validation**: SQLAlchemy ORM prevents SQL injection
- **Environment Variables**: Sensitive data not in code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Write tests for new features
- Update documentation for API changes
- Use type hints where appropriate

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CheapShark API](https://apidocs.cheapshark.com/) for deal aggregation
- [Steam Web API](https://steamcommunity.com/dev) for game metadata
- [Flask](https://flask.palletsprojects.com/) for the web framework
- [Celery](https://docs.celeryproject.org/) for background tasks

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

---

**Happy Gaming! 🎮**