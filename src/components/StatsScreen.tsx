import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { DailyLogEntry, Item } from '../types';
import { loadDailyLogs, saveDailyLogs } from '../lib/storage';
import { useTheme, fonts, shapes, type Palette } from '../theme';
import { WearCalendar } from './stats/WearCalendar';
import { CategoryBreakdown } from './stats/CategoryBreakdown';
import { CapsuleInsights } from './stats/CapsuleInsights';
import { LogWearModal } from './stats/LogWearModal';

type Props = {
  items: Item[];
  onSyncDailyWear?: (
    dateKey: string,
    newPieceIds: string[],
    prevPieceIds: string[]
  ) => void;
};

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function StatsScreen({ items, onSyncDailyWear }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLogEntry>>({});
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(() => formatDateKey(new Date()));
  const [logModalOpen, setLogModalOpen] = useState(false);

  // Load daily logs from storage on mount
  useEffect(() => {
    loadDailyLogs()
      .then(setDailyLogs)
      .catch(() => {});
  }, []);

  // Dynamically compute effective wear counts directly from dailyLogs
  const itemWearCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const log of Object.values(dailyLogs)) {
      if (log && log.pieceIds && Array.isArray(log.pieceIds)) {
        for (const pieceId of log.pieceIds) {
          counts[pieceId] = (counts[pieceId] || 0) + 1;
        }
      }
    }

    return counts;
  }, [dailyLogs]);

  const totalItems = items.length;
  const favoriteCount = items.filter((i) => i.favorite).length;
  const favoritePercent = totalItems > 0 ? Math.round((favoriteCount / totalItems) * 100) : 0;

  // Wear Log Metrics
  const totalWears = useMemo(() => {
    return Object.values(itemWearCounts).reduce((acc, count) => acc + count, 0);
  }, [itemWearCounts]);

  const mostWornPieces = useMemo(() => {
    return items
      .map((piece) => ({
        ...piece,
        effectiveWearCount: itemWearCounts[piece.id] || 0,
      }))
      .filter((piece) => piece.effectiveWearCount > 0)
      .sort((a, b) => b.effectiveWearCount - a.effectiveWearCount)
      .slice(0, 4);
  }, [items, itemWearCounts]);

  const topsCount = items.filter((i) => i.category === 'Tops').length;
  const bottomsCount = items.filter((i) => i.category === 'Bottoms').length;
  const shoesCount = items.filter((i) => i.category === 'Shoes').length;
  const dressesCount = items.filter((i) => i.category === 'Dresses').length;

  const potentialLooks =
    topsCount * bottomsCount * (shoesCount || 1) + dressesCount * (shoesCount || 1);

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

  const handleSaveDailyLog = (pieceIds: string[]) => {
    const prevLog = dailyLogs[selectedDateKey];
    const prevPieceIds = prevLog?.pieceIds || [];

    const updated = { ...dailyLogs };
    if (pieceIds.length > 0) {
      updated[selectedDateKey] = {
        dateKey: selectedDateKey,
        pieceIds,
      };
    } else {
      delete updated[selectedDateKey];
    }
    setDailyLogs(updated);
    void saveDailyLogs(updated);

    if (onSyncDailyWear) {
      onSyncDailyWear(selectedDateKey, pieceIds, prevPieceIds);
    }
  };

  const handleRemoveLog = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const prevLog = dailyLogs[selectedDateKey];
    const prevPieceIds = prevLog?.pieceIds || [];

    const updated = { ...dailyLogs };
    delete updated[selectedDateKey];
    setDailyLogs(updated);
    void saveDailyLogs(updated);

    if (onSyncDailyWear) {
      onSyncDailyWear(selectedDateKey, [], prevPieceIds);
    }
  };

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
        </View>
        <Text style={styles.title}>Wardrobe Analytics</Text>
        <Text style={styles.subtitle}>
          Track wear frequency, capsule balance, and outfit history
        </Text>
      </View>

      {/* 4 Hero Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Total Pieces</Text>
            <Ionicons name="shirt-outline" size={16} color={c.gold} />
          </View>
          <Text style={styles.metricValue}>{totalItems}</Text>
          <Text style={styles.metricSub}>Archived in closet</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Favorite Ratio</Text>
            <Ionicons name="heart-outline" size={16} color={c.error} />
          </View>
          <Text style={styles.metricValue}>{favoritePercent}%</Text>
          <Text style={styles.metricSub}>{favoriteCount} staple pieces</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Total Wears</Text>
            <Ionicons name="calendar-outline" size={16} color={c.catTops} />
          </View>
          <Text style={styles.metricValue}>{totalWears}</Text>
          <Text style={styles.metricSub}>Outfit rotations</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Look Combinations</Text>
            <Ionicons name="sparkles-outline" size={16} color={c.catDresses} />
          </View>
          <Text style={styles.metricValue}>{potentialLooks}</Text>
          <Text style={styles.metricSub}>Styling capacity</Text>
        </View>
      </View>

      {/* Monthly Wear Calendar */}
      <WearCalendar
        viewDate={viewDate}
        selectedDateKey={selectedDateKey}
        mergedDailyLogs={dailyLogs}
        items={items}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onGoToToday={handleGoToToday}
        onSelectDate={setSelectedDateKey}
        onOpenLogModal={() => setLogModalOpen(true)}
        onRemoveLog={handleRemoveLog}
      />

      {/* Most Worn Pieces Spotlight (Below Calendar) */}
      {mostWornPieces.length > 0 && (
        <View style={styles.spotlightCard}>
          <View style={styles.spotlightHeader}>
            <View>
              <View style={styles.spotlightKickerRow}>
                <Text style={styles.spotlightKicker}>ROTATION LEADERBOARD</Text>
                <View style={styles.spotlightKickerDot} />
              </View>
              <Text style={styles.spotlightTitle}>Most Worn Staples</Text>
              <Text style={styles.spotlightSubtitle}>
                Your core high-rotation wardrobe foundation
              </Text>
            </View>
            <View style={styles.spotlightIconWrap}>
              <Ionicons name="flame" size={18} color={c.gold} />
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.spotlightScroll}
          >
            {mostWornPieces.map((piece, index) => (
              <View key={piece.id} style={styles.stapleCard}>
                {/* Image Pedestal */}
                <View style={styles.stapleImgWrap}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankBadgeText}>#{index + 1}</Text>
                  </View>
                  <Image
                    source={{ uri: piece.image }}
                    style={styles.stapleImg}
                    resizeMode="contain"
                  />
                </View>

                {/* Info & Wear Frequency */}
                <Text style={styles.stapleName} numberOfLines={1}>
                  {piece.name}
                </Text>
                <Text style={styles.stapleCategory}>{piece.category}</Text>

                <View style={styles.wearBadge}>
                  <Ionicons name="repeat" size={11} color={c.gold} />
                  <Text style={styles.wearBadgeText}>
                    {piece.effectiveWearCount} {piece.effectiveWearCount === 1 ? 'wear' : 'wears'}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Category & Seasonal Breakdown */}
      <CategoryBreakdown items={items} />

      {/* Stylist Insights */}
      <CapsuleInsights items={items} itemWearCounts={itemWearCounts} />

      {/* Log Wear Modal */}
      <LogWearModal
        key={`log-modal-${selectedDateKey}-${logModalOpen}`}
        visible={logModalOpen}
        selectedDateKey={selectedDateKey}
        items={items}
        initialPieceIds={dailyLogs[selectedDateKey]?.pieceIds || []}
        onClose={() => setLogModalOpen(false)}
        onSave={handleSaveDailyLog}
      />
    </ScrollView>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.surface,
    },
    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 110,
    },
    header: {
      marginBottom: 20,
    },
    kickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    kicker: {
      fontFamily: fonts.bold,
      fontSize: 11,
      color: c.gold,
      letterSpacing: 1.2,
    },
    kickerDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.gold,
    },
    title: {
      fontFamily: fonts.displayBold,
      fontSize: 26,
      color: c.onSurface,
    },
    subtitle: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: c.onSurfaceVariant,
      marginTop: 3,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 20,
    },
    metricCard: {
      width: '48%',
      backgroundColor: c.surfaceContainer,
      borderRadius: shapes.lg,
      padding: 14,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    metricHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    metricLabel: {
      fontFamily: fonts.medium,
      fontSize: 12,
      color: c.onSurfaceVariant,
    },
    metricValue: {
      fontFamily: fonts.displayBold,
      fontSize: 22,
      color: c.onSurface,
    },
    metricSub: {
      fontFamily: fonts.regular,
      fontSize: 11,
      color: c.onSurfaceVariant,
      marginTop: 2,
    },
    spotlightCard: {
      backgroundColor: c.surfaceContainer,
      borderRadius: shapes.xl,
      padding: 16,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      marginBottom: 20,
    },
    spotlightHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    spotlightKickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    spotlightKicker: {
      fontFamily: fonts.bold,
      fontSize: 10,
      letterSpacing: 1.2,
      color: c.gold,
    },
    spotlightKickerDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.gold,
    },
    spotlightTitle: {
      fontFamily: fonts.displaySemiBold,
      fontSize: 18,
      color: c.onSurface,
      letterSpacing: -0.3,
    },
    spotlightSubtitle: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: c.onSurfaceVariant,
      marginTop: 2,
    },
    spotlightIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.goldContainer,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    spotlightScroll: {
      gap: 12,
      paddingVertical: 2,
    },
    stapleCard: {
      width: 128,
      backgroundColor: c.surfaceVariant,
      borderRadius: shapes.lg,
      padding: 8,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    stapleImgWrap: {
      width: '100%',
      height: 110,
      backgroundColor: c.surface,
      borderRadius: shapes.md,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    rankBadge: {
      position: 'absolute',
      top: 6,
      left: 6,
      backgroundColor: c.goldContainer,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: shapes.full,
      zIndex: 2,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    rankBadgeText: {
      fontFamily: fonts.bold,
      fontSize: 9,
      color: c.gold,
    },
    stapleImg: {
      width: '85%',
      height: '85%',
    },
    stapleName: {
      fontFamily: fonts.semiBold,
      fontSize: 12,
      color: c.onSurface,
      marginTop: 8,
      textAlign: 'center',
    },
    stapleCategory: {
      fontFamily: fonts.regular,
      fontSize: 10,
      color: c.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 1,
    },
    wearBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: shapes.full,
      backgroundColor: c.goldContainer,
      marginTop: 8,
    },
    wearBadgeText: {
      fontFamily: fonts.bold,
      fontSize: 10,
      color: c.gold,
    },
  });
}
