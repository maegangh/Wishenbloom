# Wishenbloom — iOS Build & Release Guide

**Publisher**: Mythic Crown Studios LLC  
**Bundle Identifier**: `com.mythiccrownstudios.wishenbloom`  
**Target Device**: iPhone / iPad (Portrait)  

---

## 1. Prerequisites
- **macOS**: Sonoma (14.0+) or Sequoia (15.0+)
- **Xcode**: 15.0+ or 16.0+
- **CocoaPods** (optional if using SPM): `sudo gem install cocoapods` or Homebrew
- **Apple Developer Account**: For physical device debugging, TestFlight, and App Store distribution

---

## 2. Development Workflow (Step-by-Step)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build Web Application
```bash
npm run build
```
Compiles web game into `dist/`.

### Step 3: Synchronize Capacitor iOS Project
```bash
npm run ios:sync
# Or: npx cap sync ios
```
Syncs web assets to `ios/App/App/public/` and links native plugins via Swift Package Manager (SPM) / CocoaPods.

### Step 4: Open Project in Xcode
```bash
npm run ios:open
# Or open /ios/App/App.xcworkspace in Xcode
```

### Step 5: Configure Signing & Capabilities
1. In Xcode Project Navigator, select the root **App** project.
2. Select the **App** target and navigate to **Signing & Capabilities**.
3. Check **Automatically manage signing**.
4. Select your **Apple Developer Team** (e.g. *Mythic Crown Studios LLC*).
5. Verify Bundle Identifier is `com.mythiccrownstudios.wishenbloom`.

### Step 6: Run on iPhone Simulator or Connected iPhone
1. Select an iPhone target (e.g. *iPhone 16 Pro* or a connected physical iPhone).
2. Click **Run** (`Cmd + R`).
3. Verify:
   - Dynamic Island / Notch safe-area spacing on Top HUD.
   - Home indicator clearance on Bottom Navigation.
   - Smooth 60fps touch drag-and-drop on the merge board.

---

## 3. TestFlight & App Store Release (Requires Future Configuration)

### Step 1: Set Build & Version Numbers
In `ios/App/App/Info.plist` (or Project Settings):
- **Version**: `0.1.0` (Marketing version)
- **Build**: `1` (Internal build iteration)

### Step 2: Archive Application
1. In Xcode menu bar, select **Product > Destination > Any iOS Device (arm64)**.
2. Select **Product > Archive**.
3. Once archiving completes, Xcode Organizer will appear.

### Step 3: Upload to App Store Connect / TestFlight
1. In Xcode Organizer, select the recent archive and click **Distribute App**.
2. Select **App Store Connect** > **Upload**.
3. Follow the validation prompts and submit to App Store Connect.
4. Once processed, add internal/external testers in **TestFlight**.

---

## 4. Summary of Status

| Feature / Step | Status | Notes |
| :--- | :--- | :--- |
| **Capacitor Configuration** | ✅ WORKING NOW | Configured in `capacitor.config.ts` |
| **iOS Project Structure** | ✅ WORKING NOW | Generated in `/ios` with portrait lock in Info.plist |
| **Safe Area Insets** | ✅ WORKING NOW | CSS `env(safe-area-inset-*)` integrated |
| **Haptics** | ✅ WORKING NOW | Native iOS Taptic Engine via `@capacitor/haptics` |
| **StoreKit 2 Billing** | ⏳ FUTURE | Currently using MockPurchaseProvider in dev |
| **Apple Signing / Certs** | ⏳ FUTURE | Configured inside Xcode with developer team |
