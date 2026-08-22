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
    setItems((current) => current.map((item) => item.id === id ? { ...item, favorite: !item.favorite } : item));
  }, []);

  const toggleWornToday = useCallback((id: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setItems((current) => current.map((item) => item.id === id ? { ...item, wornOn: item.wornOn === today ? undefined : today } : item));
  }, []);

  const addItem = useCallback(async ({ photoUris, name, category }: NewItemDraft) => {
    const baseName = name.trim();
    for (let index = 0; index < photoUris.length; index++) {
      const id = `${Date.now()}-${index}`;
      const uri = photoUris[index];
      const image = uri.startsWith('file://') ? await storeImage(uri, id) : uri;
      const label = baseName || category;
      const finalName = index === 0 || !baseName ? label : `${label} ${index + 1}`;
      setItems((current) => [{ id, name: finalName, category, image }, ...current]);
    }
  }, []);

  const updateItem = useCallback(async ({ id, name, category, photoUri, wornToday }: EditItemDraft) => {
    const today = new Date().toISOString().slice(0, 10);
    const patch = (item: Item): Item => ({
      ...item,
      name: name.trim() || category,
      category,
      wornOn: wornToday ? today : undefined,
    });
    if (photoUri && photoUri.startsWith('file://')) {
      const image = await storeImage(photoUri, id);
      setItems((current) => current.map((item) => item.id !== id ? item : { ...patch(item), image }));
    } else {
      setItems((current) => current.map((item) => item.id !== id ? item : patch(item)));
    }
  }, []);

  const removeItem = useCallback((item: Item) => {
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    deleteStoredImage(item.image);
  }, []);

  return { items, loaded, saveFailed, toggleFavorite, toggleWornToday, addItem, updateItem, removeItem };
}
