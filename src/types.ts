export type Category = 'All' | 'Tops' | 'Bottoms' | 'Dresses' | 'Shoes';
export type ClothingCategory = Exclude<Category, 'All'>;

export type Season = 'All-Season' | 'Spring' | 'Summer' | 'Fall' | 'Winter';

export type ColorTag = {
  id: string;
  name: string;
  hex: string;
};

export type SortMode = 'newest' | 'favorites' | 'name' | 'worn';

export type Item = {
  id: string;
  name: string;
  category: ClothingCategory;
  image: string;
  favorite?: boolean;
  wornOn?: string;
  season?: Season;
  colorHex?: string;
  colorName?: string;
};

export type NewItemDraft = {
  photoUris: string[];
  name: string;
  category: ClothingCategory;
  season?: Season;
  colorHex?: string;
  colorName?: string;
};

export type EditItemDraft = {
  id: string;
  name: string;
  category: ClothingCategory;
  photoUri: string | null;
  wornToday?: boolean;
  season?: Season;
  colorHex?: string;
  colorName?: string;
};
