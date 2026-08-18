// Wishenbloom - Centralized Game Economy & Balance Constants

export const BALANCE = {
  // === ENERGY SYSTEM ===
  STARTING_ENERGY: 100,
  MAX_ENERGY: 100,
  ENERGY_REGEN_SECONDS: 120, // 1 energy per 120s (2 minutes) -> 200 min full refill
  ENERGY_REGEN_MS: 120 * 1000,
  ENERGY_COST_PER_TAP_DEFAULT: 1,
  ENERGY_COST_RELIQUARY_TAP: 2,

  // === CURRENCIES & INVENTORY ===
  STARTING_COINS: 300,
  STARTING_GEMS: 20,
  STARTING_INVENTORY_SLOTS: 5,
  LEVEL_6_INVENTORY_SLOTS: 6,

  // === TIMED BUBBLE SYSTEM ===
  BUBBLE_SPAWN_CHANCE_NORMAL: 0.04, // 4% chance on merge
  BUBBLE_DURATION_SECONDS: 60,      // 60 seconds before expiring into coin
  BUBBLE_GEM_PRICE_BASE: 2,         // Gem price = 2 + (tier * 1)

  // === DUSTY TILES ===
  DUSTY_MERGE_XP_MULTIPLIER: 2.0,   // Double XP when resolving dusty tiles

  // === MERGE XP MULTIPLIERS ===
  BASE_MERGE_XP_TIER_1: 1,
  BASE_MERGE_XP_TIER_2: 3,
  BASE_MERGE_XP_TIER_3: 6,
  BASE_MERGE_XP_TIER_4: 12,
  BASE_MERGE_XP_TIER_5: 25,
  BASE_MERGE_XP_TIER_6: 50,
  BASE_MERGE_XP_TIER_7: 100,

  // === DISCOVERY REWARDS (Gems) ===
  COMPENDIUM_DISCOVERY_GEMS_TIER_1: 1,
  COMPENDIUM_DISCOVERY_GEMS_TIER_2: 1,
  COMPENDIUM_DISCOVERY_GEMS_TIER_3: 2,
  COMPENDIUM_DISCOVERY_GEMS_TIER_4: 3,
  COMPENDIUM_DISCOVERY_GEMS_TIER_5: 5,

  // === ORDER TIER LIMITS BY PLAYER LEVEL ===
  // Prevents impossible or overwhelming orders during onboarding
  ORDER_MAX_TIER_BY_LEVEL: {
    1: 2, // Only T1-T2 Herbs
    2: 3, // Up to T3 Herbs
    3: 3, // Up to T3 Herbs & Potions
    4: 4, // Up to T4
    5: 4, // Up to T4
    6: 4, // Up to T4
    7: 5, // Up to T5
    8: 5, // Up to T5
    9: 5, // Up to T5
    10: 5, // Up to T5
  } as Record<number, number>,

  // === CHAPTER 1 MILESTONE ===
  CHAPTER_1_MAX_LEVEL: 10,
  CHAPTER_1_CTA_TEXT: 'Continue Your Journey',
};
