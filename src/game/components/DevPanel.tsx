import React, { useState } from 'react';
import { X, Wrench, Plus, RefreshCw, Zap, Coins, Gem, Sparkles, Trash2, Activity, LayoutGrid, Award, BookOpen, Calendar, Gift, CheckCircle2 } from 'lucide-react';
import { ITEMS } from '../data/items';
import { GameState } from '../types';
import { getLevelProgression, getUnlockedChainsForLevel } from '../data/progression';

interface DevPanelProps {
  gameState?: GameState;
  onAddCoins: (amt?: number) => void;
  onAddGems: (amt?: number) => void;
  onRefillEnergy: () => void;
  onAddXP: (amt?: number) => void;
  onSpawnItem: (itemId: string) => void;
  onClearBoard: () => void;
  onResetSave: () => void;
  onSimulateNextDay?: () => void;
  onResetDailyClaim?: () => void;
  onCompleteAllDailyTasks?: () => void;
  onSetDailyRewardDay?: (day: number) => void;
  onClose: () => void;
}

export const DevPanel: React.FC<DevPanelProps> = ({
  gameState,
  onAddCoins,
  onAddGems,
  onRefillEnergy,
  onAddXP,
  onSpawnItem,
  onClearBoard,
  onResetSave,
  onSimulateNextDay,
  onResetDailyClaim,
  onCompleteAllDailyTasks,
  onSetDailyRewardDay,
  onClose,
}) => {
  const [selectedSpawnItem, setSelectedSpawnItem] = useState('herb_3');
  const itemList = Object.values(ITEMS);

  // Telemetry metrics
  const totalCells = (gameState?.grid.length || 9) * (gameState?.grid[0]?.length || 7);
  const occupiedCells = gameState
    ? gameState.grid.flatMap((r) => r).filter((c) => c !== null).length
    : 0;
  const freeCells = totalCells - occupiedCells;
  const occupancyPercent = Math.round((occupiedCells / totalCells) * 100);

  const generatorCount = gameState
    ? gameState.grid.flatMap((r) => r).filter((c) => c?.isGenerator).length +
      gameState.inventory.filter((c) => c?.isGenerator).length
    : 1;

  const currentLevelDef = gameState ? getLevelProgression(gameState.level) : null;
  const unlockedChains = gameState ? getUnlockedChainsForLevel(gameState.level) : ['herbs'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm max-h-[85vh] overflow-y-auto bg-slate-900 border border-amber-500/50 rounded-3xl p-5 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black text-amber-300">Developer Testing Suite</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Early Game Balance & Telemetry Panel */}
        {gameState && (
          <div className="py-3 border-b border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-black uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" />
              <span>Balance & Economy Telemetry</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              {/* Level & XP */}
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-bold">Level & XP</span>
                <span className="text-xs font-black text-yellow-300">
                  Lv.{gameState.level} ({gameState.xp}/{currentLevelDef?.xpRequired || 0} XP)
                </span>
              </div>

              {/* Board Occupancy */}
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-bold">Board Pressure</span>
                <span className="text-xs font-black text-emerald-300">
                  {occupiedCells}/63 ({occupancyPercent}%)
                </span>
                <span className="text-[9px] text-slate-400 block font-medium">
                  {freeCells} free tiles
                </span>
              </div>

              {/* Retention Daily State */}
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-bold">Daily Gift</span>
                <span className="text-xs font-black text-amber-300">
                  Day {gameState.dailyRewardCycleDay || 1}/7 {gameState.lastDailyRewardClaimDate ? '(Claimed)' : '(Ready)'}
                </span>
              </div>

              {/* Daily Tasks */}
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-bold">Daily Tasks</span>
                <span className="text-xs font-black text-cyan-300">
                  {gameState.dailyTasks ? `${gameState.dailyTasks.filter((t) => t.isCompleted).length}/3 Done` : '0/3'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Retention & Daily Testing */}
        <div className="py-3 border-b border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Retention & Daily QA
          </span>
          <div className="grid grid-cols-2 gap-2">
            {onSimulateNextDay && (
              <button
                onClick={onSimulateNextDay}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Simulate Tomorrow</span>
              </button>
            )}
            {onResetDailyClaim && (
              <button
                onClick={onResetDailyClaim}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-yellow-300 border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Reset Gift Claim</span>
              </button>
            )}
            {onCompleteAllDailyTasks && (
              <button
                onClick={onCompleteAllDailyTasks}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete 3 Tasks</span>
              </button>
            )}
            {onSetDailyRewardDay && (
              <button
                onClick={() => onSetDailyRewardDay(7)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-purple-300 border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Set Gift Day 7</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Resource Actions */}
        <div className="py-3 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Economy Injections
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddCoins(500)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>+500 Coins</span>
            </button>
            <button
              onClick={() => onAddGems(50)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-purple-300 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Gem className="w-4 h-4" />
              <span>+50 Gems</span>
            </button>
            <button
              onClick={onRefillEnergy}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Refill Energy</span>
            </button>
            <button
              onClick={() => onAddXP(100)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-yellow-300 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>+100 XP (Level)</span>
            </button>
          </div>
        </div>

        {/* Item Spawner */}
        <div className="py-3 border-t border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Item Spawner
          </span>
          <div className="flex items-center gap-2">
            <select
              value={selectedSpawnItem}
              onChange={(e) => setSelectedSpawnItem(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none"
            >
              {itemList.map((it) => (
                <option key={it.id} value={it.id}>
                  [{it.chainId}] T{it.tier} - {it.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => onSpawnItem(selectedSpawnItem)}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Spawn</span>
            </button>
          </div>
        </div>

        {/* Board Operations */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Board Management
          </span>
          <button
            onClick={onClearBoard}
            className="w-full py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Non-Generator Items</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset save state?')) {
                onResetSave();
                onClose();
              }
            }}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Save to Initial State</span>
          </button>
        </div>
      </div>
    </div>
  );
};

