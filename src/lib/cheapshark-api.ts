// CheapShark API integration for game price tracking

export interface CheapSharkGame {
  gameID: string;
  steamAppID: string;
  cheapest: string;
  cheapestDealID: string;
  external: string;
  thumb: string;
}

export interface CheapSharkDeal {
  internalName: string;
  title: string;
  metacriticLink: string;
  dealID: string;
  storeID: string;
  gameID: string;
  salePrice: string;
  normalPrice: string;
  isOnSale: string;
  savings: string;
  metacriticScore: string;
  steamRatingText: string;
  steamRatingPercent: string;
  steamRatingCount: string;
  steamAppID: string;
  releaseDate: number;
  lastChange: number;
  dealRating: string;
  thumb: string;
}

export interface CheapSharkStore {
  storeID: string;
  storeName: string;
  isActive: number;
  images: {
    banner: string;
    logo: string;
    icon: string;
  };
}

export interface GameDetails {
  info: {
    title: string;
    steamAppID: string;
    thumb: string;
  };
  deals: Array<{
    storeID: string;
    dealID: string;
    price: string;
    retailPrice: string;
    savings: string;
  }>;
  cheapestPriceEver: {
    price: string;
    date: number;
  };
}

const BASE_URL = 'https://www.cheapshark.com/api/1.0';

// Store ID mapping for CheapShark
export const STORE_IDS = {
  steam: '1',
  gog: '7',
  epic: '25',
  humblestore: '11',
  fanatical: '15',
  greenmangaming: '3',
  gamebillet: '22',
  indiegala: '21'
};

export const STORE_NAMES = {
  '1': 'Steam',
  '7': 'GOG',
  '25': 'Epic Games',
  '11': 'Humble Store',
  '15': 'Fanatical',
  '3': 'Green Man Gaming',
  '22': 'GameBillet',
  '21': 'IndieGala'
};

export async function searchGames(title: string): Promise<CheapSharkGame[]> {
  try {
    const response = await fetch(`${BASE_URL}/games?title=${encodeURIComponent(title)}&limit=20`);
    if (!response.ok) throw new Error('Failed to search games');
    return await response.json();
  } catch (error) {
    console.error('Error searching games:', error);
    return [];
  }
}

export async function getGameDetails(gameID: string): Promise<GameDetails | null> {
  try {
    const response = await fetch(`${BASE_URL}/games?id=${gameID}`);
    if (!response.ok) throw new Error('Failed to get game details');
    return await response.json();
  } catch (error) {
    console.error('Error getting game details:', error);
    return null;
  }
}

export async function getDeals(params: {
  storeID?: string;
  pageSize?: number;
  sortBy?: string;
  desc?: boolean;
  onSale?: boolean;
  metacritic?: number;
  steamRating?: number;
}): Promise<CheapSharkDeal[]> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.storeID) queryParams.append('storeID', params.storeID);
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.desc !== undefined) queryParams.append('desc', params.desc ? '1' : '0');
    if (params.onSale) queryParams.append('onSale', '1');
    if (params.metacritic) queryParams.append('metacritic', params.metacritic.toString());
    if (params.steamRating) queryParams.append('steamRating', params.steamRating.toString());

    const response = await fetch(`${BASE_URL}/deals?${queryParams.toString()}`);
    if (!response.ok) throw new Error('Failed to get deals');
    return await response.json();
  } catch (error) {
    console.error('Error getting deals:', error);
    return [];
  }
}

export async function getFreeGames(): Promise<CheapSharkDeal[]> {
  return getDeals({
    sortBy: 'Recent',
    desc: true,
    onSale: true,
    pageSize: 20
  }).then(deals => deals.filter(deal => parseFloat(deal.salePrice) === 0));
}

export async function getStores(): Promise<CheapSharkStore[]> {
  try {
    const response = await fetch(`${BASE_URL}/stores`);
    if (!response.ok) throw new Error('Failed to get stores');
    return await response.json();
  } catch (error) {
    console.error('Error getting stores:', error);
    return [];
  }
}

// Helper function to get Steam store page image - highest quality
export function getSteamImage(steamAppID: string): string {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppID}/header.jpg`;
}

// Helper function to get highest quality original game cover art
export function getHighQualityImage(steamAppID: string, imageType: 'header' | 'capsule' | 'library' = 'library'): string {
  const imageMap = {
    header: `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppID}/header.jpg`,
    capsule: `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppID}/capsule_616x353.jpg`,
    library: `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppID}/library_600x900_2x.jpg` // Highest quality
  };
  return imageMap[imageType];
}

// Get original game artwork from multiple sources
export function getOriginalGameArt(steamAppID: string, title: string): string {
  if (steamAppID) {
    // Try multiple Steam image sources for best quality
    const sources = [
      `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppID}/library_600x900_2x.jpg`,
      `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppID}/library_600x900.jpg`,
      `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppID}/header.jpg`,
      `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppID}/capsule_616x353.jpg`
    ];
    return sources[0]; // Return highest quality first
  }
  
  // Fallback for non-Steam games
  return `https://via.placeholder.com/300x400/1a1a1a/888888?text=${encodeURIComponent(title)}`;
}

// Enhanced function to get deals from multiple stores
export async function getMultiStoreDeals(gameTitle?: string): Promise<CheapSharkDeal[]> {
  const storeIds = ['1', '7', '25', '11', '15']; // Steam, GOG, Epic, Humble, Fanatical
  const allDeals: CheapSharkDeal[] = [];

  for (const storeId of storeIds) {
    try {
      const deals = await getDeals({
        storeID: storeId,
        pageSize: 10,
        sortBy: 'Savings',
        desc: true,
        onSale: true
      });
      allDeals.push(...deals);
    } catch (error) {
      console.error(`Error fetching deals from store ${storeId}:`, error);
    }
  }

  // Remove duplicates based on gameID and combine stores for same game
  const gameMap = new Map<string, CheapSharkDeal>();
  
  allDeals.forEach(deal => {
    const existingDeal = gameMap.get(deal.gameID);
    if (!existingDeal || parseFloat(deal.salePrice) < parseFloat(existingDeal.salePrice)) {
      gameMap.set(deal.gameID, deal);
    }
  });

  return Array.from(gameMap.values());
}