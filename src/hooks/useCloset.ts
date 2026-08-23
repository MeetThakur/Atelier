import { useCallback, useEffect, useState } from 'react';
import type { EditItemDraft, Item, NewItemDraft } from '../types';
import { deleteStoredImage, storeImage } from '../lib/files';
import { loadItems, saveItems } from '../lib/storage';

export function useCloset() {
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    loadItems()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveItems(items)
      .then(() => setSaveFailed(false))
      .catch(() => setSaveFailed(true));
  }, [items, loaded]);

  const toggleFavorite = useCallback((id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item
      )
    );
  }, []);

  const addItem = useCallback(
    async ({ photoUris, name, category, season }: NewItemDraft) => {
      const baseName = name.trim();
      const newItems = await Promise.all(
        photoUris.map(async (uri, index) => {
          const id = `${Date.now()}-${index}`;
          const image = uri.startsWith('file://') ? await storeImage(uri, id) : uri;
          const label = baseName || category;
          const finalName = index === 0 || !baseName ? label : `${label} ${index + 1}`;
          const item: Item = {
            id,
            name: finalName,
            category,
            image,
            season: season || 'All-Season',
          };
          return item;
        })
      );
      setItems((current) => [...newItems, ...current]);
    },
    []
  );

  const updateItem = useCallback(
    async ({ id, name, category, photoUri, season }: EditItemDraft) => {
      const patch = (item: Item): Item => ({
        ...item,
        name: name.trim() || category,
        category,
        season: season ?? item.season,
      });
      if (photoUri && photoUri.startsWith('file://')) {
        const image = await storeImage(photoUri, id);
        setItems((current) =>
          current.map((item) => (item.id !== id ? item : { ...patch(item), image }))
        );
      } else {
        setItems((current) =>
          current.map((item) => (item.id !== id ? item : patch(item)))
        );
      }
    },
    []
  );

  const removeItem = useCallback((item: Item) => {
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    deleteStoredImage(item.image);
  }, []);

  return {
    items,
    loaded,
    saveFailed,
    toggleFavorite,
    addItem,
    updateItem,
    removeItem,
  };
}
