import { checkMergeValidity, rollBubbleSpawn } from '../logic/mergeLogic';
import { resolveExpiredBubbles, canPurchaseBubble, getBubbleRemainingSeconds } from '../logic/bubbleLogic';
import { validateGeneratorTap, validateGeneratorUpgrade, getGeneratorCooldownRemaining } from '../logic/generatorLogic';
import { getProducibleItemPools, generateSafeRandomOrder, isOrderFulfillable } from '../logic/orderLogic';
import { hydrateAndMigrateSave, createDefaultInitialState, CURRENT_SCHEMA_VERSION } from '../logic/saveMigration';
import {
  LEVEL_PROGRESSION,
  getLevelProgression,
  getUnlockedChainsForLevel,
  getGeneratorUnlockedAtLevel,
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
  // 1. Level 11: Relic Ciphers
  const l11 = getLevelProgression(11);
  assert(l11.unlocks.mechanicName === 'Relic Ciphers', 'Level 11 unlocks Relic Ciphers mechanic');
  assert(l11.rewards.coins === 350 && l11.rewards.gems === 10, 'Level 11 rewards 350 Coins and 10 Gems');

  // 2. Level 12: Moonstone Causeway
  const l12 = getLevelProgression(12);
  assert(l12.unlocks.kingdomAreaId === 'causeway', 'Level 12 unlocks Moonstone Causeway kingdom area');
  assert(l12.rewards.coins === 400 && l12.rewards.gems === 12, 'Level 12 rewards 400 Coins and 12 Gems');

  // 3. Level 13: Enchanted Textiles & Royal Loom
  const l13 = getLevelProgression(13);
  assert(l13.unlocks.generatorId === 'gen_loom_1', 'Level 13 unlocks Royal Loom (gen_loom_1)');
  assert(l13.unlocks.chainId === 'textiles', 'Level 13 unlocks textiles chain');
  assert(l13.unlocks.npcId === 'celeste', 'Level 13 introduces Celeste Royal Weaver');
  assert(getUnlockedChainsForLevel(13).includes('textiles'), 'Level 13 unlocked chains include textiles');
  assert(!getUnlockedChainsForLevel(12).includes('textiles'), 'Level 12 does not include textiles');
  assert(Boolean(ITEMS['textile_1'] && ITEMS['textile_8']), 'Textiles chain items T1-T8 exist');

  // 4. Level 14: Tapestry Lore
  const l14 = getLevelProgression(14);
  assert(l14.unlocks.mechanicName === 'Artisan Lore', 'Level 14 unlocks Artisan Lore mechanic');

  // 5. Level 15: Special Orders / Royal Commissions
  const l15 = getLevelProgression(15);
  assert(l15.unlocks.mechanicName === 'Special Orders', 'Level 15 unlocks Special Orders');
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

  // 6. Level 16: Deep Realm Lore
  const l16 = getLevelProgression(16);
  assert(l16.unlocks.mechanicName === 'Deep Realm Lore', 'Level 16 unlocks Deep Realm Lore');
  assert(l16.rewards.coins === 550, 'Level 16 awards 550 Coins');

  // 7. Level 17: Enchanted Crystals & Arcane Quarry
  const l17 = getLevelProgression(17);
  assert(l17.unlocks.generatorId === 'gen_quarry_1', 'Level 17 unlocks Arcane Quarry (gen_quarry_1)');
  assert(l17.unlocks.chainId === 'crystals', 'Level 17 unlocks crystals & runestones chain');
  assert(l17.unlocks.npcId === 'gideon', 'Level 17 introduces Gideon Deep Scribe');
  assert(getUnlockedChainsForLevel(17).includes('crystals'), 'Level 17 unlocked chains include crystals');
  assert(!getUnlockedChainsForLevel(16).includes('crystals'), 'Level 16 does not include crystals');
  assert(Boolean(ITEMS['crystal_1'] && ITEMS['crystal_8']), 'Crystals chain items T1-T8 exist');

  // 8. Level 18: Artisan Vault Expansion
  const l18 = getLevelProgression(18);
  assert(l18.unlocks.inventorySlotIncrease === 1, 'Level 18 grants 7th inventory slot');
  assert(l18.rewards.inventorySlotsAdded === 1, 'Level 18 records inventorySlotsAdded');

  // 9. Level 19: Harmonic Convergence
  const l19 = getLevelProgression(19);
  assert(l19.unlocks.mechanicName === 'Harmonic Convergence', 'Level 19 unlocks Harmonic Convergence');
  assert(l19.rewards.coins === 800 && l19.rewards.gems === 25, 'Level 19 awards 800 Coins and 25 Gems');

  // 10. Level 20: Chapter 2 Milestone
  const l20 = getLevelProgression(20);
  assert(l20.isChapterMilestone === true, 'Level 20 is marked as Chapter 2 Milestone');
  assert(l20.rewards.gems === 60, 'Level 20 awards 60 Gems');
  assert(l20.rewards.chestItemId === 'chest_royal', 'Level 20 awards Royal Chapter Chest');
  assert(BALANCE.CHAPTER_2_CTA_TEXT === 'Continue Your Journey', 'Chapter 2 CTA text is "Continue Your Journey"');
}

console.log(`\n========================================`);
console.log(`RESULTS: ${passedTests}/${totalTests} tests passed (${failedTests} failed)`);
console.log(`========================================\n`);

if (failedTests > 0) {
  process.exit(1);
}
