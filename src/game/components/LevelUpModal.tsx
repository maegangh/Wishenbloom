import React from 'react';
import { Sparkles, Trophy, Zap, Coins, Gem } from 'lucide-react';

interface LevelUpModalProps {
  level: number;
  rewards: {
    coins: number;
    gems: number;
    energy: number;
  };
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  level,
  rewards,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400 rounded-3xl p-6 shadow-2xl text-center text-white relative overflow-hidden">
        {/* Confetti / Sparkle glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Level Badge Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 p-1 shadow-2xl flex items-center justify-center mb-3">
          <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
            <Trophy className="w-6 h-6 text-yellow-300 mb-0.5" />
            <span className="text-xl font-black text-amber-300 leading-none">LV {level}</span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-amber-200 tracking-tight mb-1">
          Level Up!
        </h2>
        <p className="text-xs text-slate-300 mb-4">
          Your mystical prowess expands! The realm of Mergevale celebrates your achievements.
        </p>

        {/* Rewards Box */}
        <div className="bg-slate-950/70 rounded-2xl p-3.5 border border-amber-500/30 mb-5 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-xl">🪙</span>
            <span className="text-xs font-black text-amber-300">+{rewards.coins}</span>
            <span className="text-[10px] text-slate-400 font-bold">Coins</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xl">💎</span>
            <span className="text-xs font-black text-purple-300">+{rewards.gems}</span>
            <span className="text-[10px] text-slate-400 font-bold">Gems</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xl">⚡</span>
            <span className="text-xs font-black text-cyan-300">Full Refill</span>
            <span className="text-[10px] text-slate-400 font-bold">Energy</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
        >
          Claim & Continue
        </button>
      </div>
    </div>
  );
};
