# Wishenbloom — Store Product Configuration Guide

**Publisher**: Mythic Crown Studios LLC  
**Application ID / Bundle ID**: `com.mythiccrownstudios.wishenbloom`  

Use the authoritative product catalog below when manually configuring in-app purchases in **Google Play Console** and **Apple App Store Connect**.

---

## 1. Product Catalog

### A. Non-Consumable / One-Time Entitlements
| Product Name | SKU / Product ID | Recommended Price (USD) | Type | Grants |
| :--- | :--- | :--- | :--- | :--- |
| **Bloomkeeper's Welcome Pack** | `wishenbloom_starter_bloomkeeper` | $2.99 | Non-Consumable (One-Time) | 300 Arcane Gems<br>1,500 Realm Coins<br>100 Bloom Energy<br>1 Royal Chest (`chest_royal_3`) |

> **Store Configuration Notes**:
> - **Google Play Console**: Create as **In-App Product** (One-time purchase / Not consumable).
> - **App Store Connect**: Create as **Non-Consumable In-App Purchase**.
> - **Restoration**: This item is restorable via the "Restore Purchases" button in the Realm Market.

---

### B. Consumable Currency Packs (Arcane Gems)
| Product Name | SKU / Product ID | Recommended Price (USD) | Type | Grants |
| :--- | :--- | :--- | :--- | :--- |
| **Gem Pouch** | `wishenbloom_gems_80` | $0.99 | Consumable | 80 Arcane Gems |
| **Gem Satchel** | `wishenbloom_gems_450` | $4.99 | Consumable | 450 Arcane Gems |
| **Gem Chest** | `wishenbloom_gems_1000` | $9.99 | Consumable | 1,000 Arcane Gems |
| **Gem Vault** | `wishenbloom_gems_2200` | $19.99 | Consumable | 2,200 Arcane Gems |
| **Royal Gem Vault** | `wishenbloom_gems_6000` | $49.99 | Consumable | 6,000 Arcane Gems |
| **Crown Treasury** | `wishenbloom_gems_13000` | $99.99 | Consumable | 13,000 Arcane Gems |

> **Store Configuration Notes**:
> - **Google Play Console**: Create as **In-App Product** (Consumable).
> - **App Store Connect**: Create as **Consumable In-App Purchase**.
> - **Consumable Policy**: Per Google and Apple guidelines, consumable currencies are immediately credited and are non-restorable upon re-install.

---

## 2. In-Game Currency Exchange Reference (Soft Currency / Gameplay)
These transactions occur purely in-game and **do not require store SKU registration**:

### Energy (Arcane Gems → Bloom Energy)
- 30 Energy = 15 Arcane Gems
- 60 Energy = 25 Arcane Gems
- 100 Energy = 40 Arcane Gems

### Coins (Arcane Gems → Realm Coins)
- 500 Coins = 20 Arcane Gems
- 1,500 Coins = 50 Arcane Gems
- 4,000 Coins = 110 Arcane Gems
