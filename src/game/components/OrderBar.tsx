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

  // Display active orders (up to 2 in primary view)
  const displayOrders = orders.slice(0, 2);

  return (
    <div className="w-full px-3 py-1 select-none z-10">
      <div className="grid grid-cols-2 gap-2 w-full max-w-md mx-auto">
        {displayOrders.map((order) => {
          const isComplete = order.requirements.every(
            (req) => (boardCounts[req.itemId] || 0) >= req.count
          );

          return (
            <div
              key={order.id}
              onClick={() => onSelectOrder?.(order)}
              className={`relative flex flex-col justify-between p-2 rounded-2xl border-2 transition-all shadow-md cursor-pointer ${
                isComplete
                  ? 'bg-gradient-to-b from-emerald-950/90 via-slate-900/95 to-emerald-950/90 border-emerald-400 shadow-emerald-500/20 ring-1 ring-emerald-400/40'
                  : order.isSpecialOrder || order.isStoryOrder
                  ? 'bg-gradient-to-b from-amber-950/80 via-slate-900/95 to-slate-900/95 border-amber-500/60 shadow-amber-500/10'
                  : 'bg-slate-900/90 border-slate-700/80'
              }`}
            >
              {/* Top Row: Avatar & Order Meta */}
              <div className="flex items-center gap-2 mb-1.5">
                {/* Avatar with Badges */}
                <div className="relative flex-shrink-0">
                  <NpcAvatar avatarId={order.npcAvatar} size={38} className="rounded-full shadow-md" />
                  {order.isStoryOrder && (
                    <span className="absolute -top-1 -left-1 bg-amber-400 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase shadow">
                      Story
                    </span>
                  )}
                  {order.isSpecialOrder && !order.isStoryOrder && (
                    <span className="absolute -top-1 -left-1 bg-fuchsia-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase shadow">
                      VIP
                    </span>
                  )}
                </div>

                {/* NPC Name & Rewards */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-black text-white truncate leading-tight">
                    {order.npcName}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300">
                    <span>🪙 {order.rewards.coins}</span>
                    <span className="text-purple-300">✨ {order.rewards.xp}</span>
                  </div>
                </div>
              </div>

              {/* Middle Row: Required Item Icons */}
              <div className="flex items-center gap-1.5 my-0.5 justify-center">
                {order.requirements.map((req, idx) => {
                  const currentCount = boardCounts[req.itemId] || 0;
                  const hasEnough = currentCount >= req.count;

                  return (
                    <div
                      key={idx}
                      className={`relative flex items-center justify-center p-1 rounded-xl border ${
                        hasEnough
                          ? 'bg-emerald-900/40 border-emerald-400 text-emerald-200'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300'
                      }`}
                      title={`${ITEMS[req.itemId]?.name || 'Item'} (${currentCount}/${req.count})`}
                    >
                      <ItemIcon itemId={req.itemId} size={28} showTierBadge={false} />
                      <span className="absolute -bottom-1 -right-1 bg-slate-900/90 text-[9px] font-black px-1 rounded-full border border-white/20">
                        {currentCount}/{req.count}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Row: Deliver Button / Progress */}
              <button
                disabled={!isComplete}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isComplete) onFulfillOrder(order.id);
                }}
                className={`w-full mt-1.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                  isComplete
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/30 scale-100 hover:brightness-110 active:scale-95 animate-pulse cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed text-[10px]'
                }`}
              >
                {isComplete ? 'DELIVER!' : 'In Progress'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

