import React, { useState, useEffect } from 'react';
import { useGameState } from './game/state/useGameState';
import { TopHud } from './game/components/TopHud';
import { OrderBar } from './game/components/OrderBar';
import { FeatureShortcuts } from './game/components/FeatureShortcuts';
import { BoardGrid } from './game/components/BoardGrid';
import { InventoryBar } from './game/components/InventoryBar';
import { SelectedItemPanel } from './game/components/SelectedItemPanel';
import { ItemDetailDrawer } from './game/components/ItemDetailDrawer';
import { KingdomView } from './game/components/KingdomView';
import { CollectionBook } from './game/components/CollectionBook';
import { QuestModal } from './game/components/QuestModal';
import { BottomNav, MainTab } from './game/components/BottomNav';
import { LevelUpModal } from './game/components/LevelUpModal';
import { DiscoveryModal } from './game/components/DiscoveryModal';
import { SettingsModal } from './game/components/SettingsModal';
import { DevPanel } from './game/components/DevPanel';
import { EnergyShopModal } from './game/components/EnergyShopModal';
import { ShopModal } from './game/components/ShopModal';
import { TutorialOverlay } from './game/components/TutorialOverlay';
import { DailyRewardModal } from './game/components/DailyRewardModal';
import { OfflineEnergyModal } from './game/components/OfflineEnergyModal';
import { isDailyRewardClaimable } from './game/data/dailyRewards';
import { registerAppLifecycle } from './game/logic/appLifecycle';

