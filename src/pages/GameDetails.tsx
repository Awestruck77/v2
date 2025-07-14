import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ExternalLink, Calendar, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StoreIcon } from '@/components/StoreIcon';
import { getGameDetails, getSteamImage, getHighQualityImage, STORE_NAMES } from '@/lib/cheapshark-api';
import type { GameDetails as GameDetailsType } from '@/lib/cheapshark-api';

const GameDetails = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState<GameDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (gameId) {
      fetchGameDetails();
    }
  }, [gameId]);

  const fetchGameDetails = async () => {
    if (!gameId) return;
    
    setLoading(true);
    try {
      const details = await getGameDetails(gameId);
      setGameData(details);
    } catch (error) {
      console.error('Failed to fetch game details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (numPrice === 0) return 'FREE';
    return `$${numPrice.toFixed(2)}`;
  };

  const getStoreFromId = (storeId: string) => {
    const storeMap: { [key: string]: 'steam' | 'epic' | 'gog' } = {
      '1': 'steam',
      '25': 'epic',
      '7': 'gog',
    };
    return storeMap[storeId] || 'steam';
  };

  const handleStoreClick = (dealId: string, storeId: string) => {
    const storeUrls: { [key: string]: string } = {
      '1': `https://store.steampowered.com/app/${gameData?.info.steamAppID || ''}`,
      '25': 'https://store.epicgames.com',
      '7': 'https://www.gog.com',
    };
    
    const url = storeUrls[storeId] || `https://www.cheapshark.com/redirect?dealID=${dealId}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading game details...</p>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Game not found</h1>
          <p className="text-muted-foreground mb-4">The game you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const steamAppId = gameData.info.steamAppID;
  const heroImage = steamAppId ? getHighQualityImage(steamAppId, 'capsule') : gameData.info.thumb;
  const headerImage = steamAppId ? getSteamImage(steamAppId) : gameData.info.thumb;

  // Calculate fade opacity based on scroll
  const fadeOpacity = Math.min(scrollY / 300, 0.8);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Background Image */}
      <div className="relative h-[70vh] overflow-hidden">
        <img
          src={heroImage}
          alt={gameData.info.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = gameData.info.thumb;
          }}
        />
        
        {/* Gradient overlay that intensifies on scroll */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"
          style={{ 
            background: `linear-gradient(to top, 
              hsl(var(--background)) ${20 + fadeOpacity * 30}%, 
              hsl(var(--background) / ${0.6 + fadeOpacity * 0.4}) 70%, 
              transparent 100%)`
          }}
        />
        
        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-background/80 hover:bg-background text-foreground backdrop-blur-sm"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Game Title and Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              {gameData.info.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <span className="text-sm">Available on multiple platforms</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm">{gameData.deals.length} store{gameData.deals.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto p-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Image Card */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <img
                src={headerImage}
                alt={gameData.info.title}
                className="w-full aspect-[3/4] object-cover"
                onError={(e) => {
                  e.currentTarget.src = gameData.info.thumb;
                }}
              />
            </Card>
          </div>

          {/* Game Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pricing */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Available Deals</h2>
                <div className="space-y-3">
                  {gameData.deals.map((deal, index) => {
                    const savings = parseFloat(deal.savings);
                    const storeName = STORE_NAMES[deal.storeID as keyof typeof STORE_NAMES] || 'Unknown Store';
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <StoreIcon store={getStoreFromId(deal.storeID)} className="w-6 h-6" />
                          <span className="font-medium text-foreground">{storeName}</span>
                          {savings > 0 && (
                            <Badge className="bg-gradient-discount text-white border-0">
                              -{savings.toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {savings > 0 && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(deal.retailPrice)}
                            </span>
                          )}
                          <span className={`font-bold text-lg ${parseFloat(deal.price) === 0 ? 'text-success' : 'text-price-highlight'}`}>
                            {formatPrice(deal.price)}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleStoreClick(deal.dealID, deal.storeID)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <ExternalLink className="w-3 h-3 mr-2" />
                            Buy
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Historical Low */}
            {gameData.cheapestPriceEver && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Price History</h3>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground">Historical Low</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-success">
                        {formatPrice(gameData.cheapestPriceEver.price)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(gameData.cheapestPriceEver.date * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Game Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Game Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Platforms</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {gameData.deals.map((deal, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {STORE_NAMES[deal.storeID as keyof typeof STORE_NAMES] || 'Unknown'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Steam App ID</p>
                    <p className="font-medium text-foreground">{steamAppId || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetails;