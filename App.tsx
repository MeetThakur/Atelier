import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
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
import * as Haptics from 'expo-haptics';

SplashScreen.preventAutoHideAsync().catch(() => {});

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = (seed + 1) * 12345;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const rnd = s / 233280;
    const j = Math.floor(rnd * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

const SORT_OPTIONS: { id: SortMode; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'newest', label: 'Recently added', description: 'Most recently photographed pieces first', icon: 'time-outline' },
  { id: 'favorites', label: 'Favorites first', description: 'Your favorited wardrobe staples first', icon: 'heart-outline' },
  { id: 'name', label: 'Alphabetical (A to Z)', description: 'Sorted alphabetically by piece name', icon: 'text-outline' },
  { id: 'random', label: 'Random Shuffle', description: 'Surprise daily styling rotation', icon: 'shuffle-outline' },
];

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
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [actionSheetItem, setActionSheetItem] = useState<Item | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [randomSeed, setRandomSeed] = useState(0);

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
    } else if (sortMode === 'random') {
      list = seededShuffle(list, randomSeed);
    }

    return list;
  }, [items, category, season, query, sortMode, randomSeed]);

  // 2-Column Masonry split for organic staggered flow
  const { leftColumn, rightColumn } = useMemo(() => {
    const left: Item[] = [];
    const right: Item[] = [];
    visibleItems.forEach((item, index) => {
      if (index % 2 === 0) {
        left.push(item);
      } else {
        right.push(item);
      }
    });
    return { leftColumn: left, rightColumn: right };
  }, [visibleItems]);

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

  const currentSortLabel =
    sortMode === 'newest'
      ? 'Recently added'
      : sortMode === 'favorites'
      ? 'Favorites first'
      : sortMode === 'name'
      ? 'Alphabetical'
      : 'Random Shuffle';

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

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
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

              {/* Studio Spotlight Hero Banner */}
              {!hasActiveFilters && items.length > 0 && (
                <View style={styles.spotlightHero}>
                  <View style={styles.spotlightLeft}>
                    <View style={styles.spotlightTag}>
                      <Ionicons name="sparkles" size={11} color={c.gold} />
                      <Text style={styles.spotlightTagText}>STUDIO</Text>
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
                    <Ionicons name="sparkles" size={13} color={c.onPrimary} />
                    <Text style={styles.spotlightActionText}>Try Studio</Text>
                  </Pressable>
                </View>
              )}

              {/* Section Header: "Your Archive" + Sort Dropdown */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Your Archive</Text>

                <Pressable
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSortModalOpen(true);
                  }}
                  style={({ pressed }) => [styles.sortDropdownBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.sortDropdownText}>{currentSortLabel}</Text>
                  <Ionicons name="chevron-down" size={13} color={c.onSurfaceVariant} />
                </Pressable>
              </View>

              {/* Masonry 2-Column Grid / Empty State */}
              {visibleItems.length === 0 ? (
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
              ) : (
                <View style={styles.masonryContainer}>
                  <View style={styles.masonryCol}>
                    {leftColumn.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onPress={() => setSelectedItem(item)}
                        onOpenMenu={() => setActionSheetItem(item)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </View>

                  <View style={styles.masonryCol}>
                    {rightColumn.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onPress={() => setSelectedItem(item)}
                        onOpenMenu={() => setActionSheetItem(item)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

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

      {/* Sort Selection Sheet Modal */}
      <Modal
        visible={sortModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalScrim} onPress={() => setSortModalOpen(false)} />
          <View style={styles.sortSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Sort Archive</Text>

            <View style={styles.sortOptionsList}>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = opt.id === sortMode;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      if (opt.id === 'random') {
                        setRandomSeed((s) => s + 1);
                      }
                      setSortMode(opt.id);
                      setSortModalOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.sortOptionRow,
                      isSelected && styles.sortOptionRowActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={[styles.optIconWrap, isSelected && styles.optIconWrapActive]}>
                      <Ionicons
                        name={opt.icon}
                        size={17}
                        color={isSelected ? c.gold : c.onSurfaceVariant}
                      />
                    </View>

                    <View style={styles.optTextCol}>
                      <Text style={[styles.optLabel, isSelected && styles.optLabelActive]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.optDesc}>{opt.description}</Text>
                    </View>

                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color={c.gold} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

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
        onToggleFavorite={toggleFavorite}
        onRemove={removeItem}
        onOpenDetails={(item: Item) => setSelectedItem(item)}
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
      paddingHorizontal: 16,
    },
    scrollContent: {
      paddingBottom: 110,
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
    masonryContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    masonryCol: {
      flex: 1,
      gap: 14,
    },
    activeFiltersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingTop: 4,
      paddingBottom: 4,
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
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 22,
      paddingHorizontal: 18,
      paddingVertical: 16,
      marginTop: 6,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      position: 'relative',
      overflow: 'hidden',
    },
    spotlightLeft: {
      flex: 1,
      paddingRight: 10,
    },
    spotlightTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 4,
    },
    spotlightTagText: {
      fontFamily: fonts.bold,
      color: c.gold,
      fontSize: 10,
      letterSpacing: 1.2,
    },
    spotlightTitle: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 18,
      letterSpacing: -0.3,
      marginBottom: 3,
    },
    spotlightSubtitle: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 12,
      lineHeight: 17,
    },
    spotlightActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: shapes.full,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    spotlightActionText: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 12.5,
      letterSpacing: -0.1,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 4,
      paddingBottom: 14,
      paddingHorizontal: 2,
    },
    sectionTitle: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 18,
      letterSpacing: -0.3,
    },
    sortDropdownBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: c.cardBg,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: shapes.full,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    sortDropdownText: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 12,
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: c.scrim,
    },
    modalScrim: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    sortSheet: {
      backgroundColor: c.surfaceContainerLow,
      borderTopLeftRadius: shapes.xxl,
      borderTopRightRadius: shapes.xxl,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 32,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 32,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.outlineVariant,
      marginBottom: 16,
    },
    sheetTitle: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 19,
      marginBottom: 16,
    },
    sortOptionsList: {
      gap: 6,
    },
    sortOptionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: shapes.lg,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      gap: 12,
    },
    sortOptionRowActive: {
      borderColor: c.gold,
      backgroundColor: c.goldContainer,
    },
    optIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optIconWrapActive: {
      backgroundColor: '#FFFFFF',
    },
    optTextCol: {
      flex: 1,
    },
    optLabel: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 14,
      marginBottom: 2,
    },
    optLabelActive: {
      color: c.onSurface,
    },
    optDesc: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 11.5,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.96 }],
    },
  });
