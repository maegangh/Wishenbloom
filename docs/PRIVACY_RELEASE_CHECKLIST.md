# Wishenbloom — Privacy & Store Compliance Checklist

**Publisher**: Mythic Crown Studios LLC  
**Application ID**: `com.mythiccrownstudios.wishenbloom`  

Use this checklist when completing the store listing questionnaires in **Google Play Console** and **Apple App Store Connect**.

---

## 1. Compliance URLs (Configure Prior to Production Release)
- **Privacy Policy URL**: `https://mythiccrownstudios.com/wishenbloom/privacy`
- **Terms of Service URL**: `https://mythiccrownstudios.com/wishenbloom/terms`
- **Support Contact Email**: `support@mythiccrownstudios.com`

---

## 2. Google Play Console — Data Safety Section

| Data Type | Collected? | Shared? | Purpose |
| :--- | :--- | :--- | :--- |
| **Personal Info** (Name, Email, Address, Phone) | ❌ No | ❌ No | N/A |
| **Financial Info** (Credit card, Bank details) | ❌ No | ❌ No | Handled exclusively by Google Play Billing |
| **Location** (Approximate or Precise) | ❌ No | ❌ No | N/A |
| **Photos & Videos** | ❌ No | ❌ No | N/A |
| **Audio Files** | ❌ No | ❌ No | N/A |
| **Contacts** | ❌ No | ❌ No | N/A |
| **App Activity / Analytics** | ❌ No | ❌ No | No third-party trackers in Beta |
| **Device or other IDs** (Advertising ID) | ❌ No | ❌ No | No advertising SDKs integrated |

**Data Safety Declarations**:
- **Encryption in transit**: Yes (via HTTPS for web assets).
- **Data deletion request**: Save data is stored locally on the player's device and can be wiped via the Settings menu or App Info > Clear Data.

---

## 3. Apple App Store Connect — App Privacy (Nutrition Labels)

- **Data Used to Track You**: None.
- **Data Linked to You**: None.
- **Data Not Linked to You**: None (in this offline-first beta build).

---

## 4. Age Rating & Content Guidelines
- **Age Rating Target**: Everyone (PEGI 3 / ESRB E / IARC 3+).
- **Violence**: Mild fantasy cartoon theme (none).
- **Gambling**: None (no real money gambling or loot boxes with cash redemption).
- **In-App Purchases**: Yes (Arcane Gems, Starter Pack).
