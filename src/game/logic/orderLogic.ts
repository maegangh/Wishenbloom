import { BoardItem, NPCOrder, ItemChainId } from '../types';
import { NPCS } from '../data/npcs';
import { ITEMS } from '../data/items';
import { GENERATORS } from '../data/generators';
import { BALANCE } from '../data/balance';
import { GRID_ROWS, GRID_COLS } from './boardLogic';

interface ProduciblePool {
  itemPrefix: string;
  chainId: ItemChainId;
  minTier: number;
  maxTier: number;
}

/**
 * Inspects all generators currently on the board or in inventory to determine
 * which item families and tiers the player can legitimately produce.
 */
export function getProducibleItemPools(
  grid: (BoardItem | null)[][],
  inventory: (BoardItem | null)[],
  playerLevel: number
): ProduciblePool[] {
  // Collect all distinct generator IDs in player's possession
  const ownedGeneratorIds = new Set<string>();

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < (grid[r]?.length || 0); c++) {
      const item = grid[r]?.[c];
      if (item?.isGenerator && item.generatorId) {
        ownedGeneratorIds.add(item.generatorId);
      }
    }
  }

  for (const invItem of inventory) {
    if (invItem?.isGenerator && invItem.generatorId) {
      ownedGeneratorIds.add(invItem.generatorId);
    }
  }

  // Tier cap tuned for early player experience from centralized balance
  const levelTierCap =
    BALANCE.ORDER_MAX_TIER_BY_LEVEL[playerLevel] ||
    (playerLevel <= 2 ? 2 : playerLevel <= 4 ? 3 : playerLevel <= 7 ? 4 : 5);

  // If for any rare reason no generators are found, default to starter herbs
  if (ownedGeneratorIds.size === 0) {
    return [
      { itemPrefix: 'herb_', chainId: 'herbs', minTier: 1, maxTier: Math.min(levelTierCap, 2) },
    ];
  }

  const pools: ProduciblePool[] = [];

  // 1. Garden -> Herbs
  const hasGarden = Array.from(ownedGeneratorIds).some((id) => id.startsWith('gen_garden'));
  if (hasGarden) {
    const maxGardenLevel = Math.max(
      ...Array.from(ownedGeneratorIds)
        .filter((id) => id.startsWith('gen_garden'))
        .map((id) => GENERATORS[id]?.level || 1)
    );
    const maxFeasibleTier = Math.min(levelTierCap, maxGardenLevel + 2);
    pools.push({
      itemPrefix: 'herb_',
      chainId: 'herbs',
      minTier: 1,
      maxTier: Math.max(1, maxFeasibleTier),
    });
  }

  // 2. Alchemist -> Potions
  const hasAlchemist = Array.from(ownedGeneratorIds).some((id) => id.startsWith('gen_alchemist'));
  if (hasAlchemist) {
    const maxAlchemistLevel = Math.max(
      ...Array.from(ownedGeneratorIds)
        .filter((id) => id.startsWith('gen_alchemist'))
        .map((id) => GENERATORS[id]?.level || 1)
    );
    const maxFeasibleTier = Math.min(levelTierCap, maxAlchemistLevel + 2);
    pools.push({
      itemPrefix: 'potion_',
      chainId: 'potions',
      minTier: 1,
      maxTier: Math.max(1, maxFeasibleTier),
    });
  }

  // 3. Forge -> Blacksmith
  const hasForge = Array.from(ownedGeneratorIds).some((id) => id.startsWith('gen_forge'));
  if (hasForge) {
    const maxForgeLevel = Math.max(
      ...Array.from(ownedGeneratorIds)
        .filter((id) => id.startsWith('gen_forge'))
        .map((id) => GENERATORS[id]?.level || 1)
    );
    const maxFeasibleTier = Math.min(levelTierCap, maxForgeLevel + 2);
    pools.push({
      itemPrefix: 'forge_',
      chainId: 'blacksmith',
      minTier: 1,
      maxTier: Math.max(1, maxFeasibleTier),
    });
  }

  // 4. Wizard -> Spellbooks
  const hasWizard = Array.from(ownedGeneratorIds).some((id) => id.startsWith('gen_wizard'));
  if (hasWizard) {
    const maxWizardLevel = Math.max(
      ...Array.from(ownedGeneratorIds)
        .filter((id) => id.startsWith('gen_wizard'))
        .map((id) => GENERATORS[id]?.level || 1)
    );
    const maxFeasibleTier = Math.min(levelTierCap, maxWizardLevel + 2);
    pools.push({
      itemPrefix: 'book_',
      chainId: 'spellbooks',
      minTier: 1,
      maxTier: Math.max(1, maxFeasibleTier),
    });
  }

  // 5. Nest -> Creatures
  const hasNest = Array.from(ownedGeneratorIds).some((id) => id.startsWith('gen_nest'));
  if (hasNest) {
    const maxNestLevel = Math.max(
      ...Array.from(ownedGeneratorIds)
        .filter((id) => id.startsWith('gen_nest'))
        .map((id) => GENERATORS[id]?.level || 1)
    );
    const maxFeasibleTier = Math.min(levelTierCap, maxNestLevel + 2);
    pools.push({
      itemPrefix: 'creature_',
      chainId: 'creatures',
      minTier: 1,
      maxTier: Math.max(1, maxFeasibleTier),
    });
  }

  // 6. Royal Reliquary -> Treasures
  const hasTree = Array.from(ownedGeneratorIds).some((id) => id.startsWith('gen_tree'));
  if (hasTree) {
    pools.push({
      itemPrefix: 'coin_item_',
      chainId: 'treasures',
      minTier: 1,
      maxTier: Math.min(levelTierCap, 3),
    });
  }

  // 7. Enchanted Loom -> Textiles
  const hasLoom = Array.from(ownedGeneratorIds).some((id) => id.startsWith('gen_loom'));
  if (hasLoom) {
    const maxLoomLevel = Math.max(
      ...Array.from(ownedGeneratorIds)
        .filter((id) => id.startsWith('gen_loom'))
        .map((id) => GENERATORS[id]?.level || 1)
    );
    const maxFeasibleTier = Math.min(levelTierCap, maxLoomLevel + 2);
    pools.push({
      itemPrefix: 'textile_',
      chainId: 'textiles',
      minTier: 1,
      maxTier: Math.max(1, maxFeasibleTier),
    });
  }

  // 8. Runic Excavation -> Crystals
  const hasQuarry = Array.from(ownedGeneratorIds).some((id) => id.startsWith('gen_quarry'));
  if (hasQuarry) {
    const maxQuarryLevel = Math.max(
      ...Array.from(ownedGeneratorIds)
        .filter((id) => id.startsWith('gen_quarry'))
        .map((id) => GENERATORS[id]?.level || 1)
    );
    const maxFeasibleTier = Math.min(levelTierCap, maxQuarryLevel + 2);
    pools.push({
      itemPrefix: 'crystal_',
      chainId: 'crystals',
      minTier: 1,
      maxTier: Math.max(1, maxFeasibleTier),
    });
  }

  // 9. Bloomkeeper's Hearth -> Provisions
  const hasHearth = Array.from(ownedGeneratorIds).some((id) => id.startsWith('gen_hearth'));
  if (hasHearth) {
    const maxHearthLevel = Math.max(
      ...Array.from(ownedGeneratorIds)
        .filter((id) => id.startsWith('gen_hearth'))
        .map((id) => GENERATORS[id]?.level || 1)
    );
    const maxFeasibleTier = Math.min(levelTierCap, maxHearthLevel + 2);
    pools.push({
      itemPrefix: 'provision_',
      chainId: 'provisions',
      minTier: 1,
      maxTier: Math.max(1, maxFeasibleTier),
    });
  }

  // 10. Starlight Workshop -> Lanterns
  const hasLantern = Array.from(ownedGeneratorIds).some((id) => id.startsWith('gen_lantern'));
  if (hasLantern) {
    const maxLanternLevel = Math.max(
      ...Array.from(ownedGeneratorIds)
        .filter((id) => id.startsWith('gen_lantern'))
        .map((id) => GENERATORS[id]?.level || 1)
    );
    const maxFeasibleTier = Math.min(levelTierCap, maxLanternLevel + 2);
    pools.push({
      itemPrefix: 'lantern_',
      chainId: 'lanterns',
      minTier: 1,
      maxTier: Math.max(1, maxFeasibleTier),
    });
  }

  // Fallback guard
  if (pools.length === 0) {
    pools.push({ itemPrefix: 'herb_', chainId: 'herbs', minTier: 1, maxTier: 2 });
  }

  return pools;
}

