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

  return (
    <View style={styles.header}>
      <View style={styles.leftCol}>
        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{formatHeaderDate().toUpperCase()}</Text>
          <Text style={styles.greetingText}>• {greeting.toUpperCase()}</Text>
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Atelier</Text>
          {totalPieces !== null && totalPieces !== undefined && (
            <View style={styles.counterCapsule}>
              <Text style={styles.counterText}>
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
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={19}
            color={c.onSurface}
          />
        </Pressable>

        <Pressable
          accessibilityLabel="Search archive"
          onPress={onToggleSearch}
          style={({ pressed }) => [
            styles.iconButton,
            searchActive && styles.iconButtonActive,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={searchActive ? 'close' : 'search-outline'}
            size={19}
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
      paddingTop: 18,
      paddingBottom: 10,
    },
    leftCol: {
      flex: 1,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 3,
    },
    dateText: {
      fontFamily: fonts.bold,
      color: c.tertiary,
      fontSize: 10,
      letterSpacing: 1.2,
    },
    greetingText: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 10,
      letterSpacing: 0.8,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 12,
    },
    title: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 32,
      letterSpacing: 0.2,
    },
    counterCapsule: {
      backgroundColor: c.primaryContainer,
      borderRadius: shapes.full,
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: 'center',
    },
    counterText: {
      fontFamily: fonts.bold,
      color: c.onPrimaryContainer,
      fontSize: 10,
      letterSpacing: 0.8,
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingBottom: 4,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerLow,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconButtonActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.94 }],
    },
  });
