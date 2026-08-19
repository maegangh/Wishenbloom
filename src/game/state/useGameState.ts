import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  GameState,
  BoardItem,
  NPCOrder,
  Quest,
  ItemDef,
  DailyTaskState,
} from '../types';
import { ITEMS } from '../data/items';
import { GENERATORS } from '../data/generators';
import { COMPENDIUM_MILESTONES } from '../data/compendiumMilestones';
import {
  LEVEL_PROGRESSION,
  getLevelProgression,
  CURRENT_MAX_PLAYER_LEVEL,
  isPlayerAtMaxLevel,
  LevelProgressionDef,
  LevelRewards,
} from '../data/progression';
import {
  getUtcDateKey,
  isDailyRewardClaimable,
  getNextDailyRewardCycleDay,
  getDailyRewardForDay,
  DAILY_REWARDS_CYCLE,
} from '../data/dailyRewards';
import {
  generateDailyTasksForDate,
  DAILY_COMPLETION_REWARD,
} from '../data/dailyTasks';
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
  generateSpecialOrder,
  isOrderFulfillable,
} from '../logic/orderLogic';
import { BALANCE } from '../data/balance';
import {
  PRIMARY_STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  hydrateAndMigrateSave,
  ENERGY_RECHARGE_SECONDS,
} from '../logic/saveMigration';

