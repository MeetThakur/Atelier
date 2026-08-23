# AGENTS.md — AI context for the Atelier app

## What this is

"Atelier" — an editorial personal digital wardrobe & lookbook application. Users photograph clothing pieces, organize them across categories and seasons, mark favorites, compose outfits on an interactive multi-touch styling canvas, and view wardrobe analytics. Three-tab Expo app (Archive / Studio / Stats); all data stays strictly on-device.

## Stack & versions (do not drift)

- Expo SDK **57** (`expo@^57`), React Native **0.86**, React **19.2.3**
- TypeScript ~6.0, `strict: true`, extends `expo/tsconfig.base`; ESLint 9 + `eslint-config-expo`
- Node.js >= 22.13 required by SDK 57

## Commands

```sh
npm start              # Metro dev server
npx expo start --clear # dev server with cache reset
npx tsc --noEmit       # typecheck — run after every change
npm run lint           # eslint (expo config)
npx expo-doctor        # project health check
node scripts/make-icons.mjs  # regenerate assets/*.png (pure-node PNG writer)
npx eas build -p android --profile preview  # local-config APK via EAS (needs login)
npx expo install <pkg> # ALWAYS install RN/expo packages via this, never raw npm
```

## Architecture

Modular layout under `src/`; `App.tsx` owns tab state + archive screen wiring; tabs render conditionally with 150ms crossfades (`activeTab === 'archive' | 'canvas' | 'stats'`).

```
App.tsx                  tab state, archive screen: filters/sort/modals + FlatList grid
src/
  theme.tsx              ThemeProvider context; light/dark "Haute Editorial" palettes with gold
                         tokens; mode persisted (@atelier_theme_mode). ALL colors come from here.
  types.ts               Category ('All' | 'Tops' | 'Bottoms' | 'Dresses' | 'Shoes' | 'Accessories'),
                         ClothingCategory, Season, SortMode, AppTab, Item, SavedOutfit, NewItemDraft
  constants.ts           STORAGE_KEY ('closet.items.v1'), OUTFITS_STORAGE_KEY
                         ('@atelier_saved_outfits_v1'), categories, seasons, SEASON_ICONS
  lib/format.ts          greeting(), formatHeaderDate(), formatDate()
  lib/files.ts           storeImage() / deleteStoredImage() — compresses to ≤1080px wide PNG
                         (PNG preserves alpha for clothing cutouts) then copies into
                         documentDirectory/closet/<id>.png (expo-file-system object API)
  lib/images.ts          pickImage(camera|library) single, pickImages(limit 8) multi; permission Alerts live here
  lib/storage.ts         loadItems() / saveItems()
  hooks/useCloset.ts     items state, loaded gate, saveFailed flag, addItem/toggleFavorite/removeItem/updateItem/logWorn
  components/            Header, SearchBar, CategoryChips, SectionHeader, FilterModal,
                         ItemCard (memo, double-tap heart & corner heart), EmptyState, Fab, AddItemModal,
                         BottomNavBar, OutfitCanvas (Studio tab), StatsScreen (Stats tab),
                         ItemDetailModal, ItemActionSheet
scripts/make-icons.mjs   regenerates assets/icon.png, adaptive-icon.png, splash-icon.png
assets/                  generated app icons + splash image
eas.json                 preview profile builds an installable APK
```

## Gotchas

- Use `SafeAreaView` from `react-native-safe-area-context` (wrapped in `SafeAreaProvider`) — NOT the one from `react-native`. Android runs edge-to-edge by default on RN 0.86; the built-in view overlaps the status bar.
- Picked image URIs are temporary cache files — they MUST be copied via `storeImage()` before storing, or photos vanish after restart.
- Deleting an item must also delete its file (`deleteStoredImage()` in `lib/files.ts`, guarded by `startsWith('file://')`). Saved outfits reference item image URIs, so OutfitCanvas resolves pieces through `resolvePieceImage()` (checks `File.exists`, falls back to live item) before rendering/loading.
- Camera/library permission denials are handled inline with `Alert.alert` pointing at Settings.
- No starter/demo items: first launch is intentionally empty with an empty state.
- Components must be theme-aware: call `useTheme()` inside render and build styles via a `makeStyles(c)` module-level function — never import colors statically (dark mode would break).
- Sheets/modal forms reset via remount: outer component renders inner sheet with a `key` derived from `visible` — do NOT reintroduce setState-in-effect resets (eslint react-hooks/set-state-in-effect).
- Animated.Value / PanResponder singletons in DraggablePiece are created with a `useConst(() => ...)` lazy useState helper — never `useRef(x).current` during render (eslint react-hooks/refs) and never `Date.now()`/`Math.random()` inside components (eslint react-hooks/purity; use module-scope helpers like `nextInstanceId`/`randomRange`).
- Gesture Responders & Multi-Touch:
  - Pieces support 1-finger translation dragging and 2-finger pinch expand/shrink.
  - The canvas board also hosts a multi-touch `PanResponder` to capture 2-finger expand/shrink pinch gestures anywhere across the screen for the active piece.
  - Child action buttons use `onStartShouldSetPanResponder: () => false` on parent responders so clicks are delivered instantly without capture blocking.
- Studio Canvas pieces render as 100% transparent cutouts on the canvas surface without background drop shadows or borders.
- Lookbook Export & Sharing: Uses `captureRef` from `react-native-view-shot` on `OutfitCanvas` with native `expo-sharing`.
- Dragged piece positions must be reported back up to parent state (`onMoveEnd` → `handleUpdatePosition`) — saved looks persist `p.x`/`p.y`/`p.scale` from state, not local Animated offsets.
- `saveFailed` from `useCloset` drives the persistence-failure banner in App; keep surfacing it.
- Batch-add item ids use `${Date.now()}-${index}` (useCloset.addItem); canvas instance ids use module-scope `nextInstanceId()` counter — never plain Date.now() (collides within one batch).

## Conventions

- Palettes ("Haute Editorial"): light = silk cream surface `#FAF7F2`, espresso ink `#171614`, champagne gold `#C49B4B`; dark = obsidian `#111114` w/ pale gold `#E6C594`; full tokens in theme.tsx.
- 5 Categories: `Tops`, `Bottoms`, `Dresses`, `Shoes`, `Accessories`.
- Styles: each component owns a `makeStyles(c)` returning `StyleSheet.create` with dense entries; OutfitCanvas also has a static module-level sheet for per-piece internals that don't depend on theme.
- UI text tone: short, warm, editorial elegance ("An empty atelier awaits", "Save Styled Look").
- Haptics: selectionAsync on favorite/category toggles, impact Light/Medium on buttons and gestures, Heavy before destructive confirm, success notification after save/shuffle.
- No comments in code unless asked.
