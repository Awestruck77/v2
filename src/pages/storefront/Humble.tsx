import { useState, useEffect } from 'react';
import { ExternalLink, TrendingUp, Star, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameCard } from '@/components/GameCard';
import { StoreIcon } from '@/components/StoreIcon';
import { getDeals, convertISTDToGame } from '@/lib/isthereanydeal-api';
import { useToast } from '@/hooks/use-toast';

const Humble = () => {
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadHumbleDeals = async () => {
    setIsLoading(true);
    
    try {
      const deals = await getDeals({
        limit: 20,
        shops: ['humblestore']
      });
      
      const gameData = deals.map(deal => convertISTDToGame(deal));
      setGames(gameData);
      
      toast({
        title: "Humble Store deals loaded",
        description: `Found ${gameData.length} games on Humble Store.`,
      });
    } catch (error) {
      toast({
        title: "Failed to load Humble Store deals",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHumbleDeals();
  }, []);

  const handleVisitStore = () => {
    window.open('https://www.humblebundle.com/store', '_blank');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center">
            <StoreIcon store="humble" className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Humble Store</h1>
            <p className="text-muted-foreground">Great games, great prices, great cause</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={loadHumbleDeals} disabled={isLoading} variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh Deals
          </Button>
          <Button onClick={handleVisitStore}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit Humble Store
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
            <div className="text-2xl font-bold text-foreground">
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
            <CardTitle className="text-sm font-medium">Charity Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">5%</div>
          </CardContent>
        </Card>
      </div>

      {/* Store Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StoreIcon store="humble" className="w-5 h-5" />
            About Humble Store
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Humble Store offers great games at great prices while supporting charity. 
            Known for their Humble Bundles and commitment to giving back, 
            5% of every purchase goes to charity. They also offer a 
            subscription service and regular sales on popular titles.
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
          <StoreIcon store="humble" className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Humble Store deals available</h3>
          <p className="text-muted-foreground mb-4">
            Check back later for new deals from Humble Store.
          </p>
          <Button onClick={loadHumbleDeals}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
};

export default Humble;