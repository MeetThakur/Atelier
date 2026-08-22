export type Category = 'All' | 'Tops' | 'Bottoms' | 'Dresses' | 'Shoes';
export type ClothingCategory = Exclude<Category, 'All'>;

export type SortMode = 'newest' | 'favorites' | 'name' | 'worn';

export type Item = {
  id: string;
  name: string;
  category: ClothingCategory;
  image: string;
  favorite?: boolean;
  wornOn?: string;
};

export type NewItemDraft = {
  photoUris: string[];
  name: string;
  category: ClothingCategory;
};

export type EditItemDraft = {
  id: string;
  name: string;
  category: ClothingCategory;
  photoUri: string | null;
  wornToday?: boolean;
};
