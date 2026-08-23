import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, fonts, shapes, type Palette } from '../theme';
import type { SortMode } from '../types';

type Props = {
  title: string;
  count: number;
  sortMode?: SortMode;
  onCycleSort?: () => void;
  activeFilterCount?: number;
  onOpenFilter?: () => void;
};

const SORT_LABELS: Record<SortMode, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  newest: { label: 'Newest', icon: 'time-outline' },
  favorites: { label: 'Favorites', icon: 'heart-outline' },
  name: { label: 'A to Z', icon: 'text-outline' },
};

export function SectionHeader({
  title,
  count,
  sortMode = 'newest',
  onCycleSort,
  activeFilterCount = 0,
  onOpenFilter,
}: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const handleSortPress = () => {
    if (onCycleSort) {
      void Haptics.selectionAsync();
      onCycleSort();
    }
  };

  const handleFilterPress = () => {
    if (onOpenFilter) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onOpenFilter();
    }
  };

  const sortInfo = SORT_LABELS[sortMode];
  const isCustomSort = sortMode !== 'newest';
  const hasFilters = activeFilterCount > 0;

  return (
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

        {onCycleSort && (
          <Pressable
            onPress={handleSortPress}
            hitSlop={8}
            style={({ pressed }) => [
              styles.actionChip,
              isCustomSort && styles.actionChipActive,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={sortInfo.icon}
              size={13}
              color={isCustomSort ? c.onPrimaryContainer : c.onSurfaceVariant}
            />
            <Text
              style={[
                styles.actionText,
                isCustomSort ? styles.actionTextActive : styles.actionTextInactive,
              ]}
            >
              {sortInfo.label}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 16,
      paddingBottom: 10,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 20,
      letterSpacing: -0.4,
    },
    countBadge: {
      backgroundColor: c.surfaceContainerHighest,
      borderRadius: shapes.full,
      paddingHorizontal: 9,
      paddingVertical: 2,
    },
    countText: {
      fontFamily: fonts.bold,
      color: c.onSurfaceVariant,
      fontSize: 12,
    },
    rightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    actionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: shapes.sm,
      backgroundColor: c.surfaceContainerLow,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    actionChipActive: {
      backgroundColor: c.primaryContainer,
      borderColor: 'transparent',
    },
    actionText: {
      fontSize: 12,
    },
    actionTextInactive: {
      fontFamily: fonts.semiBold,
      color: c.onSurfaceVariant,
    },
    actionTextActive: {
      fontFamily: fonts.bold,
      color: c.onPrimaryContainer,
    },
    pressed: {
      opacity: 0.7,
      transform: [{ scale: 0.96 }],
    },
  });
