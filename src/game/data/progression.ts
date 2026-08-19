import { ItemChainId } from '../types';

export interface LevelUnlockInfo {
  generatorId?: string;
  generatorName?: string;
  chainId?: ItemChainId;
  chainName?: string;
  npcId?: string;
  npcName?: string;
  npcRole?: string;
  mechanicName?: string;
  mechanicDescription?: string;
  kingdomAreaId?: string;
  kingdomAreaName?: string;
  inventorySlotIncrease?: number;
}

export interface LevelRewards {
  coins: number;
  gems: number;
  energy: number;
  isFullEnergyRefill?: boolean;
  chestItemId?: string;
  inventorySlotsAdded?: number;
}

export interface LevelProgressionDef {
  level: number;
  xpRequired: number; // XP to advance from this level to next
  cumulativeXp: number;
  title: string;
  subtitle: string;
  storySnippet: string;
  unlocks: LevelUnlockInfo;
  rewards: LevelRewards;
  isChapterMilestone?: boolean;
}

export const CURRENT_MAX_PLAYER_LEVEL = 30;

export const LEVEL_PROGRESSION: Record<number, LevelProgressionDef> = {
  1: {
    level: 1,
    xpRequired: 40,
    cumulativeXp: 0,
    title: 'The First Spark',
    subtitle: 'Awaken the Dormant Soil',
    storySnippet:
      'The ancient Bloom lies dormant across Wishenbloom. As the appointed Bloomkeeper, your gentle magic begins to stir the soil back to life.',
    unlocks: {
      generatorId: 'gen_garden_1',
      generatorName: 'Enchanted Garden',
      chainId: 'herbs',
      chainName: 'Magical Herbs',
      npcId: 'elowen',
      npcName: 'Elowen',
      npcRole: 'Forest Guardian',
      mechanicName: 'Merge-2 & Generator Tapping',
      mechanicDescription: 'Tap the Enchanted Garden for energy and merge identical sprouts to create potent herbs.',
      kingdomAreaId: 'fountain',
      kingdomAreaName: 'The Sunfire Plaza & Fountain',
    },
    rewards: {
      coins: 100,
      gems: 5,
      energy: 100,
    },
  },
  2: {
    level: 2,
    xpRequired: 80,
    cumulativeXp: 40,
    title: 'Discovery & Dust',
    subtitle: 'Uncover Lost Relics',
    storySnippet:
      'Ancient objects trapped under thick dust and cobwebs begin to resonate. Merging a matching item into a dusty tile dispels the ancient seal!',
    unlocks: {
      mechanicName: 'Compendium & Dusty Clearing',
      mechanicDescription: 'Recorded discoveries grant milestone rewards. Merging onto dusty tiles awakens trapped items with double XP!',
    },
    rewards: {
      coins: 150,
      gems: 6,
      energy: 100,
    },
  },
  3: {
    level: 3,
    xpRequired: 140,
    cumulativeXp: 120,
    title: 'Alchemy Awakens',
    subtitle: 'The Bubbling Crucible',
    storySnippet:
      'Archmage Valerie’s laboratory responds to the revived Bloom! Her alembics bubble with translucent tinctures and mana-rich elixirs.',
    unlocks: {
      generatorId: 'gen_alchemist_1',
      generatorName: "Alchemist's Table",
      chainId: 'potions',
      chainName: 'Alchemical Potions',
      npcId: 'valerie',
      npcName: 'Archmage Valerie',
      npcRole: 'High Sorceress',
      kingdomAreaId: 'greenhouse',
      kingdomAreaName: "Herbalist's Conservatory",
      mechanicName: 'Alchemical Distillation',
      mechanicDescription: 'Produce potion vials and distill multi-tier healing and mana draughts.',
    },
    rewards: {
      coins: 200,
      gems: 8,
      energy: 100,
    },
  },
  4: {
    level: 4,
    xpRequired: 220,
    cumulativeXp: 260,
    title: 'Restoring the Realm',
    subtitle: 'The Sunfire Waters Flow',
    storySnippet:
      'Princess Aurelia arrives to witness the Sunfire Plaza fountain murmuring once again. Restoring kingdom landmarks permanently anchors the living Bloom.',
    unlocks: {
      npcId: 'aurelia',
      npcName: 'Princess Aurelia',
      npcRole: 'The Realm Restorer',
      kingdomAreaId: 'wizard_spire',
      kingdomAreaName: "Archmage's Celestial Spire",
      mechanicName: 'Landmark Restoration',
      mechanicDescription: 'Invest earned coins to rebuild iconic kingdom landmarks and unlock vital realm lore.',
    },
    rewards: {
      coins: 250,
      gems: 10,
      energy: 100,
    },
  },
  5: {
    level: 5,
    xpRequired: 320,
    cumulativeXp: 480,
    title: 'The Master Forge',
    subtitle: 'Sparks of Dragon Fire',
    storySnippet:
      'Balgor rekindles his volcanic forge with embers from the awakened Bloom. He examines ancient notched blades, wondering what battle caused the Great Fading.',
    unlocks: {
      generatorId: 'gen_forge_1',
      generatorName: 'Royal Forge',
      chainId: 'blacksmith',
      chainName: 'Master Forge Equipment',
      npcId: 'balgor',
      npcName: 'Balgor',
      npcRole: 'Master Blacksmith',
      kingdomAreaId: 'forge_hall',
      kingdomAreaName: 'The Volcanic High Forge',
      mechanicName: 'Weapon & Armor Smelting',
      mechanicDescription: 'Smelt iron ingots, forge tempered swords, and craft legendary defense gear.',
    },
    rewards: {
      coins: 300,
      gems: 12,
      energy: 100,
    },
  },
  6: {
    level: 6,
    xpRequired: 450,
    cumulativeXp: 800,
    title: 'Pocket & Prosperity',
    subtitle: 'Strategic Storage',
    storySnippet:
      'Pip the goblin merchant demonstrates the art of inventory management. A true Bloomkeeper stores high-tier components to fulfill high-reward contracts.',
    unlocks: {
      npcId: 'pip',
      npcName: 'Pip',
      npcRole: 'Curio Collector & Merchant',
      inventorySlotIncrease: 1,
      mechanicName: 'Expanded Storage Pocket',
      mechanicDescription: 'Unlocked an extra permanent storage slot in your inventory tray (6 total slots)!',
    },
    rewards: {
      coins: 350,
      gems: 15,
      energy: 100,
      inventorySlotsAdded: 1,
    },
  },
  7: {
    level: 7,
    xpRequired: 600,
    cumulativeXp: 1250,
    title: 'Lost Knowledge',
    subtitle: 'The Floating Grimoires',
    storySnippet:
      'Ancient ink illuminates across forgotten spellbook pages. Passages erased centuries ago reveal themselves when bathed in pure Bloom radiance.',
    unlocks: {
      generatorId: 'gen_wizard_1',
      generatorName: "Wizard's Desk",
      chainId: 'spellbooks',
      chainName: 'Ancient Spellbooks',
      mechanicName: 'Arcane Scribing',
      mechanicDescription: 'Inscribe rune scrolls and assemble celestial grimoires of high magic.',
    },
    rewards: {
      coins: 400,
      gems: 18,
      energy: 100,
    },
  },
  8: {
    level: 8,
    xpRequired: 800,
    cumulativeXp: 1850,
    title: 'Mythic Companions',
    subtitle: 'Songs of the High Canopy',
    storySnippet:
      'Sylas the Beastwarden hears joyous calls from the mist cliffs. Dormant creature eggs warmed by the Bloom are ready to hatch into loyal mythical companions.',
    unlocks: {
      generatorId: 'gen_nest_1',
      generatorName: 'Mystic Nest',
      chainId: 'creatures',
      chainName: 'Mythic Creatures',
      npcId: 'sylas',
      npcName: 'Sylas',
      npcRole: 'Highland Beastwarden',
      kingdomAreaId: 'dragon_roost',
      kingdomAreaName: 'The Moonlit Dragon Roost',
      mechanicName: 'Creature Hatching & Bonding',
      mechanicDescription: 'Weave starlight nests to hatch and raise magical drakes and faelings.',
    },
    rewards: {
      coins: 500,
      gems: 20,
      energy: 100,
    },
  },
  9: {
    level: 9,
    xpRequired: 1050,
    cumulativeXp: 2650,
    title: 'Echoes of the Crown',
    subtitle: 'The Royal Seal',
    storySnippet:
      'Princess Aurelia discovers a tarnished royal emblem in the archives. A dark revelation emerges: the Bloom did not fade by natural decay—it was deliberately sealed by an ancient decree.',
    unlocks: {
      mechanicName: 'Royal Relic Lore',
      mechanicDescription: 'Uncover royal antiquities and prepare for the awakening of the Royal Reliquary.',
    },
    rewards: {
      coins: 600,
      gems: 25,
      energy: 100,
    },
  },
  10: {
    level: 10,
    xpRequired: 1400,
    cumulativeXp: 3700,
    title: 'Chapter 1 Milestone: The Bloom Reborn',
    subtitle: 'The Living Heart of Wishenbloom',
    storySnippet:
      'The entire central realm rejoices! The Sunfire Plaza, Conservatory, Spire, and Forge resonate in harmony. The Royal Reliquary awakens, revealing long-lost ceremonial regalia, coin tributes, and energy caches from Wishenbloom\'s golden age!',
    unlocks: {
      generatorId: 'gen_tree_1',
      generatorName: 'Royal Reliquary',
      chainId: 'treasures',
      chainName: 'Royal Treasures & Energy',
      mechanicName: 'Royal Reliquary',
      mechanicDescription: 'The supreme landmark generator produces high-tier coin bags, energy orbs, and rare royal artifacts!',
    },
    rewards: {
      coins: 800,
      gems: 50,
      energy: 100,
      chestItemId: 'chest_golden',
    },
    isChapterMilestone: true,
  },
  11: {
    level: 11,
    xpRequired: 1800,
    cumulativeXp: 5500,
    title: 'After the Awakening',
    subtitle: 'The Reliquary Cipher',
    storySnippet:
      'A cylindrical artifact retrieved from the Royal Reliquary bears an unbroken wax seal depicting three interconnected conduits—with one deliberately severed.',
    unlocks: {
      mechanicName: 'Relic Ciphers',
      mechanicDescription: 'Valuable Royal Relic and high-tier artisan orders begin appearing across the realm.',
    },
    rewards: {
      coins: 350,
      gems: 0,
      energy: 25,
    },
  },
  12: {
    level: 12,
    xpRequired: 2300,
    cumulativeXp: 7800,
    title: 'The Old Road',
    subtitle: 'The Moonstone Causeway',
    storySnippet:
      'Centuries of morning mist lift from the mountain pass, revealing the Moonstone Causeway—the grand ceremonial highway leading to the outer artisan valleys.',
    unlocks: {
      kingdomAreaId: 'causeway',
      mechanicName: 'Kingdom Expansion',
      mechanicDescription: 'Restore the Moonstone Causeway to reconnect the outer artisan provinces!',
    },
    rewards: {
      coins: 400,
      gems: 5,
      energy: 30,
    },
  },
  13: {
    level: 13,
    xpRequired: 2900,
    cumulativeXp: 10700,
    title: 'Threads of the Crown',
    subtitle: 'Master Weaver Celeste',
    storySnippet:
      'Master Weaver Celeste arrives across the Causeway with her Enchanted Loom, spinning Bloom-infused silks and historic ceremonial regalia.',
    unlocks: {
      generatorId: 'gen_loom_1',
      generatorName: 'Enchanted Loom',
      chainId: 'textiles',
      chainName: 'Enchanted Textiles',
      npcId: 'celeste',
      npcName: 'Celeste',
      npcRole: 'Royal Weaver',
      kingdomAreaId: 'atelier',
      mechanicName: 'Royal Loom Atelier',
      mechanicDescription: 'Weave enchanted threads into loomed cloth, embroidered fabrics, and sovereign regalia!',
    },
    rewards: {
      coins: 450,
      gems: 5,
      energy: 40,
    },
  },
  14: {
    level: 14,
    xpRequired: 3600,
    cumulativeXp: 14300,
    title: 'Echoes of the Weaver',
    subtitle: 'The Prophetic Tapestries',
    storySnippet:
      'Celeste confides that her guild’s master patterns were locked away decades ago when the court tapestry began weaving images of the Bloom abruptly halting.',
    unlocks: {
      mechanicName: 'Artisan Lore',
      mechanicDescription: 'Advanced artisan order combinations unlock in the order registry.',
    },
    rewards: {
      coins: 500,
      gems: 0,
      energy: 30,
    },
  },
  15: {
    level: 15,
    xpRequired: 4400,
    cumulativeXp: 18700,
    title: 'Chapter 2 Midpoint: The Royal Commission',
    subtitle: 'Special Orders & Grand Bounties',
    storySnippet:
      'Princess Aurelia establishes the Royal Commission! Master artisans post high-value Special Orders offering rare chests, gems, and immense coin bounties.',
    unlocks: {
      mechanicName: 'Special Orders',
      mechanicDescription: 'Optional high-reward Royal Commission orders now appear with golden borders and chest bounties!',
    },
    rewards: {
      coins: 700,
      gems: 15,
      energy: 100,
      isFullEnergyRefill: true,
      chestItemId: 'chest_golden',
    },
  },
  16: {
    level: 16,
    xpRequired: 5300,
    cumulativeXp: 24000,
    title: 'The Sealed Decrees',
    subtitle: 'Uncovering the Royal Edict',
    storySnippet:
      'Archmage Valerie deciphers charred parchment fragments from the archives: a royal decree ordered subterranean Bloom conduits sealed shortly before the kingdom declined.',
    unlocks: {
      mechanicName: 'Deep Realm Lore',
      mechanicDescription: 'New high-tier potion and spellbook orders reveal ancient historical secrets.',
    },
    rewards: {
      coins: 550,
      gems: 0,
      energy: 35,
    },
  },
  17: {
    level: 17,
    xpRequired: 6300,
    cumulativeXp: 30300,
    title: 'Heart of the Bloomstone',
    subtitle: 'The Runic Excavation',
    storySnippet:
      'Deep Scribe Gideon excavates the bedrock beneath Wishenbloom, uncovering vibrant runestones and arcane prisms that channel subterranean Bloom conduits.',
    unlocks: {
      generatorId: 'gen_quarry_1',
      generatorName: 'Runic Excavation',
      chainId: 'crystals',
      chainName: 'Enchanted Crystals',
      npcId: 'gideon',
      npcName: 'Gideon',
      npcRole: 'Deep Scribe',
      kingdomAreaId: 'quarry_sanctum',
      mechanicName: 'Crystal Excavation',
      mechanicDescription: 'Mine subterranean stone fragments, radiant rune stones, and arcane prisms!',
    },
    rewards: {
      coins: 600,
      gems: 5,
      energy: 40,
    },
  },
  18: {
    level: 18,
    xpRequired: 7500,
    cumulativeXp: 37800,
    title: 'The Artisan Vault',
    subtitle: 'Strategic Pocket Expansion',
    storySnippet:
      'Balgor and Pip construct reinforced storage vaults within the quarry cliffside, granting the Bloomkeeper an additional permanent storage pocket.',
    unlocks: {
      inventorySlotIncrease: 1,
      mechanicName: 'Vault Storage Expansion',
      mechanicDescription: 'Permanent inventory storage increased to 7 slots!',
    },
    rewards: {
      coins: 650,
      gems: 5,
      energy: 40,
      inventorySlotsAdded: 1,
    },
  },
  19: {
    level: 19,
    xpRequired: 8800,
    cumulativeXp: 46600,
    title: 'The Second Resonance',
    subtitle: 'Harmonic Convergence',
    storySnippet:
      'The Sunfire Plaza, Celestial Spire, Dragon Roost, Causeway, and Atelier begin pulsating in harmonious synchronization. Ancient conduit runes flare to life.',
    unlocks: {
      mechanicName: 'Harmonic Convergence',
      mechanicDescription: 'High-tier multi-chain orders prepare the realm for the conduit awakening.',
    },
    rewards: {
      coins: 800,
      gems: 0,
      energy: 50,
    },
  },
  20: {
    level: 20,
    xpRequired: 10500,
    cumulativeXp: 57100,
    title: 'Chapter 2 Milestone: Conduits of the Crown',
    subtitle: 'The Outer Provinces Stir',
    storySnippet:
      'The entire central kingdom hums with glorious Bloom energy! Recovered royal records prove the subterranean conduits were intentionally sealed under crown decree, but the final pages explaining the true cause are missing or deliberately expunged. Beyond the mist, a deep resonance from the Outer Provinces suggests the answers lie ahead.',
    unlocks: {
      mechanicName: 'Chapter 2 Milestone',
      mechanicDescription: 'Chapter 2 Completed! The central province is fully revitalized and the outer realms call.',
    },
    rewards: {
      coins: 1200,
      gems: 30,
      energy: 100,
      isFullEnergyRefill: true,
      chestItemId: 'chest_royal',
    },
    isChapterMilestone: true,
  },
  21: {
    level: 21,
    xpRequired: 12000,
    cumulativeXp: 67600,
    title: 'Beyond the Causeway',
    subtitle: 'The Veiled Gate Appears',
    storySnippet:
      'Beyond the Moonstone Causeway lies the threshold to the Outer Provinces. Standing tall amidst ancient fog is the colossal Veiled Gate, sealed centuries ago under royal edict with unanswered questions.',
    unlocks: {
      kingdomAreaId: 'veiled_gate',
      kingdomAreaName: 'The Veiled Gate',
      mechanicName: 'Outer Provinces Exploration',
      mechanicDescription: 'Venture beyond the central kingdom into the foggy Outer Provinces and begin restoring the ancient border crossings.',
    },
    rewards: {
      coins: 900,
      gems: 0,
      energy: 35,
    },
  },
  22: {
    level: 22,
    xpRequired: 14000,
    cumulativeXp: 79600,
    title: 'Echoes of the Border',
    subtitle: 'Conflicting Records',
    storySnippet:
      'As you work near the gate, Archmage Valerie and Princess Aurelia review old provincial ledgers. Certain dates and royal decrees regarding the frontier contain stark contradictions—some claiming the border was sealed for safety, others hinting at sudden containment.',
    unlocks: {
      mechanicName: 'Provincial Mixed Orders',
      mechanicDescription: 'Citizens and returning travelers request varied multi-chain supplies to support the border expansion.',
    },
    rewards: {
      coins: 950,
      gems: 0,
      energy: 35,
    },
  },
  23: {
    level: 23,
    xpRequired: 16500,
    cumulativeXp: 93600,
    title: "The Hearthkeeper's Call",
    subtitle: 'Warmth in the Mist',
    storySnippet:
      'Bram, a renowned master provisioner of the border marches, arrives with his enchanted stone hearth! He kindles the fire with moonberries and spiced herbs, offering hearty meals that warm the spirits of all working near the frontier.',
    unlocks: {
      generatorId: 'gen_hearth_1',
      generatorName: "Bloomkeeper's Hearth",
      chainId: 'provisions',
      chainName: 'Royal Provisions',
      npcId: 'bram',
      npcName: 'Bram',
      npcRole: 'Master Provisioner',
      mechanicName: 'Enchanted Culinary Baking',
      mechanicDescription: 'Bake moonberry tarts, herb broths, and grand royal feasts to nourish workers and travelers.',
    },
    rewards: {
      coins: 1000,
      gems: 5,
      energy: 40,
    },
  },
  24: {
    level: 24,
    xpRequired: 19500,
    cumulativeXp: 110100,
    title: 'Moonhaven Awakens',
    subtitle: 'The Border Settlement',
    storySnippet:
      'Past the Veiled Gate, the abandoned settlement of Moonhaven begins stirring with life. Restoring its cottages and tavern brings back provincial families who share forgotten folklore of ancient Bloom conduits.',
    unlocks: {
      kingdomAreaId: 'moonhaven',
      kingdomAreaName: 'Moonhaven Settlement',
      mechanicName: 'Settlement Revival',
      mechanicDescription: 'Rebuild Moonhaven to welcome families, artisans, and traders back to the border valleys.',
    },
    rewards: {
      coins: 1100,
      gems: 0,
      energy: 40,
    },
  },
  25: {
    level: 25,
    xpRequired: 23000,
    cumulativeXp: 129600,
    title: 'The Compendium Archives',
    subtitle: 'Chapter 3 Midpoint Milestone',
    storySnippet:
      'Your extensive journeys as Bloomkeeper have documented dozens of rare botanical, alchemical, and craft wonders. The royal archives inaugurate the Compendium Milestones to honor your encyclopedic achievements!',
    unlocks: {
      mechanicName: 'Compendium Milestones',
      mechanicDescription: 'Achieve grand collection goals across discovery count and chain tiers for valuable coins, gems, and chests!',
    },
    rewards: {
      coins: 1500,
      gems: 15,
      energy: 100,
      isFullEnergyRefill: true,
      chestItemId: 'chest_golden',
    },
  },
  26: {
    level: 26,
    xpRequired: 27000,
    cumulativeXp: 152600,
    title: 'The Fractured Seal',
    subtitle: 'Evidence of Intrusion',
    storySnippet:
      'While clearing the highland road, you unearth physical evidence: a major conduit wardstone bearing severe chisel marks that occurred long after the official royal sealing. Someone returned to the border secretly in the past—though their identity and intent remain a complete mystery.',
    unlocks: {
      mechanicName: 'Altered Seals Investigation',
      mechanicDescription: 'Uncover cryptic historical fragments and investigate anomalous conduit wardings.',
    },
    rewards: {
      coins: 1250,
      gems: 0,
      energy: 45,
    },
  },
  27: {
    level: 27,
    xpRequired: 31500,
    cumulativeXp: 179600,
    title: 'Starlight in the Mist',
    subtitle: "The Wayfinder's Lantern",
    storySnippet:
      'Elena, an intrepid provincial wayfinder and cartographer, establishes her Starlight Workshop on the high ridge. Her handcrafted moonstone lanterns and beacons pierce the dense mountain fog, illuminating forgotten paths.',
    unlocks: {
      generatorId: 'gen_lantern_1',
      generatorName: 'Starlight Workshop',
      chainId: 'lanterns',
      chainName: 'Celestial Lanterns',
      npcId: 'elena',
      npcName: 'Elena',
      npcRole: 'Starlight Wayfinder',
      kingdomAreaId: 'beacon_ridge',
      kingdomAreaName: 'Celestial Beacon Ridge',
      mechanicName: 'Celestial Illumination',
      mechanicDescription: 'Shape candles and moonstone lanterns to pierce the veil of deep mist.',
    },
    rewards: {
      coins: 1350,
      gems: 5,
      energy: 45,
    },
  },
  28: {
    level: 28,
    xpRequired: 36500,
    cumulativeXp: 211100,
    title: 'Master of Space',
    subtitle: 'Expanded Storage Pouch',
    storySnippet:
      'With extensive generator families and complex multi-chain commissions demanding careful organization, your magical satchel naturally expands with an additional enchanted storage pocket.',
    unlocks: {
      inventorySlotIncrease: 1,
      mechanicName: 'Storage Expansion',
      mechanicDescription: 'Permanently unlocked your 8th inventory storage slot to manage multi-chain production smoothly.',
    },
    rewards: {
      coins: 1450,
      gems: 5,
      energy: 45,
      inventorySlotsAdded: 1,
    },
  },
  29: {
    level: 29,
    xpRequired: 42000,
    cumulativeXp: 247600,
    title: 'Resonant Harmonics',
    subtitle: 'The Outer Nexus Awakes',
    storySnippet:
      'As starlight beacons align, the subterranean Outer Conduit Nexus begins humming in direct resonance with the central kingdom! The ancient seals act not as isolated barriers, but as interlocking components of a massive network.',
    unlocks: {
      kingdomAreaId: 'conduit_nexus',
      kingdomAreaName: 'The Outer Conduit Nexus',
      mechanicName: 'Planetary Conduit Grid',
      mechanicDescription: 'Harmonize the provincial conduit grid as you prepare to unravel the mystery of the sealing sequence.',
    },
    rewards: {
      coins: 1600,
      gems: 0,
      energy: 50,
    },
  },
  30: {
    level: 30,
    xpRequired: 50000,
    cumulativeXp: 289600,
    title: 'Chapter 3 Milestone: The Divergent Conduit',
    subtitle: 'The Network Revealed',
    storySnippet:
      'You successfully restore the Outer Provinces network! Full planetary alignment reveals that the ancient conduits were sealed in a deliberate geometric sequence across the kingdom—except for the 7th provincial junction, where the seal was intentionally altered by an unknown hand. A harmonic signal chimes from the deep uncharted frontier beyond, signaling that greater truths await.',
    unlocks: {
      mechanicName: 'Chapter 3 Milestone',
      mechanicDescription: 'Chapter 3 Completed! The Outer Provinces are illuminated and the true conduit mystery begins.',
    },
    rewards: {
      coins: 2500,
      gems: 30,
      energy: 100,
      isFullEnergyRefill: true,
      chestItemId: 'chest_royal',
    },
    isChapterMilestone: true,
  },
};

