import { BoardItem, DailyTaskState } from '../types';
import { BALANCE } from './balance';

export interface DailyTaskTemplate {
  templateId: string;
  category: 'merge' | 'tap_generator' | 'spend_energy' | 'order' | 'special_order' | 'bubble' | 'generator_upgrade';
  type: DailyTaskState['type'];
  title: string;
  description: string;
  target: number;
  minPlayerLevel: number;
  rewards: {
    coins: number;
    xp?: number;
    gems?: number;
    energy?: number;
  };
}

/**
 * Universal & Capability-Gated Daily Task Pool.
 * Guaranteed safe generation based on player unlock tier.
 */
export const DAILY_TASK_TEMPLATES: DailyTaskTemplate[] = [
  // 1. Merge Tasks (Universal Level 1+)
  {
    templateId: 'merge_10',
    category: 'merge',
    type: 'merge',
    title: 'Bloom Crafter',
    description: 'Merge items on your board 10 times.',
    target: 10,
    minPlayerLevel: 1,
    rewards: {
      coins: 150,
      energy: 10,
    },
  },
  {
    templateId: 'merge_20',
    category: 'merge',
    type: 'merge',
    title: 'Master of Merging',
    description: 'Merge items on your board 20 times.',
    target: 20,
    minPlayerLevel: 1,
    rewards: {
      coins: 250,
      energy: 15,
    },
  },

  // 2. Generator Production Tasks (Universal Level 1+)
  {
    templateId: 'tap_gen_15',
    category: 'tap_generator',
    type: 'tap_generator',
    title: 'Harvest Time',
    description: 'Tap generators to produce 15 crafting items.',
    target: 15,
    minPlayerLevel: 1,
    rewards: {
      coins: 150,
      energy: 10,
    },
  },
  {
    templateId: 'tap_gen_25',
    category: 'tap_generator',
    type: 'tap_generator',
    title: 'Plentiful Harvest',
    description: 'Tap generators to produce 25 crafting items.',
    target: 25,
    minPlayerLevel: 2,
    rewards: {
      coins: 250,
      energy: 15,
    },
  },

  // 3. Energy Spending Tasks (Level 1+)
  {
    templateId: 'spend_energy_30',
    category: 'spend_energy',
    type: 'spend_energy',
    title: 'Energy Conductor',
    description: 'Spend 30 Bloom Energy on crafting actions.',
    target: 30,
    minPlayerLevel: 1,
    rewards: {
      coins: 200,
      gems: 1,
    },
  },
  {
    templateId: 'spend_energy_50',
    category: 'spend_energy',
    type: 'spend_energy',
    title: 'Surging Power',
    description: 'Spend 50 Bloom Energy on crafting actions.',
    target: 50,
    minPlayerLevel: 3,
    rewards: {
      coins: 250,
      gems: 2,
    },
  },

  // 4. Normal NPC Orders (Level 1+)
  {
    templateId: 'orders_2',
    category: 'order',
    type: 'fulfill_order',
    title: 'Town Benefactor',
    description: 'Complete 2 normal orders for realm citizens.',
    target: 2,
    minPlayerLevel: 1,
    rewards: {
      coins: 200,
      energy: 15,
    },
  },
  {
    templateId: 'orders_3',
    category: 'order',
    type: 'fulfill_order',
    title: 'Merchant Express',
    description: 'Complete 3 normal orders for realm citizens.',
    target: 3,
    minPlayerLevel: 2,
    rewards: {
      coins: 300,
      energy: 20,
    },
  },

  // 5. Timed Bubble Interaction (Level 2+)
  {
    templateId: 'pop_bubble_1',
    category: 'bubble',
    type: 'pop_bubble',
    title: 'Bubble Seeker',
    description: 'Claim or pop 1 bonus bubble on the board.',
    target: 1,
    minPlayerLevel: 2,
    rewards: {
      coins: 150,
      energy: 10,
    },
  },

  // 6. Royal Commission (Gated strictly to Level 15+)
  {
    templateId: 'royal_commission_1',
    category: 'special_order',
    type: 'fulfill_special_order',
    title: 'Crown Service',
    description: 'Complete 1 high-value Royal Commission.',
    target: 1,
    minPlayerLevel: BALANCE.SPECIAL_ORDER_UNLOCK_LEVEL || 15,
    rewards: {
      coins: 350,
      gems: 2,
    },
  },

  // 7. Generator Upgrade (Level 5+)
  {
    templateId: 'upgrade_generator_1',
    category: 'generator_upgrade',
    type: 'upgrade_generator',
    title: 'Workshop Enhancement',
    description: 'Upgrade any production generator to a higher tier.',
    target: 1,
    minPlayerLevel: 5,
    rewards: {
      coins: 250,
      energy: 20,
    },
  },
];

