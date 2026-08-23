export type Category = 'All' | 'Tops' | 'Bottoms' | 'Dresses' | 'Shoes';
export type ClothingCategory = Exclude<Category, 'All'>;

export type Season = 'All-Season' | 'Spring' | 'Summer' | 'Fall' | 'Winter';

export type SortMode = 'newest' | 'favorites' | 'name';

export type Item = {
  id: string;
  name: string;
  category: ClothingCategory;
  image: string;
  favorite?: boolean;
  season?: Season;
};

export type NewItemDraft = {
  photoUris: string[];
  name: string;
  category: ClothingCategory;
  season?: Season;
};

export type EditItemDraft = {
  id: string;
  name: string;
  category: ClothingCategory;
  photoUri: string | null;
  season?: Season;
};
