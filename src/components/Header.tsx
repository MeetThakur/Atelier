import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, useThemeMode, fonts, shapes, type Palette } from '../theme';

type Props = {
  greeting?: string;
  totalPieces?: number | null;
  searchActive: boolean;
  onToggleSearch: () => void;
};

export function Header({ totalPieces, searchActive, onToggleSearch }: Props) {
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
        <Text style={styles.title}>Atelier</Text>
        {totalPieces !== null && totalPieces !== undefined && (
          <Text style={styles.subtitle}>
            {totalPieces} {totalPieces === 1 ? 'piece' : 'pieces'} curated
          </Text>
        )}
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          accessibilityLabel={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onPress={handleThemeToggle}
          hitSlop={8}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'sunny-outline'}
            size={18}
            color={c.onSurface}
          />
        </Pressable>

        <Pressable
          accessibilityLabel="Search archive"
          onPress={handleSearchToggle}
          hitSlop={8}
          style={({ pressed }) => [
            styles.iconBtn,
            searchActive && styles.iconBtnActive,
            pressed && styles.pressed,
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
      alignItems: 'center',
      paddingTop: 16,
      paddingBottom: 14,
      paddingHorizontal: 2,
    },
    leftCol: {
      flex: 1,
    },
    title: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 32,
      letterSpacing: -0.6,
      includeFontPadding: false,
    },
    subtitle: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 13,
      letterSpacing: -0.1,
      marginTop: 2,
      includeFontPadding: false,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    iconBtnActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.94 }],
    },
  });
