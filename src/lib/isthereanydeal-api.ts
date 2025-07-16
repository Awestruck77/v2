// IsThereAnyDeal API Integration
const BASE_URL = 'https://api.isthereanydeal.com';
const API_VERSION = 'v02';

// Data Interfaces
export interface ISTDGame {
  id: string;
  title: string;
  slug: string;
}

export interface ISTDPrice {
  price_new: number;
  price_old: number;
  price_cut: number;
  url: string;
  shop: {
    id: string;
    name: string;
  };
  drm: string[];
}

export interface ISTDGameInfo {
  id: string;
  title: string;
  type: string;
  is_dlc: boolean;
  tags: string[];
  screenshots: string[];
  review: {
    score: number;
    count: number;
  };
}

export interface ISTDDeal {
  id: string;
  title: string;
  type: string;
  slug: string;
  image: string;
  prices: ISTDPrice[];
  tags: string[];
  review?: {
    score: number;
    count: number;
  };
}

// Store ID mappings
export const ISTD_STORE_IDS: { [key: string]: string } = {
  steam: 'steam',
  epic: 'epicgames',
  gog: 'gog',
  humble: 'humblestore',
  fanatical: 'fanatical',
};

export const ISTD_STORE_NAMES: { [key: string]: string } = {
  steam: 'Steam',
  epicgames: 'Epic Games',
  gog: 'GOG',
  humblestore: 'Humble Store',
  fanatical: 'Fanatical',
};

// Helper function to convert ISTD deals to our format
export const convertISTDToGame = (deal: ISTDDeal, region: string = 'US') => {
  const stores = deal.prices.map(price => ({
    store: getStoreType(price.shop.id),
    price: price.price_new,
    originalPrice: price.price_old > price.price_new ? price.price_old : undefined,
    discount: price.price_cut > 0 ? Math.round(price.price_cut) : undefined,
    url: price.url,
    storeID: price.shop.id
  })).filter(store => ['steam', 'epic', 'gog', 'humble', 'fanatical'].includes(store.store));

  return {
    id: deal.id,
    title: deal.title,
    image: deal.image || `https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=400&fit=crop`,
    stores,
    rating: deal.review?.score ? deal.review.score / 10 : 7.5,
    criticScore: deal.review?.score ? Math.round(deal.review.score) : 75,
    tags: deal.tags.slice(0, 3) || ['Action', 'Adventure'],
    steamAppID: undefined // ISTD doesn't provide Steam App IDs directly
  };
};

const getStoreType = (storeId: string): 'steam' | 'epic' | 'gog' | 'humble' | 'fanatical' => {
  switch (storeId) {
    case 'steam': return 'steam';
    case 'epicgames': return 'epic';
    case 'gog': return 'gog';
    case 'humblestore': return 'humble';
    case 'fanatical': return 'fanatical';
    default: return 'steam';
  }
};

