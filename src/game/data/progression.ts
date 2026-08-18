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
      mechanicDescription: 'Uncover royal antiquities and prepare for the awakening of the Ancient Wishing Tree.',
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
      'The entire central realm rejoices! The Sunfire Plaza, Conservatory, Spire, and Forge resonate in harmony. The primordial Wishing Tree awakens, radiating energy across the kingdom and opening pathways to the untamed outer realms!',
    unlocks: {
      generatorId: 'gen_tree_1',
      generatorName: 'Ancient Wishing Tree',
      chainId: 'treasures',
      chainName: 'Royal Treasures & Energy',
      mechanicName: 'Primordial Wishing Tree',
      mechanicDescription: 'The supreme landmark generator produces high-tier coin bags, energy orbs, and rare artifacts!',
    },
    rewards: {
      coins: 800,
      gems: 50,
      energy: 100,
      chestItemId: 'chest_golden',
    },
    isChapterMilestone: true,
  },
};

/**
 * Returns progression definition for a given level (or extrapolated if beyond level 10)
 */
export function getLevelProgression(level: number): LevelProgressionDef {
  if (LEVEL_PROGRESSION[level]) {
    return LEVEL_PROGRESSION[level];
  }

  // Graceful fallback / extrapolation for level 11+
  const xpRequired = Math.round(1400 * Math.pow(1.25, level - 10));
  return {
    level,
    xpRequired,
    cumulativeXp: 3700 + (level - 10) * 1400,
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
  return chains;
}

/**
 * Returns generator ID unlocked at a specific level (if any)
 */
export function getGeneratorUnlockedAtLevel(level: number): string | null {
  return LEVEL_PROGRESSION[level]?.unlocks?.generatorId || null;
}
