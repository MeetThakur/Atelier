# Atelier

An editorial digital wardrobe & lookbook app built with Expo and React Native. Photograph your clothes, curate by category and season, compose outfits on a multi-touch styling canvas, and explore wardrobe analytics — with all data safely stored on-device.

---

## ✨ Features

### 🏛️ 1. Wardrobe Archive
- **Batch Photography**: Batch-pick up to 8 photos from your camera roll or take a shot with the in-app camera.
- **5 Categories**: `Tops`, `Bottoms`, `Dresses`, `Shoes`, and `Accessories` (with live count badges).
- **Seasonal Tags**: `All-Season`, `Spring`, `Summer`, `Fall`, and `Winter` with dedicated filtering.
- **Instant Detail & Favoriting**: Instant tap opens piece details; toggle favorites with animated double-tap or corner heart.
- **Expanded Search & Sort**: Search pieces by name, category, or season; sort by *Newest Added*, *Favorites First*, or *Alphabetical (A–Z)* via a dedicated sort sheet.

### 🎨 2. Studio Canvas (Lookbook Creator)
- **Interactive Multi-Touch Canvas**: Drag pieces with 1 finger; **pinch with 2 fingers anywhere** to expand & shrink cutouts in real-time.
- **Pure Transparent Cutouts**: Clean, shadowless transparent PNG rendering so cutouts layer naturally.
- **Layer & Reorder Controls**: Bring any piece forward or remove it with instant one-tap floating controls.
- **Smart Shuffle**: One-tap AI/algorithmic stylist generator that builds balanced looks from your tops, bottoms, dresses, shoes, and accessories.
- **Saved Outfits**: Save your favorite styling looks with custom names and load them back onto the board anytime.
- **Undo Piece Removal**: Floating undo banner for quick recovery of accidental removals.

### 📊 3. Wardrobe Analytics & Curation Insights
- **Key Metrics**: Total pieces, favorite ratio (%), saved looks count, and potential look combinations.
- **Qualitative Stylist Insights**: Dynamic styling guidance highlighting wardrobe gaps, capsule balance, and dominant seasons.
- **Category Distribution**: Visual progress breakdown across all 5 clothing categories.
- **Seasonal Coverage**: Horizontal carousel tracking seasonal wardrobe density.

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
| Imaging | `expo-image-picker` & `expo-image-manipulator` | Camera, gallery, and ≤1080px PNG optimization |
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

---

## 💾 Storage Architecture

1. **Cutout Images**: Compressed to high-res PNG (preserving transparency) and stored permanently at `documentDirectory/closet/<id>.png`. Deleting an item permanently cleans up its file.
2. **Wardrobe Metadata**: Persisted in AsyncStorage under `closet.items.v1`.
3. **Saved Outfits**: Persisted in AsyncStorage under `@atelier_saved_outfits_v1`.
4. **Theme Preference**: Persisted in AsyncStorage under `@atelier_theme_mode`.

---

## 📁 Project Structure

```
App.tsx                  Main shell (tab state, 150ms fades, archive screen, filters, grid)
src/
  theme.tsx              Haute Editorial design tokens (light & dark palettes, fonts, shapes)
  types.ts               Item, Category, Season, SavedOutfit, NewItemDraft types
  constants.ts           Storage keys, category definitions, seasons, ionic icons mapping
  lib/                   Formatting, image picking, PNG file storage, persistence helpers
  hooks/useCloset.ts     Wardrobe state management, CRUD, error boundaries
  components/            Header, SearchBar, CategoryChips, SectionHeader, ItemCard,
                         AddItemModal, FilterModal, ItemDetailModal, ItemActionSheet,
                         OutfitCanvas (Studio tab), StatsScreen (Stats tab), BottomNavBar, Fab
scripts/make-icons.mjs   Pure-Node generator for app icons and splash branding
```