export interface OrderRewardCalculation {
  coins: number;
  xp: number;
  gems?: number;
  energy?: number;
  chestId?: string;
  totalEffort: number;
  totalTier: number;
}

/**
 * Centralized formula to calculate controlled order rewards based on requested item tiers
 * and production effort without runaway exponential explosions.
 */
export function calculateOrderRewards(
  requirements: { itemId: string; count: number }[],
  isSpecial = false
): OrderRewardCalculation {
  let totalEffort = 0;
  let totalTier = 0;

  for (const req of requirements) {
    const item = ITEMS[req.itemId];
    const tier = item?.tier || parseInt(req.itemId.split('_')[1], 10) || 1;
    const count = req.count || 1;
    const effort = (BALANCE.ORDER_TIER_EFFORT[tier] ?? Math.pow(2, Math.max(0, tier - 1))) * count;
    totalEffort += effort;
    totalTier += tier * count;
  }

  // Normal baseline rewards: base + effort * multiplier
  const normalCoins = Math.round(
    BALANCE.NORMAL_ORDER_BASE_COINS + totalEffort * BALANCE.NORMAL_ORDER_COIN_PER_EFFORT
  );
  const normalXP = Math.round(
    BALANCE.NORMAL_ORDER_BASE_XP + totalEffort * BALANCE.NORMAL_ORDER_XP_PER_EFFORT + totalTier * 2
  );

  if (isSpecial) {
    const coins = Math.round(normalCoins * BALANCE.SPECIAL_ORDER_COIN_MULTIPLIER);
    const xp = Math.round(normalXP * BALANCE.SPECIAL_ORDER_XP_MULTIPLIER);
    const gems = Math.min(10, Math.max(4, Math.floor(totalEffort / 6)));
    const chestId = totalEffort >= 32 ? 'chest_golden' : 'chest_silver';

    return {
      coins,
      xp,
      gems,
      chestId,
      totalEffort,
      totalTier,
    };
  }

  // Normal Order rewards
  const bonusGems =
    totalEffort >= 16 && Math.random() > 0.6 ? Math.min(3, Math.floor(totalEffort / 16)) : undefined;
  const bonusEnergy = Math.random() > 0.4 ? 15 : undefined;
  const bonusChest = totalEffort >= 32 && Math.random() > 0.7 ? 'chest_wooden' : undefined;

  return {
    coins: normalCoins,
    xp: normalXP,
    gems: bonusGems,
    energy: bonusEnergy,
    chestId: bonusChest,
    totalEffort,
    totalTier,
  };
}

