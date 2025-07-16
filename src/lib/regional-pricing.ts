// Regional pricing system with accurate store-specific pricing
export interface RegionalPricing {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  steamMultiplier: number;
  epicMultiplier: number;
  gogMultiplier: number;
  humbleMultiplier: number;
  fanaticalMultiplier: number;
}

export const REGIONAL_PRICING: { [key: string]: RegionalPricing } = {
  US: {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    symbol: '$',
    steamMultiplier: 1.0,
    epicMultiplier: 1.0,
    gogMultiplier: 1.0,
    humbleMultiplier: 1.0,
    fanaticalMultiplier: 1.0,
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    symbol: '£',
    steamMultiplier: 0.83, // Steam UK pricing
    epicMultiplier: 0.85, // Epic UK pricing
    gogMultiplier: 0.84, // GOG UK pricing
    humbleMultiplier: 0.83, // Humble UK pricing
    fanaticalMultiplier: 0.82, // Fanatical UK pricing
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    symbol: '€',
    steamMultiplier: 0.92, // Steam EU pricing
    epicMultiplier: 0.94, // Epic EU pricing
    gogMultiplier: 0.93, // GOG EU pricing
    humbleMultiplier: 0.92, // Humble EU pricing
    fanaticalMultiplier: 0.91, // Fanatical EU pricing
  },
  IN: {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    symbol: '₹',
    steamMultiplier: 0.25, // Steam India has significant regional pricing
    epicMultiplier: 0.30, // Epic India pricing
    gogMultiplier: 0.35, // GOG India pricing
    humbleMultiplier: 0.40, // Humble India pricing
    fanaticalMultiplier: 0.35, // Fanatical India pricing
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    symbol: 'C$',
    steamMultiplier: 1.35, // Steam Canada pricing
    epicMultiplier: 1.33, // Epic Canada pricing
    gogMultiplier: 1.34, // GOG Canada pricing
    humbleMultiplier: 1.35, // Humble Canada pricing
    fanaticalMultiplier: 1.32, // Fanatical Canada pricing
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    symbol: 'A$',
    steamMultiplier: 1.55, // Steam Australia pricing
    epicMultiplier: 1.52, // Epic Australia pricing
    gogMultiplier: 1.53, // GOG Australia pricing
    humbleMultiplier: 1.55, // Humble Australia pricing
    fanaticalMultiplier: 1.51, // Fanatical Australia pricing
  },
};

export const getRegionalPrice = (
  basePriceUSD: number,
  store: 'steam' | 'epic' | 'gog' | 'humble' | 'fanatical',
  regionCode: string
): number => {
  const region = REGIONAL_PRICING[regionCode];
  if (!region) return basePriceUSD;

  let multiplier: number;
  switch (store) {
    case 'steam':
      multiplier = region.steamMultiplier;
      break;
    case 'epic':
      multiplier = region.epicMultiplier;
      break;
    case 'gog':
      multiplier = region.gogMultiplier;
      break;
    case 'humble':
      multiplier = region.humbleMultiplier;
      break;
    case 'fanatical':
      multiplier = region.fanaticalMultiplier;
      break;
    default:
      multiplier = 1.0;
  }

  const convertedPrice = basePriceUSD * multiplier;
  
  // For INR, round to nearest whole number
  if (region.currency === 'INR') {
    return Math.round(convertedPrice);
  }
  
  return Number(convertedPrice.toFixed(2));
};

export const formatPrice = (price: number, region: RegionalPricing): string => {
  if (price === 0) return 'FREE';
  
  switch (region.currency) {
    case 'INR':
      return `${region.symbol}${Math.round(price)}`;
    default:
      return `${region.symbol}${price.toFixed(2)}`;
  }
};