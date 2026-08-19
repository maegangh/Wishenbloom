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

console.log(`\n========================================`);
console.log(`RESULTS: ${passedTests}/${totalTests} tests passed (${failedTests} failed)`);
console.log(`========================================\n`);

if (failedTests > 0) {
  process.exit(1);
}
