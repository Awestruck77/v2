import { useState, useEffect } from 'react';
import { ExternalLink, TrendingUp, Star, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameCard } from '@/components/GameCard';
import { StoreIcon } from '@/components/StoreIcon';
import { getDeals, convertISTDToGame } from '@/lib/isthereanydeal-api';
import { useToast } from '@/hooks/use-toast';

const GOG = () => {
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadGOGDeals = async () => {
    setIsLoading(true);
    
    try {
      const deals = await getDeals({
        limit: 20,
        shops: ['gog']
      });
      
      const gameData = deals.map(deal => convertISTDToGame(deal));
      setGames(gameData);
      
      toast({
        title: "GOG deals loaded",
        description: `Found ${gameData.length} games on GOG.`,
      });
    } catch (error) {
      toast({
        title: "Failed to load GOG deals",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGOGDeals();
  }, []);

  const handleVisitStore = () => {
    window.open('https://www.gog.com', '_blank');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gog rounded-lg flex items-center justify-center">
            <StoreIcon store="gog" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">GOG Store</h1>
            <p className="text-muted-foreground">DRM-free games and classic titles</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={loadGOGDeals} disabled={isLoading} variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh Deals
          </Button>
          <Button onClick={handleVisitStore}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit GOG
          </Button>
        </div>
      </div>

      {/* Store Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Store className="w-4 h-4" />
              Active Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gog">
              {games.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Avg. Discount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {games.length > 0 
                ? Math.round(games.reduce((sum, game) => 
                    sum + (game.stores[0]?.discount || 0), 0) / games.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4" />
              Avg. Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {games.length > 0 
                ? (games.reduce((sum, game) => sum + game.rating, 0) / games.length).toFixed(1)
                : '0.0'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">DRM-Free</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">100%</div>
          </CardContent>
        </Card>
      </div>

      {/* Store Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StoreIcon store="gog" className="w-5 h-5" />
            About GOG (Good Old Games)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            GOG specializes in DRM-free games, classic titles, and indie gems. 
            Known for their commitment to game preservation and user ownership, 
            GOG offers games without digital rights management and often includes 
            bonus content like soundtracks and wallpapers.
          </p>
        </CardContent>
      </Card>

      {/* Games Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[480px] bg-game-card rounded-lg animate-pulse" />
          ))}
        </div>
      ) : games.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              currency={{ symbol: '$', currency: 'USD', code: 'US', name: 'United States' }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <StoreIcon store="gog" className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No GOG deals available</h3>
          <p className="text-muted-foreground mb-4">
            Check back later for new deals from GOG.
          </p>
          <Button onClick={loadGOGDeals}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
};

export default GOG;