import React from 'react';
import { Info, Sparkles, Coins, ArrowUpCircle, Archive, Trash2, X } from 'lucide-react';
import { BoardItem } from '../types';
import { ITEMS, ITEM_CHAINS } from '../data/items';
import { GENERATORS } from '../data/generators';
import { ItemIcon } from './ItemIcon';
import { validateGeneratorUpgrade, getGeneratorCooldownRemaining } from '../logic/generatorLogic';

interface SelectedItemPanelProps {
  selectedCell: { row: number; col: number; fromInventory?: boolean; inventoryIndex?: number } | null;
  grid: (BoardItem | null)[][];
  inventory: (BoardItem | null)[];
  playerCoins: number;
  onClose: () => void;
  onSellItem: (row: number, col: number) => void;
  onUseConsumable: (row: number, col: number) => void;
  onStoreInInventory: (row: number, col: number) => void;
  onPopBubble: (row: number, col: number, withGems: boolean) => void;
  onUpgradeGenerator: (row: number, col: number) => void;
}

export const SelectedItemPanel: React.FC<SelectedItemPanelProps> = ({
  selectedCell,
  grid,
  inventory,
  playerCoins,
  onClose,
  onSellItem,
  onUseConsumable,
  onStoreInInventory,
  onPopBubble,
  onUpgradeGenerator,
}) => {
  if (!selectedCell) return null;

  const { row, col, fromInventory, inventoryIndex } = selectedCell;
  const item =
    fromInventory && inventoryIndex !== undefined
      ? inventory[inventoryIndex]
      : grid[row]?.[col];

  if (!item) return null;

  const itemDef = ITEMS[item.itemId];
  const generatorDef = item.generatorId ? GENERATORS[item.generatorId] : null;
  const chainInfo = itemDef ? ITEM_CHAINS[itemDef.chainId] : null;
  const nextMergeDef = itemDef?.mergeResultId ? ITEMS[itemDef.mergeResultId] : null;

  const upgradeInfo = item.isGenerator ? validateGeneratorUpgrade(item, playerCoins) : null;
  const cooldownSec = item.isGenerator ? getGeneratorCooldownRemaining(item) : 0;

  const itemName = item.isGenerator ? generatorDef?.name : itemDef?.name;

  return (
    <div className="w-full px-3 py-1 z-20 select-none animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Warm Parchment Card */}
      <div
        className="w-full bg-[#fbf6ea] border-2 border-[#d4af37] rounded-2xl p-2.5 shadow-xl flex items-center justify-between gap-2.5 relative overflow-hidden"
        style={{
          boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
      >
        {/* Left Side: Info icon & item details */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Blue Info Badge */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-blue-400 border border-sky-300 shadow-md flex items-center justify-center flex-shrink-0 text-white">
            <Info className="w-4 h-4" />
          </div>

          {/* Text Details */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-slate-900 truncate">
                {itemName}
              </span>
              {!item.isGenerator && itemDef && (
                <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200/80 px-1.5 py-0.2 rounded-full border border-amber-400/50 flex-shrink-0">
                  T{itemDef.tier}
                </span>
              )}
              {item.isGenerator && generatorDef && (
                <span className="text-[10px] font-extrabold text-emerald-900 bg-emerald-200/80 px-1.5 py-0.2 rounded-full border border-emerald-400/50 flex-shrink-0">
                  Lvl {generatorDef.level}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-600 font-medium truncate">
              {item.isGenerator
                ? `Cost: ${generatorDef?.energyCost || 1} ⚡ • Tap to spawn`
                : nextMergeDef
                ? `Merge into ${nextMergeDef.name}`
                : chainInfo?.name || 'Max tier reached'}
            </p>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Bubble pop actions */}
          {item.tileState === 'bubble' ? (
            <>
              <button
                onClick={() => onPopBubble(row, col, true)}
                className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 font-black text-xs text-white shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
              >
                <span>💎</span>
                <span>Claim ({item.bubblePrice || 2})</span>
              </button>
              <button
                onClick={() => onPopBubble(row, col, false)}
                className="py-1.5 px-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs transition-colors cursor-pointer"
              >
                🪙 1
              </button>
            </>
          ) : item.isGenerator ? (
            <>
              {upgradeInfo?.nextDef && (
                <button
                  onClick={() => onUpgradeGenerator(row, col)}
                  disabled={!upgradeInfo.canUpgrade}
                  className={`py-1.5 px-3 rounded-xl font-black text-xs flex items-center gap-1 shadow-md transition-all ${
                    upgradeInfo.canUpgrade
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95 cursor-pointer'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ArrowUpCircle className="w-3.5 h-3.5" />
                  <span>Up ({upgradeInfo.upgradeCost} 🪙)</span>
                </button>
              )}
            </>
          ) : (
            <>
              {/* Consumable Button */}
              {itemDef?.isConsumable && (
                <button
                  onClick={() => onUseConsumable(row, col)}
                  className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 hover:brightness-110 font-black text-xs text-white shadow-md flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>
                    {itemDef.consumableType === 'chest'
                      ? 'Open!'
                      : itemDef.consumableType === 'energy'
                      ? `+${itemDef.consumableValue} ⚡`
                      : `+${itemDef.consumableValue} 💎`}
                  </span>
                </button>
              )}

              {/* Store Button */}
              {!fromInventory && (
                <button
                  onClick={() => onStoreInInventory(row, col)}
                  className="py-1.5 px-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                  title="Move to Storage"
                >
                  <Archive className="w-3.5 h-3.5 text-amber-600" />
                </button>
              )}

              {/* Sell Button (Glossy blue / gold) */}
              {!fromInventory && (
                <button
                  onClick={() => onSellItem(row, col)}
                  className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-xs shadow-md border border-sky-400/50 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Sell</span>
                  <span className="text-yellow-300 font-bold">+{itemDef?.sellValue || 1} 🪙</span>
                </button>
              )}
            </>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-amber-100 transition-colors ml-0.5"
            title="Deselect"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
