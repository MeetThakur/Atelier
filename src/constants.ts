import type { Category, ClothingCategory, ColorTag, Season } from './types';
import type { Ionicons } from '@expo/vector-icons';

export const STORAGE_KEY = 'closet.items.v1';

export const categories: Category[] = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes'];
export const clothingCategories: ClothingCategory[] = ['Tops', 'Bottoms', 'Dresses', 'Shoes'];

export const seasons: Season[] = ['All-Season', 'Spring', 'Summer', 'Fall', 'Winter'];

export const SEASON_ICONS: Record<Season, keyof typeof Ionicons.glyphMap> = {
  'All-Season': 'infinite-outline',
  Spring: 'leaf-outline',
  Summer: 'sunny-outline',
  Fall: 'partly-sunny-outline',
  Winter: 'snow-outline',
};

export const COLOR_PALETTE: ColorTag[] = [
  { id: 'black', name: 'Black', hex: '#1C1B1F' },
  { id: 'white', name: 'White', hex: '#FDFCFA' },
  { id: 'grey', name: 'Grey', hex: '#8E8E93' },
  { id: 'beige', name: 'Beige', hex: '#D2B48C' },
  { id: 'navy', name: 'Navy', hex: '#1E2D4A' },
  { id: 'brown', name: 'Brown', hex: '#634735' },
  { id: 'olive', name: 'Olive', hex: '#5B6846' },
  { id: 'terracotta', name: 'Rust', hex: '#B86C5E' },
  { id: 'burgundy', name: 'Wine', hex: '#6B2D45' },
  { id: 'blue', name: 'Denim', hex: '#4A729A' },
  { id: 'rose', name: 'Blush', hex: '#DFA3AC' },
  { id: 'emerald', name: 'Forest', hex: '#2D5A3F' },
];
