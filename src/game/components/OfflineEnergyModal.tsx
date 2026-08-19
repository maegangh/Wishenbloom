import React from 'react';
import { Sparkles, Zap, Heart, ArrowRight } from 'lucide-react';

interface OfflineEnergyModalProps {
  recoveredEnergy: number;
  currentEnergy: number;
  maxEnergy: number;
  onClose: () => void;
}

export const OfflineEnergyModal: React.FC<OfflineEnergyModalProps> = ({
  recoveredEnergy,
  currentEnergy,
  maxEnergy,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/90 border border-cyan-500/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center text-white relative">
        {/* Decorative Top Sparkle Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-300 text-slate-950 mb-3 shadow-lg shadow-cyan-500/30">
          <Zap className="w-8 h-8 fill-slate-950 animate-pulse" />
        </div>

        <h2 className="text-xl font-black text-cyan-200 tracking-tight">Welcome Back!</h2>
        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
          While you were away resting, the enchanted realm restored your energy!
        </p>

        {/* Energy Summary Card */}
        <div className="my-5 bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Restored</span>
            <div className="flex items-center gap-1 mt-1 text-cyan-300 font-black text-lg">
              <Zap className="w-4 h-4 fill-cyan-400" />
              <span>+{recoveredEnergy}</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Energy</span>
            <div className="flex items-center gap-1 mt-1 text-white font-black text-lg">
              <span>{currentEnergy}</span>
              <span className="text-xs text-slate-400 font-normal">/ {maxEnergy}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          id="btn-close-offline-energy"
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Continue Crafting</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
