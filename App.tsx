import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Header } from './src/components/Header';
import { SearchBar } from './src/components/SearchBar';
import { CategoryChips } from './src/components/CategoryChips';
import { FilterModal } from './src/components/FilterModal';
import { SectionHeader } from './src/components/SectionHeader';
import { ItemCard } from './src/components/ItemCard';
import { EmptyState } from './src/components/EmptyState';
import { Fab } from './src/components/Fab';
import { AddItemModal } from './src/components/AddItemModal';
import { useCloset } from './src/hooks/useCloset';
import { greeting, todayISO } from './src/lib/format';
import { COLOR_PALETTE, SEASON_ICONS } from './src/constants';
import type { Category, Item, Season, SortMode } from './src/types';
import { useTheme, fonts, shapes, type Palette } from './src/theme';
import { Ionicons } from '@expo/vector-icons';

SplashScreen.preventAutoHideAsync().catch(() => {});

const SORT_ORDER: SortMode[] = ['newest', 'favorites', 'worn', 'name'];

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const c = useTheme();
  const styles = makeStyles(c);
  const {
    items,
    loaded,
    saveFailed,
    toggleFavorite,
    toggleWornToday,
    addItem,
    removeItem,
  } = useCloset();

  const [category, setCategory] = useState<Category>('All');
  const [season, setSeason] = useState<Season | 'All'>('All');
  const [colorId, setColorId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 2500);
    return () => clearTimeout(timeout);
  }, []);

  const today = todayISO();

  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      All: items.length,
      Tops: 0,
      Bottoms: 0,
      Dresses: 0,
      Shoes: 0,
    };
    for (const item of items) {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    }
    return counts;
  }, [items]);

  const selectedColor = useMemo(
    () => COLOR_PALETTE.find((col) => col.id === colorId),
    [colorId]
  );

  const visibleItems = useMemo(() => {
    let list = items.filter((item) => {
      const inCategory = category === 'All' || item.category === category;
      const inSeason =
        season === 'All' ||
        item.season === season ||
        (!item.season && season === 'All-Season');
      const inColor = !colorId || item.colorHex === selectedColor?.hex;
      const inQuery = item.name.toLowerCase().includes(query.toLowerCase());
      return inCategory && inSeason && inColor && inQuery;
    });

    if (sortMode === 'favorites') {
      list = [...list].sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
    } else if (sortMode === 'worn') {
      list = [...list].sort(
        (a, b) => (b.wornOn === today ? 1 : 0) - (a.wornOn === today ? 1 : 0)
      );
    } else if (sortMode === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [items, category, season, colorId, selectedColor, query, sortMode, today]);

  const cycleSortMode = () => {
    const currentIndex = SORT_ORDER.indexOf(sortMode);
    const nextIndex = (currentIndex + 1) % SORT_ORDER.length;
    setSortMode(SORT_ORDER[nextIndex]);
  };

  const clearAllFilters = () => {
    setQuery('');
    setCategory('All');
    setSeason('All');
    setColorId(null);
  };

  const activeFilterCount = (season !== 'All' ? 1 : 0) + (colorId !== null ? 1 : 0);
  const hasActiveFilters = Boolean(query) || category !== 'All' || activeFilterCount > 0;

  const confirmRemove = (item: Item) => {
    Alert.alert('Remove Piece', `"${item.name}" will be deleted from your atelier.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem(item) },
    ]);
  };

  if (!ready && !fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.container}>
          {saveFailed && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>
                Changes could not be saved to device storage.
              </Text>
            </View>
          )}

          <Header
            greeting={greeting()}
            totalPieces={loaded ? items.length : null}
            searchActive={searchOpen}
            onToggleSearch={() => {
              setSearchOpen((open) => {
                if (open) setQuery('');
                return !open;
              });
            }}
          />

          {searchOpen && <SearchBar value={query} onChange={setQuery} />}

          <CategoryChips
            value={category}
            onChange={setCategory}
            counts={loaded ? categoryCounts : undefined}
          />

          {/* Active Sub-Filter Badges (only visible when sub-filters applied) */}
          {activeFilterCount > 0 && (
            <View style={styles.activeFiltersRow}>
              {season !== 'All' && (
                <Pressable
                  onPress={() => setSeason('All')}
                  style={styles.activeFilterPill}
                >
                  <Ionicons
                    name={SEASON_ICONS[season]}
                    size={12}
                    color={c.onPrimaryContainer}
                  />
                  <Text style={styles.activeFilterText}>{season}</Text>
                  <Ionicons name="close" size={12} color={c.onPrimaryContainer} />
                </Pressable>
              )}

              {selectedColor && (
                <Pressable
                  onPress={() => setColorId(null)}
                  style={styles.activeFilterPill}
                >
                  <View
                    style={[
                      styles.activeColorDot,
                      { backgroundColor: selectedColor.hex },
                    ]}
                  />
                  <Text style={styles.activeFilterText}>{selectedColor.name}</Text>
                  <Ionicons name="close" size={12} color={c.onPrimaryContainer} />
                </Pressable>
              )}

              <Pressable
                onPress={() => {
                  setSeason('All');
                  setColorId(null);
                }}
                style={styles.clearFiltersBtn}
              >
                <Text style={styles.clearFiltersText}>Clear</Text>
              </Pressable>
            </View>
          )}

          <SectionHeader
            title={category === 'All' ? 'Your pieces' : category}
            count={visibleItems.length}
            sortMode={sortMode}
            onCycleSort={cycleSortMode}
            activeFilterCount={activeFilterCount}
            onOpenFilter={() => setFilterModalOpen(true)}
          />

          <FlatList
            data={visibleItems}
            numColumns={2}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              hasActiveFilters ? (
                <EmptyState
                  title="No pieces found"
                  message="No pieces match your current filters."
                  isFilterResult
                  onAction={clearAllFilters}
                  actionLabel="Clear all filters"
                />
              ) : (
                <EmptyState
                  title="An empty atelier awaits"
                  message="Tap below to photograph your first piece."
                  onAction={() => setModalOpen(true)}
                  actionLabel="Add piece"
                />
              )
            }
            renderItem={({ item }) => (
              <ItemCard
                item={item}
                onToggleFavorite={toggleFavorite}
                onToggleWornToday={toggleWornToday}
                onRemove={confirmRemove}
              />
            )}
          />
        </View>

        <Fab onPress={() => setModalOpen(true)} />

        <AddItemModal
          visible={modalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={addItem}
        />

        <FilterModal
          visible={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          selectedSeason={season}
          onSeasonChange={setSeason}
          selectedColorId={colorId}
          onColorChange={setColorId}
          onClearAll={() => {
            setSeason('All');
            setColorId(null);
          }}
          resultCount={visibleItems.length}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.surface,
    },
    container: {
      flex: 1,
      paddingHorizontal: 18,
    },
    errorBanner: {
      backgroundColor: c.errorContainer,
      borderRadius: shapes.md,
      padding: 10,
      marginVertical: 6,
      borderWidth: 1,
      borderColor: c.error,
    },
    errorBannerText: {
      fontFamily: fonts.semiBold,
      color: c.onErrorContainer,
      fontSize: 12,
      textAlign: 'center',
    },
    gridRow: {
      justifyContent: 'space-between',
    },
    grid: {
      paddingBottom: 110,
    },
    activeFiltersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingTop: 6,
      paddingBottom: 2,
    },
    activeFilterPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      height: 28,
      paddingHorizontal: 10,
      borderRadius: shapes.full,
      backgroundColor: c.primaryContainer,
    },
    activeFilterText: {
      fontFamily: fonts.bold,
      color: c.onPrimaryContainer,
      fontSize: 11,
    },
    activeColorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    clearFiltersBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    clearFiltersText: {
      fontFamily: fonts.bold,
      color: c.primary,
      fontSize: 11.5,
    },
  });
