# AGENTS.md — AI context for the Closet app

## What this is

"Closet" — a personal digital wardrobe app. Users photograph their clothes, organize them into categories, mark favorites and worn-today. Single-screen Expo app; all data stays on-device.

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

Modular layout under `src/`; `App.tsx` is only a composition root (providers + screen wiring).

```
App.tsx                  screen: state wiring (category/query/sort/editing) + FlatList layout
src/
  theme.ts               light/dark palettes + useTheme() hook — ALL colors come from here
  types.ts               Category, ClothingCategory, Item, SortMode, NewItemDraft, EditItemDraft
  constants.ts           STORAGE_KEY, categories, clothingCategories
  lib/format.ts          greeting(), todayISO()
  lib/files.ts           storeImage() / deleteStoredImage() — compresses to ≤1080px JPEG then copies
                         into documentDirectory/closet/<id>.jpg (expo-file-system object API)
  lib/images.ts          pickImage(camera|library) single, pickImages(limit 8) multi; permission Alerts live here
  lib/storage.ts         loadItems() / saveItems()
  hooks/useCloset.ts     items state, loaded gate, saveFailed flag, add/update/remove/favorite/wornToday
  components/            Header, SearchBar, CategoryChips, SectionHeader,
                         ItemCard (memo), EmptyState, Fab, AddItemModal (add+edit sheet)
scripts/make-icons.mjs   regenerates assets/icon.png, adaptive-icon.png, splash-icon.png
assets/                  generated app icons + splash image
eas.json                 preview profile builds an installable APK
```

## Gotchas

- Use `SafeAreaView` from `react-native-safe-area-context` (wrapped in `SafeAreaProvider`) — NOT the one from `react-native`. Android runs edge-to-edge by default on RN 0.86; the built-in view overlaps the status bar.
- Picked image URIs are temporary cache files — they MUST be copied via `storeImage()` before storing, or photos vanish after restart.
- Deleting an item must also delete its file (`deleteStoredImage()` in `lib/files.ts`, guarded by `startsWith('file://')`).
- Camera/library permission denials are handled inline with `Alert.alert` pointing at Settings.
- No starter/demo items: first launch is intentionally empty with an empty state.
- Components must be theme-aware: call `useTheme()` inside render and build styles via a `makeStyles(c)` module-level function — never import colors statically (dark mode would break).
- The add/edit sheet seeds state via a `key` on the inner component (`SheetBody`) to remount per item — do NOT reintroduce setState-in-effect seeding (eslint react-hooks/set-state-in-effect).
- `saveFailed` from `useCloset` drives the persistence-failure banner in App; keep surfacing it.
- Item ids use `${Date.now()}-${index}` for batch adds — never plain Date.now() (collides within one batch).

## Conventions

- Palettes: light = background `#F7F4EE`, ink `#24231F`, muted `#9B958A`, sage `#C8D7C0`/ink `#30432E`, terracotta `#B86C5E`; dark variants in theme.ts.
- Styles: each component owns a `makeStyles(c)` returning `StyleSheet.create` with dense entries.
- UI text tone: short, warm, lowercase-ish elegance ("Add a piece", "An empty closet awaits").
- Haptics: selectionAsync on favorite toggle, impact Medium on FAB, success notification after save.
- No comments in code unless asked.
