import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, fonts, shapes, type Palette } from '../../theme';
import { categories } from '../../constants';
import type { Category, Item } from '../../types';

type Props = {
  items: Item[];
  onAddPiece: (item: Item) => void;
};

export function PieceDrawer({ items, onAddPiece }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const [expanded, setExpanded] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <View style={[styles.drawerContainer, !expanded && styles.drawerCollapsed]}>
      <View style={styles.drawerHeader}>
        <Pressable
          accessibilityLabel={expanded ? 'Collapse closet tray' : 'Expand closet tray'}
          accessibilityRole="button"
          onPress={() => {
            void Haptics.selectionAsync();
            setExpanded((prev) => !prev);
          }}
          style={styles.drawerToggle}
          hitSlop={12}
        >
          <View style={styles.drawerHandle} />
        </Pressable>
      </View>

      {expanded && (
        <>
          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.drawerCategoryRow}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const dotColor = {
                All: c.gold,
                Tops: c.catTops,
                Bottoms: c.catBottoms,
                Dresses: c.catDresses,
                Shoes: c.catShoes,
                Accessories: c.catAccessories,
              }[cat];

              return (
                <Pressable
                  key={cat}
                  accessibilityLabel={`Filter tray by ${cat}`}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    setSelectedCategory(cat);
                  }}
                  hitSlop={4}
                  style={[
                    styles.drawerCatChip,
                    isSelected && styles.drawerCatChipActive,
                  ]}
                >
                  <View style={[styles.drawerDot, { backgroundColor: dotColor }]} />
                  <Text
                    style={[
                      styles.drawerCatText,
                      isSelected && styles.drawerCatTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Pieces Horizontal Tray */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.piecesTray}
          >
            {filteredItems.length === 0 ? (
              <View style={styles.emptyTrayWrap}>
                <Text style={styles.emptyTrayText}>No pieces in this category</Text>
              </View>
            ) : (
              filteredItems.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityLabel={`Add ${item.name} to canvas`}
                  accessibilityRole="button"
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onAddPiece(item);
                  }}
                  hitSlop={4}
                  style={({ pressed }) => [styles.trayCard, pressed && styles.pressed]}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.trayImage}
                    resizeMode="contain"
                  />
                  <View style={styles.trayPlusBadge}>
                    <Ionicons name="add" size={12} color={c.onPrimary} />
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    drawerContainer: {
      backgroundColor: c.surfaceContainer,
      borderTopLeftRadius: shapes.xl,
      borderTopRightRadius: shapes.xl,
      borderTopWidth: 1,
      borderColor: c.outlineVariant,
      paddingBottom: 85,
    },
    drawerCollapsed: {
      paddingBottom: 90,
    },
    drawerHeader: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    drawerToggle: {
      paddingHorizontal: 20,
      paddingVertical: 4,
    },
    drawerHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.outline,
    },
    drawerCategoryRow: {
      paddingHorizontal: 16,
      gap: 6,
      marginBottom: 10,
    },
    drawerCatChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceVariant,
    },
    drawerCatChipActive: {
      backgroundColor: c.surfaceContainerHighest,
      borderWidth: 1,
      borderColor: c.gold,
    },
    drawerDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },
    drawerCatText: {
      fontFamily: fonts.medium,
      fontSize: 12,
      color: c.onSurfaceVariant,
    },
    drawerCatTextActive: {
      color: c.onSurface,
      fontFamily: fonts.semiBold,
    },
    piecesTray: {
      paddingHorizontal: 16,
      gap: 12,
      paddingBottom: 8,
    },
    emptyTrayWrap: {
      paddingHorizontal: 16,
      paddingVertical: 18,
    },
    emptyTrayText: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: c.onSurfaceVariant,
      fontStyle: 'italic',
    },
    trayCard: {
      width: 68,
      height: 82,
      borderRadius: shapes.md,
      backgroundColor: c.surfaceVariant,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      padding: 4,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    trayImage: {
      width: '100%',
      height: '100%',
    },
    trayPlusBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: {
      opacity: 0.85,
    },
  });
}