/**
 * Daily Completion Chest Reward.
 * Granted when all 3 daily tasks for the date have been completed.
 */
export const DAILY_COMPLETION_REWARD = {
  coins: 300,
  energy: 25,
  gems: 3,
  chestItemId: 'chest_wood_1',
};

/**
 * Deterministic pseudo-random helper based on dateKey string to ensure
 * consistency for a player if re-evaluated during the same UTC day.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates a safe, well-varied set of exactly 3 daily tasks tailored to the player's level.
 */
export function generateDailyTasksForDate(
  grid: (BoardItem | null)[][],
  inventory: (BoardItem | null)[],
  playerLevel: number,
  dateKey: string
): DailyTaskState[] {
  // 1. Filter templates by player level
  const eligibleTemplates = DAILY_TASK_TEMPLATES.filter((t) => {
    if (playerLevel < t.minPlayerLevel) return false;
    // Strict safety for Royal Commission
    if (t.type === 'fulfill_special_order' && playerLevel < BALANCE.SPECIAL_ORDER_UNLOCK_LEVEL) {
      return false;
    }
    return true;
  });

  // Group eligible templates by category for balanced selection
  const categories = ['merge', 'tap_generator', 'spend_energy', 'order', 'special_order', 'bubble'];
  const selectedTemplates: DailyTaskTemplate[] = [];
  const seed = hashString(`${dateKey}_lvl_${playerLevel}`);

  // Guarantee:
  // Slot 1: Action task (Merge or Tap Generator)
  const actionTemplates = eligibleTemplates.filter((t) => t.category === 'merge' || t.category === 'tap_generator');
  if (actionTemplates.length > 0) {
    const idx = (seed + 1) % actionTemplates.length;
    selectedTemplates.push(actionTemplates[idx]);
  }

  // Slot 2: Energy or Bubble task
  const utilityTemplates = eligibleTemplates.filter(
    (t) => (t.category === 'spend_energy' || t.category === 'bubble') && !selectedTemplates.some((s) => s.templateId === t.templateId)
  );
  if (utilityTemplates.length > 0) {
    const idx = (seed + 2) % utilityTemplates.length;
    selectedTemplates.push(utilityTemplates[idx]);
  }

  // Slot 3: Order task (Normal order or Royal Commission if level >= 15)
  const orderTemplates = eligibleTemplates.filter(
    (t) => (t.category === 'order' || t.category === 'special_order') && !selectedTemplates.some((s) => s.templateId === t.templateId)
  );
  if (orderTemplates.length > 0) {
    const idx = (seed + 3) % orderTemplates.length;
    selectedTemplates.push(orderTemplates[idx]);
  }

  // Fallback if fewer than 3 were selected: fill from any remaining eligible
  let remaining = eligibleTemplates.filter((t) => !selectedTemplates.some((s) => s.templateId === t.templateId));
  let fallbackIndex = 4;
  while (selectedTemplates.length < 3 && remaining.length > 0) {
    const pick = remaining[(seed + fallbackIndex) % remaining.length];
    selectedTemplates.push(pick);
    remaining = remaining.filter((t) => t.templateId !== pick.templateId);
    fallbackIndex++;
  }

  return selectedTemplates.map((t, index) => ({
    id: `daily_${dateKey}_task_${index + 1}`,
    templateId: t.templateId,
    title: t.title,
    description: t.description,
    type: t.type,
    target: t.target,
    current: 0,
    rewards: { ...t.rewards },
    isCompleted: false,
    isClaimed: false,
  }));
}
