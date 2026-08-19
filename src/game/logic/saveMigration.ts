import { GameState, BoardItem, DailyTaskState } from '../types';
import { INITIAL_ORDERS } from '../data/npcs';
import { INITIAL_KINGDOM_AREAS } from '../data/kingdom';
import { INITIAL_QUESTS } from '../data/quests';
import { LEVEL_PROGRESSION, CURRENT_MAX_PLAYER_LEVEL } from '../data/progression';
import { getUtcDateKey } from '../data/dailyRewards';
import { generateDailyTasksForDate } from '../data/dailyTasks';
import { GRID_ROWS, GRID_COLS } from './boardLogic';
import { resolveExpiredBubbles } from './bubbleLogic';

export const PRIMARY_STORAGE_KEY = 'wishenbloom_save_v1';
export const LEGACY_STORAGE_KEY = 'mergevale_save_v1'; // Legacy key for backward compatibility
export const CURRENT_SCHEMA_VERSION = 5;
export const ENERGY_RECHARGE_SECONDS = 120; // 1 energy every 2 minutes

/**
 * Creates a brand new starting state with all default fields for Level 1 player.
 * In a fresh game, only the Enchanted Garden (gen_garden_1) is available.
 */
export function createDefaultInitialState(now: number = Date.now()): GameState {
  const grid: (BoardItem | null)[][] = Array(GRID_ROWS)
    .fill(null)
    .map(() => Array(GRID_COLS).fill(null));

  // Initial starter generator: Enchanted Garden only
  grid[0][0] = {
    instanceId: 'item_gen_garden',
    itemId: 'herb_1',
    isGenerator: true,
    generatorId: 'gen_garden_1',
    tileState: 'normal',
  };

  // Pre-placed starter items (Herbalism focus for Level 1)
  grid[2][2] = { instanceId: 'init_herb_1', itemId: 'herb_1', tileState: 'normal' };
  grid[2][3] = { instanceId: 'init_herb_2', itemId: 'herb_1', tileState: 'normal' };
  grid[4][4] = { instanceId: 'init_dusty_herb', itemId: 'herb_1', tileState: 'dusty' };
  grid[4][5] = { instanceId: 'init_chest_1', itemId: 'chest_wooden', tileState: 'normal' };

  const inventory: (BoardItem | null)[] = [null, null, null, null, null];
  const todayKey = getUtcDateKey(now);

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    level: 1,
    xp: 0,
    xpToNextLevel: LEVEL_PROGRESSION[1]?.xpRequired || 40,
    coins: 300,
    gems: 20,
    energy: 100,
    maxEnergy: 100,
    lastEnergyRechargeAt: now,

    grid,
    inventory,
    maxInventorySlots: 5,

    activeOrders: INITIAL_ORDERS,
    activeQuests: INITIAL_QUESTS,
    kingdomAreas: INITIAL_KINGDOM_AREAS,

    // Daily Retention Systems
    dailyRewardCycleDay: 1,
    lastDailyRewardClaimDate: null,
    dailyTasksDateKey: todayKey,
    dailyTasks: generateDailyTasksForDate(grid, inventory, 1, todayKey),
    dailyCompletionClaimed: false,

    // Monetization & IAP State
    processedTransactionIds: [],
    purchasedOneTimeProductIds: [],
    pendingRewards: [],

    discoveredItemIds: ['herb_1', 'chest_wooden'],
    claimedDiscoveryRewardIds: [],
    claimedLevelRewardIds: [],
    claimedCompendiumMilestoneIds: [],

    tutorialStep: 0,
    isTutorialActive: true,

    settings: {
      soundEnabled: true,
      musicEnabled: false,
      hapticsEnabled: true,
      highContrast: false,
    },
    stats: {
      totalMerges: 0,
      totalOrdersCompleted: 0,
      totalCoinsEarned: 300,
      totalGemsEarned: 20,
      totalGeneratorsTapped: 0,
      kingdomAreasCompleted: 0,
      mockPurchasesCompleted: 0,
      gemsPurchased: 0,
      gemsSpent: 0,
      energyPurchased: 0,
      coinsPurchased: 0,
    },
    lastSavedAt: now,
    lastSeenAt: now,
  };
}

/**
 * Hydrates raw JSON string into a validated, hardened GameState object with offline updates applied.
 */
