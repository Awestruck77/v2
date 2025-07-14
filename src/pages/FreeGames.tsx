import { useState, useEffect } from 'react';
import { Gift, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getFreeGames, type CheapSharkDeal, STORE_NAMES } from '@/lib/cheapshark-api';
import { StoreIcon } from '@/components/StoreIcon';

const FreeGames = () => {
  const [freeGames, setFreeGames] = useState<CheapSharkDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadFreeGames = async () => {
    setIsLoading(true);
    try {
      const games = await getFreeGames();
      setFreeGames(games);
      if (games.length === 0) {
        toast({
          title: "No free games found",
          description: "Check back later for new free game deals!",
        });
      }
    } catch (error) {
      toast({
        title: "Error loading free games",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFreeGames();
  }, []);

  const getStoreFromId = (storeID: string): 'steam' | 'epic' | 'gog' => {
    if (storeID === '25') return 'epic';
    if (storeID === '7') return 'gog';
    return 'steam'; // default
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center">
            <Gift className="w-6 h-6 text-success-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Free Games</h1>
            <p className="text-muted-foreground">Discover games that are currently free to claim</p>
          </div>
        </div>
        
        <Button
          onClick={loadFreeGames}
          disabled={isLoading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Free Games Grid */}
      {freeGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {freeGames.map((game) => (
            <Card key={game.dealID} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={game.thumb}
                  alt={game.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/300x169/1a1a1a/888888?text=${encodeURIComponent(game.title)}`;
                  }}
                />
                
                {/* FREE Badge */}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-success text-success-foreground border-0 font-bold">
                    FREE
                  </Badge>
                </div>

                {/* Store Badge */}
                <div className="absolute top-3 left-3">
                  <div className="flex items-center gap-1 bg-black/70 px-2 py-1 rounded">
                    <StoreIcon store={getStoreFromId(game.storeID)} className="w-3 h-3" />
                    <span className="text-xs text-white font-medium">
                      {STORE_NAMES[game.storeID as keyof typeof STORE_NAMES] || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-foreground text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                  {game.title}
                </h3>

                {/* Ratings */}
                <div className="flex items-center justify-between">
                  {game.metacriticScore && parseInt(game.metacriticScore) > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Metacritic:</span>
                      <Badge variant="outline" className="text-xs">
                        {game.metacriticScore}
                      </Badge>
                    </div>
                  )}
                  
                  {game.steamRatingPercent && parseInt(game.steamRatingPercent) > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Steam:</span>
                      <Badge variant="outline" className="text-xs">
                        {game.steamRatingPercent}%
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Original Price */}
                {game.normalPrice && parseFloat(game.normalPrice) > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Usually: <span className="line-through">${game.normalPrice}</span>
                    </p>
                    <p className="text-lg font-bold text-success">
                      Now: FREE (Save 100%)
                    </p>
                  </div>
                )}

                <Button className="w-full bg-success hover:bg-success/90 text-success-foreground">
                  <ExternalLink className="w-3 h-3 mr-2" />
                  Claim Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[16/9] bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-8 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">No Free Games Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              There are currently no free games available. Check back later or try refreshing to see if new deals have appeared!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FreeGames;