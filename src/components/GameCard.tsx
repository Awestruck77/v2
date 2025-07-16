import { Star, ExternalLink, Heart, HeartOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StoreIcon } from '@/components/StoreIcon';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface Game {
  id: string;
  title: string;
  image: string;
  stores: Array<{
    store: 'steam' | 'epic' | 'gog' | 'humble' | 'fanatical';
    price: number;
    originalPrice?: number;
    discount?: number;
    dealID?: string;
    storeID?: string;
    url?: string;
  }>;
  rating: number;
  criticScore: number;
  tags: string[];
  steamAppID?: string;
  developer?: string;
  publisher?: string;
}

interface Region {
  code: string;
  name: string;
  currency: string;
  symbol: string;
}

interface GameCardProps {
  game: Game;
  currency: Region;
}

export const GameCard = ({ game, currency }: GameCardProps) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.some((item: any) => item.id === game.id));
  }, [game.id]);

  const formatPrice = (price: number) => {
    if (price === 0) return 'FREE';
    
    // Format based on currency
    switch (currency.currency) {
      case 'USD':
        return `$${price.toFixed(2)}`;
      case 'EUR':
        return `€${price.toFixed(2)}`;
      case 'GBP':
        return `£${price.toFixed(2)}`;
      case 'INR':
        return `₹${Math.round(price)}`;
      case 'CAD':
        return `C$${price.toFixed(2)}`;
      case 'AUD':
        return `A$${price.toFixed(2)}`;
      default:
        return `${currency.symbol}${price.toFixed(2)}`;
    }
  };

  const getBestDeal = () => {
    return game.stores.reduce((best, current) => 
      current.price < best.price ? current : best
    );
  };

  const bestDeal = getBestDeal();

  const handleGameClick = () => {
    navigate(`/game/${game.id}`);
  };

  const handleStoreClick = (store: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (store.url) {
      window.open(store.url, '_blank');
      return;
    }

    const storeUrls: { [key: string]: string } = {
      steam: `https://store.steampowered.com/app/${game.steamAppID || ''}`,
      epic: 'https://store.epicgames.com',
      gog: 'https://www.gog.com',
      humble: 'https://www.humblebundle.com/store',
      fanatical: 'https://www.fanatical.com',
    };

    if (store.dealID) {
      window.open(`https://www.cheapshark.com/redirect?dealID=${store.dealID}`, '_blank');
    } else {
      const url = storeUrls[store.store] || '#';
      if (url !== '#') {
        window.open(url, '_blank');
      }
    }
  };

  const handleViewBestPrice = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleStoreClick(bestDeal, e);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (isWishlisted) {
      const updatedWishlist = wishlist.filter((item: any) => item.id !== game.id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsWishlisted(false);
    } else {
      const gameWithDate = { ...game, dateAdded: new Date().toISOString() };
      wishlist.push(gameWithDate);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsWishlisted(true);
    }
  };

  const getHighQualityImage = (game: Game) => {
    // Try to get high quality Steam image first
    if (game.steamAppID) {
      return `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamAppID}/library_600x900_2x.jpg`;
    }
    
    // Fallback to original image or placeholder
    return game.image || `https://via.placeholder.com/300x400/1a1a1a/888888?text=${encodeURIComponent(game.title)}`;
  };

  const getStoreName = (store: string) => {
    switch (store) {
      case 'steam': return 'Steam';
      case 'epic': return 'Epic';
      case 'gog': return 'Gog';
      case 'humble': return 'Humble';
      case 'fanatical': return 'Fanatical';
      default: return store;
    }
  };

  return (
    <Card 
      className="group relative overflow-hidden bg-white hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col cursor-pointer"
      onClick={handleGameClick}
    >
      {/* Image Container with critic score overlay */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={getHighQualityImage(game)}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Try Steam header image as fallback
            if (game.steamAppID && !target.src.includes('header.jpg')) {
              target.src = `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamAppID}/header.jpg`;
            } else {
              target.src = `https://via.placeholder.com/300x400/1a1a1a/888888?text=${encodeURIComponent(game.title)}`;
            }
          }}
        />
        
        {/* Critic Score - Top Right with black background */}
        <div className="absolute top-3 right-3">
          <div className="bg-black text-white px-2 py-1 rounded flex items-center gap-1">
            <Star className="w-3 h-3 fill-current text-yellow-400" />
            <span className="text-sm font-bold">{game.criticScore}</span>
          </div>
        </div>

        {/* Wishlist Button - Top Left */}
        <Button
          size="sm"
          variant="secondary"
          onClick={toggleWishlist}
          className="absolute top-3 left-3 h-8 w-8 p-0 bg-black/70 hover:bg-black/90 border-0"
        >
          {isWishlisted ? (
            <Heart className="w-4 h-4 text-red-500 fill-current" />
          ) : (
            <HeartOff className="w-4 h-4 text-white" />
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col bg-white">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base leading-tight mb-2 line-clamp-2 min-h-[2.5rem]">
          {game.title}
        </h3>

        {/* Developer/Publisher */}
        <p className="text-sm text-gray-500 mb-3">
          {game.developer || game.publisher || 'Unknown Developer'}
        </p>

        {/* All Genre Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {game.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-2 py-1 bg-blue-100 text-blue-800 border-0"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Best Price Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Best Price</span>
            <div className="flex items-center gap-2">
              <StoreIcon store={bestDeal.store} className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {bestDeal.originalPrice && bestDeal.originalPrice !== bestDeal.price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(bestDeal.originalPrice)}
                </span>
              )}
              <span className="text-lg font-bold text-green-600">
                {formatPrice(bestDeal.price)}
              </span>
            </div>
            
            <Button
              size="sm"
              onClick={handleViewBestPrice}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View
            </Button>
          </div>
        </div>

        {/* All Stores Section */}
        <div className="mt-auto">
          <h4 className="text-sm font-medium text-gray-700 mb-2">All Stores</h4>
          <div className="space-y-2">
            {game.stores.map((store) => (
              <div 
                key={store.store} 
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={(e) => handleStoreClick(store, e)}
              >
                <div className="flex items-center gap-2">
                  <StoreIcon store={store.store} className="w-4 h-4" />
                  <span className="text-sm font-medium text-gray-700">
                    {getStoreName(store.store)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    {store.originalPrice && store.originalPrice !== store.price && (
                      <div className="text-xs text-gray-400 line-through">
                        {formatPrice(store.originalPrice)}
                      </div>
                    )}
                    <div className="text-sm font-bold text-gray-900">
                      {formatPrice(store.price)}
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};