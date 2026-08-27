import { useCallback, useEffect, useState } from 'react';
import type { Item, NewItemDraft } from '../types';
import { deleteStoredImage, storeImage } from '../lib/files';
import { loadItems, saveItems, loadDailyLogs, saveDailyLogs } from '../lib/storage';

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
          const defaultLabel = 'Piece';
          const finalName = baseName
            ? (index === 0 ? baseName : `${baseName} ${index + 1}`)
            : (photoUris.length > 1 ? `${defaultLabel} ${index + 1}` : defaultLabel);

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

  const removeItem = useCallback((item: Item) => {
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    deleteStoredImage(item.image);
  }, []);

  const updateItem = useCallback(
    (id: string, updates: Partial<Omit<Item, 'id' | 'image'>>) => {
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const logWorn = useCallback((id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const currentCount = item.wearCount || 0;
        return {
          ...item,
          wearCount: currentCount + 1,
          lastWornDate: today,
        };
      })
    );

    // Sync to daily outfit logs in storage
    loadDailyLogs().then((logs) => {
      const existing = logs[today] || { dateKey: today, pieceIds: [] };
      if (!existing.pieceIds.includes(id)) {
        existing.pieceIds = [...existing.pieceIds, id];
      }
      logs[today] = existing;
      void saveDailyLogs(logs);
    }).catch(() => {});
  }, []);

  const syncDailyLogWears = useCallback(
    (dateKey: string, newPieceIds: string[], prevPieceIds: string[] = []) => {
      setItems((current) =>
        current.map((item) => {
          const wasInPrev = prevPieceIds.includes(item.id);
          const isInNew = newPieceIds.includes(item.id);

          if (!wasInPrev && isInNew) {
            const currentCount = item.wearCount || 0;
            return {
              ...item,
              wearCount: currentCount + 1,
              lastWornDate:
                item.lastWornDate && item.lastWornDate > dateKey
                  ? item.lastWornDate
                  : dateKey,
            };
          } else if (wasInPrev && !isInNew) {
            const currentCount = item.wearCount || 0;
            return {
              ...item,
              wearCount: Math.max(0, currentCount - 1),
              lastWornDate:
                item.lastWornDate === dateKey ? undefined : item.lastWornDate,
            };
          }
          return item;
        })
      );
    },
    []
  );

  const reloadItems = useCallback(async () => {
    try {
      const loadedList = await loadItems();
      setItems(loadedList);
    } catch {}
  }, []);

  return {
    items,
    loaded,
    saveFailed,
    toggleFavorite,
    addItem,
    removeItem,
    updateItem,
    logWorn,
    syncDailyLogWears,
    reloadItems,
  };
}
