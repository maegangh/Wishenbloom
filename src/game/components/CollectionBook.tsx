import React, { useState } from 'react';
import { BookOpen, Sparkles, Gem, Check, Award, ChevronRight, Zap, Coins } from 'lucide-react';
import { ItemChainId, ItemDef } from '../types';
import { ITEMS, ITEM_CHAINS } from '../data/items';
import { COMPENDIUM_MILESTONES } from '../data/compendiumMilestones';
import { ItemIcon } from './ItemIcon';

interface CollectionBookProps {
  discoveredItemIds: string[];
  claimedDiscoveryRewardIds: string[];
  claimedCompendiumMilestoneIds?: string[];
  onClaimReward: (itemId: string) => void;
  onClaimMilestone?: (milestoneId: string) => void;
}

export const CollectionBook: React.FC<CollectionBookProps> = ({
  discoveredItemIds,
  claimedDiscoveryRewardIds,
  claimedCompendiumMilestoneIds = [],
  onClaimReward,
  onClaimMilestone,
}) => {
  const chainKeys: ItemChainId[] = [
    'herbs',
    'potions',
    'spellbooks',
    'treasures',
    'blacksmith',
    'creatures',
    'textiles',
    'crystals',
    'provisions',
    'lanterns',
  ];
  const [viewMode, setViewMode] = useState<'chains' | 'milestones'>('chains');
  const [activeChain, setActiveChain] = useState<ItemChainId>('herbs');
  const [selectedItem, setSelectedItem] = useState<ItemDef | null>(null);

  const chain = ITEM_CHAINS[activeChain] || ITEM_CHAINS.herbs;

  // Get items in active chain sorted by tier
  const chainItems = Object.values(ITEMS)
    .filter((i) => i.chainId === activeChain)
    .sort((a, b) => a.tier - b.tier);

  const discoveredCount = chainItems.filter((i) => discoveredItemIds.includes(i.id)).length;

  // Milestone calculation helpers
  const countTier6Chains = () => {
    let count = 0;
    for (const key of chainKeys) {
      const hasTier6 = Object.values(ITEMS).some(
        (it) => it.chainId === key && it.tier >= 6 && discoveredItemIds.includes(it.id)
      );
      if (hasTier6) count++;
    }
    return count;
  };

  const countTier8Items = () => {
    return Object.values(ITEMS).filter((it) => it.tier >= 8 && discoveredItemIds.includes(it.id)).length;
  };

  const tier6ChainsDiscovered = countTier6Chains();
  const tier8ItemsDiscovered = countTier8Items();

  const getMilestoneProgress = (mId: string) => {
    if (mId.startsWith('milestone_discover_')) {
      return discoveredItemIds.length;
    }
    if (mId === 'milestone_tier_6_any' || mId === 'milestone_tier_6_three') {
      return tier6ChainsDiscovered;
    }
    if (mId === 'milestone_tier_8_master') {
      return tier8ItemsDiscovered;
    }
    return 0;
  };

  const unclaimedMilestonesCount = COMPENDIUM_MILESTONES.filter((m) => {
    const progress = getMilestoneProgress(m.id);
    const isCompleted = progress >= m.target;
    const isClaimed = claimedCompendiumMilestoneIds.includes(m.id);
    return isCompleted && !isClaimed;
  }).length;

  return (
    <div className="w-full h-full overflow-y-auto px-3 py-4 space-y-4 max-w-md mx-auto pb-24 select-none">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/90 border border-indigo-500/30 p-4 shadow-xl backdrop-blur-md text-white">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-black text-purple-200">Discovery Compendium</h2>
          </div>
          <span className="text-xs font-black bg-purple-900/80 px-2.5 py-1 rounded-full border border-purple-500/40 text-purple-300">
            {discoveredItemIds.length} Discovered
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Merge items on the board to discover new tiers, uncover secret lore, and claim rare Arcane Gems!
        </p>

        {/* View Switcher: Item Chains vs Collection Milestones */}
        <div className="grid grid-cols-2 gap-2 mt-3 bg-slate-950/60 p-1 rounded-2xl border border-indigo-500/20">
          <button
            onClick={() => setViewMode('chains')}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === 'chains'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Item Chains</span>
          </button>
          <button
            onClick={() => setViewMode('milestones')}
            className={`relative py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === 'milestones'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Milestones</span>
            {unclaimedMilestonesCount > 0 && (
              <span className="px-1.5 py-0.2 text-[9px] font-black bg-pink-500 text-white rounded-full">
                {unclaimedMilestonesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {viewMode === 'chains' ? (
        <>
          {/* Chain Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {chainKeys.map((cKey) => {
              const cDef = ITEM_CHAINS[cKey];
              if (!cDef) return null;
              const isActive = activeChain === cKey;

              return (
                <button
                  key={cKey}
                  onClick={() => {
                    setActiveChain(cKey);
                    setSelectedItem(null);
                  }}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30 scale-105'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cDef.name.replace(' Chain', '')}
                </button>
              );
            })}
          </div>

          {/* Active Chain Info & Progress */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-black text-white">{chain.name}</h3>
                <p className="text-[11px] text-slate-400">{chain.description}</p>
              </div>
              <span className="text-xs font-bold text-amber-300 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                {discoveredCount}/{chainItems.length}
              </span>
            </div>

            {/* Item Grid in Chain */}
            <div className="grid grid-cols-4 gap-2.5 my-3">
              {chainItems.map((item) => {
                const isDiscovered = discoveredItemIds.includes(item.id);
                const isClaimed = claimedDiscoveryRewardIds.includes(item.id);
                const isSelected = selectedItem?.id === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isDiscovered) setSelectedItem(item);
                    }}
                    className={`relative aspect-square rounded-2xl border flex flex-col items-center justify-center p-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/70 border-purple-400 scale-105 shadow-lg shadow-purple-500/20'
                        : isDiscovered
                        ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                        : 'bg-slate-950/80 border-slate-900 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    {isDiscovered ? (
                      <>
                        <ItemIcon itemId={item.id} size={40} showTierBadge={false} />
                        <span className="text-[9px] font-bold text-slate-300 mt-1 truncate w-full text-center">
                          T{item.tier}
                        </span>
                        {!isClaimed && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-pink-500 border border-white animate-ping" />
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-700">
                        <span className="text-lg font-black">?</span>
                        <span className="text-[9px] font-bold text-slate-600">T{item.tier}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Item Lore & Claim Rewards */}
            {selectedItem && (
              <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-purple-500/30 mt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ItemIcon itemId={selectedItem.id} size={36} />
                    <div>
                      <h4 className="text-xs font-black text-amber-200">{selectedItem.name}</h4>
                      <span className="text-[10px] font-semibold text-purple-300">
                        Tier {selectedItem.tier} • {selectedItem.rarity.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Claim Reward Button */}
                  {!claimedDiscoveryRewardIds.includes(selectedItem.id) ? (
                    <button
                      onClick={() => onClaimReward(selectedItem.id)}
                      className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 font-black text-xs text-white shadow-lg shadow-purple-500/30 flex items-center gap-1 cursor-pointer animate-pulse"
                    >
                      <Gem className="w-3.5 h-3.5" />
                      <span>+{Math.max(1, Math.floor(selectedItem.tier / 2))} Gems</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                      <Check className="w-3 h-3" /> Claimed
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{selectedItem.description}"
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Milestones View */
        <div className="space-y-3">
          {COMPENDIUM_MILESTONES.map((m) => {
            const currentProgress = getMilestoneProgress(m.id);
            const isCompleted = currentProgress >= m.target;
            const isClaimed = claimedCompendiumMilestoneIds.includes(m.id);
            const percent = Math.min(100, Math.round((currentProgress / m.target) * 100));

            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isClaimed
                    ? 'bg-slate-900/60 border-slate-800 opacity-70'
                    : isCompleted
                    ? 'bg-gradient-to-r from-purple-950/70 to-indigo-950/70 border-purple-500/50 shadow-lg shadow-purple-900/20'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Award className={`w-4 h-4 ${isCompleted ? 'text-amber-400' : 'text-slate-500'}`} />
                      <h4 className="text-xs font-black text-white">{m.title}</h4>
                      {m.badgeTitle && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-900/80 text-indigo-300 border border-indigo-500/30">
                          {m.badgeTitle}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{m.description}</p>
                  </div>

                  {/* Reward / Action */}
                  <div>
                    {isClaimed ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/50 px-2 py-1 rounded-lg border border-emerald-500/30">
                        <Check className="w-3 h-3" /> Done
                      </span>
                    ) : isCompleted ? (
                      <button
                        onClick={() => onClaimMilestone && onClaimMilestone(m.id)}
                        className="py-1 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 cursor-pointer animate-bounce flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Claim</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                        {currentProgress}/{m.target}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-2 border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Rewards summary */}
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-300">
                  <span className="text-slate-400">Rewards:</span>
                  {m.rewardCoins > 0 && (
                    <span className="flex items-center gap-0.5 text-amber-300">
                      <Coins className="w-3 h-3" /> +{m.rewardCoins}
                    </span>
                  )}
                  {m.rewardGems > 0 && (
                    <span className="flex items-center gap-0.5 text-pink-400">
                      <Gem className="w-3 h-3" /> +{m.rewardGems}
                    </span>
                  )}
                  {m.rewardEnergy && m.rewardEnergy > 0 && (
                    <span className="flex items-center gap-0.5 text-cyan-300">
                      <Zap className="w-3 h-3" /> +{m.rewardEnergy}
                    </span>
                  )}
                  {m.rewardChestId && (
                    <span className="text-purple-300 font-bold">
                      🎁 {m.rewardChestId.replace('chest_', '').toUpperCase()} Chest
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
