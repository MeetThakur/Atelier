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
              hitSlop={6}
              style={({ pressed }) => [
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.activeDot,
                  { backgroundColor: dotColor },
                  isSelected && styles.activeDotSelected,
                ]}
              />
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
      paddingVertical: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 6,
      paddingRight: 14,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 40,
      borderRadius: shapes.full,
      paddingHorizontal: 16,
      gap: 7,
      borderWidth: 1,
    },
    chipSelected: {
      backgroundColor: c.primary,
      borderColor: c.primary,
      shadowColor: '#000',
      shadowOpacity: 0.14,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    chipUnselected: {
      backgroundColor: c.cardBg,
      borderColor: c.outlineVariant,
    },
    activeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    activeDotSelected: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      borderWidth: 1,
      borderColor: '#FFFFFF',
    },
    chipText: {
      fontSize: 13.5,
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    chipTextSelected: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      letterSpacing: 0.2,
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
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
      color: c.onPrimary,
    },
    countTextUnselected: {
      color: c.onSurfaceVariant,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.96 }],
    },
  });
