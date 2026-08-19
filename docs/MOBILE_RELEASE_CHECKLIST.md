# Wishenbloom — Mobile Release & Store Deployment Checklist

**Publisher**: Mythic Crown Studios LLC  
**Application ID / Bundle ID**: `com.mythiccrownstudios.wishenbloom`  
**Current Baseline Version**: `0.1.0` (Android `versionCode: 1`, iOS `buildNumber: 1`)  

---

## 1. App Identity & Configuration Baseline

| Attribute | Android | iOS |
| :--- | :--- | :--- |
| **Package / Bundle ID** | `com.mythiccrownstudios.wishenbloom` | `com.mythiccrownstudios.wishenbloom` |
| **Display Name** | Wishenbloom | Wishenbloom |
| **Version Name / Marketing Version** | `0.1.0` | `0.1.0` |
| **Version Code / Build Number** | `1` | `1` |
| **Target Orientation** | Portrait (`android:screenOrientation="portrait"`) | Portrait (`UIInterfaceOrientationPortrait`) |
| **Target Min OS** | Android 7.0 (API 24) | iOS 15.0+ |
| **Target Build OS** | Android 14 (API 34 / 36) | iOS 17 / 18 |

---

## 2. Native Artwork & Asset Deliverables (Required Before Production)

Current Android (`android/app/src/main/res/mipmap-*`) and iOS (`ios/App/App/Assets.xcassets/AppIcon.appiconset`) directories contain default Capacitor placeholder assets. The following branded artwork must be generated and placed prior to store publication:

### A. Android Launcher Icons (`res/mipmap-*`)
- **Adaptive Icon Foreground**: 432×432px PNG (with transparent background; core icon within central 264px safe area).
- **Adaptive Icon Background**: 432×432px PNG or solid color `#020617` / `#1e1b4b`.
- **Legacy Launcher Icons**:
  - `mipmap-mdpi`: 48×48px
  - `mipmap-hdpi`: 72×72px
  - `mipmap-xhdpi`: 96×96px
  - `mipmap-xxhdpi`: 144×144px
  - `mipmap-xxxhdpi`: 192×192px
  - `ic_launcher_round`: Circular masks of matching densities.
- **Google Play Store Hi-Res Icon**: 512×512px 32-bit PNG (up to 1024KB).

### B. iOS App Icons (`AppIcon.appiconset`)
- **Single 1024×1024px PNG** (`AppIcon-512@2x.png`): 24-bit RGB with no alpha transparency, formatted for Xcode 15+ single-size asset catalog.

### C. Splash Screens
- **Android Splash**: Centered Wishenbloom logo (approx 288×288px) over `#020617` dark canvas (`res/drawable/splash.png`).
- **iOS Launch Screen**: Centered Wishenbloom logo over `#020617` dark canvas (`LaunchScreen.storyboard`).

---

## 3. Step-by-Step Android Release Pipeline (Manual Testing to Store)

### Phase 1: Local Device Testing in Android Studio
1. Run `npm run android:sync` to compile web assets into Android project.
2. Launch Android Studio and open `/android`.
3. Connect an Android test device via USB (or start an AVD emulator).
4. Run `app` target (`Shift + F10`).
5. Verify:
   - Full-screen portrait rendering.
   - Status bar safe-area insets on notched screens.
   - Smooth 60 FPS merge drag-and-drop.
   - Hardware Back button closes modals before minimizing.

### Phase 2: Building Release Android App Bundle (.aab)
1. In Android Studio, select **Build > Generate Signed Bundle / APK...**
2. Choose **Android App Bundle** (`.aab`).
3. Select your production release keystore (e.g. `wishenbloom-release.jks`).
4. Select `release` build variant and click **Create**.
5. Output location: `android/app/build/outputs/bundle/release/app-release.aab`.

### Phase 3: Google Play Console Internal Testing
1. Log in to [Google Play Console](https://play.google.com/console).
2. Create/select app **Wishenbloom** (`com.mythiccrownstudios.wishenbloom`).
3. Under **Testing > Internal testing**, click **Create new release**.
4. Upload `app-release.aab`.
5. Add internal QA tester email list and share the opt-in URL.

---

## 4. Step-by-Step iOS Release Pipeline (Manual Testing to TestFlight)

### Phase 1: Local Device Testing in Xcode
1. Run `npm run ios:sync` to compile web assets into iOS project.
2. Open `/ios/App/App.xcworkspace` in Xcode (or run `npm run ios:open`).
3. Under **Signing & Capabilities**, select your **Apple Developer Team**.
4. Select a physical iPhone or Simulator and press **Run** (`Cmd + R`).
5. Verify:
   - Dynamic Island / Notch safe-area spacing.
   - Home indicator clearance on bottom navigation.
   - Haptic feedback on item merges and order claims.

### Phase 2: Archiving & Uploading to TestFlight
1. In Xcode, set target destination to **Any iOS Device (arm64)**.
2. Select **Product > Archive**.
3. When Xcode Organizer appears, select the archive and click **Distribute App**.
4. Select **App Store Connect > Upload**.
5. Complete Apple validation checks and submit.
6. In [App Store Connect](https://appstoreconnect.apple.com), navigate to **TestFlight** and invite internal/external testers.

---

## 5. Pre-Release Verification Checklist

- [x] Application ID matches `com.mythiccrownstudios.wishenbloom` across all configurations.
- [x] Semantic version (`0.1.0`) and build number (`1`) synchronized.
- [x] Cleartext traffic disabled (HTTPS only).
- [x] No sensitive permissions (Camera, Location, Contacts, Audio, Bluetooth) requested.
- [x] Mock purchases strictly blocked in Beta and Production builds.
- [x] Save schema v5 backward compatibility verified.
- [x] Automated test suite passing with 100% success rate.
- [ ] Final branded launcher icons and splash artwork placed.
- [ ] In-App Products registered in Google Play Console & App Store Connect.
