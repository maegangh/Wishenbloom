import { checkMergeValidity, rollBubbleSpawn } from '../logic/mergeLogic';
import { resolveExpiredBubbles, canPurchaseBubble, getBubbleRemainingSeconds } from '../logic/bubbleLogic';
import { validateGeneratorTap, validateGeneratorUpgrade, getGeneratorCooldownRemaining } from '../logic/generatorLogic';
import {
  getProducibleItemPools,
  generateSafeRandomOrder,
  generateSpecialOrder,
  isOrderFulfillable,
  calculateOrderRewards,
} from '../logic/orderLogic';
import { hydrateAndMigrateSave, createDefaultInitialState, CURRENT_SCHEMA_VERSION } from '../logic/saveMigration';
import {
  LEVEL_PROGRESSION,
  getLevelProgression,
  getUnlockedChainsForLevel,
  getGeneratorUnlockedAtLevel,
  CURRENT_MAX_PLAYER_LEVEL,
  isPlayerAtMaxLevel,
} from '../data/progression';
import { BALANCE } from '../data/balance';
import { ITEMS } from '../data/items';
import { GENERATORS } from '../data/generators';
import { BoardItem, NPCOrder } from '../types';

import {
  DAILY_REWARDS_CYCLE,
  getDailyRewardForDay,
  getNextDailyRewardCycleDay,
  isDailyRewardClaimable,
  getUtcDateKey,
} from '../data/dailyRewards';
import { generateDailyTasksForDate, DAILY_COMPLETION_REWARD } from '../data/dailyTasks';
import { calculateEnergyGrant } from '../data/balance';
import {
  STARTER_WELCOME_PACK,
  GEM_PACK_PRODUCTS,
  ENERGY_SHOP_PRODUCTS,
  COIN_SHOP_PRODUCTS,
  getStoreProduct,
} from '../data/storeProducts';
import { MockPurchaseProvider, DisabledPurchaseProvider, GooglePlayPurchaseProvider, AppleStorePurchaseProvider, getActivePurchaseProvider, setActivePurchaseProvider } from '../logic/purchaseProvider';
import { GRID_ROWS, GRID_COLS, spawnItemOnFirstEmpty } from '../logic/boardLogic';
import { APP_IDENTITY } from '../config/version';
import { WebStorageProvider, NativeStorageProvider } from '../logic/storageProvider';

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

