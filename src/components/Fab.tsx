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
      accessibilityLabel="Add clothing item"
      onPress={handlePress}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
    >
      <Ionicons name="add" size={22} color={c.onPrimaryContainer} />
      <Text style={styles.label}>Add piece</Text>
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
      gap: 8,
      height: 56,
      paddingHorizontal: 20,
      borderRadius: shapes.lg,
      backgroundColor: c.primaryContainer,
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    label: {
      fontFamily: fonts.bold,
      color: c.onPrimaryContainer,
      fontSize: 14.5,
      letterSpacing: 0.1,
    },
    pressed: {
      transform: [{ scale: 0.96 }],
      opacity: 0.85,
    },
  });
