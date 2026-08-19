import React from 'react';
import { Settings, Wrench, Plus, Zap, ShoppingBag } from 'lucide-react';
import { GameState } from '../types';
import { CURRENT_MAX_PLAYER_LEVEL } from '../data/progression';
import { BALANCE } from '../data/balance';
import { NpcAvatar } from './NpcAvatar';

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
}) => {
  const isCapped = state.level >= CURRENT_MAX_PLAYER_LEVEL;
  const xpPercent = isCapped ? 100 : Math.min(100, Math.round((state.xp / state.xpToNextLevel) * 100));

  // Time to next energy point
  const now = Date.now();
  const elapsedSec = Math.floor((now - state.lastEnergyRechargeAt) / 1000) % 120;
  const remainingSec = state.energy < state.maxEnergy ? 120 - elapsedSec : 0;
  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;
  const timeFormatted = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <header className="w-full bg-gradient-to-b from-sky-950/90 via-slate-900/90 to-slate-900/80 backdrop-blur-md px-3 py-1.5 safe-top text-white select-none z-30 shadow-lg border-b border-amber-400/20">
      <div className="flex items-center justify-between gap-1.5 max-w-md mx-auto">
        
        {/* Left: Bloomkeeper Heroine Portrait & Level Badge */}
        <div
          className="relative flex items-center cursor-pointer group flex-shrink-0"
          onClick={onOpenSettings}
          title={`Level ${state.level} Bloomkeeper • XP: ${state.xp}/${state.xpToNextLevel}`}
        >
          {/* Main Portrait Circle */}
          <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-md flex items-center justify-center relative overflow-visible">
            <NpcAvatar avatarId="elowen" size={44} className="rounded-full" />

            {/* Level Badge at bottom-left */}
            <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-gradient-to-tr from-blue-700 to-sky-400 border-2 border-amber-300 shadow-md flex items-center justify-center">
              <span className="text-[10px] font-black text-white leading-none">
                {state.level}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Resource Capsules (Energy, Coins, Gems) */}
        <div className="flex items-center gap-1.5 flex-1 justify-center min-w-0">
          
          {/* 1. Energy Capsule */}
          <div className="flex flex-col items-center">
            <div
              onClick={onOpenEnergyShop || onOpenShop}
              className="flex items-center bg-gradient-to-r from-emerald-950 to-teal-900 border-2 border-emerald-500/60 rounded-full pl-1 pr-0.5 py-0.5 shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
              title="Energy - Tap to refill"
            >
              {/* Lightning Icon */}
              <div className="w-4 h-4 rounded-full bg-amber-400 border border-amber-200 flex items-center justify-center shadow-inner flex-shrink-0">
                <Zap className="w-2.5 h-2.5 text-slate-950 fill-slate-950" />
              </div>

              {/* Energy Amount */}
              <span className="text-xs font-black text-white px-1 tracking-tight">
                {state.energy}
              </span>

              {/* Green Plus Button */}
              <div className="w-4 h-4 rounded-full bg-emerald-500 hover:bg-emerald-400 border border-emerald-300 flex items-center justify-center text-white shadow flex-shrink-0">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
            </div>

            {/* Recharge timer subtext */}
            {state.energy < state.maxEnergy && (
              <span className="text-[8px] font-mono font-bold text-emerald-300 leading-none mt-0.5">
                {timeFormatted}
              </span>
            )}
          </div>

          {/* 2. Coins Capsule */}
          <div
            onClick={onOpenShop}
            className="flex items-center bg-gradient-to-r from-slate-950 to-indigo-950 border-2 border-amber-500/60 rounded-full pl-1 pr-0.5 py-0.5 shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
            title="Coins - Tap to visit shop"
          >
            {/* Coin Icon */}
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border border-amber-200 flex items-center justify-center text-[10px] shadow-inner flex-shrink-0">
              🪙
            </div>

            {/* Coins Amount */}
            <span className="text-xs font-black text-amber-200 px-1 tracking-tight">
              {state.coins.toLocaleString()}
            </span>

            {/* Green Plus Button */}
            <div className="w-4 h-4 rounded-full bg-emerald-500 hover:bg-emerald-400 border border-emerald-300 flex items-center justify-center text-white shadow flex-shrink-0">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          </div>

          {/* 3. Gems Capsule */}
          <div
            onClick={onOpenShop}
            className="flex items-center bg-gradient-to-r from-slate-950 to-purple-950 border-2 border-purple-500/60 rounded-full pl-1 pr-0.5 py-0.5 shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
            title="Gems - Tap to visit market"
          >
            {/* Gem Icon */}
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-fuchsia-600 to-pink-400 border border-fuchsia-200 flex items-center justify-center text-[9px] shadow-inner flex-shrink-0">
              💎
            </div>

            {/* Gems Amount */}
            <span className="text-xs font-black text-fuchsia-200 px-1 tracking-tight">
              {state.gems}
            </span>

            {/* Green Plus Button */}
            <div className="w-4 h-4 rounded-full bg-emerald-500 hover:bg-emerald-400 border border-emerald-300 flex items-center justify-center text-white shadow flex-shrink-0">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Right: Fantasy Shop / Market Stall & Quick Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Market Stall Button */}
          {onOpenShop && (
            <button
              onClick={onOpenShop}
              id="btn-open-shop"
              className="relative p-1.5 rounded-2xl bg-gradient-to-b from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 border-2 border-amber-300 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
              title="Kingdom Market"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950" />
            </button>
          )}

          {/* Settings / Menu */}
          <button
            onClick={onOpenSettings}
            id="btn-settings"
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 shadow cursor-pointer transition-colors"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Dev Tools */}
          <button
            onClick={onOpenDev}
            id="btn-dev-tools"
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-amber-500/30 shadow cursor-pointer transition-colors"
            title="Dev Tools"
          >
            <Wrench className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};