/**
 * Generates a safe dynamic NPC order that strictly requires items the player can produce.
 */
export function generateSafeRandomOrder(
  grid: (BoardItem | null)[][],
  inventory: (BoardItem | null)[],
  level: number,
  existingOrderIds: string[]
): NPCOrder {
  const pools = getProducibleItemPools(grid, inventory, level);

  // Multi-item orders only appear from Level 4+
  const numRequirements = level >= 4 && Math.random() > 0.65 ? 2 : 1;
  const requirements: { itemId: string; count: number }[] = [];
  let primaryPrefix = 'herb_';

  for (let i = 0; i < numRequirements; i++) {
    const pool = pools[Math.floor(Math.random() * pools.length)];
    const tier = Math.floor(Math.random() * (pool.maxTier - pool.minTier + 1)) + pool.minTier;
    const reqItemId = `${pool.itemPrefix}${tier}`;
    primaryPrefix = pool.itemPrefix;

    // Verify item exists in item registry
    if (ITEMS[reqItemId] && !requirements.some((r) => r.itemId === reqItemId)) {
      requirements.push({ itemId: reqItemId, count: 1 });
    }
  }

  if (requirements.length === 0) {
    requirements.push({ itemId: 'herb_1', count: 1 });
  }

  let npcId = 'elowen';
  if (primaryPrefix === 'potion_') npcId = 'valerie';
  else if (primaryPrefix === 'forge_') npcId = 'balgor';
  else if (primaryPrefix === 'book_') npcId = 'valerie';
  else if (primaryPrefix === 'creature_') npcId = 'sylas';
  else if (primaryPrefix === 'textile_') npcId = 'celeste';
  else if (primaryPrefix === 'crystal_') npcId = 'gideon';
  else if (primaryPrefix === 'provision_') npcId = 'bram';
  else if (primaryPrefix === 'lantern_') npcId = 'elena';
  else if (primaryPrefix === 'coin_item_') npcId = 'aurelia';
  else if (Math.random() > 0.6) npcId = 'pip';

  const npc = NPCS[npcId] || NPCS['elowen'];

  // Scaled rewards calculated safely via centralized helper
  const rewardCalc = calculateOrderRewards(requirements, false);

  const quotes: Record<string, string[]> = {
    elowen: [
      'The ancient roots thirst for your gentle Bloom magic, Bloomkeeper!',
      'These botanical specimens will help heal the whispering woods.',
      'A wonderful bloom! The conservatory rejoices with fresh vitality.',
    ],
    valerie: [
      'My alembics are prepared. These distillations will fortify our protective wards!',
      'The cosmic alignment favors this brew. Thank you, Bloomkeeper.',
      'High sorcery requires exquisite ingredients—splendid work!',
    ],
    balgor: [
      'Aye! My anvil is glowing hot and ready to shape this metal!',
      'By the mountain spark, this will forge a fine blade for the realm!',
      'True craftsmanship never rusts. Top coins for your trouble, apprentice!',
    ],
    aurelia: [
      'Every object restored brings our kingdom one step closer to its golden era.',
      'The royal court commends your steadfast devotion to Wishenbloom!',
      'May the living Bloom shine upon our people once more.',
    ],
    pip: [
      'Ooh, shiny! My cart will look fabulous with these items on display!',
      'Top coin for top wares! That’s the Pip guarantee!',
      'A bargain made under the stars! Come back anytime, Bloomkeeper!',
    ],
    sylas: [
      'The hatchlings are singing atop the roost! They will love this!',
      'A true friend of the high cliffs. The winged beasts salute you!',
      'The drakes fly higher whenever the living Bloom grows stronger.',
    ],
    celeste: [
      'Every thread woven into these silks holds a stanza of our royal history.',
      'The starlight weave is immaculate! This will adorn the grand hall.',
      'Wishenbloom’s regalia shines with genuine Bloom luminescence once more.',
    ],
    gideon: [
      'The subterranean bedrock hums when these crystals resonate in harmony!',
      'An exquisite runestone specimen! The ancient leylines are stirring.',
      'My excavations confirm the conduits were fortified, not destroyed.',
    ],
    bram: [
      'Fresh from the hearth! A piping hot feast keeps our spirits high and shoulders strong.',
      'A pinch of moonberries and a dash of hearth spice makes everything taste like home.',
      'The travelers past the Veiled Gate will feast royally tonight thanks to your harvest!',
    ],
    elena: [
      'The mists in the outer passes are thick tonight, but this starlight lantern will pierce them cleanly.',
      'Every beacon we light reveals another forgotten trail of our ancestors.',
      'The celestial leyline aligns ahead—safe travels through the high ridge!',
    ],
  };

  const npcQuoteList = quotes[npc.id] || quotes.elowen;
  const selectedQuote = npcQuoteList[Math.floor(Math.random() * npcQuoteList.length)];

  return {
    id: `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    npcId: npc.id,
    npcName: npc.name,
    npcRole: npc.role,
    npcAvatar: npc.avatar,
    npcQuote: selectedQuote,
    requirements,
    rewards: {
      coins: rewardCalc.coins,
      xp: rewardCalc.xp,
      gems: rewardCalc.gems,
      energy: rewardCalc.energy,
      chestId: rewardCalc.chestId,
    },
    isStoryOrder: false,
    isSpecialOrder: false,
  };
}

/**
 * Generates a high-value, optional Special Order (Royal Commission) for Level 15+ players.
 */
export function generateSpecialOrder(
  grid: (BoardItem | null)[][],
  inventory: (BoardItem | null)[],
  level: number
): NPCOrder | null {
  if (level < BALANCE.SPECIAL_ORDER_UNLOCK_LEVEL) {
    return null;
  }

  const pools = getProducibleItemPools(grid, inventory, level);
  if (pools.length === 0) return null;

  // Pick 1-2 distinct high-tier items from available pools
  const numReqs = Math.random() > 0.5 ? 2 : 1;
  const requirements: { itemId: string; count: number }[] = [];
  let primaryPrefix = 'textile_';

  for (let i = 0; i < numReqs; i++) {
    const pool = pools[Math.floor(Math.random() * pools.length)];
    // Select upper half of tiers for special commission
    const minT = Math.max(pool.minTier, Math.floor((pool.minTier + pool.maxTier) / 2));
    const tier = Math.floor(Math.random() * (pool.maxTier - minT + 1)) + minT;
    const reqItemId = `${pool.itemPrefix}${tier}`;
    primaryPrefix = pool.itemPrefix;

    if (ITEMS[reqItemId] && !requirements.some((r) => r.itemId === reqItemId)) {
      requirements.push({ itemId: reqItemId, count: 1 });
    }
  }

  if (requirements.length === 0) {
    requirements.push({ itemId: 'potion_4', count: 1 });
  }

  let npcId = 'aurelia';
  if (primaryPrefix === 'textile_') npcId = 'celeste';
  else if (primaryPrefix === 'crystal_') npcId = 'gideon';
  else if (primaryPrefix === 'provision_') npcId = 'bram';
  else if (primaryPrefix === 'lantern_') npcId = 'elena';
  else if (primaryPrefix === 'potion_') npcId = 'valerie';
  else if (primaryPrefix === 'book_') npcId = 'valerie';

  const npc = NPCS[npcId] || NPCS['aurelia'];

  const rewardCalc = calculateOrderRewards(requirements, true);

  const specialQuotes: Record<string, string> = {
    aurelia: 'The Royal Commission urgently requests this masterwork for the grand restoration celebration!',
    celeste: 'The Atelier requires these exquisite materials to finish the Sovereign Coronation Tapestry.',
    gideon: 'An urgent subterranean survey requires resonant conduit samples. Immense royal bounties await!',
    valerie: 'The High Observatory must align these rare arcana to fortify the regional Bloom barriers.',
    bram: 'The Royal Banquet in Moonhaven requires this supreme culinary spread immediately!',
    elena: 'A perilous expedition across the foggy crags needs powerful celestial lanterns without delay!',
  };

  return {
    id: `special_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    npcId: npc.id,
    npcName: npc.name,
    npcRole: 'Royal Commission',
    npcAvatar: npc.avatar,
    npcQuote: specialQuotes[npc.id] || specialQuotes.aurelia,
    requirements,
    rewards: {
      coins: rewardCalc.coins,
      xp: rewardCalc.xp,
      gems: rewardCalc.gems,
      chestId: rewardCalc.chestId,
    },
    isStoryOrder: false,
    isSpecialOrder: true,
  };
}

/**
 * Checks if all required items for an order are available in normal state on the board.
 */
export function isOrderFulfillable(
  order: NPCOrder,
  grid: (BoardItem | null)[][]
): boolean {
  const boardItemCounts: Record<string, number> = {};

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const item = grid[r]?.[c];
      if (item && item.tileState === 'normal' && !item.isGenerator) {
        boardItemCounts[item.itemId] = (boardItemCounts[item.itemId] || 0) + 1;
      }
    }
  }

  return order.requirements.every((req) => (boardItemCounts[req.itemId] || 0) >= req.count);
}
