import React from 'react';
import { Castle, Sparkles, BookOpen, Scroll } from 'lucide-react';

export type MainTab = 'board' | 'kingdom' | 'compendium' | 'quests';

interface BottomNavProps {
  activeTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
  hasUnclaimedQuests?: boolean;
  hasUnclaimedDiscoveries?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  hasUnclaimedQuests,
  hasUnclaimedDiscoveries,
}) => {
  const tabs = [
    {
      id: 'kingdom' as MainTab,
      label: 'Realm',
      icon: Castle,
      badge: false,
    },
    {
      id: 'board' as MainTab,
      label: 'Garden',
      icon: Sparkles,
      badge: false,
    },
    {
      id: 'compendium' as MainTab,
      label: 'Compendium',
      icon: BookOpen,
      badge: hasUnclaimedDiscoveries,
    },
    {
      id: 'quests' as MainTab,
      label: 'Quests',
      icon: Scroll,
      badge: hasUnclaimedQuests,
    },
  ];

  return (
    <nav className="w-full bg-gradient-to-t from-slate-950 via-slate-900 to-indigo-950/90 border-t-2 border-amber-500/30 px-3 py-1.5 safe-bottom z-30 select-none shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-md mx-auto gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-amber-600/30 to-amber-950/60 border-2 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20 scale-102 font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent font-bold'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-115 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]' : 'text-slate-400'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse flex items-center justify-center text-[7px] font-black text-white" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

