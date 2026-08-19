# Wishenbloom — Android Build & Release Guide

**Publisher**: Mythic Crown Studios LLC  
**Application ID**: `com.mythiccrownstudios.wishenbloom`  
**Target Orientation**: Portrait  

---

## 1. Prerequisites
- **Node.js**: v18+ / v20+
- **Android Studio**: Ladybug / Hedgehog or newer
- **Android SDK**: API Level 34+ (Android 14) and Android Build-Tools 34.0.0+
- **JDK**: Java 17 or Java 21

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
This produces optimized production assets into the `dist/` directory.

### Step 3: Synchronize Capacitor Project
```bash
npm run android:sync
# Or: npx cap sync android
```
This copies the web build artifacts into `android/app/src/main/assets/public/` and updates native plugin bridges (`@capacitor/app`, `@capacitor/haptics`, `@capacitor/screen-orientation`, `@capacitor/status-bar`).

### Step 4: Open Project in Android Studio
```bash
npm run android:open
# Or launch Android Studio and open the /android directory
```

### Step 5: Run on Physical Device or Emulator
1. Connect an Android phone via USB with USB Debugging enabled (or start an Android Virtual Device).
2. In Android Studio, click **Run 'app'** (`Shift + F10`).
3. Verify portrait orientation, top notch status bar insets, and touch merge responsiveness.

---

## 3. Creating a Debug Build
Inside Android Studio:
- Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**
- Output location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 4. Release Build & Google Play Upload (Requires Future Configuration)

### Keystore Configuration
Create a private release keystore (do **NOT** commit this to source control):
```bash
keytool -genkey -v -keystore wishenbloom-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias wishenbloom
```

### Configure Signing in `android/app/build.gradle`
Add signing credentials securely via environment variables or `keystore.properties`:
```groovy
android {
    signingConfigs {
        release {
            storeFile file(System.getenv("KEYSTORE_FILE") ?: "wishenbloom-release-key.jks")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Generate Android App Bundle (.aab)
In Android Studio:
- **Build > Generate Signed Bundle / APK... > Android App Bundle**
- Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Upload to Google Play Console
1. Navigate to [Google Play Console](https://play.google.com/console).
2. Select **Wishenbloom** (`com.mythiccrownstudios.wishenbloom`).
3. Go to **Testing > Internal testing** (or Closed testing).
4. Create a new release and upload the `.aab` bundle.

---

## 5. Summary of Status

| Feature / Step | Status | Notes |
| :--- | :--- | :--- |
| **Capacitor Configuration** | ✅ WORKING NOW | Configured in `capacitor.config.ts` |
| **Android Project Structure** | ✅ WORKING NOW | Generated in `/android` with portrait orientation |
| **Safe Area / System UI** | ✅ WORKING NOW | Dark fantasy status bar, safe-area insets |
| **Storage Abstraction** | ✅ WORKING NOW | Unified persistence with legacy save fallback |
| **Google Play Billing** | ⏳ FUTURE | Currently using MockPurchaseProvider in dev |
| **Release Signing Key** | ⏳ FUTURE | Must be generated on secure build machine |
