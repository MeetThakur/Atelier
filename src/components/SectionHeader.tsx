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
};

const SORT_LABELS: Record<SortMode, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  newest: { label: 'Newest', icon: 'time-outline' },
  favorites: { label: 'Favorites', icon: 'heart-outline' },
  worn: { label: 'Worn Today', icon: 'checkmark-circle-outline' },
  name: { label: 'A to Z', icon: 'text-outline' },
};

export function SectionHeader({ title, count, sortMode = 'newest', onCycleSort }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const handleSortPress = () => {
    if (onCycleSort) {
      void Haptics.selectionAsync();
      onCycleSort();
    }
  };

  const sortInfo = SORT_LABELS[sortMode];
  const isCustomSort = sortMode !== 'newest';

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      </View>

      {onCycleSort && (
        <Pressable
          onPress={handleSortPress}
          hitSlop={8}
          style={({ pressed }) => [
            styles.sortChip,
            isCustomSort && styles.sortChipActive,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={sortInfo.icon}
            size={14}
            color={isCustomSort ? c.onPrimaryContainer : c.onSurfaceVariant}
          />
          <Text
            style={[
              styles.sortText,
              isCustomSort ? styles.sortTextActive : styles.sortTextInactive,
            ]}
          >
            {sortInfo.label}
          </Text>
        </Pressable>
      )}
    </View>
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
    sortChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: shapes.sm,
      backgroundColor: c.surfaceContainerLow,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    sortChipActive: {
      backgroundColor: c.primaryContainer,
      borderColor: 'transparent',
    },
    sortText: {
      fontSize: 12.5,
    },
    sortTextInactive: {
      fontFamily: fonts.semiBold,
      color: c.onSurfaceVariant,
    },
    sortTextActive: {
      fontFamily: fonts.bold,
      color: c.onPrimaryContainer,
    },
    pressed: {
      opacity: 0.7,
      transform: [{ scale: 0.96 }],
    },
  });
