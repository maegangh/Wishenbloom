import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { NPCOrder, BoardItem } from '../types';
import { ITEMS } from '../data/items';
import { NpcAvatar } from './NpcAvatar';
import { ItemIcon } from './ItemIcon';

interface OrderBarProps {
  orders: NPCOrder[];
  grid: (BoardItem | null)[][];
  onFulfillOrder: (orderId: string) => void;
  onSelectOrder?: (order: NPCOrder) => void;
}

export const OrderBar: React.FC<OrderBarProps> = ({
  orders,
  grid,
  onFulfillOrder,
  onSelectOrder,
}) => {
  // Count items on the board
  const boardCounts: Record<string, number> = {};
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cell = grid[r][c];
      if (cell && cell.tileState === 'normal' && !cell.isGenerator) {
        boardCounts[cell.itemId] = (boardCounts[cell.itemId] || 0) + 1;
      }
    }
  }

  return (
    <div className="w-full px-2 py-1.5 overflow-x-auto no-scrollbar select-none">
      <div className="flex items-stretch gap-2.5 min-w-max pb-1">
        {orders.map((order) => {
          const isComplete = order.requirements.every(
            (req) => (boardCounts[req.itemId] || 0) >= req.count
          );

          return (
            <div
              key={order.id}
              onClick={() => onSelectOrder?.(order)}
              className={`relative flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition-all shadow-md ${
                isComplete
                  ? 'bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-emerald-950/90 border-emerald-500/60 shadow-emerald-500/20'
                  : order.isSpecialOrder
                  ? 'bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-purple-950/70 border-amber-500/60 shadow-amber-500/15'
                  : 'bg-slate-900/80 border-slate-700/60'
              }`}
            >
              {/* NPC Avatar */}
              <div className="relative">
                <NpcAvatar avatarId={order.npcAvatar} size={46} />
                {order.isSpecialOrder ? (
                  <span className="absolute -top-1.5 -left-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase shadow-md flex items-center gap-0.5">
                    👑 Special
                  </span>
                ) : order.isStoryOrder ? (
                  <span className="absolute -top-1 -left-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1 rounded-full uppercase">
                    Story
                  </span>
                ) : null}
              </div>

              {/* Order Info & Requested Items */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-100">{order.npcName}</span>
                    {order.isSpecialOrder && (
                      <span className="text-[10px] text-amber-300 font-semibold px-1 py-0.2 rounded bg-amber-950/60 border border-amber-500/40">
                        Commission
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
                    <span>🪙 {order.rewards.coins}</span>
                    <span className="text-purple-300">✨ {order.rewards.xp} XP</span>
                    {order.rewards.gems && (
                      <span className="text-fuchsia-300">💎 {order.rewards.gems}</span>
                    )}
                    {order.rewards.chestId && (
                      <span className="text-yellow-400">📦 Chest</span>
                    )}
                  </div>
                </div>

                {/* Requested Item Pills */}
                <div className="flex items-center gap-2">
                  {order.requirements.map((req, idx) => {
                    const itemDef = ITEMS[req.itemId];
                    const currentCount = boardCounts[req.itemId] || 0;
                    const hasEnough = currentCount >= req.count;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[11px] font-bold ${
                          hasEnough
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300'
                        }`}
                      >
                        <ItemIcon itemId={req.itemId} size={22} showTierBadge={false} />
                        <span>
                          {currentCount}/{req.count}
                        </span>
                        {hasEnough && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                    );
                  })}

                  {/* Fulfill Button */}
                  <button
                    disabled={!isComplete}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isComplete) onFulfillOrder(order.id);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isComplete
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105 hover:brightness-110 active:scale-95 animate-pulse'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {isComplete ? 'Deliver!' : 'Need Items'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