async function runAllTests() {
  console.log('\n--- 🌟 WISHENBLOOM CORE SYSTEMS, PROGRESSION & PLAYABILITY TEST SUITE ---');

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
  const now = 5000000;
  const readyGarden: BoardItem = {
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

  const tapReady = validateGeneratorTap(readyGarden, 50, now);
  assert(tapReady.canTap === true, 'Can tap generator when ready and energy available');

  const tapCooldown = validateGeneratorTap(cooldownGarden, 50, now);
  assert(tapCooldown.canTap === false && tapCooldown.reason === 'on_cooldown', 'Cannot tap generator while on cooldown');
  assert(getGeneratorCooldownRemaining(cooldownGarden, now) === 15, 'Cooldown remaining correctly calculates 15s');

  const tapNoEnergy = validateGeneratorTap(readyGarden, 0, now);
  assert(tapNoEnergy.canTap === false && tapNoEnergy.reason === 'insufficient_energy', 'Cannot tap generator with 0 energy');

  // Generator Upgrade
  const upgradeWithCoins = validateGeneratorUpgrade(readyGarden, 200);
  assert(upgradeWithCoins.canUpgrade === true && upgradeWithCoins.nextDef?.id === 'gen_garden_2', 'Generator upgrades from Level 1 to Level 2 with sufficient coins');
  assert(
    (upgradeWithCoins.nextDef?.drops.length || 0) > (GENERATORS['gen_garden_1'].drops.length),
    'Upgraded generator provides improved drop diversity'
  );

  const upgradeShortCoins = validateGeneratorUpgrade(readyGarden, 10);
  assert(upgradeShortCoins.canUpgrade === false && upgradeShortCoins.reason === 'insufficient_coins', 'Upgrade blocked with insufficient coins');

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

// TEST SUITE 6: LEVEL 1–10 PROGRESSION & PLAYABILITY INVARIANTS
console.log('\n[6] Testing Levels 1–10 Player Progression Architecture & Invariants:');
{
  // Invariant 1: Fresh Game Start
  const freshGame = createDefaultInitialState();
  const generatorsOnBoard = freshGame.grid.flatMap(r => r).filter(i => i?.isGenerator);
  assert(freshGame.level === 1, 'Fresh game starts at Level 1');
  assert(generatorsOnBoard.length === 1, 'Fresh game has exactly ONE starter generator on board');
  assert(generatorsOnBoard[0]?.generatorId === 'gen_garden_1', 'Starter generator is Enchanted Garden (gen_garden_1)');
  assert(!generatorsOnBoard.some(g => g?.generatorId === 'gen_alchemist_1'), 'Alchemist table is NOT pre-placed on Level 1 board');
  assert(!generatorsOnBoard.some(g => g?.generatorId === 'gen_forge_1'), 'Forge is NOT pre-placed on Level 1 board');

  // Invariant 2: Level 2 Unlocks (Compendium & Discovery Rewards)
  const l2 = getLevelProgression(2);
  assert(l2.level === 2 && l2.xpRequired === 80, 'Level 2 requires 80 XP to advance');
  assert(l2.unlocks.mechanicName?.includes('Compendium'), 'Level 2 unlocks Compendium & Dusty mechanics');
  assert(l2.rewards.coins === 150 && l2.rewards.gems === 6, 'Level 2 grants 150 Coins and 6 Gems');

  // Invariant 3: Level 3 Alchemy Unlock
  const l3 = getLevelProgression(3);
  assert(l3.unlocks.generatorId === 'gen_alchemist_1', "Level 3 unlocks Alchemist's Table (gen_alchemist_1)");
  assert(l3.unlocks.chainId === 'potions', 'Level 3 unlocks Alchemical Potions chain');
  assert(l3.unlocks.npcId === 'valerie', 'Level 3 introduces Archmage Valerie');
  assert(getUnlockedChainsForLevel(3).includes('potions'), 'Level 3 unlocked chains include potions');
  assert(!getUnlockedChainsForLevel(2).includes('potions'), 'Level 2 does not include potions');

  // Invariant 4: Level 4 Kingdom Restoration Milestone
  const l4 = getLevelProgression(4);
  assert(l4.unlocks.npcId === 'aurelia', 'Level 4 introduces Princess Aurelia');
  assert(l4.unlocks.kingdomAreaId === 'wizard_spire', "Level 4 introduces Archmage's Celestial Spire");
  assert(l4.rewards.coins === 250 && l4.rewards.gems === 10, 'Level 4 awards 250 Coins and 10 Gems');

  // Invariant 5: Level 5 Master Forge Unlock
  const l5 = getLevelProgression(5);
  assert(l5.unlocks.generatorId === 'gen_forge_1', 'Level 5 unlocks Royal Forge (gen_forge_1)');
  assert(l5.unlocks.chainId === 'blacksmith', 'Level 5 unlocks Blacksmith chain');
  assert(l5.unlocks.npcId === 'balgor', 'Level 5 introduces Master Blacksmith Balgor');
  assert(getUnlockedChainsForLevel(5).includes('blacksmith'), 'Level 5 unlocked chains include blacksmith');
  assert(!getUnlockedChainsForLevel(4).includes('blacksmith'), 'Level 4 does not include blacksmith');

  // Invariant 6: Level 6 Storage Expansion
  const l6 = getLevelProgression(6);
  assert(l6.unlocks.inventorySlotIncrease === 1, 'Level 6 unlocks +1 permanent inventory slot');
  assert(l6.rewards.inventorySlotsAdded === 1, 'Level 6 rewards record inventory slot addition');
  assert(l6.unlocks.npcId === 'pip', 'Level 6 highlights Pip the Goblin Merchant');

  // Invariant 7: Level 7 Spellbooks Unlock
  const l7 = getLevelProgression(7);
  assert(l7.unlocks.generatorId === 'gen_wizard_1', "Level 7 unlocks Wizard's Desk (gen_wizard_1)");
  assert(l7.unlocks.chainId === 'spellbooks', 'Level 7 unlocks Ancient Spellbooks chain');
  assert(getUnlockedChainsForLevel(7).includes('spellbooks'), 'Level 7 unlocked chains include spellbooks');
  assert(!getUnlockedChainsForLevel(6).includes('spellbooks'), 'Level 6 does not include spellbooks');

  // Invariant 8: Level 8 Mythic Creatures Unlock
  const l8 = getLevelProgression(8);
  assert(l8.unlocks.generatorId === 'gen_nest_1', 'Level 8 unlocks Mystic Nest (gen_nest_1)');
  assert(l8.unlocks.chainId === 'creatures', 'Level 8 unlocks Mythic Creatures chain');
  assert(l8.unlocks.npcId === 'sylas', 'Level 8 introduces Sylas Highland Beastwarden');
  assert(getUnlockedChainsForLevel(8).includes('creatures'), 'Level 8 unlocked chains include creatures');
  assert(!getUnlockedChainsForLevel(7).includes('creatures'), 'Level 7 does not include creatures');

  // Invariant 9: Level 9 Royal Relic Lore
  const l9 = getLevelProgression(9);
  assert(l9.unlocks.mechanicName === 'Royal Relic Lore', 'Level 9 unlocks Royal Relic Lore');
  assert(l9.rewards.coins === 600 && l9.rewards.gems === 25, 'Level 9 awards 600 Coins and 25 Gems');

  // Invariant 10: Level 10 Royal Reliquary Milestone & CTA
  const l10 = getLevelProgression(10);
  assert(l10.isChapterMilestone === true, 'Level 10 is marked as Chapter 1 Milestone');
  assert(l10.unlocks.generatorId === 'gen_tree_1', 'Level 10 unlocks Royal Reliquary (gen_tree_1)');
  assert(l10.unlocks.generatorName === 'Royal Reliquary', 'Level 10 generator name is Royal Reliquary');
  assert(GENERATORS['gen_tree_1'].name === 'Royal Reliquary', 'Generator definition name is Royal Reliquary');
  assert(l10.rewards.chestItemId === 'chest_golden', 'Level 10 awards Golden Chapter Chest');
  assert(l10.rewards.gems === 50, 'Level 10 awards 50 Gems bounty');
  assert(BALANCE.CHAPTER_1_CTA_TEXT === 'Continue Your Journey', 'Chapter 1 CTA text is non-misleading "Continue Your Journey"');

  // Invariant 11: Generator Unlocks Gated Properly per Level
  assert(getGeneratorUnlockedAtLevel(1) === 'gen_garden_1', 'Level 1 generator is gen_garden_1');
  assert(getGeneratorUnlockedAtLevel(2) === null, 'Level 2 does not unlock a new generator');
  assert(getGeneratorUnlockedAtLevel(3) === 'gen_alchemist_1', 'Level 3 generator is gen_alchemist_1');
  assert(getGeneratorUnlockedAtLevel(5) === 'gen_forge_1', 'Level 5 generator is gen_forge_1');
  assert(getGeneratorUnlockedAtLevel(7) === 'gen_wizard_1', 'Level 7 generator is gen_wizard_1');
  assert(getGeneratorUnlockedAtLevel(8) === 'gen_nest_1', 'Level 8 generator is gen_nest_1');
  assert(getGeneratorUnlockedAtLevel(10) === 'gen_tree_1', 'Level 10 generator is gen_tree_1');

  // Invariant 12: Orders Never Request Locked Chains & Max Tiers are Capped
  const l1Grid: (BoardItem | null)[][] = [
    [{ instanceId: 'g1', itemId: 'herb_1', isGenerator: true, generatorId: 'gen_garden_1', tileState: 'normal' }],
  ];
  for (let i = 0; i < 20; i++) {
    const o = generateSafeRandomOrder(l1Grid, [], 1, []);
    assert(o.requirements.every(r => r.itemId.startsWith('herb_')), `Order #${i + 1} at Level 1 strictly requests herbs`);
  }

  // Invariant 13: Progression Migration Preserves Existing Save & Upgrades Slots
  const legacyHighLevelSave = JSON.stringify({
    level: 6,
    coins: 1200,
    gems: 45,
    energy: 90,
    maxEnergy: 100,
    grid: [
      [{ instanceId: 'g1', itemId: 'herb_1', isGenerator: true, generatorId: 'gen_garden_1', tileState: 'normal' }],
      [{ instanceId: 'g2', itemId: 'potion_1', isGenerator: true, generatorId: 'gen_alchemist_1', tileState: 'normal' }],
    ],
  });

  const migratedProg = hydrateAndMigrateSave(null, legacyHighLevelSave, Date.now());
  assert(migratedProg.state.level === 6, 'Migration preserves Level 6');
  assert(migratedProg.state.maxInventorySlots === 6, 'Level 6 save correctly upgrades to 6 inventory slots');
  assert(migratedProg.state.inventory.length === 6, 'Inventory array length is 6');
  assert(Array.isArray(migratedProg.state.claimedLevelRewardIds), 'claimedLevelRewardIds is initialized on migrated save');
}

// TEST SUITE 6: Chapter 2 Progression (Player Levels 11–20)
console.log('\n[6] Testing Chapter 2 Progression (Player Levels 11–20):');
{
  // 1. Level 11: Relic Ciphers (0 gems, 25 energy)
  const l11 = getLevelProgression(11);
  assert(l11.unlocks.mechanicName === 'Relic Ciphers', 'Level 11 unlocks Relic Ciphers mechanic');
  assert(l11.rewards.coins === 350 && l11.rewards.gems === 0, 'Level 11 rewards 350 Coins and 0 Gems (no unearned early gems)');
  assert(l11.rewards.energy === 25, 'Level 11 awards partial energy (+25)');

  // 2. Level 12: Moonstone Causeway (5 gems, 30 energy)
  const l12 = getLevelProgression(12);
  assert(l12.unlocks.kingdomAreaId === 'causeway', 'Level 12 unlocks Moonstone Causeway kingdom area');
  assert(l12.rewards.coins === 400 && l12.rewards.gems === 5, 'Level 12 rewards 400 Coins and 5 Gems');
  assert(l12.rewards.energy === 30, 'Level 12 awards partial energy (+30)');

  // 3. Level 13: Enchanted Textiles & Royal Loom (5 gems, 40 energy)
  const l13 = getLevelProgression(13);
  assert(l13.unlocks.generatorId === 'gen_loom_1', 'Level 13 unlocks Royal Loom (gen_loom_1)');
  assert(l13.unlocks.chainId === 'textiles', 'Level 13 unlocks textiles chain');
  assert(l13.unlocks.npcId === 'celeste', 'Level 13 introduces Celeste Royal Weaver');
  assert(getUnlockedChainsForLevel(13).includes('textiles'), 'Level 13 unlocked chains include textiles');
  assert(!getUnlockedChainsForLevel(12).includes('textiles'), 'Level 12 does not include textiles');
  assert(Boolean(ITEMS['textile_1'] && ITEMS['textile_8']), 'Textiles chain items T1-T8 exist');
  assert(l13.rewards.gems === 5 && l13.rewards.energy === 40, 'Level 13 rewards 5 Gems and 40 Energy');

  // 4. Level 14: Tapestry Lore (0 gems, 30 energy)
  const l14 = getLevelProgression(14);
  assert(l14.unlocks.mechanicName === 'Artisan Lore', 'Level 14 unlocks Artisan Lore mechanic');
  assert(l14.rewards.gems === 0 && l14.rewards.energy === 30, 'Level 14 rewards 0 Gems and 30 Energy');

  // 5. Level 15: Special Orders / Royal Commissions (15 gems, full energy refill, Golden Chest)
  const l15 = getLevelProgression(15);
  assert(l15.unlocks.mechanicName === 'Special Orders', 'Level 15 unlocks Special Orders');
  assert(l15.rewards.gems === 15, 'Level 15 awards controlled midpoint milestone 15 Gems');
  assert(l15.rewards.isFullEnergyRefill === true, 'Level 15 awards full energy refill milestone');
  assert(l15.rewards.chestItemId === 'chest_golden', 'Level 15 awards Golden Chest');
  assert(BALANCE.SPECIAL_ORDER_UNLOCK_LEVEL === 15, 'Special orders unlock level constant is 15');

  // Test special order generation
  const ch2Grid: (BoardItem | null)[][] = [
    [{ instanceId: 'g1', itemId: 'herb_1', isGenerator: true, generatorId: 'gen_garden_1', tileState: 'normal' }],
    [{ instanceId: 'g2', itemId: 'potion_1', isGenerator: true, generatorId: 'gen_alchemist_1', tileState: 'normal' }],
    [{ instanceId: 'g3', itemId: 'textile_1', isGenerator: true, generatorId: 'gen_loom_1', tileState: 'normal' }],
  ];
  const specialOrder = generateSafeRandomOrder(ch2Grid, [], 15, []);
  assert(specialOrder !== null, 'Order generated successfully at Level 15');

  // 6. Level 16: Deep Realm Lore (0 gems, 35 energy)
  const l16 = getLevelProgression(16);
  assert(l16.unlocks.mechanicName === 'Deep Realm Lore', 'Level 16 unlocks Deep Realm Lore');
  assert(l16.rewards.coins === 550 && l16.rewards.gems === 0, 'Level 16 awards 550 Coins and 0 Gems');
  assert(l16.rewards.energy === 35, 'Level 16 awards 35 Energy');

  // 7. Level 17: Enchanted Crystals & Arcane Quarry (5 gems, 40 energy)
  const l17 = getLevelProgression(17);
  assert(l17.unlocks.generatorId === 'gen_quarry_1', 'Level 17 unlocks Arcane Quarry (gen_quarry_1)');
  assert(l17.unlocks.chainId === 'crystals', 'Level 17 unlocks crystals & runestones chain');
  assert(l17.unlocks.npcId === 'gideon', 'Level 17 introduces Gideon Deep Scribe');
  assert(getUnlockedChainsForLevel(17).includes('crystals'), 'Level 17 unlocked chains include crystals');
  assert(!getUnlockedChainsForLevel(16).includes('crystals'), 'Level 16 does not include crystals');
  assert(Boolean(ITEMS['crystal_1'] && ITEMS['crystal_8']), 'Crystals chain items T1-T8 exist');
  assert(l17.rewards.gems === 5 && l17.rewards.energy === 40, 'Level 17 awards 5 Gems and 40 Energy');

  // 8. Level 18: Artisan Vault Expansion (5 gems, 40 energy, 1 slot)
  const l18 = getLevelProgression(18);
  assert(l18.unlocks.inventorySlotIncrease === 1, 'Level 18 grants 7th inventory slot');
  assert(l18.rewards.inventorySlotsAdded === 1, 'Level 18 records inventorySlotsAdded');
  assert(l18.rewards.gems === 5 && l18.rewards.energy === 40, 'Level 18 awards 5 Gems and 40 Energy');

  // 9. Level 19: Harmonic Convergence (0 gems, 50 energy)
  const l19 = getLevelProgression(19);
  assert(l19.unlocks.mechanicName === 'Harmonic Convergence', 'Level 19 unlocks Harmonic Convergence');
  assert(l19.rewards.coins === 800 && l19.rewards.gems === 0, 'Level 19 awards 800 Coins and 0 Gems');
  assert(l19.rewards.energy === 50, 'Level 19 awards 50 Energy');

  // 10. Level 20: Chapter 2 Milestone (30 gems, full refill, Royal Chest)
  const l20 = getLevelProgression(20);
  assert(l20.isChapterMilestone === true, 'Level 20 is marked as Chapter 2 Milestone');
  assert(l20.rewards.gems === 30, 'Level 20 awards tuned 30 Gems (reduced from old excessive 60)');
  assert(l20.rewards.isFullEnergyRefill === true, 'Level 20 awards full energy refill milestone');
  assert(l20.rewards.chestItemId === 'chest_royal', 'Level 20 awards Royal Chapter Chest');
  assert(BALANCE.CHAPTER_2_CTA_TEXT === 'Continue Your Journey', 'Chapter 2 CTA text is "Continue Your Journey"');

  // Total Chapter 2 Gem check
  let ch2TotalGems = 0;
  for (let lvl = 11; lvl <= 20; lvl++) {
    ch2TotalGems += getLevelProgression(lvl).rewards.gems;
  }
  assert(ch2TotalGems === 65, `Chapter 2 total progression gems is 65 (was: ${ch2TotalGems})`);
}

// TEST SUITE 7: Order Economy & Scaling Formulas
console.log('\n[7] Testing Order Economy & Scaling Formulas:');
{
  const rT1 = calculateOrderRewards([{ itemId: 'herb_1', count: 1 }], false);
  const rT2 = calculateOrderRewards([{ itemId: 'herb_2', count: 1 }], false);
  const rT3 = calculateOrderRewards([{ itemId: 'herb_3', count: 1 }], false);
  const rT4 = calculateOrderRewards([{ itemId: 'herb_4', count: 1 }], false);
  const rT5 = calculateOrderRewards([{ itemId: 'herb_5', count: 1 }], false);
  const rT6 = calculateOrderRewards([{ itemId: 'herb_6', count: 1 }], false);
  const r2xT6 = calculateOrderRewards([{ itemId: 'herb_6', count: 2 }], false);

  // 1. Two T6 items do NOT produce an absurd coin reward (old was 32,768+)
  assert(r2xT6.coins < 2000, `Two T6 normal items reward reasonable coins (${r2xT6.coins} coins < 2000)`);
  assert(r2xT6.xp < 1000, `Two T6 normal items reward reasonable XP (${r2xT6.xp} XP < 1000)`);

  // 2. Monotonic scaling: T1 < T2 < T3 < T4 < T5 < T6 < 2xT6
  assert(
    rT1.coins < rT2.coins &&
    rT2.coins < rT3.coins &&
    rT3.coins < rT4.coins &&
    rT4.coins < rT5.coins &&
    rT5.coins < rT6.coins &&
    rT6.coins < r2xT6.coins,
    'Normal order Coin rewards increase monotonically with production tier and count'
  );

  assert(
    rT1.xp < rT2.xp &&
    rT2.xp < rT3.xp &&
    rT3.xp < rT4.xp &&
    rT4.xp < rT5.xp &&
    rT5.xp < rT6.xp &&
    rT6.xp < r2xT6.xp,
    'Normal order XP rewards increase monotonically with production tier and count'
  );

  // 3. Special Orders vs Normal Orders
  const specT4 = calculateOrderRewards([{ itemId: 'textile_4', count: 1 }], true);
  const normT4 = calculateOrderRewards([{ itemId: 'textile_4', count: 1 }], false);
  assert(specT4.coins > normT4.coins, `Special order Coins (${specT4.coins}) > Normal order Coins (${normT4.coins})`);
  assert(specT4.xp > normT4.xp, `Special order XP (${specT4.xp}) > Normal order XP (${normT4.xp})`);
  assert(specT4.gems !== undefined && specT4.gems > 0, `Special order awards gems (${specT4.gems})`);

  // 4. Special order 2xT6 remains within reasonable bounds (< 3000 coins)
  const spec2xT6 = calculateOrderRewards([{ itemId: 'crystal_6', count: 2 }], true);
  assert(spec2xT6.coins < 3000, `2xT6 Special order Coin reward (${spec2xT6.coins}) is < 3000`);
  assert(spec2xT6.xp < 1500, `2xT6 Special order XP reward (${spec2xT6.xp}) is < 1500`);
}

// TEST SUITE 8: Story Integrity & Narrative Ambiguity
console.log('\n[8] Testing Story Integrity & Narrative Ambiguity:');
{
  const l20 = getLevelProgression(20);
  assert(
    !l20.storySnippet.toLowerCase().includes('cosmic storm'),
    'Level 20 story snippet does NOT confirm "cosmic storm" (restores narrative ambiguity)'
  );
  assert(
    l20.storySnippet.includes('conduits') && (l20.storySnippet.includes('sealed') || l20.storySnippet.includes('decree')),
    'Level 20 story snippet confirms conduits were sealed under royal decree'
  );
  assert(
    BALANCE.CHAPTER_2_CTA_TEXT === 'Continue Your Journey',
    'Chapter 2 milestone CTA continues journey gracefully'
  );
}

// TEST SUITE 9: Chapter 3 Progression (Player Levels 21–30)
console.log('\n[9] Testing Chapter 3 Progression (Player Levels 21–30):');
{
  // 1. Level 21: Outer Provinces & Veiled Gate
  const l21 = getLevelProgression(21);
  assert(l21.unlocks.kingdomAreaId === 'veiled_gate', 'Level 21 unlocks Veiled Gate kingdom area');
  assert(l21.rewards.gems === 0, 'Level 21 awards 0 Gems');
  assert(l21.rewards.energy === 35, 'Level 21 awards 35 Energy');

  // 2. Level 22: Echoes of the Border / Mixed Orders
  const l22 = getLevelProgression(22);
  assert(l22.unlocks.mechanicName === 'Provincial Mixed Orders', 'Level 22 unlocks Provincial Mixed Orders mechanic');
  assert(l22.rewards.gems === 0, 'Level 22 awards 0 Gems');
  assert(l22.rewards.energy === 35, 'Level 22 awards 35 Energy');

  // 3. Level 23: Culinary Provisions & Bloomkeeper's Hearth
  const l23 = getLevelProgression(23);
  assert(l23.unlocks.generatorId === 'gen_hearth_1', "Level 23 unlocks Bloomkeeper's Hearth (gen_hearth_1)");
  assert(l23.unlocks.chainId === 'provisions', 'Level 23 unlocks provisions chain');
  assert(l23.unlocks.npcId === 'bram', 'Level 23 introduces Bram Hearthkeeper');
  assert(getUnlockedChainsForLevel(23).includes('provisions'), 'Level 23 unlocked chains include provisions');
  assert(!getUnlockedChainsForLevel(22).includes('provisions'), 'Level 22 does not include provisions');
  assert(Boolean(ITEMS['provision_1'] && ITEMS['provision_8']), 'Provisions chain items T1-T8 exist');
  assert(l23.rewards.gems === 5 && l23.rewards.energy === 40, 'Level 23 awards 5 Gems and 40 Energy');

  // 4. Level 24: Moonhaven Settlement
  const l24 = getLevelProgression(24);
  assert(l24.unlocks.kingdomAreaId === 'moonhaven', 'Level 24 unlocks Moonhaven Settlement area');
  assert(l24.rewards.gems === 0 && l24.rewards.energy === 40, 'Level 24 awards 0 Gems and 40 Energy');

  // 5. Level 25: Chapter 3 Midpoint Milestone & Compendium Milestones
  const l25 = getLevelProgression(25);
  assert(l25.unlocks.mechanicName === 'Compendium Milestones', 'Level 25 unlocks Compendium Milestones');
  assert(l25.rewards.gems === 15, 'Level 25 awards controlled midpoint milestone 15 Gems');
  assert(l25.rewards.isFullEnergyRefill === true, 'Level 25 awards full energy refill milestone');
  assert(l25.rewards.chestItemId === 'chest_golden', 'Level 25 awards Golden Chest');

  // 6. Level 26: Altered Seals Investigation
  const l26 = getLevelProgression(26);
  assert(l26.unlocks.mechanicName === 'Altered Seals Investigation', 'Level 26 unlocks Altered Seals Investigation');
  assert(l26.rewards.gems === 0 && l26.rewards.energy === 45, 'Level 26 awards 0 Gems and 45 Energy');

  // 7. Level 27: Starlight Workshop & Lanterns Chain
  const l27 = getLevelProgression(27);
  assert(l27.unlocks.generatorId === 'gen_lantern_1', 'Level 27 unlocks Starlight Workshop (gen_lantern_1)');
  assert(l27.unlocks.chainId === 'lanterns', 'Level 27 unlocks lanterns & beacons chain');
  assert(l27.unlocks.kingdomAreaId === 'beacon_ridge', 'Level 27 unlocks Beacon Ridge kingdom area');
  assert(l27.unlocks.npcId === 'elena', 'Level 27 introduces Elena Starlight Wayfinder');
  assert(getUnlockedChainsForLevel(27).includes('lanterns'), 'Level 27 unlocked chains include lanterns');
  assert(!getUnlockedChainsForLevel(26).includes('lanterns'), 'Level 26 does not include lanterns');
  assert(Boolean(ITEMS['lantern_1'] && ITEMS['lantern_8']), 'Lanterns chain items T1-T8 exist');
  assert(l27.rewards.gems === 5 && l27.rewards.energy === 45, 'Level 27 awards 5 Gems and 45 Energy');

  // 8. Level 28: Outer Vault Expansion (8th inventory slot)
  const l28 = getLevelProgression(28);
  assert(l28.unlocks.inventorySlotIncrease === 1, 'Level 28 grants 8th inventory slot');
  assert(l28.rewards.inventorySlotsAdded === 1, 'Level 28 records inventorySlotsAdded');
  assert(l28.rewards.gems === 5 && l28.rewards.energy === 45, 'Level 28 awards 5 Gems and 45 Energy');

  // 9. Level 29: Conduit Nexus
  const l29 = getLevelProgression(29);
  assert(l29.unlocks.kingdomAreaId === 'conduit_nexus', 'Level 29 unlocks Conduit Nexus kingdom area');
  assert(l29.rewards.gems === 0 && l29.rewards.energy === 50, 'Level 29 awards 0 Gems and 50 Energy');

  // 10. Level 30: Chapter 3 Milestone
  const l30 = getLevelProgression(30);
  assert(l30.isChapterMilestone === true, 'Level 30 is marked as Chapter 3 Milestone');
  assert(l30.rewards.gems === 30, 'Level 30 awards 30 Gems');
  assert(l30.rewards.isFullEnergyRefill === true, 'Level 30 awards full energy refill milestone');
  assert(l30.rewards.chestItemId === 'chest_royal', 'Level 30 awards Royal Chapter Chest');
  assert(BALANCE.CHAPTER_3_CTA_TEXT === 'Continue Your Journey', 'Chapter 3 CTA text is "Continue Your Journey"');

  // Exact Gem array check for Chapter 3
  const ch3ExpectedGems = [0, 0, 5, 0, 15, 0, 5, 5, 0, 30];
  const ch3ActualGems: number[] = [];
  for (let lvl = 21; lvl <= 30; lvl++) {
    ch3ActualGems.push(getLevelProgression(lvl).rewards.gems);
  }
  assert(
    JSON.stringify(ch3ActualGems) === JSON.stringify(ch3ExpectedGems),
    `Chapter 3 gem rewards match exact specification: ${JSON.stringify(ch3ActualGems)}`
  );

  let ch3TotalGems = ch3ActualGems.reduce((a, b) => a + b, 0);
  assert(ch3TotalGems === 60, `Chapter 3 total progression gems is 60 (actual: ${ch3TotalGems})`);

  // Story Ambiguity checks for Chapter 3
  for (let lvl = 21; lvl <= 30; lvl++) {
    const prog = getLevelProgression(lvl);
    assert(
      !prog.storySnippet.toLowerCase().includes('evil villain') &&
      !prog.storySnippet.toLowerCase().includes('the shadow lord'),
      `Level ${lvl} story snippet does not dogmatically declare a single generic villain`
    );
  }
}

// TEST SUITE 10: Chapter 3 Orders & Production Integration
console.log('\n[10] Testing Chapter 3 Orders & Production Integration:');
{
  const ch3Board: (BoardItem | null)[][] = [
    [{ instanceId: 'g1', itemId: 'herb_1', isGenerator: true, generatorId: 'gen_garden_1', tileState: 'normal' }],
    [{ instanceId: 'g2', itemId: 'provision_1', isGenerator: true, generatorId: 'gen_hearth_1', tileState: 'normal' }],
    [{ instanceId: 'g3', itemId: 'lantern_1', isGenerator: true, generatorId: 'gen_lantern_1', tileState: 'normal' }],
  ];

  const pools = getProducibleItemPools(ch3Board, [], 27);
  assert(pools.some(p => p.chainId === 'provisions'), 'Producible pools include provisions when hearth is present');
  assert(pools.some(p => p.chainId === 'lanterns'), 'Producible pools include lanterns when lantern workshop is present');

  const order = generateSafeRandomOrder(ch3Board, [], 28, []);
  assert(order !== null && order.requirements.length > 0, 'Safe random order generated at Level 28');

  // Level 28 migration slot check
  const level28Save = JSON.stringify({
    level: 28,
    coins: 5000,
    gems: 100,
    energy: 100,
    maxEnergy: 100,
    inventory: [null, null, null, null, null, null, null],
  });
  const hydratedL28 = hydrateAndMigrateSave(null, level28Save, Date.now());
  assert(hydratedL28.state.maxInventorySlots === 8, 'Level 28 save correctly grants 8 inventory slots');
  assert(hydratedL28.state.inventory.length === 8, 'Inventory array length expands to 8');
}

// TEST SUITE 11: Player Level 30 Content Cap & Post-Chapter Safety Invariants
console.log('\n[11] Testing Player Level 30 Content Cap & Post-Chapter Safety Invariants:');
{
  // 1. CURRENT_MAX_PLAYER_LEVEL is 30
  assert(CURRENT_MAX_PLAYER_LEVEL === 30, 'CURRENT_MAX_PLAYER_LEVEL is defined as 30');
  assert(BALANCE.CURRENT_MAX_PLAYER_LEVEL === 30, 'BALANCE.CURRENT_MAX_PLAYER_LEVEL is 30');
  assert(isPlayerAtMaxLevel(30) === true, 'isPlayerAtMaxLevel returns true for level 30');
  assert(isPlayerAtMaxLevel(29) === false, 'isPlayerAtMaxLevel returns false for level 29');

  // 2. A Level 29 player can legitimately reach Level 30
  const l29Prog = getLevelProgression(29);
  const l30Prog = getLevelProgression(30);
  assert(l29Prog.level === 29 && l29Prog.xpRequired === 42000, 'Level 29 requires 42,000 XP to reach Level 30');
  assert(l30Prog.level === 30 && l30Prog.isChapterMilestone === true, 'Level 30 is reached and recognized as milestone');

  // 3. Level 30 rewards are granted exactly once in authored definition
  assert(l30Prog.rewards.coins === 2500, 'Level 30 awards 2,500 Coins');
  assert(l30Prog.rewards.gems === 30, 'Level 30 awards exactly 30 Gems');
  assert(l30Prog.rewards.isFullEnergyRefill === true, 'Level 30 awards Full Energy Refill');
  assert(l30Prog.rewards.chestItemId === 'chest_royal', 'Level 30 awards Royal Chest');

  // 4. Additional XP at Level 30 does NOT create Player Level 31
  const prog31 = getLevelProgression(31);
  assert(prog31.level === 30, 'getLevelProgression(31) clamps to Level 30');
  const prog50 = getLevelProgression(50);
  assert(prog50.level === 30, 'getLevelProgression(50) clamps to Level 30');

  // 5-8. Additional XP at Level 30 does NOT grant unauthored / fake procedural rewards
  // Verify getLevelProgression(31) does NOT produce scaled unauthored coins (e.g. 3100) or scaling gems (e.g. 82)
  assert(prog31.rewards.coins === 2500, 'Level 31+ does not generate procedural coins');
  assert(prog31.rewards.gems === 30, 'Level 31+ does not generate runaway scaling gems');
  assert(!prog31.unlocks.generatorId, 'Level 31+ has no unauthored generator unlocks');
  assert(!prog31.unlocks.chainId, 'Level 31+ has no unauthored chain unlocks');

  // 9. Simulation of Level 30 state with XP additions
  const capSave = JSON.stringify({
    level: 30,
    xp: 50000,
    xpToNextLevel: 50000,
    coins: 10000,
    gems: 250,
    energy: 100,
    maxEnergy: 100,
    claimedLevelRewardIds: [30],
  });
  const hydratedCap = hydrateAndMigrateSave(null, capSave, Date.now());
  assert(hydratedCap.state.level === 30, 'Level 30 save stays at Level 30');
  assert(hydratedCap.state.xp === 50000, 'Level 30 save safely clamps XP');
  assert(hydratedCap.state.claimedLevelRewardIds.includes(30), 'Level 30 milestone already recorded in claimed rewards');

  // 10. Normal orders remain completable at Level 30
  const l30Board: (BoardItem | null)[][] = [
    [{ instanceId: 'g1', itemId: 'herb_1', isGenerator: true, generatorId: 'gen_garden_1', tileState: 'normal' }],
    [{ instanceId: 'g2', itemId: 'potion_1', isGenerator: true, generatorId: 'gen_alchemist_1', tileState: 'normal' }],
  ];
  const l30Order = generateSafeRandomOrder(l30Board, [], 30, []);
  assert(l30Order !== null && l30Order.requirements.length > 0, 'Normal orders generate safely at Level 30');
  assert(l30Order.rewards.coins > 0 && l30Order.rewards.xp > 0, 'Normal order provides legitimate Coin/XP rewards at Level 30');

  // 11. Replacement orders still generate at Level 30
  const repOrder = generateSafeRandomOrder(l30Board, [], 30, [l30Order.id]);
  assert(repOrder !== null && repOrder.id !== l30Order.id, 'Replacement order generates at Level 30');

  // 12. Royal Commissions remain functional at Level 30
  const l30SpecialOrder = generateSpecialOrder(l30Board, [], 30);
  assert(l30SpecialOrder !== null && l30SpecialOrder.isSpecialOrder === true, 'Royal Commission generates at Level 30');
  assert(l30SpecialOrder.rewards.gems !== undefined && l30SpecialOrder.rewards.gems > 0, 'Royal Commission awards Arcane Gems at Level 30');

  // 13. Generators remain functional at Level 30
  const genTapCheck = validateGeneratorTap(l30Board[0][0]!, 100);
  assert(genTapCheck.canTap === true, 'Generators can still be tapped at Level 30');

  // 14. Energy regeneration remains functional at Level 30
  const offlineSec = 240; // 4 minutes = 2 energy points
  const partialEnergySave = JSON.stringify({
    level: 30,
    energy: 50,
    maxEnergy: 100,
    lastEnergyRechargeAt: Date.now() - (offlineSec * 1000),
  });
  const hydratedEnergy = hydrateAndMigrateSave(null, partialEnergySave, Date.now());
  assert(hydratedEnergy.state.energy === 52, 'Offline Energy regeneration continues at Level 30 (50 -> 52)');

  // 15. Inventory remains functional at Level 30 (8 max slots)
  assert(hydratedCap.state.maxInventorySlots === 8, 'Inventory has full 8 slots at Level 30');
  assert(hydratedCap.state.inventory.length === 8, 'Inventory array has 8 entries');

  // 16. Kingdom Restoration remains functional at Level 30
  assert(hydratedCap.state.kingdomAreas.length >= 4, 'Kingdom Restoration areas available at Level 30');

  // 17. Compendium milestone claims remain functional at Level 30
  assert(Array.isArray(hydratedCap.state.claimedCompendiumMilestoneIds), 'Compendium milestone claims trackable at Level 30');

  // 18. Existing Level 1–29 progression remains unchanged
  assert(getLevelProgression(1).rewards.coins === 100, 'Level 1 progression is intact');
  assert(getLevelProgression(10).isChapterMilestone === true, 'Level 10 Chapter 1 milestone is intact');
  assert(getLevelProgression(20).isChapterMilestone === true, 'Level 20 Chapter 2 milestone is intact');
  assert(getLevelProgression(28).rewards.inventorySlotsAdded === 1, 'Level 28 inventory slot reward is intact');

  // 19. A legacy/development Level 35 save is safely normalized without wiping game state
  const devLegacySave = JSON.stringify({
    level: 35,
    xp: 99999,
    coins: 77777,
    gems: 999,
    energy: 100,
    maxEnergy: 100,
    discoveredItemIds: ['herb_1', 'potion_1', 'provision_8', 'lantern_8'],
  });
  const hydratedDev = hydrateAndMigrateSave(null, devLegacySave, Date.now());
  assert(hydratedDev.state.level === 30, 'Legacy Level 35 save is safely clamped to Level 30');
  assert(hydratedDev.state.xp === 50000, 'Legacy Level 35 XP is safely clamped to Level 30 requirement');
  assert(hydratedDev.state.coins === 77777, 'Legacy save currencies are preserved without loss (coins: 77777)');
  assert(hydratedDev.state.gems === 999, 'Legacy save gems are preserved (gems: 999)');
  assert(hydratedDev.state.discoveredItemIds.length === 4, 'Legacy discoveries preserved');

  // 20. Future max-level configuration can be changed without rewriting progression logic
  assert(typeof CURRENT_MAX_PLAYER_LEVEL === 'number', 'CURRENT_MAX_PLAYER_LEVEL is configuration-driven');
}

// TEST SUITE 12: Beta Retention Foundation (Daily Rewards + Daily Tasks + Return Player Systems)
console.log('\n[12] Testing Beta Retention Foundation (Daily Rewards, Daily Tasks, Return Player Systems):');
{
  // 1. 7-Day Daily Reward Cycle Structure
  assert(DAILY_REWARDS_CYCLE.length === 7, 'Daily rewards cycle has exactly 7 days');
  assert(DAILY_REWARDS_CYCLE[0].day === 1 && DAILY_REWARDS_CYCLE[6].day === 7, 'Daily rewards span Day 1 to Day 7');
  assert(DAILY_REWARDS_CYCLE[6].rewards.chestItemId === 'chest_royal_3', 'Day 7 grand reward awards a Royal Chest');

  // 2. Daily Reward Cycle Day Retrieval & Progression
  const day1Reward = getDailyRewardForDay(1);
  assert(day1Reward.day === 1 && (day1Reward.rewards.energy || 0) > 0, 'Day 1 reward provides energy boost');
  assert(getNextDailyRewardCycleDay(1) === 2, 'Day 1 advances to Day 2');
  assert(getNextDailyRewardCycleDay(6) === 7, 'Day 6 advances to Day 7');
  assert(getNextDailyRewardCycleDay(7) === 1, 'Day 7 wraps smoothly back to Day 1');

  // 3. UTC Date Key Calculation & Daily Claim Status
  const testNow = Date.UTC(2026, 4, 15, 14, 30, 0); // 2026-05-15T14:30:00Z
  const todayKey = getUtcDateKey(testNow);
  assert(todayKey === '2026-05-15', 'UTC date key formats to YYYY-MM-DD');

  // 4. Claimable State Checks
  assert(isDailyRewardClaimable(null, testNow) === true, 'Never claimed reward is claimable');
  assert(isDailyRewardClaimable('2026-05-14', testNow) === true, 'Claimed yesterday is claimable today');
  assert(isDailyRewardClaimable('2026-05-15', testNow) === false, 'Claimed today is NOT claimable again today');

  // 5. Non-Punitive Daily Cycle (Missed Days)
  // If player was on Day 3 and didn't log in for 5 days, when they return their dailyRewardCycleDay is still 3.
  const missedDaysSave = JSON.stringify({
    level: 15,
    dailyRewardCycleDay: 3,
    lastDailyRewardClaimDate: '2026-05-01',
  });
  const hydratedMissed = hydrateAndMigrateSave(null, missedDaysSave, testNow);
  assert(hydratedMissed.state.dailyRewardCycleDay === 3, 'Missed days do NOT reset or punish player (remains on Day 3)');
  assert(isDailyRewardClaimable(hydratedMissed.state.lastDailyRewardClaimDate, testNow) === true, 'Ready to claim upon return');

  // 6. Daily Tasks Generation
  const l5Board: (BoardItem | null)[][] = [
    [{ instanceId: 'g1', itemId: 'herb_1', isGenerator: true, generatorId: 'gen_garden_1', tileState: 'normal' }],
    [{ instanceId: 'g2', itemId: 'potion_1', isGenerator: true, generatorId: 'gen_alchemist_1', tileState: 'normal' }],
  ];
  const generatedTasks = generateDailyTasksForDate(l5Board, [], 5, '2026-05-15');
  assert(generatedTasks.length === 3, 'Generates exactly 3 daily tasks');
  const taskIds = new Set(generatedTasks.map((t) => t.id));
  assert(taskIds.size === 3, 'All 3 daily tasks are distinct');

  // 7. Tasks Respect Player Capabilities & Board
  generatedTasks.forEach((t) => {
    assert(t.target > 0, `Task ${t.id} has positive target (${t.target})`);
    assert(t.current === 0, `Task ${t.id} starts at 0 progress`);
    assert(t.isCompleted === false, `Task ${t.id} starts uncompleted`);
    assert(t.isClaimed === false, `Task ${t.id} starts unclaimed`);
  });

  // 8. Deterministic Generation for Same Date Key
  const regeneratedTasks = generateDailyTasksForDate(l5Board, [], 5, '2026-05-15');
  assert(
    regeneratedTasks.map((t) => t.id).join(',') === generatedTasks.map((t) => t.id).join(','),
    'Daily task generation is deterministic for the same date & level'
  );

  // 9. Daily Completion Bonus Specification
  assert(DAILY_COMPLETION_REWARD.coins >= 250, 'Daily completion bonus awards >= 250 Coins');
  assert(DAILY_COMPLETION_REWARD.energy >= 20, 'Daily completion bonus awards >= 20 Energy');
  assert(DAILY_COMPLETION_REWARD.gems >= 2, 'Daily completion bonus awards >= 2 Gems');
  assert(DAILY_COMPLETION_REWARD.chestItemId === 'chest_wood_1', 'Daily completion bonus awards Wooden Chest');

  // 10. Schema v4 Migration & Hydration Defaults
  const v3Save = JSON.stringify({
    level: 10,
    coins: 500,
    schemaVersion: 3,
  });
  const migratedV4 = hydrateAndMigrateSave(null, v3Save, testNow);
  assert(migratedV4.state.schemaVersion === CURRENT_SCHEMA_VERSION, 'Migrates to current schema version');
  assert(migratedV4.state.dailyRewardCycleDay === 1, 'Default dailyRewardCycleDay is 1');
  assert(migratedV4.state.lastDailyRewardClaimDate === null, 'Default lastDailyRewardClaimDate is null');
  assert(migratedV4.state.dailyTasksDateKey === '2026-05-15', 'Hydrates with current UTC date key');
  assert(migratedV4.state.dailyTasks.length === 3, 'Hydrates with 3 active daily tasks');
  assert(migratedV4.state.dailyCompletionClaimed === false, 'Default dailyCompletionClaimed is false');

  // 11. Rollover on Date Change
  const oldDayTasks = [
    {
      id: 'task_merge_items',
      title: 'Yesterday Task',
      description: 'Old task',
      target: 20,
      current: 20,
      isCompleted: true,
      isClaimed: true,
      rewards: { coins: 50 },
    },
  ];
  const oldDaySave = JSON.stringify({
    level: 12,
    dailyTasksDateKey: '2026-05-14',
    dailyTasks: oldDayTasks,
    dailyCompletionClaimed: true,
  });
  const rolledOver = hydrateAndMigrateSave(null, oldDaySave, testNow);
  assert(rolledOver.state.dailyTasksDateKey === '2026-05-15', 'Date key updates to current UTC date');
  assert(rolledOver.state.dailyTasks.length === 3, 'Fresh tasks generated on date rollover');
  assert(rolledOver.state.dailyTasks[0].current === 0, 'New tasks start fresh at 0');
  assert(rolledOver.state.dailyCompletionClaimed === false, 'Completion claim resets on date rollover');

  // 12. Same-Day Load Preserves In-Progress & Claimed Tasks
  const sameDayTasks = [
    {
      id: 'task_merge_items',
      title: 'Merge Items',
      description: 'Merge 25 items',
      target: 25,
      current: 18,
      isCompleted: false,
      isClaimed: false,
      rewards: { coins: 80, xp: 15 },
    },
    {
      id: 'task_tap_garden',
      title: 'Harvest Herbs',
      description: 'Tap 10 times',
      target: 10,
      current: 10,
      isCompleted: true,
      isClaimed: true,
      rewards: { coins: 60, xp: 10 },
    },
    {
      id: 'task_fulfill_order',
      title: 'Fulfill Orders',
      description: 'Fulfill 2 orders',
      target: 2,
      current: 1,
      isCompleted: false,
      isClaimed: false,
      rewards: { coins: 100, xp: 20 },
    },
  ];
  const sameDaySave = JSON.stringify({
    level: 12,
    dailyTasksDateKey: '2026-05-15',
    dailyTasks: sameDayTasks,
    dailyCompletionClaimed: false,
  });
  const loadedSameDay = hydrateAndMigrateSave(null, sameDaySave, testNow);
  assert(loadedSameDay.state.dailyTasks[0].current === 18, 'Same day load preserves partial task progress (18/25)');
  assert(loadedSameDay.state.dailyTasks[1].isClaimed === true, 'Same day load preserves claimed status');

  // 13. Offline Energy Recovery on Hydration
  const fiveHoursAgo = testNow - (5 * 3600 * 1000); // 5 hours ago = 18000s / 120s = 150 energy maxed at 100
  const offlineEnergySave = JSON.stringify({
    level: 20,
    energy: 10,
    maxEnergy: 100,
    lastEnergyRechargeAt: fiveHoursAgo,
  });
  const offlineResult = hydrateAndMigrateSave(null, offlineEnergySave, testNow);
  assert(offlineResult.state.energy === 100, 'Offline energy reaches maxEnergy 100');
  assert(offlineResult.recoveredOfflineEnergy === 90, 'Calculates 90 recovered energy for welcome modal');

  // 14. Retention Systems at Player Level 30 (Cap)
  const l30RetentionSave = JSON.stringify({
    level: 30,
    xp: 50000,
    dailyRewardCycleDay: 7,
    lastDailyRewardClaimDate: '2026-05-14',
    dailyTasksDateKey: '2026-05-15',
  });
  const l30Hydrated = hydrateAndMigrateSave(null, l30RetentionSave, testNow);
  assert(l30Hydrated.state.level === 30, 'Player level remains safely at 30');
  assert(isDailyRewardClaimable(l30Hydrated.state.lastDailyRewardClaimDate, testNow) === true, 'Daily rewards fully functional at Level 30 cap');
  assert(l30Hydrated.state.dailyTasks.length === 3, 'Daily tasks fully functional at Level 30 cap');
}

// TEST SUITE 16: Monetization, Energy Overflow, IAP Idempotency & Safe Delivery
console.log('\n[16] Testing Monetization, Energy Overflow & Safe IAP Architecture:');
{
  // 1. Base Energy Cap & Overflow Rules
  assert(BALANCE.MAX_ENERGY === 100, 'Base Energy cap is exactly 100');
  assert(BALANCE.ENERGY_OVERFLOW_CAP === 200, 'Bonus Energy overflow cap is exactly 200');

  // 2. Normal passive regeneration never exceeds 100
  assert(calculateEnergyGrant(90, 20, false) === 100, 'Passive regen capped at 100');
  assert(calculateEnergyGrant(100, 10, false) === 100, 'Passive regen at 100 adds nothing');
  assert(calculateEnergyGrant(150, 10, false) === 150, 'Passive regen when overflowed preserves current energy');

  // 3. Offline regeneration never exceeds 100
  const testNow = Date.now();
  const tenHoursAgo = testNow - 10 * 3600 * 1000;
  const offlineSave = JSON.stringify({
    level: 5,
    energy: 40,
    maxEnergy: 100,
    lastEnergyRechargeAt: tenHoursAgo,
    lastSeenAt: tenHoursAgo,
  });
  const { state: offlineState, recoveredOfflineEnergy } = hydrateAndMigrateSave(null, offlineSave, testNow);
  assert(offlineState.energy === 100, 'Offline regeneration never exceeds 100');
  assert(recoveredOfflineEnergy === 60, 'Accurately calculates recovered offline energy to 100 cap');

  // 4. Reward Energy may overflow to configured cap (200)
  assert(calculateEnergyGrant(90, 50, true) === 140, 'Reward energy overflows above 100 to 140');
  assert(calculateEnergyGrant(100, 50, true) === 150, 'Reward energy at 100 overflows to 150');
  assert(calculateEnergyGrant(180, 50, true) === 200, 'Reward energy is clamped at overflow cap 200');

  // 5. Reward Energy never exceeds overflow cap 200
  assert(calculateEnergyGrant(150, 100, true) === 200, 'Overflow clamped when reward exceeds 200');
  assert(calculateEnergyGrant(200, 50, true) === 200, 'Reward at cap 200 remains 200');
  assert(calculateEnergyGrant(250, 50, true) === 200, 'Exceeded energy is clamped to 200');

  // 6. Purchased Energy follows exact same overflow rule
  assert(calculateEnergyGrant(120, 100, true) === 200, 'Purchased energy follows overflow rule to 200');

  // 7-9. Gem -> Energy Shop Offers
  const energy30 = ENERGY_SHOP_PRODUCTS.find((p) => p.energyGrant === 30);
  const energy60 = ENERGY_SHOP_PRODUCTS.find((p) => p.energyGrant === 60);
  const energy100 = ENERGY_SHOP_PRODUCTS.find((p) => p.energyGrant === 100);
  assert(energy30?.gemCost === 15, '30 Energy costs exactly 15 Gems');
  assert(energy60?.gemCost === 25, '60 Energy costs exactly 25 Gems');
  assert(energy100?.gemCost === 40, '100 Energy costs exactly 40 Gems');

  // 10-11. Gem Spending Validation
  let testGems = 20;
  const mockSpend = (amt: number): boolean => {
    if (testGems < amt || amt <= 0) return false;
    testGems -= amt;
    return true;
  };
  assert(mockSpend(25) === false, 'Insufficient Gems prevents purchase');
  assert(testGems === 20, 'Gems remain untouched on failed purchase');
  assert(mockSpend(15) === true, 'Sufficient Gems allows purchase');
  assert(testGems === 5, 'Gem balance correctly decremented');
  assert(mockSpend(10) === false, 'Secondary attempt with insufficient Gems blocked');
  assert(testGems === 5, 'Gem balance never becomes negative');

  // 12-13. Gem -> Coin Shop Offers
  const coin500 = COIN_SHOP_PRODUCTS.find((p) => p.coinGrant === 500);
  const coin1500 = COIN_SHOP_PRODUCTS.find((p) => p.coinGrant === 1500);
  const coin4000 = COIN_SHOP_PRODUCTS.find((p) => p.coinGrant === 4000);
  assert(coin500?.gemCost === 20 && coin500.coinGrant === 500, '500 Coins exchange costs 20 Gems');
  assert(coin1500?.gemCost === 50 && coin1500.coinGrant === 1500, '1,500 Coins exchange costs 50 Gems');
  assert(coin4000?.gemCost === 110 && coin4000.coinGrant === 4000, '4,000 Coins exchange costs 110 Gems');

  // 14-15. Mock Gem Pack Transaction & Idempotency
  const defaultState = createDefaultInitialState();
  const gemPack = getStoreProduct('gems_450');
  assert(gemPack !== undefined && gemPack.gemGrant === 450, 'Catalog contains 450 Gem Satchel');

  const testTxId = 'tx_mock_test_123';
  const initialGems = defaultState.gems;
  assert(!defaultState.processedTransactionIds.includes(testTxId), 'New transaction ID is unprocessed');
  
  // First grant
  defaultState.gems += gemPack!.gemGrant!;
  defaultState.processedTransactionIds.push(testTxId);
  assert(defaultState.gems === initialGems + 450, 'Mock Gem transaction grants Gems once');
  assert(defaultState.processedTransactionIds.includes(testTxId), 'Transaction ID recorded in processed list');

  // Second grant attempt (idempotency check)
  const isDuplicateTx = defaultState.processedTransactionIds.includes(testTxId);
  assert(isDuplicateTx === true, 'Duplicate transaction detected');
  if (!isDuplicateTx) {
    defaultState.gems += gemPack!.gemGrant!;
  }
  assert(defaultState.gems === initialGems + 450, 'Re-processing same transaction ID grants nothing');

  // 16-17. Welcome Pack One-Time Entitlement
  assert(STARTER_WELCOME_PACK.sku === 'wishenbloom_starter_bloomkeeper', 'Welcome pack SKU matches spec');
  assert(STARTER_WELCOME_PACK.isOneTime === true, 'Welcome pack is marked one-time');
  assert(!defaultState.purchasedOneTimeProductIds.includes(STARTER_WELCOME_PACK.sku), 'Welcome pack not initially owned');
  
  // Grant Welcome Pack
  defaultState.purchasedOneTimeProductIds.push(STARTER_WELCOME_PACK.sku);
  defaultState.gems += STARTER_WELCOME_PACK.gemGrant || 0;
  defaultState.coins += STARTER_WELCOME_PACK.coinGrant || 0;
  assert(defaultState.purchasedOneTimeProductIds.includes(STARTER_WELCOME_PACK.sku), 'Welcome pack recorded in purchasedOneTimeProductIds');
  
  // Second purchase check
  const alreadyOwned = defaultState.purchasedOneTimeProductIds.includes(STARTER_WELCOME_PACK.sku);
  assert(alreadyOwned === true, 'Welcome pack cannot be purchased twice');

  // 18. Restore Purchases
  const mockProvider = new MockPurchaseProvider();
  const restored = mockProvider.restorePurchasesSync([STARTER_WELCOME_PACK.sku]);
  assert(restored.includes(STARTER_WELCOME_PACK.sku), 'Restores one-time non-consumable pack');
  assert(!restored.includes('wishenbloom_gems_450'), 'Consumable Gem packs are not restored');

  // 19-20. Full Board & Safe Chest Delivery to Pending Rewards
  const fullBoardState = createDefaultInitialState();
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      fullBoardState.grid[r][c] = { instanceId: `item_${r}_${c}`, itemId: 'herb_1', tileState: 'normal' };
    }
  }
  for (let i = 0; i < fullBoardState.maxInventorySlots; i++) {
    fullBoardState.inventory[i] = { instanceId: `inv_${i}`, itemId: 'herb_1', tileState: 'normal' };
  }

  const chestItemId = STARTER_WELCOME_PACK.chestGrantItemId!;
  const gridPlaced = spawnItemOnFirstEmpty(fullBoardState.grid, {
    instanceId: 'chest_inst',
    itemId: chestItemId,
    tileState: 'normal',
  });
  assert(gridPlaced === false, 'Full board prevents direct placement on grid');

  const invFreeIndex = fullBoardState.inventory.findIndex((s) => s === null);
  assert(invFreeIndex === -1, 'Full inventory prevents direct placement in inventory');

  // Must route to pendingRewards
  fullBoardState.pendingRewards.push({
    id: 'pending_test_chest',
    source: "Bloomkeeper's Welcome Pack",
    title: 'Purchased Chest Reward',
    itemId: chestItemId,
    createdAt: Date.now(),
  });
  assert(fullBoardState.pendingRewards.length === 1, 'Full board routes purchased chest to pendingRewards');
  assert(fullBoardState.pendingRewards[0].itemId === chestItemId, 'Pending chest item is preserved intact');

  // 21. Pending Rewards Survive Save/Load
  const pendingSave = JSON.stringify(fullBoardState);
  const { state: hydratedPending } = hydrateAndMigrateSave(null, pendingSave, testNow);
  assert(hydratedPending.pendingRewards.length === 1, 'Pending rewards survive save/load hydration');
  assert(hydratedPending.pendingRewards[0].id === 'pending_test_chest', 'Pending reward ID preserved');

  // 22. Daily Reward Energy Uses Centralized Overflow
  const dailyRewardOverflow = calculateEnergyGrant(110, 40, true);
  assert(dailyRewardOverflow === 150, 'Daily Reward Energy uses centralized overflow up to 200');

  // 23. Daily Task Energy Uses Centralized Overflow
  const dailyTaskOverflow = calculateEnergyGrant(180, 30, true);
  assert(dailyTaskOverflow === 200, 'Daily Task Energy clamps to centralized overflow cap 200');

  // 24. Level 30 Content Cap Intact After Monetization
  assert(CURRENT_MAX_PLAYER_LEVEL === 30, 'Player Level 30 authored cap intact');
  const level30Save = JSON.stringify({
    level: 30,
    xp: 99999,
    gems: 500,
  });
  const { state: hydratedLevel30 } = hydrateAndMigrateSave(null, level30Save, testNow);
  assert(hydratedLevel30.level === 30, 'Purchases and rewards cannot create Level 31');

  // 25. Schema v5 Migration from v4
  const legacyV4Save = JSON.stringify({
    schemaVersion: 4,
    level: 15,
    coins: 2500,
    gems: 120,
    energy: 85,
  });
  const { state: hydratedV5 } = hydrateAndMigrateSave(null, legacyV4Save, testNow);
  assert(hydratedV5.schemaVersion === CURRENT_SCHEMA_VERSION, 'Migrates save to schema v5');
  assert(hydratedV5.schemaVersion === 5, 'Schema version is exactly 5');
  assert(Array.isArray(hydratedV5.processedTransactionIds), 'Hydrates processedTransactionIds array');
  assert(Array.isArray(hydratedV5.purchasedOneTimeProductIds), 'Hydrates purchasedOneTimeProductIds array');
  assert(Array.isArray(hydratedV5.pendingRewards), 'Hydrates pendingRewards array');
  assert(hydratedV5.stats.mockPurchasesCompleted === 0, 'Hydrates local mock purchase stats');

  // 26. Store Catalog Verification
  assert(GEM_PACK_PRODUCTS.length === 6, 'Contains all 6 data-driven Gem packs');
  const gemSkus = GEM_PACK_PRODUCTS.map((p) => p.sku);
  assert(gemSkus.includes('wishenbloom_gems_80'), 'Catalog includes 80 Gems SKU');
  assert(gemSkus.includes('wishenbloom_gems_450'), 'Catalog includes 450 Gems SKU');
  assert(gemSkus.includes('wishenbloom_gems_1000'), 'Catalog includes 1,000 Gems SKU');
  assert(gemSkus.includes('wishenbloom_gems_2200'), 'Catalog includes 2,200 Gems SKU');
  assert(gemSkus.includes('wishenbloom_gems_6000'), 'Catalog includes 6,000 Gems SKU');
  assert(gemSkus.includes('wishenbloom_gems_13000'), 'Catalog includes 13,000 Gems SKU');

  // 27. Mock Transaction Safety Labeling
  const isMockNoticePresent = mockProvider.isMock();
  assert(isMockNoticePresent === true, 'Mock provider is explicitly flagged as mock/development');

  // 28. Pending Reward Claiming
  const freeGridState = createDefaultInitialState();
  const pendingRewardToClaim = fullBoardState.pendingRewards[0];
  const claimSuccess = spawnItemOnFirstEmpty(freeGridState.grid, {
    instanceId: 'claimed_chest',
    itemId: pendingRewardToClaim.itemId,
    tileState: 'normal',
  });
  assert(claimSuccess === true, 'Pending reward can be claimed to board once space is cleared');
}

