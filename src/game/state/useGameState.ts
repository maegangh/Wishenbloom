import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  GameState,
  BoardItem,
  NPCOrder,
  Quest,
  KingdomArea,
  ItemDef,
} from '../types';
import { ITEMS } from '../data/items';
import { GENERATORS } from '../data/generators';
import { INITIAL_ORDERS, generateRandomOrder } from '../data/npcs';
import { INITIAL_KINGDOM_AREAS } from '../data/kingdom';
import { INITIAL_QUESTS } from '../data/quests';
import { audio } from '../audio/audioManager';

const STORAGE_KEY = 'mergevale_save_v1';
const GRID_ROWS = 9;
const GRID_COLS = 7;
const ENERGY_RECHARGE_SECONDS = 120; // 1 energy every 2 minutes

// Generate fresh default state
export function createInitialGameState(): GameState {
  const grid: (BoardItem | null)[][] = Array(GRID_ROWS)
    .fill(null)
    .map(() => Array(GRID_COLS).fill(null));

  // Place initial generators
  grid[0][0] = {
    instanceId: 'item_gen_garden',
    itemId: 'herb_1',
    isGenerator: true,
    generatorId: 'gen_garden_1',
    tileState: 'normal',
  };

  grid[0][1] = {
    instanceId: 'item_gen_alchemist',
    itemId: 'potion_1',
    isGenerator: true,
    generatorId: 'gen_alchemist_1',
    tileState: 'normal',
  };

  // Pre-place starter mergeable items for instant satisfying gameplay
  grid[2][2] = {
    instanceId: 'init_herb_1',
    itemId: 'herb_1',
    tileState: 'normal',
  };
  grid[2][3] = {
    instanceId: 'init_herb_2',
    itemId: 'herb_1',
    tileState: 'normal',
  };
  grid[3][2] = {
    instanceId: 'init_potion_1',
    itemId: 'potion_1',
    tileState: 'normal',
  };
  grid[3][3] = {
    instanceId: 'init_potion_2',
    itemId: 'potion_1',
    tileState: 'normal',
  };
  grid[4][4] = {
    instanceId: 'init_dusty_herb',
    itemId: 'herb_1',
    tileState: 'dusty',
  };
  grid[4][5] = {
    instanceId: 'init_chest_1',
    itemId: 'chest_wooden',
    tileState: 'normal',
  };

  return {
    level: 1,
    xp: 0,
    xpToNextLevel: 50,
    coins: 300,
    gems: 20,
    energy: 100,
    maxEnergy: 100,
    lastEnergyRechargeAt: Date.now(),

    grid,
    inventory: [null, null, null, null, null],
    maxInventorySlots: 5,

    activeOrders: INITIAL_ORDERS,
    activeQuests: INITIAL_QUESTS,
    kingdomAreas: INITIAL_KINGDOM_AREAS,

    discoveredItemIds: ['herb_1', 'potion_1', 'chest_wooden'],
    claimedDiscoveryRewardIds: [],

    tutorialStep: 0,
    isTutorialActive: true,

    settings: {
      soundEnabled: true,
      musicEnabled: false,
      hapticsEnabled: true,
      highContrast: false,
    },
    stats: {
      totalMerges: 0,
      totalOrdersCompleted: 0,
      totalCoinsEarned: 300,
      totalGemsEarned: 20,
      totalGeneratorsTapped: 0,
      kingdomAreasCompleted: 0,
    },
    lastSavedAt: Date.now(),
  };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: GameState = JSON.parse(saved);
        // Calculate offline energy recharge
        if (parsed.lastEnergyRechargeAt && parsed.energy < parsed.maxEnergy) {
          const now = Date.now();
          const elapsedSec = (now - parsed.lastEnergyRechargeAt) / 1000;
          const energyToAdd = Math.floor(elapsedSec / ENERGY_RECHARGE_SECONDS);
          if (energyToAdd > 0) {
            parsed.energy = Math.min(parsed.maxEnergy, parsed.energy + energyToAdd);
            parsed.lastEnergyRechargeAt = now - ((elapsedSec % ENERGY_RECHARGE_SECONDS) * 1000);
          }
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading save data:', e);
    }
    return createInitialGameState();
  });

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number; fromInventory?: boolean; inventoryIndex?: number } | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ level: number; rewards: { coins: number; gems: number; energy: number } } | null>(null);
  const [discoveryPopupItem, setDiscoveryPopupItem] = useState<ItemDef | null>(null);
  const [floatingText, setFloatingText] = useState<{ id: string; text: string; color: string; x: number; y: number }[]>([]);

  // Auto-save on meaningful state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastSavedAt: Date.now() }));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [state]);

  // Periodic energy regeneration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.energy >= prev.maxEnergy) {
          return { ...prev, lastEnergyRechargeAt: Date.now() };
        }
        const now = Date.now();
        const elapsedSec = (now - prev.lastEnergyRechargeAt) / 1000;
        if (elapsedSec >= ENERGY_RECHARGE_SECONDS) {
          const energyToAdd = Math.floor(elapsedSec / ENERGY_RECHARGE_SECONDS);
          return {
            ...prev,
            energy: Math.min(prev.maxEnergy, prev.energy + energyToAdd),
            lastEnergyRechargeAt: now,
          };
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Helper to add XP and check level up
  const grantXP = useCallback((xpGain: number) => {
    setState((prev) => {
      let newXp = prev.xp + xpGain;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNextLevel;
      let leveledUp = false;

      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel += 1;
        newXpToNext = Math.round(newXpToNext * 1.35 + 40);
        leveledUp = true;
      }

      if (leveledUp) {
        audio.playLevelUp();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        const rewards = {
          coins: newLevel * 100,
          gems: Math.floor(newLevel * 2.5) + 3,
          energy: prev.maxEnergy,
        };

        setLevelUpData({ level: newLevel, rewards });

        // If level unlocks new generator, spawn it if space available
        const newGrid = prev.grid.map((row) => [...row]);
        if (newLevel === 2 && !hasGenerator(newGrid, 'gen_wizard_1')) {
          spawnItemOnFirstEmpty(newGrid, {
            instanceId: `gen_wizard_${Date.now()}`,
            itemId: 'book_1',
            isGenerator: true,
            generatorId: 'gen_wizard_1',
            tileState: 'normal',
          });
        } else if (newLevel === 3 && !hasGenerator(newGrid, 'gen_forge_1')) {
          spawnItemOnFirstEmpty(newGrid, {
            instanceId: `gen_forge_${Date.now()}`,
            itemId: 'forge_1',
            isGenerator: true,
            generatorId: 'gen_forge_1',
            tileState: 'normal',
          });
        } else if (newLevel === 4 && !hasGenerator(newGrid, 'gen_nest_1')) {
          spawnItemOnFirstEmpty(newGrid, {
            instanceId: `gen_nest_${Date.now()}`,
            itemId: 'creature_1',
            isGenerator: true,
            generatorId: 'gen_nest_1',
            tileState: 'normal',
          });
        }

        return {
          ...prev,
          level: newLevel,
          xp: newXp,
          xpToNextLevel: newXpToNext,
          coins: prev.coins + rewards.coins,
          gems: prev.gems + rewards.gems,
          energy: prev.maxEnergy, // Full refill on level up!
          grid: newGrid,
        };
      }

      return {
        ...prev,
        xp: newXp,
      };
    });
  }, []);

  // Update Quest Progress helper
  const updateQuests = useCallback((type: Quest['type'], amount = 1) => {
    setState((prev) => {
      const updatedQuests = prev.activeQuests.map((q) => {
        if (q.type === type && !q.isCompleted) {
          const current = Math.min(q.target, q.current + amount);
          return {
            ...q,
            current,
            isCompleted: current >= q.target,
          };
        }
        return q;
      });
      return { ...prev, activeQuests: updatedQuests };
    });
  }, []);

  // Check and record item discovery
  const checkDiscovery = useCallback((itemId: string) => {
    setState((prev) => {
      if (!prev.discoveredItemIds.includes(itemId)) {
        const itemDef = ITEMS[itemId];
        if (itemDef) {
          audio.playDiscovery();
          setDiscoveryPopupItem(itemDef);
          updateQuests('discover_item', 1);
        }
        return {
          ...prev,
          discoveredItemIds: [...prev.discoveredItemIds, itemId],
        };
      }
      return prev;
    });
  }, [updateQuests]);

  // Find nearest empty cell to a coordinate
  const findNearestEmpty = (grid: (BoardItem | null)[][], centerRow: number, centerCol: number) => {
    let closestDist = Infinity;
    let target: { row: number; col: number } | null = null;

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (grid[r][c] === null) {
          const dist = Math.hypot(r - centerRow, c - centerCol);
          if (dist < closestDist) {
            closestDist = dist;
            target = { row: r, col: c };
          }
        }
      }
    }
    return target;
  };

  // Helper to spawn item
  function spawnItemOnFirstEmpty(grid: (BoardItem | null)[][], item: BoardItem) {
    const empty = findNearestEmpty(grid, 0, 0);
    if (empty) {
      grid[empty.row][empty.col] = item;
      return true;
    }
    return false;
  }

  function hasGenerator(grid: (BoardItem | null)[][], genId: string) {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (grid[r][c]?.generatorId === genId) return true;
      }
    }
    return false;
  }

  // 1. Tap Generator
  const tapGenerator = useCallback((row: number, col: number) => {
    const item = state.grid[row][col];
    if (!item || !item.isGenerator || !item.generatorId) return;

    const generator = GENERATORS[item.generatorId];
    if (!generator) return;

    if (state.energy < generator.energyCost) {
      audio.playTone(200, 'sawtooth', 0.15, 0.1);
      return;
    }

    const emptySpot = findNearestEmpty(state.grid, row, col);
    if (!emptySpot) {
      // Board full!
      audio.playTone(220, 'sawtooth', 0.2, 0.15);
      return;
    }

    // Roll drop table
    const totalWeight = generator.drops.reduce((sum, d) => sum + d.weight, 0);
    let roll = Math.random() * totalWeight;
    let chosenItemId = generator.drops[0].itemId;

    for (const drop of generator.drops) {
      if (roll <= drop.weight) {
        chosenItemId = drop.itemId;
        break;
      }
      roll -= drop.weight;
    }

    audio.playGeneratorTap();

    setState((prev) => {
      const newGrid = prev.grid.map((r) => [...r]);
      const newItem: BoardItem = {
        instanceId: `item_${Date.now()}_${Math.random()}`,
        itemId: chosenItemId,
        tileState: 'normal',
      };
      newGrid[emptySpot.row][emptySpot.col] = newItem;

      return {
        ...prev,
        energy: prev.energy - generator.energyCost,
        grid: newGrid,
        stats: {
          ...prev.stats,
          totalGeneratorsTapped: prev.stats.totalGeneratorsTapped + 1,
        },
      };
    });

    checkDiscovery(chosenItemId);
    updateQuests('tap_generator', 1);
    updateQuests('spend_energy', generator.energyCost);
  }, [state.grid, state.energy, checkDiscovery, updateQuests]);

  // 2. Move or Merge Item
  const moveOrMergeItem = useCallback((fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    if (fromRow === toRow && fromCol === toCol) return;

    const sourceItem = state.grid[fromRow][fromCol];
    if (!sourceItem) return;

    const targetItem = state.grid[toRow][toCol];

    // CASE 1: Target cell is empty -> Move item smoothly
    if (!targetItem) {
      setState((prev) => {
        const newGrid = prev.grid.map((r) => [...r]);
        newGrid[toRow][toCol] = sourceItem;
        newGrid[fromRow][fromCol] = null;
        return { ...prev, grid: newGrid };
      });
      setSelectedCell(null);
      return;
    }

    // CASE 2: Both items are identical and mergeable!
    const sourceDef = ITEMS[sourceItem.itemId];
    const targetDef = ITEMS[targetItem.itemId];

    const canMerge =
      !sourceItem.isGenerator &&
      !targetItem.isGenerator &&
      sourceItem.itemId === targetItem.itemId &&
      sourceDef?.mergeResultId &&
      sourceItem.tileState !== 'locked' &&
      targetItem.tileState !== 'locked';

    if (canMerge && sourceDef.mergeResultId) {
      const nextItemId = sourceDef.mergeResultId;
      const nextDef = ITEMS[nextItemId];
      const nextTier = nextDef ? nextDef.tier : sourceDef.tier + 1;

      audio.playMerge(nextTier);

      // Check for bubble spawn chance on tier 3+ merges (12% chance)
      let bubbleItemToSpawn: BoardItem | null = null;
      if (nextTier >= 3 && Math.random() < 0.18) {
        bubbleItemToSpawn = {
          instanceId: `bubble_${Date.now()}`,
          itemId: nextItemId,
          tileState: 'bubble',
          bubbleExpiresAt: Date.now() + 60000, // 60 seconds
          bubblePrice: Math.max(2, Math.floor(nextTier * 1.5)),
        };
      }

      setState((prev) => {
        const newGrid = prev.grid.map((r) => [...r]);

        // Place merged item
        newGrid[toRow][toCol] = {
          instanceId: `merged_${Date.now()}`,
          itemId: nextItemId,
          tileState: 'normal',
        };
        newGrid[fromRow][fromCol] = null;

        // If bubble spawned, find nearest open spot
        if (bubbleItemToSpawn) {
          const bubbleSpot = findNearestEmpty(newGrid, toRow, toCol);
          if (bubbleSpot) {
            newGrid[bubbleSpot.row][bubbleSpot.col] = bubbleItemToSpawn;
          }
        }

        return {
          ...prev,
          grid: newGrid,
          stats: {
            ...prev.stats,
            totalMerges: prev.stats.totalMerges + 1,
          },
        };
      });

      grantXP(nextDef?.xpValue || nextTier * 3);
      checkDiscovery(nextItemId);
      updateQuests('merge', 1);
      setSelectedCell(null);
      return;
    }

    // CASE 3: Dusty tile unlock (merging an item onto dusty duplicate)
    if (targetItem.tileState === 'dusty' && sourceItem.itemId === targetItem.itemId && sourceDef?.mergeResultId) {
      const nextItemId = sourceDef.mergeResultId;
      audio.playMerge(sourceDef.tier + 1);

      setState((prev) => {
        const newGrid = prev.grid.map((r) => [...r]);
        newGrid[toRow][toCol] = {
          instanceId: `merged_dusty_${Date.now()}`,
          itemId: nextItemId,
          tileState: 'normal',
        };
        newGrid[fromRow][fromCol] = null;
        return {
          ...prev,
          grid: newGrid,
          stats: { ...prev.stats, totalMerges: prev.stats.totalMerges + 1 },
        };
      });

      grantXP(sourceDef.xpValue * 2);
      checkDiscovery(nextItemId);
      updateQuests('merge', 1);
      setSelectedCell(null);
      return;
    }

    // CASE 4: Different items -> Swap their positions!
    setState((prev) => {
      const newGrid = prev.grid.map((r) => [...r]);
      newGrid[toRow][toCol] = sourceItem;
      newGrid[fromRow][fromCol] = targetItem;
      return { ...prev, grid: newGrid };
    });
    setSelectedCell(null);
  }, [state.grid, grantXP, checkDiscovery, updateQuests]);

  // 3. Sell Item
  const sellItem = useCallback((row: number, col: number) => {
    const item = state.grid[row][col];
    if (!item || item.isGenerator) return;

    const itemDef = ITEMS[item.itemId];
    const sellValue = itemDef?.sellValue || 1;

    audio.playCoin();

    setState((prev) => {
      const newGrid = prev.grid.map((r) => [...r]);
      newGrid[row][col] = null;
      return {
        ...prev,
        coins: prev.coins + sellValue,
        grid: newGrid,
        stats: {
          ...prev.stats,
          totalCoinsEarned: prev.stats.totalCoinsEarned + sellValue,
        },
      };
    });

    setSelectedCell(null);
  }, [state.grid]);

  // 4. Use Consumable (Energy, Coins, Gems, Chest)
  const useConsumable = useCallback((row: number, col: number) => {
    const item = state.grid[row][col];
    if (!item) return;

    const def = ITEMS[item.itemId];
    if (!def || !def.isConsumable) return;

    if (def.consumableType === 'energy' && def.consumableValue) {
      audio.playEnergy();
      setState((prev) => {
        const newGrid = prev.grid.map((r) => [...r]);
        newGrid[row][col] = null;
        return {
          ...prev,
          energy: Math.min(prev.maxEnergy * 2, prev.energy + (def.consumableValue || 10)),
          grid: newGrid,
        };
      });
    } else if (def.consumableType === 'gems' && def.consumableValue) {
      audio.playGem();
      setState((prev) => {
        const newGrid = prev.grid.map((r) => [...r]);
        newGrid[row][col] = null;
        return {
          ...prev,
          gems: prev.gems + (def.consumableValue || 2),
          grid: newGrid,
        };
      });
    } else if (def.consumableType === 'chest') {
      audio.playChestOpen();
      // Spawn 3-4 items onto adjacent empty tiles
      const tier = def.chestTier || 'wooden';
      const rewards: BoardItem[] = [];

      if (tier === 'wooden') {
        rewards.push({ instanceId: `chest_r1_${Date.now()}`, itemId: 'energy_1', tileState: 'normal' });
        rewards.push({ instanceId: `chest_r2_${Date.now()}`, itemId: 'herb_2', tileState: 'normal' });
        rewards.push({ instanceId: `chest_r3_${Date.now()}`, itemId: 'coin_item_2', tileState: 'normal' });
      } else if (tier === 'silver') {
        rewards.push({ instanceId: `chest_r1_${Date.now()}`, itemId: 'energy_2', tileState: 'normal' });
        rewards.push({ instanceId: `chest_r2_${Date.now()}`, itemId: 'gem_1', tileState: 'normal' });
        rewards.push({ instanceId: `chest_r3_${Date.now()}`, itemId: 'potion_3', tileState: 'normal' });
      } else {
        rewards.push({ instanceId: `chest_r1_${Date.now()}`, itemId: 'energy_3', tileState: 'normal' });
        rewards.push({ instanceId: `chest_r2_${Date.now()}`, itemId: 'gem_2', tileState: 'normal' });
        rewards.push({ instanceId: `chest_r3_${Date.now()}`, itemId: 'herb_4', tileState: 'normal' });
        rewards.push({ instanceId: `chest_r4_${Date.now()}`, itemId: 'book_3', tileState: 'normal' });
      }

      setState((prev) => {
        const newGrid = prev.grid.map((r) => [...r]);
        newGrid[row][col] = null; // remove chest

        // Place rewards
        rewards.forEach((r) => {
          const empty = findNearestEmpty(newGrid, row, col);
          if (empty) {
            newGrid[empty.row][empty.col] = r;
          }
        });

        return { ...prev, grid: newGrid };
      });
    }

    setSelectedCell(null);
  }, [state.grid]);

  // 5. Pop Bubble Item
  const popBubble = useCallback((row: number, col: number, withGems = false) => {
    const item = state.grid[row][col];
    if (!item || item.tileState !== 'bubble') return;

    if (withGems) {
      const price = item.bubblePrice || 2;
      if (state.gems < price) {
        audio.playTone(200, 'sawtooth', 0.15, 0.1);
        return;
      }
      audio.playGem();
      setState((prev) => {
        const newGrid = prev.grid.map((r) => [...r]);
        newGrid[row][col] = {
          ...item,
          tileState: 'normal',
          bubbleExpiresAt: undefined,
          bubblePrice: undefined,
        };
        return {
          ...prev,
          gems: prev.gems - price,
          grid: newGrid,
        };
      });
    } else {
      // Free pop to coin
      audio.playBubblePop();
      setState((prev) => {
        const newGrid = prev.grid.map((r) => [...r]);
        newGrid[row][col] = {
          instanceId: `coin_${Date.now()}`,
          itemId: 'coin_item_1',
          tileState: 'normal',
        };
        return { ...prev, grid: newGrid };
      });
    }
    setSelectedCell(null);
  }, [state.grid, state.gems]);

  // 6. Inventory management
  const storeInInventory = useCallback((row: number, col: number) => {
    const item = state.grid[row][col];
    if (!item) return;

    const firstFreeSlot = state.inventory.findIndex((slot) => slot === null);
    if (firstFreeSlot === -1) {
      audio.playTone(220, 'sawtooth', 0.2, 0.1);
      return;
    }

    audio.playButtonClick();

    setState((prev) => {
      const newGrid = prev.grid.map((r) => [...r]);
      newGrid[row][col] = null;
      const newInventory = [...prev.inventory];
      newInventory[firstFreeSlot] = item;
      return { ...prev, grid: newGrid, inventory: newInventory };
    });

    setSelectedCell(null);
  }, [state.grid, state.inventory]);

  const retrieveFromInventory = useCallback((slotIndex: number, targetRow?: number, targetCol?: number) => {
    const item = state.inventory[slotIndex];
    if (!item) return;

    let destination: { row: number; col: number } | null = null;

    if (targetRow !== undefined && targetCol !== undefined && state.grid[targetRow][targetCol] === null) {
      destination = { row: targetRow, col: targetCol };
    } else {
      destination = findNearestEmpty(state.grid, 0, 0);
    }

    if (!destination) {
      audio.playTone(220, 'sawtooth', 0.2, 0.1);
      return;
    }

    audio.playButtonClick();

    setState((prev) => {
      const newGrid = prev.grid.map((r) => [...r]);
      newGrid[destination!.row][destination!.col] = item;
      const newInventory = [...prev.inventory];
      newInventory[slotIndex] = null;
      return { ...prev, grid: newGrid, inventory: newInventory };
    });

    setSelectedCell(null);
  }, [state.grid, state.inventory]);

  // 7. Check if order can be fulfilled
  const checkOrderAvailable = useCallback((order: NPCOrder) => {
    const boardItemCounts: Record<string, number> = {};
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const item = state.grid[r][c];
        if (item && item.tileState === 'normal' && !item.isGenerator) {
          boardItemCounts[item.itemId] = (boardItemCounts[item.itemId] || 0) + 1;
        }
      }
    }

    return order.requirements.every((req) => (boardItemCounts[req.itemId] || 0) >= req.count);
  }, [state.grid]);

  // 8. Fulfill Order
  const fulfillOrder = useCallback((orderId: string) => {
    const order = state.activeOrders.find((o) => o.id === orderId);
    if (!order) return;

    if (!checkOrderAvailable(order)) return;

    audio.playOrderComplete();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.3 },
    });

    // Remove required items from board
    setState((prev) => {
      const newGrid = prev.grid.map((r) => [...r]);
      const reqRemaining = { ...order.requirements.reduce((acc, r) => ({ ...acc, [r.itemId]: r.count }), {} as Record<string, number>) };

      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const cell = newGrid[r][c];
          if (cell && reqRemaining[cell.itemId] && reqRemaining[cell.itemId] > 0 && cell.tileState === 'normal') {
            newGrid[r][c] = null;
            reqRemaining[cell.itemId]--;
          }
        }
      }

      // Generate replacement order
      const remainingOrders = prev.activeOrders.filter((o) => o.id !== orderId);
      const newOrder = generateRandomOrder(prev.level, remainingOrders.map((o) => o.id));

      // If order had bonus chest reward, spawn it!
      if (order.rewards.chestId) {
        const empty = findNearestEmpty(newGrid, 4, 3);
        if (empty) {
          newGrid[empty.row][empty.col] = {
            instanceId: `order_chest_${Date.now()}`,
            itemId: order.rewards.chestId,
            tileState: 'normal',
          };
        }
      }

      return {
        ...prev,
        coins: prev.coins + order.rewards.coins,
        gems: prev.gems + (order.rewards.gems || 0),
        energy: Math.min(prev.maxEnergy, prev.energy + (order.rewards.energy || 0)),
        grid: newGrid,
        activeOrders: [...remainingOrders, newOrder],
        stats: {
          ...prev.stats,
          totalOrdersCompleted: prev.stats.totalOrdersCompleted + 1,
          totalCoinsEarned: prev.stats.totalCoinsEarned + order.rewards.coins,
          totalGemsEarned: prev.stats.totalGemsEarned + (order.rewards.gems || 0),
        },
      };
    });

    grantXP(order.rewards.xp);
    updateQuests('fulfill_order', 1);
  }, [state.activeOrders, checkOrderAvailable, grantXP, updateQuests]);

  // 9. Restore Kingdom Stage
  const restoreKingdomStage = useCallback((areaId: string) => {
    const area = state.kingdomAreas.find((a) => a.id === areaId);
    if (!area) return;

    const nextStageIndex = area.currentStage;
    if (nextStageIndex >= area.maxStages) return;

    const stage = area.stages[nextStageIndex];
    if (!stage || state.coins < stage.costCoins) {
      audio.playTone(200, 'sawtooth', 0.15, 0.1);
      return;
    }

    audio.playChestOpen();
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.5 },
    });

    setState((prev) => {
      const updatedAreas = prev.kingdomAreas.map((a) => {
        if (a.id === areaId) {
          return {
            ...a,
            currentStage: a.currentStage + 1,
          };
        }
        return a;
      });

      return {
        ...prev,
        coins: prev.coins - stage.costCoins,
        kingdomAreas: updatedAreas,
        stats: {
          ...prev.stats,
          kingdomAreasCompleted: prev.stats.kingdomAreasCompleted + 1,
        },
      };
    });

    grantXP(stage.rewardXp);
    updateQuests('restore_kingdom', 1);
  }, [state.kingdomAreas, state.coins, grantXP, updateQuests]);

  // 10. Claim Quest Rewards
  const claimQuest = useCallback((questId: string) => {
    const quest = state.activeQuests.find((q) => q.id === questId);
    if (!quest || !quest.isCompleted || quest.isClaimed) return;

    audio.playOrderComplete();
    confetti({ particleCount: 40, spread: 60 });

    setState((prev) => {
      const updatedQuests = prev.activeQuests.map((q) => {
        if (q.id === questId) {
          return { ...q, isClaimed: true };
        }
        return q;
      });

      return {
        ...prev,
        coins: prev.coins + quest.rewards.coins,
        gems: prev.gems + (quest.rewards.gems || 0),
        energy: Math.min(prev.maxEnergy, prev.energy + (quest.rewards.energy || 0)),
        activeQuests: updatedQuests,
      };
    });

    grantXP(quest.rewards.xp);
  }, [state.activeQuests, grantXP]);

  // 11. Claim Discovery Reward
  const claimDiscoveryReward = useCallback((itemId: string) => {
    if (state.claimedDiscoveryRewardIds.includes(itemId)) return;

    const itemDef = ITEMS[itemId];
    if (!itemDef) return;

    const gemReward = Math.max(1, Math.floor(itemDef.tier / 2));
    audio.playGem();

    setState((prev) => ({
      ...prev,
      gems: prev.gems + gemReward,
      claimedDiscoveryRewardIds: [...prev.claimedDiscoveryRewardIds, itemId],
    }));
  }, [state.claimedDiscoveryRewardIds]);

  // 12. Dev / Cheat Actions
  const devAddCoins = (amt = 500) => setState((p) => ({ ...p, coins: p.coins + amt }));
  const devAddGems = (amt = 50) => setState((p) => ({ ...p, gems: p.gems + amt }));
  const devRefillEnergy = () => setState((p) => ({ ...p, energy: p.maxEnergy }));
  const devAddXP = (amt = 100) => grantXP(amt);
  const devSpawnItem = (itemId: string) => {
    setState((prev) => {
      const newGrid = prev.grid.map((r) => [...r]);
      spawnItemOnFirstEmpty(newGrid, {
        instanceId: `dev_${Date.now()}`,
        itemId,
        tileState: 'normal',
      });
      return { ...prev, grid: newGrid };
    });
    checkDiscovery(itemId);
  };
  const devClearBoard = () => {
    setState((prev) => {
      const newGrid = prev.grid.map((r) => r.map((cell) => (cell?.isGenerator ? cell : null)));
      return { ...prev, grid: newGrid };
    });
  };
  const devResetSave = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(createInitialGameState());
    setSelectedCell(null);
  };

  return {
    state,
    selectedCell,
    setSelectedCell,
    levelUpData,
    setLevelUpData,
    discoveryPopupItem,
    setDiscoveryPopupItem,
    floatingText,
    setFloatingText,
    tapGenerator,
    moveOrMergeItem,
    sellItem,
    useConsumable,
    popBubble,
    storeInInventory,
    retrieveFromInventory,
    checkOrderAvailable,
    fulfillOrder,
    restoreKingdomStage,
    claimQuest,
    claimDiscoveryReward,
    grantXP,
    // Dev helpers
    devAddCoins,
    devAddGems,
    devRefillEnergy,
    devAddXP,
    devSpawnItem,
    devClearBoard,
    devResetSave,
  };
}
