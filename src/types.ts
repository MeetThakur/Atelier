export type Category = 'All' | 'Tops' | 'Bottoms' | 'Dresses' | 'Shoes' | 'Accessories';
export type ClothingCategory = Exclude<Category, 'All'>;

export type Season = 'All-Season' | 'Spring' | 'Summer' | 'Fall' | 'Winter';

export type SortMode = 'newest' | 'favorites' | 'name';

export type AppTab = 'archive' | 'canvas' | 'stats';

export type Item = {
  id: string;
  name: string;
  category: ClothingCategory;
  image: string;
  favorite?: boolean;
  season?: Season;
  wearCount?: number;
  lastWornDate?: string;
};

export type SavedOutfit = {
  id: string;
  name: string;
  createdAt: string;
  pieces: {
    itemId: string;
    image: string;
    name: string;
    category: ClothingCategory;
    x: number;
    y: number;
    scale: number;
  }[];
};

export type NewItemDraft = {
  photoUris: string[];
  name: string;
  category: ClothingCategory;
  season?: Season;
};
