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
      <View style={styles.iconCircle}>
        <Ionicons
          name={isFilterResult ? 'filter-outline' : 'sparkles-outline'}
          size={32}
          color={c.onSurface}
        />
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
      paddingTop: 56,
      paddingBottom: 40,
      paddingHorizontal: 36,
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerLow,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 22,
      letterSpacing: -0.4,
      marginBottom: 6,
      textAlign: 'center',
    },
    message: {
      textAlign: 'center',
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 14,
      lineHeight: 21,
      maxWidth: 280,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 22,
      paddingHorizontal: 20,
      height: 42,
      borderRadius: shapes.full,
      backgroundColor: c.primary,
    },
    actionButtonText: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 13.5,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.96 }],
    },
  });
