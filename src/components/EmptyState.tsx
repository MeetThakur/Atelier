import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, fonts, shapes, type Palette } from '../theme';

type Props = {
  title: string;
  message: string;
  onAction?: () => void;
  actionLabel?: string;
  isFilterResult?: boolean;
};

export function EmptyState({ title, message, onAction, actionLabel, isFilterResult }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const handleAction = () => {
    if (onAction) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onAction();
    }
  };

  return (
    <View style={styles.wrap}>
      {/* Studio Pedestal Frame */}
      <View style={styles.pedestalFrame}>
        <View style={styles.pedestalGlow} />
        <View style={styles.iconCircle}>
          <Ionicons
            name={isFilterResult ? 'filter-outline' : 'shirt-outline'}
            size={28}
            color={c.gold}
          />
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onAction && actionLabel && (
        <Pressable
          onPress={handleAction}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={16} color={c.onPrimary} />
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: {
      alignItems: 'center',
      paddingTop: 54,
      paddingBottom: 40,
      paddingHorizontal: 28,
    },
    pedestalFrame: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    pedestalGlow: {
      position: 'absolute',
      width: 104,
      height: 104,
      borderRadius: shapes.full,
      backgroundColor: c.goldContainer,
      opacity: 0.7,
    },
    iconCircle: {
      width: 76,
      height: 76,
      borderRadius: shapes.full,
      backgroundColor: c.cardBg,
      borderWidth: 1.5,
      borderColor: c.outlineVariant,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    title: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 22,
      letterSpacing: -0.3,
      marginBottom: 6,
      textAlign: 'center',
    },
    message: {
      textAlign: 'center',
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 14,
      lineHeight: 21,
      maxWidth: 290,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 22,
      paddingHorizontal: 22,
      height: 44,
      borderRadius: shapes.full,
      backgroundColor: c.primary,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    actionButtonText: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 13.5,
      letterSpacing: 0.2,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.96 }],
    },
  });
