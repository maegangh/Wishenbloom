import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  StoreProduct,
  GameState,
  PendingReward,
} from '../types';
import {
  STARTER_WELCOME_PACK,
  GEM_PACK_PRODUCTS,
  ENERGY_SHOP_PRODUCTS,
  COIN_SHOP_PRODUCTS,
} from '../data/storeProducts';
import { ITEMS } from '../data/items';
import { X, Sparkles, Zap, Coins, Gem, ShoppingBag, ShieldCheck, RefreshCw, Gift, AlertCircle, Check } from 'lucide-react';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
  onPurchaseEnergyWithGems: (productId: string) => boolean;
  onPurchaseCoinsWithGems: (productId: string) => boolean;
  onProcessStorePurchase: (productIdOrSku: string) => Promise<{ success: boolean; error?: string }>;
  onRestorePurchases: () => Promise<{ restoredSkus: string[]; message: string }>;
  onClaimPendingReward: (pendingRewardId: string) => boolean;
}

type ShopTab = 'featured' | 'gems' | 'energy' | 'coins' | 'pending';

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  state,
  onPurchaseEnergyWithGems,
  onPurchaseCoinsWithGems,
  onProcessStorePurchase,
  onRestorePurchases,
  onClaimPendingReward,
}) => {
  const [activeTab, setActiveTab] = useState<ShopTab>('featured');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const isWelcomePackOwned = state.purchasedOneTimeProductIds.includes(STARTER_WELCOME_PACK.sku);
  const pendingCount = state.pendingRewards.length;

  const showToast = (text: string, isError = false) => {
    setFeedbackMessage({ text, isError });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const handleMockPurchase = async (product: StoreProduct) => {
    if (isProcessing) return;
    setIsProcessing(product.id);
    setFeedbackMessage(null);

    try {
      const res = await onProcessStorePurchase(product.sku);
      if (res.success) {
        showToast(`Acquired ${product.displayName}!`);
      } else {
        showToast(res.error || 'Could not complete transaction.', true);
      }
    } catch (e) {
      showToast('An unexpected error occurred during purchase simulation.', true);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleGemSpendEnergy = (product: StoreProduct) => {
    if (!product.gemCost) return;
    if (state.gems < product.gemCost) {
      showToast(`Not enough gems! Need ${product.gemCost} 💎`, true);
      return;
    }
    const success = onPurchaseEnergyWithGems(product.id);
    if (success) {
      showToast(`Refilled ${product.energyGrant} Energy! ⚡`);
    }
  };

  const handleGemSpendCoins = (product: StoreProduct) => {
    if (!product.gemCost) return;
    if (state.gems < product.gemCost) {
      showToast(`Not enough gems! Need ${product.gemCost} 💎`, true);
      return;
    }
    const success = onPurchaseCoinsWithGems(product.id);
    if (success) {
      showToast(`Acquired ${product.coinGrant} Coins! 🪙`);
    }
  };

  const handleRestore = async () => {
    setIsProcessing('restore');
    try {
      const res = await onRestorePurchases();
      showToast(res.message);
    } catch (e) {
      showToast('Restore failed.', true);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleClaimPending = (pendingId: string) => {
    const success = onClaimPendingReward(pendingId);
    if (success) {
      showToast('Claimed item to your board/inventory!');
    } else {
      showToast('Board and inventory are full! Free up a space first.', true);
    }
  };

  return (
    <div id="shop-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        id="shop-modal-content"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="relative w-full max-w-2xl bg-amber-950/95 border-2 border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div id="shop-modal-header" className="p-4 bg-gradient-to-r from-amber-900/80 via-yellow-950/80 to-amber-900/80 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shadow-inner">
              🛍️
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-100 tracking-wide flex items-center gap-2">
                Realm Market
                <span className="text-[11px] font-medium bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Mock IAP Active
                </span>
              </h2>
              <p className="text-xs text-amber-300/80">Support your kingdom restoration & energy refills</p>
            </div>
          </div>

          <button
            id="close-shop-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition border border-stone-600/50"
            aria-label="Close Shop"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency Status Bar */}
        <div id="shop-currency-bar" className="px-4 py-2 bg-stone-900/90 border-b border-amber-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <Gem className="w-4 h-4 text-emerald-400" />
              <span>{state.gems.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-yellow-400">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>{state.coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-sky-400">
              <Zap className="w-4 h-4 text-sky-400" />
              <span>{state.energy} / {state.maxEnergy}</span>
            </div>
          </div>

          <button
            id="restore-purchases-btn"
            onClick={handleRestore}
            disabled={isProcessing !== null}
            className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-100 underline decoration-amber-500/50 underline-offset-2 transition"
          >
            <RefreshCw className={`w-3 h-3 ${isProcessing === 'restore' ? 'animate-spin' : ''}`} />
            Restore
          </button>
        </div>

        {/* Feedback Message Banner */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`px-4 py-2 text-xs flex items-center gap-2 border-b ${
                feedbackMessage.isError
                  ? 'bg-rose-950/90 text-rose-200 border-rose-800/50'
                  : 'bg-emerald-950/90 text-emerald-200 border-emerald-800/50'
              }`}
            >
              {feedbackMessage.isError ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <Check className="w-4 h-4 text-emerald-400" />}
              <span>{feedbackMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs Bar */}
        <div id="shop-tabs" className="flex border-b border-amber-500/20 bg-stone-950/50 px-2 pt-2 gap-1 overflow-x-auto scrollbar-none">
          <button
            id="tab-featured"
            onClick={() => setActiveTab('featured')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition whitespace-nowrap ${
              activeTab === 'featured'
                ? 'bg-amber-900/60 text-amber-100 border-t-2 border-amber-400 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Featured
          </button>

          <button
            id="tab-gems"
            onClick={() => setActiveTab('gems')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition whitespace-nowrap ${
              activeTab === 'gems'
                ? 'bg-amber-900/60 text-amber-100 border-t-2 border-amber-400 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Gem className="w-3.5 h-3.5 text-emerald-400" />
            Gems
          </button>

          <button
            id="tab-energy"
            onClick={() => setActiveTab('energy')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition whitespace-nowrap ${
              activeTab === 'energy'
                ? 'bg-amber-900/60 text-amber-100 border-t-2 border-amber-400 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            Energy Refills
          </button>

          <button
            id="tab-coins"
            onClick={() => setActiveTab('coins')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition whitespace-nowrap ${
              activeTab === 'coins'
                ? 'bg-amber-900/60 text-amber-100 border-t-2 border-amber-400 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            Coins
          </button>

          {pendingCount > 0 && (
            <button
              id="tab-pending"
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'bg-amber-900/60 text-amber-100 border-t-2 border-amber-400 shadow'
                  : 'text-amber-300 hover:text-amber-100'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
              Pending Rewards ({pendingCount})
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div id="shop-tab-body" className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB: FEATURED */}
          {activeTab === 'featured' && (
            <div className="space-y-4">
              {/* Starter Pack Hero Card */}
              <div
                id="starter-pack-card"
                className={`relative rounded-xl p-4 border ${
                  isWelcomePackOwned
                    ? 'bg-stone-900/60 border-stone-700/50 opacity-75'
                    : 'bg-gradient-to-br from-amber-900/50 via-stone-900/70 to-yellow-950/60 border-amber-400/50 shadow-lg'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center text-3xl shadow-inner">
                      🌸
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 uppercase tracking-wider">
                          {isWelcomePackOwned ? 'Owned' : 'One-Time Special'}
                        </span>
                        <span className="text-xs text-amber-300 font-semibold">Starter Bundle</span>
                      </div>
                      <h3 className="text-base font-bold text-amber-100 mt-0.5">
                        {STARTER_WELCOME_PACK.displayName}
                      </h3>
                      <p className="text-xs text-stone-300 mt-1 max-w-md">
                        {STARTER_WELCOME_PACK.description}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex sm:flex-col items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-amber-500/20">
                    <div className="text-right">
                      <span className="text-xs text-stone-400 line-through mr-1.5">$9.99</span>
                      <span className="text-base font-extrabold text-amber-200">{STARTER_WELCOME_PACK.previewPrice}</span>
                    </div>

                    <button
                      id="buy-starter-pack-btn"
                      onClick={() => handleMockPurchase(STARTER_WELCOME_PACK)}
                      disabled={isWelcomePackOwned || isProcessing !== null}
                      className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl shadow transition ${
                        isWelcomePackOwned
                          ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 border border-amber-300'
                      }`}
                    >
                      {isWelcomePackOwned ? 'Claimed' : isProcessing === STARTER_WELCOME_PACK.id ? 'Processing...' : `Get Pack (${STARTER_WELCOME_PACK.previewPrice})`}
                    </button>
                  </div>
                </div>

                {/* Items breakdown pills */}
                <div className="mt-3 pt-3 border-t border-amber-500/20 flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-md bg-stone-800/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    💎 300 Gems
                  </span>
                  <span className="px-2 py-1 rounded-md bg-stone-800/80 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                    🪙 1,500 Coins
                  </span>
                  <span className="px-2 py-1 rounded-md bg-stone-800/80 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                    ⚡ 100 Energy
                  </span>
                  <span className="px-2 py-1 rounded-md bg-stone-800/80 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    👑 1 Royal Chest
                  </span>
                </div>
              </div>

              {/* Featured Offers Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Popular Essentials</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Featured Gem Pack */}
                  {GEM_PACK_PRODUCTS.filter((p) => p.isFeatured).map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-stone-900/80 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-2xl">{prod.icon}</span>
                          {prod.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              {prod.badge}
                            </span>
                          )}
                        </div>
                        <h5 className="font-bold text-stone-100 text-sm mt-1">{prod.displayName}</h5>
                        <p className="text-xs text-emerald-400 font-semibold mt-0.5">+{prod.gemGrant} Gems</p>
                      </div>
                      <button
                        onClick={() => handleMockPurchase(prod)}
                        disabled={isProcessing !== null}
                        className="mt-3 w-full py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
                      >
                        {prod.previewPrice}
                      </button>
                    </div>
                  ))}

                  {/* Featured Energy Refill */}
                  {ENERGY_SHOP_PRODUCTS.filter((p) => p.isFeatured).map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-stone-900/80 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-2xl">{prod.icon}</span>
                          {prod.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                              {prod.badge}
                            </span>
                          )}
                        </div>
                        <h5 className="font-bold text-stone-100 text-sm mt-1">{prod.displayName}</h5>
                        <p className="text-xs text-sky-400 font-semibold mt-0.5">+{prod.energyGrant} Energy</p>
                      </div>
                      <button
                        onClick={() => handleGemSpendEnergy(prod)}
                        className="mt-3 w-full py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow transition flex items-center justify-center gap-1"
                      >
                        <span>{prod.gemCost}</span>
                        <Gem className="w-3 h-3 text-emerald-300" />
                      </button>
                    </div>
                  ))}

                  {/* Featured Coin Vault */}
                  {COIN_SHOP_PRODUCTS.filter((p) => p.badge === 'Best Value').map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-stone-900/80 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-2xl">{prod.icon}</span>
                          {prod.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                              {prod.badge}
                            </span>
                          )}
                        </div>
                        <h5 className="font-bold text-stone-100 text-sm mt-1">{prod.displayName}</h5>
                        <p className="text-xs text-yellow-400 font-semibold mt-0.5">+{prod.coinGrant} Coins</p>
                      </div>
                      <button
                        onClick={() => handleGemSpendCoins(prod)}
                        className="mt-3 w-full py-1.5 text-xs font-bold rounded-lg bg-yellow-600 hover:bg-yellow-500 text-stone-950 shadow transition flex items-center justify-center gap-1 font-extrabold"
                      >
                        <span>{prod.gemCost}</span>
                        <Gem className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: GEMS */}
          {activeTab === 'gems' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-300">
                Arcane Gems allow you to purchase high-tier items, pop bubbles, and refill energy instantly.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GEM_PACK_PRODUCTS.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-stone-900/80 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-2xl">{prod.icon}</span>
                        {prod.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {prod.badge}
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-stone-100 text-xs sm:text-sm mt-1">{prod.displayName}</h5>
                      <p className="text-xs text-emerald-400 font-bold mt-0.5">+{prod.gemGrant?.toLocaleString()} Gems</p>
                    </div>
                    <button
                      onClick={() => handleMockPurchase(prod)}
                      disabled={isProcessing !== null}
                      className="mt-3 w-full py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
                    >
                      {prod.previewPrice}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ENERGY */}
          {activeTab === 'energy' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-300">
                Spend Arcane Gems to top up your Bloom Energy instantly. Energy can overflow up to 200.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ENERGY_SHOP_PRODUCTS.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-stone-900/80 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-2xl">{prod.icon}</span>
                        {prod.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            {prod.badge}
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-stone-100 text-sm mt-1">{prod.displayName}</h5>
                      <p className="text-xs text-sky-400 font-bold mt-0.5">+{prod.energyGrant} Energy</p>
                      <p className="text-[11px] text-stone-400 mt-1">{prod.description}</p>
                    </div>
                    <button
                      onClick={() => handleGemSpendEnergy(prod)}
                      className="mt-3 w-full py-2 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow transition flex items-center justify-center gap-1.5"
                    >
                      <span>{prod.gemCost}</span>
                      <Gem className="w-3.5 h-3.5 text-emerald-300" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: COINS */}
          {activeTab === 'coins' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-300">
                Spend Arcane Gems to acquire Realm Coins for kingdom restoration and generator upgrades.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {COIN_SHOP_PRODUCTS.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-stone-900/80 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-2xl">{prod.icon}</span>
                        {prod.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                            {prod.badge}
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-stone-100 text-sm mt-1">{prod.displayName}</h5>
                      <p className="text-xs text-yellow-400 font-bold mt-0.5">+{prod.coinGrant?.toLocaleString()} Coins</p>
                      <p className="text-[11px] text-stone-400 mt-1">{prod.description}</p>
                    </div>
                    <button
                      onClick={() => handleGemSpendCoins(prod)}
                      className="mt-3 w-full py-2 text-xs font-bold rounded-lg bg-yellow-600 hover:bg-yellow-500 text-stone-950 font-extrabold shadow transition flex items-center justify-center gap-1.5"
                    >
                      <span>{prod.gemCost}</span>
                      <Gem className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PENDING REWARDS */}
          {activeTab === 'pending' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-950/60 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2">
                <Gift className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Rewards Safe Deposit</p>
                  <p className="text-amber-300/80 text-[11px] mt-0.5">
                    Purchased items that could not fit onto a full board or inventory are safely preserved here.
                  </p>
                </div>
              </div>

              {state.pendingRewards.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-6">No pending rewards in your deposit vault.</p>
              ) : (
                <div className="space-y-2">
                  {state.pendingRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="p-3 bg-stone-900/90 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl">
                          🎁
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-stone-100">{reward.title}</h5>
                          <p className="text-[10px] text-stone-400">Source: {reward.source}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleClaimPending(reward.id)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 shadow transition"
                      >
                        Claim to Board
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer & Mock Safety Notice */}
        <div id="shop-modal-footer" className="p-3 bg-stone-950/90 border-t border-amber-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Development Mock Layer Active &bull; No real currency is charged</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
