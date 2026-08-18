import React from 'react';

interface NpcAvatarProps {
  avatarId: string;
  size?: number;
  className?: string;
}

export const NpcAvatar: React.FC<NpcAvatarProps> = ({ avatarId, size = 56, className = '' }) => {
  const renderNpc = () => {
    switch (avatarId) {
      case 'elowen': // Elf Herbalist
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
            {/* Long green emerald hair */}
            <path d="M22 45 C15 70 20 88 28 94 L72 94 C80 88 85 70 78 45 C78 20 22 20 22 45 Z" fill="#047857" />
            {/* Elf ears */}
            <polygon points="18,48 30,42 26,56" fill="#fde68a" />
            <polygon points="82,48 70,42 74,56" fill="#fde68a" />
            {/* Face */}
            <ellipse cx="50" cy="52" rx="22" ry="24" fill="#fef08a" />
            {/* Flower crown */}
            <circle cx="34" cy="30" r="6" fill="#f43f5e" />
            <circle cx="50" cy="26" r="7" fill="#facc15" />
            <circle cx="66" cy="30" r="6" fill="#38bdf8" />
            {/* Eyes & smile */}
            <ellipse cx="42" cy="50" rx="3" ry="4" fill="#065f46" />
            <ellipse cx="58" cy="50" rx="3" ry="4" fill="#065f46" />
            <circle cx="43" cy="48" r="1" fill="#ffffff" />
            <circle cx="59" cy="48" r="1" fill="#ffffff" />
            <path d="M46 62 Q50 66 54 62" stroke="#b45309" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="36" cy="56" r="3.5" fill="#f472b6" opacity="0.6" />
            <circle cx="64" cy="56" r="3.5" fill="#f472b6" opacity="0.6" />
          </svg>
        );

      case 'valerie': // Archmage Valerie
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="3" />
            {/* Silver hair */}
            <path d="M24 45 C18 70 22 88 30 94 L70 94 C78 88 82 70 76 45 C76 20 24 20 24 45 Z" fill="#cbd5e1" />
            {/* Face */}
            <ellipse cx="50" cy="52" rx="22" ry="24" fill="#fed7aa" />
            {/* Sorceress Hat */}
            <polygon points="50,6 20,38 80,38" fill="#6d28d9" stroke="#4c1d95" strokeWidth="2" />
            <ellipse cx="50" cy="38" rx="34" ry="7" fill="#5b21b6" />
            <circle cx="50" cy="38" r="4" fill="#facc15" />
            {/* Eyes & smile */}
            <ellipse cx="42" cy="52" rx="3" ry="4" fill="#7c3aed" />
            <ellipse cx="58" cy="52" rx="3" ry="4" fill="#7c3aed" />
            <path d="M46 63 Q50 67 54 63" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        );

      case 'balgor': // Dwarf Blacksmith
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="#fff7ed" stroke="#f97316" strokeWidth="3" />
            {/* Helmet */}
            <path d="M26 38 C26 22 74 22 74 38 L78 44 L22 44 Z" fill="#64748b" stroke="#334155" strokeWidth="2" />
            <polygon points="50,14 44,26 56,26" fill="#f59e0b" />
            {/* Face */}
            <ellipse cx="50" cy="52" rx="24" ry="22" fill="#fed7aa" />
            {/* Fiery Red Beard & Mustache */}
            <path d="M28 58 C20 85 45 96 50 96 C55 96 80 85 72 58 C65 64 35 64 28 58 Z" fill="#ea580c" />
            <path d="M36 58 Q50 64 64 58 Q50 72 36 58 Z" fill="#c2410c" />
            {/* Cheerful dwarf eyes */}
            <path d="M38 48 Q44 44 46 48 M54 48 Q56 44 62 48" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="50" cy="54" r="5" fill="#f97316" />
          </svg>
        );

      case 'aurelia': // Princess Aurelia
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="#fefce8" stroke="#eab308" strokeWidth="3" />
            {/* Golden flowing hair */}
            <path d="M22 45 C15 75 22 92 30 94 L70 94 C78 92 85 75 78 45 C78 18 22 18 22 45 Z" fill="#facc15" />
            {/* Golden Tiara */}
            <polygon points="34,26 42,16 50,22 58,16 66,26" fill="#eab308" stroke="#b45309" strokeWidth="1.5" />
            <circle cx="50" cy="22" r="3" fill="#38bdf8" />
            {/* Face */}
            <ellipse cx="50" cy="52" rx="22" ry="24" fill="#fef08a" />
            {/* Blue royal eyes */}
            <ellipse cx="42" cy="50" rx="3.5" ry="4.5" fill="#0284c7" />
            <ellipse cx="58" cy="50" rx="3.5" ry="4.5" fill="#0284c7" />
            <circle cx="43" cy="48" r="1.2" fill="#ffffff" />
            <circle cx="59" cy="48" r="1.2" fill="#ffffff" />
            <path d="M45 63 Q50 67 55 63" stroke="#b45309" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="36" cy="57" r="3" fill="#f43f5e" opacity="0.5" />
            <circle cx="64" cy="57" r="3" fill="#f43f5e" opacity="0.5" />
          </svg>
        );

      case 'pip': // Goblin Merchant Pip
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="#ecfeff" stroke="#06b6d4" strokeWidth="3" />
            {/* Big Goblin Ears */}
            <polygon points="12,50 32,36 28,62" fill="#86efac" stroke="#22c55e" strokeWidth="2" />
            <polygon points="88,50 68,36 72,62" fill="#86efac" stroke="#22c55e" strokeWidth="2" />
            {/* Green face */}
            <ellipse cx="50" cy="54" rx="24" ry="22" fill="#a7f3d0" />
            {/* Merchant Hat */}
            <ellipse cx="50" cy="34" rx="28" ry="10" fill="#78350f" />
            <path d="M32 34 C32 16 68 16 68 34 Z" fill="#b45309" />
            <polygon points="62,18 72,28 66,32" fill="#ec4899" />
            {/* Curious big golden eyes */}
            <circle cx="41" cy="50" r="6" fill="#eab308" />
            <circle cx="41" cy="50" r="3" fill="#1e293b" />
            <circle cx="59" cy="50" r="6" fill="#eab308" />
            <circle cx="59" cy="50" r="3" fill="#1e293b" />
            {/* Pointy Nose */}
            <polygon points="50,52 46,60 54,60" fill="#34d399" />
            {/* Mischievous grin */}
            <path d="M40 66 Q50 74 60 66" stroke="#065f46" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        );

      case 'sylas': // Dragon Tamer Sylas
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="#fdf2f8" stroke="#ec4899" strokeWidth="3" />
            {/* Wild purple/black hair */}
            <path d="M22 45 C15 70 20 88 28 94 L72 94 C80 88 85 70 78 45 C78 16 22 16 22 45 Z" fill="#831843" />
            {/* Face */}
            <ellipse cx="50" cy="52" rx="22" ry="24" fill="#fed7aa" />
            {/* Dragon scale eyepatch / marking */}
            <polygon points="54,44 64,48 58,58 48,54" fill="#ec4899" opacity="0.4" />
            {/* Eyes */}
            <ellipse cx="42" cy="50" rx="3.5" ry="4" fill="#db2777" />
            <ellipse cx="58" cy="50" rx="3.5" ry="4" fill="#db2777" />
            <circle cx="43" cy="48" r="1.2" fill="#ffffff" />
            <circle cx="59" cy="48" r="1.2" fill="#ffffff" />
            <path d="M46 64 Q50 68 54 64" stroke="#9d174d" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        );
    }
  };

  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`relative select-none flex-shrink-0 drop-shadow ${className}`}
    >
      {renderNpc()}
    </div>
  );
};
