import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, useThemeMode, fonts, shapes, type Palette } from '../theme';
import { formatHeaderDate } from '../lib/format';

type Props = {
  greeting: string;
  totalPieces?: number | null;
  searchActive: boolean;
  onToggleSearch: () => void;
};

export function Header({ greeting, totalPieces, searchActive, onToggleSearch }: Props) {
  const c = useTheme();
  const { isDark, toggleTheme } = useThemeMode();
  const styles = makeStyles(c);

  const handleThemeToggle = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  const handleSearchToggle = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleSearch();
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftCol}>
        <View style={styles.kickerRow}>
          <Text style={styles.kickerDate}>{formatHeaderDate().toUpperCase()}</Text>
          <View style={styles.kickerDot} />
          <Text style={styles.kickerGreeting}>{greeting.toUpperCase()}</Text>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>Atelier</Text>
          {totalPieces !== null && totalPieces !== undefined && (
            <View style={styles.pieceCountPill}>
              <View style={styles.shimmerDot} />
              <Text style={styles.pieceCountText}>
                {totalPieces} {totalPieces === 1 ? 'PIECE' : 'PIECES'}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          accessibilityLabel={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onPress={handleThemeToggle}
          style={({ pressed }) => [styles.glassBtn, pressed && styles.btnPressed]}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={18}
            color={c.onSurface}
          />
        </Pressable>

        <Pressable
          accessibilityLabel="Search archive"
          onPress={handleSearchToggle}
          style={({ pressed }) => [
            styles.glassBtn,
            searchActive && styles.glassBtnActive,
            pressed && styles.btnPressed,
          ]}
        >
          <Ionicons
            name={searchActive ? 'close' : 'search-outline'}
            size={18}
            color={searchActive ? c.onPrimary : c.onSurface}
          />
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingTop: 20,
      paddingBottom: 12,
    },
    leftCol: {
      flex: 1,
    },
    kickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 2,
    },
    kickerDate: {
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
    kickerGreeting: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 10,
      letterSpacing: 0.9,
      includeFontPadding: false,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 10,
    },
    title: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 34,
      letterSpacing: -0.4,
    },
    pieceCountPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: c.primaryContainer,
      borderRadius: shapes.full,
      paddingHorizontal: 9,
      paddingVertical: 3.5,
      alignSelf: 'center',
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    shimmerDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: c.gold,
    },
    pieceCountText: {
      fontFamily: fonts.bold,
      color: c.onPrimaryContainer,
      fontSize: 9.5,
      letterSpacing: 0.8,
      includeFontPadding: false,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingBottom: 4,
    },
    glassBtn: {
      width: 40,
      height: 40,
      borderRadius: shapes.full,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    glassBtnActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    btnPressed: {
      opacity: 0.75,
      transform: [{ scale: 0.94 }],
    },
  });
