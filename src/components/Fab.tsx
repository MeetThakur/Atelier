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
        <Ionicons name="add" size={17} color={c.onPrimary} />
      </View>
      <Text style={styles.label}>Add Piece</Text>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      right: 18,
      bottom: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      height: 48,
      paddingHorizontal: 16,
      borderRadius: shapes.full,
      backgroundColor: c.primary,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    iconWrap: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 13.5,
      letterSpacing: 0.2,
    },
    pressed: {
      transform: [{ scale: 0.94 }],
      opacity: 0.9,
    },
  });
