import { checkMergeValidity, rollBubbleSpawn } from '../logic/mergeLogic';
import { resolveExpiredBubbles, canPurchaseBubble, getBubbleRemainingSeconds } from '../logic/bubbleLogic';
import { validateGeneratorTap, validateGeneratorUpgrade, getGeneratorCooldownRemaining } from '../logic/generatorLogic';
import { getProducibleItemPools, generateSafeRandomOrder, isOrderFulfillable } from '../logic/orderLogic';
import { hydrateAndMigrateSave, createDefaultInitialState, CURRENT_SCHEMA_VERSION } from '../logic/saveMigration';
import { ITEMS } from '../data/items';
import { GENERATORS } from '../data/generators';
import { BoardItem, NPCOrder } from '../types';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

console.log('\n--- 🌟 WISHENBLOOM CORE SYSTEMS HARDENING TEST SUITE ---');

// TEST SUITE 1: Merge Logic & Dusty Tile Resolution
console.log('\n[1] Testing Merge Logic & Dusty Tile Resolution:');
{
  const normalHerb1: BoardItem = { instanceId: '1', itemId: 'herb_1', tileState: 'normal' };
  const dustyHerb1: BoardItem = { instanceId: '2', itemId: 'herb_1', tileState: 'dusty' };
  const lockedHerb1: BoardItem = { instanceId: '3', itemId: 'herb_1', tileState: 'locked' };
  const normalHerb2: BoardItem = { instanceId: '4', itemId: 'herb_2', tileState: 'normal' };

  // Test dusty merge
  const dustyResult = checkMergeValidity(normalHerb1, dustyHerb1);
  assert(dustyResult.canMerge === true, 'Normal item + Dusty item can merge');
  assert(dustyResult.isDustyMerge === true, 'Dusty merge flag is true');
  assert(dustyResult.nextItemId === 'herb_2', 'Merges into herb_2');
  assert((dustyResult.xpReward || 0) > (ITEMS['herb_1'].xpValue || 1), 'Dusty merge awards bonus XP');

  // Test normal merge
  const normalResult = checkMergeValidity(normalHerb1, normalHerb1);
  assert(normalResult.canMerge === true, 'Two normal identical items can merge');
  assert(normalResult.isDustyMerge === false, 'Normal merge is not dusty');
  assert(normalResult.nextItemId === 'herb_2', 'Merges into herb_2');

  // Test locked item
  const lockedResult = checkMergeValidity(normalHerb1, lockedHerb1);
  assert(lockedResult.canMerge === false, 'Locked items cannot be merged');

  // Test different tiers
  const diffResult = checkMergeValidity(normalHerb1, normalHerb2);
  assert(diffResult.canMerge === false, 'Different tier items cannot be merged');
}

// TEST SUITE 2: Timed Bubble System
console.log('\n[2] Testing Timed Bubble System:');
{
  const now = 1000000;
  const activeBubble: BoardItem = {
    instanceId: 'b1',
    itemId: 'herb_3',
    tileState: 'bubble',
    bubbleExpiresAt: now + 30000,
    bubblePrice: 4,
  };
  const expiredBubble: BoardItem = {
    instanceId: 'b2',
    itemId: 'potion_3',
    tileState: 'bubble',
    bubbleExpiresAt: now - 5000,
    bubblePrice: 4,
  };
  const normalItem: BoardItem = {
    instanceId: 'n1',
    itemId: 'herb_1',
    tileState: 'normal',
  };

  assert(getBubbleRemainingSeconds(activeBubble, now) === 30, 'Active bubble calculates remaining seconds correctly (30s)');
  assert(getBubbleRemainingSeconds(expiredBubble, now) === 0, 'Expired bubble returns 0s');

  const testGrid: (BoardItem | null)[][] = [
    [activeBubble, expiredBubble, normalItem],
  ];

  const resolution = resolveExpiredBubbles(testGrid, now);
  assert(resolution.hasChanged === true, 'Resolution reports changes');
  assert(resolution.expiredCount === 1, 'Exactly 1 bubble resolved');
  assert(resolution.grid[0][1]?.itemId === 'coin_item_1', 'Expired bubble converted to coin_item_1');
  assert(resolution.grid[0][1]?.tileState === 'normal', 'Converted item tileState is normal');
  assert(resolution.grid[0][0]?.tileState === 'bubble', 'Active bubble remains untouched');

  // Gem purchase validation
  const buyWithEnough = canPurchaseBubble(activeBubble, 10);
  assert(buyWithEnough.canPurchase === true && buyWithEnough.price === 4, 'Can purchase bubble with sufficient gems (10 >= 4)');

  const buyWithShort = canPurchaseBubble(activeBubble, 2);
  assert(buyWithShort.canPurchase === false, 'Cannot purchase bubble with insufficient gems (2 < 4)');
}

