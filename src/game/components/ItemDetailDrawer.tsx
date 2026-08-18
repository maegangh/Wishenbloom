import React from 'react';
import { X, ArrowRight, Zap, Coins, Gem, Sparkles, Archive, Trash2 } from 'lucide-react';
import { BoardItem } from '../types';
import { ITEMS, ITEM_CHAINS } from '../data/items';
import { GENERATORS } from '../data/generators';
import { ItemIcon } from './ItemIcon';

interface ItemDetailDrawerProps {
  selectedCell: { row: number; col: number; fromInventory?: boolean; inventoryIndex?: number } | null;
  grid: (BoardItem | null)[][];
  inventory: (BoardItem | null)[];
  onClose: () => void;
  onSellItem: (row: number, col: number) => void;
  onUseConsumable: (row: number, col: number) => void;
  onStoreInInventory: (row: number, col: number) => void;
  onPopBubble: (row: number, col: number, withGems: boolean) => void;
}

export const ItemDetailDrawer: React.FC<ItemDetailDrawerProps> = ({
  selectedCell,
  grid,
  inventory,
  onClose,
  onSellItem,
  onUseConsumable,
  onStoreInInventory,
  onPopBubble,
}) => {
  if (!selectedCell) return null;

  const { row, col, fromInventory, inventoryIndex } = selectedCell;
  const item = fromInventory && inventoryIndex !== undefined
    ? inventory[inventoryIndex]
    : grid[row]?.[col];

  if (!item) return null;

  const itemDef = ITEMS[item.itemId];
  const generatorDef = item.generatorId ? GENERATORS[item.generatorId] : null;
  const chainInfo = itemDef ? ITEM_CHAINS[itemDef.chainId] : null;

  const nextMergeDef = itemDef?.mergeResultId ? ITEMS[itemDef.mergeResultId] : null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 max-w-md mx-auto px-3 animate-in slide-in-from-bottom duration-200">
      <div className="bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl p-3.5 shadow-2xl backdrop-blur-xl text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-amber-500/30 p-1 flex items-center justify-center shadow-inner">
              <ItemIcon
                itemId={item.itemId}
                isGenerator={item.isGenerator}
                generatorId={item.generatorId}
                size={48}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-amber-200">
                  {item.isGenerator ? generatorDef?.name : itemDef?.name}
                </h3>
                {!item.isGenerator && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                    style={{
                      backgroundColor: `${itemDef?.color}33`,
                      color: itemDef?.color,
                      border: `1px solid ${itemDef?.color}66`,
                    }}
                  >
                    Tier {itemDef?.tier}/{itemDef?.maxTier}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {item.isGenerator ? 'Spawns items on tap' : chainInfo?.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description & Next Merge Preview */}
        <div className="py-2 text-xs text-slate-300">
          <p className="italic text-slate-300/90 leading-relaxed">
            "{item.isGenerator ? generatorDef?.description : itemDef?.description}"
          </p>

          {/* Merge Evolution Pathway */}
          {nextMergeDef && (
            <div className="mt-2 flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 font-semibold">Merges Into:</span>
              <div className="flex items-center gap-2">
                <ItemIcon itemId={nextMergeDef.id} size={24} showTierBadge={false} />
                <span className="text-xs font-bold text-amber-300">{nextMergeDef.name}</span>
                <span className="text-[10px] text-slate-400">(Tier {nextMergeDef.tier})</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          {/* Bubble pop actions */}
          {item.tileState === 'bubble' ? (
            <>
              <button
                onClick={() => onPopBubble(row, col, true)}
                className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all"
              >
                <span>💎</span>
                <span>Claim ({item.bubblePrice || 2} Gems)</span>
              </button>
              <button
                onClick={() => onPopBubble(row, col, false)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-amber-300 border border-slate-700 transition-all"
              >
                Pop for 1 🪙
              </button>
            </>
          ) : (
            <>
              {/* Consumable Action (Energy, Gems, Chest) */}
              {itemDef?.isConsumable && (
                <button
                  onClick={() => onUseConsumable(row, col)}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                  <span>
                    {itemDef.consumableType === 'chest'
                      ? 'Open Chest!'
                      : itemDef.consumableType === 'energy'
                      ? `Use (+${itemDef.consumableValue} Energy)`
                      : `Claim (+${itemDef.consumableValue} Gems)`}
                  </span>
                </button>
              )}

              {/* Store to Inventory */}
              {!item.isGenerator && !fromInventory && (
                <button
                  onClick={() => onStoreInInventory(row, col)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 border border-slate-700 flex items-center gap-1 transition-all cursor-pointer"
                  title="Move to Inventory Pocket"
                >
                  <Archive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Store</span>
                </button>
              )}

              {/* Sell Item */}
              {!item.isGenerator && !fromInventory && (
                <button
                  onClick={() => onSellItem(row, col)}
                  className="py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 font-bold text-xs text-red-300 border border-red-800/40 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sell (+{itemDef?.sellValue || 1})</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
