import { Star, ExternalLink, Heart, HeartOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StoreIcon } from '@/components/StoreIcon';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuthenticPrice, STORE_MAPPINGS } from '@/lib/isthereanydeal-api';

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

  const formatPrice = (price: number, storeId: string) => {
    if (price === 0) return 'FREE';
    
    // Get authentic price for the store and region
    const authenticPrice = getAuthenticPrice(game.title, storeId, currency.code);
    
    // Format based on currency
    switch (currency.currency) {
      case 'INR':
        return `₹${Math.round(authenticPrice)}`;
      case 'EUR':
        return `€${authenticPrice.toFixed(2)}`;
      case 'GBP':
        return `£${authenticPrice.toFixed(2)}`;
      case 'CAD':
        return `C$${authenticPrice.toFixed(2)}`;
      case 'AUD':
        return `A$${authenticPrice.toFixed(2)}`;
      default:
        return `$${authenticPrice.toFixed(2)}`;
    }
  };

  const getBestDeal = () => {
    return game.stores.reduce((best, current) => {
      const bestPrice = getAuthenticPrice(game.title, best.store, currency.code);
      const currentPrice = getAuthenticPrice(game.title, current.store, currency.code);
      return currentPrice < bestPrice ? current : best;
    });
  };

  const bestDeal = getBestDeal();

  const handleGameClick = () => {
    navigate(`/game/${game.id}`);
  };

  const handleStoreClick = (store: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const storeUrls: { [key: string]: string } = {
      steam: `https://store.steampowered.com/search/?term=${encodeURIComponent(game.title)}`,
      epic: `https://store.epicgames.com/browse?q=${encodeURIComponent(game.title)}`,
      gog: `https://www.gog.com/games?search=${encodeURIComponent(game.title)}`,
      humble: `https://www.humblebundle.com/store/search?search=${encodeURIComponent(game.title)}`,
      fanatical: `https://www.fanatical.com/en/search?search=${encodeURIComponent(game.title)}`,
    };

    const url = storeUrls[store.store] || '#';
    if (url !== '#') {
      window.open(url, '_blank');
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

  const getStoreName = (store: string) => {
    const storeMap: { [key: string]: string } = {
      steam: 'Steam',
      epic: 'Epic Games',
      gog: 'GOG',
      humble: 'Humble Store',
      fanatical: 'Fanatical'
    };
    return storeMap[store] || store;
  };

  return (
    <Card 
      className="group relative overflow-hidden bg-white hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col cursor-pointer"
      onClick={handleGameClick}
    >
      {/* Image Container with critic score overlay */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=900&fit=crop&q=80`;
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
          {game.developer || game.publisher || 'Game Developer'}
        </p>

        {/* All Genre Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {game.tags.slice(0, 4).map((tag) => (
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
              <span className="text-lg font-bold text-green-600">
                {formatPrice(bestDeal.price, bestDeal.store)}
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
                    <div className="text-sm font-bold text-gray-900">
                      {formatPrice(store.price, store.store)}
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