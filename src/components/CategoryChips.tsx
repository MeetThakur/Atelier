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
  counts,
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
            const count = counts ? counts[item] : undefined;
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
                hitSlop={6}
                style={({ pressed }) => [
                  styles.chip,
                  isSelected ? styles.chipSelected : styles.chipUnselected,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.activeDot,
                    { backgroundColor: dotColor },
                    isSelected && styles.activeDotSelected,
                  ]}
                />
                <Text
                  style={[
                    styles.chipText,
                    isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                  ]}
                >
                  {item}
                </Text>
                {count !== undefined && (
                  <View
                    style={[
                      styles.countBadge,
                      isSelected ? styles.countBadgeSelected : styles.countBadgeUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.countText,
                        isSelected ? styles.countTextSelected : styles.countTextUnselected,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}

          <View style={styles.divider} />

          {/* Filter Action Button */}
          {onOpenFilter && (
            <Pressable
              onPress={handleFilterPress}
              hitSlop={6}
              style={({ pressed }) => [
                styles.actionChip,
                hasFilters && styles.actionChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={hasFilters ? 'options' : 'options-outline'}
                size={14}
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

          {/* Sort Action Button */}
          {onSortChange && (
            <Pressable
              onPress={handleOpenSort}
              hitSlop={6}
              style={({ pressed }) => [
                styles.actionChip,
                isCustomSort && styles.actionChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={currentSortOption.icon}
                size={14}
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
              <Ionicons
                name="chevron-down"
                size={10}
                color={isCustomSort ? c.onPrimary : c.onSurfaceVariant}
              />
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
                      <View style={styles.checkWrap}>
                        <Ionicons name="checkmark" size={16} color={c.gold} />
                      </View>
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
      paddingVertical: 2,
      marginBottom: 6,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingVertical: 4,
      paddingRight: 16,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 36,
      borderRadius: shapes.full,
      paddingHorizontal: 14,
      gap: 6,
      borderWidth: 1,
    },
    chipSelected: {
      backgroundColor: c.primary,
      borderColor: c.primary,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    chipUnselected: {
      backgroundColor: c.cardBg,
      borderColor: c.outlineVariant,
    },
    activeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    activeDotSelected: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      borderWidth: 1,
      borderColor: '#FFFFFF',
    },
    chipText: {
      fontSize: 13,
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    chipTextSelected: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      letterSpacing: 0.1,
    },
    chipTextUnselected: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
    },
    countBadge: {
      minWidth: 18,
      height: 18,
      borderRadius: shapes.full,
      paddingHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    countBadgeSelected: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    countBadgeUnselected: {
      backgroundColor: c.surfaceContainerHighest,
    },
    countText: {
      fontFamily: fonts.extraBold,
      fontSize: 10,
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    countTextSelected: {
      color: c.onPrimary,
    },
    countTextUnselected: {
      color: c.onSurfaceVariant,
    },
    divider: {
      width: 1,
      height: 18,
      backgroundColor: c.outlineVariant,
      marginHorizontal: 2,
    },
    actionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 36,
      borderRadius: shapes.full,
      paddingHorizontal: 12,
      gap: 5,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.cardBg,
    },
    actionChipActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    actionText: {
      fontSize: 12,
      includeFontPadding: false,
    },
    actionTextInactive: {
      fontFamily: fonts.semiBold,
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
    checkWrap: {
      paddingHorizontal: 4,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.96 }],
    },
  });
