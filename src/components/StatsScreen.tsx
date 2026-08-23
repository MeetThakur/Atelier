import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ClothingCategory, Item, SavedOutfit, Season } from '../types';
import { OUTFITS_STORAGE_KEY, SEASON_ICONS, clothingCategories, seasons } from '../constants';
import { useTheme, fonts, shapes, type Palette } from '../theme';

const CATEGORY_ICONS: Record<ClothingCategory, keyof typeof Ionicons.glyphMap> = {
  Tops: 'shirt-outline',
  Bottoms: 'layers-outline',
  Dresses: 'sparkles-outline',
  Shoes: 'footsteps-outline',
  Accessories: 'glasses-outline',
};

type Props = {
  items: Item[];
};

export function StatsScreen({ items }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const [savedOutfitsCount, setSavedOutfitsCount] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(OUTFITS_STORAGE_KEY)
      .then((data) => {
        if (data) {
          const parsed: SavedOutfit[] = JSON.parse(data);
          setSavedOutfitsCount(parsed.length);
        }
      })
      .catch(() => {});
  }, []);

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

  // Season Breakdown
  const seasonCounts: Record<Season, number> = {
    'All-Season': 0,
    Spring: 0,
    Summer: 0,
    Fall: 0,
    Winter: 0,
  };

  for (const item of items) {
    const s = item.season || 'All-Season';
    if (seasonCounts[s] !== undefined) {
      seasonCounts[s]++;
    }
  }

  // Wear Log Metrics
  const totalWears = items.reduce((acc, item) => acc + (item.wearCount || 0), 0);
  const mostWornPieces = [...items]
    .filter((i) => (i.wearCount || 0) > 0)
    .sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0))
    .slice(0, 4);

  const unwornCount = items.filter((i) => !i.wearCount || i.wearCount === 0).length;

  // Potential Outfit Combinations
  const topsCount = categoryCounts.Tops;
  const bottomsCount = categoryCounts.Bottoms;
  const shoesCount = categoryCounts.Shoes;
  const dressesCount = categoryCounts.Dresses;

  const potentialLooks =
    topsCount * bottomsCount * (shoesCount || 1) + dressesCount * (shoesCount || 1);

  // Dynamic Stylist Insight (adding qualitative context rather than repeating raw counts)
  let insightHeadline = 'Wardrobe in Inception';
  let insightBody =
    'Photograph tops, trousers, and shoes to uncover your personal archive balance and unlock pairing suggestions.';

  if (totalItems >= 1) {
    if (shoesCount === 0 && (topsCount > 0 || bottomsCount > 0 || dressesCount > 0)) {
      insightHeadline = 'Footwear Gap';
      insightBody =
        'Add a pair of shoes to your archive to unlock full head-to-toe 3-piece looks on the Studio Canvas.';
    } else if (bottomsCount === 0 && topsCount > 0) {
      insightHeadline = 'Bottoms Needed';
      insightBody =
        'Curate trousers, skirts, or denim to unlock full styling versatility for your tops.';
    } else if (topsCount === 0 && bottomsCount > 0) {
      insightHeadline = 'Tops Needed';
      insightBody = 'Add shirts, knits, or tees to balance your bottom collection.';
    } else if (topsCount > 0 && bottomsCount > 0) {
      const dominantSeason = (Object.keys(seasonCounts) as Season[]).reduce((a, b) =>
        seasonCounts[a] > seasonCounts[b] ? a : b
      );
      const ratio = `${topsCount}:${bottomsCount}`;
      insightHeadline = 'Well-Balanced Capsule';
      insightBody = `Your ${ratio} Tops-to-Bottoms ratio gives strong versatile layering. Your most represented season is ${dominantSeason}.`;
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Editorial Header */}
      <View style={styles.header}>
        <View style={styles.kickerRow}>
          <Text style={styles.kicker}>ANALYTICS & CURATION</Text>
          <View style={styles.kickerDot} />
          <Text style={styles.kickerSub}>ATELIER INSIGHTS</Text>
        </View>
        <Text style={styles.title}>Wardrobe Stats</Text>
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

      {/* Stylist Insight Callout Card */}
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <View style={styles.insightSparkle}>
            <Ionicons name="sparkles" size={13} color={c.gold} />
          </View>
          <Text style={styles.insightKicker}>CURATION INSIGHT</Text>
        </View>
        <Text style={styles.insightTitle}>{insightHeadline}</Text>
        <Text style={styles.insightText}>{insightBody}</Text>
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
                    {piece.name}
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

            return (
              <View key={cat} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryIconWrap}>
                    <Ionicons name={iconName} size={15} color={c.onSurface} />
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
                          backgroundColor: c.primary,
                        },
                      ]}
                    />
                  ) : null}
                </View>

                <View style={styles.categoryCountWrap}>
                  <Text style={styles.categoryCount}>{count}</Text>
                  <Text style={styles.categoryPercent}>({percent}%)</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Seasonal Coverage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seasonal Coverage</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.seasonRowScroll}
        >
          {seasons.map((s) => {
            const count = seasonCounts[s];
            const iconName = SEASON_ICONS[s];

            return (
              <View key={s} style={styles.seasonCard}>
                <Ionicons name={iconName} size={18} color={c.gold} style={styles.seasonIcon} />
                <Text style={styles.seasonCardCount}>{count}</Text>
                <Text style={styles.seasonCardName}>{s}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
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
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 24,
    },
    header: {
      marginBottom: 20,
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
      fontSize: 32,
      letterSpacing: -0.4,
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
    seasonIcon: {
      marginBottom: 6,
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
  });
