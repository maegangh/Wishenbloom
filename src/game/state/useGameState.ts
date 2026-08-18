import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  GameState,
  BoardItem,
  NPCOrder,
  Quest,
  ItemDef,
} from '../types';
import { ITEMS } from '../data/items';
import { GENERATORS } from '../data/generators';
import { audio } from '../audio/audioManager';
import {
  GRID_ROWS,
  GRID_COLS,
  findNearestEmpty,
  spawnItemOnFirstEmpty,
  hasGenerator,
} from '../logic/boardLogic';
import {
  checkMergeValidity,
  rollBubbleSpawn,
} from '../logic/mergeLogic';
import {
  resolveExpiredBubbles,
  canPurchaseBubble,
} from '../logic/bubbleLogic';
import {
  validateGeneratorTap,
  rollGeneratorDrop,
  validateGeneratorUpgrade,
} from '../logic/generatorLogic';
import {
  generateSafeRandomOrder,
  isOrderFulfillable,
} from '../logic/orderLogic';
import {
  PRIMARY_STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  hydrateAndMigrateSave,
  ENERGY_RECHARGE_SECONDS,
} from '../logic/saveMigration';

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    try {
      const primary = localStorage.getItem(PRIMARY_STORAGE_KEY);
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      const { state: hydrated, isMigratedFromLegacy } = hydrateAndMigrateSave(primary, legacy);
      
      if (isMigratedFromLegacy) {
        // One-time save conversion from legacy to primary key
        localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(hydrated));
      }
      return hydrated;
    } catch (e) {
      console.error('Error during initial save load:', e);
      const { state: fallback } = hydrateAndMigrateSave(null, null);
      return fallback;
    }
  });

  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
    fromInventory?: boolean;
    inventoryIndex?: number;
  } | null>(null);

  const [levelUpData, setLevelUpData] = useState<{
    level: number;
    rewards: { coins: number; gems: number; energy: number };
  } | null>(null);

  const [discoveryPopupItem, setDiscoveryPopupItem] = useState<ItemDef | null>(null);
  const [floatingText, setFloatingText] = useState<{ id: string; text: string; color: string; x: number; y: number }[]>([]);

  // Keep state ref for intervals
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Auto-save on meaningful state changes
  useEffect(() => {
    try {
      localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify({ ...state, lastSavedAt: Date.now() }));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [state]);

  // 1-Second Centralized Ticker for:
  // - Real-time energy recharge
  // - Timed bubble countdown and auto-expiration
  useEffect(() => {
    const ticker = setInterval(() => {
      const now = Date.now();
      const current = stateRef.current;

      // 1. Check Bubble Expiration
      const bubbleResult = resolveExpiredBubbles(current.grid, now);
      let updatedGrid = bubbleResult.grid;
      let gridChanged = bubbleResult.hasChanged;

      // 2. Check Energy Recharge
      let newEnergy = current.energy;
      let newLastEnergyRechargeAt = current.lastEnergyRechargeAt;
      let energyChanged = false;

      if (current.energy < current.maxEnergy && current.lastEnergyRechargeAt) {
        const elapsedSec = (now - current.lastEnergyRechargeAt) / 1000;
        if (elapsedSec >= ENERGY_RECHARGE_SECONDS) {
          const energyToAdd = Math.floor(elapsedSec / ENERGY_RECHARGE_SECONDS);
          newEnergy = Math.min(current.maxEnergy, current.energy + energyToAdd);
          newLastEnergyRechargeAt = now - ((elapsedSec % ENERGY_RECHARGE_SECONDS) * 1000);
          energyChanged = true;
        }
      }

      if (gridChanged || energyChanged) {
        setState((prev) => ({
          ...prev,
          grid: gridChanged ? updatedGrid : prev.grid,
          energy: energyChanged ? newEnergy : prev.energy,
          lastEnergyRechargeAt: energyChanged ? newLastEnergyRechargeAt : prev.lastEnergyRechargeAt,
        }));
      }
    }, 1000);

    return () => clearInterval(ticker);
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

  // Advance Tutorial Action-driven Helper
  const advanceTutorial = useCallback((targetStep?: number) => {
    setState((prev) => {
      if (!prev.isTutorialActive) return prev;
      const nextStep = targetStep !== undefined ? targetStep : prev.tutorialStep + 1;
      return {
        ...prev,
        tutorialStep: nextStep,
        isTutorialActive: nextStep < 5,
      };
    });
  }, []);

  const dismissTutorial = useCallback(() => {
    setState((prev) => ({ ...prev, isTutorialActive: false }));
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

  // 1. Tap Generator (with Cooldown Support & Energy Validation)
  const tapGenerator = useCallback((row: number, col: number) => {
    const item = state.grid[row]?.[col];
    if (!item) return;

    const validation = validateGeneratorTap(item, state.energy);
    if (!validation.canTap) {
      if (validation.reason === 'on_cooldown' || validation.reason === 'insufficient_energy') {
        audio.playTone(200, 'sawtooth', 0.15, 0.1);
      }
      return;
    }

    const generator = validation.generatorDef!;
    const emptySpot = findNearestEmpty(state.grid, row, col);
    if (!emptySpot) {
      // Board full!
      audio.playTone(220, 'sawtooth', 0.2, 0.15);
      return;
    }

    const chosenItemId = rollGeneratorDrop(generator);
    audio.playGeneratorTap();

    setState((prev) => {
      const newGrid = prev.grid.map((r) => [...r]);
      const now = Date.now();

      // Update tapped generator cooldown if configured
      if (generator.cooldownMs > 0) {
        newGrid[row][col] = {
          ...item,
          cooldownUntil: now + generator.cooldownMs,
          lastTappedAt: now,
        };
      }

      // Place spawned item
      const newItem: BoardItem = {
        instanceId: `item_${now}_${Math.random()}`,
        itemId: chosenItemId,
        tileState: 'normal',
      };
      newGrid[emptySpot.row][emptySpot.col] = newItem;

      // Tutorial progression check (Step 0 or 1)
      let nextTutorialStep = prev.tutorialStep;
      if (prev.isTutorialActive) {
        if (prev.tutorialStep === 0) nextTutorialStep = 1;
        else if (prev.tutorialStep === 1) nextTutorialStep = 2;
      }

      return {
        ...prev,
        energy: prev.energy - generator.energyCost,
        grid: newGrid,
        tutorialStep: nextTutorialStep,
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

  // 2. Upgrade Generator
  const upgradeGenerator = useCallback((row: number, col: number) => {
    const item = state.grid[row]?.[col];
    if (!item) return;

    const validation = validateGeneratorUpgrade(item, state.coins);
    if (!validation.canUpgrade || !validation.nextDef) {
      audio.playTone(200, 'sawtooth', 0.15, 0.1);
      return;
    }

    const nextDef = validation.nextDef;
    const cost = validation.upgradeCost || 0;

    audio.playLevelUp();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 },
    });

    setState((prev) => {
      const newGrid = prev.grid.map((r) => [...r]);
      newGrid[row][col] = {
        ...item,
        generatorId: nextDef.id,
      };

      return {
        ...prev,
        coins: prev.coins - cost,
        grid: newGrid,
      };
    });

    grantXP(nextDef.level * 20);
    setSelectedCell(null);
  }, [state.grid, state.coins, grantXP]);

  // 3. Move or Merge Item (FIXED Dusty Tile Ordering)
  const moveOrMergeItem = useCallback((fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    if (fromRow === toRow && fromCol === toCol) return;

    const sourceItem = state.grid[fromRow]?.[fromCol];
    if (!sourceItem) return;

    const targetItem = state.grid[toRow]?.[toCol];

    // CASE 1: Move item to empty tile
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

    // CASE 2: Merge validation check
    const mergeCheck = checkMergeValidity(sourceItem, targetItem);

    if (mergeCheck.canMerge && mergeCheck.nextItemId) {
      const nextItemId = mergeCheck.nextItemId;
      const nextTier = mergeCheck.nextTier || 2;
      const xpGained = mergeCheck.xpReward || 5;

      audio.playMerge(nextTier);

      // Roll bubble spawn chance on normal merges of tier 3+
      const bubbleItem = !mergeCheck.isDustyMerge ? rollBubbleSpawn(nextTier, nextItemId) : null;

      setState((prev) => {
        const newGrid = prev.grid.map((r) => [...r]);

        // Place merged item on target tile
        newGrid[toRow][toCol] = {
          instanceId: `merged_${Date.now()}`,
          itemId: nextItemId,
          tileState: 'normal',
        };
        newGrid[fromRow][fromCol] = null;

        // Spawn bubble if triggered
        if (bubbleItem) {
          const bubbleSpot = findNearestEmpty(newGrid, toRow, toCol);
          if (bubbleSpot) {
            newGrid[bubbleSpot.row][bubbleSpot.col] = bubbleItem;
          }
        }

        // Action-driven tutorial advance on merge
        let nextTutorialStep = prev.tutorialStep;
        if (prev.isTutorialActive && prev.tutorialStep === 2) {
          nextTutorialStep = 3;
        }

        return {
          ...prev,
          grid: newGrid,
          tutorialStep: nextTutorialStep,
          stats: {
            ...prev.stats,
            totalMerges: prev.stats.totalMerges + 1,
          },
        };
      });

      grantXP(xpGained);
      checkDiscovery(nextItemId);
      updateQuests('merge', 1);
      setSelectedCell(null);
      return;
    }

    // CASE 3: Items cannot merge -> Swap positions if neither is locked
    if (sourceItem.tileState !== 'locked' && targetItem.tileState !== 'locked') {
      setState((prev) => {
        const newGrid = prev.grid.map((r) => [...r]);
        newGrid[toRow][toCol] = sourceItem;
        newGrid[fromRow][fromCol] = targetItem;
        return { ...prev, grid: newGrid };
      });
    }

    setSelectedCell(null);
  }, [state.grid, grantXP, checkDiscovery, updateQuests]);

  // 4. Sell Item
  const sellItem = useCallback((row: number, col: number) => {
    const item = state.grid[row]?.[col];
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

  // 5. Use Consumable (Energy, Gems, Chest)
  const useConsumable = useCallback((row: number, col: number) => {
    const item = state.grid[row]?.[col];
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
        newGrid[row][col] = null;

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

  // 6. Pop or Purchase Bubble Item
  const popBubble = useCallback((row: number, col: number, withGems = false) => {
    const item = state.grid[row]?.[col];
    if (!item || item.tileState !== 'bubble') return;

    if (withGems) {
      const validation = canPurchaseBubble(item, state.gems);
      if (!validation.canPurchase) {
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
          gems: prev.gems - validation.price,
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

  // 7. Inventory Storage Tray
  const storeInInventory = useCallback((row: number, col: number) => {
    const item = state.grid[row]?.[col];
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

    if (targetRow !== undefined && targetCol !== undefined && state.grid[targetRow]?.[targetCol] === null) {
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

  // 8. Check if order can be fulfilled
  const checkOrderAvailable = useCallback((order: NPCOrder) => {
    return isOrderFulfillable(order, state.grid);
  }, [state.grid]);

  // 9. Fulfill Order (with safe random replacement order generation)
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

    setState((prev) => {
      const newGrid = prev.grid.map((r) => [...r]);
      const reqRemaining = {
        ...order.requirements.reduce((acc, r) => ({ ...acc, [r.itemId]: r.count }), {} as Record<string, number>),
      };

      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const cell = newGrid[r][c];
          if (cell && reqRemaining[cell.itemId] && reqRemaining[cell.itemId] > 0 && cell.tileState === 'normal') {
            newGrid[r][c] = null;
            reqRemaining[cell.itemId]--;
          }
        }
      }

      // Generate replacement order using safe producible chains
      const remainingOrders = prev.activeOrders.filter((o) => o.id !== orderId);
      const newOrder = generateSafeRandomOrder(
        newGrid,
        prev.inventory,
        prev.level,
        remainingOrders.map((o) => o.id)
      );

      // Spawn bonus chest if rewarded
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

      // Action-driven tutorial advance on order completion (Step 3 -> Step 4)
      let nextTutorialStep = prev.tutorialStep;
      if (prev.isTutorialActive && prev.tutorialStep === 3) {
        nextTutorialStep = 4;
      }

      return {
        ...prev,
        coins: prev.coins + order.rewards.coins,
        gems: prev.gems + (order.rewards.gems || 0),
        energy: Math.min(prev.maxEnergy, prev.energy + (order.rewards.energy || 0)),
        grid: newGrid,
        activeOrders: [...remainingOrders, newOrder],
        tutorialStep: nextTutorialStep,
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

  // 10. Restore Kingdom Stage
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

  // 11. Claim Quest Rewards
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

  // 12. Claim Discovery Reward
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

  // 13. Dev & Testing Helpers
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
    localStorage.removeItem(PRIMARY_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    const { state: fresh } = hydrateAndMigrateSave(null, null);
    setState(fresh);
    setSelectedCell(null);
  };

  const updateSettings = (newSettings: GameState['settings']) => {
    setState((prev) => ({ ...prev, settings: newSettings }));
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
    upgradeGenerator,
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
    advanceTutorial,
    dismissTutorial,
    grantXP,
    updateSettings,
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
