import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('public/assets/items/sweetbloom');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const ICONS = {
  herb_1: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="h1_bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#4ade80" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#15803d" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="h1_soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#78350f" />
          <stop offset="100%" stop-color="#2e1002" />
        </linearGradient>
        <linearGradient id="h1_leafL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#d9f99d" />
          <stop offset="45%" stop-color="#84cc16" />
          <stop offset="100%" stop-color="#3f6212" />
        </linearGradient>
        <linearGradient id="h1_leafR" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#bbf7d0" />
          <stop offset="45%" stop-color="#22c55e" />
          <stop offset="100%" stop-color="#14532d" />
        </linearGradient>
        <radialGradient id="h1_dew" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="50%" stop-color="#bae6fd" />
          <stop offset="100%" stop-color="#0284c7" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#h1_bgGlow)"/>
      <!-- Fertile Enchanted Soil Mound -->
      <ellipse cx="50" cy="84" rx="30" ry="9" fill="url(#h1_soil)" stroke="#1a0b02" stroke-width="2" />
      <ellipse cx="50" cy="82" rx="24" ry="5.5" fill="#92400e" opacity="0.6" />
      <!-- Fresh Little Stones / Magic Compost -->
      <circle cx="32" cy="84" r="2.5" fill="#b45309"/>
      <circle cx="68" cy="85" r="2" fill="#78350f"/>
      <circle cx="61" cy="82" r="1.8" fill="#d97706"/>
      <!-- Curved sturdy sprout stem -->
      <path d="M50 83 C50 66 46 50 45 42 C49 44 54 44 55 42 C54 52 53 69 50 83 Z" fill="#65a30d" stroke="#365314" stroke-width="1.5" />
      <!-- Left Leaf (Sunlit Lime) -->
      <path d="M47 48 C24 37 14 17 32 10 C48 14 47 34 47 48 Z" fill="url(#h1_leafL)" stroke="#365314" stroke-width="2" />
      <path d="M47 48 C36 34 31 20 32 10" stroke="#f7fee7" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.9" />
      <!-- Right Leaf (Emerald Heart) -->
      <path d="M51 45 C74 33 84 14 67 9 C51 13 51 32 51 45 Z" fill="url(#h1_leafR)" stroke="#14532d" stroke-width="2" />
      <path d="M51 45 C61 31 66 18 67 9" stroke="#dcfce7" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.9" />
      <!-- Dewdrop with glistening sun highlight -->
      <circle cx="32" cy="18" r="4.8" fill="url(#h1_dew)" />
      <circle cx="30.5" cy="16.5" r="1.8" fill="#ffffff" />
      <!-- Golden spore sparkle -->
      <polygon points="69,11 71,15 75,15 72,17 73,21 69.5,18.5 66,21 67,17 64,15 68,15" fill="#fde047" opacity="0.95" />
      <circle cx="20" cy="38" r="1.8" fill="#fef08a" opacity="0.8"/>
      <circle cx="80" cy="40" r="1.5" fill="#86efac" opacity="0.85"/>
    </svg>
  `,

  herb_2: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="h2_bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#86efac" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#16a34a" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="h2_stalk1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#4ade80" />
          <stop offset="100%" stop-color="#15803d" />
        </linearGradient>
        <linearGradient id="h2_stalk2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#bef264" />
          <stop offset="100%" stop-color="#4d7c0f" />
        </linearGradient>
        <linearGradient id="h2_stalk3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#34d399" />
          <stop offset="100%" stop-color="#047857" />
        </linearGradient>
        <linearGradient id="h2_twine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fde047" />
          <stop offset="50%" stop-color="#d97706" />
          <stop offset="100%" stop-color="#78350f" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#h2_bgGlow)"/>
      <ellipse cx="50" cy="87" rx="30" ry="7" fill="#0f172a" opacity="0.3" />
      <!-- Left Herb Stem & Leaves -->
      <path d="M36 78 C16 42 24 16 42 10 C49 26 44 58 38 78 Z" fill="url(#h2_stalk1)" stroke="#14532d" stroke-width="2" />
      <path d="M38 78 C27 44 31 22 42 10" stroke="#dcfce7" stroke-width="2" fill="none" opacity="0.9" />
      <!-- Right Herb Stem & Leaves -->
      <path d="M64 78 C84 42 76 16 58 10 C51 26 56 58 62 78 Z" fill="url(#h2_stalk3)" stroke="#064e3b" stroke-width="2" />
      <path d="M62 78 C73 44 69 22 58 10" stroke="#ccfbf1" stroke-width="2" fill="none" opacity="0.9" />
      <!-- Center Dominant Herb Stem -->
      <path d="M50 80 C36 42 45 12 56 8 C67 22 61 56 52 80 Z" fill="url(#h2_stalk2)" stroke="#365314" stroke-width="2" />
      <path d="M51 80 C43 42 49 18 56 8" stroke="#f7fee7" stroke-width="2.2" fill="none" opacity="0.95" />
      <!-- Golden Twine / Raffia Wrap with knot -->
      <rect x="31" y="56" width="38" height="11" rx="5" fill="url(#h2_twine)" stroke="#78350f" stroke-width="2" />
      <path d="M36 56 C43 61 57 61 64 56" stroke="#fef08a" stroke-width="2" fill="none" />
      <circle cx="50" cy="61.5" r="5" fill="#f59e0b" stroke="#78350f" stroke-width="1.8" />
      <circle cx="50" cy="61.5" r="2.5" fill="#fef08a" />
      <!-- Hanging twine tails -->
      <path d="M46 66 C40 75 35 81 33 85 M54 66 C60 75 65 81 67 85" stroke="#d97706" stroke-width="3.5" stroke-linecap="round" />
      <!-- Shimmering Pollen particles -->
      <circle cx="58" cy="16" r="3.2" fill="#fef08a" />
      <circle cx="34" cy="22" r="2.5" fill="#ffffff" />
      <circle cx="72" cy="30" r="2" fill="#86efac" />
    </svg>
  `,

  herb_3: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="h3_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#34d399" stop-opacity="0.8" />
          <stop offset="60%" stop-color="#10b981" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#059669" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="h3_petalA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#a7f3d0" />
          <stop offset="50%" stop-color="#34d399" />
          <stop offset="100%" stop-color="#047857" />
        </linearGradient>
        <linearGradient id="h3_petalB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#6ee7b7" />
          <stop offset="50%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#064e3b" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#h3_glow)" />
      <!-- Central stem -->
      <path d="M50 88 Q50 50 48 22 Q52 50 50 88" fill="#064e3b" stroke="#022c22" stroke-width="2"/>
      <!-- Multi-tier crystalline botanical foliage -->
      <path d="M48 48 C12 36 10 10 36 6 C54 16 51 36 48 48 Z" fill="url(#h3_petalA)" stroke="#065f46" stroke-width="2" />
      <path d="M52 44 C88 32 90 6 64 2 C46 12 49 32 52 44 Z" fill="url(#h3_petalB)" stroke="#065f46" stroke-width="2" />
      <path d="M50 64 C86 58 88 34 72 26 C58 38 52 54 50 64 Z" fill="url(#h3_petalA)" stroke="#064e3b" stroke-width="2" />
      <path d="M50 66 C14 60 12 36 28 28 C42 40 48 56 50 66 Z" fill="url(#h3_petalB)" stroke="#064e3b" stroke-width="2" />
      <!-- Center glowing vitality blossom node -->
      <circle cx="50" cy="38" r="8.5" fill="#fef08a" stroke="#d97706" stroke-width="2" />
      <circle cx="50" cy="38" r="5" fill="#ffffff" />
      <!-- Mana sparkles -->
      <polygon points="50,8 53,16 61,18 53,20 50,28 47,20 39,18 47,16" fill="#ffffff" />
      <polygon points="78,26 79,31 84,32 79,33 78,38 77,33 72,32 77,31" fill="#a7f3d0" />
      <polygon points="22,28 23,33 28,34 23,35 22,40 21,35 16,34 21,33" fill="#fef08a" />
    </svg>
  `,

  herb_4: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="h4_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.8" />
          <stop offset="70%" stop-color="#0f766e" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#134e4a" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="h4_budL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#99f6e4" />
          <stop offset="50%" stop-color="#2dd4bf" />
          <stop offset="100%" stop-color="#0f766e" />
        </linearGradient>
        <linearGradient id="h4_budR" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#5eead4" />
          <stop offset="50%" stop-color="#14b8a6" />
          <stop offset="100%" stop-color="#115e59" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#h4_glow)"/>
      <ellipse cx="50" cy="86" rx="24" ry="6" fill="#042f2e" opacity="0.4"/>
      <!-- Sturdy Stem -->
      <path d="M50 86 C50 64 48 50 48 44 C52 50 52 64 50 86 Z" fill="#0d9488" stroke="#042f2e" stroke-width="2"/>
      <!-- Supporting Sepals -->
      <path d="M48 52 C30 58 18 42 28 32 C38 42 46 48 48 52 Z" fill="#14b8a6" stroke="#042f2e" stroke-width="1.8"/>
      <path d="M52 52 C70 58 82 42 72 32 C62 42 54 48 52 52 Z" fill="#0f766e" stroke="#042f2e" stroke-width="1.8"/>
      <!-- Tightly Coiled Bud Petals -->
      <path d="M50 64 C30 50 24 24 44 10 C58 20 54 48 50 64 Z" fill="url(#h4_budL)" stroke="#042f2e" stroke-width="2"/>
      <path d="M50 64 C70 50 76 24 56 10 C42 20 46 48 50 64 Z" fill="url(#h4_budR)" stroke="#042f2e" stroke-width="2"/>
      <!-- Central Bud Spiral Tip -->
      <path d="M50 48 C44 32 46 16 50 8 C54 16 56 32 50 48 Z" fill="#ccfbf1" stroke="#0f766e" stroke-width="1.8"/>
      <!-- Essence Dew beads -->
      <circle cx="50" cy="12" r="3.5" fill="#ffffff"/>
      <circle cx="36" cy="26" r="2.2" fill="#ffffff" opacity="0.9"/>
      <circle cx="64" cy="26" r="2.2" fill="#ffffff" opacity="0.9"/>
      <!-- Twinkling aura -->
      <circle cx="20" cy="20" r="2" fill="#99f6e4"/>
      <circle cx="80" cy="22" r="2.5" fill="#a7f3d0"/>
    </svg>
  `,

  herb_5: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="h5_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8" />
          <stop offset="60%" stop-color="#0284c7" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#0369a1" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="h5_petalA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#bae6fd" />
          <stop offset="60%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#0284c7" />
        </linearGradient>
        <linearGradient id="h5_petalB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7dd3fc" />
          <stop offset="60%" stop-color="#0ea5e9" />
          <stop offset="100%" stop-color="#0369a1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#h5_glow)"/>
      <g transform="translate(50,50)">
        <!-- 8 Radiant Starbloom Petals -->
        <g transform="rotate(0)">
          <path d="M0 0 C-11 -18 0 -44 0 -44 C0 -44 11 -18 0 0 Z" fill="url(#h5_petalA)" stroke="#0369a1" stroke-width="1.8"/>
        </g>
        <g transform="rotate(45)">
          <path d="M0 0 C-11 -18 0 -44 0 -44 C0 -44 11 -18 0 0 Z" fill="url(#h5_petalB)" stroke="#0369a1" stroke-width="1.8"/>
        </g>
        <g transform="rotate(90)">
          <path d="M0 0 C-11 -18 0 -44 0 -44 C0 -44 11 -18 0 0 Z" fill="url(#h5_petalA)" stroke="#0369a1" stroke-width="1.8"/>
        </g>
        <g transform="rotate(135)">
          <path d="M0 0 C-11 -18 0 -44 0 -44 C0 -44 11 -18 0 0 Z" fill="url(#h5_petalB)" stroke="#0369a1" stroke-width="1.8"/>
        </g>
        <g transform="rotate(180)">
          <path d="M0 0 C-11 -18 0 -44 0 -44 C0 -44 11 -18 0 0 Z" fill="url(#h5_petalA)" stroke="#0369a1" stroke-width="1.8"/>
        </g>
        <g transform="rotate(225)">
          <path d="M0 0 C-11 -18 0 -44 0 -44 C0 -44 11 -18 0 0 Z" fill="url(#h5_petalB)" stroke="#0369a1" stroke-width="1.8"/>
        </g>
        <g transform="rotate(270)">
          <path d="M0 0 C-11 -18 0 -44 0 -44 C0 -44 11 -18 0 0 Z" fill="url(#h5_petalA)" stroke="#0369a1" stroke-width="1.8"/>
        </g>
        <g transform="rotate(315)">
          <path d="M0 0 C-11 -18 0 -44 0 -44 C0 -44 11 -18 0 0 Z" fill="url(#h5_petalB)" stroke="#0369a1" stroke-width="1.8"/>
        </g>
        <!-- Inner Sunlit Core -->
        <circle cx="0" cy="0" r="16" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
        <circle cx="0" cy="0" r="10" fill="#fef08a"/>
        <circle cx="0" cy="0" r="5" fill="#ffffff"/>
      </g>
    </svg>
  `,

  herb_6: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="h6_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#c084fc" stop-opacity="0.85" />
          <stop offset="60%" stop-color="#9333ea" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#581c87" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="h6_petalA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e9d5ff" />
          <stop offset="50%" stop-color="#a855f7" />
          <stop offset="100%" stop-color="#6b21a8" />
        </linearGradient>
        <linearGradient id="h6_petalB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#d8b4fe" />
          <stop offset="50%" stop-color="#7e22ce" />
          <stop offset="100%" stop-color="#3b0764" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#h6_glow)"/>
      <g transform="translate(50,50)">
        <!-- 6 Arching Arcane Petals -->
        <g transform="rotate(0)">
          <path d="M0 0 C-18 -18 -14 -44 0 -46 C14 -44 18 -18 0 0 Z" fill="url(#h6_petalA)" stroke="#3b0764" stroke-width="2"/>
        </g>
        <g transform="rotate(60)">
          <path d="M0 0 C-18 -18 -14 -44 0 -46 C14 -44 18 -18 0 0 Z" fill="url(#h6_petalB)" stroke="#3b0764" stroke-width="2"/>
        </g>
        <g transform="rotate(120)">
          <path d="M0 0 C-18 -18 -14 -44 0 -46 C14 -44 18 -18 0 0 Z" fill="url(#h6_petalA)" stroke="#3b0764" stroke-width="2"/>
        </g>
        <g transform="rotate(180)">
          <path d="M0 0 C-18 -18 -14 -44 0 -46 C14 -44 18 -18 0 0 Z" fill="url(#h6_petalB)" stroke="#3b0764" stroke-width="2"/>
        </g>
        <g transform="rotate(240)">
          <path d="M0 0 C-18 -18 -14 -44 0 -46 C14 -44 18 -18 0 0 Z" fill="url(#h6_petalA)" stroke="#3b0764" stroke-width="2"/>
        </g>
        <g transform="rotate(300)">
          <path d="M0 0 C-18 -18 -14 -44 0 -46 C14 -44 18 -18 0 0 Z" fill="url(#h6_petalB)" stroke="#3b0764" stroke-width="2"/>
        </g>
        <!-- Arcane Heart Core -->
        <circle cx="0" cy="0" r="18" fill="#f43f5e" stroke="#881337" stroke-width="2"/>
        <polygon points="0,-12 3.5,-3.5 12,0 3.5,3.5 0,12 -3.5,3.5 -12,0 -3.5,-3.5" fill="#ffffff" />
      </g>
    </svg>
  `,

  herb_7: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="h7_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f472b6" stop-opacity="0.85" />
          <stop offset="60%" stop-color="#db2777" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#831843" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="h7_petalA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fbcfe8" />
          <stop offset="50%" stop-color="#ec4899" />
          <stop offset="100%" stop-color="#9d174d" />
        </linearGradient>
        <linearGradient id="h7_petalB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f472b6" />
          <stop offset="50%" stop-color="#be185d" />
          <stop offset="100%" stop-color="#500724" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#h7_glow)"/>
      <g transform="translate(50,50)">
        <!-- 12 Crown Petals in Lush Bouquet Formation -->
        ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
          (angle, i) => `
            <g transform="rotate(${angle})">
              <path d="M0 0 C-9 -22 0 -46 0 -46 C0 -46 9 -22 0 0 Z" fill="${i % 2 === 0 ? 'url(#h7_petalA)' : 'url(#h7_petalB)'}" stroke="#831843" stroke-width="1.8"/>
            </g>
          `
        ).join('')}
        <circle cx="0" cy="0" r="19" fill="#fef08a" stroke="#d97706" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="12" fill="#fbbf24"/>
        <circle cx="0" cy="0" r="6" fill="#ffffff"/>
      </g>
    </svg>
  `,

  herb_8: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="h8_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9" />
          <stop offset="60%" stop-color="#d97706" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#78350f" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="h8_gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="40%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#b45309" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#h8_glow)"/>
      <g transform="translate(50,52)">
        <!-- Royal Botanical Crown Base -->
        <path d="M-38 12 L-28 -28 L-9 -8 L0 -38 L9 -8 L28 -28 L38 12 Z" fill="url(#h8_gold)" stroke="#78350f" stroke-width="2.5" />
        <!-- Floating Gemstone Petals -->
        <circle cx="0" cy="-38" r="6" fill="#fef08a" stroke="#78350f" stroke-width="1.5"/>
        <circle cx="-28" cy="-28" r="5" fill="#38bdf8" stroke="#0369a1" stroke-width="1.5"/>
        <circle cx="28" cy="-28" r="5" fill="#38bdf8" stroke="#0369a1" stroke-width="1.5"/>
        <circle cx="0" cy="-6" r="7.5" fill="#f43f5e" stroke="#881337" stroke-width="1.8"/>
        <!-- Golden Base Sash with floral filigree -->
        <path d="M-32 22 C0 38 0 38 32 22 C20 12 -20 12 -32 22 Z" fill="#d97706" stroke="#78350f" stroke-width="2"/>
        <circle cx="0" cy="24" r="4" fill="#fef08a"/>
      </g>
    </svg>
  `,

  herb_9: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="h9_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fb7185" stop-opacity="0.9" />
          <stop offset="50%" stop-color="#e11d48" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#881337" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="h9_petal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffe4e6" />
          <stop offset="40%" stop-color="#f43f5e" />
          <stop offset="100%" stop-color="#9f1239" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#h9_glow)"/>
      <g transform="translate(50,50)">
        <!-- Orbiting Mana Orbs -->
        <ellipse cx="0" cy="0" rx="44" ry="18" fill="none" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="3 4" transform="rotate(-25)"/>
        <circle cx="-38" cy="15" r="5.5" fill="#fb7185" stroke="#ffffff" stroke-width="1.5"/>
        <circle cx="38" cy="-15" r="5.5" fill="#facc15" stroke="#ffffff" stroke-width="1.5"/>
        <!-- Star Radiance Petals -->
        ${[0, 45, 90, 135, 180, 225, 270, 315].map(
          (angle) => `
            <g transform="rotate(${angle})">
              <path d="M0 0 C-12 -20 0 -44 0 -44 C0 -44 12 -20 0 0 Z" fill="url(#h9_petal)" stroke="#881337" stroke-width="2"/>
            </g>
          `
        ).join('')}
        <circle cx="0" cy="0" r="16" fill="#fbbf24" stroke="#78350f" stroke-width="2"/>
        <circle cx="0" cy="0" r="9" fill="#ffffff"/>
      </g>
    </svg>
  `,

  herb_10: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="h10_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fef08a" stop-opacity="0.95" />
          <stop offset="45%" stop-color="#f59e0b" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#b45309" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="h10_solar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="30%" stop-color="#fde047" />
          <stop offset="70%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#b45309" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#h10_glow)"/>
      <!-- Grand Ascendant Lotus Halo -->
      <g transform="translate(50,50)">
        <!-- Outer Divine Rays -->
        ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
          (angle) => `
            <g transform="rotate(${angle})">
              <polygon points="0,-48 3,-36 -3,-36" fill="#fde047" />
            </g>
          `
        ).join('')}
        <!-- Multi-Layer Eternal Petals -->
        ${[0, 45, 90, 135, 180, 225, 270, 315].map(
          (angle) => `
            <g transform="rotate(${angle})">
              <path d="M0 0 C-14 -18 0 -45 0 -45 C0 -45 14 -18 0 0 Z" fill="url(#h10_solar)" stroke="#78350f" stroke-width="2"/>
            </g>
          `
        ).join('')}
        ${[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map(
          (angle) => `
            <g transform="rotate(${angle})">
              <path d="M0 0 C-10 -15 0 -36 0 -36 C0 -36 10 -15 0 0 Z" fill="#ffffff" stroke="#d97706" stroke-width="1.8" opacity="0.9"/>
            </g>
          `
        ).join('')}
        <!-- Divine Heart Diamond Core -->
        <circle cx="0" cy="0" r="15" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
        <polygon points="0,-10 8,0 0,10 -8,0" fill="#ffffff"/>
      </g>
    </svg>
  `,
};

console.log('Generating Sweetbloom PNG assets...');
for (const [key, svg] of Object.entries(ICONS)) {
  const resvg = new Resvg(svg.trim(), {
    fitTo: { mode: 'width', value: 512 },
  });
  const pngBuffer = resvg.render().asPng();
  const filePath = path.join(OUT_DIR, `${key}.png`);
  fs.writeFileSync(filePath, pngBuffer);
  console.log(`Generated ${filePath} (${pngBuffer.length} bytes)`);
}
console.log('All 10 Sweetbloom PNG assets generated successfully!');
