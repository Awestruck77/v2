# Game Price Tracker

A comprehensive web application that tracks game prices and deals across multiple digital storefronts including Steam, Epic Games Store, and GOG.

## 🚀 Features

- **Multi-Store Price Tracking**: Compare prices across Steam, Epic Games, and GOG
- **Real-time Deal Monitoring**: Automated price updates and deal discovery
- **User Wishlist**: Save games and get price drop notifications
- **Advanced Search & Filters**: Find games by title, genre, price range, and discount percentage
- **Price History**: Track price changes over time with interactive charts
- **Regional Pricing**: Support for multiple currencies and regions
- **Responsive Design**: Mobile-friendly interface with dark/light themes

## 🏗️ Architecture

### Backend (Python + FastAPI)
- **Framework**: FastAPI with async support
- **Database**: PostgreSQL (SQLite for development)
- **Task Scheduler**: APScheduler for price updates
- **APIs**: IGDB, Steam Web API, Epic Games Store, GOG

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS + Shadcn/UI components
- **Build Tool**: Vite
- **State Management**: React Query for server state

## 📁 Project Structure

```
game-price-tracker/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Configuration and security
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic and external APIs
│   │   ├── tasks/          # Background tasks
│   │   └── main.py         # FastAPI application
│   ├── alembic/            # Database migrations
│   ├── tests/              # Backend tests
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and API clients
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
├── docker-compose.yml      # Development environment
├── .env.example           # Environment variables template
└── deploy/                # Deployment configurations
```

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL (or use Docker)
- API Keys for IGDB (Twitch Developer)

### Backend Setup

1. **Clone and navigate to backend**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Environment Configuration**:
```bash
cp .env.example .env
# Edit .env with your API keys and database URL
```

3. **Database Setup**:
```bash
# Run migrations
alembic upgrade head

# Seed initial data
python -m app.scripts.seed_data
```

4. **Start Backend**:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Navigate to frontend**:
```bash
cd frontend
npm install
```

2. **Environment Configuration**:
```bash
cp .env.example .env.local
# Edit with your backend API URL
```

3. **Start Frontend**:
```bash
npm run dev
```

### Docker Development (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 API Configuration

### Required API Keys

1. **IGDB API (Game Metadata)**:
   - Create Twitch Developer account
   - Get Client ID and Client Secret
   - Documentation: https://api-docs.igdb.com/

2. **Steam Web API**:
   - No key required for basic endpoints
   - Rate limited to prevent abuse

3. **Epic Games Store**:
   - Uses unofficial API wrapper
   - No authentication required

4. **GOG.com**:
   - Uses web scraping approach
   - Respectful rate limiting implemented

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gametracker

# API Keys
IGDB_CLIENT_ID=your_twitch_client_id
IGDB_CLIENT_SECRET=your_twitch_client_secret

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256

# External APIs
STEAM_API_KEY=optional_steam_key
```

## 📊 API Endpoints

### Game Search & Discovery
- `GET /api/v1/games/search` - Search games across all stores
- `GET /api/v1/games/{game_id}` - Get detailed game information
- `GET /api/v1/deals` - Get current deals with filters

### Store-Specific Endpoints
- `GET /api/v1/stores/steam/deals` - Steam-specific deals
- `GET /api/v1/stores/epic/deals` - Epic Games deals
- `GET /api/v1/stores/gog/deals` - GOG deals

### User Features
- `POST /api/v1/wishlist` - Add game to wishlist
- `GET /api/v1/wishlist` - Get user's wishlist
- `POST /api/v1/alerts` - Set price alerts

### Price History
- `GET /api/v1/games/{game_id}/price-history` - Historical price data

## 🔄 Background Tasks

The application runs several background tasks:

1. **Price Updates**: Refresh game prices every 6 hours
2. **Deal Discovery**: Find new deals and discounts
3. **Price Alerts**: Check for price drops and send notifications
4. **Data Cleanup**: Remove outdated price history

## 🚀 Deployment

### Backend Deployment (Railway/Fly.io)

1. **Railway**:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

2. **Fly.io**:
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly deploy
```

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Database (Supabase)

1. Create project at https://supabase.com
2. Get connection string
3. Update DATABASE_URL in environment

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### Integration Tests
```bash
# Run full test suite
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 📈 Performance Considerations

- **Caching**: Redis for API response caching
- **Rate Limiting**: Implemented for all external API calls
- **Database Indexing**: Optimized queries for game search
- **CDN**: Static assets served via CDN
- **Lazy Loading**: Frontend components and images

## 🔒 Security

- **API Rate Limiting**: Prevents abuse
- **Input Validation**: Pydantic models for request validation
- **CORS Configuration**: Properly configured for production
- **Environment Variables**: Sensitive data not in code
- **SQL Injection Prevention**: ORM-based queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Write tests for new features
- Update documentation for API changes
- Use conventional commits

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [IGDB](https://www.igdb.com/) for game metadata
- [Steam](https://store.steampowered.com/) for pricing data
- [Epic Games Store](https://store.epicgames.com/) for deals
- [GOG](https://www.gog.com/) for DRM-free game information

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the [Wiki](../../wiki) for detailed documentation
- Join our [Discord](https://discord.gg/gametracker) community

---

**Happy Gaming! 🎮**