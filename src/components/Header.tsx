import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, fonts, shapes, type Palette } from '../theme';
import { formatHeaderDate } from '../lib/format';

type Props = {
  greeting: string;
  totalPieces?: number | null;
  searchActive: boolean;
  onToggleSearch: () => void;
};

export function Header({ greeting, totalPieces, searchActive, onToggleSearch }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  return (
    <View style={styles.header}>
      <View style={styles.leftCol}>
        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{formatHeaderDate()}</Text>
          <Text style={styles.greetingText}>• {greeting}</Text>
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Kloset</Text>
          {totalPieces !== null && totalPieces !== undefined && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {totalPieces} {totalPieces === 1 ? 'item' : 'items'}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          accessibilityLabel="Search kloset"
          onPress={onToggleSearch}
          style={({ pressed }) => [
            styles.iconButton,
            searchActive && styles.iconButtonActive,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={searchActive ? 'close' : 'search'}
            size={22}
            color={searchActive ? c.onPrimary : c.onSurfaceVariant}
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
      paddingTop: 16,
      paddingBottom: 8,
    },
    leftCol: {
      flex: 1,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    dateText: {
      fontFamily: fonts.semiBold,
      color: c.primary,
      fontSize: 12,
      letterSpacing: 0.2,
    },
    greetingText: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 12,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    title: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 32,
      letterSpacing: -0.5,
    },
    badge: {
      backgroundColor: c.secondaryContainer,
      borderRadius: shapes.full,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    badgeText: {
      fontFamily: fonts.bold,
      color: c.onSecondaryContainer,
      fontSize: 12,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconButton: {
      width: 48,
      height: 48,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconButtonActive: {
      backgroundColor: c.primary,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.94 }],
    },
  });
