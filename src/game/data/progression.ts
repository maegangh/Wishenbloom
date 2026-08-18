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
      gems: 10,
      energy: 100,
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
      gems: 12,
      energy: 100,
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
      gems: 15,
      energy: 100,
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
      gems: 15,
      energy: 100,
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
      coins: 650,
      gems: 25,
      energy: 100,
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
      gems: 18,
      energy: 100,
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
      gems: 20,
      energy: 100,
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
      coins: 700,
      gems: 22,
      energy: 100,
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
      gems: 25,
      energy: 100,
    },
  },
  20: {
    level: 20,
    xpRequired: 10500,
    cumulativeXp: 57100,
    title: 'Chapter 2 Milestone: Conduits of the Crown',
    subtitle: 'The Outer Provinces Stir',
    storySnippet:
      'The entire central kingdom hums with glorious Bloom energy! The recovered relics prove the conduits were sealed as a sanctuary measure against an ancient cosmic storm. Beyond the mist, the seals on the Outer Provinces begin awakening!',
    unlocks: {
      mechanicName: 'Chapter 2 Milestone',
      mechanicDescription: 'Chapter 2 Completed! The central province is fully revitalized and the outer realms call.',
    },
    rewards: {
      coins: 1500,
      gems: 60,
      energy: 100,
      chestItemId: 'chest_royal',
    },
    isChapterMilestone: true,
  },
};

/**
 * Returns progression definition for a given level (or extrapolated if beyond level 20)
 */
export function getLevelProgression(level: number): LevelProgressionDef {
  if (LEVEL_PROGRESSION[level]) {
    return LEVEL_PROGRESSION[level];
  }

  // Graceful fallback / extrapolation for level 21+
  const xpRequired = Math.round(10500 * Math.pow(1.2, level - 20));
  return {
    level,
    xpRequired,
    cumulativeXp: 57100 + (level - 20) * 10500,
    title: `Master Bloomkeeper ${level}`,
    subtitle: 'Guardian of the Realm',
    storySnippet: 'Your mastery over the Bloom deepens as you explore new frontiers of Wishenbloom.',
    unlocks: {},
    rewards: {
      coins: level * 100,
      gems: Math.floor(level * 2.5) + 5,
      energy: 100,
    },
  };
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
  return chains;
}

/**
 * Returns generator ID unlocked at a specific level (if any)
 */
export function getGeneratorUnlockedAtLevel(level: number): string | null {
  return LEVEL_PROGRESSION[level]?.unlocks?.generatorId || null;
}
