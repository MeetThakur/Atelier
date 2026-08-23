import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { categories } from '../constants';
import type { Category, SortMode } from '../types';
import { useTheme, fonts, shapes, type Palette } from '../theme';

type Props = {
  value: Category;
  onChange: (category: Category) => void;
  counts?: Record<Category, number>;
  activeFilterCount?: number;
  onOpenFilter?: () => void;
  sortMode?: SortMode;
  onSortChange?: (mode: SortMode) => void;
};

const SORT_OPTIONS: { id: SortMode; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'newest', label: 'Newest Added', description: 'Most recently photographed pieces first', icon: 'time-outline' },
  { id: 'favorites', label: 'Favorites First', description: 'Your favorited wardrobe staples first', icon: 'heart-outline' },
  { id: 'name', label: 'Alphabetical (A to Z)', description: 'Sorted alphabetically by piece name', icon: 'text-outline' },
];

export function CategoryChips({
  value,
  onChange,
  activeFilterCount = 0,
  onOpenFilter,
  sortMode = 'newest',
  onSortChange,
}: Props) {
  const c = useTheme();
  const styles = makeStyles(c);
  const [sortModalOpen, setSortModalOpen] = useState(false);

  const handleSelect = (category: Category) => {
    if (category !== value) {
      void Haptics.selectionAsync();
      onChange(category);
    }
  };

  const handleOpenSort = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortModalOpen(true);
  };

  const handleSelectSort = (mode: SortMode) => {
    void Haptics.selectionAsync();
    onSortChange?.(mode);
    setSortModalOpen(false);
  };

  const handleFilterPress = () => {
    if (onOpenFilter) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onOpenFilter();
    }
  };

  const currentSortOption = SORT_OPTIONS.find((s) => s.id === sortMode) || SORT_OPTIONS[0];
  const isCustomSort = sortMode !== 'newest';
  const hasFilters = activeFilterCount > 0;

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {categories.map((item) => {
            const isSelected = item === value;
            const dotColor = {
              All: c.gold,
              Tops: c.catTops,
              Bottoms: c.catBottoms,
              Dresses: c.catDresses,
              Shoes: c.catShoes,
              Accessories: c.catAccessories,
            }[item];

            return (
              <Pressable
                key={item}
                onPress={() => handleSelect(item)}
                hitSlop={4}
                style={({ pressed }) => [
                  styles.chip,
                  isSelected ? styles.chipSelected : styles.chipUnselected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
                <Text
                  style={[
                    styles.chipText,
                    isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}

          {/* Filter Action */}
          {onOpenFilter && (
            <Pressable
              onPress={handleFilterPress}
              hitSlop={4}
              style={({ pressed }) => [
                styles.actionBtn,
                hasFilters && styles.actionBtnActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={hasFilters ? 'options' : 'options-outline'}
                size={13}
                color={hasFilters ? c.onPrimary : c.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.actionText,
                  hasFilters ? styles.actionTextActive : styles.actionTextInactive,
                ]}
              >
                {hasFilters ? `Season (${activeFilterCount})` : 'Season'}
              </Text>
            </Pressable>
          )}

          {/* Sort Action */}
          {onSortChange && (
            <Pressable
              onPress={handleOpenSort}
              hitSlop={4}
              style={({ pressed }) => [
                styles.actionBtn,
                isCustomSort && styles.actionBtnActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={currentSortOption.icon}
                size={13}
                color={isCustomSort ? c.onPrimary : c.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.actionText,
                  isCustomSort ? styles.actionTextActive : styles.actionTextInactive,
                ]}
              >
                {currentSortOption.label.split(' ')[0]}
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </View>

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

            <View style={styles.optionsList}>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = opt.id === sortMode;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => handleSelectSort(opt.id)}
                    style={({ pressed }) => [
                      styles.sortOptionRow,
                      isSelected && styles.sortOptionRowActive,
                      pressed && styles.optionPressed,
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
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      paddingVertical: 4,
      marginBottom: 6,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 2,
      paddingRight: 14,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 32,
      borderRadius: shapes.full,
      paddingHorizontal: 12,
      gap: 5,
    },
    chipSelected: {
      backgroundColor: c.primary,
    },
    chipUnselected: {
      backgroundColor: c.surfaceContainerHigh,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },
    chipText: {
      fontSize: 12.5,
      includeFontPadding: false,
    },
    chipTextSelected: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
    },
    chipTextUnselected: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 32,
      borderRadius: shapes.full,
      paddingHorizontal: 10,
      gap: 4,
      backgroundColor: c.surfaceContainerHigh,
    },
    actionBtnActive: {
      backgroundColor: c.primary,
    },
    actionText: {
      fontSize: 11.5,
      includeFontPadding: false,
    },
    actionTextInactive: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
    },
    actionTextActive: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
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
    optionsList: {
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
    optionPressed: {
      opacity: 0.75,
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
