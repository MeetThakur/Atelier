import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY, OUTFITS_STORAGE_KEY, DAILY_LOGS_STORAGE_KEY } from '../constants';
import type { Item, SavedOutfit, DailyLogEntry, WardrobeBackup } from '../types';

export async function loadItems(): Promise<Item[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Item[]) : [];
  } catch {
    return [];
  }
}

export function saveItems(items: Item[]): Promise<void> {
  return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function loadOutfits(): Promise<SavedOutfit[]> {
  try {
    const raw = await AsyncStorage.getItem(OUTFITS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedOutfit[]) : [];
  } catch {
    return [];
  }
}

export function saveOutfits(outfits: SavedOutfit[]): Promise<void> {
  return AsyncStorage.setItem(OUTFITS_STORAGE_KEY, JSON.stringify(outfits));
}

export async function loadDailyLogs(): Promise<Record<string, DailyLogEntry>> {
  try {
    const raw = await AsyncStorage.getItem(DAILY_LOGS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, DailyLogEntry>) : {};
  } catch {
    return {};
  }
}

export function saveDailyLogs(logs: Record<string, DailyLogEntry>): Promise<void> {
  return AsyncStorage.setItem(DAILY_LOGS_STORAGE_KEY, JSON.stringify(logs));
}

export async function exportFullBackup(): Promise<string> {
  const [items, outfits, dailyLogs] = await Promise.all([
    loadItems(),
    loadOutfits(),
    loadDailyLogs(),
  ]);

  const backup: WardrobeBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    items,
    outfits,
    dailyLogs,
  };

  return JSON.stringify(backup, null, 2);
}

export async function importFullBackup(rawJson: string): Promise<{ items: Item[]; outfits: SavedOutfit[]; dailyLogs: Record<string, DailyLogEntry> }> {
  const parsed = JSON.parse(rawJson) as Partial<WardrobeBackup>;
  if (!parsed || !Array.isArray(parsed.items)) {
    throw new Error('Invalid backup file structure: missing items array');
  }

  const items = parsed.items as Item[];
  const outfits = Array.isArray(parsed.outfits) ? (parsed.outfits as SavedOutfit[]) : [];
  const dailyLogs = parsed.dailyLogs && typeof parsed.dailyLogs === 'object' ? (parsed.dailyLogs as Record<string, DailyLogEntry>) : {};

  await Promise.all([
    saveItems(items),
    saveOutfits(outfits),
    saveDailyLogs(dailyLogs),
  ]);

  return { items, outfits, dailyLogs };
}
