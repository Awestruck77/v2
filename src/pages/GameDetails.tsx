import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ExternalLink, Calendar, Trophy, Users, Play, Image as ImageIcon, Tag, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StoreIcon } from '@/components/StoreIcon';
import { getGameDetails, getAuthenticPrice, STORE_MAPPINGS } from '@/lib/isthereanydeal-api';

const GameDetails = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion] = useState(() => localStorage.getItem('selectedRegion') || 'US');
  const [selectedMedia, setSelectedMedia] = useState<string>('');

  useEffect(() => {
    if (gameId) {
      fetchGameDetails();
    }
  }, [gameId]);

  const fetchGameDetails = async () => {
    if (!gameId) return;
    
    setLoading(true);
    try {
      // Mock enhanced game details
      const mockGameData = {
        id: gameId,
        title: 'Cyberpunk 2077',
        description: 'Cyberpunk 2077 is an open-world, action-adventure RPG set in the dark future of Night City — a dangerous megalopolis obsessed with power, glamour, and ceaseless body modification. You play as V, a mercenary outlaw going after a one-of-a-kind implant that is the key to immortality.',
        developer: 'CD PROJEKT RED',
        publisher: 'CD PROJEKT RED',
        release_date: '2020-12-10',
        platforms: ['Windows', 'PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series X/S', 'Stadia'],
        tags: ['RPG', 'Open World', 'Futuristic', 'Action', 'Story Rich', 'Cyberpunk', 'Mature', 'Nudity', 'First-Person', 'Sci-fi'],
        review: { score: 86, count: 50000, text: 'Very Positive' },
        background: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/page_bg_generated_v6b.jpg',
        screenshots: [
          'https://cdn.akamai.steamstatic.com/steam/apps/1091500/ss_814c25b5d0b8d4be645e5b5c7e5e0b5d5e5e0b5d.1920x1080.jpg',
          'https://cdn.akamai.steamstatic.com/steam/apps/1091500/ss_814c25b5d0b8d4be645e5b5c7e5e0b5d5e5e0b5e.1920x1080.jpg',
          'https://cdn.akamai.steamstatic.com/steam/apps/1091500/ss_814c25b5d0b8d4be645e5b5c7e5e0b5d5e5e0b5f.1920x1080.jpg',
          'https://cdn.akamai.steamstatic.com/steam/apps/1091500/ss_814c25b5d0b8d4be645e5b5c7e5e0b5d5e5e0b60.1920x1080.jpg'
        ],
        videos: [
          'https://cdn.akamai.steamstatic.com/steam/apps/256812115/movie_max.mp4'
        ],
        stores: ['steam', 'epicgames', 'gog', 'humblestore', 'fanatical'],
        dlc: [
          {
            id: 'phantom-liberty',
            title: 'Cyberpunk 2077: Phantom Liberty',
            price: 29.99,
            image: 'https://cdn.akamai.steamstatic.com/steam/apps/2138330/header.jpg',
            description: 'Phantom Liberty is a spy-thriller expansion for Cyberpunk 2077.'
          }
        ],
        price_history: [
          { date: '2024-01-01', price: 29.99, shop: 'Steam' },
          { date: '2024-02-01', price: 39.99, shop: 'Steam' },
          { date: '2024-03-01', price: 49.99, shop: 'Steam' }
        ]
      };
      
      setGameData(mockGameData);
      setSelectedMedia(mockGameData.screenshots[0] || '');
    } catch (error) {
      console.error('Failed to fetch game details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (basePrice: number, storeId: string) => {
    const authenticPrice = getAuthenticPrice(gameData?.title || '', storeId, selectedRegion);
    
    const regionData = STORE_MAPPINGS[storeId as keyof typeof STORE_MAPPINGS]?.regions[selectedRegion as keyof any];
    if (!regionData) return `$${authenticPrice.toFixed(2)}`;
    
    switch (regionData.currency) {
      case 'INR':
        return `₹${Math.round(authenticPrice)}`;
      case 'EUR':
        return `€${authenticPrice.toFixed(2)}`;
      case 'GBP':
        return `£${authenticPrice.toFixed(2)}`;
      case 'CAD':
        return `C$${authenticPrice.toFixed(2)}`;
      case 'AUD':
        return `A$${authenticPrice.toFixed(2)}`;
      default:
        return `$${authenticPrice.toFixed(2)}`;
    }
  };

  const getStoreName = (storeId: string) => {
    const storeNames: { [key: string]: string } = {
      steam: 'Steam',
      epicgames: 'Epic Games',
      gog: 'GOG',
      humblestore: 'Humble Store',
      fanatical: 'Fanatical'
    };
    return storeNames[storeId] || storeId;
  };

  const getStoreIcon = (storeId: string) => {
    const iconMap: { [key: string]: any } = {
      steam: 'steam',
      epicgames: 'epic',
      gog: 'gog',
      humblestore: 'humble',
      fanatical: 'fanatical'
    };
    return iconMap[storeId] || 'steam';
  };

  const handleStoreClick = (storeId: string) => {
    const storeUrls: { [key: string]: string } = {
      steam: `https://store.steampowered.com/search/?term=${encodeURIComponent(gameData?.title || '')}`,
      epicgames: `https://store.epicgames.com/browse?q=${encodeURIComponent(gameData?.title || '')}`,
      gog: `https://www.gog.com/games?search=${encodeURIComponent(gameData?.title || '')}`,
      humblestore: `https://www.humblebundle.com/store/search?search=${encodeURIComponent(gameData?.title || '')}`,
      fanatical: `https://www.fanatical.com/en/search?search=${encodeURIComponent(gameData?.title || '')}`
    };
    
    const url = storeUrls[storeId];
    if (url) {
      window.open(url, '_blank');
    }
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with HD Background */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={gameData.background}
          alt={gameData.title}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-background/80 hover:bg-background text-foreground backdrop-blur-sm"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Game Title and Basic Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {gameData.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-white/90 mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-current text-yellow-400" />
                <span className="text-lg font-semibold">{gameData.review.score}</span>
                <span className="text-sm">({gameData.review.count.toLocaleString()} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(gameData.release_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{gameData.developer}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {gameData.tags.slice(0, 8).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="bg-white/20 text-white border-white/30">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Media Gallery */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="media" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="media" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Media
                </TabsTrigger>
                <TabsTrigger value="about" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  About
                </TabsTrigger>
                <TabsTrigger value="dlc" className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  DLC
                </TabsTrigger>
              </TabsList>

              <TabsContent value="media" className="space-y-6">
                {/* Main Media Display */}
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {selectedMedia.includes('.mp4') ? (
                    <video
                      src={selectedMedia}
                      controls
                      className="w-full h-full object-cover"
                      poster={gameData.screenshots[0]}
                    />
                  ) : (
                    <img
                      src={selectedMedia}
                      alt="Game media"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Media Thumbnails */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {gameData.videos.map((video: string, index: number) => (
                    <div
                      key={`video-${index}`}
                      className={`relative flex-shrink-0 w-32 h-18 bg-black rounded cursor-pointer border-2 ${
                        selectedMedia === video ? 'border-primary' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedMedia(video)}
                    >
                      <img
                        src={gameData.screenshots[0]}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover rounded"
                      />
                      <Play className="absolute inset-0 m-auto w-6 h-6 text-white" />
                    </div>
                  ))}
                  {gameData.screenshots.map((screenshot: string, index: number) => (
                    <img
                      key={`screenshot-${index}`}
                      src={screenshot}
                      alt={`Screenshot ${index + 1}`}
                      className={`flex-shrink-0 w-32 h-18 object-cover rounded cursor-pointer border-2 ${
                        selectedMedia === screenshot ? 'border-primary' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedMedia(screenshot)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Game Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {gameData.description}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Game Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-foreground">Developer</h4>
                        <p className="text-muted-foreground">{gameData.developer}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Publisher</h4>
                        <p className="text-muted-foreground">{gameData.publisher}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Release Date</h4>
                        <p className="text-muted-foreground">
                          {new Date(gameData.release_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Platforms</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {gameData.platforms.map((platform: string) => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              <Monitor className="w-3 h-3 mr-1" />
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {gameData.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dlc" className="space-y-6">
                <div className="grid gap-4">
                  {gameData.dlc.map((dlc: any) => (
                    <Card key={dlc.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={dlc.image}
                            alt={dlc.title}
                            className="w-24 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{dlc.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{dlc.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-lg text-primary">
                                {formatPrice(dlc.price, 'steam')}
                              </span>
                              <Button size="sm">
                                <ExternalLink className="w-3 h-3 mr-2" />
                                View DLC
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Pricing and Store Info */}
          <div className="space-y-6">
            {/* Available Deals */}
            <Card>
              <CardHeader>
                <CardTitle>Available Deals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {gameData.stores.map((storeId: string) => {
                  const price = getAuthenticPrice(gameData.title, storeId, selectedRegion);
                  const originalPrice = price * 1.2;
                  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
                  
                  return (
                    <div key={storeId} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <StoreIcon store={getStoreIcon(storeId)} className="w-6 h-6" />
                        <span className="font-medium text-foreground">{getStoreName(storeId)}</span>
                        {discount > 0 && (
                          <Badge className="bg-gradient-discount text-white border-0">
                            -{discount}%
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {discount > 0 && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(originalPrice, storeId)}
                          </span>
                        )}
                        <span className="font-bold text-lg text-price-highlight">
                          {formatPrice(price, storeId)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleStoreClick(storeId)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <ExternalLink className="w-3 h-3 mr-2" />
                          Buy
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Price History */}
            <Card>
              <CardHeader>
                <CardTitle>Price History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">Historical Low</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-success">
                        {formatPrice(Math.min(...gameData.price_history.map((h: any) => h.price)), 'steam')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(gameData.price_history[0]?.date).toLocaleDateString()}
                      </div>
                    </div>
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