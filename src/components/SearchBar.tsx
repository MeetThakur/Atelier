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
      <Ionicons name="search-outline" size={18} color={c.onSurfaceVariant} style={styles.icon} />
      <TextInput
        autoFocus
        value={value}
        onChangeText={onChange}
        placeholder="Search pieces, categories, seasons…"
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
          <Ionicons name="close-circle" size={18} color={c.onSurfaceVariant} />
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
      backgroundColor: c.surfaceContainerLow,
      borderRadius: shapes.full,
      height: 48,
      paddingHorizontal: 16,
      gap: 10,
      marginTop: 8,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    icon: {
      marginTop: 1,
    },
    input: {
      flex: 1,
      fontFamily: fonts.medium,
      color: c.onSurface,
      fontSize: 14.5,
      height: '100%',
    },
    clearButton: {
      padding: 4,
    },
    pressed: {
      opacity: 0.6,
    },
  });
