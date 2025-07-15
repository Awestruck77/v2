import { useState, useEffect } from 'react';
import { TrendingUp, Filter, Clock, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GameCard } from '@/components/GameCard';
import { getDeals, STORE_NAMES, type CheapSharkDeal } from '@/lib/cheapshark-api';
import { useToast } from '@/hooks/use-toast';

interface Game {
  id: string;
  title: string;
  image: string;
  stores: Array<{
    store: 'steam' | 'epic' | 'gog';
    price: number;
    originalPrice?: number;
    discount?: number;
    dealID?: string;
    storeID?: string;
  }>;
  rating: number;
  criticScore: number;
  tags: string[];
  steamAppID?: string;
}

const Deals = () => {
  const [hotDeals, setHotDeals] = useState<Game[]>([]);
  const [newDeals, setNewDeals] = useState<Game[]>([]);
  const [topRated, setTopRated] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('Savings');
  const { toast } = useToast();

  const getStoreType = (storeID: string): 'steam' | 'epic' | 'gog' => {
    if (storeID === '1') return 'steam';
    if (storeID === '25') return 'epic';
    if (storeID === '7') return 'gog';
    return 'steam';
  };

  const convertDealsToGames = (deals: CheapSharkDeal[]): Game[] => {
    return deals.map(deal => ({
      id: deal.gameID,
      title: deal.title,
      image: deal.thumb,
      steamAppID: deal.steamAppID,
      stores: [{
        store: getStoreType(deal.storeID),
        price: parseFloat(deal.salePrice),
        originalPrice: parseFloat(deal.normalPrice),
        discount: Math.round(parseFloat(deal.savings)),
        dealID: deal.dealID,
        storeID: deal.storeID
      }],
      rating: deal.steamRatingPercent ? parseFloat(deal.steamRatingPercent) / 10 : 7.5,
      criticScore: deal.metacriticScore ? parseInt(deal.metacriticScore) : 75,
      tags: ['Action', 'Adventure']
    }));
  };

  const loadDeals = async () => {
    setIsLoading(true);
    
    try {
      // Hot Deals - High savings
      const hotDealsData = await getDeals({
        pageSize: 12,
        sortBy: 'Savings',
        desc: true,
        onSale: true
      });
      setHotDeals(convertDealsToGames(hotDealsData));

      // New Deals - Recent
      const newDealsData = await getDeals({
        pageSize: 12,
        sortBy: 'Recent',
        desc: true,
        onSale: true
      });
      setNewDeals(convertDealsToGames(newDealsData));

      // Top Rated - High metacritic scores
      const topRatedData = await getDeals({
        pageSize: 12,
        sortBy: 'Metacritic',
        desc: true,
        metacritic: 80
      });
      setTopRated(convertDealsToGames(topRatedData));

      toast({
        title: "Deals loaded",
        description: "Latest deals have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to load deals",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const DealSection = ({ games, title, icon, isLoading }: { 
    games: Game[], 
    title: string, 
    icon: React.ReactNode, 
    isLoading: boolean 
  }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[480px] bg-game-card rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              currency={{ symbol: '$', currency: 'USD', code: 'US', name: 'United States' }}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Game Deals</h1>
            <p className="text-muted-foreground">Discover the best deals across all stores</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Savings">Highest Discount</SelectItem>
              <SelectItem value="Price">Lowest Price</SelectItem>
              <SelectItem value="Metacritic">Highest Rated</SelectItem>
              <SelectItem value="Recent">Most Recent</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={loadDeals} disabled={isLoading}>
            <Filter className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Deal Categories */}
      <Tabs defaultValue="hot" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hot" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Hot Deals
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            New Deals
          </TabsTrigger>
          <TabsTrigger value="rated" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Top Rated
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hot" className="space-y-6">
          <DealSection
            games={hotDeals}
            title="Hot Deals"
            icon={<Zap className="w-5 h-5 text-warning" />}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          <DealSection
            games={newDeals}
            title="New Deals"
            icon={<Clock className="w-5 h-5 text-primary" />}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="rated" className="space-y-6">
          <DealSection
            games={topRated}
            title="Top Rated Deals"
            icon={<Crown className="w-5 h-5 text-success" />}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Deal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hot Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{hotDeals.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{newDeals.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Rated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{topRated.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Math.round([...hotDeals, ...newDeals, ...topRated]
                .reduce((total, game) => {
                  const discount = game.stores[0]?.discount || 0;
                  return total + discount;
                }, 0) / 3)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Deals;