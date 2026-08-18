import { BoardItem } from '../types';
import { GRID_ROWS, GRID_COLS } from './boardLogic';

export const BUBBLE_DEFAULT_LIFETIME_MS = 60000; // 60 seconds

/**
 * Returns remaining seconds for a bubble item. 0 if expired or not a bubble.
 */
export function getBubbleRemainingSeconds(item: BoardItem | null, now = Date.now()): number {
  if (!item || item.tileState !== 'bubble' || !item.bubbleExpiresAt) {
    return 0;
  }
  return Math.max(0, Math.ceil((item.bubbleExpiresAt - now) / 1000));
}

/**
 * Checks and resolves all expired bubbles on the grid, converting them into coins.
 * Returns the modified grid and count of expired bubbles resolved.
 */
export function resolveExpiredBubbles(
  grid: (BoardItem | null)[][],
  now = Date.now()
): { grid: (BoardItem | null)[][]; expiredCount: number; hasChanged: boolean } {
  let hasChanged = false;
  let expiredCount = 0;

  const newGrid = grid.map((row) =>
    row.map((cell) => {
      if (
        cell &&
        cell.tileState === 'bubble' &&
        cell.bubbleExpiresAt &&
        cell.bubbleExpiresAt <= now
      ) {
        hasChanged = true;
        expiredCount++;
        return {
          instanceId: `coin_expired_${Date.now()}_${Math.random()}`,
          itemId: 'coin_item_1',
          tileState: 'normal' as const,
        };
      }
      return cell;
    })
  );

  return {
    grid: hasChanged ? newGrid : grid,
    expiredCount,
    hasChanged,
  };
}

/**
 * Validates whether a bubble can be purchased with gems.
 */
export function canPurchaseBubble(
  item: BoardItem | null,
  playerGems: number
): { canPurchase: boolean; price: number; reason?: string } {
  if (!item || item.tileState !== 'bubble') {
    return { canPurchase: false, price: 0, reason: 'not_a_bubble' };
  }
  const price = item.bubblePrice || 2;
  if (playerGems < price) {
    return { canPurchase: false, price, reason: 'insufficient_gems' };
  }
  return { canPurchase: true, price };
}
