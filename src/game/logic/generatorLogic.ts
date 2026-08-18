import { BoardItem, GeneratorDef } from '../types';
import { GENERATORS } from '../data/generators';

export interface GeneratorTapValidation {
  canTap: boolean;
  generatorDef?: GeneratorDef;
  reason?: 'not_a_generator' | 'missing_def' | 'insufficient_energy' | 'on_cooldown' | 'board_full';
  cooldownRemainingSeconds?: number;
}

export interface GeneratorUpgradeValidation {
  canUpgrade: boolean;
  currentDef?: GeneratorDef;
  nextDef?: GeneratorDef;
  upgradeCost?: number;
  isMaxLevel: boolean;
  reason?: 'not_a_generator' | 'missing_def' | 'max_level' | 'no_upgrade_path' | 'insufficient_coins';
}

/**
 * Checks remaining cooldown in seconds for a generator item.
 */
export function getGeneratorCooldownRemaining(item: BoardItem | null, now = Date.now()): number {
  if (!item || !item.cooldownUntil || item.cooldownUntil <= now) {
    return 0;
  }
  return Math.ceil((item.cooldownUntil - now) / 1000);
}

/**
 * Validates if a generator can be tapped.
 */
export function validateGeneratorTap(
  item: BoardItem | null,
  currentEnergy: number,
  now = Date.now()
): GeneratorTapValidation {
  if (!item || !item.isGenerator || !item.generatorId) {
    return { canTap: false, reason: 'not_a_generator' };
  }

  const generatorDef = GENERATORS[item.generatorId];
  if (!generatorDef) {
    return { canTap: false, reason: 'missing_def' };
  }

  // Check cooldown
  if (item.cooldownUntil && item.cooldownUntil > now) {
    const cooldownRemainingSeconds = Math.ceil((item.cooldownUntil - now) / 1000);
    return {
      canTap: false,
      generatorDef,
      reason: 'on_cooldown',
      cooldownRemainingSeconds,
    };
  }

  // Check energy
  if (currentEnergy < generatorDef.energyCost) {
    return {
      canTap: false,
      generatorDef,
      reason: 'insufficient_energy',
    };
  }

  return {
    canTap: true,
    generatorDef,
  };
}

/**
 * Rolls an item drop from a generator definition.
 */
export function rollGeneratorDrop(generatorDef: GeneratorDef): string {
  const totalWeight = generatorDef.drops.reduce((sum, d) => sum + d.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const drop of generatorDef.drops) {
    if (roll <= drop.weight) {
      return drop.itemId;
    }
    roll -= drop.weight;
  }

  return generatorDef.drops[0].itemId;
}

/**
 * Validates if a generator item can be upgraded to its next tier.
 */
export function validateGeneratorUpgrade(
  item: BoardItem | null,
  playerCoins: number
): GeneratorUpgradeValidation {
  if (!item || !item.isGenerator || !item.generatorId) {
    return { canUpgrade: false, isMaxLevel: false, reason: 'not_a_generator' };
  }

  const currentDef = GENERATORS[item.generatorId];
  if (!currentDef) {
    return { canUpgrade: false, isMaxLevel: false, reason: 'missing_def' };
  }

  if (currentDef.level >= currentDef.maxLevel || !currentDef.upgradeResultId) {
    return {
      canUpgrade: false,
      currentDef,
      isMaxLevel: true,
      reason: 'max_level',
    };
  }

  const nextDef = GENERATORS[currentDef.upgradeResultId];
  const upgradeCost = currentDef.upgradeCost || 0;

  if (playerCoins < upgradeCost) {
    return {
      canUpgrade: false,
      currentDef,
      nextDef,
      upgradeCost,
      isMaxLevel: false,
      reason: 'insufficient_coins',
    };
  }

  return {
    canUpgrade: true,
    currentDef,
    nextDef,
    upgradeCost,
    isMaxLevel: false,
  };
}
