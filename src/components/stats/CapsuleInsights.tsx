import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, fonts, shapes, type Palette } from '../../theme';
import type { Item } from '../../types';
import type { WardrobeInsight } from './statsTypes';

type Props = {
  items: Item[];
  itemWearCounts?: Record<string, number>;
};

export function CapsuleInsights({ items, itemWearCounts }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const insights = useMemo(() => {
    const list: WardrobeInsight[] = [];
    if (items.length === 0) return list;

    const tops = items.filter((i) => i.category === 'Tops').length;
    const bottoms = items.filter((i) => i.category === 'Bottoms').length;
    const shoes = items.filter((i) => i.category === 'Shoes').length;
    const dresses = items.filter((i) => i.category === 'Dresses').length;
    const favorites = items.filter((i) => i.favorite).length;
    const unworn = items.filter((i) => {
      const count = itemWearCounts ? itemWearCounts[i.id] : i.wearCount;
      return !count || count === 0;
    }).length;

    // Capsule Balance Rule
    if (tops > 0 && bottoms > 0) {
      const ratio = tops / bottoms;
      if (ratio >= 1.5 && ratio <= 2.5) {
        list.push({
          id: 'ratio-ideal',
          title: 'Optimal Capsule Ratio',
          body: `You maintain a balanced ${tops} Tops to ${bottoms} Bottoms ratio (ideal 2:1 capsule proportion).`,
          icon: 'sparkles-outline',
          tag: 'HARMONY',
          tone: 'sage',
        });
      } else if (ratio < 1.0) {
        list.push({
          id: 'ratio-bottom-heavy',
          title: 'Top Layering Opportunity',
          body: `You have more bottoms (${bottoms}) than tops (${tops}). Adding 2-3 versatile shirts or knits will unlock new looks.`,
          icon: 'shirt-outline',
          tag: 'STYLING TIP',
          tone: 'gold',
        });
      } else if (ratio > 3.0) {
        list.push({
          id: 'ratio-top-heavy',
          title: 'Anchor Pieces Needed',
          body: `You have ${tops} tops for only ${bottoms} bottoms. A pair of tailored trousers or classic denim will multiply outfits.`,
          icon: 'layers-outline',
          tag: 'CAPSULE GAP',
          tone: 'terracotta',
        });
      }
    }

    // Unworn rotation insight
    if (unworn > 0 && unworn >= items.length * 0.4) {
      list.push({
        id: 'unworn-rotation',
        title: 'Untapped Potential',
        body: `${unworn} pieces in your atelier have not been styled yet. Try drafting a look with them on the Studio Canvas.`,
        icon: 'time-outline',
        tag: 'ROTATION',
        tone: 'plum',
      });
    }

    // Favorite staples
    if (favorites >= 3) {
      list.push({
        id: 'staples-defined',
        title: 'Core Signature Pillars',
        body: `${favorites} wardrobe staples marked as favorites form the backbone of your daily personal lookbook.`,
        icon: 'heart-outline',
        tag: 'CURATION',
        tone: 'gold',
      });
    }

    // Dresses one-piece looks
    if (dresses >= 2) {
      list.push({
        id: 'dresses-foundation',
        title: 'One-Piece Versatility',
        body: `You have ${dresses} statement dresses for instant head-to-toe styling on the Studio Canvas.`,
        icon: 'sparkles-outline',
        tag: 'VERSATILITY',
        tone: 'plum',
      });
    }

    // Shoes foundation
    if (shoes === 0 && items.length >= 4) {
      list.push({
        id: 'shoes-missing',
        title: 'Complete The Flatlay',
        body: 'Photograph shoes to compose complete head-to-toe lookbook exports on the Studio Canvas.',
        icon: 'footsteps-outline',
        tag: 'ESSENTIAL',
        tone: 'terracotta',
      });
    }

    return list;
  }, [items, itemWearCounts]);

  if (insights.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Stylist Insights</Text>
      <Text style={styles.sectionSubtitle}>Algorithmic guidance tailored to your wardrobe</Text>

      <View style={styles.insightsList}>
        {insights.map((insight) => {
          const toneColor = {
            gold: c.gold,
            sage: c.catTops,
            terracotta: c.catBottoms,
            plum: c.catDresses,
          }[insight.tone];

          const toneBg = {
            gold: c.goldContainer,
            sage: c.catTopsBg,
            terracotta: c.catBottomsBg,
            plum: c.catDressesBg,
          }[insight.tone];

          return (
            <View key={insight.id} style={styles.insightCard}>
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: toneBg }]}>
                  <Ionicons name={insight.icon as any} size={16} color={toneColor} />
                </View>
                <View style={[styles.tagPill, { backgroundColor: toneBg }]}>
                  <Text style={[styles.tagText, { color: toneColor }]}>{insight.tag}</Text>
                </View>
              </View>

              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightBody}>{insight.body}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontFamily: fonts.displaySemiBold,
      fontSize: 18,
      color: c.onSurface,
    },
    sectionSubtitle: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: c.onSurfaceVariant,
      marginTop: 2,
      marginBottom: 12,
    },
    insightsList: {
      gap: 10,
    },
    insightCard: {
      backgroundColor: c.surfaceContainer,
      borderRadius: shapes.lg,
      padding: 16,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tagPill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: shapes.full,
    },
    tagText: {
      fontFamily: fonts.bold,
      fontSize: 10,
      letterSpacing: 0.5,
    },
    insightTitle: {
      fontFamily: fonts.semiBold,
      fontSize: 15,
      color: c.onSurface,
      marginBottom: 4,
    },
    insightBody: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: c.onSurfaceVariant,
      lineHeight: 18,
    },
  });
}
