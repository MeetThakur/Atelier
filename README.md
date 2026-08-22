# Closet

A digital wardrobe app built with Expo. Photograph your clothes, organize them by category, favorite the pieces you love — everything persists on your device.

## Features

- **Photo-first adding** — batch-pick up to 8 photos from your library or shoot one with the camera
- **Categories** — Tops, Bottoms, Dresses, Shoes (with an All filter)
- **Favorites** — tap the heart on any piece
- **Worn today** — mark what you wore; pieces show a WORN badge
- **Edit** — tap any piece to rename, recategorize, replace its photo
- **Sort** — newest, A–Z, favorites first
- **Search** — filter pieces by name
- **Delete** — long-press a piece to remove it
- **Dark mode** — follows your system appearance
- **Haptics** — subtle feedback on favorite, save, and add actions
- **Persistence** — items and photos survive restarts; nothing leaves your device

## Tech stack

| Tool | Version | Role |
|---|---|---|
| [Expo](https://expo.dev) | SDK 57 | App framework / tooling |
| React Native | 0.86 | UI runtime |
| React | 19.2.3 | UI library |
| TypeScript | ~6.0 (strict) | Type safety |
| expo-image-picker | — | Camera + photo library access |
| expo-image-manipulator | — | Resizes photos to ≤1080px before storing |
| expo-file-system | — | Stores photos in `documentDirectory/closet/` |
| expo-haptics | — | Tactile feedback |
| @react-native-async-storage/async-storage | — | Stores the item list as JSON |
| react-native-safe-area-context | — | Notch / status-bar safe layout |

## Getting started

Requires Node.js 22+.

```sh
npm install
npx expo start
```

Then scan the QR code with the **Expo Go** app on your phone (same Wi-Fi), or press `i` / `a` for a simulator.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Start the Metro dev server |
| `npm run ios` | Open in iOS simulator |
| `npm run android` | Open in Android emulator |
| `npm run lint` | ESLint (expo config) |
| `npx tsc --noEmit` | Typecheck |
| `npx expo-doctor` | Validate project health |
| `node scripts/make-icons.mjs` | Regenerate app icons/splash assets |

## How data is stored

- **Photos** are compressed to ≤1080px JPEG and copied out of the picker's temp cache into permanent app storage at `documentDirectory/closet/<id>.jpg` (deleting a piece deletes its file).
- **Item metadata** (name, category, favorite flag, worn date) lives in AsyncStorage under the key `closet.items.v1`.

## Building an installable APK

```sh
npx eas login
npx eas build -p android --profile preview   # uses eas.json (internal distribution APK)
```

## Project structure

```
App.tsx                  composition root (providers + screen)
src/
  theme.ts               light/dark palettes + useTheme()
  types.ts               shared types
  constants.ts           storage key, category lists
  lib/                   format, files, images, storage helpers
  hooks/useCloset.ts     items state + CRUD + persistence
  components/            Header, SearchBar, CategoryChips,
                         SectionHeader, ItemCard, EmptyState, Fab, AddItemModal
scripts/make-icons.mjs   pure-node PNG generator for app icons + splash
```

## Roadmap ideas

- Outfit boards / lookbooks
- Cloud sync & backup
- Production store builds via EAS