export function useGameState() {
  const [offlineEnergyRecovered, setOfflineEnergyRecovered] = useState<number>(0);

  const [state, setState] = useState<GameState>(() => {
    try {
      const primary = localStorage.getItem(PRIMARY_STORAGE_KEY);
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      const { state: hydrated, isMigratedFromLegacy, recoveredOfflineEnergy } = hydrateAndMigrateSave(primary, legacy);
      
      if (recoveredOfflineEnergy && recoveredOfflineEnergy > 0) {
        setOfflineEnergyRecovered(recoveredOfflineEnergy);
      }

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
    progression?: LevelProgressionDef;
    rewards: LevelRewards;
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
  // - UTC date rollover detection for Daily Tasks
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

      // 3. Check UTC Day boundary for Daily Tasks
      const todayUtc = getUtcDateKey(now);
      let tasksChanged = false;
      let newDailyTasks = current.dailyTasks;
      let newDailyTasksDateKey = current.dailyTasksDateKey;
      let newDailyCompletionClaimed = current.dailyCompletionClaimed;

      if (current.dailyTasksDateKey !== todayUtc) {
        newDailyTasksDateKey = todayUtc;
        newDailyTasks = generateDailyTasksForDate(current.grid, current.inventory, current.level, todayUtc);
        newDailyCompletionClaimed = false;
        tasksChanged = true;
      }

      if (gridChanged || energyChanged || tasksChanged) {
        setState((prev) => ({
          ...prev,
          grid: gridChanged ? updatedGrid : prev.grid,
          energy: energyChanged ? newEnergy : prev.energy,
          lastEnergyRechargeAt: energyChanged ? newLastEnergyRechargeAt : prev.lastEnergyRechargeAt,
          dailyTasksDateKey: tasksChanged ? newDailyTasksDateKey : prev.dailyTasksDateKey,
          dailyTasks: tasksChanged ? newDailyTasks : prev.dailyTasks,
          dailyCompletionClaimed: tasksChanged ? newDailyCompletionClaimed : prev.dailyCompletionClaimed,
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

  // Update Daily Task Progress helper
  const updateDailyTasks = useCallback((type: DailyTaskState['type'], amount = 1) => {
    setState((prev) => {
      const todayUtc = getUtcDateKey();
      const currentTasks = prev.dailyTasksDateKey === todayUtc
        ? prev.dailyTasks
        : generateDailyTasksForDate(prev.grid, prev.inventory, prev.level, todayUtc);
      const completionClaimed = prev.dailyTasksDateKey === todayUtc ? prev.dailyCompletionClaimed : false;

      let hasChanged = false;
      const updatedTasks = currentTasks.map((task) => {
        if (task.type === type && !task.isCompleted) {
          const current = Math.min(task.target, task.current + amount);
          hasChanged = true;
          return {
            ...task,
            current,
            isCompleted: current >= task.target,
          };
        }
        return task;
      });

      if (!hasChanged && prev.dailyTasksDateKey === todayUtc) return prev;

      return {
        ...prev,
        dailyTasksDateKey: todayUtc,
        dailyTasks: updatedTasks,
        dailyCompletionClaimed: completionClaimed,
      };
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

  // Centralized Helper to add XP and evaluate level-up progression
  const grantXP = useCallback((xpGain: number) => {
    setState((prev) => {
      // 1. If player is already at or above the authored content cap (Level 30),
      // strictly clamp XP and do NOT advance level, grant rewards, or trigger modal.
      if (prev.level >= CURRENT_MAX_PLAYER_LEVEL) {
        const cappedXp = Math.min(prev.xpToNextLevel, prev.xp + xpGain);
        return {
          ...prev,
          xp: cappedXp,
        };
      }

      let newXp = prev.xp + xpGain;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNextLevel;
      let leveledUp = false;

      let accumulatedCoins = 0;
      let accumulatedGems = 0;
      let accumulatedInvSlots = 0;
      let accumulatedEnergy = 0;
      let hasFullEnergyRefill = false;
      let lastProgDef: LevelProgressionDef | undefined;
      const claimedRewardIds = [...(prev.claimedLevelRewardIds || [])];

      const newGrid = prev.grid.map((row) => [...row]);
      let newInventory = [...prev.inventory];
      let maxSlots = prev.maxInventorySlots;

      while (newXp >= newXpToNext && newLevel < CURRENT_MAX_PLAYER_LEVEL) {
        newXp -= newXpToNext;
        newLevel += 1;
        const progDef = getLevelProgression(newLevel);
        lastProgDef = progDef;
        newXpToNext = progDef.xpRequired;
        leveledUp = true;

        // Reward player only if not already claimed
        if (!claimedRewardIds.includes(newLevel)) {
          claimedRewardIds.push(newLevel);
          accumulatedCoins += progDef.rewards.coins;
          accumulatedGems += progDef.rewards.gems;

          if (progDef.rewards.isFullEnergyRefill || progDef.rewards.energy >= prev.maxEnergy) {
            hasFullEnergyRefill = true;
          } else {
            accumulatedEnergy += (progDef.rewards.energy || 0);
          }

          // 1. Check Generator Unlock
          if (progDef.unlocks.generatorId) {
            const genId = progDef.unlocks.generatorId;
            const alreadyHas =
              hasGenerator(newGrid, genId) ||
              newInventory.some((inv) => inv?.generatorId === genId);

            if (!alreadyHas) {
              const defaultItemId =
                genId.startsWith('gen_garden') ? 'herb_1'
                : genId.startsWith('gen_alchemist') ? 'potion_1'
                : genId.startsWith('gen_forge') ? 'forge_1'
                : genId.startsWith('gen_wizard') ? 'book_1'
                : genId.startsWith('gen_nest') ? 'creature_1'
                : genId.startsWith('gen_loom') ? 'textile_1'
                : genId.startsWith('gen_quarry') ? 'crystal_1'
                : genId.startsWith('gen_hearth') ? 'provision_1'
                : genId.startsWith('gen_lantern') ? 'lantern_1'
                : 'coin_item_1';

              spawnItemOnFirstEmpty(newGrid, {
                instanceId: `gen_${genId}_${Date.now()}`,
                itemId: defaultItemId,
                isGenerator: true,
                generatorId: genId,
                tileState: 'normal',
              });
            }
          }

          // 2. Check Inventory Slot Expansion (Level 6, 18, 28)
          if (progDef.rewards.inventorySlotsAdded || progDef.unlocks.inventorySlotIncrease) {
            const addSlots = progDef.rewards.inventorySlotsAdded || progDef.unlocks.inventorySlotIncrease || 1;
            maxSlots += addSlots;
            while (newInventory.length < maxSlots) {
              newInventory.push(null);
            }
            accumulatedInvSlots += addSlots;
          }

          // 3. Check Special Chest Reward (e.g. Golden Chest at Level 10/15, Royal at Level 20/30)
          if (progDef.rewards.chestItemId) {
            spawnItemOnFirstEmpty(newGrid, {
              instanceId: `reward_${progDef.rewards.chestItemId}_${Date.now()}`,
              itemId: progDef.rewards.chestItemId,
              tileState: 'normal',
            });
          }
        }
      }

      // If capped at max level, clamp leftover XP to requirement boundary
      if (newLevel >= CURRENT_MAX_PLAYER_LEVEL) {
        newXp = Math.min(newXp, newXpToNext);
      }

      if (leveledUp && lastProgDef) {
        audio.playLevelUp();
        confetti({
          particleCount: newLevel === 10 || newLevel === 20 || newLevel === 30 ? 150 : 80,
          spread: newLevel === 10 || newLevel === 20 || newLevel === 30 ? 100 : 70,
          origin: { y: 0.55 },
        });

        let newEnergy = prev.energy;
        if (hasFullEnergyRefill) {
          newEnergy = prev.maxEnergy;
        } else if (accumulatedEnergy > 0) {
          newEnergy = Math.min(prev.maxEnergy, prev.energy + accumulatedEnergy);
        }

        setLevelUpData({
          level: newLevel,
          progression: lastProgDef,
          rewards: {
            coins: accumulatedCoins,
            gems: accumulatedGems,
            energy: hasFullEnergyRefill ? prev.maxEnergy : accumulatedEnergy,
            isFullEnergyRefill: hasFullEnergyRefill,
            chestItemId: lastProgDef.rewards.chestItemId,
            inventorySlotsAdded: accumulatedInvSlots > 0 ? accumulatedInvSlots : undefined,
          },
        });

        let newSpecialOrder = prev.specialOrder;
        if (newLevel >= BALANCE.SPECIAL_ORDER_UNLOCK_LEVEL && !newSpecialOrder) {
          newSpecialOrder = generateSpecialOrder(newGrid, newInventory, newLevel);
        }

        return {
          ...prev,
          level: newLevel,
          xp: newXp,
          xpToNextLevel: newXpToNext,
          coins: prev.coins + accumulatedCoins,
          gems: prev.gems + accumulatedGems,
          energy: newEnergy,
          claimedLevelRewardIds: claimedRewardIds,
          grid: newGrid,
          inventory: newInventory,
          maxInventorySlots: maxSlots,
          specialOrder: newSpecialOrder,
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
      audio.playTone(220, 'sawtooth', 0.2, 0.1);
      return;
    }

    const droppedItemId = rollGeneratorDrop(generator);
    const now = Date.now();

    audio.playSpawn();

    setState((prev) => {
      const newGrid = prev.grid.map((r) => [...r]);
      const currentGen = newGrid[row][col];

      // Update generator cooldown / lastTappedAt
      if (currentGen) {
        newGrid[row][col] = {
          ...currentGen,
          lastTappedAt: now,
          cooldownUntil: generator.cooldownMs > 0 ? now + generator.cooldownMs : undefined,
        };
      }

      // Place newly spawned item
      newGrid[emptySpot.row][emptySpot.col] = {
        instanceId: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        itemId: droppedItemId,
        tileState: 'normal',
      };

      // Action-driven tutorial advance on generator tap (Step 1 -> Step 2)
      let nextTutorialStep = prev.tutorialStep;
      if (prev.isTutorialActive && prev.tutorialStep === 1) {
        nextTutorialStep = 2;
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

    checkDiscovery(droppedItemId);
    updateQuests('tap_generator', 1);
    updateQuests('spend_energy', generator.energyCost);
    updateDailyTasks('tap_generator', 1);
    updateDailyTasks('spend_energy', generator.energyCost);
  }, [state.grid, state.energy, checkDiscovery, updateQuests, updateDailyTasks]);

  // 2. Upgrade Generator (Coins Economy & Evolution Pathway)
  const upgradeGenerator = useCallback((row: number, col: number) => {
    const item = state.grid[row]?.[col];
    if (!item || !item.isGenerator || !item.generatorId) return;

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
      const currentGen = newGrid[row][col];
      if (!currentGen) return prev;

      newGrid[row][col] = {
        ...currentGen,
        generatorId: nextDef.id,
        cooldownUntil: undefined,
      };

      return {
        ...prev,
        coins: prev.coins - cost,
        grid: newGrid,
      };
    });

    grantXP(Math.round(cost * 0.4 + 20));
    updateDailyTasks('upgrade_generator', 1);
  }, [state.grid, state.coins, grantXP, updateDailyTasks]);

  // 3. Move or Merge Item (with prioritized Dusty Tile Resolution)
  const moveOrMergeItem = useCallback((
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ) => {
    if (fromRow === toRow && fromCol === toCol) {
      setSelectedCell({ row: fromRow, col: fromCol });
      return;
    }

    const sourceItem = state.grid[fromRow]?.[fromCol];
    const targetItem = state.grid[toRow]?.[toCol];

    if (!sourceItem) return;

    // CASE 1: Move item to empty slot
    if (!targetItem) {
      audio.playMove();
      setState((prev) => {
        const newGrid = prev.grid.map((r) => [...r]);
        newGrid[toRow][toCol] = sourceItem;
        newGrid[fromRow][fromCol] = null;
        return { ...prev, grid: newGrid };
      });
      setSelectedCell(null);
      return;
    }

    // CASE 2: Both tiles have items -> Run hardened merge validity check
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
      updateDailyTasks('merge', 1);
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
  }, [state.grid, grantXP, checkDiscovery, updateQuests, updateDailyTasks]);

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

    const itemDef = ITEMS[item.itemId];
    if (!itemDef?.isConsumable) return;

    const cType = itemDef.consumableType;
    const cVal = itemDef.consumableValue || 0;

    setState((prev) => {
      const newGrid = prev.grid.map((r) => [...r]);
      newGrid[row][col] = null;

      let newCoins = prev.coins;
      let newGems = prev.gems;
      let newEnergy = prev.energy;

      if (cType === 'energy') {
        audio.playSparkle();
        newEnergy = Math.min(prev.maxEnergy + 50, prev.energy + cVal);
      } else if (cType === 'coins') {
        audio.playCoin();
        newCoins += cVal;
      } else if (cType === 'gems') {
        audio.playGem();
        newGems += cVal;
      } else if (cType === 'chest') {
        audio.playChestOpen();
        confetti({ particleCount: 60, spread: 70 });

        const chestItems =
          itemDef.chestTier === 'royal'
            ? ['energy_2', 'gem_2', 'coin_item_3', 'potion_3']
            : itemDef.chestTier === 'golden'
            ? ['energy_1', 'gem_1', 'coin_item_2', 'potion_2']
            : ['energy_1', 'coin_item_1', 'herb_2'];

        chestItems.forEach((cItemId) => {
          spawnItemOnFirstEmpty(newGrid, {
            instanceId: `chest_drop_${Date.now()}_${Math.random()}`,
            itemId: cItemId,
            tileState: 'normal',
          });
        });
      }

      return {
        ...prev,
        coins: newCoins,
        gems: newGems,
        energy: newEnergy,
        grid: newGrid,
      };
    });

    setSelectedCell(null);
  }, [state.grid]);

  // 6. Pop Bubble
  const popBubble = useCallback((row: number, col: number, withGems: boolean) => {
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
    updateDailyTasks('pop_bubble', 1);
    setSelectedCell(null);
  }, [state.grid, state.gems, updateDailyTasks]);

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
    const isSpecial = state.specialOrder?.id === orderId;
    const order = isSpecial
      ? state.specialOrder
      : state.activeOrders.find((o) => o.id === orderId);

    if (!order) return;

    if (!checkOrderAvailable(order)) return;

    audio.playOrderComplete();
    confetti({
      particleCount: isSpecial ? 80 : 50,
      spread: isSpecial ? 80 : 60,
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

      let updatedActiveOrders = prev.activeOrders;
      let updatedSpecialOrder = prev.specialOrder;

      if (isSpecial) {
        // Special order completed: cleared (does not immediately respawn)
        updatedSpecialOrder = undefined;
      } else {
        // Generate replacement order using safe producible chains
        const remainingOrders = prev.activeOrders.filter((o) => o.id !== orderId);
        const newOrder = generateSafeRandomOrder(
          newGrid,
          prev.inventory,
          prev.level,
          remainingOrders.map((o) => o.id)
        );
        updatedActiveOrders = [...remainingOrders, newOrder];

        // If player has unlocked Special Orders and has no active special order, chance to spawn one
        if (
          prev.level >= BALANCE.SPECIAL_ORDER_UNLOCK_LEVEL &&
          !updatedSpecialOrder &&
          Math.random() < BALANCE.SPECIAL_ORDER_SPAWN_CHANCE_ON_ORDER
        ) {
          updatedSpecialOrder = generateSpecialOrder(newGrid, prev.inventory, prev.level);
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
        activeOrders: updatedActiveOrders,
        specialOrder: updatedSpecialOrder,
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
    updateDailyTasks('fulfill_order', 1);
    if (isSpecial) {
      updateDailyTasks('fulfill_special_order', 1);
    }
  }, [state.activeOrders, state.specialOrder, checkOrderAvailable, grantXP, updateQuests, updateDailyTasks]);

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

  // 12b. Claim Compendium Milestone
  const claimCompendiumMilestone = useCallback((milestoneId: string) => {
    const milestone = COMPENDIUM_MILESTONES.find((m) => m.id === milestoneId);
    if (!milestone) return;

    setState((prev) => {
      const alreadyClaimed = (prev.claimedCompendiumMilestoneIds || []).includes(milestoneId);
      if (alreadyClaimed) return prev;

      audio.playOrderComplete();
      confetti({ particleCount: 75, spread: 80 });

      const newGrid = prev.grid.map((r) => [...r]);
      if (milestone.rewardChestId) {
        spawnItemOnFirstEmpty(newGrid, {
          instanceId: `milestone_chest_${milestone.rewardChestId}_${Date.now()}`,
          itemId: milestone.rewardChestId,
          tileState: 'normal',
        });
      }

      return {
        ...prev,
        coins: prev.coins + milestone.rewardCoins,
        gems: prev.gems + milestone.rewardGems,
        energy: milestone.rewardEnergy
          ? Math.min(prev.maxEnergy, prev.energy + milestone.rewardEnergy)
          : prev.energy,
        grid: newGrid,
        claimedCompendiumMilestoneIds: [
          ...(prev.claimedCompendiumMilestoneIds || []),
          milestoneId,
        ],
        stats: {
          ...prev.stats,
          totalCoinsEarned: prev.stats.totalCoinsEarned + milestone.rewardCoins,
          totalGemsEarned: prev.stats.totalGemsEarned + milestone.rewardGems,
        },
      };
    });
  }, []);

  // 12c. Claim Daily Reward (7-day cycle)
  const claimDailyReward = useCallback(() => {
    setState((prev) => {
      const now = Date.now();
      const todayUtc = getUtcDateKey(now);
      if (!isDailyRewardClaimable(prev.lastDailyRewardClaimDate, now)) {
        return prev;
      }

      const rewardDef = getDailyRewardForDay(prev.dailyRewardCycleDay);
      const nextCycleDay = getNextDailyRewardCycleDay(prev.dailyRewardCycleDay);

      audio.playOrderComplete();
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.4 } });

      const newGrid = prev.grid.map((r) => [...r]);
      if (rewardDef.rewards.chestItemId) {
        spawnItemOnFirstEmpty(newGrid, {
          instanceId: `daily_chest_${Date.now()}`,
          itemId: rewardDef.rewards.chestItemId,
          tileState: 'normal',
        });
      }

      const coinsToAdd = rewardDef.rewards.coins || 0;
      const gemsToAdd = rewardDef.rewards.gems || 0;
      const energyToAdd = rewardDef.rewards.energy || 0;

      return {
        ...prev,
        coins: prev.coins + coinsToAdd,
        gems: prev.gems + gemsToAdd,
        energy: Math.min(prev.maxEnergy + 100, prev.energy + energyToAdd),
        grid: newGrid,
        dailyRewardCycleDay: nextCycleDay,
        lastDailyRewardClaimDate: todayUtc,
        stats: {
          ...prev.stats,
          totalCoinsEarned: prev.stats.totalCoinsEarned + coinsToAdd,
          totalGemsEarned: prev.stats.totalGemsEarned + gemsToAdd,
        },
      };
    });
  }, []);

  // 12d. Claim Individual Daily Task
  const claimDailyTask = useCallback((taskId: string) => {
    setState((prev) => {
      const task = prev.dailyTasks.find((t) => t.id === taskId);
      if (!task || !task.isCompleted || task.isClaimed) {
        return prev;
      }

      audio.playOrderComplete();
      confetti({ particleCount: 45, spread: 60 });

      const updatedTasks = prev.dailyTasks.map((t) => {
        if (t.id === taskId) {
          return { ...t, isClaimed: true };
        }
        return t;
      });

      const coinsToAdd = task.rewards.coins || 0;
      const gemsToAdd = task.rewards.gems || 0;
      const energyToAdd = task.rewards.energy || 0;

      return {
        ...prev,
        coins: prev.coins + coinsToAdd,
        gems: prev.gems + gemsToAdd,
        energy: Math.min(prev.maxEnergy + 50, prev.energy + energyToAdd),
        dailyTasks: updatedTasks,
        stats: {
          ...prev.stats,
          totalCoinsEarned: prev.stats.totalCoinsEarned + coinsToAdd,
          totalGemsEarned: prev.stats.totalGemsEarned + gemsToAdd,
        },
      };
    });
  }, []);

  // 12e. Claim Daily Completion Reward (All 3 tasks complete)
  const claimDailyCompletionReward = useCallback(() => {
    setState((prev) => {
      if (prev.dailyCompletionClaimed) return prev;
      const allCompleted = prev.dailyTasks.length > 0 && prev.dailyTasks.every((t) => t.isCompleted);
      if (!allCompleted) return prev;

      audio.playChestOpen();
      confetti({ particleCount: 90, spread: 90, origin: { y: 0.3 } });

      const newGrid = prev.grid.map((r) => [...r]);
      if (DAILY_COMPLETION_REWARD.chestItemId) {
        spawnItemOnFirstEmpty(newGrid, {
          instanceId: `daily_comp_chest_${Date.now()}`,
          itemId: DAILY_COMPLETION_REWARD.chestItemId,
          tileState: 'normal',
        });
      }

      return {
        ...prev,
        coins: prev.coins + DAILY_COMPLETION_REWARD.coins,
        gems: prev.gems + DAILY_COMPLETION_REWARD.gems,
        energy: Math.min(prev.maxEnergy + 50, prev.energy + DAILY_COMPLETION_REWARD.energy),
        grid: newGrid,
        dailyCompletionClaimed: true,
        stats: {
          ...prev.stats,
          totalCoinsEarned: prev.stats.totalCoinsEarned + DAILY_COMPLETION_REWARD.coins,
          totalGemsEarned: prev.stats.totalGemsEarned + DAILY_COMPLETION_REWARD.gems,
        },
      };
    });
  }, []);

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

  const devSimulateNextDay = () => {
    setState((prev) => {
      const fakeTomorrowDate = `SIM_${Date.now()}`;
      const newTasks = generateDailyTasksForDate(prev.grid, prev.inventory, prev.level, fakeTomorrowDate);
      return {
        ...prev,
        lastDailyRewardClaimDate: null,
        dailyTasksDateKey: fakeTomorrowDate,
        dailyTasks: newTasks,
        dailyCompletionClaimed: false,
      };
    });
  };

  const devResetDailyClaim = () => {
    setState((prev) => ({
      ...prev,
      lastDailyRewardClaimDate: null,
    }));
  };

  const devCompleteAllDailyTasks = () => {
    setState((prev) => ({
      ...prev,
      dailyTasks: prev.dailyTasks.map((t) => ({ ...t, current: t.target, isCompleted: true })),
    }));
  };

  const devSetDailyRewardDay = (day: number) => {
    setState((prev) => ({
      ...prev,
      dailyRewardCycleDay: Math.max(1, Math.min(7, day)),
      lastDailyRewardClaimDate: null,
    }));
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
    offlineEnergyRecovered,
    setOfflineEnergyRecovered,
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
    claimCompendiumMilestone,
    claimDailyReward,
    claimDailyTask,
    claimDailyCompletionReward,
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
    devSimulateNextDay,
    devResetDailyClaim,
    devCompleteAllDailyTasks,
    devSetDailyRewardDay,
  };
}
