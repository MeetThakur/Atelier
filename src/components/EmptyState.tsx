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
          name={isFilterResult ? 'search-outline' : 'shirt-outline'}
          size={36}
          color={c.primary}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onAction && actionLabel && (
        <Pressable
          onPress={handleAction}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={18} color={c.onPrimary} />
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
      paddingTop: 60,
      paddingBottom: 40,
      paddingHorizontal: 36,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: shapes.full,
      backgroundColor: c.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },
    title: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 20,
      letterSpacing: -0.3,
      marginBottom: 6,
      textAlign: 'center',
    },
    message: {
      textAlign: 'center',
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 14,
      lineHeight: 20,
      maxWidth: 270,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 24,
      paddingHorizontal: 22,
      height: 44,
      borderRadius: shapes.full,
      backgroundColor: c.primary,
    },
    actionButtonText: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 14,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.96 }],
    },
  });
