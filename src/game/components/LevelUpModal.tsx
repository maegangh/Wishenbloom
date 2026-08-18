import React from 'react';
import { Sparkles, Trophy, Zap, Coins, Gem, ArrowRight, BookOpen, Hammer, Crown, Feather, Archive } from 'lucide-react';
import { LevelProgressionDef, LevelRewards } from '../data/progression';
import { BALANCE } from '../data/balance';
import { NpcAvatar } from './NpcAvatar';

interface LevelUpModalProps {
  level: number;
  progression?: LevelProgressionDef;
  rewards: LevelRewards;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  level,
  progression,
  rewards,
  onClose,
}) => {
  const isChapterMilestone = level === 10 || level === 20 || progression?.isChapterMilestone;
  const milestoneLabel = level === 20 ? 'Chapter 2 Milestone' : 'Chapter 1 Milestone';
  const unlocks = progression?.unlocks;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center text-white relative overflow-hidden border-2 ${
          isChapterMilestone
            ? 'bg-gradient-to-b from-amber-950 via-slate-900 to-indigo-950 border-yellow-400 shadow-amber-500/40'
            : 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-amber-400'
        }`}
      >
        {/* Glow Effects */}
        <div
          className={`absolute -top-12 -left-12 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
            isChapterMilestone ? 'bg-yellow-400/30' : 'bg-amber-500/20'
          }`}
        />
        <div
          className={`absolute -bottom-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
            isChapterMilestone ? 'bg-amber-500/30' : 'bg-purple-500/20'
          }`}
        />

        {/* Level Badge Icon */}
        <div
          className={`mx-auto w-20 h-20 rounded-full p-1 shadow-2xl flex items-center justify-center mb-3 ${
            isChapterMilestone
              ? 'bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-100 ring-4 ring-yellow-400/40 animate-pulse'
              : 'bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300'
          }`}
        >
          <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
            {isChapterMilestone ? (
              <Crown className="w-7 h-7 text-yellow-300 mb-0.5" />
            ) : (
              <Trophy className="w-6 h-6 text-yellow-300 mb-0.5" />
            )}
            <span className="text-xl font-black text-amber-300 leading-none">LV {level}</span>
          </div>
        </div>

        {/* Title & Subtitle */}
        {isChapterMilestone && (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/50 text-[11px] font-black text-yellow-300 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>{milestoneLabel}</span>
          </div>
        )}

        <h2 className="text-2xl font-black text-amber-200 tracking-tight mb-0.5">
          {progression?.title || `Level ${level} Reached!`}
        </h2>
        {progression?.subtitle && (
          <p className="text-xs font-bold text-amber-400 mb-2">
            {progression.subtitle}
          </p>
        )}

        {/* Story Snippet */}
        {progression?.storySnippet && (
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-500/20 mb-3 text-left">
            <p className="text-[11px] text-slate-300 italic leading-relaxed">
              "{progression.storySnippet}"
            </p>
          </div>
        )}

        {/* Unlocks Overview */}
        {unlocks && (unlocks.generatorName || unlocks.chainName || unlocks.npcName || unlocks.mechanicName) && (
          <div className="mb-3 space-y-1.5 text-left">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span>What's New:</span>
            </div>

            {unlocks.generatorName && (
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">New Generator:</span>
                <span className="font-black text-emerald-300">{unlocks.generatorName}</span>
              </div>
            )}

            {unlocks.chainName && (
              <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">New Item Chain:</span>
                <span className="font-black text-purple-300">{unlocks.chainName}</span>
              </div>
            )}

            {unlocks.npcName && (
              <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">New Citizen:</span>
                <span className="font-black text-cyan-300">{unlocks.npcName} ({unlocks.npcRole})</span>
              </div>
            )}

            {unlocks.mechanicName && (
              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Feature:</span>
                <span className="font-black text-amber-300">{unlocks.mechanicName}</span>
              </div>
            )}
          </div>
        )}

        {/* Rewards Box */}
        <div className="bg-slate-950/80 rounded-2xl p-3 border border-amber-500/30 mb-4 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-lg">🪙</span>
            <span className="text-xs font-black text-amber-300">+{rewards.coins}</span>
            <span className="text-[9px] text-slate-400 font-bold">Coins</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-lg">💎</span>
            <span className="text-xs font-black text-purple-300">+{rewards.gems}</span>
            <span className="text-[9px] text-slate-400 font-bold">Gems</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-lg">⚡</span>
            <span className="text-xs font-black text-cyan-300">Full Refill</span>
            <span className="text-[9px] text-slate-400 font-bold">Energy</span>
          </div>

          {rewards.chestItemId && (
            <div className="flex flex-col items-center">
              <span className="text-lg">🎁</span>
              <span className="text-xs font-black text-yellow-300">Golden Chest</span>
              <span className="text-[9px] text-slate-400 font-bold">Bonus</span>
            </div>
          )}

          {rewards.inventorySlotsAdded && (
            <div className="flex flex-col items-center">
              <span className="text-lg">🎒</span>
              <span className="text-xs font-black text-emerald-300">+1 Slot</span>
              <span className="text-[9px] text-slate-400 font-bold">Pocket</span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer ${
            isChapterMilestone
              ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 text-slate-950 shadow-yellow-500/40'
              : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/30'
          }`}
        >
          {isChapterMilestone ? BALANCE.CHAPTER_2_CTA_TEXT : 'Claim & Continue Merging'}
        </button>
      </div>
    </div>
  );
};
