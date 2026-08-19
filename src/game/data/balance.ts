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
  LEVEL_18_INVENTORY_SLOTS: 7,
  LEVEL_28_INVENTORY_SLOTS: 8,

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
  BASE_MERGE_XP_TIER_8: 200,

  // === DISCOVERY REWARDS (Gems) ===
  COMPENDIUM_DISCOVERY_GEMS_TIER_1: 1,
  COMPENDIUM_DISCOVERY_GEMS_TIER_2: 1,
  COMPENDIUM_DISCOVERY_GEMS_TIER_3: 2,
  COMPENDIUM_DISCOVERY_GEMS_TIER_4: 3,
  COMPENDIUM_DISCOVERY_GEMS_TIER_5: 5,
  COMPENDIUM_DISCOVERY_GEMS_TIER_6: 8,
  COMPENDIUM_DISCOVERY_GEMS_TIER_7: 12,
  COMPENDIUM_DISCOVERY_GEMS_TIER_8: 20,

  // === ORDER TIER LIMITS BY PLAYER LEVEL ===
  // Prevents impossible or overwhelming orders during onboarding & mid-game
  ORDER_MAX_TIER_BY_LEVEL: {
    1: 2,  // Only T1-T2 Herbs
    2: 3,  // Up to T3 Herbs
    3: 3,  // Up to T3 Herbs & Potions
    4: 4,  // Up to T4
    5: 4,  // Up to T4
    6: 4,  // Up to T4
    7: 5,  // Up to T5
    8: 5,  // Up to T5
    9: 5,  // Up to T5
    10: 5, // Up to T5
    11: 5, // T2-T5
    12: 5, // T2-T5
    13: 5, // T2-T5 (New Textiles grace period)
    14: 5, // T2-T5
    15: 6, // T3-T6 (Special Orders unlock)
    16: 6, // T3-T6
    17: 6, // T3-T6 (New Crystals grace period)
    18: 6, // T3-T6 (+1 Inventory slot)
    19: 6, // T3-T6
    20: 7, // T3-T7 Chapter 2 Milestone
    21: 5, // T3-T5 (Outer Provinces entry)
    22: 6, // T3-T6
    23: 6, // T3-T6 (New Provisions grace period)
    24: 6, // T3-T6
    25: 6, // T3-T6 (Compendium Milestones)
    26: 6, // T3-T6
    27: 6, // T3-T6 (New Lanterns grace period)
    28: 6, // T4-T6 (+1 Inventory slot)
    29: 7, // T4-T7
    30: 7, // T4-T7 Chapter 3 Milestone
  } as Record<number, number>,

  // === ORDER REWARD CONSTANTS ===
  ORDER_TIER_EFFORT: {
    1: 1,
    2: 2,
    3: 4,
    4: 8,
    5: 16,
    6: 32,
    7: 64,
    8: 128,
  } as Record<number, number>,
  NORMAL_ORDER_BASE_COINS: 15,
  NORMAL_ORDER_COIN_PER_EFFORT: 14,
  NORMAL_ORDER_BASE_XP: 15,
  NORMAL_ORDER_XP_PER_EFFORT: 4,

  // === SPECIAL ORDERS (Level 15+) ===
  SPECIAL_ORDER_UNLOCK_LEVEL: 15,
  SPECIAL_ORDER_XP_MULTIPLIER: 2.0,
  SPECIAL_ORDER_COIN_MULTIPLIER: 2.0,
  SPECIAL_ORDER_SPAWN_CHANCE_ON_ORDER: 0.3,

  // === CHAPTER MILESTONES & LEVEL CAP ===
  CURRENT_MAX_PLAYER_LEVEL: 30,
  CHAPTER_1_MAX_LEVEL: 10,
  CHAPTER_2_MAX_LEVEL: 20,
  CHAPTER_3_MAX_LEVEL: 30,
  CHAPTER_1_CTA_TEXT: 'Continue Your Journey',
  CHAPTER_2_CTA_TEXT: 'Continue Your Journey',
  CHAPTER_3_CTA_TEXT: 'Continue Your Journey',

  // === POST-CAP PRESENTATION STRINGS ===
  POST_CAP_TITLE: 'Level 30',
  POST_CAP_SUBTITLE: 'Current Adventure Complete',
  POST_CAP_XP_LABEL: 'Adventure Complete',
  POST_CAP_JOURNEY_TEXT: 'Your journey through the restored provinces continues. More adventures are coming to Wishenbloom.',
};
