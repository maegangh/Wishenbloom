import React from 'react';

interface NpcAvatarProps {
  avatarId: string;
  size?: number;
  className?: string;
}

export const NpcAvatar: React.FC<NpcAvatarProps> = ({ avatarId, size = 56, className = '' }) => {
  const renderNpc = () => {
    switch (avatarId) {
      case 'elowen': // Elf Herbalist / Bloomkeeper
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="elGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <radialGradient id="elBg">
                <stop offset="0%" stopColor="#ecfdf5" />
                <stop offset="100%" stopColor="#059669" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#elBg)" stroke="url(#elGold)" strokeWidth="3.5" />
            <path d="M18 52 C12 75 18 92 30 96 L70 96 C82 92 88 75 82 52 C82 22 18 22 18 52 Z" fill="#5c381c" />
            <path d="M42 70 L58 70 L64 96 L36 96 Z" fill="#fed7aa" />
            <path d="M30 84 Q50 94 70 84 L76 98 L24 98 Z" fill="#059669" stroke="#047857" strokeWidth="2" />
            <circle cx="50" cy="85" r="3" fill="#facc15" stroke="#b45309" strokeWidth="1" />
            <ellipse cx="50" cy="52" rx="22" ry="24" fill="#ffedd5" />
            <circle cx="35" cy="58" r="4.5" fill="#fb7185" opacity="0.45" />
            <circle cx="65" cy="58" r="4.5" fill="#fb7185" opacity="0.45" />
            <ellipse cx="40" cy="50" rx="4.5" ry="5.5" fill="#ffffff" />
            <ellipse cx="40" cy="50" rx="3" ry="4" fill="#047857" />
            <circle cx="39" cy="48" r="1.5" fill="#ffffff" />
            <ellipse cx="60" cy="50" rx="4.5" ry="5.5" fill="#ffffff" />
            <ellipse cx="60" cy="50" rx="3" ry="4" fill="#047857" />
            <circle cx="59" cy="48" r="1.5" fill="#ffffff" />
            <path d="M48 55 Q50 58 52 55" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M44 63 Q50 70 56 63" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M22 40 C28 25 44 26 50 34 C56 26 72 25 78 40 C72 32 58 30 50 40 C42 30 28 32 22 40 Z" fill="#784824" />
            <circle cx="30" cy="28" r="6" fill="#f43f5e" />
            <circle cx="30" cy="28" r="2" fill="#facc15" />
            <circle cx="44" cy="22" r="5" fill="#facc15" />
            <circle cx="58" cy="24" r="5.5" fill="#38bdf8" />
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

      case 'pip': // Goblin / Cute Frog Merchant in Sunhat
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="pipRing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
              <radialGradient id="pipBg">
                <stop offset="0%" stopColor="#ecfdf5" />
                <stop offset="100%" stopColor="#15803d" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#pipBg)" stroke="url(#pipRing)" strokeWidth="3.5" />
            <ellipse cx="50" cy="62" rx="30" ry="24" fill="#4ade80" stroke="#16a34a" strokeWidth="2" />
            <ellipse cx="50" cy="74" rx="20" ry="12" fill="#dcfce7" />
            <circle cx="34" cy="50" r="10" fill="#ffffff" stroke="#16a34a" strokeWidth="1.5" />
            <circle cx="34" cy="50" r="5.5" fill="#15803d" />
            <circle cx="32" cy="48" r="2" fill="#ffffff" />
            <circle cx="66" cy="50" r="10" fill="#ffffff" stroke="#16a34a" strokeWidth="1.5" />
            <circle cx="66" cy="50" r="5.5" fill="#15803d" />
            <circle cx="64" cy="48" r="2" fill="#ffffff" />
            <circle cx="26" cy="64" r="5" fill="#f43f5e" opacity="0.4" />
            <circle cx="74" cy="64" r="5" fill="#f43f5e" opacity="0.4" />
            <path d="M34 66 Q50 78 66 66" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
            <ellipse cx="50" cy="38" rx="40" ry="12" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
            <ellipse cx="50" cy="36" rx="36" ry="9" fill="#fef08a" />
            <path d="M30 36 C30 18 70 18 70 36 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
            <path d="M31 34 Q50 38 69 34" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" fill="none" />
            <circle cx="64" cy="32" r="6" fill="#f472b6" />
            <circle cx="64" cy="32" r="2.5" fill="#fef08a" />
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

