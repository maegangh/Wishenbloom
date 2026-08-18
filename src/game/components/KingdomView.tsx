import React from 'react';
import { Hammer, Sparkles, CheckCircle2, ChevronRight, Coins, Lock } from 'lucide-react';
import { KingdomArea } from '../types';

interface KingdomViewProps {
  areas: KingdomArea[];
  playerCoins: number;
  playerLevel: number;
  onRestoreStage: (areaId: string) => void;
  onClose?: () => void;
}

export const KingdomView: React.FC<KingdomViewProps> = ({
  areas,
  playerCoins,
  playerLevel,
  onRestoreStage,
}) => {
  return (
    <div className="w-full h-full overflow-y-auto px-3 py-4 space-y-4 max-w-md mx-auto pb-24 select-none">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-950/80 via-slate-900 to-indigo-950/90 border border-amber-500/30 p-4 shadow-xl backdrop-blur-md text-white">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-black text-amber-200">Kingdom of Wishenbloom</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Restore the dormant ruins of your fantasy realm and rekindle the ancient power of the Bloom. Rebuild glorious plazas, magical sanctuaries, and ancient towers to unlock powerful story lore and awaken mystical guardians!
        </p>
      </div>

      {/* Area Cards */}
      <div className="space-y-4">
        {areas.map((area) => {
          const isUnlocked = playerLevel >= area.unlockedAtLevel;
          const isFullyRestored = area.currentStage >= area.maxStages;
          const currentStageData = area.stages[area.currentStage];
          const progressPercent = Math.round((area.currentStage / area.maxStages) * 100);
          const canAfford = currentStageData && playerCoins >= currentStageData.costCoins;

          return (
            <div
              key={area.id}
              className={`rounded-3xl border transition-all p-4 shadow-xl backdrop-blur-md ${
                !isUnlocked
                  ? 'bg-slate-950/70 border-slate-800 opacity-60'
                  : isFullyRestored
                  ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900/90 border-emerald-500/40 shadow-emerald-500/10'
                  : `bg-gradient-to-br ${area.bgGradient} border-slate-700/60 shadow-lg`
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    {area.category}
                  </span>
                  <h3 className="text-base font-black text-white">{area.name}</h3>
                </div>

                {!isUnlocked ? (
                  <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-full text-[10px] font-bold text-slate-400 border border-slate-700">
                    <Lock className="w-3 h-3" />
                    <span>Unlocks Lv.{area.unlockedAtLevel}</span>
                  </div>
                ) : isFullyRestored ? (
                  <div className="flex items-center gap-1 bg-emerald-900/80 text-emerald-300 px-2.5 py-1 rounded-full text-xs font-black border border-emerald-400/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Restored</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                    Stage {area.currentStage}/{area.maxStages}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                {area.description}
              </p>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800 mb-3">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Current Objective or Completed Status */}
              {isUnlocked && !isFullyRestored && currentStageData && (
                <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-300">
                        Current Objective:
                      </span>
                      <h4 className="text-xs font-black text-white">{currentStageData.name}</h4>
                    </div>
                    <span className="text-xs font-bold text-purple-300">
                      +{currentStageData.rewardXp} XP
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {currentStageData.description}
                  </p>

                  <button
                    disabled={!canAfford}
                    onClick={() => onRestoreStage(area.id)}
                    className={`mt-1 w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-98'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                    }`}
                  >
                    <Hammer className="w-4 h-4" />
                    <span>Restore ({currentStageData.costCoins.toLocaleString()} 🪙)</span>
                  </button>
                </div>
              )}

              {/* Completed Lore celebration */}
              {isFullyRestored && (
                <div className="bg-emerald-950/40 rounded-2xl p-2.5 border border-emerald-500/30 flex items-center gap-2 text-xs font-medium text-emerald-200">
                  <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>This landmark radiates supreme magical energy across the kingdom!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
