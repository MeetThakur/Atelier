import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, FlatList, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
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
import { ItemCard } from './src/components/ItemCard';
import { ItemDetailModal } from './src/components/ItemDetailModal';
import { ItemActionSheet } from './src/components/ItemActionSheet';
import { EmptyState } from './src/components/EmptyState';
import { Fab } from './src/components/Fab';
import { AddItemModal } from './src/components/AddItemModal';
import { OutfitCanvas } from './src/components/OutfitCanvas';
import { StatsScreen } from './src/components/StatsScreen';
import { BottomNavBar } from './src/components/BottomNavBar';
import { useCloset } from './src/hooks/useCloset';
import { greeting } from './src/lib/format';
import { SEASON_ICONS } from './src/constants';
import type { AppTab, Category, Item, Season, SortMode } from './src/types';
import { ThemeProvider, useTheme, useThemeMode, fonts, shapes, type Palette } from './src/theme';
import { Ionicons } from '@expo/vector-icons';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AtelierApp() {
  const c = useTheme();
  const { isDark } = useThemeMode();
  const styles = makeStyles(c);
  const {
    items,
    loaded,
    saveFailed,
    toggleFavorite,
    addItem,
    removeItem,
    updateItem,
    logWorn,
  } = useCloset();

  const [activeTab, setActiveTab] = useState<AppTab>('archive');
  const [category, setCategory] = useState<Category>('All');
  const [season, setSeason] = useState<Season | 'All'>('All');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [actionSheetItem, setActionSheetItem] = useState<Item | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  // Smooth 150ms native tab crossfade
  const tabFadeAnim = useRef(new Animated.Value(1)).current;

  const handleTabChange = (nextTab: AppTab) => {
    if (nextTab === activeTab) return;
    Animated.timing(tabFadeAnim, {
      toValue: 0,
      duration: 65,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(nextTab);
      Animated.timing(tabFadeAnim, {
        toValue: 1,
        duration: 110,
        useNativeDriver: true,
      }).start();
    });
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      All: items.length,
      Tops: 0,
      Bottoms: 0,
      Dresses: 0,
      Shoes: 0,
      Accessories: 0,
    };
    for (const item of items) {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    }
    return counts;
  }, [items]);

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((item) => {
      const inCategory = category === 'All' || item.category === category;
      const inSeason =
        season === 'All' ||
        item.season === season ||
        (!item.season && season === 'All-Season');
      const inQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.season || 'All-Season').toLowerCase().includes(q);
      return inCategory && inSeason && inQuery;
    });

    if (sortMode === 'favorites') {
      list = [...list].sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
    } else if (sortMode === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [items, category, season, query, sortMode]);

  // Keep modals updated if favorited state changes
  const currentSelectedItem = useMemo(() => {
    if (!selectedItem) return null;
    return items.find((i) => i.id === selectedItem.id) || selectedItem;
  }, [items, selectedItem]);

  const currentActionSheetItem = useMemo(() => {
    if (!actionSheetItem) return null;
    return items.find((i) => i.id === actionSheetItem.id) || actionSheetItem;
  }, [items, actionSheetItem]);

  const clearAllFilters = () => {
    setQuery('');
    setCategory('All');
    setSeason('All');
  };

  const activeFilterCount = season !== 'All' ? 1 : 0;
  const hasActiveFilters = Boolean(query) || category !== 'All' || activeFilterCount > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Animated.View style={[styles.tabContentWrap, { opacity: tabFadeAnim }]}>
        {activeTab === 'archive' && (
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
              activeFilterCount={activeFilterCount}
              onOpenFilter={() => setFilterModalOpen(true)}
              sortMode={sortMode}
              onSortChange={setSortMode}
            />

            {/* Active Sub-Filter Badges (compact) */}
            {activeFilterCount > 0 && season !== 'All' && (
              <View style={styles.activeFiltersRow}>
                <Pressable
                  onPress={() => setSeason('All')}
                  style={styles.activeFilterPill}
                >
                  <Ionicons
                    name={SEASON_ICONS[season] || 'sparkles-outline'}
                    size={12}
                    color={c.gold}
                  />
                  <Text style={styles.activeFilterText}>Season: {season}</Text>
                  <Ionicons name="close-circle" size={13} color={c.onPrimaryContainer} />
                </Pressable>

                <Pressable onPress={() => setSeason('All')} style={styles.clearFiltersBtn}>
                  <Text style={styles.clearFiltersText}>Reset</Text>
                </Pressable>
              </View>
            )}

            <FlatList
              data={visibleItems}
              numColumns={2}
              keyExtractor={(item) => item.id}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                !hasActiveFilters && items.length > 0 ? (
                  <View style={styles.spotlightHero}>
                    <View style={styles.spotlightLeft}>
                      <View style={styles.spotlightTag}>
                        <Ionicons name="sparkles" size={11} color={c.gold} />
                        <Text style={styles.spotlightTagText}>STUDIO SPOTLIGHT</Text>
                      </View>
                      <Text style={styles.spotlightTitle}>Style Today's Look</Text>
                      <Text style={styles.spotlightSubtitle}>
                        Mix and match {items.length} pieces on the styling canvas.
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleTabChange('canvas')}
                      style={({ pressed }) => [styles.spotlightActionBtn, pressed && styles.pressed]}
                    >
                      <Ionicons name="color-wand" size={14} color={c.onPrimary} />
                      <Text style={styles.spotlightActionText}>Studio</Text>
                    </Pressable>
                  </View>
                ) : null
              }
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
                  onPress={() => setSelectedItem(item)}
                  onOpenMenu={() => setActionSheetItem(item)}
                  onToggleFavorite={toggleFavorite}
                />
              )}
            />

            <Fab onPress={() => setModalOpen(true)} />
          </View>
        )}

        {activeTab === 'canvas' && <OutfitCanvas items={items} />}

        {activeTab === 'stats' && <StatsScreen items={items} />}
      </Animated.View>

      {/* Floating Bottom Nav */}
      <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />

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
        onClearAll={() => setSeason('All')}
        resultCount={visibleItems.length}
      />

      <ItemDetailModal
        item={currentSelectedItem}
        visible={currentSelectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onToggleFavorite={toggleFavorite}
        onRemove={removeItem}
        onUpdate={updateItem}
        onLogWorn={logWorn}
      />

      <ItemActionSheet
        item={currentActionSheetItem}
        visible={currentActionSheetItem !== null}
        onClose={() => setActionSheetItem(null)}
        onOpenDetails={(item) => setSelectedItem(item)}
        onToggleFavorite={toggleFavorite}
        onRemove={removeItem}
      />
    </SafeAreaView>
  );
}

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

  if (!ready && !fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AtelierApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.surface,
    },
    tabContentWrap: {
      flex: 1,
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
      gap: 6,
      height: 32,
      paddingHorizontal: 12,
      borderRadius: shapes.full,
      backgroundColor: c.primaryContainer,
    },
    activeFilterText: {
      fontFamily: fonts.bold,
      color: c.onPrimaryContainer,
      fontSize: 11.5,
      includeFontPadding: false,
      textAlignVertical: 'center',
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
    spotlightHero: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: shapes.xl,
      padding: 14,
      marginTop: 4,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    spotlightLeft: {
      flex: 1,
      paddingRight: 10,
    },
    spotlightTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 3,
    },
    spotlightTagText: {
      fontFamily: fonts.bold,
      color: c.gold,
      fontSize: 9.5,
      letterSpacing: 0.8,
    },
    spotlightTitle: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 15,
      letterSpacing: -0.2,
      marginBottom: 2,
    },
    spotlightSubtitle: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 11.5,
      lineHeight: 16,
    },
    spotlightActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: c.primary,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: shapes.full,
    },
    spotlightActionText: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 12,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.96 }],
    },
  });
