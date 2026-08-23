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

// Editorial Minimalist Light Palette (Warm Alabaster + Espresso + Champagne)
export const light = {
  primary: '#1A1816',
  onPrimary: '#FAF8F5',
  primaryContainer: '#EDE8E1',
  onPrimaryContainer: '#1A1816',

  secondary: '#8C8275',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#F2EFEB',
  onSecondaryContainer: '#2D2924',

  tertiary: '#C47B57',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FCEEE8',
  onTertiaryContainer: '#66321A',

  accent: '#D4AF37',
  onAccent: '#1A1816',
  accentContainer: '#FDF7E7',

  error: '#BA3B34',
  errorContainer: '#FCEBEA',
  onErrorContainer: '#54120E',

  surface: '#FAF8F5',
  onSurface: '#1A1816',
  surfaceVariant: '#EFECE6',
  onSurfaceVariant: '#78726A',

  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F5F2EB',
  surfaceContainer: '#EFECE6',
  surfaceContainerHigh: '#E8E4DC',
  surfaceContainerHighest: '#DFDAD0',

  outline: '#C4BEB4',
  outlineVariant: '#E5E1D8',
  scrim: 'rgba(18, 16, 14, 0.45)',
  glass: 'rgba(255, 255, 255, 0.75)',
} as const;

// Editorial Minimalist Dark Palette (Obsidian Noir + Warm Ivory + Soft Amber)
export const dark = {
  primary: '#F5F2EB',
  onPrimary: '#121214',
  primaryContainer: '#28272E',
  onPrimaryContainer: '#F5F2EB',

  secondary: '#A69E94',
  onSecondary: '#121214',
  secondaryContainer: '#232228',
  onSecondaryContainer: '#E6E1D8',

  tertiary: '#E08E79',
  onTertiary: '#121214',
  tertiaryContainer: '#38221C',
  onTertiaryContainer: '#FCEEE8',

  accent: '#E6C594',
  onAccent: '#121214',
  accentContainer: '#362B1C',

  error: '#E87A74',
  errorContainer: '#451715',
  onErrorContainer: '#FCEBEA',

  surface: '#0F0F12',
  onSurface: '#F5F2EB',
  surfaceVariant: '#1E1E24',
  onSurfaceVariant: '#969087',

  surfaceContainerLowest: '#09090B',
  surfaceContainerLow: '#15151A',
  surfaceContainer: '#1B1B21',
  surfaceContainerHigh: '#24242B',
  surfaceContainerHighest: '#2E2D36',

  outline: '#3D3C46',
  outlineVariant: '#26252E',
  scrim: 'rgba(0, 0, 0, 0.7)',
  glass: 'rgba(22, 22, 28, 0.8)',
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
  mode: 'system',
  isDark: false,
  setMode: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setModeState(saved);
        }
      })
      .catch(() => {});
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
