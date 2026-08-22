import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, fonts, shapes, type Palette } from '../theme';

type Props = {
  value: string;
  onChange: (text: string) => void;
};

export function SearchBar({ value, onChange }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={20} color={c.onSurfaceVariant} style={styles.icon} />
      <TextInput
        autoFocus
        value={value}
        onChangeText={onChange}
        placeholder="Search wardrobe…"
        placeholderTextColor={c.onSurfaceVariant}
        style={styles.input}
        returnKeyType="search"
        clearButtonMode="never"
      />
      {!!value && (
        <Pressable
          onPress={() => onChange('')}
          hitSlop={10}
          style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
        >
          <Ionicons name="close-circle" size={20} color={c.onSurfaceVariant} />
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: shapes.full,
      height: 52,
      paddingHorizontal: 16,
      gap: 12,
      marginTop: 14,
    },
    icon: {
      marginTop: 1,
    },
    input: {
      flex: 1,
      fontFamily: fonts.medium,
      color: c.onSurface,
      fontSize: 16,
      height: '100%',
    },
    clearButton: {
      padding: 4,
    },
    pressed: {
      opacity: 0.6,
    },
  });
