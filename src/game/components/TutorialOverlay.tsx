import React, { useState } from 'react';
import { Sparkles, ChevronRight, X, Hand, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, Castle, CheckCircle2 } from 'lucide-react';
import { NpcAvatar } from './NpcAvatar';
import { MainTab } from './BottomNav';

interface TutorialOverlayProps {
  currentStep: number;
  activeTab?: MainTab;
  onChangeTab?: (tab: MainTab) => void;
  onNext: () => void;
  onDismiss: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  currentStep,
  activeTab = 'board',
  onChangeTab,
  onNext,
  onDismiss,
}) => {
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  // Step 0: WELCOME CARD
  if (currentStep === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none animate-in fade-in duration-300">
        <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 via-slate-900 to-indigo-950/95 border-2 border-amber-400/80 rounded-3xl p-5 shadow-[0_15px_40px_rgba(0,0,0,0.7)] text-white relative">
          {/* Subtle Top Ambient Glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-400/25 rounded-full blur-2xl pointer-events-none" />

          {/* Header with Avatar & Title */}
          <div className="flex items-center gap-3.5 mb-4 relative z-10">
            <div className="relative">
              <NpcAvatar avatarId="elowen" size={62} className="rounded-full ring-2 ring-emerald-400 shadow-lg" />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full shadow">
                <Sparkles className="w-3 h-3" />
              </span>
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-[10px] font-black text-amber-300 uppercase tracking-wider mb-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                New Bloomkeeper
              </span>
              <h2 className="text-base font-black text-white leading-tight">Welcome to Wishenbloom!</h2>
              <p className="text-xs font-bold text-emerald-300">Elowen • Forest Guardian</p>
            </div>
          </div>

          {/* Welcoming Narrative */}
          <div className="bg-slate-950/60 border border-amber-500/20 rounded-2xl p-3.5 mb-5 relative z-10">
            <p className="text-xs text-stone-200 leading-relaxed">
              The dormant soil stirs! As the chosen Bloomkeeper, you hold the power to rekindle our realm's ancient living magic.
            </p>
            <p className="text-xs text-amber-200 font-semibold mt-2">
              Let's wake the realm together, one merge at a time.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 relative z-10">
            <button
              onClick={onNext}
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 active:scale-98 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_4px_14px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all border-t border-yellow-200"
            >
              <span>Let's Begin</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              onClick={() => setShowSkipConfirm(true)}
              className="text-xs text-stone-400 hover:text-stone-200 font-bold py-1.5 transition-colors cursor-pointer text-center"
            >
              Skip Tutorial
            </button>
          </div>
        </div>

        {/* Skip Confirmation Modal */}
        {showSkipConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-xs bg-slate-900 border-2 border-stone-600 rounded-3xl p-5 shadow-2xl text-center">
              <h3 className="text-sm font-black text-white mb-2">Skip the Tutorial?</h3>
              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                You can freely explore the merge board, fulfill orders, and restore the realm at your own pace.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-300 font-bold text-xs cursor-pointer"
                >
                  Keep Playing Guide
                </button>
                <button
                  onClick={onDismiss}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                >
                  Confirm Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 1: TAP GENERATOR GUIDANCE
  if (currentStep === 1) {
    return (
      <div className="fixed inset-0 z-40 pointer-events-none select-none">
        {/* Animated Hand/Arrow Indicator Pointing to Top-Left Generator (Tile 0,0) */}
        <div className="absolute top-[215px] left-8 sm:left-12 flex flex-col items-center pointer-events-none animate-bounce z-40">
          <div className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-amber-500/50 flex items-center gap-1 border border-yellow-200">
            <Sparkles className="w-3 h-3 text-slate-950" />
            <span>Tap Generator</span>
          </div>
          <ArrowUp className="w-6 h-6 text-amber-300 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] stroke-[3] mt-0.5" />
        </div>

        {/* Floating Instruction Banner (Anchored above Bottom Area) */}
        <div className="absolute bottom-[80px] left-0 right-0 px-4 pointer-events-auto flex justify-center pb-[env(safe-area-inset-bottom,0px)]">
          <div className="w-full max-w-sm bg-gradient-to-r from-stone-900 via-slate-900 to-stone-900 border-2 border-amber-400/90 rounded-2xl p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.7)] text-white flex items-center gap-3">
            <NpcAvatar avatarId="elowen" size={46} className="rounded-full ring-2 ring-amber-400 shadow-md flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Step 1 of 4: Generator
                </span>
                <button
                  onClick={() => setShowSkipConfirm(true)}
                  className="text-[10px] font-bold text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  Skip
                </button>
              </div>
              <p className="text-xs text-stone-100 font-bold leading-tight mt-0.5">
                Tap the Enchanted Garden in the top-left corner to sprout fresh seedlings!
              </p>
            </div>
          </div>
        </div>

        {/* Skip Confirmation Modal */}
        {showSkipConfirm && (
          <div className="fixed inset-0 z-60 pointer-events-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-xs bg-slate-900 border-2 border-stone-600 rounded-3xl p-5 shadow-2xl text-center">
              <h3 className="text-sm font-black text-white mb-2">Skip the Tutorial?</h3>
              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                You can freely explore the merge board, fulfill orders, and restore the realm at your own pace.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-300 font-bold text-xs cursor-pointer"
                >
                  Keep Guide
                </button>
                <button
                  onClick={onDismiss}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 2: MERGE ITEMS GUIDANCE
  if (currentStep === 2) {
    return (
      <div className="fixed inset-0 z-40 pointer-events-none select-none">
        {/* Merge Drag Indicator Animation */}
        <div className="absolute top-[310px] left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none z-40">
          <div className="px-3 py-1 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-emerald-500/50 flex items-center gap-1 border border-emerald-200 animate-pulse">
            <Sparkles className="w-3 h-3 text-slate-950" />
            <span>Drag Together to Merge</span>
          </div>
        </div>

        {/* Floating Instruction Banner */}
        <div className="absolute bottom-[80px] left-0 right-0 px-4 pointer-events-auto flex justify-center pb-[env(safe-area-inset-bottom,0px)]">
          <div className="w-full max-w-sm bg-gradient-to-r from-stone-900 via-slate-900 to-stone-900 border-2 border-emerald-400/90 rounded-2xl p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.7)] text-white flex items-center gap-3">
            <NpcAvatar avatarId="elowen" size={46} className="rounded-full ring-2 ring-emerald-400 shadow-md flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                  Step 2 of 4: Merge-2
                </span>
                <button
                  onClick={() => setShowSkipConfirm(true)}
                  className="text-[10px] font-bold text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  Skip
                </button>
              </div>
              <p className="text-xs text-stone-100 font-bold leading-tight mt-0.5">
                Drag one Lavender Seedling onto another matching seedling to merge into a Sweetbloom Sprout!
              </p>
            </div>
          </div>
        </div>

        {/* Skip Confirmation Modal */}
        {showSkipConfirm && (
          <div className="fixed inset-0 z-60 pointer-events-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-xs bg-slate-900 border-2 border-stone-600 rounded-3xl p-5 shadow-2xl text-center">
              <h3 className="text-sm font-black text-white mb-2">Skip the Tutorial?</h3>
              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                You can freely explore the merge board, fulfill orders, and restore the realm at your own pace.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-300 font-bold text-xs cursor-pointer"
                >
                  Keep Guide
                </button>
                <button
                  onClick={onDismiss}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 3: DELIVER ORDER GUIDANCE
  if (currentStep === 3) {
    return (
      <div className="fixed inset-0 z-40 pointer-events-none select-none">
        {/* Animated Pointer pointing up at Elowen's Order Deliver Button in OrderBar */}
        <div className="absolute top-[148px] left-[26%] -translate-x-1/2 flex flex-col items-center pointer-events-none animate-bounce z-40">
          <ArrowUp className="w-6 h-6 text-amber-300 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] stroke-[3]" />
          <div className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-amber-500/50 flex items-center gap-1 border border-yellow-200 mt-0.5">
            <Sparkles className="w-2.5 h-2.5 text-slate-950" />
            <span>Tap Deliver!</span>
          </div>
        </div>

        {/* Floating Instruction Banner */}
        <div className="absolute bottom-[80px] left-0 right-0 px-4 pointer-events-auto flex justify-center pb-[env(safe-area-inset-bottom,0px)]">
          <div className="w-full max-w-sm bg-gradient-to-r from-stone-900 via-slate-900 to-stone-900 border-2 border-amber-400/90 rounded-2xl p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.7)] text-white flex items-center gap-3">
            <NpcAvatar avatarId="elowen" size={46} className="rounded-full ring-2 ring-amber-400 shadow-md flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Step 3 of 4: Orders
                </span>
                <button
                  onClick={() => setShowSkipConfirm(true)}
                  className="text-[10px] font-bold text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  Skip
                </button>
              </div>
              <p className="text-xs text-stone-100 font-bold leading-tight mt-0.5">
                Elowen loves your Sweetbloom Sprout! Tap <span className="text-emerald-400 font-black">DELIVER</span> on her order above to earn Coins & XP.
              </p>
            </div>
          </div>
        </div>

        {/* Skip Confirmation Modal */}
        {showSkipConfirm && (
          <div className="fixed inset-0 z-60 pointer-events-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-xs bg-slate-900 border-2 border-stone-600 rounded-3xl p-5 shadow-2xl text-center">
              <h3 className="text-sm font-black text-white mb-2">Skip the Tutorial?</h3>
              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                You can freely explore the merge board, fulfill orders, and restore the realm at your own pace.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-300 font-bold text-xs cursor-pointer"
                >
                  Keep Guide
                </button>
                <button
                  onClick={onDismiss}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 4: INTRODUCE KINGDOM / RESTORATION
  if (currentStep === 4) {
    // Sub-case 4A: Player is on Board Tab -> Prompt them to tap Realm Tab
    if (activeTab !== 'kingdom') {
      return (
        <div className="fixed inset-0 z-40 pointer-events-none select-none">
          {/* Animated Pointer pointing down at Realm tab in BottomNav */}
          <div className="absolute bottom-[72px] left-[15%] sm:left-[20%] flex flex-col items-center pointer-events-none animate-bounce z-40">
            <div className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-amber-500/50 flex items-center gap-1 border border-yellow-200 mb-1">
              <Castle className="w-2.5 h-2.5 text-slate-950" />
              <span>Tap Realm Tab</span>
            </div>
            <ArrowDown className="w-6 h-6 text-amber-300 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] stroke-[3]" />
          </div>

          {/* Floating Instruction Banner */}
          <div className="absolute bottom-[130px] left-0 right-0 px-4 pointer-events-auto flex justify-center">
            <div className="w-full max-w-sm bg-gradient-to-r from-stone-900 via-slate-900 to-indigo-950 border-2 border-amber-400/90 rounded-2xl p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.7)] text-white flex items-center gap-3">
              <NpcAvatar avatarId="aurelia" size={46} className="rounded-full ring-2 ring-amber-400 shadow-md flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                    Final Step: The Realm
                  </span>
                  <button
                    onClick={() => setShowSkipConfirm(true)}
                    className="text-[10px] font-bold text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    Skip
                  </button>
                </div>
                <p className="text-xs text-stone-100 font-bold leading-tight mt-0.5">
                  Great work! You have Coins from your order. Tap the <span className="text-amber-300 font-black">Realm</span> tab below to see what you can rebuild.
                </p>
              </div>
            </div>
          </div>

          {/* Skip Confirmation Modal */}
          {showSkipConfirm && (
            <div className="fixed inset-0 z-60 pointer-events-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
              <div className="w-full max-w-xs bg-slate-900 border-2 border-stone-600 rounded-3xl p-5 shadow-2xl text-center">
                <h3 className="text-sm font-black text-white mb-2">Skip the Tutorial?</h3>
                <p className="text-xs text-stone-300 leading-relaxed mb-4">
                  You can freely explore the merge board, fulfill orders, and restore the realm at your own pace.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSkipConfirm(false)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-300 font-bold text-xs cursor-pointer"
                  >
                    Keep Guide
                  </button>
                  <button
                    onClick={onDismiss}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Sub-case 4B: Player is on Kingdom Tab -> Show completion dialog
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none animate-in fade-in duration-300">
        <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 via-slate-900 to-indigo-950/95 border-2 border-amber-400/80 rounded-3xl p-5 shadow-[0_15px_40px_rgba(0,0,0,0.7)] text-white relative">
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-4 relative z-10">
            <div className="relative">
              <NpcAvatar avatarId="aurelia" size={62} className="rounded-full ring-2 ring-amber-400 shadow-lg" />
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1 rounded-full shadow">
                <CheckCircle2 className="w-3 h-3" />
              </span>
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-[10px] font-black text-amber-300 uppercase tracking-wider mb-1">
                <Castle className="w-2.5 h-2.5 text-amber-400" />
                Kingdom Restorer
              </span>
              <h2 className="text-base font-black text-white leading-tight">Wishenbloom Awakens!</h2>
              <p className="text-xs font-bold text-amber-300">Princess Aurelia</p>
            </div>
          </div>

          {/* Tutorial Completion Message */}
          <div className="bg-slate-950/60 border border-amber-500/20 rounded-2xl p-3.5 mb-5 relative z-10">
            <p className="text-xs text-stone-200 leading-relaxed">
              Spend earned Coins to rebuild iconic landmarks like <span className="text-amber-300 font-bold">Sunfire Plaza</span>, revive legendary fountains, and awaken mythical creatures!
            </p>
            <p className="text-xs text-emerald-300 font-bold mt-2">
              You are now fully trained and ready to blossom. Good luck, Bloomkeeper!
            </p>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              onChangeTab?.('board');
              onNext();
            }}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 active:scale-98 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_4px_14px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all border-t border-yellow-200"
          >
            <span>Start Merging!</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