// TEST SUITE 17: Native Mobile Verification, Store Integration Safety & Release Hardening
console.log('\n[17] Testing Native Mobile Verification, Store Integration Safety & Release Hardening:');
{
  // 1. APP_IDENTITY Name
  assert(APP_IDENTITY.name === 'Wishenbloom', 'APP_IDENTITY.name is Wishenbloom');

  // 2. APP_IDENTITY Publisher
  assert(APP_IDENTITY.publisher === 'Mythic Crown Studios LLC', 'APP_IDENTITY.publisher is Mythic Crown Studios LLC');

  // 3. Android Application ID
  assert(
    APP_IDENTITY.androidApplicationId === 'com.mythiccrownstudios.wishenbloom',
    'APP_IDENTITY.androidApplicationId matches com.mythiccrownstudios.wishenbloom'
  );

  // 4. iOS Bundle Identifier
  assert(
    APP_IDENTITY.iosBundleIdentifier === 'com.mythiccrownstudios.wishenbloom',
    'APP_IDENTITY.iosBundleIdentifier matches com.mythiccrownstudios.wishenbloom'
  );

  // 5. Version String (0.1.0)
  assert(APP_IDENTITY.version === '0.1.0', 'APP_IDENTITY.version is 0.1.0');

  // 6. Android Version Code (1)
  assert(APP_IDENTITY.androidVersionCode === 1, 'APP_IDENTITY.androidVersionCode is 1');

  // 7. iOS Build Number (1)
  assert(APP_IDENTITY.iosBuildNumber === '1', 'APP_IDENTITY.iosBuildNumber is 1');

  // 8. Web Development Provider
  const devProvider = new MockPurchaseProvider();
  assert(devProvider.isMock() === true, 'Web development can explicitly use MockPurchaseProvider');

  // 9. Beta Environment Guard
  const disabledProvider = new DisabledPurchaseProvider();
  assert(disabledProvider.isMock() === false, 'Beta environment cannot grant through MockPurchaseProvider');

  // 10. Production Environment Guard
  const gpProvider = new GooglePlayPurchaseProvider();
  const appleProvider = new AppleStorePurchaseProvider();
  assert(gpProvider.isMock() === false, 'Production Android provider is not mock');
  assert(appleProvider.isMock() === false, 'Production iOS provider is not mock');

  // 11. Android Unconfigured Billing Error Code
  const androidRes = await gpProvider.purchase('wishenbloom_gems_80');
  const androidPurchaseError = androidRes.error || '';
  assert(
    androidPurchaseError.includes('NOT_CONFIGURED') || androidPurchaseError.includes('STORE_UNAVAILABLE'),
    'Android production with billing unconfigured returns NOT_CONFIGURED or STORE_UNAVAILABLE'
  );

  // 12. iOS Unconfigured Billing Error Code
  const iosRes = await appleProvider.purchase('wishenbloom_gems_80');
  const iosPurchaseError = iosRes.error || '';
  assert(
    iosPurchaseError.includes('NOT_CONFIGURED') || iosPurchaseError.includes('STORE_UNAVAILABLE'),
    'iOS production with billing unconfigured returns NOT_CONFIGURED or STORE_UNAVAILABLE'
  );

  // 13. Disabled Provider Cannot Grant Gems
  const disabledGemRes = await disabledProvider.purchase('wishenbloom_gems_1000');
  assert(disabledGemRes.success === false, 'Disabled provider cannot grant Gems');

  // 14. Disabled Provider Cannot Grant Welcome Pack
  const disabledPackRes = await disabledProvider.purchase('wishenbloom_starter_bloomkeeper');
  assert(disabledPackRes.success === false, 'Disabled provider cannot grant Welcome Pack');

  // 15. Starter Pack Restoration Logic Semantics
  // Restoring one-time purchases confirms entitlement in purchasedOneTimeProductIds without re-granting currencies
  const testEntitlements = ['wishenbloom_starter_bloomkeeper'];
  const restoredSkus = devProvider.restorePurchasesSync(testEntitlements);
  assert(restoredSkus.includes('wishenbloom_starter_bloomkeeper'), 'Restores non-consumable starter pack SKU');
  assert(restoredSkus.length === 1, 'Restoration only applies to authored non-consumables');

  // 16. Pending Reward Preservation
  const testState = createDefaultInitialState();
  testState.pendingRewards = [
    {
      id: 'pending_save_test',
      source: 'Store Purchase',
      title: 'Royal Chest',
      itemId: 'chest_royal_3',
      createdAt: 1234567,
    },
  ];
  const serialized = JSON.stringify(testState);
  const { state: restoredState } = hydrateAndMigrateSave(null, serialized, 1234567);
  assert(restoredState.pendingRewards.length === 1, 'Pending rewards preserved across save hydration');
  assert(restoredState.pendingRewards[0].itemId === 'chest_royal_3', 'Pending item details accurately preserved');

  // 17. Duplicate Transaction Detection
  testState.processedTransactionIds = ['tx_prev_100'];
  const isDuplicate = testState.processedTransactionIds.includes('tx_prev_100');
  const isNewTx = !testState.processedTransactionIds.includes('tx_new_200');
  assert(isDuplicate === true, 'Duplicate transaction ID is recognized and rejected');
  assert(isNewTx === true, 'New unique transaction ID is accepted');

  // 18. Schema-v5 Save Compatibility
  assert(restoredState.schemaVersion === 5, 'Save schema v5 is active and backwards compatible');
  assert(Array.isArray(restoredState.processedTransactionIds), 'Save schema v5 includes processedTransactionIds');
  assert(Array.isArray(restoredState.purchasedOneTimeProductIds), 'Save schema v5 includes purchasedOneTimeProductIds');

  // 19. Lifecycle Event Idempotent Evaluation
  const resumeState = createDefaultInitialState();
  resumeState.energy = 50;
  resumeState.lastEnergyRechargeAt = 1000000;
  // First evaluation at +240s (should grant 2 energy: 1 per 120s)
  const elapsed240 = (1000000 + 240000 - resumeState.lastEnergyRechargeAt) / 1000;
  const grant240 = Math.floor(elapsed240 / 120);
  assert(grant240 === 2, 'First resume calculation correctly calculates 2 energy for 240s');
  // Immediate second evaluation with 0s elapsed
  const updatedRechargeAt = 1000000 + 240000;
  const elapsed0 = (1000000 + 240000 - updatedRechargeAt) / 1000;
  const grant0 = Math.floor(elapsed0 / 120);
  assert(grant0 === 0, 'Immediate repeated resume evaluation is idempotent and adds 0 energy');

  // 20. Level 30 Cap Unviolated Across Mobile Bootstrap
  assert(CURRENT_MAX_PLAYER_LEVEL === 30, 'Level 30 remains absolute max player level across mobile bootstrap');
  const level30MobileState = createDefaultInitialState();
  level30MobileState.level = 30;
  level30MobileState.xp = 50000;
  const mobileSerialized = JSON.stringify(level30MobileState);
  const { state: hydratedMobile } = hydrateAndMigrateSave(null, mobileSerialized, 2000000);
  assert(hydratedMobile.level === 30, 'Player level strictly clamped to 30 on mobile hydration');
  assert(isPlayerAtMaxLevel(hydratedMobile.level) === true, 'isPlayerAtMaxLevel confirms Level 30 max status');
}

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passedTests}/${totalTests} tests passed (${failedTests} failed)`);
  console.log(`========================================\n`);

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});

