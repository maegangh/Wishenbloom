import React from 'react';
import { X, Zap, Gem, Sparkles } from 'lucide-react';
import { audio } from '../audio/audioManager';

interface EnergyShopModalProps {
  currentEnergy: number;
  maxEnergy: number;
  gems: number;
  onBuyEnergy: (amount: number, gemCost: number) => void;
  onClose: () => void;
}

export const EnergyShopModal: React.FC<EnergyShopModalProps> = ({
  currentEnergy,
  maxEnergy,
  gems,
  onBuyEnergy,
  onClose,
}) => {
  const packs = [
    { amount: 30, cost: 8, title: 'Energy Spark', icon: '⚡' },
    { amount: 65, cost: 15, title: 'Energy Orb', icon: '✨', popular: true },
    { amount: 120, cost: 25, title: 'Full Astral Recharge', icon: '🌟' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400" />
            <h2 className="text-base font-black text-cyan-200">Energy Sanctuary</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current status */}
        <div className="py-3 text-center">
          <span className="text-xs text-slate-400">Current Energy</span>
          <div className="text-2xl font-black text-cyan-300">
            {currentEnergy} / {maxEnergy}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Recharges +1 Energy automatically every 2 minutes.
          </p>
        </div>

        {/* Packs */}
        <div className="space-y-2.5 my-2">
          {packs.map((pack, idx) => {
            const canAfford = gems >= pack.cost;

            return (
              <div
                key={idx}
                className={`relative flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  pack.popular
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-800/60 border-slate-700'
                }`}
              >
                {pack.popular && (
                  <span className="absolute -top-2 left-4 bg-cyan-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    Best Value
                  </span>
                )}

                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{pack.icon}</span>
                  <div>
                    <h3 className="text-xs font-black text-white">{pack.title}</h3>
                    <span className="text-xs font-bold text-cyan-400">+{pack.amount} Energy</span>
                  </div>
                </div>

                <button
                  disabled={!canAfford}
                  onClick={() => {
                    if (canAfford) {
                      audio.playEnergy();
                      onBuyEnergy(pack.amount, pack.cost);
                      onClose();
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                    canAfford
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-md shadow-purple-500/25 active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                  }`}
                >
                  <Gem className="w-3.5 h-3.5" />
                  <span>{pack.cost}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
