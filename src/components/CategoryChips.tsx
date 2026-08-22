import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={styles.row}
    >
      {categories.map((item) => {
        const isSelected = item === value;
        const count = counts ? counts[item] : undefined;

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
            {isSelected && (
              <Ionicons
                name="checkmark"
                size={16}
                color={c.onSecondaryContainer}
                style={styles.leadingIcon}
              />
            )}
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
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: {
      gap: 8,
      paddingTop: 16,
      paddingBottom: 6,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 38,
      borderRadius: shapes.md,
      paddingHorizontal: 14,
      gap: 6,
    },
    chipSelected: {
      backgroundColor: c.secondaryContainer,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    chipUnselected: {
      backgroundColor: c.surfaceContainerLow,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    leadingIcon: {
      marginRight: -2,
    },
    chipText: {
      fontSize: 13.5,
    },
    chipTextSelected: {
      fontFamily: fonts.bold,
      color: c.onSecondaryContainer,
    },
    chipTextUnselected: {
      fontFamily: fonts.semiBold,
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
      backgroundColor: c.onSecondaryContainer,
    },
    countBadgeUnselected: {
      backgroundColor: c.surfaceContainerHighest,
    },
    countText: {
      fontFamily: fonts.extraBold,
      fontSize: 11,
    },
    countTextSelected: {
      color: c.secondaryContainer,
    },
    countTextUnselected: {
      color: c.onSurfaceVariant,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.97 }],
    },
  });
