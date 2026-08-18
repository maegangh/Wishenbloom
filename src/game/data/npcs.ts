import { NPCDef, NPCOrder } from '../types';

export const NPCS: Record<string, NPCDef> = {
  elowen: {
    id: 'elowen',
    name: 'Elowen',
    role: 'Herbalist',
    title: 'Forest Guardian',
    avatar: 'elowen',
    bio: 'A gentle elf botanist who protects the whispering woods and tends to endangered magical flora.',
    color: '#10b981',
  },
  valerie: {
    id: 'valerie',
    name: 'Archmage Valerie',
    role: 'High Sorceress',
    title: 'Keeper of Tomes',
    avatar: 'valerie',
    bio: 'Master of the celestial observatory, seeking ancient grimoires to restore the realm’s protective wards.',
    color: '#8b5cf6',
  },
  balgor: {
    id: 'balgor',
    name: 'Balgor',
    role: 'Master Blacksmith',
    title: 'Forge Master',
    avatar: 'balgor',
    bio: 'A hearty dwarf who claims his forge fire was ignited by an ancient dragon spark.',
    color: '#f97316',
  },
  aurelia: {
    id: 'aurelia',
    name: 'Princess Aurelia',
    role: 'Royal Heir',
    title: 'The Realm Restorer',
    avatar: 'aurelia',
    bio: 'Dedicated to revitalizing Wishenbloom to its golden glory and rekindling the ancient Bloom in every village square.',
    color: '#eab308',
  },
  pip: {
    id: 'pip',
    name: 'Pip',
    role: 'Goblin Merchant',
    title: 'Curio Collector',
    avatar: 'pip',
    bio: 'An eccentric merchant obsessed with shiny trinkets, potion bottles, and rare monster eggs.',
    color: '#06b6d4',
  },
  sylas: {
    id: 'sylas',
    name: 'Sylas',
    role: 'Dragon Tamer',
    title: 'Highland Beastwarden',
    avatar: 'sylas',
    bio: 'Caretaker of the roosting cliffs who nurtures newborn magical drakes and gryphons.',
    color: '#ec4899',
  },
};

export const INITIAL_ORDERS: NPCOrder[] = [
  {
    id: 'order_1',
    npcId: 'elowen',
    npcName: 'Elowen',
    npcRole: 'Herbalist',
    npcAvatar: 'elowen',
    npcQuote: 'Greetings traveler! I need some fresh herbs to prepare a soothing tonic.',
    requirements: [
      { itemId: 'herb_2', count: 1 },
    ],
    rewards: {
      coins: 35,
      xp: 20,
      energy: 10,
    },
    isStoryOrder: true,
  },
  {
    id: 'order_2',
    npcId: 'valerie',
    npcName: 'Archmage Valerie',
    npcRole: 'High Sorceress',
    npcAvatar: 'valerie',
    npcQuote: 'The archives are in disarray. Please brew a Mana Potion for my scribes.',
    requirements: [
      { itemId: 'potion_2', count: 1 },
    ],
    rewards: {
      coins: 50,
      xp: 30,
      gems: 2,
    },
    isStoryOrder: false,
  },
  {
    id: 'order_3',
    npcId: 'pip',
    npcName: 'Pip',
    npcRole: 'Goblin Merchant',
    npcAvatar: 'pip',
    npcQuote: 'Got any shiny potion vials or herb bundles for my cart? Top coin paid!',
    requirements: [
      { itemId: 'herb_1', count: 1 },
      { itemId: 'potion_1', count: 1 },
    ],
    rewards: {
      coins: 45,
      xp: 25,
      energy: 15,
    },
    isStoryOrder: false,
  },
];

// Helper to generate dynamic orders scaled to player level
export function generateRandomOrder(level: number, existingOrderIds: string[]): NPCOrder {
  const npcKeys = Object.keys(NPCS);
  const selectedNpcKey = npcKeys[Math.floor(Math.random() * npcKeys.length)];
  const npc = NPCS[selectedNpcKey];

  // Available pools based on level
  const pools: { itemId: string; minTier: number; maxTier: number }[] = [
    { itemId: 'herb_', minTier: 1, maxTier: Math.min(6, Math.max(2, Math.floor(level * 0.8) + 1)) },
    { itemId: 'potion_', minTier: 1, maxTier: Math.min(6, Math.max(2, Math.floor(level * 0.8) + 1)) },
  ];

  if (level >= 3) {
    pools.push({ itemId: 'book_', minTier: 1, maxTier: Math.min(5, Math.floor(level * 0.7) + 1) });
  }
  if (level >= 4) {
    pools.push({ itemId: 'forge_', minTier: 1, maxTier: Math.min(5, Math.floor(level * 0.7) + 1) });
  }
  if (level >= 5) {
    pools.push({ itemId: 'creature_', minTier: 1, maxTier: Math.min(5, Math.floor(level * 0.6) + 1) });
  }

  const numRequirements = level >= 4 && Math.random() > 0.6 ? 2 : 1;
  const requirements: { itemId: string; count: number }[] = [];
  let totalTier = 0;

  for (let i = 0; i < numRequirements; i++) {
    const pool = pools[Math.floor(Math.random() * pools.length)];
    const tier = Math.floor(Math.random() * (pool.maxTier - pool.minTier + 1)) + pool.minTier;
    const reqItemId = `${pool.itemId}${tier}`;
    
    if (!requirements.some(r => r.itemId === reqItemId)) {
      requirements.push({ itemId: reqItemId, count: 1 });
      totalTier += tier;
    }
  }

  if (requirements.length === 0) {
    requirements.push({ itemId: 'herb_2', count: 1 });
    totalTier = 2;
  }

  // Calculate rewards scaled to tier
  const baseCoins = Math.round(Math.pow(2.2, totalTier) * 6 + totalTier * 10);
  const baseXP = Math.round(totalTier * 14 + 10);
  const bonusGems = totalTier >= 4 && Math.random() > 0.5 ? Math.floor(totalTier / 2) : undefined;
  const bonusEnergy = Math.random() > 0.4 ? 15 : undefined;
  const bonusChest = totalTier >= 5 && Math.random() > 0.7 ? 'chest_wooden' : undefined;

  const quotes = [
    `Our realm needs this urgently to keep the enchantment alive!`,
    `A royal commission for our finest craftsman. You'll be rewarded handsomely!`,
    `My studies will advance tenfold with these materials!`,
    `The kingdom thanks you for your dedication, hero!`,
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
