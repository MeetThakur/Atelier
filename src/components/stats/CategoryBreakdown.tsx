import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, fonts, shapes, type Palette } from '../../theme';
import { clothingCategories, seasons, SEASON_ICONS } from '../../constants';
import type { ClothingCategory, Item, Season } from '../../types';

type Props = {
  items: Item[];
};

const CATEGORY_ICONS: Record<ClothingCategory, keyof typeof Ionicons.glyphMap> = {
  Tops: 'shirt-outline',
  Bottoms: 'layers-outline',
  Dresses: 'sparkles-outline',
  Shoes: 'footsteps-outline',
  Accessories: 'glasses-outline',
};

export function CategoryBreakdown({ items }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const total = items.length;

  const categoryCounts: Record<ClothingCategory, number> = {
    Tops: 0,
    Bottoms: 0,
    Dresses: 0,
    Shoes: 0,
    Accessories: 0,
  };

  const seasonCounts: Record<Season, number> = {
    'All-Season': 0,
    Spring: 0,
    Summer: 0,
    Fall: 0,
    Winter: 0,
  };

  for (const item of items) {
    if (categoryCounts[item.category] !== undefined) {
      categoryCounts[item.category]++;
    }
    const s = item.season || 'All-Season';
    if (seasonCounts[s] !== undefined) {
      seasonCounts[s]++;
    }
  }

  const CATEGORY_COLORS: Record<ClothingCategory, { color: string; bg: string }> = {
    Tops: { color: c.catTops, bg: c.catTopsBg },
    Bottoms: { color: c.catBottoms, bg: c.catBottomsBg },
    Dresses: { color: c.catDresses, bg: c.catDressesBg },
    Shoes: { color: c.catShoes, bg: c.catShoesBg },
    Accessories: { color: c.catAccessories, bg: c.catAccessoriesBg },
  };

  const SEASON_COLORS: Record<Season, { color: string; bg: string }> = {
    'All-Season': { color: c.gold, bg: c.goldContainer },
    Spring: { color: c.seasonSpring, bg: c.seasonSpringBg },
    Summer: { color: c.seasonSummer, bg: c.seasonSummerBg },
    Fall: { color: c.seasonFall, bg: c.seasonFallBg },
    Winter: { color: c.seasonWinter, bg: c.seasonWinterBg },
  };

  return (
    <View style={styles.container}>
      {/* Category Breakdown Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Category Distribution</Text>
        <Text style={styles.cardSubtitle}>Wardrobe balance across piece types</Text>

        <View style={styles.categoryList}>
          {clothingCategories.map((cat) => {
            const count = categoryCounts[cat];
            const percent = total > 0 ? (count / total) * 100 : 0;
            const colors = CATEGORY_COLORS[cat];

            return (
              <View key={cat} style={styles.categoryRow}>
                <View style={[styles.catIconWrap, { backgroundColor: colors.bg }]}>
                  <Ionicons name={CATEGORY_ICONS[cat]} size={16} color={colors.color} />
                </View>

                <View style={styles.catInfoCol}>
                  <View style={styles.catNameRow}>
                    <Text style={styles.catName}>{cat}</Text>
                    <Text style={styles.catCount}>
                      {count} {count === 1 ? 'piece' : 'pieces'} ({Math.round(percent)}%)
                    </Text>
                  </View>

                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${percent}%`, backgroundColor: colors.color },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Season Density Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Seasonal Breakdown</Text>
        <Text style={styles.cardSubtitle}>Distribution across climate rotations</Text>

        <View style={styles.seasonList}>
          {seasons.map((s) => {
            const count = seasonCounts[s];
            const percent = total > 0 ? (count / total) * 100 : 0;
            const colors = SEASON_COLORS[s];

            return (
              <View key={s} style={styles.seasonRow}>
                <View style={[styles.seasonIconWrap, { backgroundColor: colors.bg }]}>
                  <Ionicons name={SEASON_ICONS[s]} size={15} color={colors.color} />
                </View>

                <View style={styles.seasonInfoCol}>
                  <View style={styles.seasonNameRow}>
                    <Text style={styles.seasonName}>{s}</Text>
                    <Text style={styles.seasonCount}>{count} pcs</Text>
                  </View>

                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${percent}%`, backgroundColor: colors.color },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    container: {
      gap: 16,
      marginBottom: 24,
    },
    card: {
      backgroundColor: c.surfaceContainer,
      borderRadius: shapes.xl,
      padding: 16,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    cardTitle: {
      fontFamily: fonts.displaySemiBold,
      fontSize: 18,
      color: c.onSurface,
    },
    cardSubtitle: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: c.onSurfaceVariant,
      marginTop: 2,
      marginBottom: 16,
    },
    categoryList: {
      gap: 14,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    catIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    catInfoCol: {
      flex: 1,
    },
    catNameRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    catName: {
      fontFamily: fonts.semiBold,
      fontSize: 13,
      color: c.onSurface,
    },
    catCount: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: c.onSurfaceVariant,
    },
    progressBarTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: c.surfaceVariant,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 3,
    },
    seasonList: {
      gap: 12,
    },
    seasonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    seasonIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    seasonInfoCol: {
      flex: 1,
    },
    seasonNameRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    seasonName: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: c.onSurface,
    },
    seasonCount: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: c.onSurfaceVariant,
    },
  });
}
