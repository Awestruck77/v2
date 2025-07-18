import { useState, useEffect } from 'react';
import { Search, Globe, RefreshCw, TrendingUp, Gift, Clock, Calendar, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameCard } from '@/components/GameCard';
import { ErrorDialog } from '@/components/ErrorDialog';
import { useToast } from '@/hooks/use-toast';
import { getDeals, convertISTDToGame, STORE_MAPPINGS } from '@/lib/isthereanydeal-api';

const REGIONAL_PRICING = {
  US: { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
  GB: { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  DE: { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€' },
  IN: { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' },
  CA: { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'C$' },
  AU: { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$' },
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(() => {
    return localStorage.getItem('selectedRegion') || 'US';
  });
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    activeOffers: 0,
    endingSoon: 0,
    totalValue: 0,
    yourSavings: 100
  });
  const { toast } = useToast();

  const currentRegion = REGIONAL_PRICING[selectedRegion as keyof typeof REGIONAL_PRICING] || REGIONAL_PRICING['US'];

  const loadGameDeals = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const deals = await getDeals({
        limit: 20,
        region: selectedRegion
      });
      
      const gameData = deals.map(deal => convertISTDToGame(deal, selectedRegion));
      setGames(gameData);
      
      // Calculate dashboard stats
      const activeOffers = gameData.filter(game => 
        game.stores.some((store: any) => store.discount && store.discount > 0)
      ).length;
      
      const endingSoon = Math.floor(activeOffers * 0.3); // 30% ending soon
      
      const totalValue = gameData.reduce((total, game) => {
        const bestPrice = Math.min(...game.stores.map((store: any) => store.price));
        return total + bestPrice;
      }, 0);
      
      setDashboardStats({
        activeOffers,
        endingSoon,
        totalValue: Math.round(totalValue),
        yourSavings: 100
      });
      
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

  useEffect(() => {
    loadGameDeals();
  }, [selectedRegion]);

  const filteredGames = games.filter(game =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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
      description: `Switched to ${REGIONAL_PRICING[regionCode as keyof typeof REGIONAL_PRICING]?.name}. Prices updated.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Game Price Tracker</h1>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-4xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search for games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg bg-white border-gray-300"
                />
              </div>

              <Select value={selectedRegion} onValueChange={handleRegionChange}>
                <SelectTrigger className="w-48 h-12 bg-white border-gray-300">
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
                className="h-12 w-12 border-gray-300 hover:bg-gray-50"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Active Offers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboardStats.activeOffers}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Ending Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboardStats.endingSoon}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {currentRegion.symbol}{dashboardStats.totalValue}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Your Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-200">
                {dashboardStats.yourSavings}%
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[700px] bg-white rounded-lg animate-pulse shadow-sm" />
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No deals found</h3>
            <p className="text-gray-600">Try adjusting your search terms or refresh to load new deals.</p>
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