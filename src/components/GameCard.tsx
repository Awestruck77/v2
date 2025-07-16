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

  const getRatingColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 7) return 'text-yellow-400';
    if (score >= 6) return 'text-orange-400';
    return 'text-red-400';
  };

  const getCriticScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 70) return 'bg-yellow-600';
    if (score >= 60) return 'bg-orange-600';
    return 'bg-red-600';
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
      return `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamAppID}/library_600x900.jpg`;
    }
    
    // Fallback to original image or placeholder
    return game.image || `https://via.placeholder.com/300x400/1a1a1a/888888?text=${encodeURIComponent(game.title)}`;
  };

  return (
    <Card 
      className="group relative overflow-hidden bg-game-card hover:bg-game-card-hover transition-all duration-300 border-border hover:border-primary/50 flex flex-col cursor-pointer"
      onClick={handleGameClick}
    >
      {/* Image Container with overlay scores */}
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
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        
        {/* Top left scores */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Critic Score */}
          <div className={`px-2 py-1 rounded text-white text-xs font-bold ${getCriticScoreColor(game.criticScore)}`}>
            {game.criticScore}
          </div>
          
          {/* User Rating */}
          <div className="flex items-center gap-1 bg-black/70 px-2 py-1 rounded">
            <Star className={`w-3 h-3 fill-current ${getRatingColor(game.rating)}`} />
            <span className={`text-xs font-medium ${getRatingColor(game.rating)}`}>
              {game.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Wishlist Button */}
        <Button
          size="sm"
          variant="secondary"
          onClick={toggleWishlist}
          className="absolute top-3 right-3 h-8 w-8 p-0 bg-black/70 hover:bg-black/90 border-0"
        >
          {isWishlisted ? (
            <Heart className="w-4 h-4 text-red-500 fill-current" />
          ) : (
            <HeartOff className="w-4 h-4 text-white" />
          )}
        </Button>

        {/* Discount Badge */}
        {bestDeal.discount && bestDeal.discount > 0 && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-gradient-discount text-white border-0 font-bold">
              -{bestDeal.discount}%
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-bold text-foreground text-sm leading-tight mb-3 line-clamp-2 min-h-[2.5rem]">
          {game.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {game.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-secondary/50 text-secondary-foreground"
            >
              {tag}
            </Badge>
          ))}
          {game.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-secondary/50 text-muted-foreground">
              +{game.tags.length - 2}
            </Badge>
          )}
        </div>

        {/* Store Prices List */}
        <div className="space-y-2 mt-auto">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Available at:
          </h4>
          {game.stores.map((store) => (
            <div 
              key={store.store} 
              className="flex items-center justify-between py-2 px-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
              onClick={(e) => handleStoreClick(store, e)}
            >
              <div className="flex items-center gap-2">
                <StoreIcon store={store.store} className="w-4 h-4" />
                <span className="text-sm font-medium text-foreground capitalize">
                  {store.store === 'gog' ? 'GOG' : 
                   store.store === 'epic' ? 'Epic' :
                   store.store === 'humble' ? 'Humble' :
                   store.store === 'fanatical' ? 'Fanatical' :
                   'Steam'}
                </span>
                {store.discount && store.discount > 0 && (
                  <Badge className="bg-gradient-discount text-white border-0 text-xs">
                    -{store.discount}%
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {store.originalPrice && store.originalPrice !== store.price && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(store.originalPrice)}
                  </span>
                )}
                <span className={`font-bold text-sm ${store.price === 0 ? 'text-success' : 'text-price-highlight'}`}>
                  {formatPrice(store.price)}
                </span>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>

        {/* Best Deal Button */}
        <Button 
          className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          size="sm"
          onClick={(e) => handleStoreClick(bestDeal, e)}
        >
          <ExternalLink className="w-3 h-3 mr-2" />
          Best: {formatPrice(bestDeal.price)}
          {bestDeal.discount && bestDeal.discount > 0 && (
            <span className="ml-1 text-xs opacity-90">(-{bestDeal.discount}%)</span>
          )}
        </Button>
      </div>
    </Card>
  );
};