import { BoardItem } from '../types';

export const GRID_ROWS = 9;
export const GRID_COLS = 7;

/**
 * Finds the nearest empty cell relative to a center coordinate.
 */
export function findNearestEmpty(
  grid: (BoardItem | null)[][],
  centerRow = 0,
  centerCol = 0
): { row: number; col: number } | null {
  let closestDist = Infinity;
  let target: { row: number; col: number } | null = null;

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (grid[r] && grid[r][c] === null) {
        const dist = Math.hypot(r - centerRow, c - centerCol);
        if (dist < closestDist) {
          closestDist = dist;
          target = { row: r, col: c };
        }
      }
    }
  }
  return target;
}

/**
 * Spawns an item on the first available empty tile closest to top-left.
 */
export function spawnItemOnFirstEmpty(
  grid: (BoardItem | null)[][],
  item: BoardItem
): boolean {
  const empty = findNearestEmpty(grid, 0, 0);
  if (empty) {
    grid[empty.row][empty.col] = item;
    return true;
  }
  return false;
}

/**
 * Checks if a specific generator instance ID or generatorId exists on the grid.
 */
export function hasGenerator(
  grid: (BoardItem | null)[][],
  generatorId: string
): boolean {
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (grid[r]?.[c]?.generatorId === generatorId) {
        return true;
      }
    }
  }
  return false;
}
