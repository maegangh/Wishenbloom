# Wishenbloom — Native In-App Billing Integration Plan (Future Architecture)

**Publisher**: Mythic Crown Studios LLC  
**Application ID / Bundle ID**: `com.mythiccrownstudios.wishenbloom`  
**Status**: ⏳ PLANNED ARCHITECTURE (NOT IMPLEMENTED YET — CURRENT BUILDS USE MOCK BILLING IN DEV ONLY)

---

## 1. Executive Summary & Design Principles

This document defines the technical integration boundary and architecture for transitioning Wishenbloom from its safe development mock purchase layer to native store billing on **Google Play** (Android) and **Apple App Store** (iOS).

### Core Principles
1. **Free-to-Play Friendly**: Purchases provide convenience and cosmetic delight without paywalls or forced timers.
2. **Deterministic Entitlements**: In-game currency and item grants are keyed to verified transaction IDs and product identifiers. Entitlements NEVER depend on formatted display price strings (e.g. `"$0.99"`).
3. **Idempotent Transaction Handling**: `processedTransactionIds` strictly prevents replay attacks and accidental duplicate fulfillment.
4. **Safe Restoration**: Restoring purchases on an existing account confirms ownership of the non-consumable **Bloomkeeper's Welcome Pack** (`wishenbloom_starter_bloomkeeper`) WITHOUT duplicate delivery of the included one-time currencies (Gems, Coins, Energy) or chests.

---

## 2. Shared Store Provider Contract

Wishenbloom defines a decoupled TypeScript interface `PurchaseProvider` in `src/game/logic/purchaseProvider.ts`:

```typescript
export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  productId?: string;
  sku?: string;
  error?: string;
  isMockTransaction: boolean;
}

export interface PurchaseProvider {
  initialize(): Promise<boolean>;
  getProducts(): Promise<StoreProduct[]>;
  purchase(productIdOrSku: string): Promise<PurchaseResult>;
  restorePurchases(ownedOneTimeSkus: string[]): Promise<string[]>;
  isMock(): boolean;
}
```

### Environment Security Rules
| Environment | Platform | Active Provider | Mock Purchases Allowed? |
| :--- | :--- | :--- | :--- |
| **Web Development** | Web (AI Studio / Vite) | `MockPurchaseProvider` | ✅ Yes (Testing Only) |
| **Native Development** | Android / iOS (Dev Build) | `MockPurchaseProvider` | ✅ Yes (Testing Only) |
| **Beta Testing** | Android / iOS / Web | `GooglePlay` / `AppleStore` / `Disabled` | ❌ **STRICTLY BLOCKED** |
| **Production Release** | Android / iOS / Web | `GooglePlay` / `AppleStore` / `Disabled` | ❌ **STRICTLY BLOCKED** |

---

## 3. Product Types & Catalog Definition

### A. Non-Consumable / One-Time Entitlement
| Product Name | SKU | Grant on Initial Purchase | Restore Behavior |
| :--- | :--- | :--- | :--- |
| **Bloomkeeper's Welcome Pack** | `wishenbloom_starter_bloomkeeper` | 300 Arcane Gems<br>1,500 Realm Coins<br>100 Bloom Energy<br>1 Royal Chest (`chest_royal_3`) | Re-activates entitlement status in `purchasedOneTimeProductIds`. **Does not re-grant currency or items.** |

### B. Consumable Currency Packs (Arcane Gems)
| Product Name | SKU | Grant | Restore Behavior |
| :--- | :--- | :--- | :--- |
| **Gem Pouch** | `wishenbloom_gems_80` | +80 Arcane Gems | Non-restorable (standard mobile policy) |
| **Gem Satchel** | `wishenbloom_gems_450` | +450 Arcane Gems | Non-restorable |
| **Gem Chest** | `wishenbloom_gems_1000` | +1,000 Arcane Gems | Non-restorable |
| **Gem Vault** | `wishenbloom_gems_2200` | +2,200 Arcane Gems | Non-restorable |
| **Royal Gem Vault** | `wishenbloom_gems_6000` | +6,000 Arcane Gems | Non-restorable |
| **Crown Treasury** | `wishenbloom_gems_13000` | +13,000 Arcane Gems | Non-restorable |

---

## 4. Android — Google Play Billing Integration Plan

### Target Library
- **Google Play Billing Library v6+ / v7+** (via a hardened Capacitor Plugin such as `@capgo/native-purchases` or official native plugin wrapper).

### Workflow Steps
1. **Initialization (`BillingClient.startConnection`)**: Connect to Google Play on app launch and query SKU details (`queryProductDetailsAsync`).
2. **Product Catalog Loading**: Fetch localized prices, currency codes, and offer tokens from Google Play.
3. **Purchase Initiation (`launchBillingFlow`)**: Present Google Play payment bottom sheet.
4. **Purchase Processing (`PurchasesUpdatedListener`)**:
   - Verify purchase state is `PURCHASED`.
   - Record `purchaseToken` / `orderId`.
   - **For Consumables (Gem packs)**: Call `consumeAsync(ConsumeParams)`. Upon successful consumption callback, grant Arcane Gems to player state.
   - **For Non-Consumables (Welcome Pack)**: Call `acknowledgePurchase(AcknowledgePurchaseParams)`. Upon acknowledgment callback, grant bundle contents and add SKU to `purchasedOneTimeProductIds`.
5. **Purchase Restoration (`queryPurchasesAsync`)**:
   - Query existing active purchases.
   - If `wishenbloom_starter_bloomkeeper` is returned, add to `purchasedOneTimeProductIds` without re-granting bundle items.

---

## 5. iOS — Apple StoreKit 2 Integration Plan

### Target Framework
- **StoreKit 2** (Swift native interface via Capacitor Plugin bridge).

### Workflow Steps
1. **Product Loading (`Product.products(for: skus)`)**: Load StoreKit product metadata and localized price formatters.
2. **Purchase Initiation (`product.purchase()`)**: Present Apple Pay / Face ID purchase modal.
3. **Verification & Entitlement Granting (`Transaction.updates`)**:
   - Verify transaction signature against Apple root certificate (`VerificationResult.verified`).
   - Extract `transaction.id` and `transaction.productID`.
   - Apply grant to game state if `transaction.id` is not in `processedTransactionIds`.
   - Finish transaction: `await transaction.finish()`.
4. **Purchase Restoration (`AppStore.sync()` & `Transaction.currentEntitlements`)**:
   - Iterate active non-consumable entitlements.
   - Re-assert `wishenbloom_starter_bloomkeeper` in `purchasedOneTimeProductIds`.

---

## 6. Server-Authoritative Token Validation (Future Expansion)

When backend services are introduced in future chapters:
- Google Play `purchaseToken` and Apple JWS receipt tokens will be forwarded to a secure server endpoint (`/api/iap/verify`).
- Server validates with Google Play Developer API and Apple App Store Server API before sending an authenticated credit payload to the client.

---

## 7. Current Implementation Status

- [x] Decoupled `PurchaseProvider` interface defined.
- [x] `MockPurchaseProvider` isolated to `development` builds only.
- [x] `GooglePlayPurchaseProvider` and `AppleStorePurchaseProvider` stubs return safe `NOT_CONFIGURED` error in beta/production.
- [x] Transaction idempotency (`processedTransactionIds`) fully implemented and tested.
- [x] Pending reward deposit vault preserves items when board/inventory are full.
- [ ] Native Billing Client library installation (Deferred to Production Release Pass).
- [ ] Server receipt validation (Deferred).
