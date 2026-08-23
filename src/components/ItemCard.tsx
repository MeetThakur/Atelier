import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { Item } from '../types';
import { SEASON_ICONS } from '../constants';
import { useTheme, fonts, shapes, type Palette } from '../theme';
import { todayISO } from '../lib/format';

type Props = {
  item: Item;
  onPress: () => void;
  onToggleFavorite: (id: string) => void;
  onToggleWornToday?: (id: string) => void;
  onRemove: (item: Item) => void;
};

export const ItemCard = memo(function ItemCard({
  item,
  onPress,
  onToggleFavorite,
  onToggleWornToday,
  onRemove,
}: Props) {
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
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={350}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

        {/* Minimal Glassmorphic Category Badge */}
        <View style={styles.glassCategoryBadge}>
          <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
        </View>

        {/* Minimal Glassmorphic Favorite Button */}
        <Pressable
          accessibilityLabel={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
          onPress={handleFavoritePress}
          hitSlop={8}
          style={({ pressed }) => [
            styles.glassIconButton,
            item.favorite && styles.glassIconButtonActive,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={item.favorite ? 'heart' : 'heart-outline'}
            size={17}
            color={item.favorite ? '#E0534C' : '#FFFFFF'}
          />
        </Pressable>

        {/* Worn Today Floating Badge */}
        {isWornToday ? (
          <Pressable onPress={handleWornPress} style={styles.wornBadge}>
            <Ionicons name="sparkles" size={11} color="#FFFFFF" />
            <Text style={styles.wornText}>WORN TODAY</Text>
          </Pressable>
        ) : (
          <Pressable onPress={handleWornPress} hitSlop={6} style={styles.wearActionPill}>
            <Ionicons name="sparkles-outline" size={11} color="#FFFFFF" />
            <Text style={styles.wearActionText}>Wear</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.infoArea}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.subCategory}>
            {item.name !== item.category ? item.category : 'Piece'}
          </Text>
          {item.season && item.season !== 'All-Season' && (
            <View style={styles.seasonBadge}>
              <Ionicons
                name={SEASON_ICONS[item.season] || 'sparkles-outline'}
                size={11}
                color={c.onSurfaceVariant}
              />
              <Text style={styles.seasonText}>{item.season}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
});

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
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    imageWrap: {
      height: 215,
      width: '100%',
      backgroundColor: c.surfaceContainerHighest,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    glassCategoryBadge: {
      position: 'absolute',
      left: 10,
      top: 10,
      backgroundColor: 'rgba(18, 16, 14, 0.55)',
      borderRadius: shapes.xs,
      paddingHorizontal: 8,
      paddingVertical: 3.5,
    },
    categoryText: {
      fontFamily: fonts.bold,
      color: '#FFFFFF',
      fontSize: 9,
      letterSpacing: 0.8,
    },
    glassIconButton: {
      position: 'absolute',
      right: 10,
      top: 10,
      width: 34,
      height: 34,
      borderRadius: shapes.full,
      backgroundColor: 'rgba(18, 16, 14, 0.55)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    glassIconButtonActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
    },
    wornBadge: {
      position: 'absolute',
      left: 10,
      bottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.tertiary,
      borderRadius: shapes.xs,
      paddingHorizontal: 8,
      paddingVertical: 3.5,
    },
    wornText: {
      fontFamily: fonts.extraBold,
      color: '#FFFFFF',
      fontSize: 9,
      letterSpacing: 0.6,
    },
    wearActionPill: {
      position: 'absolute',
      left: 10,
      bottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(18, 16, 14, 0.55)',
      borderRadius: shapes.xs,
      paddingHorizontal: 8,
      paddingVertical: 3.5,
    },
    wearActionText: {
      fontFamily: fonts.bold,
      color: '#FFFFFF',
      fontSize: 9.5,
    },
    infoArea: {
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 12,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    name: {
      flex: 1,
      fontFamily: fonts.displayMedium,
      color: c.onSurface,
      fontSize: 14.5,
      letterSpacing: 0.1,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 3,
    },
    subCategory: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 11.5,
    },
    seasonBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    seasonText: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 10,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.94 }],
    },
  });
