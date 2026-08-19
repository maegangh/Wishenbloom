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
      label: 'Kingdom',
      icon: Castle,
      badge: false,
    },
    {
      id: 'board' as MainTab,
      label: 'Merge Board',
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
    <nav className="fixed bottom-0 inset-x-0 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl px-3 py-1.5 safe-bottom z-30 select-none">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-pink-500 rounded-full border border-slate-950 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
