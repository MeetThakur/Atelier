import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { categories } from '../constants';
import type { Category } from '../types';
import { useTheme, fonts, shapes, type Palette } from '../theme';

type Props = {
  value: Category;
  onChange: (category: Category) => void;
  counts?: Record<Category, number>;
};

export function CategoryChips({ value, onChange, counts }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const handleSelect = (category: Category) => {
    if (category !== value) {
      void Haptics.selectionAsync();
      onChange(category);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {categories.map((item) => {
          const isSelected = item === value;
          const count = counts ? counts[item] : undefined;

          return (
            <Pressable
              key={item}
              onPress={() => handleSelect(item)}
              hitSlop={6}
              style={({ pressed }) => [
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {item}
              </Text>
              {count !== undefined && (
                <View
                  style={[
                    styles.countBadge,
                    isSelected ? styles.countBadgeSelected : styles.countBadgeUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      isSelected ? styles.countTextSelected : styles.countTextUnselected,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      paddingVertical: 6,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 4,
      paddingRight: 12,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 40,
      borderRadius: shapes.full,
      paddingHorizontal: 16,
      gap: 8,
      borderWidth: 1,
    },
    chipSelected: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    chipUnselected: {
      backgroundColor: c.surfaceContainerLow,
      borderColor: c.outlineVariant,
    },
    chipText: {
      fontSize: 13.5,
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    chipTextSelected: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
    },
    chipTextUnselected: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
    },
    countBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: shapes.full,
      paddingHorizontal: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    countBadgeSelected: {
      backgroundColor: c.onPrimary,
    },
    countBadgeUnselected: {
      backgroundColor: c.surfaceContainerHighest,
    },
    countText: {
      fontFamily: fonts.extraBold,
      fontSize: 10.5,
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    countTextSelected: {
      color: c.primary,
    },
    countTextUnselected: {
      color: c.onSurfaceVariant,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.96 }],
    },
  });
