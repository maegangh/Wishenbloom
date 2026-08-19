export type ItemChainId = 
  | 'herbs'
  | 'potions'
  | 'spellbooks'
  | 'treasures'
  | 'blacksmith'
  | 'creatures'
  | 'textiles'
  | 'crystals'
  | 'provisions'
  | 'lanterns'
  | 'energy'
  | 'gems'
  | 'chests';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface ItemDef {
  id: string;
  chainId: ItemChainId;
  name: string;
  tier: number;
  maxTier: number;
  rarity: ItemRarity;
  description: string;
  sellValue: number;
  xpValue: number;
  mergeResultId?: string;
  isConsumable?: boolean;
  consumableType?: 'energy' | 'coins' | 'gems' | 'chest';
  consumableValue?: number;
  chestTier?: 'wooden' | 'silver' | 'golden' | 'royal';
  iconType: string;
  color: string;
  glowColor: string;
}

export interface GeneratorDrop {
  itemId: string;
  weight: number;
}

export interface GeneratorDef {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  energyCost: number;
  cooldownMs: number;
  description: string;
  drops: GeneratorDrop[];
  iconType: string;
  color: string;
  glowColor: string;
  upgradeCost?: number;
  upgradeResultId?: string;
}

export type TileState = 'normal' | 'locked' | 'dusty' | 'bubble';

export interface BoardItem {
  instanceId: string;
  itemId: string;
  isGenerator?: boolean;
  generatorId?: string;
  tileState?: TileState;
  bubbleExpiresAt?: number; // timestamp
  bubblePrice?: number;
  dustyMergeCount?: number;
  lastTappedAt?: number;
  cooldownUntil?: number; // timestamp when generator cooldown finishes
}

export interface BoardTile {
  row: number;
  col: number;
  item: BoardItem | null;
  isUnlocked: boolean;
}

export interface NPCOrder {
  id: string;
  npcId: string;
  npcName: string;
  npcRole: string;
  npcAvatar: string;
  npcQuote: string;
  requirements: {
    itemId: string;
    count: number;
  }[];
  rewards: {
    coins: number;
    xp: number;
    gems?: number;
    energy?: number;
    chestId?: string;
  };
  isStoryOrder?: boolean;
  isSpecialOrder?: boolean;
}

export interface NPCDef {
  id: string;
  name: string;
  role: string;
  title: string;
  avatar: string;
  bio: string;
  color: string;
}

export interface KingdomStage {
  stageNumber: number;
  name: string;
  description: string;
  costCoins: number;
  rewardXp: number;
  storySnippet: string;
}

export interface KingdomArea {
  id: string;
  name: string;
  category: string;
  description: string;
  currentStage: number; // 0 = ruined, max = fully restored
  maxStages: number;
  stages: KingdomStage[];
  icon: string;
  unlockedAtLevel: number;
  themeColor: string;
  bgGradient: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'merge' | 'tap_generator' | 'fulfill_order' | 'spend_energy' | 'restore_kingdom' | 'discover_item';
  target: number;
  current: number;
  rewards: {
    coins: number;
    xp: number;
    gems?: number;
    energy?: number;
  };
  isCompleted: boolean;
  isClaimed: boolean;
  isDaily?: boolean;
}

export interface PlayerSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  highContrast: boolean;
}

export interface GameStats {
  totalMerges: number;
  totalOrdersCompleted: number;
  totalCoinsEarned: number;
  totalGemsEarned: number;
  totalGeneratorsTapped: number;
  kingdomAreasCompleted: number;
}

export interface CompendiumMilestone {
  id: string;
  title: string;
  description: string;
  category: 'discoveries' | 'chains' | 'mastery';
  target: number;
  rewardCoins: number;
  rewardGems: number;
  rewardEnergy?: number;
  rewardChestId?: string;
  badgeTitle: string;
}

export interface DailyRewardDayDef {
  day: number;
  title: string;
  description: string;
  rewards: {
    coins?: number;
    gems?: number;
    energy?: number;
    chestItemId?: string;
  };
  icon: string;
}

export interface DailyTaskState {
  id: string;
  templateId: string;
  title: string;
  description: string;
  type: 'merge' | 'tap_generator' | 'spend_energy' | 'fulfill_order' | 'fulfill_special_order' | 'pop_bubble' | 'upgrade_generator';
  target: number;
  current: number;
  rewards: {
    coins: number;
    xp?: number;
    gems?: number;
    energy?: number;
  };
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface GameState {
  // Currencies & Progression
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  gems: number;
  energy: number;
  maxEnergy: number;
  lastEnergyRechargeAt: number;

  // Board (7 cols x 9 rows)
  grid: (BoardItem | null)[][];
  inventory: (BoardItem | null)[];
  maxInventorySlots: number;

  // Active Orders & Quests
  activeOrders: NPCOrder[];
  specialOrder?: NPCOrder | null;
  activeQuests: Quest[];
  
  // Daily Retention Systems
  dailyRewardCycleDay: number; // 1-7
  lastDailyRewardClaimDate: string | null; // e.g. "2026-08-18" (UTC)
  dailyTasksDateKey: string; // e.g. "2026-08-18" (UTC)
  dailyTasks: DailyTaskState[];
  dailyCompletionClaimed: boolean;

  // Kingdom Restoration
  kingdomAreas: KingdomArea[];

  // Discovery Book & Milestones
  discoveredItemIds: string[];
  claimedDiscoveryRewardIds: string[];
  claimedLevelRewardIds?: number[];
  claimedCompendiumMilestoneIds?: string[];

  // Tutorial
  tutorialStep: number;
  isTutorialActive: boolean;

  // Settings & Stats
  settings: PlayerSettings;
  stats: GameStats;

  // Timestamps & Versioning
  lastSavedAt: number;
  lastSeenAt?: number;
  schemaVersion?: number;
}
