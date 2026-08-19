import { StoreProduct } from '../types';
import { BALANCE } from './balance';

/**
 * Wishenbloom - Data-Driven Store Product Catalog.
 *
 * NOTE: Real-money price strings (e.g. '$0.99', '$2.99') are preview/development display
 * strings only. In a production Google Play / App Store environment, localized prices
 * will be dynamically provided by StoreKit / Google Play Billing SDKs.
 */

// 1. Introductory Starter Pack
export const STARTER_WELCOME_PACK: StoreProduct = {
  id: 'starter_bloomkeeper',
  sku: 'wishenbloom_starter_bloomkeeper',
  type: 'bundle',
  displayName: "Bloomkeeper's Welcome Pack",
  description: 'An essential treasure trove featuring 300 Arcane Gems, 1,500 Realm Coins, 100 Bloom Energy, and 1 majestic Royal Chest.',
  previewPrice: '$2.99',
  realCurrencyPrice: 2.99,
  gemGrant: 300,
  coinGrant: 1500,
  energyGrant: 100,
  chestGrantItemId: 'chest_royal_3',
  isOneTime: true,
  isFeatured: true,
  badge: 'One-Time Special',
  icon: '🌸',
};

// 2. Real-Money Gem Packs
export const GEM_PACK_PRODUCTS: StoreProduct[] = [
  {
    id: 'gems_80',
    sku: 'wishenbloom_gems_80',
    type: 'gem_pack',
    displayName: 'Gem Pouch',
    description: 'A handy pouch of 80 glowing Arcane Gems for bubbles and energy refills.',
    previewPrice: '$0.99',
    realCurrencyPrice: 0.99,
    gemGrant: 80,
    icon: '💎',
  },
  {
    id: 'gems_450',
    sku: 'wishenbloom_gems_450',
    type: 'gem_pack',
    displayName: 'Gem Satchel',
    description: 'A crafted leather satchel loaded with 450 Arcane Gems.',
    previewPrice: '$4.99',
    realCurrencyPrice: 4.99,
    gemGrant: 450,
    icon: '💎',
  },
  {
    id: 'gems_1000',
    sku: 'wishenbloom_gems_1000',
    type: 'gem_pack',
    displayName: 'Gem Chest',
    description: 'A solid hardwood chest brimming with 1,000 sparkling Arcane Gems.',
    previewPrice: '$9.99',
    realCurrencyPrice: 9.99,
    gemGrant: 1000,
    isFeatured: true,
    badge: 'Popular',
    icon: '💎',
  },
  {
    id: 'gems_2200',
    sku: 'wishenbloom_gems_2200',
    type: 'gem_pack',
    displayName: 'Gem Vault',
    description: 'An enchanted coffer filled with 2,200 gleaming Arcane Gems.',
    previewPrice: '$19.99',
    realCurrencyPrice: 19.99,
    gemGrant: 2200,
    icon: '💎',
  },
  {
    id: 'gems_6000',
    sku: 'wishenbloom_gems_6000',
    type: 'gem_pack',
    displayName: 'Royal Gem Vault',
    description: 'A grandiose royal treasury cache with 6,000 Arcane Gems.',
    previewPrice: '$49.99',
    realCurrencyPrice: 49.99,
    gemGrant: 6000,
    badge: 'Great Value',
    icon: '💎',
  },
  {
    id: 'gems_13000',
    sku: 'wishenbloom_gems_13000',
    type: 'gem_pack',
    displayName: 'Crown Treasury',
    description: 'The ultimate royal reserve: 13,000 magnificent Arcane Gems.',
    previewPrice: '$99.99',
    realCurrencyPrice: 99.99,
    gemGrant: 13000,
    badge: 'Best Value',
    icon: '👑',
  },
];

// 3. Gem -> Energy In-Game Exchange
export const ENERGY_SHOP_PRODUCTS: StoreProduct[] = [
  {
    id: 'energy_30',
    sku: 'wishenbloom_energy_30',
    type: 'energy_pack',
    displayName: 'Small Energy Flask',
    description: 'Instantly grants 30 Bloom Energy to keep your merges flowing.',
    previewPrice: '15 💎',
    gemCost: 15,
    energyGrant: 30,
    icon: '⚡',
  },
  {
    id: 'energy_60',
    sku: 'wishenbloom_energy_60',
    type: 'energy_pack',
    displayName: 'Medium Energy Vial',
    description: 'Instantly grants 60 Bloom Energy for extended crafting sessions.',
    previewPrice: '25 💎',
    gemCost: 25,
    energyGrant: 60,
    icon: '⚡',
  },
  {
    id: 'energy_100',
    sku: 'wishenbloom_energy_100',
    type: 'energy_pack',
    displayName: 'Large Energy Vessel',
    description: 'A full infusion of 100 Bloom Energy (overflows up to 200).',
    previewPrice: '40 💎',
    gemCost: 40,
    energyGrant: 100,
    isFeatured: true,
    badge: 'Full Refill',
    icon: '⚡',
  },
];

// 4. Gem -> Coin In-Game Exchange
export const COIN_SHOP_PRODUCTS: StoreProduct[] = [
  {
    id: 'coins_500',
    sku: 'wishenbloom_coins_500',
    type: 'coin_pack',
    displayName: 'Coin Purse',
    description: 'Exchange 20 Gems for 500 Realm Coins for generator upgrades and area repairs.',
    previewPrice: '20 💎',
    gemCost: 20,
    coinGrant: 500,
    icon: '🪙',
  },
  {
    id: 'coins_1500',
    sku: 'wishenbloom_coins_1500',
    type: 'coin_pack',
    displayName: 'Coin Sack',
    description: 'Exchange 50 Gems for 1,500 Realm Coins to accelerate kingdom restoration.',
    previewPrice: '50 💎',
    gemCost: 50,
    coinGrant: 1500,
    icon: '🪙',
  },
  {
    id: 'coins_4000',
    sku: 'wishenbloom_coins_4000',
    type: 'coin_pack',
    displayName: 'Coin Vault',
    description: 'Exchange 110 Gems for a grand hoard of 4,000 Realm Coins.',
    previewPrice: '110 💎',
    gemCost: 110,
    coinGrant: 4000,
    badge: 'Best Value',
    icon: '🪙',
  },
];

// Master Catalog Aggregation
export const ALL_STORE_PRODUCTS: StoreProduct[] = [
  STARTER_WELCOME_PACK,
  ...GEM_PACK_PRODUCTS,
  ...ENERGY_SHOP_PRODUCTS,
  ...COIN_SHOP_PRODUCTS,
];

export const STORE_PRODUCT_BY_ID: Record<string, StoreProduct> = ALL_STORE_PRODUCTS.reduce(
  (acc, prod) => {
    acc[prod.id] = prod;
    acc[prod.sku] = prod;
    return acc;
  },
  {} as Record<string, StoreProduct>
);

export function getStoreProduct(idOrSku: string): StoreProduct | undefined {
  return STORE_PRODUCT_BY_ID[idOrSku];
}
