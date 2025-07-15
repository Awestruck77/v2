import { useState, useEffect } from 'react';
import { Heart, Search, Trash2, Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameCard } from '@/components/GameCard';
import { useToast } from '@/hooks/use-toast';

interface WishlistGame {
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
  priceAlert?: number;
  dateAdded: Date;
}

const Wishlist = () => {
  const [wishlistGames, setWishlistGames] = useState<WishlistGame[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Load wishlist from localStorage
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        setWishlistGames(parsed.map((game: any) => ({
          ...game,
          dateAdded: new Date(game.dateAdded)
        })));
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      }
    }
  }, []);

  const saveWishlist = (games: WishlistGame[]) => {
    localStorage.setItem('wishlist', JSON.stringify(games));
    setWishlistGames(games);
  };

  const removeFromWishlist = (gameId: string) => {
    const updatedWishlist = wishlistGames.filter(game => game.id !== gameId);
    saveWishlist(updatedWishlist);
    toast({
      title: "Removed from wishlist",
      description: "Game has been removed from your wishlist.",
    });
  };

  const setPriceAlert = (gameId: string, targetPrice: number) => {
    const updatedWishlist = wishlistGames.map(game =>
      game.id === gameId ? { ...game, priceAlert: targetPrice } : game
    );
    saveWishlist(updatedWishlist);
    toast({
      title: "Price alert set",
      description: `You'll be notified when the price drops to $${targetPrice}.`,
    });
  };

  const filteredGames = wishlistGames.filter(game =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getLowestPrice = (stores: WishlistGame['stores']) => {
    return Math.min(...stores.map(store => store.price));
  };

  const getBestDeal = (stores: WishlistGame['stores']) => {
    return stores.reduce((best, current) =>
      current.price < best.price ? current : best
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <Heart className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wishlist</h1>
          <p className="text-muted-foreground">Track your favorite games and get price alerts</p>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search wishlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredGames.length} of {wishlistGames.length} games
        </div>
      </div>

      {/* Wishlist Stats */}
      {wishlistGames.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {wishlistGames.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Games</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">
                {wishlistGames.filter(game => 
                  game.stores.some(store => store.discount && store.discount > 0)
                ).length}
              </div>
              <p className="text-sm text-muted-foreground">On Sale</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">
                {wishlistGames.filter(game => game.priceAlert).length}
              </div>
              <p className="text-sm text-muted-foreground">Price Alerts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">
                ${wishlistGames.reduce((total, game) => total + getLowestPrice(game.stores), 0).toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Wishlist Games */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <div key={game.id} className="relative">
              <GameCard
                game={game}
                currency={{ symbol: '$', currency: 'USD', code: 'US', name: 'United States' }}
              />
              
              {/* Wishlist Actions */}
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeFromWishlist(game.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const bestDeal = getBestDeal(game.stores);
                    const targetPrice = bestDeal.price * 0.8; // 20% off current best price
                    setPriceAlert(game.id, Number(targetPrice.toFixed(2)));
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Bell className="w-3 h-3" />
                </Button>
              </div>

              {/* Price Alert Indicator */}
              {game.priceAlert && (
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-warning/20 border border-warning/40 rounded px-2 py-1">
                    <p className="text-xs text-warning-foreground">
                      Alert: ${game.priceAlert}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : wishlistGames.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-4">
            Start adding games to track their prices and get notified of deals.
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Browse Games
          </Button>
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No games found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms.
          </p>
        </div>
      )}
    </div>
  );
};

export default Wishlist;