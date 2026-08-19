import React from 'react';
import { Gift, Sparkles, Check, Clock, X, Zap, Gem, ShieldAlert } from 'lucide-react';
import { DAILY_REWARDS_CYCLE, isDailyRewardClaimable, getNextDailyRewardCycleDay } from '../data/dailyRewards';
import { ITEMS } from '../data/items';

interface DailyRewardModalProps {
  currentCycleDay: number; // 1 to 7
  lastClaimDate: string | null;
  onClaim: () => void;
  onClose: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  currentCycleDay,
  lastClaimDate,
  onClaim,
  onClose,
}) => {
  const canClaim = isDailyRewardClaimable(lastClaimDate);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/90 border border-amber-500/40 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          id="btn-close-daily-modal"
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 mb-2 shadow-lg shadow-amber-500/30">
            <Gift className="w-6 h-6 animate-bounce" />
          </div>
          <h2 className="text-xl font-black text-amber-200 tracking-tight">Daily Realm Gifts</h2>
          <p className="text-xs text-slate-300 mt-1">
            Return every day for magical bounties! No streaks lost if you miss a day.
          </p>
        </div>

        {/* 7-Day Cycle Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {DAILY_REWARDS_CYCLE.map((dayDef) => {
            const isCurrent = dayDef.day === currentCycleDay;
            const isPast = dayDef.day < currentCycleDay || (dayDef.day === currentCycleDay && !canClaim);
            const isDay7 = dayDef.day === 7;
            const chestItem = dayDef.rewards.chestItemId ? ITEMS[dayDef.rewards.chestItemId] : null;

            return (
              <div
                key={dayDef.day}
                className={`relative rounded-2xl p-2 flex flex-col items-center justify-between border transition-all ${
                  isDay7 ? 'col-span-2' : 'col-span-1'
                } ${
                  isCurrent && canClaim
                    ? 'bg-gradient-to-b from-amber-900/90 to-yellow-950/90 border-amber-400 shadow-lg shadow-amber-500/20 scale-105 ring-2 ring-amber-400/50'
                    : isCurrent && !canClaim
                    ? 'bg-slate-800/90 border-amber-500/40 text-amber-200/90'
                    : isPast
                    ? 'bg-slate-950/70 border-slate-800 opacity-60 text-slate-500'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300'
                }`}
              >
                {/* Day Header Badge */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Day {dayDef.day}
                  </span>
                  {isPast && !isCurrent && (
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                  {isCurrent && canClaim && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </div>

                {/* Day Graphic / Rewards Display */}
                <div className="my-1 flex flex-col items-center justify-center text-center">
                  {chestItem ? (
                    <div className="relative">
                      <span className="text-2xl filter drop-shadow">{dayDef.icon || '🎁'}</span>
                      {isDay7 && (
                        <span className="absolute -bottom-1 -right-1 text-[9px] bg-purple-950/90 text-purple-200 border border-purple-500/40 px-1 rounded-full font-bold">
                          Royal
                        </span>
                      )}
                    </div>
                  ) : dayDef.rewards.energy ? (
                    <div className="flex flex-col items-center">
                      <Zap className="w-6 h-6 text-cyan-400 fill-cyan-400 drop-shadow" />
                      <span className="text-[10px] font-bold text-cyan-300">+{dayDef.rewards.energy}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-xl">🪙</span>
                      <span className="text-[10px] font-bold text-amber-300">+{dayDef.rewards.coins}</span>
                    </div>
                  )}

                  {/* Additional mini badges */}
                  <div className="flex items-center gap-1 mt-1">
                    {dayDef.rewards.coins && !chestItem && !dayDef.rewards.energy && (
                      <span className="text-[9px] text-amber-300 font-semibold">🪙 {dayDef.rewards.coins}</span>
                    )}
                    {dayDef.rewards.gems && (
                      <span className="text-[9px] text-purple-300 font-semibold">💎 +{dayDef.rewards.gems}</span>
                    )}
                  </div>
                </div>

                {/* Status tag */}
                <div className="text-[9px] font-bold mt-1">
                  {isPast && !isCurrent ? (
                    <span className="text-emerald-400">Claimed</span>
                  ) : isCurrent && canClaim ? (
                    <span className="text-amber-300 animate-pulse font-black">Ready!</span>
                  ) : isCurrent && !canClaim ? (
                    <span className="text-slate-400">Claimed Today</span>
                  ) : (
                    <span className="text-slate-500">Upcoming</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Claim or Waiting Status Button */}
        {canClaim ? (
          <button
            onClick={() => {
              onClaim();
              onClose();
            }}
            id="btn-claim-daily-reward"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer animate-pulse flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            Claim Day {currentCycleDay} Gift!
          </button>
        ) : (
          <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Next gift unlocks tomorrow at 00:00 UTC</span>
            </div>
            <span className="text-amber-300 font-bold">Come Back Soon!</span>
          </div>
        )}
      </div>
    </div>
  );
};
