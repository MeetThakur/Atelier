import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, fonts, shapes, type Palette } from '../theme';

type Props = {
  onPress: () => void;
};

export function Fab({ onPress }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      accessibilityLabel="Add clothing piece"
      onPress={handlePress}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
    >
      <Ionicons name="add" size={20} color={c.onPrimary} />
      <Text style={styles.label}>Add Piece</Text>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 28,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      height: 50,
      paddingHorizontal: 20,
      borderRadius: shapes.full,
      backgroundColor: c.primary,
      shadowColor: '#000',
      shadowOpacity: 0.22,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    label: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 14,
      letterSpacing: 0.2,
    },
    pressed: {
      transform: [{ scale: 0.95 }],
      opacity: 0.9,
    },
  });
