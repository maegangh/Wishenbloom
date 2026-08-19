import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Lock, Timer, Sparkles } from 'lucide-react';
import { BoardItem } from '../types';
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
  isTutorialActive?: boolean;
  tutorialStep?: number;
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
  isTutorialActive,
  tutorialStep,
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

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent, row: number, col: number) => {
    const item = grid[row]?.[col];
    if (!item) {
      onSelectCell(null);
      return;
    }

    if (item.tileState === 'bubble') {
      onSelectCell({ row, col });
      return;
    }

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
      onMoveOrMerge(fromRow, fromCol, targetCell.row, targetCell.col);
    } else {
      if (item.isGenerator) {
        onTapGenerator(fromRow, fromCol);
      } else {
        onSelectCell({ row: fromRow, col: fromCol });
      }
    }

    setDragState(null);
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[7/9] p-1.5 select-none touch-none">
      {/* Fantasy Golden Wood Outer Frame */}
      <div
        className="w-full h-full p-2 rounded-3xl relative overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #7c4d23 0%, #4a2810 50%, #2b1405 100%)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,225,150,0.4), inset 0 -3px 6px rgba(0,0,0,0.8)',
          border: '2px solid #ca8a04',
        }}
      >
        {/* Inner Board Parchment Grid Container */}
        <div
          ref={boardRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => setDragState(null)}
          className="w-full h-full rounded-2xl p-1 grid grid-cols-7 grid-rows-9 gap-1 shadow-inner relative overflow-hidden"
          style={{
            backgroundColor: '#e6d7b8',
            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.35)',
          }}
        >
          {/* Cell Grid Rendering */}
          {grid.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              const isSelected =
                selectedCell &&
                !selectedCell.fromInventory &&
                selectedCell.row === rIdx &&
                selectedCell.col === cIdx;
              const isDragSource =
                dragState?.isDragging &&
                dragState.fromRow === rIdx &&
                dragState.fromCol === cIdx;
              const isHoverTarget =
                dragState?.isDragging &&
                dragState.hoverRow === rIdx &&
                dragState.hoverCol === cIdx &&
                (dragState.fromRow !== rIdx || dragState.fromCol !== cIdx);

              let isMergeHover = false;
              if (isHoverTarget && cell && dragState?.item) {
                const mergeCheck = checkMergeValidity(dragState.item, cell);
                if (mergeCheck.canMerge) {
                  isMergeHover = true;
                }
              }

              const bubbleSeconds = cell?.tileState === 'bubble' ? getBubbleRemainingSeconds(cell) : 0;
              const cooldownSeconds = cell?.isGenerator ? getGeneratorCooldownRemaining(cell) : 0;

              // Tutorial Highlights
              const isTutorialGenTarget = isTutorialActive && tutorialStep === 1 && rIdx === 0 && cIdx === 0;
              const isTutorialMergeTarget = isTutorialActive && tutorialStep === 2 && cell?.itemId === 'herb_1' && !cell.isGenerator;

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onPointerDown={(e) => handlePointerDown(e, rIdx, cIdx)}
                  className={`relative w-full h-full rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    (rIdx + cIdx) % 2 === 0
                      ? 'bg-[#fcf7ee] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)]'
                      : 'bg-[#f3e7cb] shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]'
                  } border ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-50/90 shadow-md ring-2 ring-cyan-400/80 z-10'
                      : isMergeHover
                      ? 'border-emerald-500 bg-emerald-100 scale-105 shadow-lg ring-2 ring-emerald-400 z-20'
                      : isHoverTarget
                      ? 'border-amber-500 bg-amber-100 scale-102 z-10'
                      : isTutorialGenTarget
                      ? 'border-amber-400 bg-amber-50 ring-4 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)] z-20'
                      : isTutorialMergeTarget
                      ? 'border-emerald-400 bg-emerald-50 ring-4 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] z-20'
                      : 'border-[#d4c39e] hover:border-amber-400/80'
                  }`}
                >
                  {/* Tutorial Callout Badge */}
                  {isTutorialGenTarget && (
                    <div className="absolute -top-2.5 -right-2.5 bg-amber-400 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-full border border-yellow-200 shadow-md z-30 animate-bounce">
                      TAP
                    </div>
                  )}
                  {isTutorialMergeTarget && (
                    <div className="absolute -top-2.5 -right-2.5 bg-emerald-400 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-full border border-emerald-200 shadow-md z-30 animate-bounce">
                      MERGE
                    </div>
                  )}

                  {/* Cyan Corner Brackets when Selected */}
                  {isSelected && (
                    <div className="absolute inset-0 pointer-events-none p-0.5 flex flex-col justify-between z-20">
                      <div className="flex justify-between w-full">
                        <div className="w-2 h-2 border-t-2 border-l-2 border-cyan-500 rounded-tl-sm" />
                        <div className="w-2 h-2 border-t-2 border-r-2 border-cyan-500 rounded-tr-sm" />
                      </div>
                      <div className="flex justify-between w-full">
                        <div className="w-2 h-2 border-b-2 border-l-2 border-cyan-500 rounded-bl-sm" />
                        <div className="w-2 h-2 border-b-2 border-r-2 border-cyan-500 rounded-br-sm" />
                      </div>
                    </div>
                  )}

                  {/* Cell Item Content */}
                  {cell && !isDragSource && (
                    <div className="relative w-full h-full flex items-center justify-center p-0.5">
                      <ItemIcon
                        itemId={cell.itemId}
                        isGenerator={cell.isGenerator}
                        generatorId={cell.generatorId}
                        size="86%"
                      />

                      {/* Generator Cooldown Indicator */}
                      {cell.isGenerator && cooldownSeconds > 0 && (
                        <div className="absolute inset-0 bg-slate-950/70 rounded-xl flex flex-col items-center justify-center border border-amber-600/40 z-20">
                          <Timer className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                          <span className="text-[9px] font-black text-amber-200">{cooldownSeconds}s</span>
                        </div>
                      )}

                      {/* Dusty / Cobweb Overlay */}
                      {cell.tileState === 'dusty' && (
                        <div className="absolute inset-0 bg-stone-900/60 rounded-xl flex flex-col items-center justify-center border border-amber-700/50 z-20">
                          <span className="text-xs">🕸️</span>
                          <span className="text-[8px] font-black text-amber-200">DUSTY</span>
                        </div>
                      )}

                      {/* Bubble Overlay with Dynamic Timer */}
                      {cell.tileState === 'bubble' && (
                        <div className="absolute inset-0 rounded-xl bg-purple-500/25 border-2 border-purple-400 animate-pulse flex flex-col items-center justify-center shadow-lg backdrop-blur-[0.5px] z-20">
                          <span className="text-[9px] font-black text-purple-100 bg-purple-950/90 px-1 rounded-full border border-purple-300">
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
                        <div className="absolute inset-0 bg-stone-900/75 rounded-xl flex items-center justify-center z-20">
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
          <div className="w-14 h-14 bg-amber-50/95 rounded-2xl border-2 border-amber-500 p-1 flex items-center justify-center shadow-2xl backdrop-blur-sm">
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

