import { Star, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StoreIcon } from '@/components/StoreIcon';

interface Game {
  id: string;
  title: string;
  image: string;
  stores: Array<{
    store: 'steam' | 'epic' | 'gog';
    price: number;
    originalPrice?: number;
    discount?: number;
  }>;
  rating: number;
  criticScore: number;
  tags: string[];
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
  const formatPrice = (price: number) => {
    if (price === 0) return 'FREE';
    return `${currency.symbol}${price.toFixed(2)}`;
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

  return (
    <Card className="group relative overflow-hidden bg-game-card hover:bg-game-card-hover transition-all duration-300 border-border hover:border-primary/50 h-[480px] flex flex-col">
      {/* Image Container with overlay scores */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
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

        {/* Discount Badge */}
        {bestDeal.discount && bestDeal.discount > 0 && (
          <div className="absolute top-3 right-3">
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

        {/* Stores and Prices */}
        <div className="space-y-2 mt-auto">
          {game.stores.map((store) => (
            <div key={store.store} className="flex items-center justify-between py-2 px-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-2">
                <StoreIcon store={store.store} className="w-4 h-4" />
                <span className="text-sm font-medium text-foreground capitalize">
                  {store.store}
                </span>
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
              </div>
            </div>
          ))}
        </div>

        {/* Best Deal Button */}
        <Button 
          className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          size="sm"
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