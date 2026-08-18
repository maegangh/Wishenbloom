import { BoardItem, ItemDef } from '../types';
import { ITEMS } from '../data/items';
import { findNearestEmpty } from './boardLogic';

export interface MergeCheckResult {
  canMerge: boolean;
  isDustyMerge: boolean;
  nextItemId?: string;
  nextItemDef?: ItemDef;
  nextTier?: number;
  xpReward?: number;
  reason?: 'different_items' | 'generator' | 'locked' | 'max_tier' | 'invalid_state';
}

/**
 * Pure helper to test if two board items can be merged and what kind of merge it is.
 */
export function checkMergeValidity(
  sourceItem: BoardItem | null,
  targetItem: BoardItem | null
): MergeCheckResult {
  if (!sourceItem || !targetItem) {
    return { canMerge: false, isDustyMerge: false };
  }

  // Generators cannot be merged together
  if (sourceItem.isGenerator || targetItem.isGenerator) {
    return { canMerge: false, isDustyMerge: false, reason: 'generator' };
  }

  // Locked items cannot be merged at all
  if (sourceItem.tileState === 'locked' || targetItem.tileState === 'locked') {
    return { canMerge: false, isDustyMerge: false, reason: 'locked' };
  }

  // Bubble items cannot be merged directly
  if (sourceItem.tileState === 'bubble' || targetItem.tileState === 'bubble') {
    return { canMerge: false, isDustyMerge: false, reason: 'invalid_state' };
  }

  // Must be identical item IDs
  if (sourceItem.itemId !== targetItem.itemId) {
    return { canMerge: false, isDustyMerge: false, reason: 'different_items' };
  }

  const sourceDef = ITEMS[sourceItem.itemId];
  if (!sourceDef || !sourceDef.mergeResultId) {
    return { canMerge: false, isDustyMerge: false, reason: 'max_tier' };
  }

  const nextItemId = sourceDef.mergeResultId;
  const nextItemDef = ITEMS[nextItemId];
  const nextTier = nextItemDef ? nextItemDef.tier : sourceDef.tier + 1;

  // DUSTY MERGE: One of the items is dusty (usually target cell on board)
  if (targetItem.tileState === 'dusty' || sourceItem.tileState === 'dusty') {
    return {
      canMerge: true,
      isDustyMerge: true,
      nextItemId,
      nextItemDef,
      nextTier,
      xpReward: (sourceDef.xpValue || 2) * 2, // Double XP for clearing dusty tile!
    };
  }

  // NORMAL MERGE: Both items are in normal tile state
  if (
    (sourceItem.tileState === 'normal' || !sourceItem.tileState) &&
    (targetItem.tileState === 'normal' || !targetItem.tileState)
  ) {
    return {
      canMerge: true,
      isDustyMerge: false,
      nextItemId,
      nextItemDef,
      nextTier,
      xpReward: nextItemDef?.xpValue || nextTier * 3,
    };
  }

  return { canMerge: false, isDustyMerge: false, reason: 'invalid_state' };
}

/**
 * Creates a timed bubble item if merge qualifies.
 */
export function rollBubbleSpawn(nextTier: number, nextItemId: string, spawnChance = 0.18): BoardItem | null {
  if (nextTier >= 3 && Math.random() < spawnChance) {
    return {
      instanceId: `bubble_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      itemId: nextItemId,
      tileState: 'bubble',
      bubbleExpiresAt: Date.now() + 60000, // 60 seconds lifetime
      bubblePrice: Math.max(2, Math.floor(nextTier * 1.5)),
    };
  }
  return null;
}
