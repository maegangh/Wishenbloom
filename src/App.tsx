import React, { useState, useEffect } from 'react';
import { useGameState } from './game/state/useGameState';
import { TopHud } from './game/components/TopHud';
import { OrderBar } from './game/components/OrderBar';
import { BoardGrid } from './game/components/BoardGrid';
import { InventoryBar } from './game/components/InventoryBar';
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
    devAddCoins,
    devAddGems,
    devRefillEnergy,
    devAddXP,
    devSpawnItem,
    devClearBoard,
    devResetSave,
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
      <div className="relative w-full h-full max-w-md bg-slate-900 flex flex-col justify-between overflow-hidden shadow-2xl border-x border-slate-800">
        
        {/* Top HUD (Level, XP, Coins, Gems, Energy, Controls) */}
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
        <main className="flex-1 w-full overflow-hidden flex flex-col relative">
          {activeTab === 'board' && (
            <div className="w-full h-full flex flex-col justify-between py-1 overflow-hidden">
              {/* Active Orders Horizontal Bar */}
              <OrderBar
                orders={[
                  ...(state.specialOrder ? [state.specialOrder] : []),
                  ...state.activeOrders,
                ]}
                grid={state.grid}
                onFulfillOrder={fulfillOrder}
              />

              {/* 7x9 Interactive Merge Board Grid */}
              <div className="flex-1 flex items-center justify-center min-h-0 py-1">
                <BoardGrid
                  grid={state.grid}
                  selectedCell={selectedCell}
                  onSelectCell={setSelectedCell}
                  onTapGenerator={tapGenerator}
                  onMoveOrMerge={moveOrMergeItem}
                  onPopBubble={popBubble}
                  onUseConsumable={useConsumable}
                />
              </div>

              {/* Bottom 5-Slot Storage Tray */}
              <InventoryBar
                inventory={state.inventory}
                maxSlots={state.maxInventorySlots}
                onSelectSlot={(idx) => setSelectedCell({ row: -1, col: -1, fromInventory: true, inventoryIndex: idx })}
                onRetrieveItem={retrieveFromInventory}
              />
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

        {/* Selected Item Detail Drawer */}
        {selectedCell && (
          <ItemDetailDrawer
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
        )}

        {/* Persistent Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          hasUnclaimedQuests={hasUnclaimedQuests}
          hasUnclaimedDiscoveries={hasUnclaimedDiscoveries}
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
            onNext={() => advanceTutorial()}
            onDismiss={dismissTutorial}
          />
        )}
      </div>
    </div>
  );
}
