import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { Item } from '../types';
import { useTheme, fonts, shapes, type Palette } from '../theme';
import { todayISO } from '../lib/format';

type Props = {
  item: Item;
  onToggleFavorite: (id: string) => void;
  onToggleWornToday?: (id: string) => void;
  onRemove: (item: Item) => void;
};

export function ItemCard({ item, onToggleFavorite, onToggleWornToday, onRemove }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);
  const isWornToday = item.wornOn === todayISO();

  const handleFavoritePress = () => {
    void Haptics.selectionAsync();
    onToggleFavorite(item.id);
  };

  const handleWornPress = () => {
    if (onToggleWornToday) {
      void Haptics.selectionAsync();
      onToggleWornToday(item.id);
    }
  };

  const handleLongPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRemove(item);
  };

  return (
    <Pressable
      onLongPress={handleLongPress}
      delayLongPress={350}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

        {/* Tonal Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
        </View>

        {/* M3 Favorite Action */}
        <Pressable
          accessibilityLabel={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
          onPress={handleFavoritePress}
          hitSlop={8}
          style={({ pressed }) => [
            styles.favoriteButton,
            item.favorite && styles.favoriteButtonActive,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={item.favorite ? 'heart' : 'heart-outline'}
            size={18}
            color={item.favorite ? c.primary : c.onSurfaceVariant}
          />
        </Pressable>

        {/* Worn Today Badge / Action */}
        {isWornToday ? (
          <Pressable onPress={handleWornPress} style={styles.wornBadge}>
            <Ionicons name="checkmark-circle" size={13} color={c.onTertiaryContainer} />
            <Text style={styles.wornText}>WORN TODAY</Text>
          </Pressable>
        ) : (
          <Pressable onPress={handleWornPress} hitSlop={6} style={styles.wearActionPill}>
            <Ionicons name="sparkles-outline" size={11} color={c.onSurfaceVariant} />
            <Text style={styles.wearActionText}>Wear</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.infoArea}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.subCategory}>{item.category}</Text>
      </View>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      width: '48.5%',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: shapes.xl,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      overflow: 'hidden',
      marginBottom: 16,
    },
    cardPressed: {
      opacity: 0.88,
      transform: [{ scale: 0.98 }],
    },
    imageWrap: {
      height: 200,
      width: '100%',
      backgroundColor: c.surfaceContainerHighest,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    categoryBadge: {
      position: 'absolute',
      left: 10,
      top: 10,
      backgroundColor: c.secondaryContainer,
      borderRadius: shapes.xs,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    categoryText: {
      fontFamily: fonts.bold,
      color: c.onSecondaryContainer,
      fontSize: 9.5,
      letterSpacing: 0.6,
    },
    favoriteButton: {
      position: 'absolute',
      right: 10,
      top: 10,
      width: 36,
      height: 36,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    favoriteButtonActive: {
      backgroundColor: c.primaryContainer,
    },
    wornBadge: {
      position: 'absolute',
      left: 10,
      bottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.tertiaryContainer,
      borderRadius: shapes.xs,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    wornText: {
      fontFamily: fonts.extraBold,
      color: c.onTertiaryContainer,
      fontSize: 9,
      letterSpacing: 0.5,
    },
    wearActionPill: {
      position: 'absolute',
      left: 10,
      bottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: shapes.xs,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    wearActionText: {
      fontFamily: fonts.bold,
      color: c.onSurfaceVariant,
      fontSize: 9.5,
    },
    infoArea: {
      padding: 10,
    },
    name: {
      fontFamily: fonts.displaySemiBold,
      color: c.onSurface,
      fontSize: 14.5,
      letterSpacing: -0.2,
    },
    subCategory: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 12,
      marginTop: 2,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.94 }],
    },
  });
