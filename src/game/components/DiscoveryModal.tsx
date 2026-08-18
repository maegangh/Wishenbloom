import React from 'react';
import { Sparkles, Gem } from 'lucide-react';
import { ItemDef } from '../types';
import { ItemIcon } from './ItemIcon';

interface DiscoveryModalProps {
  item: ItemDef;
  onClose: () => void;
}

export const DiscoveryModal: React.FC<DiscoveryModalProps> = ({ item, onClose }) => {
  const gemReward = Math.max(1, Math.floor(item.tier / 2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 border-2 border-purple-400 rounded-3xl p-6 shadow-2xl text-center text-white relative overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 bg-purple-500/10 pointer-events-none" />

        {/* Top header badge */}
        <div className="inline-flex items-center gap-1 bg-purple-900/80 px-3 py-1 rounded-full border border-purple-400/50 text-xs font-black text-purple-200 mb-3 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
          <span>New Discovery!</span>
        </div>

        {/* Big Icon */}
        <div className="mx-auto w-24 h-24 rounded-3xl bg-slate-950/80 border-2 border-purple-500/40 p-2 flex items-center justify-center shadow-2xl mb-3">
          <ItemIcon itemId={item.id} size={72} showTierBadge={false} />
        </div>

        <h2 className="text-xl font-black text-amber-200 tracking-tight">{item.name}</h2>
        <span className="inline-block text-xs font-bold text-purple-300 mb-2 uppercase">
          Tier {item.tier} • {item.rarity}
        </span>

        <p className="text-xs text-slate-300 italic mb-4 leading-relaxed">
          "{item.description}"
        </p>

        {/* Reward pill */}
        <div className="bg-slate-950/80 rounded-xl p-2.5 border border-purple-500/30 mb-5 flex items-center justify-center gap-2">
          <Gem className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-slate-200">
            Recorded in Compendium! (+{gemReward} Gems)
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-500/30 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
        >
          Magnificent!
        </button>
      </div>
    </div>
  );
};
