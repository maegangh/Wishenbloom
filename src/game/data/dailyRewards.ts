import { DailyRewardDayDef } from '../types';

/**
 * 7-Day Persistent Daily Reward Cycle Definition.
 * 
 * Modest, balanced rewards designed for cozy return motivation without inflating the economy.
 * Missed days do NOT reset cycle progress.
 * After Day 7, the cycle smoothly restarts at Day 1.
 */
export const DAILY_REWARDS_CYCLE: DailyRewardDayDef[] = [
  {
    day: 1,
    title: 'Day 1: Coin Pouch & Energy',
    description: 'A starter cache of Realm Coins and Energy to support your crafting.',
    rewards: {
      coins: 200,
      energy: 25,
    },
    icon: '🪙',
  },
  {
    day: 2,
    title: 'Day 2: Bloom Energy',
    description: 'A surge of primal Bloom Energy for generator tapping.',
    rewards: {
      energy: 35,
    },
    icon: '⚡',
  },
  {
    day: 3,
    title: 'Day 3: Coin Cache',
    description: 'Restoration funds for province repairs and kingdom expansion.',
    rewards: {
      coins: 350,
    },
    icon: '🪙',
  },
  {
    day: 4,
    title: 'Day 4: Arcane Gems',
    description: 'Pure glowing Arcane Gems for bubble unlocks and energy.',
    rewards: {
      gems: 5,
    },
    icon: '💎',
  },
  {
    day: 5,
    title: 'Day 5: Energy Vessel',
    description: 'A substantial infusion of 50 Bloom Energy.',
    rewards: {
      energy: 50,
    },
    icon: '⚡',
  },
  {
    day: 6,
    title: 'Day 6: Royal Treasury',
    description: 'A generous grant of 500 Realm Coins.',
    rewards: {
      coins: 500,
    },
    icon: '🪙',
  },
  {
    day: 7,
    title: 'Day 7: Royal Chest & Gems',
    description: 'A magnificent Royal Chest filled with treasures plus 10 Arcane Gems!',
    rewards: {
      gems: 10,
      chestItemId: 'chest_royal_3',
    },
    icon: '👑',
  },
];

/**
 * Formats a timestamp into a UTC date key: 'YYYY-MM-DD'.
 */
export function getUtcDateKey(timestamp: number = Date.now()): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks whether the player is eligible to claim today's Daily Reward.
 * A reward is claimable if no claim has been recorded for the current UTC calendar day.
 */
export function isDailyRewardClaimable(
  lastClaimDate: string | null,
  now: number = Date.now()
): boolean {
  if (!lastClaimDate) return true;
  const todayUtc = getUtcDateKey(now);
  return lastClaimDate !== todayUtc;
}

/**
 * Computes the next reward cycle day (1 through 7, wrapping after 7).
 */
export function getNextDailyRewardCycleDay(currentCycleDay: number): number {
  if (currentCycleDay < 1 || currentCycleDay >= 7) {
    return 1;
  }
  return currentCycleDay + 1;
}

/**
 * Returns the definition for a given cycle day (1-7).
 */
export function getDailyRewardForDay(day: number): DailyRewardDayDef {
  const safeDay = ((Math.max(1, Math.floor(day)) - 1) % 7) + 1;
  return DAILY_REWARDS_CYCLE[safeDay - 1];
}
