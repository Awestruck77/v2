import { useState, useEffect } from 'react';
import { Clock, Gift, Calendar, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameCard } from '@/components/GameCard';
import { getFreeGames, type CheapSharkDeal } from '@/lib/cheapshark-api';
import { useToast } from '@/hooks/use-toast';

interface LimitedGame {
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
  endDate?: Date;
  timeRemaining?: string;
}

const Limited = () => {
  const [limitedGames, setLimitedGames] = useState<LimitedGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const getStoreType = (storeID: string): 'steam' | 'epic' | 'gog' => {
    if (storeID === '1') return 'steam';
    if (storeID === '25') return 'epic';
    if (storeID === '7') return 'gog';
    return 'steam';
  };

  const generateRandomEndDate = () => {
    const now = new Date();
    const daysToAdd = Math.floor(Math.random() * 14) + 1; // 1-14 days
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + daysToAdd);
    return endDate;
  };

  const calculateTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} left`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} left`;
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} left`;
    }
  };

  const convertDealsToLimitedGames = (deals: CheapSharkDeal[]): LimitedGame[] => {
    return deals.slice(0, 8).map(deal => {
      const endDate = generateRandomEndDate();
      return {
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
        tags: ['Action', 'Adventure'],
        endDate,
        timeRemaining: calculateTimeRemaining(endDate)
      };
    });
  };

  const loadLimitedGames = async () => {
    setIsLoading(true);
    
    try {
      const freeGames = await getFreeGames();
      const limitedGameData = convertDealsToLimitedGames(freeGames);
      setLimitedGames(limitedGameData);

      toast({
        title: "Limited deals loaded",
        description: "Found limited-time free games and promotions.",
      });
    } catch (error) {
      toast({
        title: "Failed to load limited deals",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLimitedGames();
    
    // Update time remaining every minute
    const interval = setInterval(() => {
      setLimitedGames(prevGames =>
        prevGames.map(game => ({
          ...game,
          timeRemaining: game.endDate ? calculateTimeRemaining(game.endDate) : undefined
        }))
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getUrgencyLevel = (timeRemaining: string | undefined) => {
    if (!timeRemaining || timeRemaining === 'Expired') return 'expired';
    
    if (timeRemaining.includes('hour') || timeRemaining.includes('minute')) {
      return 'urgent';
    } else if (timeRemaining.includes('1 day')) {
      return 'warning';
    } else {
      return 'normal';
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'urgent': return 'text-destructive';
      case 'warning': return 'text-warning';
      case 'normal': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Timer className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Limited Time Offers</h1>
            <p className="text-muted-foreground">Games free for a limited time - claim them now!</p>
          </div>
        </div>

        <Button onClick={loadLimitedGames} disabled={isLoading}>
          <Clock className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Active Offers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {limitedGames.filter(game => game.timeRemaining !== 'Expired').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Ending Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {limitedGames.filter(game => 
                game.timeRemaining && (
                  game.timeRemaining.includes('hour') || 
                  game.timeRemaining.includes('1 day')
                )
              ).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${limitedGames.reduce((total, game) => 
                total + (game.stores[0]?.originalPrice || 0), 0
              ).toFixed(0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">100%</div>
          </CardContent>
        </Card>
      </div>

      {/* Limited Games Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[480px] bg-game-card rounded-lg animate-pulse" />
          ))}
        </div>
      ) : limitedGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {limitedGames.map((game) => (
            <div key={game.id} className="relative">
              <GameCard
                game={game}
                currency={{ symbol: '$', currency: 'USD', code: 'US', name: 'United States' }}
              />
              
              {/* Time Remaining Overlay */}
              <div className="absolute top-2 left-2 right-2">
                <Badge 
                  className={`${getUrgencyColor(getUrgencyLevel(game.timeRemaining))} bg-background/90 border`}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {game.timeRemaining}
                </Badge>
              </div>

              {/* Free Badge */}
              <div className="absolute top-2 right-2">
                <Badge className="bg-success text-success-foreground">
                  FREE
                </Badge>
              </div>

              {/* Claim Button */}
              <div className="absolute bottom-2 left-2 right-2">
                <Button 
                  className="w-full bg-success hover:bg-success/90 text-success-foreground"
                  size="sm"
                  disabled={game.timeRemaining === 'Expired'}
                >
                  {game.timeRemaining === 'Expired' ? 'Expired' : 'Claim Now'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Timer className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No limited offers available</h3>
          <p className="text-muted-foreground mb-4">
            Check back later for new limited-time free games and promotions.
          </p>
          <Button onClick={loadLimitedGames}>
            <Clock className="w-4 h-4 mr-2" />
            Check Again
          </Button>
        </div>
      )}

      {/* Information Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            About Limited Time Offers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground">
            Limited time offers are games that are temporarily free to claim and keep forever. 
            These promotions are usually offered by game stores to celebrate events, holidays, or game launches.
          </p>
          <p className="text-muted-foreground">
            <strong>Important:</strong> Once claimed during the promotional period, these games remain in your library permanently, 
            even after the promotion ends. Make sure to claim them before the deadline!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Limited;