export function hydrateAndMigrateSave(
  primaryRaw: string | null,
  legacyRaw: string | null,
  now = Date.now()
): { state: GameState; isMigratedFromLegacy: boolean; recoveredOfflineEnergy?: number } {
  let rawJson = primaryRaw;
  let isMigratedFromLegacy = false;

  if (!rawJson && legacyRaw) {
    rawJson = legacyRaw;
    isMigratedFromLegacy = true;
  }

  if (!rawJson) {
    return { state: createDefaultInitialState(), isMigratedFromLegacy: false };
  }

  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object') {
      return { state: createDefaultInitialState(), isMigratedFromLegacy: false };
    }

    const defaultState = createDefaultInitialState();
    const rawLevel = typeof parsed.level === 'number' && parsed.level > 0 ? Math.floor(parsed.level) : 1;
    const playerLevel = Math.min(CURRENT_MAX_PLAYER_LEVEL, Math.max(1, rawLevel));
    const maxInventorySlots = typeof parsed.maxInventorySlots === 'number'
      ? Math.max(parsed.maxInventorySlots, playerLevel >= 28 ? 8 : playerLevel >= 18 ? 7 : playerLevel >= 6 ? 6 : 5)
      : playerLevel >= 28 ? 8 : playerLevel >= 18 ? 7 : playerLevel >= 6 ? 6 : 5;

    // 1. Grid validation (Must be 9 rows x 7 cols)
    let validatedGrid: (BoardItem | null)[][] = defaultState.grid;
    if (Array.isArray(parsed.grid) && parsed.grid.length > 0) {
      validatedGrid = Array(GRID_ROWS)
        .fill(null)
        .map((_, r) =>
          Array(GRID_COLS)
            .fill(null)
            .map((__, c) => {
              const cell = parsed.grid[r]?.[c];
              if (cell && typeof cell === 'object' && typeof cell.itemId === 'string') {
                return {
                  instanceId: cell.instanceId || `item_${r}_${c}_${Date.now()}`,
                  itemId: cell.itemId,
                  isGenerator: Boolean(cell.isGenerator),
                  generatorId: cell.generatorId,
                  tileState: cell.tileState || 'normal',
                  bubbleExpiresAt: typeof cell.bubbleExpiresAt === 'number' ? cell.bubbleExpiresAt : undefined,
                  bubblePrice: typeof cell.bubblePrice === 'number' ? cell.bubblePrice : undefined,
                  dustyMergeCount: cell.dustyMergeCount,
                  lastTappedAt: cell.lastTappedAt,
                  cooldownUntil: typeof cell.cooldownUntil === 'number' ? cell.cooldownUntil : undefined,
                };
              }
              return null;
            })
        );
    }

    // 2. Resolve any bubbles that expired while offline
    const bubbleCheck = resolveExpiredBubbles(validatedGrid, now);
    validatedGrid = bubbleCheck.grid;

    // 3. Inventory validation (respects slot expansion)
    let validatedInventory: (BoardItem | null)[] = Array(maxInventorySlots).fill(null);
    if (Array.isArray(parsed.inventory)) {
      for (let idx = 0; idx < maxInventorySlots; idx++) {
        const invItem = parsed.inventory[idx];
        if (invItem && typeof invItem === 'object' && typeof invItem.itemId === 'string') {
          validatedInventory[idx] = invItem;
        }
      }
    }

    // 4. Currencies & Offline Energy Calculation
    const maxEnergy = typeof parsed.maxEnergy === 'number' ? parsed.maxEnergy : 100;
    const initialSavedEnergy = typeof parsed.energy === 'number' ? parsed.energy : maxEnergy;
    let energy = initialSavedEnergy;
    let lastEnergyRechargeAt = typeof parsed.lastEnergyRechargeAt === 'number' ? parsed.lastEnergyRechargeAt : now;
    let recoveredOfflineEnergy = 0;

    if (lastEnergyRechargeAt && energy < maxEnergy) {
      const elapsedSec = (now - lastEnergyRechargeAt) / 1000;
      const energyToAdd = Math.floor(elapsedSec / ENERGY_RECHARGE_SECONDS);
      if (energyToAdd > 0) {
        energy = Math.min(maxEnergy, initialSavedEnergy + energyToAdd);
        recoveredOfflineEnergy = energy - initialSavedEnergy;
        lastEnergyRechargeAt = now - ((elapsedSec % ENERGY_RECHARGE_SECONDS) * 1000);
      }
    }

    // 5. Daily Retention Hydration & Date Boundary Check
    const todayUtc = getUtcDateKey(now);
    let dailyRewardCycleDay = 1;
    if (typeof parsed.dailyRewardCycleDay === 'number' && parsed.dailyRewardCycleDay >= 1 && parsed.dailyRewardCycleDay <= 7) {
      dailyRewardCycleDay = Math.floor(parsed.dailyRewardCycleDay);
    }

    const lastDailyRewardClaimDate = typeof parsed.lastDailyRewardClaimDate === 'string'
      ? parsed.lastDailyRewardClaimDate
      : null;

    let dailyTasks: DailyTaskState[] = [];
    let dailyTasksDateKey = todayUtc;
    let dailyCompletionClaimed = false;

    if (
      parsed.dailyTasksDateKey === todayUtc &&
      Array.isArray(parsed.dailyTasks) &&
      parsed.dailyTasks.length === 3
    ) {
      // Preserve current day's ongoing tasks
      dailyTasks = parsed.dailyTasks.map((t: any, idx: number) => ({
        id: typeof t.id === 'string' ? t.id : `daily_${todayUtc}_task_${idx + 1}`,
        templateId: typeof t.templateId === 'string' ? t.templateId : `template_${idx + 1}`,
        title: typeof t.title === 'string' ? t.title : `Daily Task ${idx + 1}`,
        description: typeof t.description === 'string' ? t.description : 'Complete task',
        type: t.type || 'merge',
        target: typeof t.target === 'number' ? t.target : 10,
        current: typeof t.current === 'number' ? Math.max(0, t.current) : 0,
        rewards: t.rewards && typeof t.rewards === 'object' ? t.rewards : { coins: 150, energy: 10 },
        isCompleted: Boolean(t.isCompleted || (typeof t.current === 'number' && typeof t.target === 'number' && t.current >= t.target)),
        isClaimed: Boolean(t.isClaimed),
      }));
      dailyCompletionClaimed = Boolean(parsed.dailyCompletionClaimed);
    } else {
      // New UTC date or uninitialized: generate fresh tasks for today
      dailyTasks = generateDailyTasksForDate(validatedGrid, validatedInventory, playerLevel, todayUtc);
      dailyCompletionClaimed = false;
    }

    // 6. Kingdom Areas validation
    let kingdomAreas = defaultState.kingdomAreas;
    if (Array.isArray(parsed.kingdomAreas) && parsed.kingdomAreas.length > 0) {
      kingdomAreas = defaultState.kingdomAreas.map((defaultArea) => {
        const savedArea = parsed.kingdomAreas.find((a: any) => a?.id === defaultArea.id);
        if (savedArea && typeof savedArea.currentStage === 'number') {
          return {
            ...defaultArea,
            currentStage: Math.min(defaultArea.maxStages, Math.max(0, savedArea.currentStage)),
          };
        }
        return defaultArea;
      });
    }

    const defaultProg = LEVEL_PROGRESSION[playerLevel] || LEVEL_PROGRESSION[1];
    const defaultXpToNext = defaultProg.xpRequired;
    const rawXp = typeof parsed.xp === 'number' ? parsed.xp : 0;
    const safeXp = playerLevel >= CURRENT_MAX_PLAYER_LEVEL ? Math.min(defaultXpToNext, rawXp) : rawXp;

    const hydrated: GameState = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      level: playerLevel,
      xp: safeXp,
      xpToNextLevel: typeof parsed.xpToNextLevel === 'number' ? parsed.xpToNextLevel : defaultXpToNext,
      coins: typeof parsed.coins === 'number' ? parsed.coins : 300,
      gems: typeof parsed.gems === 'number' ? parsed.gems : 20,
      energy,
      maxEnergy,
      lastEnergyRechargeAt,

      grid: validatedGrid,
      inventory: validatedInventory,
      maxInventorySlots,

      activeOrders: Array.isArray(parsed.activeOrders) && parsed.activeOrders.length > 0
        ? parsed.activeOrders
        : INITIAL_ORDERS,
      specialOrder: parsed.specialOrder && typeof parsed.specialOrder === 'object' ? parsed.specialOrder : undefined,
      activeQuests: Array.isArray(parsed.activeQuests) && parsed.activeQuests.length > 0
        ? parsed.activeQuests
        : INITIAL_QUESTS,
      
      // Daily Retention Systems
      dailyRewardCycleDay,
      lastDailyRewardClaimDate,
      dailyTasksDateKey,
      dailyTasks,
      dailyCompletionClaimed,

      // Monetization & IAP State
      processedTransactionIds: Array.isArray(parsed.processedTransactionIds) ? parsed.processedTransactionIds : [],
      purchasedOneTimeProductIds: Array.isArray(parsed.purchasedOneTimeProductIds) ? parsed.purchasedOneTimeProductIds : [],
      pendingRewards: Array.isArray(parsed.pendingRewards) ? parsed.pendingRewards : [],

      kingdomAreas,

      discoveredItemIds: Array.isArray(parsed.discoveredItemIds) ? parsed.discoveredItemIds : defaultState.discoveredItemIds,
      claimedDiscoveryRewardIds: Array.isArray(parsed.claimedDiscoveryRewardIds) ? parsed.claimedDiscoveryRewardIds : [],
      claimedLevelRewardIds: Array.isArray(parsed.claimedLevelRewardIds) ? parsed.claimedLevelRewardIds : [],
      claimedCompendiumMilestoneIds: Array.isArray(parsed.claimedCompendiumMilestoneIds) ? parsed.claimedCompendiumMilestoneIds : [],

      tutorialStep: typeof parsed.tutorialStep === 'number' ? parsed.tutorialStep : 0,
      isTutorialActive: typeof parsed.isTutorialActive === 'boolean' ? parsed.isTutorialActive : true,

      settings: {
        ...defaultState.settings,
        ...(parsed.settings || {}),
      },
      stats: {
        ...defaultState.stats,
        ...(parsed.stats || {}),
      },
      lastSavedAt: now,
      lastSeenAt: now,
    };

    return { state: hydrated, isMigratedFromLegacy, recoveredOfflineEnergy };
  } catch (e) {
    console.error('Save hydration error:', e);
    return { state: createDefaultInitialState(), isMigratedFromLegacy: false };
  }
}