export default function App() {
  const {
    state,
    selectedCell,
    setSelectedCell,
    levelUpData,
    setLevelUpData,
    discoveryPopupItem,
    setDiscoveryPopupItem,
    offlineEnergyRecovered,
    setOfflineEnergyRecovered,
    tapGenerator,
    upgradeGenerator,
    moveOrMergeItem,
    sellItem,
    useConsumable,
    popBubble,
    storeInInventory,
    retrieveFromInventory,
    fulfillOrder,
    restoreKingdomStage,
    claimQuest,
    claimDiscoveryReward,
    claimCompendiumMilestone,
    claimDailyReward,
    claimDailyTask,
    claimDailyCompletionReward,
    purchaseEnergyWithGems,
    purchaseCoinsWithGems,
    processStorePurchase,
    restorePurchases,
    claimPendingReward,
    advanceTutorial,
    dismissTutorial,
    updateSettings,
    saveNow,
    handleAppResume,
    devAddCoins,
    devAddGems,
    devRefillEnergy,
    devAddXP,
    devSpawnItem,
    devClearBoard,
    devResetSave,
    devResetTutorial,
    devSimulateNextDay,
    devResetDailyClaim,
    devCompleteAllDailyTasks,
    devSetDailyRewardDay,
    devResetPurchases,
    devAddPendingReward,
  } = useGameState();

  const [activeTab, setActiveTab] = useState<MainTab>('board');
  const [showSettings, setShowSettings] = useState(false);
  const [showDev, setShowDev] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showEnergyShop, setShowEnergyShop] = useState(false);
  const [showDailyRewards, setShowDailyRewards] = useState(false);

  // App Lifecycle & Android Back Button registration
  useEffect(() => {
    const unregister = registerAppLifecycle({
      onBackground: () => {
        saveNow();
      },
      onResume: () => {
        handleAppResume();
      },
      onBackButton: () => {
        if (showShop) {
          setShowShop(false);
          return true;
        }
        if (showDailyRewards) {
          setShowDailyRewards(false);
          return true;
        }
        if (showSettings) {
          setShowSettings(false);
          return true;
        }
        if (showDev) {
          setShowDev(false);
          return true;
        }
        if (showEnergyShop) {
          setShowEnergyShop(false);
          return true;
        }
        if (discoveryPopupItem) {
          setDiscoveryPopupItem(null);
          return true;
        }
        if (levelUpData) {
          setLevelUpData(null);
          return true;
        }
        if (offlineEnergyRecovered > 0) {
          setOfflineEnergyRecovered(0);
          return true;
        }
        if (selectedCell) {
          setSelectedCell(null);
          return true;
        }
        if (activeTab !== 'board') {
          setActiveTab('board');
          return true;
        }
        return false;
      },
    });

    return () => unregister();
  }, [
    showShop,
    showDailyRewards,
    showSettings,
    showDev,
    showEnergyShop,
    discoveryPopupItem,
    levelUpData,
    offlineEnergyRecovered,
    selectedCell,
    activeTab,
    saveNow,
    handleAppResume,
    setSelectedCell,
    setDiscoveryPopupItem,
    setLevelUpData,
    setOfflineEnergyRecovered,
  ]);

  const hasUnclaimedDailyReward = isDailyRewardClaimable(state.lastDailyRewardClaimDate);

  // Check badges for unclaimed rewards
  const hasUnclaimedDailyTasks = (state.dailyTasks || []).some((t) => t.isCompleted && !t.isClaimed);
  const hasUnclaimedDailyCompletion =
    (state.dailyTasks || []).length > 0 &&
    (state.dailyTasks || []).every((t) => t.isCompleted) &&
    !state.dailyCompletionClaimed;

  const hasUnclaimedQuests =
    state.activeQuests.some((q) => q.isCompleted && !q.isClaimed) ||
    hasUnclaimedDailyTasks ||
    hasUnclaimedDailyCompletion;

  const hasUnclaimedDiscoveries = state.discoveredItemIds.some(
    (id) => !state.claimedDiscoveryRewardIds.includes(id)
  );

  return (
    <div className="flex justify-center items-center w-screen h-screen bg-slate-950 overflow-hidden font-sans text-slate-100">
      {/* Mobile Frame Container (Portrait 390px - 440px responsive) */}
      <div className="relative w-full h-full max-w-md bg-gradient-to-b from-[#1a2e40] via-[#0f2334] to-[#0c1926] flex flex-col justify-between overflow-hidden shadow-2xl border-x border-slate-800">
        
        {/* Fantasy Garden Background Layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
          {/* Top Sunbeam Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl" />
          {/* Ambient Magical Pollen Particles */}
          <div className="absolute top-1/4 left-8 w-2 h-2 bg-yellow-300 rounded-full blur-[1px] animate-[gentleFloat_4s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 right-12 w-2.5 h-2.5 bg-emerald-300 rounded-full blur-[1px] animate-[gentleFloat_5s_ease-in-out_infinite_1s]" />
          <div className="absolute top-2/3 left-16 w-1.5 h-1.5 bg-amber-200 rounded-full blur-[1px] animate-[gentleFloat_6s_ease-in-out_infinite_2s]" />
          <div className="absolute top-3/4 right-8 w-2 h-2 bg-cyan-300 rounded-full blur-[1px] animate-[gentleFloat_4.5s_ease-in-out_infinite_1.5s]" />
        </div>

        {/* Top HUD (Heroine Portrait, Level Badge, Resource Capsules, Controls) */}
        <TopHud
          state={state}
          onOpenSettings={() => setShowSettings(true)}
          onOpenDev={() => setShowDev(true)}
          onOpenShop={() => setShowShop(true)}
          onOpenEnergyShop={() => setShowShop(true)}
          onOpenDailyRewards={() => setShowDailyRewards(true)}
          hasUnclaimedDailyReward={hasUnclaimedDailyReward}
        />

        {/* Main Content Area Based on Active Tab */}
        <main className="flex-1 w-full overflow-hidden flex flex-col relative z-10">
          {activeTab === 'board' && (
            <div className="w-full h-full flex flex-col justify-between py-1 overflow-hidden">
              {/* Active NPC Orders (Side-by-side 2-Card Layout) */}
              <OrderBar
                orders={[
                  ...(state.specialOrder ? [state.specialOrder] : []),
                  ...state.activeOrders,
                ]}
                grid={state.grid}
                onFulfillOrder={fulfillOrder}
                isTutorialActive={state.isTutorialActive}
                tutorialStep={state.tutorialStep}
              />

              {/* 5 Feature Shortcut Buttons (Gifts, Tasks, Tome, Realm, Boost) */}
              <FeatureShortcuts
                onOpenDailyRewards={() => setShowDailyRewards(true)}
                onOpenQuests={() => setActiveTab('quests')}
                onOpenCompendium={() => setActiveTab('compendium')}
                onOpenKingdom={() => setActiveTab('kingdom')}
                onOpenShop={() => setShowShop(true)}
                hasUnclaimedDailyReward={hasUnclaimedDailyReward}
                hasUnclaimedQuests={hasUnclaimedQuests}
                hasUnclaimedDiscoveries={hasUnclaimedDiscoveries}
              />

              {/* 7x9 Interactive Merge Board Grid */}
              <div className="flex-1 flex items-center justify-center min-h-0 py-0.5">
                <BoardGrid
                  grid={state.grid}
                  selectedCell={selectedCell}
                  onSelectCell={setSelectedCell}
                  onTapGenerator={tapGenerator}
                  onMoveOrMerge={moveOrMergeItem}
                  onPopBubble={popBubble}
                  onUseConsumable={useConsumable}
                  isTutorialActive={state.isTutorialActive}
                  tutorialStep={state.tutorialStep}
                />
              </div>

              {/* Selected Item Panel (Warm Parchment Card) OR Bottom Storage Tray */}
              {selectedCell ? (
                <SelectedItemPanel
                  selectedCell={selectedCell}
                  grid={state.grid}
                  inventory={state.inventory}
                  playerCoins={state.coins}
                  onClose={() => setSelectedCell(null)}
                  onSellItem={sellItem}
                  onUseConsumable={useConsumable}
                  onStoreInInventory={storeInInventory}
                  onPopBubble={popBubble}
                  onUpgradeGenerator={upgradeGenerator}
                />
              ) : (
                <InventoryBar
                  inventory={state.inventory}
                  maxSlots={state.maxInventorySlots}
                  onSelectSlot={(idx) => setSelectedCell({ row: -1, col: -1, fromInventory: true, inventoryIndex: idx })}
                  onRetrieveItem={retrieveFromInventory}
                />
              )}
            </div>
          )}

          {activeTab === 'kingdom' && (
            <KingdomView
              areas={state.kingdomAreas}
              playerCoins={state.coins}
              playerLevel={state.level}
              onRestoreStage={restoreKingdomStage}
            />
          )}

          {activeTab === 'compendium' && (
            <CollectionBook
              discoveredItemIds={state.discoveredItemIds}
              claimedDiscoveryRewardIds={state.claimedDiscoveryRewardIds}
              claimedCompendiumMilestoneIds={state.claimedCompendiumMilestoneIds}
              onClaimReward={claimDiscoveryReward}
              onClaimMilestone={claimCompendiumMilestone}
            />
          )}

          {activeTab === 'quests' && (
            <QuestModal
              quests={state.activeQuests}
              dailyTasks={state.dailyTasks || []}
              dailyCompletionClaimed={state.dailyCompletionClaimed || false}
              onClaimQuest={claimQuest}
              onClaimDailyTask={claimDailyTask}
              onClaimDailyCompletionReward={claimDailyCompletionReward}
            />
          )}
        </main>

        {/* Persistent Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          hasUnclaimedQuests={hasUnclaimedQuests}
          hasUnclaimedDiscoveries={hasUnclaimedDiscoveries}
          isTutorialActive={state.isTutorialActive}
          tutorialStep={state.tutorialStep}
        />

        {/* Modals & Overlays */}
        {showDailyRewards && (
          <DailyRewardModal
            currentCycleDay={state.dailyRewardCycleDay || 1}
            lastClaimDate={state.lastDailyRewardClaimDate}
            onClaim={claimDailyReward}
            onClose={() => setShowDailyRewards(false)}
          />
        )}

        {offlineEnergyRecovered > 0 && (
          <OfflineEnergyModal
            recoveredEnergy={offlineEnergyRecovered}
            currentEnergy={state.energy}
            maxEnergy={state.maxEnergy}
            onClose={() => setOfflineEnergyRecovered(0)}
          />
        )}

        {levelUpData && (
          <LevelUpModal
            level={levelUpData.level}
            progression={levelUpData.progression}
            rewards={levelUpData.rewards}
            onClose={() => setLevelUpData(null)}
          />
        )}

        {discoveryPopupItem && (
          <DiscoveryModal
            item={discoveryPopupItem}
            onClose={() => setDiscoveryPopupItem(null)}
          />
        )}

        {showSettings && (
          <SettingsModal
            settings={state.settings}
            onUpdateSettings={updateSettings}
            onResetGame={devResetSave}
            onClose={() => setShowSettings(false)}
          />
        )}

        {showDev && (
          <DevPanel
            gameState={state}
            onAddCoins={devAddCoins}
            onAddGems={devAddGems}
            onRefillEnergy={devRefillEnergy}
            onAddXP={devAddXP}
            onSpawnItem={devSpawnItem}
            onClearBoard={devClearBoard}
            onResetSave={devResetSave}
            onResetTutorial={devResetTutorial}
            onSimulateNextDay={devSimulateNextDay}
            onResetDailyClaim={devResetDailyClaim}
            onCompleteAllDailyTasks={devCompleteAllDailyTasks}
            onSetDailyRewardDay={devSetDailyRewardDay}
            onResetPurchases={devResetPurchases}
            onAddPendingReward={devAddPendingReward}
            onClose={() => setShowDev(false)}
          />
        )}

        {showShop && (
          <ShopModal
            isOpen={showShop}
            state={state}
            onClose={() => setShowShop(false)}
            onPurchaseEnergyWithGems={purchaseEnergyWithGems}
            onPurchaseCoinsWithGems={purchaseCoinsWithGems}
            onProcessStorePurchase={processStorePurchase}
            onRestorePurchases={restorePurchases}
            onClaimPendingReward={claimPendingReward}
          />
        )}

        {showEnergyShop && (
          <EnergyShopModal
            currentEnergy={state.energy}
            maxEnergy={state.maxEnergy}
            gems={state.gems}
            onBuyEnergy={(amt, cost) => {
              devAddGems(-cost);
              devRefillEnergy();
            }}
            onClose={() => setShowEnergyShop(false)}
          />
        )}

        {state.isTutorialActive && (
          <TutorialOverlay
            currentStep={state.tutorialStep}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            onNext={() => advanceTutorial()}
            onDismiss={dismissTutorial}
          />
        )}
      </div>
    </div>
  );
}

