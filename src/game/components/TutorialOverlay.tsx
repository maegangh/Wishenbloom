import React from 'react';
import { Sparkles, ChevronRight, X } from 'lucide-react';
import { NpcAvatar } from './NpcAvatar';

interface TutorialOverlayProps {
  currentStep: number;
  onNext: () => void;
  onDismiss: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  currentStep,
  onNext,
  onDismiss,
}) => {
  const steps = [
    {
      title: 'Welcome to Wishenbloom!',
      text: 'Greetings, apprentice restorer! Our once-glorious kingdom was sustained by the ancient living magic of the Bloom. Now dormant, together we shall rekindle the Bloom and revive the realm.',
      npc: 'elowen',
    },
    {
      title: 'Generators Produce Items',
      text: 'Tap on magical generators like the Enchanted Garden (top-left) to spend Energy and spawn fresh items onto the board.',
      npc: 'elowen',
    },
    {
      title: 'Merge Identical Items',
      text: 'Drag two identical items of the same tier together to merge them into a more powerful, higher-tier magical object!',
      npc: 'valerie',
    },
    {
      title: 'Deliver NPC Orders',
      text: 'The kingdom citizens need your crafted items! Complete their orders at the top to earn Coins, XP, Energy, and rare treasure chests.',
      npc: 'pip',
    },
    {
      title: 'Restore the Kingdom!',
      text: 'Visit the Kingdom tab to spend earned Coins on rebuilding iconic landmarks, fountains, spires, and creature sanctuaries!',
      npc: 'aurelia',
    },
  ];

  const stepIndex = Math.min(steps.length - 1, Math.max(0, currentStep));
  const current = steps[stepIndex];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end p-4 bg-slate-950/75 backdrop-blur-[2px] select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md mx-auto bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl text-white relative">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Skip tutorial"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 mb-3">
          <NpcAvatar avatarId={current.npc} size={54} />
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tutorial Guide ({stepIndex + 1}/{steps.length})</span>
            </div>
            <h3 className="text-base font-black text-white">{current.title}</h3>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {current.text}
        </p>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onDismiss}
            className="text-xs text-slate-400 font-bold px-3 py-2 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Skip Tutorial
          </button>

          <button
            onClick={onNext}
            className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{stepIndex === steps.length - 1 ? 'Start Merging!' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
