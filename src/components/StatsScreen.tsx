import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ClothingCategory, Item, SavedOutfit } from '../types';
import { OUTFITS_STORAGE_KEY, clothingCategories, categories } from '../constants';
import { useTheme, fonts, shapes, type Palette } from '../theme';

const DAILY_LOGS_STORAGE_KEY = '@atelier_daily_outfit_logs_v1';

const CATEGORY_ICONS: Record<ClothingCategory, keyof typeof Ionicons.glyphMap> = {
  Tops: 'shirt-outline',
  Bottoms: 'layers-outline',
  Dresses: 'sparkles-outline',
  Shoes: 'footsteps-outline',
  Accessories: 'glasses-outline',
};

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type DailyLogEntry = {
  dateKey: string; // 'YYYY-MM-DD'
  pieceIds: string[];
  outfitName?: string;
};

type Props = {
  items: Item[];
};

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatPrettyDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function formatMonthHeader(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function StatsScreen({ items }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLogEntry>>({});
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(() => formatDateKey(new Date()));
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<string>('All');
  const [selectedPieceIds, setSelectedPieceIds] = useState<string[]>([]);

  // Load saved outfits & daily logs on mount & sync on items update
  useEffect(() => {
    AsyncStorage.getItem(OUTFITS_STORAGE_KEY)
      .then((data) => {
        if (data) {
          const parsed: SavedOutfit[] = JSON.parse(data);
          setSavedOutfits(parsed);
        }
      })
      .catch(() => {});

    AsyncStorage.getItem(DAILY_LOGS_STORAGE_KEY)
      .then((data) => {
        if (data) {
          const parsed: Record<string, DailyLogEntry> = JSON.parse(data);
          setDailyLogs(parsed);
        }
      })
      .catch(() => {});
  }, [items]);

  // Merged logs: combines explicit daily logs with any item marked as worn today
  const mergedDailyLogs = useMemo(() => {
    const combined: Record<string, DailyLogEntry> = { ...dailyLogs };
    for (const item of items) {
      if (item.lastWornDate) {
        const dateKey = item.lastWornDate.split('T')[0];
        const existing = combined[dateKey] || { dateKey, pieceIds: [] };
        if (!existing.pieceIds.includes(item.id)) {
          combined[dateKey] = {
            ...existing,
            pieceIds: [...existing.pieceIds, item.id],
          };
        }
      }
    }
    return combined;
  }, [dailyLogs, items]);

  const totalItems = items.length;
  const favoriteCount = items.filter((i) => i.favorite).length;
  const favoritePercent = totalItems > 0 ? Math.round((favoriteCount / totalItems) * 100) : 0;

  // Category Breakdown
  const categoryCounts: Record<ClothingCategory, number> = {
    Tops: 0,
    Bottoms: 0,
    Dresses: 0,
    Shoes: 0,
    Accessories: 0,
  };

  for (const item of items) {
    if (categoryCounts[item.category] !== undefined) {
      categoryCounts[item.category]++;
    }
  }

  // Wear Log Metrics
  const totalWears = items.reduce((acc, item) => acc + (item.wearCount || 0), 0);
  const mostWornPieces = [...items]
    .filter((i) => (i.wearCount || 0) > 0)
    .sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0))
    .slice(0, 4);

  const unwornCount = items.filter((i) => !i.wearCount || i.wearCount === 0).length;

  const topsCount = categoryCounts.Tops;
  const bottomsCount = categoryCounts.Bottoms;
  const shoesCount = categoryCounts.Shoes;
  const dressesCount = categoryCounts.Dresses;

  const potentialLooks =
    topsCount * bottomsCount * (shoesCount || 1) + dressesCount * (shoesCount || 1);

  // Calendar calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayKey = formatDateKey(new Date());

  const daysInMonth = useMemo(() => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    // Monday-based week index (0 = Monday, 6 = Sunday)
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const days: { dateKey: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Empty lead days from previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dateKey: `pad-${i}`, dayNum: 0, isCurrentMonth: false });
    }

    // Days in current month
    for (let d = 1; d <= totalDays; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateKey: key, dayNum: d, isCurrentMonth: true });
    }

    return days;
  }, [year, month]);

  const handlePrevMonth = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateKey(formatDateKey(now));
  };

  const selectedLog = mergedDailyLogs[selectedDateKey];
  const selectedLoggedPieces = useMemo(() => {
    if (!selectedLog || !selectedLog.pieceIds) return [];
    return selectedLog.pieceIds
      .map((id) => items.find((i) => i.id === id))
      .filter((i): i is Item => Boolean(i));
  }, [selectedLog, items]);

  const handleOpenLogModal = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPieceIds(selectedLog?.pieceIds || []);
    setLogModalOpen(true);
  };

  const handleTogglePieceSelect = (pieceId: string) => {
    void Haptics.selectionAsync();
    setSelectedPieceIds((prev) =>
      prev.includes(pieceId) ? prev.filter((id) => id !== pieceId) : [...prev, pieceId]
    );
  };

  const handleSaveDailyLog = async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const updated = { ...dailyLogs };
    if (selectedPieceIds.length > 0) {
      updated[selectedDateKey] = {
        dateKey: selectedDateKey,
        pieceIds: selectedPieceIds,
      };
    } else {
      delete updated[selectedDateKey];
    }

    setDailyLogs(updated);
    setLogModalOpen(false);
    await AsyncStorage.setItem(DAILY_LOGS_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const handleRemoveLog = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = { ...dailyLogs };
    delete updated[selectedDateKey];
    setDailyLogs(updated);
    await AsyncStorage.setItem(DAILY_LOGS_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const filteredModalItems = items.filter(
    (item) => modalCategory === 'All' || item.category === modalCategory
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Editorial Header */}
      <View style={styles.header}>
        <View style={styles.kickerRow}>
          <Text style={styles.kicker}>LOOKBOOK CALENDAR & METRICS</Text>
          <View style={styles.kickerDot} />
          <Text style={styles.kickerSub}>ARCHIVE JOURNAL</Text>
        </View>
        <Text style={styles.title}>Wardrobe Journal</Text>
      </View>

      {/* --- Haute Editorial Daily Outfit Calendar --- */}
      <View style={styles.calendarCard}>
        {/* Calendar Month Header */}
        <View style={styles.calendarHeaderRow}>
          <View style={styles.monthTitleWrap}>
            <Text style={styles.monthTitleText}>{formatMonthHeader(viewDate)}</Text>
          </View>

          <View style={styles.calendarNavActions}>
            <Pressable
              onPress={handleGoToToday}
              hitSlop={4}
              style={({ pressed }) => [styles.todayBtn, pressed && styles.pressed]}
            >
              <Text style={styles.todayBtnText}>Today</Text>
            </Pressable>

            <Pressable
              onPress={handlePrevMonth}
              hitSlop={6}
              style={({ pressed }) => [styles.monthNavBtn, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-back" size={16} color={c.onSurface} />
            </Pressable>

            <Pressable
              onPress={handleNextMonth}
              hitSlop={6}
              style={({ pressed }) => [styles.monthNavBtn, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-forward" size={16} color={c.onSurface} />
            </Pressable>
          </View>
        </View>

        {/* Days of Week Header */}
        <View style={styles.weekdaysRow}>
          {WEEKDAYS.map((wd, i) => (
            <Text key={i} style={styles.weekdayText}>
              {wd}
            </Text>
          ))}
        </View>

        {/* Calendar Days Grid */}
        <View style={styles.daysGrid}>
          {daysInMonth.map((cell, idx) => {
            if (!cell.isCurrentMonth) {
              return <View key={cell.dateKey} style={styles.dayCellPad} />;
            }

            const isSelected = cell.dateKey === selectedDateKey;
            const isToday = cell.dateKey === todayKey;
            const hasLog = Boolean(
              mergedDailyLogs[cell.dateKey] && mergedDailyLogs[cell.dateKey].pieceIds.length > 0
            );

            return (
              <Pressable
                key={cell.dateKey}
                onPress={() => {
                  void Haptics.selectionAsync();
                  setSelectedDateKey(cell.dateKey);
                }}
                style={({ pressed }) => [
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumText,
                    isToday && styles.dayNumTextToday,
                    isSelected && styles.dayNumTextSelected,
                  ]}
                >
                  {cell.dayNum}
                </Text>

                {/* Outfit Indicator Dot */}
                {hasLog && (
                  <View
                    style={[
                      styles.outfitDot,
                      isSelected && styles.outfitDotSelected,
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Selected Day Log Breakdown */}
        <View style={styles.dayBreakdownSection}>
          <View style={styles.dayBreakdownHeader}>
            <View style={styles.dayBreakdownTitleCol}>
              <Text style={styles.dayBreakdownDate}>{formatPrettyDate(selectedDateKey)}</Text>
              <Text style={styles.dayBreakdownSub}>
                {selectedLoggedPieces.length > 0
                  ? `${selectedLoggedPieces.length} ${selectedLoggedPieces.length === 1 ? 'piece' : 'pieces'} styled`
                  : 'No look logged'}
              </Text>
            </View>

            <Pressable
              onPress={handleOpenLogModal}
              style={({ pressed }) => [styles.logLookBtn, pressed && styles.pressed]}
            >
              <Ionicons
                name={selectedLoggedPieces.length > 0 ? 'pencil' : 'add'}
                size={14}
                color={c.onPrimary}
              />
              <Text style={styles.logLookBtnText}>
                {selectedLoggedPieces.length > 0 ? 'Edit Look' : 'Log Outfit'}
              </Text>
            </Pressable>
          </View>

          {/* Logged Pieces Horizontal Preview */}
          {selectedLoggedPieces.length > 0 ? (
            <View style={styles.loggedPiecesWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.loggedPiecesRow}
              >
                {selectedLoggedPieces.map((piece) => (
                  <View key={piece.id} style={styles.loggedPieceCard}>
                    <Image source={{ uri: piece.image }} style={styles.loggedPieceImg} resizeMode="contain" />
                    <Text style={styles.loggedPieceName} numberOfLines={1}>
                      {piece.name || piece.category}
                    </Text>
                    <Text style={styles.loggedPieceCat}>{piece.category}</Text>
                  </View>
                ))}
              </ScrollView>

              <Pressable
                onPress={handleRemoveLog}
                hitSlop={6}
                style={({ pressed }) => [styles.removeLogBtn, pressed && styles.pressed]}
              >
                <Ionicons name="trash-outline" size={13} color={c.error} />
                <Text style={styles.removeLogText}>Clear day log</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyLogCard}>
              <Ionicons name="shirt-outline" size={20} color={c.onSurfaceVariant} />
              <Text style={styles.emptyLogText}>
                Tap "Log Outfit" to record the pieces you wore on this day.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Hero 2x2 Metric Cards */}
      <View style={styles.metricGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricIconCircle}>
            <Ionicons name="shirt-outline" size={17} color={c.onSurface} />
          </View>
          <Text style={styles.metricNumber}>{totalItems}</Text>
          <Text style={styles.metricLabel}>Total Pieces</Text>
        </View>

        <View style={styles.metricCard}>
          <View
            style={[
              styles.metricIconCircle,
              favoriteCount > 0 && { backgroundColor: c.goldContainer },
            ]}
          >
            <Ionicons
              name={favoriteCount > 0 ? 'heart' : 'heart-outline'}
              size={17}
              color={favoriteCount > 0 ? '#E0534C' : c.onSurfaceVariant}
            />
          </View>
          <Text style={styles.metricNumber}>{favoriteCount}</Text>
          <Text style={styles.metricLabel}>
            {favoriteCount > 0 ? `Favorites (${favoritePercent}%)` : 'Favorites (0%)'}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricIconCircle, { backgroundColor: c.goldContainer }]}>
            <Ionicons name="time-outline" size={17} color={c.gold} />
          </View>
          <Text style={styles.metricNumber}>{totalWears}</Text>
          <Text style={styles.metricLabel}>Total Outfit Wears</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIconCircle}>
            <Ionicons name="sparkles-outline" size={17} color={c.gold} />
          </View>
          <Text style={styles.metricNumber}>{potentialLooks}</Text>
          <Text style={styles.metricLabel}>Potential Looks</Text>
        </View>
      </View>

      {/* Most Worn Pieces / Wardrobe Utility */}
      {mostWornPieces.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Most Worn Pieces</Text>
            <Text style={styles.sectionSubtext}>{unwornCount} unlogged pieces</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mostWornRow}>
            {mostWornPieces.map((piece) => (
              <View key={piece.id} style={styles.wornPieceCard}>
                <Image source={{ uri: piece.image }} style={styles.wornPieceImg} resizeMode="contain" />
                <View style={styles.wornPieceInfo}>
                  <Text style={styles.wornPieceName} numberOfLines={1}>
                    {piece.name || piece.category}
                  </Text>
                  <Text style={styles.wornPieceCount}>
                    {piece.wearCount === 1 ? '1 wear' : `${piece.wearCount} wears`}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Category Breakdown Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category Distribution</Text>

        <View style={styles.distributionCard}>
          {clothingCategories.map((cat) => {
            const count = categoryCounts[cat];
            const percent = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
            const iconName = CATEGORY_ICONS[cat];
            const catColors = {
              Tops: { color: c.catTops, bg: c.catTopsBg },
              Bottoms: { color: c.catBottoms, bg: c.catBottomsBg },
              Dresses: { color: c.catDresses, bg: c.catDressesBg },
              Shoes: { color: c.catShoes, bg: c.catShoesBg },
              Accessories: { color: c.catAccessories, bg: c.catAccessoriesBg },
            }[cat];

            return (
              <View key={cat} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryIconWrap, { backgroundColor: catColors.bg }]}>
                    <Ionicons name={iconName} size={15} color={catColors.color} />
                  </View>
                  <Text style={styles.categoryName}>{cat}</Text>
                </View>

                <View style={styles.progressTrack}>
                  {count > 0 ? (
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.max(percent, 6)}%`,
                          backgroundColor: catColors.color,
                        },
                      ]}
                    />
                  ) : null}
                </View>

                <View style={styles.categoryCountWrap}>
                  <Text style={[styles.categoryCount, count > 0 && { color: catColors.color }]}>{count}</Text>
                  <Text style={styles.categoryPercent}>({percent}%)</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Log Outfit Selection Modal */}
      <Modal
        visible={logModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLogModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalScrim} onPress={() => setLogModalOpen(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Log Outfit</Text>
                <Text style={styles.modalSubtitle}>{formatPrettyDate(selectedDateKey)}</Text>
              </View>

              <Pressable onPress={() => setLogModalOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={c.onSurface} />
              </Pressable>
            </View>

            {/* Category Filter for Logger */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modalCatRow}
            >
              {categories.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setModalCategory(cat)}
                  style={[
                    styles.modalCatChip,
                    modalCategory === cat && styles.modalCatChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.modalCatChipText,
                      modalCategory === cat && styles.modalCatChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Pieces Grid to Select Worn Outfit */}
            <ScrollView style={styles.modalPiecesList} showsVerticalScrollIndicator={false}>
              {filteredModalItems.length === 0 ? (
                <Text style={styles.modalEmptyText}>No pieces in this category</Text>
              ) : (
                <View style={styles.modalPiecesGrid}>
                  {filteredModalItems.map((item) => {
                    const isSelected = selectedPieceIds.includes(item.id);
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => handleTogglePieceSelect(item.id)}
                        style={[
                          styles.modalPieceTile,
                          isSelected && styles.modalPieceTileSelected,
                        ]}
                      >
                        <Image source={{ uri: item.image }} style={styles.modalPieceImg} resizeMode="contain" />
                        <Text style={styles.modalPieceName} numberOfLines={1}>
                          {item.name || item.category}
                        </Text>
                        {isSelected && (
                          <View style={styles.modalCheckmark}>
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            {/* Save Log Action Footer */}
            <View style={styles.modalFooter}>
              <Text style={styles.selectedCountText}>
                {selectedPieceIds.length} {selectedPieceIds.length === 1 ? 'piece' : 'pieces'} selected
              </Text>
              <Pressable
                onPress={handleSaveDailyLog}
                style={({ pressed }) => [styles.saveLogBtn, pressed && styles.pressed]}
              >
                <Text style={styles.saveLogBtnText}>Save Look</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.surface,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 110,
    },
    header: {
      marginBottom: 18,
    },
    kickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 3,
    },
    kicker: {
      fontFamily: fonts.bold,
      color: c.gold,
      fontSize: 10,
      letterSpacing: 1.4,
      includeFontPadding: false,
    },
    kickerDot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: c.outline,
    },
    kickerSub: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 10,
      letterSpacing: 0.9,
      includeFontPadding: false,
    },
    title: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 30,
      letterSpacing: -0.5,
    },
    calendarCard: {
      backgroundColor: c.cardBg,
      borderRadius: shapes.xxl,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      padding: 16,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    calendarHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    monthTitleWrap: {
      flex: 1,
    },
    monthTitleText: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 18,
      letterSpacing: -0.2,
    },
    calendarNavActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    todayBtn: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHigh,
      marginRight: 4,
    },
    todayBtnText: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 11.5,
    },
    monthNavBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekdaysRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.outlineVariant,
      marginBottom: 8,
    },
    weekdayText: {
      width: `${100 / 7}%`,
      textAlign: 'center',
      fontFamily: fonts.bold,
      color: c.onSurfaceVariant,
      fontSize: 11,
      letterSpacing: 0.5,
    },
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCellPad: {
      width: `${100 / 7}%`,
      height: 40,
    },
    dayCell: {
      width: `${100 / 7}%`,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: shapes.md,
      position: 'relative',
    },
    dayCellSelected: {
      backgroundColor: c.primary,
    },
    dayNumText: {
      fontFamily: fonts.medium,
      color: c.onSurface,
      fontSize: 13,
    },
    dayNumTextToday: {
      fontFamily: fonts.bold,
      color: c.gold,
    },
    dayNumTextSelected: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
    },
    outfitDot: {
      position: 'absolute',
      bottom: 4,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.gold,
    },
    outfitDotSelected: {
      backgroundColor: '#FFFFFF',
    },
    dayBreakdownSection: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: c.outlineVariant,
    },
    dayBreakdownHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    dayBreakdownTitleCol: {
      flex: 1,
    },
    dayBreakdownDate: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 14,
      letterSpacing: -0.1,
    },
    dayBreakdownSub: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 11.5,
      marginTop: 1,
    },
    logLookBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: c.primary,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: shapes.full,
    },
    logLookBtnText: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 11.5,
    },
    loggedPiecesWrap: {
      marginTop: 4,
    },
    loggedPiecesRow: {
      gap: 8,
      paddingBottom: 6,
    },
    loggedPieceCard: {
      width: 76,
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: shapes.md,
      padding: 6,
      alignItems: 'center',
    },
    loggedPieceImg: {
      width: '100%',
      height: 60,
      marginBottom: 4,
    },
    loggedPieceName: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 10.5,
      textAlign: 'center',
    },
    loggedPieceCat: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 9.5,
      textAlign: 'center',
    },
    removeLogBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      marginTop: 8,
      paddingVertical: 4,
    },
    removeLogText: {
      fontFamily: fonts.semiBold,
      color: c.error,
      fontSize: 11,
    },
    emptyLogCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.surfaceContainerLow,
      borderRadius: shapes.lg,
      padding: 12,
      marginTop: 4,
    },
    emptyLogText: {
      flex: 1,
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 11.5,
      lineHeight: 16,
    },
    metricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 20,
    },
    metricCard: {
      width: '48%',
      backgroundColor: c.cardBg,
      borderRadius: shapes.xl,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      padding: 16,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    metricIconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    metricNumber: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 26,
      marginBottom: 2,
    },
    metricLabel: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 12,
    },
    insightCard: {
      backgroundColor: c.primaryContainer,
      borderRadius: shapes.xl,
      padding: 18,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    insightHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    insightSparkle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: c.goldContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    insightKicker: {
      fontFamily: fonts.bold,
      color: c.onPrimaryContainer,
      fontSize: 10.5,
      letterSpacing: 1.1,
    },
    insightTitle: {
      fontFamily: fonts.displayBold,
      color: c.onPrimaryContainer,
      fontSize: 16.5,
      marginBottom: 4,
    },
    insightText: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 13,
      lineHeight: 19,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 18,
      letterSpacing: -0.2,
    },
    sectionSubtext: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 11.5,
    },
    mostWornRow: {
      gap: 10,
    },
    wornPieceCard: {
      width: 110,
      backgroundColor: c.cardBg,
      borderRadius: shapes.lg,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      padding: 8,
      alignItems: 'center',
    },
    wornPieceImg: {
      width: '100%',
      height: 80,
      backgroundColor: 'transparent',
      marginBottom: 6,
    },
    wornPieceInfo: {
      alignItems: 'center',
      width: '100%',
    },
    wornPieceName: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 12,
      marginBottom: 2,
    },
    wornPieceCount: {
      fontFamily: fonts.medium,
      color: c.gold,
      fontSize: 11,
    },
    distributionCard: {
      backgroundColor: c.cardBg,
      borderRadius: shapes.xl,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      padding: 16,
      gap: 14,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    categoryInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      width: 100,
    },
    categoryIconWrap: {
      width: 26,
      height: 26,
      borderRadius: shapes.xs,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoryName: {
      fontFamily: fonts.semiBold,
      color: c.onSurface,
      fontSize: 13,
    },
    progressTrack: {
      flex: 1,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.surfaceContainerHigh,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 4,
    },
    categoryCountWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      width: 60,
      justifyContent: 'flex-end',
    },
    categoryCount: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 12.5,
    },
    categoryPercent: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 11,
    },
    seasonRowScroll: {
      gap: 10,
      paddingRight: 10,
    },
    seasonCard: {
      width: 104,
      backgroundColor: c.cardBg,
      borderRadius: shapes.lg,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      paddingVertical: 14,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    seasonIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    seasonCardCount: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 18,
      marginBottom: 2,
    },
    seasonCardName: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 11.5,
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
    modalCard: {
      backgroundColor: c.surfaceContainerLow,
      borderTopLeftRadius: shapes.xxl,
      borderTopRightRadius: shapes.xxl,
      maxHeight: '80%',
      paddingTop: 16,
      paddingBottom: 32,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    modalTitle: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 20,
    },
    modalSubtitle: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 12.5,
      marginTop: 1,
    },
    modalCatRow: {
      paddingHorizontal: 16,
      gap: 6,
      paddingVertical: 8,
    },
    modalCatChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHigh,
    },
    modalCatChipActive: {
      backgroundColor: c.primary,
    },
    modalCatChipText: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 12,
    },
    modalCatChipTextActive: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
    },
    modalPiecesList: {
      paddingHorizontal: 16,
      maxHeight: 280,
    },
    modalPiecesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      paddingVertical: 8,
    },
    modalPieceTile: {
      width: '31%',
      backgroundColor: c.cardBg,
      borderRadius: shapes.lg,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      padding: 6,
      alignItems: 'center',
      position: 'relative',
    },
    modalPieceTileSelected: {
      borderColor: c.gold,
      backgroundColor: c.goldContainer,
    },
    modalPieceImg: {
      width: '100%',
      height: 70,
      marginBottom: 4,
    },
    modalPieceName: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 10.5,
      textAlign: 'center',
    },
    modalCheckmark: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: c.gold,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalEmptyText: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 13,
      textAlign: 'center',
      paddingVertical: 32,
    },
    modalFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: c.outlineVariant,
    },
    selectedCountText: {
      fontFamily: fonts.semiBold,
      color: c.onSurfaceVariant,
      fontSize: 12.5,
    },
    saveLogBtn: {
      backgroundColor: c.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: shapes.full,
    },
    saveLogBtnText: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 13,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.96 }],
    },
  });
