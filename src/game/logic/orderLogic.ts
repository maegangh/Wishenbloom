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

  // Fallback guard
  if (pools.length === 0) {
    pools.push({ itemPrefix: 'herb_', chainId: 'herbs', minTier: 1, maxTier: 2 });
  }

  return pools;
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
  let totalTier = 0;
  let primaryPrefix = 'herb_';

  for (let i = 0; i < numRequirements; i++) {
    const pool = pools[Math.floor(Math.random() * pools.length)];
    const tier = Math.floor(Math.random() * (pool.maxTier - pool.minTier + 1)) + pool.minTier;
    const reqItemId = `${pool.itemPrefix}${tier}`;
    primaryPrefix = pool.itemPrefix;

    // Verify item exists in item registry
    if (ITEMS[reqItemId] && !requirements.some((r) => r.itemId === reqItemId)) {
      requirements.push({ itemId: reqItemId, count: 1 });
      totalTier += tier;
    }
  }

  if (requirements.length === 0) {
    requirements.push({ itemId: 'herb_1', count: 1 });
    totalTier = 1;
  }

  // Select appropriate NPC based on requested item family
  let npcId = 'elowen';
  if (primaryPrefix === 'potion_') npcId = 'valerie';
  else if (primaryPrefix === 'forge_') npcId = 'balgor';
  else if (primaryPrefix === 'book_') npcId = 'valerie';
  else if (primaryPrefix === 'creature_') npcId = 'sylas';
  else if (primaryPrefix === 'coin_item_') npcId = 'aurelia';
  else if (Math.random() > 0.6) npcId = 'pip';

  const npc = NPCS[npcId] || NPCS['elowen'];

  // Scaled rewards based on total requested tier
  const baseCoins = Math.round(Math.pow(2.0, totalTier) * 8 + totalTier * 15);
  const baseXP = Math.round(totalTier * 18 + 12);
  const bonusGems = totalTier >= 4 && Math.random() > 0.5 ? Math.floor(totalTier / 2) : undefined;
  const bonusEnergy = Math.random() > 0.4 ? 15 : undefined;
  const bonusChest = totalTier >= 5 && Math.random() > 0.7 ? 'chest_wooden' : undefined;

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
      coins: baseCoins,
      xp: baseXP,
      gems: bonusGems,
      energy: bonusEnergy,
      chestId: bonusChest,
    },
    isStoryOrder: false,
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
