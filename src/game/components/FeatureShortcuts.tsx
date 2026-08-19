import React from 'react';
import { Gift, BookOpen, Scroll, Zap, Castle } from 'lucide-react';

interface FeatureShortcutsProps {
  onOpenDailyRewards: () => void;
  onOpenQuests: () => void;
  onOpenCompendium: () => void;
  onOpenKingdom: () => void;
  onOpenShop: () => void;
  hasUnclaimedDailyReward?: boolean;
  hasUnclaimedQuests?: boolean;
  hasUnclaimedDiscoveries?: boolean;
}

export const FeatureShortcuts: React.FC<FeatureShortcutsProps> = ({
  onOpenDailyRewards,
  onOpenQuests,
  onOpenCompendium,
  onOpenKingdom,
  onOpenShop,
  hasUnclaimedDailyReward,
  hasUnclaimedQuests,
  hasUnclaimedDiscoveries,
}) => {
  return (
    <div className="w-full px-3 py-1 flex items-center justify-between gap-1.5 select-none z-10">
      {/* 1. Daily Gift / Reward */}
      <button
        onClick={onOpenDailyRewards}
        className="group relative flex flex-col items-center justify-center p-1.5 rounded-2xl bg-gradient-to-b from-purple-800/90 to-indigo-950/95 border-2 border-amber-400/60 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Daily Rewards"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <Gift className="w-5 h-5 text-amber-300 group-hover:rotate-6 transition-transform" />
          {hasUnclaimedDailyReward && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-[9px] font-black text-white rounded-full flex items-center justify-center border border-white animate-pulse">
              1
            </span>
          )}
        </div>
        <span className="text-[8px] font-extrabold text-amber-200 tracking-tight leading-none mt-0.5">
          Gifts
        </span>
      </button>

      {/* 2. Quests / Daily Chests */}
      <button
        onClick={onOpenQuests}
        className="group relative flex flex-col items-center justify-center p-1.5 rounded-2xl bg-gradient-to-b from-amber-700/90 to-amber-950/95 border-2 border-amber-400/60 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Quests & Daily Tasks"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <Scroll className="w-5 h-5 text-amber-300 group-hover:-rotate-6 transition-transform" />
          {hasUnclaimedQuests && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-[9px] font-black text-white rounded-full flex items-center justify-center border border-white animate-pulse">
              !
            </span>
          )}
        </div>
        <span className="text-[8px] font-extrabold text-amber-200 tracking-tight leading-none mt-0.5">
          Tasks
        </span>
      </button>

      {/* 3. Compendium */}
      <button
        onClick={onOpenCompendium}
        className="group relative flex flex-col items-center justify-center p-1.5 rounded-2xl bg-gradient-to-b from-emerald-800/90 to-teal-950/95 border-2 border-emerald-400/60 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Flora & Magic Compendium"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
          {hasUnclaimedDiscoveries && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-[9px] font-black text-white rounded-full flex items-center justify-center border border-white animate-pulse">
              New
            </span>
          )}
        </div>
        <span className="text-[8px] font-extrabold text-emerald-200 tracking-tight leading-none mt-0.5">
          Tome
        </span>
      </button>

      {/* 4. Kingdom Realm */}
      <button
        onClick={onOpenKingdom}
        className="group relative flex flex-col items-center justify-center p-1.5 rounded-2xl bg-gradient-to-b from-blue-800/90 to-indigo-950/95 border-2 border-blue-400/60 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Kingdom Restoration"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <Castle className="w-5 h-5 text-blue-200 group-hover:scale-110 transition-transform" />
        </div>
        <span className="text-[8px] font-extrabold text-blue-200 tracking-tight leading-none mt-0.5">
          Realm
        </span>
      </button>

      {/* 5. Energy & Refills */}
      <button
        onClick={onOpenShop}
        className="group relative flex flex-col items-center justify-center p-1.5 rounded-2xl bg-gradient-to-b from-cyan-700/90 to-slate-900/95 border-2 border-cyan-400/60 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Energy Boosts & Refills"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
        </div>
        <span className="text-[8px] font-extrabold text-cyan-200 tracking-tight leading-none mt-0.5">
          Boost
        </span>
      </button>
    </div>
  );
};
