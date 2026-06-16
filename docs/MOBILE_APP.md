# SquareBoards Mobile App (Capacitor)

Companion **iOS** and **Android** shell for [SquareBoards](https://www.squareboards.pro). The website remains the primary product; the native apps wrap the live Next.js deployment in a WebView (no static export required).

## What was set up (Phase 1)

| Item | Location |
|------|----------|
| Capacitor config | `capacitor.config.ts` |
| Minimal web shell (fallback) | `mobile/www/index.html` |
| Native bridge stub (Phase 2) | `mobile/native/init.ts` |
| Branding assets | `mobile/resources/` (from `public/apple-touch-icon.png`) |
| Android project | `android/` |
| iOS project | `ios/` |
| npm scripts | `cap:*`, `mobile:*` in `package.json` |

**Installed plugins:** `@capacitor/app`, `@capacitor/splash-screen`, `@capacitor/status-bar`, `@capacitor/share`, `@capacitor/push-notifications` (placeholder — web push via PWA remains primary today).

**Integration approach:** **Remote URL** (`server.url`). SquareBoards uses Next.js 14 App Router with SSR, API routes, Supabase, and Stripe — static export is not viable. Production loads `https://www.squareboards.pro`; dev can point at local Next.js.

## Prerequisites

### All developers

- Node.js 20+ (match repo)
- `npm install` at repo root
- SquareBoards dev/prod env as documented elsewhere (`.env.local` for local web)

### Android

- [Android Studio](https://developer.android.com/studio) (latest stable)
- Android SDK / emulator or physical device
- **Google Play Console:** one-time **$25** registration (when publishing)

### iOS (macOS only)

- macOS with [Xcode](https://developer.apple.com/xcode/) (latest stable)
- [CocoaPods](https://cocoapods.org/) (`sudo gem install cocoapods`)
- **Apple Developer Program:** **$99/year** (required for TestFlight / App Store)
- Windows can scaffold and sync Android; iOS builds require a Mac or CI (e.g. GitHub Actions + macOS runner)

## First-time setup

```bash
npm install
npm run cap:sync
# Optional: regenerate launcher icons + splash from mobile/resources/
npm run mobile:icons
npm run cap:sync
```

If `npm install` fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` on Windows, the repo includes `.npmrc` with `strict-ssl=false` (same class of network issue as `scripts/dev.mjs`).

## Run locally

### Production URL in the app (default after sync)

```bash
npm run cap:sync
npm run cap:android   # opens Android Studio
# npm run cap:ios     # macOS + Xcode only
```

Build/run from Android Studio or Xcode. The app opens `https://www.squareboards.pro`.

Shortcut: `npm run mobile:android` opens the Android project in Android Studio (same as `npm run cap:android`).

### Dev: load local Next.js

1. Start the web app: `npm run dev` (port **3000**).
2. Sync with dev server URL:

   ```bash
   npm run mobile:dev:sync
   ```

3. Open the native project and run on emulator/device.

**Android emulator:** use `CAPACITOR_DEV_URL=http://10.0.2.2:3000` (maps to host `localhost`).

**Physical device:** use your machine’s LAN IP, e.g. `CAPACITOR_DEV_URL=http://192.168.1.42:3000`.

Cleartext HTTP is enabled only when `CAPACITOR_DEV=1` (see `capacitor.config.ts`).

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run cap:sync` | Copy web assets + update native projects |
| `npm run cap:copy` | Copy web assets only |
| `npm run cap:update` | Update Capacitor native dependencies |
| `npm run cap:ios` | Open Xcode |
| `npm run cap:android` | Open Android Studio |
| `npm run mobile:sync` | Alias for `cap:sync` |
| `npm run mobile:dev:sync` | Sync with `CAPACITOR_DEV=1` → localhost |
| `npm run mobile:icons` | Generate icons/splash via `@capacitor/assets` |

## Store metadata (fill after first builds)

| Field | Value |
|-------|--------|
| **App name** | SquareBoards |
| **iOS bundle ID** | `com.squareboards.app` |
| **Android application ID** | `com.squareboards.app` |
| **Android package name** | `com.squareboards.app` |
| **Category** | Sports / Entertainment (contest / gaming companion) |
| **Privacy policy URL** | `https://www.squareboards.pro/privacy` |
| **Support URL** | `https://www.squareboards.pro/support` |

Update App Store Connect and Google Play Console with screenshots, age rating questionnaire, and contest/gambling disclosures as applicable in your jurisdictions.

## First Play Store upload (signed AAB + keystore)

Google Play requires an **Android App Bundle (`.aab`)** signed with an **upload key**. Create the keystore once, back it up securely, and reuse it for every release.

### 1. One-time Play Console registration

- Pay the **$25** one-time [Google Play Console](https://play.google.com/console) developer fee.
- Create the app listing (name **SquareBoards**, package **`com.squareboards.app`**).

### 2. Generate an upload keystore (once)

Run on any machine with a JDK (Android Studio bundles one). **Do not commit the keystore or passwords to git.**

```bash
keytool -genkeypair -v \
  -keystore squareboards-upload.jks \
  -alias squareboards-upload \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storetype JKS
```

Store `squareboards-upload.jks` in a password manager or secure vault (not the repo). You will need it for every store upload.

### 3. Configure signing in Android Studio

1. `npm run cap:sync` then `npm run mobile:android`.
2. **Build → Generate Signed App Bundle / APK…**
3. Choose **Android App Bundle**, select the keystore above, enter store/alias passwords.
4. Release build type → finish. Output: `android/app/release/app-release.aab` (path may vary slightly).

Alternatively, add a local `android/keystore.properties` (gitignored) and wire `signingConfigs` in `android/app/build.gradle` if you prefer CLI/`./gradlew bundleRelease` — keep secrets out of version control.

### 4. Upload to Play Console

1. **Testing → Internal testing** (recommended first) → Create release.
2. Upload the `.aab`, add release notes, roll out to testers.
3. Complete **Data safety**, **Content rating (IARC)**, store listing, and policy declarations before promoting to production.

### 5. Deep links (Android App Links)

`AndroidManifest.xml` declares `https://www.squareboards.pro` and `https://squareboards.pro` with `android:autoVerify="true"`. For verified App Links (open in app instead of Chrome), host Digital Asset Links at:

- `https://www.squareboards.pro/.well-known/assetlinks.json`
- `https://squareboards.pro/.well-known/assetlinks.json`

Use the SHA-256 certificate fingerprint from your **upload** or **app signing** key (Play Console → **Setup → App signing**). Capacitor `@capacitor/app` can handle opened URLs in Phase 2.

### 6. Version bumps before each upload

| Field | Location |
|-------|----------|
| `version` | `package.json` |
| `versionCode` / `versionName` | `android/app/build.gradle` → `defaultConfig` |

Increment `versionCode` (integer, monotonic) on every Play upload.

## App Store / Play submission checklist (contest app)

SquareBoards involves contests, payments, and real-world sports outcomes. Plan review time accordingly.

### Apple (Guideline 4.7 / WebView apps)

- [ ] **Not a thin WebView clone:** Add meaningful native value in Phase 2+ (push via APNs, biometric login, share sheet, deep links, offline shell).
- [ ] **Sign in with Apple** if you offer other third-party login on iOS.
- [ ] **In-app purchases:** Real-money contests may require compliance with local laws; Stripe on web may be acceptable if no digital IAP bypass — confirm with legal counsel.
- [ ] **Gambling / contests:** Complete export compliance and regional restrictions; document skill vs. chance where required.
- [ ] **Privacy nutrition labels** aligned with Supabase, Stripe, analytics, and push.
- [ ] **App Tracking Transparency** if you add cross-app tracking.

### Google Play

- [ ] **Real-money gambling / contests policy** — declare correctly; geo-restrict if needed.
- [ ] **Data safety form** (account, payment, device IDs for push).
- [ ] **Target API level** requirements (Android Gradle plugin keeps this current via Capacitor updates).
- [ ] **Content rating** (IARC) reflecting contest mechanics.

### Both stores

- [ ] Test checkout (Stripe), auth (Supabase), and push on physical devices.
- [ ] Verify `allowNavigation` covers Stripe Checkout and auth redirects (`capacitor.config.ts`).
- [x] Android intent filters for `https://www.squareboards.pro` (manifest); verified App Links need `assetlinks.json` (see above).
- [ ] Deep links / universal links for board invites — handle in app via `@capacitor/app` (Phase 2).
- [ ] Versioning: bump `version` in `package.json` and native build numbers before each store upload.

## Architecture notes

```
┌─────────────────────────────────────┐
│  Capacitor shell (iOS / Android)    │
│  Plugins: App, Splash, StatusBar…   │
└──────────────┬──────────────────────┘
               │ WebView
               ▼
┌─────────────────────────────────────┐
│  https://www.squareboards.pro       │
│  Next.js 14 App Router (Vercel)     │
│  SSR · API routes · Supabase · Stripe│
└─────────────────────────────────────┘
```

**Why not static export?** The app relies on server components, dynamic routes, webhooks, and backend APIs. Bundling static HTML would break core flows.

**Website stays canonical.** Ship web fixes once; mobile users get them on next launch without a store release (when using production URL). Optional store updates remain for native-only changes.

## Phase 2 recommendations

1. Wire `mobile/native/init.ts` from the Next.js app when `Capacitor.isNativePlatform()` (status bar, splash hide, app resume).
2. Native push (FCM + APNs) alongside existing web push; unify in Supabase notification layer.
3. `@capacitor/share` for board invite links from contest pages.
4. Deep links (`@capacitor/app` URL open) for `/create`, board IDs, pick’em weeks.
5. Optional `@capacitor/haptics` for pick submission feedback.
6. CI: macOS workflow for iOS archive; Android APK/AAB on merge to main.
7. Use `--sb-safe-*` CSS variables from `globals.css` on fixed footers/toasts in native WebView; `viewportFit: cover` is set in `app/layout.tsx`.
8. Evaluate **Capacitor Live Updates** only if you later ship bundled static shells — not needed for remote URL mode.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank WebView | Confirm `server.url`, device network, and TLS cert on production |
| Stripe redirect blocked | Add domain to `server.allowNavigation` in `capacitor.config.ts` |
| Android dev HTTP blocked | Use `mobile:dev:sync`; emulator uses `10.0.2.2` |
| iOS pod errors | Run `pod install` in `ios/App` on macOS |
| Icons stale | `npm run mobile:icons && npm run cap:sync` |

## Related docs

- PWA / web push: admin push docs, `public/manifest.json`
- Brand: `docs/BRAND_ARCHITECTURE.md`
- Production: `docs/PRODUCTION_AUDIT.md`
