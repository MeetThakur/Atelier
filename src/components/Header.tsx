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
            size={20}
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
      fontSize: 34,
      letterSpacing: -0.8,
    },
    counterCapsule: {
      backgroundColor: c.primaryContainer,
      borderRadius: shapes.full,
      paddingHorizontal: 9,
      paddingVertical: 3,
    },
    counterText: {
      fontFamily: fonts.bold,
      color: c.onPrimaryContainer,
      fontSize: 9.5,
      letterSpacing: 0.8,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 4,
    },
    iconButton: {
      width: 42,
      height: 42,
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
