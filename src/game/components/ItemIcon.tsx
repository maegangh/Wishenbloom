import React from 'react';
import { ITEMS } from '../data/items';
import { GENERATORS } from '../data/generators';

interface ItemIconProps {
  itemId?: string;
  isGenerator?: boolean;
  generatorId?: string;
  size?: number | string;
  className?: string;
  showTierBadge?: boolean;
  animate?: boolean;
}

const SWEETBLOOM_ASSETS: Record<string, string> = {
  herb_1: '/assets/items/sweetbloom/herb_1.png',
  herb_2: '/assets/items/sweetbloom/herb_2.png',
  herb_3: '/assets/items/sweetbloom/herb_3.png',
  herb_4: '/assets/items/sweetbloom/herb_4.png',
  herb_5: '/assets/items/sweetbloom/herb_5.png',
  herb_6: '/assets/items/sweetbloom/herb_6.png',
  herb_7: '/assets/items/sweetbloom/herb_7.png',
  herb_8: '/assets/items/sweetbloom/herb_8.png',
  herb_9: '/assets/items/sweetbloom/herb_9.png',
  herb_10: '/assets/items/sweetbloom/herb_10.png',
};

export const ItemIcon: React.FC<ItemIconProps> = ({
  itemId,
  isGenerator,
  generatorId,
  size = 48,
  className = '',
  showTierBadge = true,
}) => {
  const item = itemId ? ITEMS[itemId] : null;
  const generator = generatorId ? GENERATORS[generatorId] : null;

  const iconType = isGenerator
    ? generator?.iconType || 'gen_garden'
    : item?.iconType || 'herb_1';

  const tier = item?.tier || generator?.level || 1;
  const maxTier = item?.maxTier || generator?.maxLevel || 8;
  const color = item?.color || generator?.color || '#10b981';

  // Render graphic for each icon type
  const renderGraphic = () => {
    // Check if production raster asset is defined for Sweetbloom
    if (!isGenerator && SWEETBLOOM_ASSETS[iconType]) {
      return (
        <img
          src={SWEETBLOOM_ASSETS[iconType]}
          alt={item?.name || iconType}
          className="w-[88%] h-[88%] max-w-full max-h-full object-contain select-none pointer-events-none drop-shadow-md transition-transform duration-200"
          draggable={false}
        />
      );
    }

    switch (iconType) {
      // ===== HERB CHAIN (FALLBACKS) =====
      case 'herb_1': // Sweetbloom Seedling
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
            <defs>
              <linearGradient id="h1_soil" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#693b11" />
                <stop offset="100%" stopColor="#2e1503" />
              </linearGradient>
              <linearGradient id="h1_leafL" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#bef264" />
                <stop offset="45%" stopColor="#84cc16" />
                <stop offset="100%" stopColor="#4d7c0f" />
              </linearGradient>
              <linearGradient id="h1_leafR" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="45%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <radialGradient id="h1_dew" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#38bdf8" />
              </radialGradient>
            </defs>
            {/* Rich fertile soil mound */}
            <ellipse cx="50" cy="84" rx="26" ry="7.5" fill="url(#h1_soil)" stroke="#1a0b02" strokeWidth="1.5" />
            <ellipse cx="50" cy="83" rx="22" ry="4.5" fill="#854d0e" opacity="0.6" />
            {/* Curved sturdy sprout stem */}
            <path d="M50 83 C50 68 47 52 46 44 C49 46 53 46 54 44 C53 54 52 70 50 83 Z" fill="#65a30d" stroke="#365314" strokeWidth="1" />
            {/* Left Leaf (Sunlit Lime) */}
            <path d="M48 48 C26 38 18 20 34 14 C48 18 47 36 48 48 Z" fill="url(#h1_leafL)" stroke="#3f6212" strokeWidth="1.5" />
            <path d="M48 48 C38 35 34 22 34 14" stroke="#d9f99d" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" />
            {/* Right Leaf (Emerald Heart) */}
            <path d="M51 45 C73 34 82 17 66 12 C52 16 52 33 51 45 Z" fill="url(#h1_leafR)" stroke="#166534" strokeWidth="1.5" />
            <path d="M51 45 C60 32 64 20 66 12" stroke="#bbf7d0" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" />
            {/* Dewdrop with glistening sun highlight */}
            <circle cx="34" cy="20" r="3.8" fill="url(#h1_dew)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))" />
            <circle cx="33" cy="19" r="1.2" fill="#ffffff" />
            {/* Tiny pollen spark */}
            <polygon points="68,14 69.5,17 73,17 70.5,19 71.5,22 68.5,20 65.5,22 66.5,19 64,17 67.5,17" fill="#fef08a" opacity="0.95" />
          </svg>
        );
      case 'herb_2': // Sweetbloom Sprout
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg overflow-visible">
            <defs>
              <linearGradient id="h2_stalk1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <linearGradient id="h2_stalk2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a3e635" />
                <stop offset="100%" stopColor="#4d7c0f" />
              </linearGradient>
              <linearGradient id="h2_stalk3" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="h2_twine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#92400e" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="86" rx="28" ry="6" fill="#0f172a" opacity="0.35" />
            {/* Left Herb Stem & Leaves */}
            <path d="M36 76 C18 42 26 18 42 12 C48 26 43 58 38 76 Z" fill="url(#h2_stalk1)" stroke="#14532d" strokeWidth="1.5" />
            <path d="M38 76 C28 44 32 24 42 12" stroke="#bbf7d0" strokeWidth="1.8" fill="none" opacity="0.8" />
            {/* Right Herb Stem & Leaves */}
            <path d="M64 76 C82 42 74 18 58 12 C52 26 57 58 62 76 Z" fill="url(#h2_stalk3)" stroke="#064e3b" strokeWidth="1.5" />
            <path d="M62 76 C72 44 68 24 58 12" stroke="#a7f3d0" strokeWidth="1.8" fill="none" opacity="0.8" />
            {/* Center Dominant Herb Stem */}
            <path d="M50 78 C38 42 46 14 56 10 C66 22 60 55 52 78 Z" fill="url(#h2_stalk2)" stroke="#365314" strokeWidth="1.5" />
            <path d="M51 78 C44 42 50 20 56 10" stroke="#ecfccb" strokeWidth="2" fill="none" opacity="0.9" />
            {/* Golden Twine / Raffia Wrap with knot */}
            <rect x="33" y="56" width="34" height="9" rx="4" fill="url(#h2_twine)" stroke="#78350f" strokeWidth="1.5" />
            <path d="M38 56 C44 60 56 60 62 56" stroke="#fef08a" strokeWidth="1.5" fill="none" />
            <circle cx="50" cy="60.5" r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1.2" />
            {/* Hanging twine tails */}
            <path d="M47 64 C42 72 38 78 36 82 M53 64 C58 72 62 78 64 82" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
            {/* Shimmering Pollen particles */}
            <circle cx="58" cy="18" r="2.8" fill="#fef08a" />
            <circle cx="34" cy="24" r="2.2" fill="#ffffff" />
          </svg>
        );
      case 'herb_3': // Sweetbloom Youngling
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <defs>
              <radialGradient id="h3_glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="h3_petalA" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="h3_petalB" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="100%" stopColor="#065f46" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" fill="url(#h3_glow)" />
            {/* Central stem */}
            <path d="M50 86 Q50 50 48 24 Q52 50 50 86" fill="#064e3b" />
            {/* Multi-tier crystalline botanical foliage */}
            <path d="M48 48 C14 36 12 12 36 8 C52 18 50 36 48 48 Z" fill="url(#h3_petalA)" stroke="#065f46" strokeWidth="1.5" />
            <path d="M52 44 C86 32 88 8 64 4 C48 14 50 32 52 44 Z" fill="url(#h3_petalB)" stroke="#065f46" strokeWidth="1.5" />
            <path d="M50 62 C84 56 86 34 70 28 C58 38 52 52 50 62 Z" fill="url(#h3_petalA)" stroke="#064e3b" strokeWidth="1.5" />
            <path d="M50 64 C16 58 14 36 30 30 C42 40 48 54 50 64 Z" fill="url(#h3_petalB)" stroke="#064e3b" strokeWidth="1.5" />
            {/* Center glowing blossom node */}
            <circle cx="50" cy="38" r="7" fill="#fef08a" stroke="#d97706" strokeWidth="1.5" />
            <circle cx="50" cy="38" r="4" fill="#ffffff" />
            {/* Mana sparkles */}
            <polygon points="50,12 52,18 58,20 52,22 50,28 48,22 42,20 48,18" fill="#ffffff" />
            <polygon points="76,28 77,32 81,33 77,34 76,38 75,34 71,33 75,32" fill="#a7f3d0" />
            <polygon points="24,30 25,34 29,35 25,36 24,40 23,36 19,35 23,34" fill="#fef08a" />
          </svg>
        );
      case 'herb_4': // Sweetbloom Bud
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <circle cx="50" cy="50" r="42" fill="url(#tealGlow)" opacity="0.4" />
            <defs>
              <radialGradient id="tealGlow">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Crescent moon shape in background */}
            <path d="M65 15 A 35 35 0 1 0 75 75 A 30 30 0 1 1 65 15 Z" fill="#99f6e4" opacity="0.35" />
            {/* Silvery leaves */}
            <path d="M50 82 C30 65 20 40 38 20 C55 35 52 65 50 82 Z" fill="#2dd4bf" />
            <path d="M50 82 C70 65 80 40 62 20 C45 35 48 65 50 82 Z" fill="#14b8a6" />
            <path d="M50 82 L50 20" stroke="#ccfbf1" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="20" r="4" fill="#ffffff" />
            <circle cx="38" cy="35" r="2" fill="#ffffff" />
            <circle cx="62" cy="35" r="2" fill="#ffffff" />
          </svg>
        );
      case 'herb_5': // Sweetbloom Blossom
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            <circle cx="50" cy="50" r="44" fill="#06b6d4" opacity="0.25" />
            {/* Starlike flower petals */}
            <g transform="translate(50,50)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <path
                  key={i}
                  d="M0 0 C-10 -20 0 -42 0 -42 C0 -42 10 -20 0 0 Z"
                  fill={i % 2 === 0 ? '#22d3ee' : '#0891b2'}
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle cx="0" cy="0" r="14" fill="#facc15" />
              <circle cx="0" cy="0" r="8" fill="#ffffff" />
            </g>
          </svg>
        );
      case 'herb_6': // Sweetbloom Bloom
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <circle cx="50" cy="50" r="46" fill="#8b5cf6" opacity="0.3" />
            <g transform="translate(50,50)">
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <path
                  key={i}
                  d="M0 0 C-16 -18 -12 -42 0 -45 C12 -42 16 -18 0 0 Z"
                  fill={i % 2 === 0 ? '#a855f7' : '#7c3aed'}
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle cx="0" cy="0" r="16" fill="#f43f5e" />
              <polygon points="0,-10 3,-3 10,0 3,3 0,10 -3,3 -10,0 -3,-3" fill="#ffffff" />
            </g>
          </svg>
        );
      case 'herb_7': // Sweetbloom Bouquet
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
            <circle cx="50" cy="50" r="48" fill="#ec4899" opacity="0.3" />
            <g transform="translate(50,50)">
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                <path
                  key={i}
                  d="M0 0 C-8 -20 0 -46 0 -46 C0 -46 8 -20 0 0 Z"
                  fill={i % 3 === 0 ? '#f472b6' : i % 3 === 1 ? '#ec4899' : '#db2777'}
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle cx="0" cy="0" r="18" fill="#fef08a" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="0" cy="0" r="10" fill="#ffffff" />
            </g>
          </svg>
        );
      case 'herb_8': // Sweetbloom Flourish
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
            <circle cx="50" cy="50" r="48" fill="#eab308" opacity="0.35" />
            <g transform="translate(50,52)">
              {/* Crown Base */}
              <path d="M-36 10 L-26 -25 L-8 -6 L0 -35 L8 -6 L26 -25 L36 10 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
              {/* Floating Golden Petals */}
              <circle cx="0" cy="-35" r="5" fill="#fef08a" />
              <circle cx="-26" cy="-25" r="4" fill="#38bdf8" />
              <circle cx="26" cy="-25" r="4" fill="#38bdf8" />
              <circle cx="0" cy="-6" r="6" fill="#f43f5e" />
              <path d="M-30 20 C0 35 0 35 30 20 C18 10 -18 10 -30 20 Z" fill="#ca8a04" />
            </g>
          </svg>
        );
      case 'herb_9': // Sweetbloom Radiance
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
            <circle cx="50" cy="50" r="48" fill="#f43f5e" opacity="0.35" />
            <g transform="translate(50,50)">
              <ellipse cx="0" cy="0" rx="44" ry="18" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 4" transform="rotate(-25)"/>
              <circle cx="-38" cy="15" r="5" fill="#fb7185" />
              <circle cx="38" cy="-15" r="5" fill="#facc15" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <path
                  key={i}
                  d="M0 0 C-10 -20 0 -44 0 -44 C0 -44 10 -20 0 0 Z"
                  fill={i % 2 === 0 ? '#fb7185' : '#e11d48'}
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle cx="0" cy="0" r="16" fill="#fbbf24" />
              <circle cx="0" cy="0" r="9" fill="#ffffff" />
            </g>
          </svg>
        );
      case 'herb_10': // Sweetbloom Ascendant
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
            <circle cx="50" cy="50" r="48" fill="#f59e0b" opacity="0.35" />
            <g transform="translate(50,50)">
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                <polygon key={`r-${i}`} points="0,-48 3,-36 -3,-36" fill="#fde047" transform={`rotate(${angle})`} />
              ))}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <path
                  key={`p-${i}`}
                  d="M0 0 C-12 -18 0 -45 0 -45 C0 -45 12 -18 0 0 Z"
                  fill={i % 2 === 0 ? '#fde047' : '#f59e0b'}
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle cx="0" cy="0" r="15" fill="#f59e0b" stroke="#78350f" strokeWidth="2"/>
              <polygon points="0,-10 8,0 0,10 -8,0" fill="#ffffff"/>
            </g>
          </svg>
        );

      // ===== POTION CHAIN =====
      case 'potion_1': // Empty Glass Vial
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <ellipse cx="50" cy="88" rx="25" ry="6" fill="#0f172a" opacity="0.25" />
            {/* Cork */}
            <rect x="42" y="14" width="16" height="10" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
            {/* Neck */}
            <rect x="44" y="24" width="12" height="14" fill="#94a3b8" opacity="0.7" />
            {/* Flask body */}
            <path d="M44 38 L25 72 C22 78 26 84 34 84 L66 84 C74 84 78 78 75 72 L56 38 Z" fill="#cbd5e1" opacity="0.6" stroke="#64748b" strokeWidth="2.5" />
            <path d="M34 50 L30 72" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          </svg>
        );
      case 'potion_2': // Herbal Tonic
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <rect x="42" y="14" width="16" height="10" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
            <rect x="44" y="24" width="12" height="14" fill="#94a3b8" opacity="0.7" />
            <path d="M44 38 L25 72 C22 78 26 84 34 84 L66 84 C74 84 78 78 75 72 L56 38 Z" fill="#cbd5e1" opacity="0.4" stroke="#475569" strokeWidth="2.5" />
            {/* Green liquid */}
            <path d="M33 55 L28 72 C26 77 29 82 35 82 L65 82 C71 82 74 77 72 72 L67 55 Z" fill="#22c55e" />
            <circle cx="45" cy="68" r="3" fill="#86efac" />
            <circle cx="58" cy="74" r="2" fill="#86efac" />
            <path d="M32 55 L30 72" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          </svg>
        );
      case 'potion_3': // Mana Potion
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            <circle cx="50" cy="58" r="32" fill="#3b82f6" opacity="0.25" />
            {/* Round potion bottle */}
            <rect x="43" y="12" width="14" height="10" rx="2" fill="#92400e" />
            <rect x="45" y="22" width="10" height="12" fill="#cbd5e1" opacity="0.8" />
            <circle cx="50" cy="60" r="26" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="3" />
            <circle cx="50" cy="60" r="20" fill="#60a5fa" />
            <ellipse cx="42" cy="48" rx="6" ry="3" fill="#ffffff" opacity="0.8" transform="rotate(-30, 42, 48)" />
            <circle cx="55" cy="65" r="3" fill="#dbeafe" />
          </svg>
        );
      case 'potion_4': // Healing Elixir
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            <circle cx="50" cy="58" r="32" fill="#ef4444" opacity="0.25" />
            <rect x="42" y="10" width="16" height="12" rx="3" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
            <rect x="44" y="22" width="12" height="12" fill="#cbd5e1" opacity="0.8" />
            {/* Heart/Diamond shaped bottle */}
            <path d="M50 88 C20 70 20 40 40 38 C46 38 50 42 50 42 C50 42 54 38 60 38 C80 40 80 70 50 88 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="3" />
            <path d="M50 82 C28 66 28 46 42 44 C46 44 50 48 50 48 C50 48 54 44 58 44 C72 46 72 66 50 82 Z" fill="#f87171" />
            <polygon points="50,50 53,57 60,57 55,62 57,69 50,65 43,69 45,62 40,57 47,57" fill="#ffffff" opacity="0.9" />
          </svg>
        );
      case 'potion_5': // Greater Elixir
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <circle cx="50" cy="55" r="38" fill="#a855f7" opacity="0.3" />
            {/* Ornate stopper with gem */}
            <polygon points="50,6 58,16 50,22 42,16" fill="#facc15" />
            <circle cx="50" cy="14" r="3" fill="#a855f7" />
            <rect x="44" y="22" width="12" height="10" fill="#e2e8f0" />
            {/* Triangular ornate flask */}
            <path d="M50 32 L20 78 C16 84 20 90 28 90 L72 90 C80 90 84 84 80 78 Z" fill="#7c3aed" stroke="#581c87" strokeWidth="3" />
            <path d="M50 40 L28 76 C26 80 28 84 34 84 L66 84 C72 84 74 80 72 76 Z" fill="#a855f7" />
            <circle cx="50" cy="65" r="10" fill="#c084fc" />
            <circle cx="50" cy="65" r="5" fill="#ffffff" />
          </svg>
        );
      case 'potion_6': // Enchanted Concoction
      case 'potion_7': // Royal Elixir
      case 'potion_8': // Elixir of Eternity
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
            <circle cx="50" cy="55" r="42" fill={color} opacity="0.35" />
            {/* Gilded Chalice/Flask */}
            <path d="M30 20 L70 20 L62 55 C60 70 40 70 38 55 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2.5" />
            <rect x="46" y="58" width="8" height="20" fill="#eab308" />
            <ellipse cx="50" cy="80" rx="20" ry="6" fill="#ca8a04" />
            {/* Glowing elixir pouring over */}
            <ellipse cx="50" cy="22" rx="18" ry="6" fill={color} />
            <polygon points="50,30 54,42 66,42 56,50 60,62 50,54 40,62 44,50 34,42 46,42" fill="#ffffff" />
            <circle cx="50" cy="12" r="4" fill="#fef08a" />
          </svg>
        );

      // ===== SPELLBOOK CHAIN =====
      case 'book_1': // Torn Spell Page
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <path d="M25 20 L75 16 L70 80 L55 76 L48 82 L35 77 L20 84 Z" fill="#fef3c7" stroke="#d97706" strokeWidth="2.5" />
            <line x1="32" y1="32" x2="65" y2="30" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="32" y1="44" x2="62" y2="42" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="32" y1="56" x2="55" y2="54" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="62" cy="62" r="6" fill="#ef4444" opacity="0.6" />
          </svg>
        );
      case 'book_2': // Apprentice Spell Notes
      case 'book_3': // Novice Journal
      case 'book_4': // Wizard Spellbook
      case 'book_5': // Enchanted Tome
      case 'book_6': // Arcane Grimoire
      case 'book_7': // Grand High Grimoire
      case 'book_8': // Tome of Primordial Magic
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <circle cx="50" cy="50" r="40" fill={color} opacity="0.25" />
            {/* Book Spine and Cover */}
            <path d="M22 18 C22 18 35 15 50 20 C65 15 78 18 78 18 L78 78 C78 78 65 74 50 78 C35 74 22 78 22 78 Z" fill={color} stroke="#1e293b" strokeWidth="2.5" />
            {/* Pages */}
            <path d="M26 22 C26 22 36 19 50 23 C64 19 74 22 74 22 L74 74 C74 74 64 71 50 75 C36 71 26 74 26 74 Z" fill="#fef3c7" />
            {/* Center crease */}
            <line x1="50" y1="23" x2="50" y2="75" stroke="#94a3b8" strokeWidth="2" />
            {/* Mystic Emblem on Left and Right */}
            <circle cx="38" cy="46" r="6" fill={color} opacity="0.5" />
            <polygon points="62,38 65,45 72,45 66,50 68,57 62,52 56,57 58,50 52,45 59,45" fill="#facc15" />
          </svg>
        );

      // ===== TREASURE CHAIN =====
      case 'coin_item_1': // Copper Penny
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <circle cx="50" cy="50" r="32" fill="#b45309" stroke="#78350f" strokeWidth="3" />
            <circle cx="50" cy="50" r="26" fill="#d97706" />
            <circle cx="50" cy="50" r="20" fill="#f59e0b" />
            <path d="M50 34 L54 44 L64 44 L56 50 L59 60 L50 54 L41 60 L44 50 L36 44 L46 44 Z" fill="#78350f" />
          </svg>
        );
      case 'coin_item_2': // Coin Pouch
      case 'coin_item_3': // Silver Purse
      case 'coin_item_4': // Gilded Velvet Sack
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            <ellipse cx="50" cy="85" rx="30" ry="7" fill="#0f172a" opacity="0.3" />
            {/* Pouch Top frills */}
            <path d="M38 25 C30 18 45 15 50 20 C55 15 70 18 62 25 Z" fill="#d97706" />
            {/* Tie rope */}
            <rect x="36" y="28" width="28" height="6" rx="3" fill="#facc15" />
            {/* Body */}
            <path d="M38 34 C20 45 15 75 32 82 C42 86 58 86 68 82 C85 75 80 45 62 34 Z" fill={color} stroke="#78350f" strokeWidth="2.5" />
            <circle cx="50" cy="58" r="12" fill="#facc15" stroke="#b45309" strokeWidth="2" />
            <text x="50" y="64" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#78350f">🪙</text>
          </svg>
        );
      case 'coin_item_5': // Small Treasure Chest
      case 'coin_item_6': // Royal Crown Vault
      case 'coin_item_7': // Enchanted Treasury
      case 'coin_item_8': // Dragon Golden Hoard
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
            <circle cx="50" cy="50" r="42" fill="#f59e0b" opacity="0.3" />
            {/* Chest base */}
            <rect x="20" y="44" width="60" height="38" rx="5" fill="#78350f" stroke="#451a03" strokeWidth="2.5" />
            {/* Chest lid */}
            <path d="M18 44 C18 26 82 26 82 44 Z" fill="#b45309" stroke="#451a03" strokeWidth="2.5" />
            {/* Gold Straps */}
            <rect x="32" y="28" width="8" height="54" fill="#facc15" />
            <rect x="60" y="28" width="8" height="54" fill="#facc15" />
            {/* Keyhole */}
            <circle cx="50" cy="54" r="6" fill="#facc15" stroke="#78350f" strokeWidth="1.5" />
            <polygon points="50,56 47,64 53,64" fill="#78350f" />
            {/* Sparkles */}
            <polygon points="25,25 27,31 33,31 28,35 30,41 25,37 20,41 22,35 17,31 23,31" fill="#fef08a" />
          </svg>
        );

      // ===== BLACKSMITH CHAIN =====
      case 'forge_1': // Raw Iron Ore
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <polygon points="25,75 18,50 35,22 68,18 84,45 76,78 45,84" fill="#78716c" stroke="#44403c" strokeWidth="3" />
            <polygon points="35,22 55,42 68,18" fill="#a8a29e" />
            <polygon points="18,50 45,55 25,75" fill="#57534e" />
            <polygon points="45,55 76,78 45,84" fill="#292524" />
            <circle cx="55" cy="35" r="3" fill="#f97316" />
          </svg>
        );
      case 'forge_2': // Smelted Ingot
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <polygon points="28,45 62,35 82,50 48,62" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
            <polygon points="28,45 48,62 48,78 28,60" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
            <polygon points="48,62 82,50 82,66 48,78" fill="#64748b" stroke="#475569" strokeWidth="2" />
            <polygon points="38,32 72,22 92,37 58,48" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
          </svg>
        );
      case 'forge_3': // Honed Dagger
      case 'forge_4': // Knight's Broadsword
      case 'forge_5': // Enchanted Longsword
      case 'forge_6': // Royal Paladin Blade
      case 'forge_7': // Sunfire Greatsword
      case 'forge_8': // Legendary Crownblade
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
            <circle cx="50" cy="50" r="42" fill={color} opacity="0.3" />
            <g transform="translate(50,50) rotate(45)">
              {/* Blade */}
              <polygon points="-5,-42 0,-50 5,-42 6,10 -6,10" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
              <line x1="0" y1="-48" x2="0" y2="10" stroke="#94a3b8" strokeWidth="2" />
              {/* Crossguard */}
              <rect x="-18" y="10" width="36" height="7" rx="3" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
              {/* Handle */}
              <rect x="-4" y="17" width="8" height="18" rx="2" fill="#78350f" />
              {/* Pommel */}
              <circle cx="0" cy="38" r="6" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
              <circle cx="0" cy="38" r="3" fill={color} />
            </g>
          </svg>
        );

      // ===== CREATURE CHAIN =====
      case 'creature_1': // Mysterious Egg
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <ellipse cx="50" cy="85" rx="24" ry="6" fill="#0f172a" opacity="0.3" />
            <path d="M50 15 C30 15 20 45 20 65 C20 82 34 88 50 88 C66 88 80 82 80 65 C80 45 70 15 50 15 Z" fill="#f472b6" stroke="#db2777" strokeWidth="3" />
            <circle cx="42" cy="45" r="5" fill="#fbcfe8" />
            <circle cx="60" cy="55" r="7" fill="#fbcfe8" />
            <circle cx="45" cy="72" r="4" fill="#fbcfe8" />
            <polygon points="58,32 60,36 64,36 61,39 62,43 58,40 54,43 55,39 52,36 56,36" fill="#ffffff" />
          </svg>
        );
      case 'creature_2': // Cracked Egg
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            <ellipse cx="50" cy="85" rx="24" ry="6" fill="#0f172a" opacity="0.3" />
            <path d="M50 15 C30 15 20 45 20 65 C20 82 34 88 50 88 C66 88 80 82 80 65 C80 45 70 15 50 15 Z" fill="#ec4899" stroke="#be185d" strokeWidth="3" />
            {/* Cracks glowing with starlight */}
            <path d="M45 25 L55 42 L42 54 L62 68 L50 82" stroke="#fef08a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="55" cy="42" r="4" fill="#fef08a" />
          </svg>
        );
      case 'creature_3': // Tiny Faeling Hatchling
      case 'creature_4': // Young Forest Sprite
      case 'creature_5': // Moonlit Drake
      case 'creature_6': // Enchanted Gryphon
      case 'creature_7': // Royal Phoenix
      case 'creature_8': // Mythic Astral Guardian
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
            <circle cx="50" cy="50" r="42" fill={color} opacity="0.3" />
            {/* Wing Left */}
            <path d="M50 45 C25 20 10 35 15 60 C25 65 40 55 50 45 Z" fill="#f472b6" opacity="0.8" />
            {/* Wing Right */}
            <path d="M50 45 C75 20 90 35 85 60 C75 65 60 55 50 45 Z" fill="#f472b6" opacity="0.8" />
            {/* Body */}
            <circle cx="50" cy="58" r="18" fill={color} stroke="#ffffff" strokeWidth="2" />
            {/* Head */}
            <circle cx="50" cy="38" r="14" fill={color} stroke="#ffffff" strokeWidth="2" />
            {/* Cute Eyes */}
            <circle cx="44" cy="36" r="3.5" fill="#1e293b" />
            <circle cx="43" cy="35" r="1" fill="#ffffff" />
            <circle cx="56" cy="36" r="3.5" fill="#1e293b" />
            <circle cx="55" cy="35" r="1" fill="#ffffff" />
            {/* Antenna / Horns */}
            <path d="M44 26 Q40 16 35 18 M56 26 Q60 16 65 18" stroke="#facc15" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="35" cy="18" r="2.5" fill="#fef08a" />
            <circle cx="65" cy="18" r="2.5" fill="#fef08a" />
          </svg>
        );

      // ===== TEXTILES CHAIN =====
      case 'textile_1': // Enchanted Thread
      case 'textile_2': // Woven Silk Spool
      case 'textile_3': // Loomed Cloth
      case 'textile_4': // Embroidered Fabric
      case 'textile_5': // Royal Tapestry
      case 'textile_6': // Starlight Vestment
      case 'textile_7': // Ceremonial Regalia
      case 'textile_8': // Crown Sovereign Mantle
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <circle cx="50" cy="50" r="42" fill={color} opacity="0.25" />
            {/* Wooden spindle or garment shape */}
            {iconType === 'textile_1' || iconType === 'textile_2' ? (
              <>
                <rect x="25" y="42" width="50" height="16" rx="4" fill={color} stroke="#701a75" strokeWidth="2" />
                <ellipse cx="25" cy="50" rx="6" ry="12" fill="#d97706" />
                <ellipse cx="75" cy="50" rx="6" ry="12" fill="#d97706" />
                <path d="M35 42 Q 50 25 65 42" stroke="#fdf4ff" strokeWidth="2.5" fill="none" />
              </>
            ) : iconType === 'textile_3' || iconType === 'textile_4' ? (
              <>
                <rect x="22" y="28" width="56" height="44" rx="4" fill={color} stroke="#4a044e" strokeWidth="2" />
                <path d="M22 40 L78 40 M22 55 L78 55" stroke="#facc15" strokeWidth="2" strokeDasharray="4 2" />
                <circle cx="50" cy="48" r="6" fill="#fef08a" />
              </>
            ) : (
              <>
                {/* Royal Mantle / Vestment */}
                <path d="M 30 25 Q 50 35 70 25 L 80 80 Q 50 72 20 80 Z" fill={color} stroke="#facc15" strokeWidth="2.5" />
                <circle cx="50" cy="36" r="8" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
                <polygon points="50,22 53,28 60,29 55,34 57,40 50,37 43,40 45,34 40,29 47,28" fill="#facc15" />
              </>
            )}
          </svg>
        );

      // ===== CRYSTALS & RUNESTONES CHAIN =====
      case 'crystal_1': // Stone Fragment
      case 'crystal_2': // Glowing Shard
      case 'crystal_3': // Inscribed Rune Stone
      case 'crystal_4': // Enchanted Geode
      case 'crystal_5': // Arcane Prism
      case 'crystal_6': // Radiant Bloomstone
      case 'crystal_7': // Ancient Heartstone
      case 'crystal_8': // Primordial Core Conduit
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <circle cx="50" cy="50" r="42" fill={color} opacity="0.3" />
            {/* Cut Crystal Prismatic Facets */}
            <polygon points="50,15 78,35 68,82 32,82 22,35" fill={color} stroke="#ffffff" strokeWidth="2" />
            <polygon points="50,15 68,82 50,75 32,82" fill="#67e8f9" opacity="0.7" />
            <polygon points="50,15 22,35 32,82" fill="#0891b2" opacity="0.8" />
            <polygon points="50,15 78,35 68,82" fill="#38bdf8" opacity="0.6" />
            {/* Runic glyph inside */}
            <circle cx="50" cy="48" r="7" fill="#ffffff" opacity="0.9" />
            <polygon points="50,38 52,46 60,48 52,50 50,58 48,50 40,48 48,46" fill="#fef08a" />
          </svg>
        );

      // ===== PROVISIONS CHAIN =====
      case 'provision_1': // Moonberry Cluster
      case 'provision_2': // Honeyed Biscuit
      case 'provision_3': // Herbal Tea
      case 'provision_4': // Hearty Stew
      case 'provision_5': // Spiced Pastry
      case 'provision_6': // Traveler's Rations
      case 'provision_7': // Bloom Nectar Feast
      case 'provision_8': // Sovereign Banquet
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <circle cx="50" cy="50" r="42" fill={color} opacity="0.25" />
            {tier <= 2 ? (
              <>
                {/* Moonberry & Biscuits */}
                <ellipse cx="50" cy="80" rx="30" ry="8" fill="#451a03" opacity="0.4" />
                <circle cx="42" cy="55" r="14" fill="#fb923c" stroke="#ea580c" strokeWidth="2" />
                <circle cx="58" cy="52" r="12" fill="#f97316" stroke="#c2410c" strokeWidth="2" />
                <circle cx="50" cy="40" r="11" fill="#fdba74" stroke="#ea580c" strokeWidth="2" />
                <circle cx="40" cy="48" r="3" fill="#ffffff" opacity="0.7" />
              </>
            ) : tier <= 4 ? (
              <>
                {/* Steaming Bowl / Teacup */}
                <ellipse cx="50" cy="82" rx="32" ry="8" fill="#451a03" opacity="0.4" />
                <path d="M 22 45 Q 50 45 78 45 L 70 78 Q 50 86 30 78 Z" fill="#b45309" stroke="#78350f" strokeWidth="2.5" />
                <ellipse cx="50" cy="45" rx="28" ry="10" fill="#f97316" stroke="#d97706" strokeWidth="2" />
                <circle cx="50" cy="45" rx="22" ry="6" fill="#fef08a" opacity="0.5" />
                {/* Rising steam curls */}
                <path d="M 40 34 Q 45 22 40 12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
                <path d="M 54 32 Q 60 20 56 10" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
              </>
            ) : (
              <>
                {/* Grand Platter & Feast */}
                <ellipse cx="50" cy="78" rx="36" ry="12" fill="#eab308" stroke="#a16207" strokeWidth="3" />
                <ellipse cx="50" cy="74" rx="30" ry="9" fill="#fef08a" />
                {/* Gilded cloche or roast / roasted treats */}
                <path d="M 26 68 Q 50 20 74 68 Z" fill={color} stroke="#ca8a04" strokeWidth="2.5" />
                <circle cx="50" cy="22" r="6" fill="#facc15" stroke="#a16207" strokeWidth="2" />
                <polygon points="50,14 53,20 60,21 55,26 57,32 50,28 43,32 45,26 40,21 47,20" fill="#fef08a" />
              </>
            )}
          </svg>
        );

      // ===== LANTERNS & BEACONS CHAIN =====
      case 'lantern_1': // Candle Stump
      case 'lantern_2': // Tin Lantern
      case 'lantern_3': // Brass Lamp
      case 'lantern_4': // Starlight Beacon
      case 'lantern_5': // Auroral Censer
      case 'lantern_6': // Luminescent Phial
      case 'lantern_7': // Celestial Lighthouse
      case 'lantern_8': // Stellar Core Lantern
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <circle cx="50" cy="50" r="44" fill={color} opacity="0.3" />
            {tier <= 2 ? (
              <>
                {/* Tin / Candle Lantern */}
                <rect x="32" y="36" width="36" height="46" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" />
                <rect x="38" y="42" width="24" height="34" rx="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
                <circle cx="50" cy="58" r="7" fill="#f97316" />
                <path d="M 38 36 Q 50 18 62 36" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : tier <= 5 ? (
              <>
                {/* Brass Starlight Beacon / Auroral Censer */}
                <path d="M 30 76 L 70 76 L 64 40 L 36 40 Z" fill="#0f766e" stroke="#14b8a6" strokeWidth="2.5" />
                {/* Glass Chamber with glow */}
                <polygon points="36,40 64,40 58,22 42,22" fill="#2dd4bf" opacity="0.85" stroke="#99f6e4" strokeWidth="1.5" />
                <circle cx="50" cy="32" r="6" fill="#ffffff" />
                <path d="M 40 22 Q 50 8 60 22" fill="none" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
                <polygon points="50,48 53,56 61,57 55,62 57,70 50,65 43,70 45,62 39,57 47,56" fill="#fde047" />
              </>
            ) : (
              <>
                {/* Celestial Lighthouse / Stellar Core */}
                <circle cx="50" cy="50" r="36" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
                <polygon points="50,12 82,50 50,88 18,50" fill="none" stroke="#facc15" strokeWidth="2" />
                <circle cx="50" cy="50" r="18" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
                <circle cx="50" cy="50" r="10" fill="#ffffff" />
                {/* Beams */}
                <line x1="50" y1="8" x2="50" y2="24" stroke="#fde047" strokeWidth="3" strokeLinecap="round" />
                <line x1="50" y1="76" x2="50" y2="92" stroke="#fde047" strokeWidth="3" strokeLinecap="round" />
                <line x1="8" y1="50" x2="24" y2="50" stroke="#fde047" strokeWidth="3" strokeLinecap="round" />
                <line x1="76" y1="50" x2="92" y2="50" stroke="#fde047" strokeWidth="3" strokeLinecap="round" />
              </>
            )}
          </svg>
        );

      // ===== GENERATORS =====
      case 'gen_garden':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
              <linearGradient id="g_pot" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="40%" stopColor="#c2410c" />
                <stop offset="100%" stopColor="#7c2d12" />
              </linearGradient>
              <linearGradient id="g_gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="g_leaf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="60%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#065f46" />
              </linearGradient>
              <radialGradient id="g_aura" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#86efac" stopOpacity="0.7" />
                <stop offset="60%" stopColor="#22c55e" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#15803d" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Ground shadow & Magical Growth Aura */}
            <ellipse cx="50" cy="88" rx="36" ry="8" fill="#0f172a" opacity="0.45" />
            <circle cx="50" cy="42" r="40" fill="url(#g_aura)" />

            {/* Dimensional Planter Urn Base */}
            <path d="M22 46 L27 82 C28 87 34 89 42 89 L58 89 C66 89 72 87 73 82 L78 46 Z" fill="url(#g_pot)" stroke="#431407" strokeWidth="2.5" />
            {/* Planter Rim Band with Gold Inlay */}
            <rect x="17" y="38" width="66" height="11" rx="4" fill="url(#g_gold)" stroke="#78350f" strokeWidth="2" />
            <line x1="20" y1="43.5" x2="80" y2="43.5" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
            {/* Carved Rune on Pot Body */}
            <polygon points="50,56 55,65 50,74 45,65" fill="#facc15" stroke="#78350f" strokeWidth="1.5" />
            <circle cx="50" cy="65" r="3" fill="#ffffff" />

            {/* Overflowing Tiered Flora */}
            <ellipse cx="50" cy="30" rx="26" ry="20" fill="url(#g_leaf)" stroke="#064e3b" strokeWidth="2" />
            <ellipse cx="32" cy="35" rx="18" ry="16" fill="#22c55e" stroke="#14532d" strokeWidth="1.5" />
            <ellipse cx="68" cy="35" rx="18" ry="16" fill="#15803d" stroke="#064e3b" strokeWidth="1.5" />

            {/* Golden Blooming Sunflowers on Top */}
            <g transform="translate(50, 22)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => (
                <ellipse key={i} cx="0" cy="-10" rx="3.5" ry="7" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" transform={`rotate(${ang})`} />
              ))}
              <circle cx="0" cy="0" r="7" fill="#92400e" stroke="#78350f" strokeWidth="1" />
              <circle cx="0" cy="0" r="4.5" fill="#facc15" />
            </g>

            {/* Sprouting Sparkles & Sunbursts */}
            <polygon points="26,18 28,23 33,23 29,26 31,31 26,28 21,31 23,26 19,23 24,23" fill="#ffffff" />
            <polygon points="74,18 76,23 81,23 77,26 79,31 74,28 69,31 71,26 67,23 72,23" fill="#fef08a" />
          </svg>
        );

      case 'gen_alchemist':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            {/* Table */}
            <rect x="15" y="55" width="70" height="12" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="2" />
            <rect x="22" y="67" width="8" height="22" fill="#451a03" />
            <rect x="70" y="67" width="8" height="22" fill="#451a03" />
            {/* Alembic & Flask on table */}
            <path d="M30 55 L38 32 C40 28 44 28 46 32 L54 55 Z" fill="#8b5cf6" stroke="#5b21b6" strokeWidth="2" />
            <circle cx="42" cy="44" r="10" fill="#a855f7" />
            {/* Small vials */}
            <rect x="62" y="40" width="8" height="15" rx="2" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
            <rect x="72" y="44" width="8" height="11" rx="2" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
            <circle cx="42" cy="18" r="4" fill="#c084fc" />
          </svg>
        );

      case 'gen_wizard':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            {/* Desk */}
            <rect x="14" y="55" width="72" height="12" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            <rect x="20" y="67" width="8" height="22" fill="#0f172a" />
            <rect x="72" y="67" width="8" height="22" fill="#0f172a" />
            {/* Floating Orb on stand */}
            <circle cx="50" cy="34" r="16" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2.5" />
            <ellipse cx="50" cy="52" rx="12" ry="4" fill="#facc15" />
            {/* Spell scroll */}
            <path d="M22 55 L34 46 L38 55 Z" fill="#fef08a" stroke="#b45309" strokeWidth="1.5" />
            <polygon points="50,24 53,30 59,30 54,34 56,40 50,36 44,40 46,34 41,30 47,30" fill="#ffffff" />
          </svg>
        );

      case 'gen_forge':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            {/* Anvil */}
            <ellipse cx="50" cy="85" rx="34" ry="7" fill="#0f172a" opacity="0.4" />
            <path d="M22 50 L78 50 L70 60 L60 60 L62 82 L38 82 L40 60 L30 60 Z" fill="#475569" stroke="#1e293b" strokeWidth="2.5" />
            <path d="M22 50 L12 44 L25 44 Z" fill="#64748b" />
            {/* Roaring fire on anvil */}
            <path d="M50 48 C38 48 35 32 45 20 C48 30 55 24 52 14 C65 24 62 48 50 48 Z" fill="#f97316" />
            <path d="M50 48 C44 48 42 38 48 30 C50 35 54 32 52 26 C58 32 56 48 50 48 Z" fill="#facc15" />
          </svg>
        );

      case 'gen_nest':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <ellipse cx="50" cy="72" rx="36" ry="16" fill="#78350f" stroke="#451a03" strokeWidth="3" />
            <ellipse cx="50" cy="68" rx="30" ry="12" fill="#92400e" />
            {/* Golden straw sticks */}
            <line x1="18" y1="65" x2="35" y2="78" stroke="#facc15" strokeWidth="2.5" />
            <line x1="82" y1="65" x2="65" y2="78" stroke="#facc15" strokeWidth="2.5" />
            {/* Glowing Egg inside nest */}
            <ellipse cx="44" cy="50" rx="12" ry="16" fill="#ec4899" stroke="#ffffff" strokeWidth="2" transform="rotate(-15, 44, 50)" />
            <ellipse cx="58" cy="52" rx="11" ry="15" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" transform="rotate(15, 58, 52)" />
          </svg>
        );

      case 'gen_tree':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            {/* Reliquary Gold Base */}
            <rect x="20" y="70" width="60" height="18" rx="4" fill="#ca8a04" stroke="#78350f" strokeWidth="2.5" />
            <rect x="25" y="65" width="50" height="8" rx="2" fill="#eab308" />
            {/* Ornate Gold Pillars */}
            <rect x="24" y="32" width="10" height="34" rx="2" fill="#facc15" stroke="#a16207" strokeWidth="1.5" />
            <rect x="66" y="32" width="10" height="34" rx="2" fill="#facc15" stroke="#a16207" strokeWidth="1.5" />
            {/* Royal Velvet Relic Chamber */}
            <path d="M 34 32 Q 50 18 66 32 L 66 65 L 34 65 Z" fill="#701a75" stroke="#a16207" strokeWidth="2" />
            {/* Gilded Crown / Sun Crest inside Chamber */}
            <polygon points="50,26 55,38 62,32 58,46 42,46 38,32 45,38" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="50" cy="52" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
            {/* Top Royal Dome & Cross Finial */}
            <path d="M 28 32 Q 50 12 72 32 Z" fill="#eab308" stroke="#a16207" strokeWidth="2" />
            <line x1="50" y1="6" x2="50" y2="16" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
            <line x1="45" y1="10" x2="55" y2="10" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );

      case 'gen_loom':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            {/* Wooden Loom Frame */}
            <rect x="18" y="25" width="64" height="60" rx="3" fill="none" stroke="#701a75" strokeWidth="4" />
            <line x1="18" y1="35" x2="82" y2="35" stroke="#d946ef" strokeWidth="3" />
            <line x1="18" y1="75" x2="82" y2="75" stroke="#d946ef" strokeWidth="3" />
            {/* Warp & Weft Threads */}
            <line x1="32" y1="35" x2="32" y2="75" stroke="#fdf4ff" strokeWidth="1.5" />
            <line x1="44" y1="35" x2="44" y2="75" stroke="#fdf4ff" strokeWidth="1.5" />
            <line x1="56" y1="35" x2="56" y2="75" stroke="#fdf4ff" strokeWidth="1.5" />
            <line x1="68" y1="35" x2="68" y2="75" stroke="#fdf4ff" strokeWidth="1.5" />
            {/* Shutter bobbin */}
            <polygon points="26,55 74,55 70,51 30,51" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            {/* Glowing magic spool on top */}
            <circle cx="50" cy="20" r="8" fill="#e879f9" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        );

      case 'gen_quarry':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            {/* Dark Stone Cave / Mine Shaft */}
            <path d="M 20 85 L 20 40 Q 50 15 80 40 L 80 85 Z" fill="#0f172a" stroke="#0e7490" strokeWidth="3" />
            <path d="M 32 85 L 32 50 Q 50 30 68 50 L 68 85 Z" fill="#164e63" />
            {/* Wooden mine support timbers */}
            <line x1="30" y1="45" x2="70" y2="45" stroke="#78350f" strokeWidth="4" />
            <line x1="32" y1="45" x2="32" y2="85" stroke="#78350f" strokeWidth="3.5" />
            <line x1="68" y1="45" x2="68" y2="85" stroke="#78350f" strokeWidth="3.5" />
            {/* Glowing Prismatic Crystals erupting from mine */}
            <polygon points="50,38 42,75 58,75" fill="#22d3ee" stroke="#ffffff" strokeWidth="1.5" />
            <polygon points="40,52 32,80 46,80" fill="#06b6d4" />
            <polygon points="60,52 54,80 68,80" fill="#67e8f9" />
          </svg>
        );

      case 'gen_hearth':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            {/* Stone oven hearth with chimney */}
            <rect x="22" y="32" width="56" height="54" rx="6" fill="#78350f" stroke="#451a03" strokeWidth="3" />
            <rect x="62" y="14" width="12" height="22" rx="2" fill="#451a03" />
            {/* Hearth arched opening */}
            <path d="M 32 86 L 32 52 Q 50 34 68 52 L 68 86 Z" fill="#1e1b4b" stroke="#451a03" strokeWidth="2" />
            {/* Roaring orange cooking fire */}
            <path d="M 50 82 C 40 82 36 68 44 54 C 47 62 52 56 50 48 C 60 56 58 82 50 82 Z" fill="#ea580c" />
            <path d="M 50 82 C 45 82 42 74 46 64 C 48 68 52 65 50 58 C 56 65 54 82 50 82 Z" fill="#facc15" />
            {/* Cast iron kettle hanging */}
            <ellipse cx="50" cy="58" rx="10" ry="7" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            {/* Steam */}
            <path d="M 48 46 Q 52 36 48 28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
          </svg>
        );

      case 'gen_lantern':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            {/* Celestial Beacon Workshop / Astronavigation Post */}
            <circle cx="50" cy="50" r="42" fill="#0c4a6e" opacity="0.3" />
            {/* Tripod Brass / Stellar Stand */}
            <line x1="30" y1="88" x2="44" y2="48" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="70" y1="88" x2="56" y2="48" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="50" y1="88" x2="50" y2="48" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" />
            {/* Floating Celestial Lantern Cage */}
            <circle cx="50" cy="36" r="18" fill="#38bdf8" stroke="#facc15" strokeWidth="2.5" />
            <circle cx="50" cy="36" r="10" fill="#fef08a" />
            <polygon points="50,22 53,30 61,31 55,36 57,44 50,39 43,44 45,36 39,31 47,30" fill="#ffffff" />
            {/* Lens rings */}
            <ellipse cx="50" cy="36" rx="24" ry="8" fill="none" stroke="#67e8f9" strokeWidth="1.5" strokeDasharray="3,3" />
          </svg>
        );

      // ===== ENERGY =====
      case 'energy_1':
      case 'energy_2':
      case 'energy_3':
      case 'energy_4':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <circle cx="50" cy="50" r="40" fill="#06b6d4" opacity="0.35" />
            <circle cx="50" cy="50" r="28" fill="#22d3ee" stroke="#0891b2" strokeWidth="2.5" />
            <polygon points="52,18 34,52 48,52 46,78 66,44 52,44" fill="#ffffff" stroke="#facc15" strokeWidth="1.5" />
          </svg>
        );

      // ===== GEMS =====
      case 'gem_1':
      case 'gem_2':
      case 'gem_3':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <circle cx="50" cy="50" r="42" fill="#a855f7" opacity="0.3" />
            <polygon points="30,32 70,32 85,52 50,85 15,52" fill="#c084fc" stroke="#7e22ce" strokeWidth="2.5" />
            <polygon points="30,32 50,52 70,32" fill="#e9d5ff" />
            <polygon points="15,52 50,52 50,85" fill="#9333ea" />
            <polygon points="85,52 50,52 50,85" fill="#7e22ce" />
            <polygon points="30,32 15,52 50,52" fill="#a855f7" />
            <polygon points="70,32 85,52 50,52" fill="#c084fc" />
          </svg>
        );

      // ===== CHESTS =====
      case 'chest_wooden':
      case 'chest_silver':
      case 'chest_golden':
      case 'chest_royal': {
        const isSilver = iconType === 'chest_silver';
        const isGold = iconType === 'chest_golden';
        const isRoyal = iconType === 'chest_royal';
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
              <linearGradient id={`ch_lid_${iconType}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isRoyal ? '#a855f7' : isGold ? '#f59e0b' : isSilver ? '#94a3b8' : '#b45309'} />
                <stop offset="50%" stopColor={isRoyal ? '#6b21a8' : isGold ? '#b45309' : isSilver ? '#475569' : '#78350f'} />
                <stop offset="100%" stopColor={isRoyal ? '#3b0764' : isGold ? '#78350f' : isSilver ? '#1e293b' : '#451a03'} />
              </linearGradient>
              <linearGradient id={`ch_base_${iconType}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isRoyal ? '#7e22ce' : isGold ? '#d97706' : isSilver ? '#64748b' : '#92400e'} />
                <stop offset="100%" stopColor={isRoyal ? '#2e1065' : isGold ? '#451a03' : isSilver ? '#0f172a' : '#3d1302'} />
              </linearGradient>
              <linearGradient id={`ch_metal_${iconType}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={isSilver ? '#f1f5f9' : '#fef08a'} />
                <stop offset="35%" stopColor={isSilver ? '#cbd5e1' : '#facc15'} />
                <stop offset="70%" stopColor={isSilver ? '#64748b' : '#ca8a04'} />
                <stop offset="100%" stopColor={isSilver ? '#334155' : '#78350f'} />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="88" rx="35" ry="7.5" fill="#0f172a" opacity="0.45" />
            {/* Chest Base */}
            <rect x="18" y="46" width="64" height="38" rx="5" fill={`url(#ch_base_${iconType})`} stroke="#1e293b" strokeWidth="2.5" />
            {/* Vertical Wood Planks Lines */}
            <line x1="38" y1="47" x2="38" y2="83" stroke="#1e293b" strokeWidth="1" opacity="0.6" />
            <line x1="62" y1="47" x2="62" y2="83" stroke="#1e293b" strokeWidth="1" opacity="0.6" />
            {/* Arched Lid */}
            <path d="M16 46 C16 24 84 24 84 46 Z" fill={`url(#ch_lid_${iconType})`} stroke="#1e293b" strokeWidth="2.5" />
            {/* Metal Reinforcing Straps */}
            <rect x="28" y="28" width="9" height="56" rx="2" fill={`url(#ch_metal_${iconType})`} stroke="#1e293b" strokeWidth="1.5" />
            <rect x="63" y="28" width="9" height="56" rx="2" fill={`url(#ch_metal_${iconType})`} stroke="#1e293b" strokeWidth="1.5" />
            {/* Rivets on Straps */}
            <circle cx="32.5" cy="33" r="1.6" fill={isSilver ? '#ffffff' : '#fef08a'} stroke="#475569" strokeWidth="0.8" />
            <circle cx="32.5" cy="48" r="1.6" fill={isSilver ? '#ffffff' : '#fef08a'} stroke="#475569" strokeWidth="0.8" />
            <circle cx="32.5" cy="78" r="1.6" fill={isSilver ? '#ffffff' : '#fef08a'} stroke="#475569" strokeWidth="0.8" />
            <circle cx="67.5" cy="33" r="1.6" fill={isSilver ? '#ffffff' : '#fef08a'} stroke="#475569" strokeWidth="0.8" />
            <circle cx="67.5" cy="48" r="1.6" fill={isSilver ? '#ffffff' : '#fef08a'} stroke="#475569" strokeWidth="0.8" />
            <circle cx="67.5" cy="78" r="1.6" fill={isSilver ? '#ffffff' : '#fef08a'} stroke="#475569" strokeWidth="0.8" />
            {/* Central Ornate Lock Clasp & Keyhole */}
            <rect x="43" y="42" width="14" height="17" rx="3" fill={`url(#ch_metal_${iconType})`} stroke="#1e293b" strokeWidth="1.5" />
            <circle cx="50" cy="48" r="2.8" fill="#0f172a" />
            <polygon points="50,49 48,55 52,55" fill="#0f172a" />
            {/* Treasure light seam */}
            <line x1="18" y1="46" x2="82" y2="46" stroke={isRoyal ? '#f0abfc' : isGold ? '#fef08a' : '#e2e8f0'} strokeWidth="1.5" opacity="0.85" />
            {/* Sparkles */}
            <polygon points="22,24 24,29 29,29 25,32 27,37 22,34 17,37 19,32 15,29 20,29" fill={isSilver ? '#ffffff' : '#fef08a'} />
          </svg>
        );
      }

      default:
        return (
          <div className="w-full h-full flex items-center justify-center font-bold text-lg text-amber-300">
            ✦
          </div>
        );
    }
  };

  return (
    <div
      style={{ width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }}
      className={`relative select-none flex items-center justify-center ${className}`}
    >
      {renderGraphic()}

      {/* Generator lightning badge or level badge */}
      {isGenerator && (
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-full border border-yellow-200 shadow flex items-center gap-0.5 z-10">
          <span>⚡</span>
          <span>{tier}</span>
        </div>
      )}

      {/* Item Tier Badge */}
      {!isGenerator && showTierBadge && maxTier > 1 && (
        <div
          className="absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-md text-white border flex items-center justify-center leading-tight tracking-tight z-10"
          style={{
            background: tier >= 7 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : tier >= 5 ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : tier >= 3 ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #64748b, #475569)',
            borderColor: tier >= 7 ? '#fde68a' : tier >= 5 ? '#e9d5ff' : tier >= 3 ? '#bfdbfe' : '#cbd5e1',
          }}
        >
          T{tier}
        </div>
      )}
    </div>
  );
};
