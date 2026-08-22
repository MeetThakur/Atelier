import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY } from '../constants';
import type { Item } from '../types';

export async function loadItems(): Promise<Item[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Item[]) : [];
}

export function saveItems(items: Item[]): Promise<void> {
  return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
