import React from 'react';
import { Scroll, Sparkles, CheckCircle2, Award, Zap, Coins, Gem } from 'lucide-react';
import { Quest } from '../types';

interface QuestModalProps {
  quests: Quest[];
  onClaimQuest: (questId: string) => void;
  onClose?: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({
  quests,
  onClaimQuest,
}) => {
  return (
    <div className="w-full h-full overflow-y-auto px-3 py-4 space-y-4 max-w-md mx-auto pb-24 select-none">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-950/80 via-slate-900 to-amber-900/80 border border-amber-500/30 p-4 shadow-xl backdrop-blur-md text-white">
        <div className="flex items-center gap-2 mb-1">
          <Scroll className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-black text-amber-200">Realm Quests & Trials</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Complete special adventures and crafting milestones to earn generous caches of Coins, Energy, and Arcane Gems!
        </p>
      </div>

      {/* Quest List */}
      <div className="space-y-3">
        {quests.map((quest) => {
          const progressPercent = Math.min(100, Math.round((quest.current / quest.target) * 100));

          return (
            <div
              key={quest.id}
              className={`rounded-3xl p-4 border transition-all shadow-lg backdrop-blur-md ${
                quest.isClaimed
                  ? 'bg-slate-950/60 border-slate-800 opacity-60'
                  : quest.isCompleted
                  ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900/90 border-emerald-500/50 shadow-emerald-500/10'
                  : 'bg-slate-900/90 border-slate-700/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <h3 className="text-sm font-black text-white">{quest.title}</h3>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {quest.current}/{quest.target}
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">
                {quest.description}
              </p>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-3">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Rewards & Claim */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-amber-300">🪙 +{quest.rewards.coins}</span>
                  <span className="text-purple-300">✨ +{quest.rewards.xp} XP</span>
                  {quest.rewards.gems && (
                    <span className="text-pink-300">💎 +{quest.rewards.gems}</span>
                  )}
                  {quest.rewards.energy && (
                    <span className="text-cyan-300">⚡ +{quest.rewards.energy}</span>
                  )}
                </div>

                {quest.isClaimed ? (
                  <span className="text-xs font-bold text-slate-500">Claimed</span>
                ) : (
                  <button
                    disabled={!quest.isCompleted}
                    onClick={() => onClaimQuest(quest.id)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                      quest.isCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 hover:brightness-110 cursor-pointer animate-bounce'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                    }`}
                  >
                    {quest.isCompleted ? 'Claim!' : 'In Progress'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
