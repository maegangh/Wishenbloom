import React from 'react';
import { Archive, Plus } from 'lucide-react';
import { BoardItem } from '../types';
import { ItemIcon } from './ItemIcon';

interface InventoryBarProps {
  inventory: (BoardItem | null)[];
  maxSlots: number;
  onSelectSlot: (index: number) => void;
  onRetrieveItem: (index: number) => void;
}

export const InventoryBar: React.FC<InventoryBarProps> = ({
  inventory,
  maxSlots,
  onSelectSlot,
  onRetrieveItem,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-3 py-1.5 select-none">
      <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-2 flex items-center justify-between gap-2 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-1.5 pl-1 text-slate-400">
          <Archive className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Storage
          </span>
        </div>

        {/* 5 Slots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: maxSlots }).map((_, idx) => {
            const item = inventory[idx];

            return (
              <button
                key={idx}
                onClick={() => {
                  if (item) onRetrieveItem(idx);
                }}
                className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                  item
                    ? 'bg-slate-800 border-amber-500/40 hover:border-amber-400 hover:scale-105 shadow-inner'
                    : 'bg-slate-950/60 border-slate-800 border-dashed text-slate-600'
                }`}
                title={item ? 'Tap to place item back onto merge board' : 'Empty slot'}
              >
                {item ? (
                  <ItemIcon itemId={item.itemId} size={32} showTierBadge={true} />
                ) : (
                  <span className="text-xs text-slate-700 font-bold">•</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
