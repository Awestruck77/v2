# Game Price Tracker

A modern web application for tracking and comparing game prices across multiple digital storefronts and regions.

## Features

✅ **Multi-Store Price Comparison**
- Steam, Epic Games Store, and GOG integration
- Real-time price tracking and comparison
- Best deal highlighting

✅ **Regional Pricing Support**
- Multiple regions: US, UK, Germany, India, Canada, Australia
- Currency conversion and regional price variations
- Dynamic pricing updates when switching regions

✅ **Advanced Game Cards**
- Vertical game covers with proper aspect ratios
- Critic scores and user ratings displayed prominently
- Discount badges and percentage savings
- Store-specific pricing information

✅ **Search & Discovery**
- Full-text search across game titles and tags
- Real-time filtering and results
- Responsive grid layout

✅ **Error Handling**
- Comprehensive error dialog system
- Network connectivity error detection
- API rate limiting and timeout handling
- User-friendly error messages with suggested solutions

✅ **Modern UI/UX**
- Dark gaming-themed design system
- Responsive layout for all devices
- Smooth animations and transitions
- Clean, intuitive interface

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/UI
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React hooks

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open http://localhost:8080

## Design System

The application uses a custom gaming-themed design system with:
- Dark color palette optimized for gaming content
- Purple accent colors for interactive elements
- Custom color tokens for different store types
- Responsive breakpoints and spacing system

## Error Codes Reference

- **NET_001**: Network connection issues
- **NET_002**: Connection timeout
- **API_001**: Service temporarily unavailable
- **API_002**: Rate limit exceeded
- **API_003**: Invalid region selected
- **GAME_001**: Game data loading failed
- **SEARCH_001**: Search service unavailable

## Regional Pricing

Supported regions with currency conversion:
- United States (USD) - Base pricing
- United Kingdom (GBP) - 85% of USD
- Germany (EUR) - 90% of USD  
- India (INR) - 30% of USD
- Canada (CAD) - 125% of USD
- Australia (AUD) - 140% of USD

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and feature requests, please open an issue on GitHub.