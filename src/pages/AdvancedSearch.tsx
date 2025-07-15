import { useState, useEffect } from 'react';
import { Search, Filter, Star, DollarSign, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameCard } from '@/components/GameCard';
import { getDeals, STORE_NAMES, type CheapSharkDeal } from '@/lib/cheapshark-api';
import { useToast } from '@/hooks/use-toast';

// Game genres/tags
const GAME_GENRES = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports',
  'Racing', 'Fighting', 'Platform', 'Shooter', 'Puzzle', 'Arcade',
  'Horror', 'Survival', 'Indie', 'MMO', 'Battle Royale', 'MOBA',
  'Card Game', 'Board Game', 'Music', 'Educational', 'Sandbox',
  'Stealth', 'Tower Defense', 'Real-time Strategy', 'Turn-based Strategy'
];

const PRICE_RANGES = [
  { label: 'Free', min: 0, max: 0 },
  { label: 'Under $5', min: 0, max: 5 },
  { label: '$5 - $15', min: 5, max: 15 },
  { label: '$15 - $30', min: 15, max: 30 },
  { label: '$30 - $60', min: 30, max: 60 },
  { label: 'Over $60', min: 60, max: 999 },
];

const RATING_RANGES = [
  { label: 'Any Rating', min: 0 },
  { label: '70+ (Good)', min: 70 },
  { label: '80+ (Great)', min: 80 },
  { label: '90+ (Excellent)', min: 90 },
];

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

const AdvancedSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState('Savings');
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleStoreToggle = (storeId: string) => {
    setSelectedStores(prev => 
      prev.includes(storeId) 
        ? prev.filter(s => s !== storeId)
        : [...prev, storeId]
    );
  };

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
      tags: ['Action', 'Adventure'] // Placeholder
    }));
  };

  const handleSearch = async () => {
    setIsLoading(true);
    
    try {
      const deals = await getDeals({
        pageSize: 50,
        sortBy,
        desc: true,
        onSale: onSaleOnly,
        metacritic: minRating > 0 ? minRating : undefined,
        storeID: selectedStores.length > 0 ? selectedStores[0] : undefined
      });
      
      let filteredDeals = deals;
      
      // Filter by search query
      if (searchQuery) {
        filteredDeals = filteredDeals.filter(deal =>
          deal.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Filter by price range
      if (priceRange) {
        filteredDeals = filteredDeals.filter(deal => {
          const price = parseFloat(deal.salePrice);
          return price >= priceRange.min && price <= priceRange.max;
        });
      }
      
      const gameData = convertDealsToGames(filteredDeals);
      setGames(gameData);
      
      toast({
        title: "Search completed",
        description: `Found ${gameData.length} games matching your criteria.`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to search games. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenres([]);
    setSelectedStores([]);
    setPriceRange(null);
    setMinRating(0);
    setOnSaleOnly(false);
    setSortBy('Savings');
    setGames([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <Search className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Advanced Search</h1>
          <p className="text-muted-foreground">Find games with detailed filtering options</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search for games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Genre Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Genres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {GAME_GENRES.map((genre) => (
                  <div key={genre} className="flex items-center space-x-2">
                    <Checkbox
                      id={genre}
                      checked={selectedGenres.includes(genre)}
                      onCheckedChange={() => handleGenreToggle(genre)}
                    />
                    <Label htmlFor={genre} className="text-sm">{genre}</Label>
                  </div>
                ))}
              </div>
              {selectedGenres.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {selectedGenres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price Range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {PRICE_RANGES.map((range) => (
                  <div key={range.label} className="flex items-center space-x-2">
                    <Checkbox
                      id={range.label}
                      checked={priceRange?.min === range.min && priceRange?.max === range.max}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPriceRange({ min: range.min, max: range.max });
                        } else {
                          setPriceRange(null);
                        }
                      }}
                    />
                    <Label htmlFor={range.label} className="text-sm">{range.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rating Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-4 h-4" />
                Minimum Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={minRating.toString()} onValueChange={(value) => setMinRating(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RATING_RANGES.map((range) => (
                    <SelectItem key={range.min} value={range.min.toString()}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Additional Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                  <Checkbox
                    id="on-sale"
                    checked={onSaleOnly}
                    onCheckedChange={(checked) => setOnSaleOnly(checked === true)}
                  />
                <Label htmlFor="on-sale">On Sale Only</Label>
              </div>

              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Savings">Highest Discount</SelectItem>
                    <SelectItem value="Price">Lowest Price</SelectItem>
                    <SelectItem value="Metacritic">Highest Rated</SelectItem>
                    <SelectItem value="Recent">Most Recent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button onClick={handleSearch} disabled={isLoading} className="w-full">
              {isLoading ? 'Searching...' : 'Search Games'}
            </Button>
            <Button onClick={clearFilters} variant="outline" className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[480px] bg-game-card rounded-lg animate-pulse" />
              ))}
            </div>
          ) : games.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Search Results</h2>
                <span className="text-muted-foreground">{games.length} games found</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {games.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    currency={{ symbol: '$', currency: 'USD', code: 'US', name: 'United States' }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Use filters to search for games
              </h3>
              <p className="text-muted-foreground">
                Select your preferences and click "Search Games" to find the perfect deals.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;