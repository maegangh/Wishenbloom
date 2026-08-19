import React from 'react';
import { Settings, Wrench, Zap, Sparkles, Gift, ShoppingBag } from 'lucide-react';
import { GameState } from '../types';
import { CURRENT_MAX_PLAYER_LEVEL } from '../data/progression';
import { BALANCE } from '../data/balance';

interface TopHudProps {
  state: GameState;
  onOpenSettings: () => void;
  onOpenDev: () => void;
  onOpenShop?: () => void;
  onOpenEnergyShop?: () => void;
  onOpenDailyRewards?: () => void;
  hasUnclaimedDailyReward?: boolean;
}

export const TopHud: React.FC<TopHudProps> = ({
  state,
  onOpenSettings,
  onOpenDev,
  onOpenShop,
  onOpenEnergyShop,
  onOpenDailyRewards,
  hasUnclaimedDailyReward,
}) => {
  const isCapped = state.level >= CURRENT_MAX_PLAYER_LEVEL;
  const xpPercent = isCapped ? 100 : Math.min(100, Math.round((state.xp / state.xpToNextLevel) * 100));

  // Time to next energy point
  const now = Date.now();
  const elapsedSec = Math.floor((now - state.lastEnergyRechargeAt) / 1000) % 120;
  const remainingSec = state.energy < state.maxEnergy ? 120 - elapsedSec : 0;
  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const hasPendingRewards = (state.pendingRewards || []).length > 0;

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-amber-500/20 px-3 py-2 safe-top text-white select-none z-30 shadow-md">
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Level & XP */}
        <div
          className="flex items-center gap-2"
          title={isCapped ? BALANCE.POST_CAP_JOURNEY_TEXT : `XP: ${state.xp}/${state.xpToNextLevel}`}
        >
          <div className="relative flex items-center justify-center">
            <div className={`w-10 h-10 rounded-full p-[2px] shadow-inner flex items-center justify-center ${
              isCapped
                ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 ring-2 ring-yellow-400/40 animate-pulse'
                : 'bg-gradient-to-tr from-amber-600 to-yellow-400'
            }`}>
              <div className="w-full h-full rounded-full bg-slate-900 flex flex-col items-center justify-center">
                <span className="text-[9px] font-bold text-amber-300 leading-none">LV</span>
                <span className="text-sm font-black text-white leading-none">{state.level}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-300 gap-2">
              <span className="text-amber-300">XP</span>
              {isCapped ? (
                <span className="text-[9px] text-amber-200/90 font-bold tracking-tight">
                  {BALANCE.POST_CAP_XP_LABEL}
                </span>
              ) : (
                <span>{state.xp}/{state.xpToNextLevel}</span>
              )}
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
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-750 px-2 py-1 rounded-full border border-amber-500/30 shadow-inner cursor-pointer transition"
            title="Coins - Tap to view shop"
          >
            <span className="text-amber-400 text-sm">🪙</span>
            <span className="text-amber-200 tracking-tight">{state.coins.toLocaleString()}</span>
          </button>

          {/* Gems */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-750 px-2 py-1 rounded-full border border-purple-500/30 shadow-inner cursor-pointer transition"
            title="Gems - Tap to view market"
          >
            <span className="text-purple-400 text-sm">💎</span>
            <span className="text-purple-200 tracking-tight">{state.gems}</span>
          </button>

          {/* Energy */}
          <button
            onClick={onOpenShop || onOpenEnergyShop}
            className="flex items-center gap-1 bg-cyan-950/80 hover:bg-cyan-900 px-2 py-1 rounded-full border border-cyan-500/40 shadow-inner cursor-pointer transition-colors"
            title="Energy - Tap to refill"
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

        {/* Actions (Shop, Daily Rewards, Dev & Settings) */}
        <div className="flex items-center gap-1">
          {onOpenShop && (
            <button
              onClick={onOpenShop}
              id="btn-open-shop"
              className="relative p-1.5 rounded-lg bg-gradient-to-br from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold border border-yellow-300/50 transition-all cursor-pointer shadow"
              title="Realm Market / Shop"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950" />
              {hasPendingRewards && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
              )}
            </button>
          )}

          {onOpenDailyRewards && (
            <button
              onClick={onOpenDailyRewards}
              id="btn-daily-rewards"
              className="relative p-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 transition-all cursor-pointer"
              title="Daily Gifts"
            >
              <Gift className={`w-4 h-4 ${hasUnclaimedDailyReward ? 'animate-bounce text-amber-300' : ''}`} />
              {hasUnclaimedDailyReward && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
              )}
            </button>
          )}

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