/**
 * Returns whether the player has reached or exceeded the current content cap
 */
export function isPlayerAtMaxLevel(level: number): boolean {
  return level >= CURRENT_MAX_PLAYER_LEVEL;
}

/**
 * Returns progression definition for a given level, clamped to the currently authored max level (30).
 * Does NOT generate procedural or unauthored rewards for levels beyond CURRENT_MAX_PLAYER_LEVEL.
 */
export function getLevelProgression(level: number): LevelProgressionDef {
  const safeLevel = Math.min(Math.max(1, Math.floor(level)), CURRENT_MAX_PLAYER_LEVEL);
  if (LEVEL_PROGRESSION[safeLevel]) {
    return LEVEL_PROGRESSION[safeLevel];
  }
  return LEVEL_PROGRESSION[1];
}

/**
 * Returns which item chains are legally unlocked for a given player level
 */
export function getUnlockedChainsForLevel(level: number): ItemChainId[] {
  const chains: ItemChainId[] = ['herbs', 'energy', 'gems', 'chests'];
  if (level >= 3) chains.push('potions');
  if (level >= 5) chains.push('blacksmith');
  if (level >= 7) chains.push('spellbooks');
  if (level >= 8) chains.push('creatures');
  if (level >= 10) chains.push('treasures');
  if (level >= 13) chains.push('textiles');
  if (level >= 17) chains.push('crystals');
  if (level >= 23) chains.push('provisions');
  if (level >= 27) chains.push('lanterns');
  return chains;
}

/**
 * Returns generator ID unlocked at a specific level (if any)
 */
export function getGeneratorUnlockedAtLevel(level: number): string | null {
  return LEVEL_PROGRESSION[level]?.unlocks?.generatorId || null;
}