// TEST SUITE 3: Generator Upgrades & Cooldowns
console.log('\n[3] Testing Generator Upgrades & Cooldowns:');
{
  const now = 500000;
  const gardenGenLvl1: BoardItem = {
    instanceId: 'g1',
    itemId: 'herb_1',
    isGenerator: true,
    generatorId: 'gen_garden_1',
    tileState: 'normal',
  };

  const cooldownGarden: BoardItem = {
    instanceId: 'g2',
    itemId: 'herb_1',
    isGenerator: true,
    generatorId: 'gen_garden_1',
    tileState: 'normal',
    cooldownUntil: now + 15000,
  };

  // Cooldown calculation
  assert(getGeneratorCooldownRemaining(cooldownGarden, now) === 15, 'Cooldown generator remaining is 15s');
  assert(getGeneratorCooldownRemaining(gardenGenLvl1, now) === 0, 'Non-cooldown generator remaining is 0s');

  // Generator Tap Validation
  const validTap = validateGeneratorTap(gardenGenLvl1, 50, now);
  assert(validTap.canTap === true, 'Generator can tap with energy');

  const noEnergyTap = validateGeneratorTap(gardenGenLvl1, 0, now);
  assert(noEnergyTap.canTap === false && noEnergyTap.reason === 'insufficient_energy', 'Generator tap blocked when energy is 0');

  const onCooldownTap = validateGeneratorTap(cooldownGarden, 50, now);
  assert(onCooldownTap.canTap === false && onCooldownTap.reason === 'on_cooldown', 'Generator tap blocked when on cooldown');

  // Generator Upgrade Validation
  const upgradeWithCoins = validateGeneratorUpgrade(gardenGenLvl1, 1000);
  assert(upgradeWithCoins.canUpgrade === true, 'Generator can upgrade with 1000 coins');
  assert(upgradeWithCoins.nextDef?.id === 'gen_garden_2', 'Next generator ID is gen_garden_2');

  const upgradePoor = validateGeneratorUpgrade(gardenGenLvl1, 10);
  assert(upgradePoor.canUpgrade === false && upgradePoor.reason === 'insufficient_coins', 'Generator upgrade blocked with insufficient coins');

  // Max Level Generator
  const maxGen: BoardItem = {
    instanceId: 'g_max',
    itemId: 'herb_1',
    isGenerator: true,
    generatorId: 'gen_garden_4',
    tileState: 'normal',
  };
  const upgradeMax = validateGeneratorUpgrade(maxGen, 99999);
  assert(upgradeMax.canUpgrade === false && upgradeMax.isMaxLevel === true, 'Max level generator cannot upgrade further');
}

// TEST SUITE 4: Safe Order Generation
console.log('\n[4] Testing Safe Order Generation:');
{
  const gridWithOnlyGarden: (BoardItem | null)[][] = [
    [
      { instanceId: 'g1', itemId: 'herb_1', isGenerator: true, generatorId: 'gen_garden_1', tileState: 'normal' },
      null,
    ],
  ];

  const pools = getProducibleItemPools(gridWithOnlyGarden, [], 1);
  assert(pools.some(p => p.itemPrefix === 'herb_'), 'Producible pools include herbs when garden is present');
  assert(!pools.some(p => p.itemPrefix === 'forge_'), 'Forge items NOT requested when player lacks forge');

  const order = generateSafeRandomOrder(gridWithOnlyGarden, [], 1, []);
  assert(order.requirements.length > 0, 'Generated order has requirements');
  assert(order.requirements.every(r => r.itemId.startsWith('herb_')), 'All order requirements are herbs for a garden-only player');

  // Order fulfillment check
  const fulfillGrid: (BoardItem | null)[][] = [
    [{ instanceId: 'h1', itemId: 'herb_1', tileState: 'normal' }],
  ];
  const testOrder: NPCOrder = {
    id: 'o_test',
    npcId: 'elowen',
    npcName: 'Elowen',
    npcRole: 'Herbalist',
    npcAvatar: 'elowen',
    npcQuote: 'Need herbs!',
    requirements: [{ itemId: 'herb_1', count: 1 }],
    rewards: { coins: 20, xp: 10 },
  };

  assert(isOrderFulfillable(testOrder, fulfillGrid) === true, 'Order is fulfillable when required items exist in normal tile state');

  const dustyOnlyGrid: (BoardItem | null)[][] = [
    [{ instanceId: 'h1', itemId: 'herb_1', tileState: 'dusty' }],
  ];
  assert(isOrderFulfillable(testOrder, dustyOnlyGrid) === false, 'Order is NOT fulfillable with dusty items alone');
}

// TEST SUITE 5: Save System & Migration
console.log('\n[5] Testing Save System & Migration:');
{
  // 1. Initial State Defaulting
  const fresh = createDefaultInitialState();
  assert(fresh.schemaVersion === CURRENT_SCHEMA_VERSION, 'Default state has current schema version');
  assert(fresh.grid.length === 9 && fresh.grid[0].length === 7, 'Default grid is 9x7');
  assert(fresh.energy === 100 && fresh.coins === 300, 'Initial currency values intact');

  // 2. Legacy Migration
  const legacySave = JSON.stringify({
    level: 4,
    coins: 750,
    gems: 35,
    energy: 50,
    maxEnergy: 100,
    lastEnergyRechargeAt: Date.now() - 240000, // 4 mins ago = +2 energy
  });

  const migrated = hydrateAndMigrateSave(null, legacySave, Date.now());
  assert(migrated.isMigratedFromLegacy === true, 'Successfully detects and migrates legacy save');
  assert(migrated.state.level === 4, 'Preserved level 4 from legacy save');
  assert(migrated.state.coins === 750, 'Preserved coins from legacy save');
  assert(migrated.state.energy === 52, 'Accurately resolved offline energy recharge (50 + 2 = 52)');
  assert(migrated.state.schemaVersion === CURRENT_SCHEMA_VERSION, 'Migrated state assigned current schema version');

  // 3. Corrupt Data Resilience
  const corruptHydration = hydrateAndMigrateSave('INVALID_JSON_STRING{{{', null);
  assert(corruptHydration.state.level === 1, 'Corrupted save gracefully falls back to default state');
}

console.log(`\n========================================`);
console.log(`RESULTS: ${passedTests}/${totalTests} tests passed (${failedTests} failed)`);
console.log(`========================================\n`);

if (failedTests > 0) {
  process.exit(1);
}
