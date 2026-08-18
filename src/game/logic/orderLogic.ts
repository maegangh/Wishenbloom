import { BoardItem, NPCOrder, ItemChainId } from '../types';
import { NPCS } from '../data/npcs';
import { ITEMS } from '../data/items';
import { GENERATORS } from '../data/generators';
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

  // If for any rare reason no generators are found, default to starter herbs
  if (ownedGeneratorIds.size === 0) {
    return [
      { itemPrefix: 'herb_', chainId: 'herbs', minTier: 1, maxTier: Math.min(3, playerLevel + 1) },
      { itemPrefix: 'potion_', chainId: 'potions', minTier: 1, maxTier: Math.min(3, playerLevel + 1) },
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
    // Allow up to generator drop tier + 2 (via merging)
    const maxFeasibleTier = Math.min(7, Math.max(2, maxGardenLevel + 2 + Math.floor(playerLevel / 2)));
    pools.push({
      itemPrefix: 'herb_',
      chainId: 'herbs',
      minTier: 1,
      maxTier: maxFeasibleTier,
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
    const maxFeasibleTier = Math.min(7, Math.max(2, maxAlchemistLevel + 2 + Math.floor(playerLevel / 2)));
    pools.push({
      itemPrefix: 'potion_',
      chainId: 'potions',
      minTier: 1,
      maxTier: maxFeasibleTier,
    });
  }

  // 3. Wizard -> Spellbooks
  const hasWizard = Array.from(ownedGeneratorIds).some((id) => id.startsWith('gen_wizard'));
  if (hasWizard) {
    const maxWizardLevel = Math.max(
      ...Array.from(ownedGeneratorIds)
        .filter((id) => id.startsWith('gen_wizard'))
        .map((id) => GENERATORS[id]?.level || 1)
    );
    const maxFeasibleTier = Math.min(6, Math.max(2, maxWizardLevel + 2 + Math.floor(playerLevel / 3)));
    pools.push({
      itemPrefix: 'book_',
      chainId: 'spellbooks',
      minTier: 1,
      maxTier: maxFeasibleTier,
    });
  }

  // 4. Forge -> Blacksmith
  const hasForge = Array.from(ownedGeneratorIds).some((id) => id.startsWith('gen_forge'));
  if (hasForge) {
    const maxForgeLevel = Math.max(
      ...Array.from(ownedGeneratorIds)
        .filter((id) => id.startsWith('gen_forge'))
        .map((id) => GENERATORS[id]?.level || 1)
    );
    const maxFeasibleTier = Math.min(6, Math.max(2, maxForgeLevel + 2 + Math.floor(playerLevel / 3)));
    pools.push({
      itemPrefix: 'forge_',
      chainId: 'blacksmith',
      minTier: 1,
      maxTier: maxFeasibleTier,
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
    const maxFeasibleTier = Math.min(6, Math.max(2, maxNestLevel + 2 + Math.floor(playerLevel / 4)));
    pools.push({
      itemPrefix: 'creature_',
      chainId: 'creatures',
      minTier: 1,
      maxTier: maxFeasibleTier,
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
  const npcKeys = Object.keys(NPCS);
  const selectedNpcKey = npcKeys[Math.floor(Math.random() * npcKeys.length)];
  const npc = NPCS[selectedNpcKey];

  const pools = getProducibleItemPools(grid, inventory, level);

  const numRequirements = level >= 4 && Math.random() > 0.65 ? 2 : 1;
  const requirements: { itemId: string; count: number }[] = [];
  let totalTier = 0;

  for (let i = 0; i < numRequirements; i++) {
    const pool = pools[Math.floor(Math.random() * pools.length)];
    const tier = Math.floor(Math.random() * (pool.maxTier - pool.minTier + 1)) + pool.minTier;
    const reqItemId = `${pool.itemPrefix}${tier}`;

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

  // Scaled rewards based on total requested tier
  const baseCoins = Math.round(Math.pow(2.1, totalTier) * 6 + totalTier * 12);
  const baseXP = Math.round(totalTier * 15 + 10);
  const bonusGems = totalTier >= 4 && Math.random() > 0.5 ? Math.floor(totalTier / 2) : undefined;
  const bonusEnergy = Math.random() > 0.4 ? 15 : undefined;
  const bonusChest = totalTier >= 5 && Math.random() > 0.7 ? 'chest_wooden' : undefined;

  const quotes = [
    `Our realm needs this urgently to keep the Bloom glowing!`,
    `A royal commission for our finest craftsman. You'll be rewarded handsomely!`,
    `My studies will advance tenfold with these materials!`,
    `Wishenbloom thanks you for your dedication, apprentice!`,
    `I have been searching high and low for this magical component!`,
  ];

  return {
    id: `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    npcId: npc.id,
    npcName: npc.name,
    npcRole: npc.role,
    npcAvatar: npc.avatar,
    npcQuote: quotes[Math.floor(Math.random() * quotes.length)],
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
