import { Pressable, StyleSheet, Text, View } from 'react-native';
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
      accessibilityLabel="Add piece to archive"
      onPress={handlePress}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="add" size={18} color={c.onPrimary} />
      </View>
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
      gap: 8,
      height: 52,
      paddingHorizontal: 18,
      borderRadius: shapes.full,
      backgroundColor: c.primary,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 7,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    iconWrap: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 14.5,
      letterSpacing: 0.3,
    },
    pressed: {
      transform: [{ scale: 0.94 }],
      opacity: 0.9,
    },
  });
