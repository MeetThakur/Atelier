# Atelier

An editorial digital wardrobe & lookbook app built with Expo and React Native. Photograph your clothes, curate by category and season, compose outfits on a multi-touch styling canvas, and explore wardrobe analytics — with all data safely stored on-device.

---

## ✨ Features

### 🏛️ 1. Wardrobe Archive
- **Batch Photography**: Batch-pick up to 8 photos from your camera roll or take a shot with the in-app camera.
- **5 Categories**: `Tops`, `Bottoms`, `Dresses`, `Shoes`, and `Accessories` (with live count badges).
- **Seasonal Tags**: `All-Season`, `Spring`, `Summer`, `Fall`, and `Winter` with dedicated filtering.
- **Instant Detail & In-Place Editing**: Tap pieces for full-screen inspection, instant favorite toggles, wear logging, and in-place metadata editing (rename, category change, season updates).
- **Expanded Search & Sort**: Search pieces by name, category, or season; sort by *Newest Added*, *Favorites First*, or *Alphabetical (A–Z)* via a dedicated sort sheet.

### 🎨 2. Studio Canvas (Lookbook Creator)
- **Interactive Multi-Touch Canvas**: Drag pieces with 1 finger; **pinch with 2 fingers anywhere** to expand & shrink cutouts in real-time.
- **High-Resolution Lookbook Export & Sharing**: Capture and share high-res styled look flatlays directly via WhatsApp, Instagram, or system sharing.
- **Aesthetic Moodboard Backdrops**: Switch canvas backgrounds between *Silk Minimal*, *Architectural Grid*, and *Warm Studio Linen*.
- **Pure Transparent Cutouts**: Clean, shadowless transparent PNG rendering so cutouts layer naturally.
- **Smart Shuffle**: One-tap AI/algorithmic stylist generator that builds balanced looks from your tops, bottoms, dresses, shoes, and accessories.
- **Saved Outfits**: Save your favorite styling looks with custom names and load them back onto the board anytime.
- **Undo Piece Removal**: Floating undo banner for quick recovery of accidental removals.

### 📊 3. Wardrobe Analytics & Wear Tracking
- **Key Metrics**: Total pieces, favorite ratio (%), total outfit wears, and potential look combinations.
- **Most Worn Pieces**: Spotlight showcasing your highest-rotation wardrobe pieces.
- **Qualitative Stylist Insights**: Dynamic styling guidance highlighting wardrobe gaps, capsule balance, and dominant seasons.
- **Category & Seasonal Breakdown**: Visual progress distribution across categories and horizontal seasonal density carousel.

### 🌓 4. Haute Editorial Design & Theme
- **Dual Themes**: Silk Cream light mode (`#FAF7F2`) and Obsidian dark mode (`#111114`) with Champagne Gold (`#C49B4B`) accents.
- **Persistent Theme**: Remembers your theme preference across app launches.
- **Haptic Feedback**: Tactile responses on favorite toggles, dragging, deletions, and outfit saves.
- **Complete Privacy**: Zero cloud dependency — all photos and metadata remain on your device.

---

## 🛠️ Tech Stack

| Component | Technology | Role |
|---|---|---|
| Framework | [Expo SDK 57](https://expo.dev) | App framework & tooling |
| UI Runtime | React Native 0.86 / React 19.2.3 | Core UI engine |
| Language | TypeScript ~6.0 (Strict) | Type safety |
| Imaging & Export | `react-native-view-shot` & `expo-sharing` | High-res lookbook export & social sharing |
| File System | `expo-file-system` | Persistent on-device clothing cutout storage |
| Persistence | `@react-native-async-storage/async-storage` | Archive & saved outfit look storage |
| Typography | Google Fonts (`Outfit` & `Plus Jakarta Sans`) | Haute Editorial typography system |
| Gestures | React Native `PanResponder` & `Animated` | 2-finger pinch scaling & multi-touch canvas panning |
| Haptics | `expo-haptics` | Tactile sensory feedback |
| Safe Area | `react-native-safe-area-context` | Edge-to-edge status bar & navigation dock handling |

---

## 🚀 Getting Started

Requires **Node.js >= 22.13**.

```sh
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (iOS/Android) or press `a` for Android Emulator / `i` for iOS Simulator.

---

## 📜 Development Scripts

| Command | Description |
|---|---|
| `npm start` | Start Metro dev server |
| `npx tsc --noEmit` | Run strict TypeScript validation |
| `npm run lint` | ESLint static code analysis |
| `npx expo-doctor` | Validate Expo environment health |
| `node scripts/make-icons.mjs` | Regenerate app icon & splash screen PNGs |
| `npx eas build -p android --profile preview` | Build installable Android APK |
