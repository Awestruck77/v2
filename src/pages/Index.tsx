import { useState, useEffect } from 'react';
import { Search, Globe, RefreshCw, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GameCard } from '@/components/GameCard';
import { ErrorDialog } from '@/components/ErrorDialog';
import { useToast } from '@/hooks/use-toast';
import { getDeals, type CheapSharkDeal, STORE_NAMES, STORE_IDS, getSteamImage } from '@/lib/cheapshark-api';

// Enhanced Game interface for CheapShark integration
interface Game {
  id: string;
  title: string;
  image: string;
  description?: string;
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

const REGIONS: Region[] = [
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€' },
  { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'C$' },
  { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$' },
];

// Mock pricing data for different regions
const REGIONAL_PRICING = {
  US: { base: 1, multiplier: 1 },
  GB: { base: 0.79, multiplier: 1 },
  DE: { base: 0.85, multiplier: 1 },
  IN: { base: 0.25, multiplier: 1 },
  CA: { base: 1.35, multiplier: 1 },
  AU: { base: 1.55, multiplier: 1 },
};

// Sample games data
const SAMPLE_GAMES: Game[] = [
  {
    id: '1',
    title: 'NBA 2K25',
    image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=300&h=400&fit=crop',
    stores: [
      { store: 'steam', price: 69.99, originalPrice: 69.99 },
      { store: 'epic', price: 59.99, originalPrice: 69.99, discount: 14 },
    ],
    rating: 7.6,
    criticScore: 76,
    tags: ['Sports', 'Basketball', 'Simulation'],
  },
  {
    id: '2',
    title: 'Suicide Squad: Kill the Justice League',
    image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300&h=400&fit=crop',
    stores: [
      { store: 'steam', price: 6.99, originalPrice: 69.99, discount: 90 },
      { store: 'epic', price: 6.99, originalPrice: 69.99, discount: 90 },
    ],
    rating: 6.3,
    criticScore: 63,
    tags: ['Action', 'Adventure', 'Superhero'],
  },
  {
    id: '3',
    title: 'Figment 2: Creed Valley',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=400&fit=crop',
    stores: [
      { store: 'steam', price: 0.00, originalPrice: 24.99, discount: 100 },
      { store: 'epic', price: 0.00, originalPrice: 24.99, discount: 100 },
    ],
    rating: 7.6,
    criticScore: 76,
    tags: ['Adventure', 'Indie', 'Fantasy'],
  },
  {
    id: '4',
    title: 'Rims Racing: Ultimate Edition',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&h=400&fit=crop',
    stores: [
      { store: 'steam', price: 6.95, originalPrice: 69.50, discount: 90 },
    ],
    rating: 7.2,
    criticScore: 72,
    tags: ['Racing', 'Simulation', 'Motorcycles'],
  },
  {
    id: '5',
    title: 'Strange Brigade - Deluxe Edition',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=400&fit=crop',
    stores: [
      { store: 'steam', price: 8.99, originalPrice: 89.99, discount: 91 },
    ],
    rating: 7.4,
    criticScore: 74,
    tags: ['Action', 'Co-op', 'Adventure'],
  },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(() => {
    return localStorage.getItem('selectedRegion') || 'US';
  });
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const currentRegion = REGIONS.find(r => r.code === selectedRegion) || REGIONS[0];

  // Apply regional pricing - fixed implementation
  const getRegionalPrice = (basePrice: number) => {
    const pricing = REGIONAL_PRICING[selectedRegion as keyof typeof REGIONAL_PRICING];
    if (!pricing) return basePrice;
    return Number((basePrice * pricing.base).toFixed(2));
  };

  // Convert CheapShark deals to our Game format
  const convertDealsToGames = (deals: CheapSharkDeal[]): Game[] => {
    return deals.map(deal => ({
      id: deal.gameID,
      title: deal.title,
      image: deal.steamAppID ? getSteamImage(deal.steamAppID) : deal.thumb,
      description: '', // Will be filled by game details API later
      stores: [{
        store: getStoreType(deal.storeID),
        price: parseFloat(deal.salePrice),
        originalPrice: parseFloat(deal.normalPrice),
        discount: Math.round(parseFloat(deal.savings))
      }],
      rating: deal.steamRatingPercent ? parseFloat(deal.steamRatingPercent) / 10 : 7.5,
      criticScore: deal.metacriticScore ? parseInt(deal.metacriticScore) : 75,
      tags: ['Action', 'Adventure'] // Placeholder - would need additional API for real tags
    }));
  };

  const getStoreType = (storeID: string): 'steam' | 'epic' | 'gog' => {
    if (storeID === '1') return 'steam';
    if (storeID === '25') return 'epic';
    if (storeID === '7') return 'gog';
    return 'steam'; // default fallback
  };

  // Load real game deals from CheapShark API
  const loadGameDeals = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const deals = await getDeals({
        pageSize: 20,
        sortBy: 'Savings',
        desc: true,
        onSale: true,
        metacritic: 70
      });
      
      const gameData = convertDealsToGames(deals);
      setGames(gameData);
      
      if (gameData.length === 0) {
        toast({
          title: "No deals found",
          description: "Try adjusting your search criteria or check back later.",
        });
      }
    } catch (err) {
      setError("Failed to load game deals. Please check your internet connection.");
      console.error('Error loading deals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load deals on component mount
  useEffect(() => {
    loadGameDeals();
  }, []);

  // Filter games based on search
  const filteredGames = games.filter(game =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRefresh = async () => {
    await loadGameDeals();
    toast({
      title: "Deals refreshed",
      description: "Latest game deals have been loaded successfully.",
    });
  };

  const handleRegionChange = (regionCode: string) => {
    setSelectedRegion(regionCode);
    localStorage.setItem('selectedRegion', regionCode);
    toast({
      title: "Region changed",
      description: `Switched to ${REGIONS.find(r => r.code === regionCode)?.name}. Prices updated.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Latest Game Deals</h1>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search for games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted border-border"
                />
              </div>

              <Select value={selectedRegion} onValueChange={handleRegionChange}>
                <SelectTrigger className="w-48 bg-muted border-border">
                  <Globe className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region.code} value={region.code}>
                      {region.name} ({region.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant="outline"
                size="icon"
                className="border-border hover:bg-muted"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentRegion.symbol}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[480px] bg-game-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={{
                  ...game,
                  stores: game.stores.map(store => ({
                    ...store,
                    price: getRegionalPrice(store.price),
                    originalPrice: store.originalPrice ? getRegionalPrice(store.originalPrice) : undefined,
                  }))
                }}
                currency={currentRegion}
              />
            ))}
          </div>
        )}

        {filteredGames.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">No deals found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or refresh to load new deals.</p>
          </div>
        )}
      </main>

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={!!error}
        onClose={() => setError(null)}
        title="Connection Error"
        message={error || ""}
        errorCode="NET_001"
      />
    </div>
  );
};

export default Index;