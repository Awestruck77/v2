import { useState, useEffect } from 'react';
import { Search, Globe, RefreshCw, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GameCard } from '@/components/GameCard';
import { ErrorDialog } from '@/components/ErrorDialog';
import { useToast } from '@/hooks/use-toast';
import { getDeals, type CheapSharkDeal, STORE_NAMES, STORE_IDS, getHighQualityImage } from '@/lib/cheapshark-api';
import { REGIONAL_PRICING, getRegionalPrice, type RegionalPricing } from '@/lib/regional-pricing';

// Enhanced Game interface for CheapShark integration
interface Game {
  id: string;
  title: string;
  image: string;
  description?: string;
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

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(() => {
    return localStorage.getItem('selectedRegion') || 'US';
  });
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const currentRegion = REGIONAL_PRICING[selectedRegion] || REGIONAL_PRICING['US'];

  // Convert CheapShark deals to our Game format with proper regional pricing
  const convertDealsToGames = (deals: CheapSharkDeal[]): Game[] => {
    return deals.map(deal => {
      const storeType = getStoreType(deal.storeID);
      const basePrice = parseFloat(deal.salePrice);
      const baseOriginalPrice = parseFloat(deal.normalPrice);
      
      // Apply regional pricing
      const regionalPrice = getRegionalPrice(basePrice, storeType, selectedRegion);
      const regionalOriginalPrice = baseOriginalPrice > basePrice ? 
        getRegionalPrice(baseOriginalPrice, storeType, selectedRegion) : undefined;

      return {
        id: deal.gameID,
        title: deal.title,
        image: deal.steamAppID ? getHighQualityImage(deal.steamAppID, 'library') : deal.thumb,
        description: '',
        steamAppID: deal.steamAppID,
        stores: [{
          store: storeType,
          price: regionalPrice,
          originalPrice: regionalOriginalPrice,
          discount: Math.round(parseFloat(deal.savings)),
          dealID: deal.dealID,
          storeID: deal.storeID
        }],
        rating: deal.steamRatingPercent ? parseFloat(deal.steamRatingPercent) / 10 : 7.5,
        criticScore: deal.metacriticScore ? parseInt(deal.metacriticScore) : 75,
        tags: ['Action', 'Adventure'] // Placeholder - would need additional API for real tags
      };
    });
  };

  const getStoreType = (storeID: string): 'steam' | 'epic' | 'gog' | 'humble' | 'fanatical' => {
    if (storeID === '1') return 'steam';
    if (storeID === '25') return 'epic';
    if (storeID === '7') return 'gog';
    if (storeID === '11') return 'humble';
    if (storeID === '15') return 'fanatical';
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

  // Load deals on component mount and when region changes
  useEffect(() => {
    loadGameDeals();
  }, [selectedRegion]);

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
      description: `Switched to ${REGIONAL_PRICING[regionCode]?.name}. Prices updated.`,
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

            <div className="flex items-center gap-4 flex-1 max-w-4xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search for games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg bg-muted border-border"
                />
              </div>

              <Select value={selectedRegion} onValueChange={handleRegionChange}>
                <SelectTrigger className="w-48 h-12 bg-muted border-border">
                  <Globe className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(REGIONAL_PRICING).map((region) => (
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
                className="h-12 w-12 border-border hover:bg-muted"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[600px] bg-game-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
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