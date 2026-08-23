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

export function CategoryChips({ value, onChange }: Props) {
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
          const dotColor = {
            All: c.gold,
            Tops: c.catTops,
            Bottoms: c.catBottoms,
            Dresses: c.catDresses,
            Shoes: c.catShoes,
            Accessories: c.catAccessories,
          }[item];

          return (
            <Pressable
              key={item}
              onPress={() => handleSelect(item)}
              hitSlop={4}
              style={({ pressed }) => [
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {item}
              </Text>
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
      paddingVertical: 4,
      marginBottom: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 2,
      paddingRight: 16,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 38,
      borderRadius: shapes.full,
      paddingHorizontal: 16,
      gap: 7,
    },
    chipSelected: {
      backgroundColor: c.primary,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    chipUnselected: {
      backgroundColor: c.surfaceContainerHigh,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
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
      color: c.onSurface,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.96 }],
    },
  });
