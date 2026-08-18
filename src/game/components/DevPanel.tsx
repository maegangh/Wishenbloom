import React, { useState } from 'react';
import { X, Wrench, Plus, RefreshCw, Zap, Coins, Gem, Sparkles, Trash2 } from 'lucide-react';
import { ITEMS } from '../data/items';

interface DevPanelProps {
  onAddCoins: (amt?: number) => void;
  onAddGems: (amt?: number) => void;
  onRefillEnergy: () => void;
  onAddXP: (amt?: number) => void;
  onSpawnItem: (itemId: string) => void;
  onClearBoard: () => void;
  onResetSave: () => void;
  onClose: () => void;
}

export const DevPanel: React.FC<DevPanelProps> = ({
  onAddCoins,
  onAddGems,
  onRefillEnergy,
  onAddXP,
  onSpawnItem,
  onClearBoard,
  onResetSave,
  onClose,
}) => {
  const [selectedSpawnItem, setSelectedSpawnItem] = useState('herb_3');
  const itemList = Object.values(ITEMS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm max-h-[85vh] overflow-y-auto bg-slate-900 border border-amber-500/50 rounded-3xl p-5 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black text-amber-300">Developer Testing Suite</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Resource Actions */}
        <div className="py-3 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Economy Injections
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddCoins(500)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>+500 Coins</span>
            </button>
            <button
              onClick={() => onAddGems(50)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-purple-300 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Gem className="w-4 h-4" />
              <span>+50 Gems</span>
            </button>
            <button
              onClick={onRefillEnergy}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Refill Energy</span>
            </button>
            <button
              onClick={() => onAddXP(100)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-yellow-300 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>+100 XP (Level)</span>
            </button>
          </div>
        </div>

        {/* Item Spawner */}
        <div className="py-3 border-t border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Item Spawner
          </span>
          <div className="flex items-center gap-2">
            <select
              value={selectedSpawnItem}
              onChange={(e) => setSelectedSpawnItem(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none"
            >
              {itemList.map((it) => (
                <option key={it.id} value={it.id}>
                  [{it.chainId}] T{it.tier} - {it.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => onSpawnItem(selectedSpawnItem)}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Spawn</span>
            </button>
          </div>
        </div>

        {/* Board Operations */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Board Management
          </span>
          <button
            onClick={onClearBoard}
            className="w-full py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Non-Generator Items</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset save state?')) {
                onResetSave();
                onClose();
              }
            }}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Save to Initial State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
