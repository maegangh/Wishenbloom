import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Lock, Timer } from 'lucide-react';
import { BoardItem } from '../types';
import { ITEMS } from '../data/items';
import { ItemIcon } from './ItemIcon';
import { checkMergeValidity } from '../logic/mergeLogic';
import { getBubbleRemainingSeconds } from '../logic/bubbleLogic';
import { getGeneratorCooldownRemaining } from '../logic/generatorLogic';

interface BoardGridProps {
  grid: (BoardItem | null)[][];
  selectedCell: { row: number; col: number; fromInventory?: boolean } | null;
  onSelectCell: (cell: { row: number; col: number } | null) => void;
  onTapGenerator: (row: number, col: number) => void;
  onMoveOrMerge: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
  onPopBubble: (row: number, col: number, withGems: boolean) => void;
  onUseConsumable: (row: number, col: number) => void;
}

interface DragState {
  isDragging: boolean;
  fromRow: number;
  fromCol: number;
  item: BoardItem;
  currentX: number;
  currentY: number;
  hoverRow: number | null;
  hoverCol: number | null;
}

export const BoardGrid: React.FC<BoardGridProps> = ({
  grid,
  selectedCell,
  onSelectCell,
  onTapGenerator,
  onMoveOrMerge,
  onPopBubble,
  onUseConsumable,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);

  // Keep ref synchronized
  useEffect(() => {
    dragRef.current = dragState;
  }, [dragState]);

  // Convert pointer (x, y) to grid cell (row, col)
  const getCellFromPointer = useCallback((clientX: number, clientY: number) => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }

    const cellWidth = rect.width / 7;
    const cellHeight = rect.height / 9;

    const col = Math.floor((clientX - rect.left) / cellWidth);
    const row = Math.floor((clientY - rect.top) / cellHeight);

    if (row >= 0 && row < 9 && col >= 0 && col < 7) {
      return { row, col };
    }
    return null;
  }, []);

  // Pointer Down (Mouse / Touch / Stylus)
  const handlePointerDown = (e: React.PointerEvent, row: number, col: number) => {
    const item = grid[row]?.[col];
    if (!item) {
      onSelectCell(null);
      return;
    }

    // If it's a bubble item, tap to select or view
    if (item.tileState === 'bubble') {
      onSelectCell({ row, col });
      return;
    }

    // Start drag tracking
    const initialDrag: DragState = {
      isDragging: false,
      fromRow: row,
      fromCol: col,
      item,
      currentX: e.clientX,
      currentY: e.clientY,
      hoverRow: row,
      hoverCol: col,
    };
    setDragState(initialDrag);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;

    const cell = getCellFromPointer(e.clientX, e.clientY);
    const dist = Math.hypot(
      e.clientX - dragRef.current.currentX,
      e.clientY - dragRef.current.currentY
    );

    setDragState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isDragging: prev.isDragging || dist > 6,
        currentX: e.clientX,
        currentY: e.clientY,
        hoverRow: cell ? cell.row : null,
        hoverCol: cell ? cell.col : null,
      };
    });
  };

  // Pointer Up / End
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { isDragging, fromRow, fromCol, item } = dragRef.current;
    const targetCell = getCellFromPointer(e.clientX, e.clientY);

    if (isDragging && targetCell) {
      // Execute move or merge
      onMoveOrMerge(fromRow, fromCol, targetCell.row, targetCell.col);
    } else {
      // It was a tap!
      if (item.isGenerator) {
        onTapGenerator(fromRow, fromCol);
      } else {
        onSelectCell({ row: fromRow, col: fromCol });
      }
    }

    setDragState(null);
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[7/9] p-2 select-none touch-none">
      {/* Board Container */}
      <div
        ref={boardRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setDragState(null)}
        className="w-full h-full bg-slate-950/90 rounded-2xl border-2 border-amber-600/30 p-1.5 grid grid-cols-7 grid-rows-9 gap-1 shadow-2xl relative overflow-hidden backdrop-blur-md"
        style={{
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8), 0 10px 25px -5px rgba(0,0,0,0.6)',
        }}
      >
        {/* Cell Grid Rendering */}
        {grid.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            const isSelected =
              selectedCell && selectedCell.row === rIdx && selectedCell.col === cIdx;
            const isDragSource =
              dragState?.isDragging &&
              dragState.fromRow === rIdx &&
              dragState.fromCol === cIdx;
            const isHoverTarget =
              dragState?.isDragging &&
              dragState.hoverRow === rIdx &&
              dragState.hoverCol === cIdx &&
              (dragState.fromRow !== rIdx || dragState.fromCol !== cIdx);

            // Calculate if hover is a valid merge using unified merge validity check
            let isMergeHover = false;
            if (isHoverTarget && cell && dragState?.item) {
              const mergeCheck = checkMergeValidity(dragState.item, cell);
              if (mergeCheck.canMerge) {
                isMergeHover = true;
              }
            }

            const bubbleSeconds = cell?.tileState === 'bubble' ? getBubbleRemainingSeconds(cell) : 0;
            const cooldownSeconds = cell?.isGenerator ? getGeneratorCooldownRemaining(cell) : 0;

            return (
              <div
                key={`${rIdx}-${cIdx}`}
                onPointerDown={(e) => handlePointerDown(e, rIdx, cIdx)}
                className={`relative w-full h-full rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  (rIdx + cIdx) % 2 === 0 ? 'bg-slate-900/60' : 'bg-slate-800/40'
                } border ${
                  isSelected
                    ? 'border-amber-400 bg-amber-950/40 shadow-inner'
                    : isMergeHover
                    ? 'border-emerald-400 bg-emerald-950/60 scale-105 shadow-lg shadow-emerald-500/30 z-10'
                    : isHoverTarget
                    ? 'border-cyan-400 bg-cyan-950/50 scale-102 z-10'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Cell Item Content */}
                {cell && !isDragSource && (
                  <div className="relative w-full h-full flex items-center justify-center p-1">
                    <ItemIcon
                      itemId={cell.itemId}
                      isGenerator={cell.isGenerator}
                      generatorId={cell.generatorId}
                      size="88%"
                    />

                    {/* Generator Cooldown Indicator */}
                    {cell.isGenerator && cooldownSeconds > 0 && (
                      <div className="absolute inset-0 bg-slate-950/70 rounded-xl flex flex-col items-center justify-center border border-amber-600/40">
                        <Timer className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                        <span className="text-[9px] font-black text-amber-200">{cooldownSeconds}s</span>
                      </div>
                    )}

                    {/* Dusty / Cobweb Overlay */}
                    {cell.tileState === 'dusty' && (
                      <div className="absolute inset-0 bg-slate-950/60 rounded-xl flex flex-col items-center justify-center border border-amber-700/50">
                        <span className="text-xs">🕸️</span>
                        <span className="text-[8px] font-black text-amber-200">DUSTY</span>
                      </div>
                    )}

                    {/* Bubble Overlay with Dynamic Timer */}
                    {cell.tileState === 'bubble' && (
                      <div className="absolute inset-0 rounded-xl bg-purple-500/20 border-2 border-purple-400/80 animate-pulse flex flex-col items-center justify-center shadow-lg shadow-purple-500/30 backdrop-blur-[1px]">
                        <span className="text-[9px] font-black text-purple-200 bg-purple-950/85 px-1 rounded-full border border-purple-400/50">
                          💎 {cell.bubblePrice || 2}
                        </span>
                        {bubbleSeconds > 0 && (
                          <span className="text-[8px] font-bold text-amber-300 bg-slate-950/80 px-1 rounded-full mt-0.5">
                            {bubbleSeconds}s
                          </span>
                        )}
                      </div>
                    )}

                    {/* Locked Tile Overlay */}
                    {cell.tileState === 'locked' && (
                      <div className="absolute inset-0 bg-slate-950/75 rounded-xl flex items-center justify-center">
                        <Lock className="w-4 h-4 text-amber-400" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Drag Ghost (Follows Pointer) */}
      {dragState?.isDragging && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 scale-125 transition-transform drop-shadow-2xl"
          style={{
            left: `${dragState.currentX}px`,
            top: `${dragState.currentY}px`,
          }}
        >
          <div className="w-14 h-14 bg-slate-900/90 rounded-2xl border-2 border-amber-400 p-1 flex items-center justify-center shadow-2xl backdrop-blur-sm">
            <ItemIcon
              itemId={dragState.item.itemId}
              isGenerator={dragState.item.isGenerator}
              generatorId={dragState.item.generatorId}
              size={48}
            />
          </div>
        </div>
      )}
    </div>
  );
};
