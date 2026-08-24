import type { Category, ClothingCategory, Season } from './types';
import type { Ionicons } from '@expo/vector-icons';

export const STORAGE_KEY = 'closet.items.v1';

export const OUTFITS_STORAGE_KEY = '@atelier_saved_outfits_v1';

export const DAILY_LOGS_STORAGE_KEY = '@atelier_daily_outfit_logs_v1';

export const THEME_STORAGE_KEY = '@atelier_theme_mode';

export const categories: Category[] = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];
export const clothingCategories: ClothingCategory[] = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];

export const seasons: Season[] = ['All-Season', 'Spring', 'Summer', 'Fall', 'Winter'];

export const SEASON_ICONS: Record<Season, keyof typeof Ionicons.glyphMap> = {
  'All-Season': 'infinite-outline',
  Spring: 'leaf-outline',
  Summer: 'sunny-outline',
  Fall: 'partly-sunny-outline',
  Winter: 'snow-outline',
};
