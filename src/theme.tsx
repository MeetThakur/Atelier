import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@atelier_theme_mode';

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
  displayMedium: 'Outfit_600SemiBold',
  displaySemiBold: 'Outfit_700Bold',
  displayBold: 'Outfit_700Bold',
  displayExtraBold: 'Outfit_800ExtraBold',
} as const;

export type Fonts = typeof fonts;

export const shapes = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

export type Shapes = typeof shapes;

// Haute Editorial Light Palette (Silk Cream + Crisp Gallery Card + Rich Espresso + Champagne Gold)
export const light = {
  primary: '#171614',
  onPrimary: '#FDFBF7',
  primaryContainer: '#EFEBE3',
  onPrimaryContainer: '#171614',

  secondary: '#827B70',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#F3EFE9',
  onSecondaryContainer: '#2B2722',

  tertiary: '#C07550',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FBECE5',
  onTertiaryContainer: '#5C2D18',

  gold: '#C49B4B',
  onGold: '#FFFFFF',
  goldContainer: '#FBF5E6',

  accent: '#D4AF37',
  onAccent: '#171614',
  accentContainer: '#FDF7E7',

  error: '#B83832',
  errorContainer: '#FCEBEA',
  onErrorContainer: '#54120E',

  surface: '#FAF7F2',
  onSurface: '#171614',
  surfaceVariant: '#EDE8E0',
  onSurfaceVariant: '#7D766C',

  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#FFFFFF',
  surfaceContainer: '#FFFFFF',
  surfaceContainerHigh: '#F4EFE6',
  surfaceContainerHighest: '#EBE5DA',

  cardBg: '#FFFFFF',
  imageBg: '#F5F2EB',

  outline: '#C4BEB4',
  outlineVariant: '#EAE4D8',
  scrim: 'rgba(18, 16, 14, 0.48)',
  glass: 'rgba(255, 255, 255, 0.85)',

  // Haute Couture Category Color Tokens
  catTops: '#2D6A4F',
  catTopsBg: '#EAF4EF',
  catBottoms: '#BA4A38',
  catBottomsBg: '#FCEFEB',
  catDresses: '#6B4C76',
  catDressesBg: '#F3EDF5',
  catShoes: '#A2592B',
  catShoesBg: '#FBF1E8',
  catAccessories: '#B8860B',
  catAccessoriesBg: '#FBF5E6',
} as const;

// Haute Editorial Dark Palette (Obsidian Velvet + Elevated Studio Card + Warm Ivory + Pale Gold)
export const dark = {
  primary: '#F6F3EC',
  onPrimary: '#0E0E12',
  primaryContainer: '#26252C',
  onPrimaryContainer: '#F6F3EC',

  secondary: '#A39C92',
  onSecondary: '#0E0E12',
  secondaryContainer: '#201F25',
  onSecondaryContainer: '#E8E3D8',

  tertiary: '#E28C77',
  onTertiary: '#0E0E12',
  tertiaryContainer: '#351F19',
  onTertiaryContainer: '#FBECE5',

  gold: '#D6AE60',
  onGold: '#0E0E12',
  goldContainer: '#302615',

  accent: '#E6C594',
  onAccent: '#0E0E12',
  accentContainer: '#342918',

  error: '#E87A74',
  errorContainer: '#401412',
  onErrorContainer: '#FCEBEA',

  surface: '#0E0E12',
  onSurface: '#F6F3EC',
  surfaceVariant: '#1B1A21',
  onSurfaceVariant: '#989288',

  surfaceContainerLowest: '#070709',
  surfaceContainerLow: '#17161C',
  surfaceContainer: '#1C1B23',
  surfaceContainerHigh: '#24232C',
  surfaceContainerHighest: '#2D2C37',

  cardBg: '#18171E',
  imageBg: '#1F1E26',

  outline: '#383742',
  outlineVariant: '#26252F',
  scrim: 'rgba(0, 0, 0, 0.72)',
  glass: 'rgba(22, 21, 28, 0.85)',

  // Haute Couture Category Color Tokens (Dark)
  catTops: '#52B788',
  catTopsBg: '#132A20',
  catBottoms: '#E07A5F',
  catBottomsBg: '#2E1712',
  catDresses: '#B288C0',
  catDressesBg: '#26162B',
  catShoes: '#DE9B72',
  catShoesBg: '#2D1D13',
  catAccessories: '#E6C594',
  catAccessoriesBg: '#302615',
} as const;

export type Palette = { [K in keyof typeof light]: string };
export type ThemeMode = 'system' | 'light' | 'dark';

export const colors: Palette = light;

export const paletteFor = (scheme: string | null | undefined): Palette =>
  scheme === 'dark' ? dark : light;

type ThemeContextValue = {
  palette: Palette;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  palette: light,
  mode: 'light',
  isDark: false,
  setMode: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setModeState(saved);
        }
      })
      .catch(() => {})
      .finally(() => setResolved(true));
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newMode).catch(() => {});
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const palette = isDark ? dark : light;

  const toggleTheme = () => {
    setMode(isDark ? 'light' : 'dark');
  };

  if (!resolved) return null;

  return (
    <ThemeContext.Provider value={{ palette, mode, isDark, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): Palette => {
  const ctx = useContext(ThemeContext);
  const systemScheme = useColorScheme();
  return ctx ? ctx.palette : paletteFor(systemScheme);
};

export const useThemeMode = () => useContext(ThemeContext);
