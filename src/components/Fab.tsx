import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, type Palette } from '../theme';

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
      accessibilityLabel="Add piece to archive"
      onPress={handlePress}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
    >
      <Ionicons name="add" size={26} color={c.onPrimary} />
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      right: 16,
      bottom: 86,
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.28,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 7,
      zIndex: 100,
    },
    pressed: {
      transform: [{ scale: 0.93 }],
      opacity: 0.9,
    },
  });
