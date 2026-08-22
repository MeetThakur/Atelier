import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, fonts, shapes, type Palette } from '../theme';

type Props = {
  pieces: number | null;
  favorites: number;
  categoriesUsed: number;
  wornTodayCount?: number;
};

export function StatsCard({ pieces, favorites, categoriesUsed, wornTodayCount = 0 }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  return (
    <View style={styles.card}>
      <View style={styles.stat}>
        <View style={styles.iconCircle}>
          <Ionicons name="shirt-outline" size={14} color={c.onSurface} />
        </View>
        <Text style={styles.value}>{pieces ?? '—'}</Text>
        <Text style={styles.label}>PIECES</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.stat}>
        <View style={[styles.iconCircle, favorites > 0 && styles.iconCirclePrimary]}>
          <Ionicons
            name={favorites > 0 ? 'heart' : 'heart-outline'}
            size={14}
            color={favorites > 0 ? c.primary : c.onSurfaceVariant}
          />
        </View>
        <Text style={[styles.value, favorites > 0 && styles.valuePrimary]}>
          {pieces === null ? '—' : favorites}
        </Text>
        <Text style={styles.label}>FAVORITES</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.stat}>
        <View style={[styles.iconCircle, wornTodayCount > 0 && styles.iconCircleTertiary]}>
          <Ionicons
            name={wornTodayCount > 0 ? 'sparkles' : 'sparkles-outline'}
            size={14}
            color={wornTodayCount > 0 ? c.tertiary : c.onSurfaceVariant}
          />
        </View>
        <Text style={[styles.value, wornTodayCount > 0 && styles.valueTertiary]}>
          {pieces === null ? '—' : wornTodayCount}
        </Text>
        <Text style={styles.label}>WORN TODAY</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.stat}>
        <View style={styles.iconCircle}>
          <Ionicons name="grid-outline" size={14} color={c.onSurfaceVariant} />
        </View>
        <Text style={styles.value}>{pieces === null ? '—' : categoriesUsed}</Text>
        <Text style={styles.label}>CATEGORIES</Text>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: shapes.xl,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      marginTop: 14,
      paddingVertical: 14,
      paddingHorizontal: 8,
    },
    stat: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    iconCircle: {
      width: 28,
      height: 28,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCirclePrimary: {
      backgroundColor: c.primaryContainer,
    },
    iconCircleTertiary: {
      backgroundColor: c.tertiaryContainer,
    },
    value: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 18,
      fontVariant: ['tabular-nums'],
      lineHeight: 22,
    },
    valuePrimary: {
      color: c.primary,
    },
    valueTertiary: {
      color: c.tertiary,
    },
    label: {
      fontFamily: fonts.extraBold,
      color: c.onSurfaceVariant,
      fontSize: 8,
      letterSpacing: 1.2,
    },
    divider: {
      width: 1,
      height: 32,
      backgroundColor: c.outlineVariant,
    },
  });
