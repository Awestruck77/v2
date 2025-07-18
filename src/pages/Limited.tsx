import { useState, useEffect } from 'react';
import { Clock, Gift, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameCard } from '@/components/GameCard';
import { getDeals, convertISTDToGame } from '@/lib/isthereanydeal-api';
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

  const loadLimitedGames = async () => {
    setIsLoading(true);
    
    try {
      const deals = await getDeals({ limit: 8 });
      const limitedGameData = deals.slice(0, 8).map(deal => {
        const gameData = convertISTDToGame(deal);
        const endDate = generateRandomEndDate();
        return {
          ...gameData,
          endDate,
          timeRemaining: calculateTimeRemaining(endDate)
        };
      });
      
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
            <p className="text-muted-foreground">Games with special limited-time pricing - grab them now!</p>
          </div>
        </div>

        <Button onClick={loadLimitedGames} disabled={isLoading}>
          <Clock className="w-4 h-4 mr-2" />
          Refresh
        </Button>
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

              {/* Limited Deal Badge */}
              <div className="absolute top-2 right-2">
                <Badge className="bg-warning text-warning-foreground">
                  LIMITED
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Timer className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No limited offers available</h3>
          <p className="text-muted-foreground mb-4">
            Check back later for new limited-time deals and promotions.
          </p>
          <Button onClick={loadLimitedGames}>
            <Clock className="w-4 h-4 mr-2" />
            Check Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default Limited;