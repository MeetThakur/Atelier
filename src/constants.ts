import type { Category, ClothingCategory, Season } from './types';
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