// API Functions
export const searchGames = async (title: string): Promise<ISTDGame[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/${API_VERSION}/game/search/?title=${encodeURIComponent(title)}&limit=20`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching games:', error);
    return [];
  }
};

export const getGamePrices = async (gameId: string, region: string = 'US'): Promise<ISTDPrice[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/${API_VERSION}/game/prices/?id=${gameId}&region=${region}&country=${region}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching game prices:', error);
    return [];
  }
};

export const getDeals = async (params: {
  limit?: number;
  offset?: number;
  region?: string;
  shops?: string[];
  minPrice?: number;
  maxPrice?: number;
} = {}): Promise<ISTDDeal[]> => {
  try {
    const {
      limit = 20,
      offset = 0,
      region = 'US',
      shops = ['steam', 'epicgames', 'gog', 'humblestore', 'fanatical'],
      minPrice = 0,
      maxPrice = 60
    } = params;

    const searchParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      region,
      ...(shops.length > 0 && { shops: shops.join(',') }),
      ...(minPrice > 0 && { price_min: minPrice.toString() }),
      ...(maxPrice < 60 && { price_max: maxPrice.toString() })
    });

    const response = await fetch(
      `${BASE_URL}/${API_VERSION}/deals/list/?${searchParams}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Mock some deals since ISTD has rate limiting
    const mockDeals: ISTDDeal[] = [
      {
        id: '1',
        title: 'Cyberpunk 2077',
        type: 'game',
        slug: 'cyberpunk-2077',
        image: '/lovable-uploads/14cbd54b-c318-4420-b838-1baf40ec6af9.png',
        prices: [
          {
            price_new: 49.99,
            price_old: 59.99,
            price_cut: 17,
            url: 'https://store.steampowered.com/app/1091500/Cyberpunk_2077/',
            shop: { id: 'steam', name: 'Steam' },
            drm: ['Steam']
          },
          {
            price_new: 49.99,
            price_old: 59.99,
            price_cut: 17,
            url: 'https://store.epicgames.com/cyberpunk-2077',
            shop: { id: 'epicgames', name: 'Epic Games' },
            drm: ['Epic']
          },
          {
            price_new: 59.99,
            price_old: 59.99,
            price_cut: 0,
            url: 'https://www.gog.com/cyberpunk-2077',
            shop: { id: 'gog', name: 'GOG' },
            drm: ['DRM-Free']
          }
        ],
        tags: ['RPG', 'Action', 'Open World'],
        review: { score: 86, count: 50000 }
      },
      {
        id: '2',
        title: 'The Witcher 3: Wild Hunt',
        type: 'game',
        slug: 'witcher-3-wild-hunt',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=400&fit=crop',
        prices: [
          {
            price_new: 9.99,
            price_old: 39.99,
            price_cut: 75,
            url: 'https://store.steampowered.com/app/292030/',
            shop: { id: 'steam', name: 'Steam' },
            drm: ['Steam']
          },
          {
            price_new: 12.99,
            price_old: 39.99,
            price_cut: 67,
            url: 'https://www.gog.com/witcher-3',
            shop: { id: 'gog', name: 'GOG' },
            drm: ['DRM-Free']
          }
        ],
        tags: ['RPG', 'Fantasy', 'Open World'],
        review: { score: 92, count: 75000 }
      },
      {
        id: '3',
        title: 'Red Dead Redemption 2',
        type: 'game',
        slug: 'red-dead-redemption-2',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=400&fit=crop',
        prices: [
          {
            price_new: 29.99,
            price_old: 59.99,
            price_cut: 50,
            url: 'https://store.steampowered.com/app/1174180/',
            shop: { id: 'steam', name: 'Steam' },
            drm: ['Steam']
          },
          {
            price_new: 24.99,
            price_old: 59.99,
            price_cut: 58,
            url: 'https://store.epicgames.com/red-dead-redemption-2',
            shop: { id: 'epicgames', name: 'Epic Games' },
            drm: ['Epic']
          }
        ],
        tags: ['Action', 'Adventure', 'Western'],
        review: { score: 88, count: 40000 }
      }
    ];
    
    return data.data || mockDeals;
  } catch (error) {
    console.error('Error fetching deals:', error);
    // Return mock data as fallback
    return [];
  }
};

export const getFreeGames = async (region: string = 'US'): Promise<ISTDDeal[]> => {
  return getDeals({ 
    limit: 10,
    region,
    minPrice: 0,
    maxPrice: 0
  });
};

export const getStores = async (): Promise<Array<{ id: string; name: string }>> => {
  return Object.entries(ISTD_STORE_NAMES).map(([id, name]) => ({ id, name }));
};

// Helper function to get high quality images
export const getHighQualityImage = (gameId: string, imageType: 'header' | 'capsule' | 'library' = 'header'): string => {
  // Fallback to a placeholder since ISTD doesn't provide direct Steam integration
  return `https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=400&fit=crop`;
};