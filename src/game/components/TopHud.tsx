import React from 'react';
import { Settings, Wrench, Zap, Sparkles } from 'lucide-react';
import { GameState } from '../types';

interface TopHudProps {
  state: GameState;
  onOpenSettings: () => void;
  onOpenDev: () => void;
  onOpenEnergyShop?: () => void;
}

export const TopHud: React.FC<TopHudProps> = ({
  state,
  onOpenSettings,
  onOpenDev,
  onOpenEnergyShop,
}) => {
  const xpPercent = Math.min(100, Math.round((state.xp / state.xpToNextLevel) * 100));

  // Time to next energy point
  const now = Date.now();
  const elapsedSec = Math.floor((now - state.lastEnergyRechargeAt) / 1000) % 120;
  const remainingSec = state.energy < state.maxEnergy ? 120 - elapsedSec : 0;
  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-amber-500/20 px-3 py-2 text-white select-none z-30 shadow-md">
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Level & XP */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-[2px] shadow-inner flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-slate-900 flex flex-col items-center justify-center">
                <span className="text-[9px] font-bold text-amber-300 leading-none">LV</span>
                <span className="text-sm font-black text-white leading-none">{state.level}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-300 gap-2">
              <span className="text-amber-300">XP</span>
              <span>{state.xp}/{state.xpToNextLevel}</span>
            </div>
            <div className="w-16 sm:w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Currencies (Coins, Gems, Energy) */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold">
          {/* Coins */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-full border border-amber-500/30 shadow-inner">
            <span className="text-amber-400 text-sm">🪙</span>
            <span className="text-amber-200 tracking-tight">{state.coins.toLocaleString()}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-full border border-purple-500/30 shadow-inner">
            <span className="text-purple-400 text-sm">💎</span>
            <span className="text-purple-200 tracking-tight">{state.gems}</span>
          </div>

          {/* Energy */}
          <button
            onClick={onOpenEnergyShop}
            className="flex items-center gap-1 bg-cyan-950/80 hover:bg-cyan-900 px-2 py-1 rounded-full border border-cyan-500/40 shadow-inner cursor-pointer transition-colors"
            title="Tap to view energy refill options"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 animate-pulse" />
            <span className="text-cyan-200 tracking-tight">
              {state.energy}/{state.maxEnergy}
            </span>
            {state.energy < state.maxEnergy && (
              <span className="text-[9px] text-cyan-400/80 font-mono hidden sm:inline">
                ({timeFormatted})
              </span>
            )}
          </button>
        </div>

        {/* Actions (Dev & Settings) */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenDev}
            id="btn-dev-tools"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 transition-colors"
            title="Developer / Debug Tools"
          >
            <Wrench className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            id="btn-settings"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Game Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
