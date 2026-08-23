import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, fonts, shapes, type Palette } from '../theme';
import type { SortMode } from '../types';

type Props = {
  title: string;
  count: number;
  sortMode?: SortMode;
  onSortChange?: (mode: SortMode) => void;
  activeFilterCount?: number;
  onOpenFilter?: () => void;
};

const SORT_OPTIONS: { id: SortMode; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'newest', label: 'Newest Added', description: 'Most recently photographed pieces first', icon: 'time-outline' },
  { id: 'favorites', label: 'Favorites First', description: 'Your favorited wardrobe staples first', icon: 'heart-outline' },
  { id: 'name', label: 'Alphabetical (A to Z)', description: 'Sorted alphabetically by piece name', icon: 'text-outline' },
];

export function SectionHeader({
  title,
  count,
  sortMode = 'newest',
  onSortChange,
  activeFilterCount = 0,
  onOpenFilter,
}: Props) {
  const c = useTheme();
  const styles = makeStyles(c);
  const [sortModalOpen, setSortModalOpen] = useState(false);

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
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        </View>

        <View style={styles.rightActions}>
          {onOpenFilter && (
            <Pressable
              onPress={handleFilterPress}
              hitSlop={8}
              style={({ pressed }) => [
                styles.actionChip,
                hasFilters && styles.actionChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={hasFilters ? 'options' : 'options-outline'}
                size={13}
                color={hasFilters ? c.onPrimaryContainer : c.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.actionText,
                  hasFilters ? styles.actionTextActive : styles.actionTextInactive,
                ]}
              >
                {hasFilters ? `Filters (${activeFilterCount})` : 'Filter'}
              </Text>
            </Pressable>
          )}

          {onSortChange && (
            <Pressable
              onPress={handleOpenSort}
              hitSlop={8}
              style={({ pressed }) => [
                styles.actionChip,
                isCustomSort && styles.actionChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={currentSortOption.icon}
                size={13}
                color={isCustomSort ? c.onPrimaryContainer : c.onSurfaceVariant}
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
                size={11}
                color={isCustomSort ? c.onPrimaryContainer : c.onSurfaceVariant}
              />
            </Pressable>
          )}
        </View>
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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 18,
      paddingBottom: 12,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 19,
      letterSpacing: -0.3,
    },
    countBadge: {
      backgroundColor: c.primaryContainer,
      borderRadius: shapes.full,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    countText: {
      fontFamily: fonts.bold,
      color: c.onPrimaryContainer,
      fontSize: 11,
      includeFontPadding: false,
    },
    rightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    actionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: shapes.full,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    actionChipActive: {
      backgroundColor: c.primaryContainer,
      borderColor: 'transparent',
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
      color: c.onPrimaryContainer,
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
      opacity: 0.75,
      transform: [{ scale: 0.96 }],
    },
  });
