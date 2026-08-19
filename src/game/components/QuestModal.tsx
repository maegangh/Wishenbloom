import React, { useState } from 'react';
import { Scroll, Sparkles, CheckCircle2, Award, Zap, Coins, Gem, Calendar, Gift, Check, Clock } from 'lucide-react';
import { Quest, DailyTaskState } from '../types';
import { DAILY_COMPLETION_REWARD } from '../data/dailyTasks';
import { ITEMS } from '../data/items';

interface QuestModalProps {
  quests: Quest[];
  dailyTasks: DailyTaskState[];
  dailyCompletionClaimed: boolean;
  onClaimQuest: (questId: string) => void;
  onClaimDailyTask: (taskId: string) => void;
  onClaimDailyCompletionReward: () => void;
  onClose?: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({
  quests,
  dailyTasks,
  dailyCompletionClaimed,
  onClaimQuest,
  onClaimDailyTask,
  onClaimDailyCompletionReward,
}) => {
  const [subTab, setSubTab] = useState<'daily' | 'story'>('daily');

  const completedDailyCount = dailyTasks.filter((t) => t.isCompleted).length;
  const allDailyCompleted = dailyTasks.length > 0 && dailyTasks.every((t) => t.isCompleted);
  const hasUnclaimedDailyTasks = dailyTasks.some((t) => t.isCompleted && !t.isClaimed);
  const hasUnclaimedDailyCompletion = allDailyCompleted && !dailyCompletionClaimed;
  const hasUnclaimedQuests = quests.some((q) => q.isCompleted && !q.isClaimed);

  const chestItem = DAILY_COMPLETION_REWARD.chestItemId ? ITEMS[DAILY_COMPLETION_REWARD.chestItemId] : null;

  return (
    <div className="w-full h-full overflow-y-auto px-3 py-4 space-y-4 max-w-md mx-auto pb-24 select-none">
      {/* Sub-Tab Navigation Bar */}
      <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800 shadow-md">
        <button
          onClick={() => setSubTab('daily')}
          id="tab-daily-tasks"
          className={`flex-1 py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
            subTab === 'daily'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Daily Tasks</span>
          {(hasUnclaimedDailyTasks || hasUnclaimedDailyCompletion) && (
            <span className="w-2 h-2 rounded-full bg-pink-500 ring-2 ring-slate-950 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setSubTab('story')}
          id="tab-story-quests"
          className={`flex-1 py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
            subTab === 'story'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scroll className="w-3.5 h-3.5" />
          <span>Story Quests</span>
          {hasUnclaimedQuests && (
            <span className="w-2 h-2 rounded-full bg-pink-500 ring-2 ring-slate-950 animate-pulse" />
          )}
        </button>
      </div>

      {subTab === 'daily' && (
        <div className="space-y-4">
          {/* Daily Completion Bonus Card */}
          <div className="rounded-3xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-900 border border-amber-500/40 p-4 shadow-xl text-white relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl">
                  🎁
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-200">Daily Completion Chest</h3>
                  <p className="text-[11px] text-slate-300">Complete all 3 tasks to unlock bonus bounty!</p>
                </div>
              </div>

              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-slate-950 border border-amber-500/30 text-amber-300">
                {completedDailyCount}/3
              </span>
            </div>

            {/* Rewards row */}
            <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-amber-300">🪙 +{DAILY_COMPLETION_REWARD.coins}</span>
                <span className="text-cyan-300">⚡ +{DAILY_COMPLETION_REWARD.energy}</span>
                <span className="text-purple-300">💎 +{DAILY_COMPLETION_REWARD.gems}</span>
                {chestItem && <span className="text-amber-200">📦 Chest</span>}
              </div>

              {dailyCompletionClaimed ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Claimed Today
                </span>
              ) : (
                <button
                  disabled={!allDailyCompleted}
                  onClick={onClaimDailyCompletionReward}
                  id="btn-claim-daily-completion"
                  className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                    allDailyCompleted
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/30 hover:brightness-110 cursor-pointer animate-bounce'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                  }`}
                >
                  {allDailyCompleted ? 'Claim Chest!' : 'Locked (0/3)'}
                </button>
              )}
            </div>
          </div>

          {/* Daily Tasks List */}
          <div className="space-y-3">
            {dailyTasks.map((task) => {
              const progressPercent = Math.min(100, Math.round((task.current / task.target) * 100));

              return (
                <div
                  key={task.id}
                  className={`rounded-3xl p-4 border transition-all shadow-lg backdrop-blur-md ${
                    task.isClaimed
                      ? 'bg-slate-950/60 border-slate-800 opacity-60'
                      : task.isCompleted
                      ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900/90 border-emerald-500/50 shadow-emerald-500/10'
                      : 'bg-slate-900/90 border-slate-700/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <h4 className="text-sm font-black text-white">{task.title}</h4>
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      {task.current}/{task.target}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">
                    {task.description}
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
                      {task.rewards.coins && <span className="text-amber-300">🪙 +{task.rewards.coins}</span>}
                      {task.rewards.xp && <span className="text-purple-300">✨ +{task.rewards.xp} XP</span>}
                      {task.rewards.gems && <span className="text-pink-300">💎 +{task.rewards.gems}</span>}
                      {task.rewards.energy && <span className="text-cyan-300">⚡ +{task.rewards.energy}</span>}
                    </div>

                    {task.isClaimed ? (
                      <span className="text-xs font-bold text-slate-500">Claimed</span>
                    ) : (
                      <button
                        disabled={!task.isCompleted}
                        onClick={() => onClaimDailyTask(task.id)}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                          task.isCompleted
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 hover:brightness-110 cursor-pointer animate-bounce'
                            : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                        }`}
                      >
                        {task.isCompleted ? 'Claim!' : 'In Progress'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 py-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Tasks refresh every day at 00:00 UTC</span>
          </div>
        </div>
      )}

      {subTab === 'story' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="rounded-3xl bg-gradient-to-br from-amber-950/80 via-slate-900 to-amber-900/80 border border-amber-500/30 p-4 shadow-xl backdrop-blur-md text-white">
            <div className="flex items-center gap-2 mb-1">
              <Scroll className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-black text-amber-200">Realm Story Quests</h2>
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
      )}
    </div>
  );
};
