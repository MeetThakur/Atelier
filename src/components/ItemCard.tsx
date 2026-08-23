import { memo, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ClothingCategory, Item } from '../types';
import { useTheme, fonts, shapes, type Palette } from '../theme';

type Props = {
  item: Item;
  onPress: () => void;
  onOpenMenu: () => void;
  onToggleFavorite: (id: string) => void;
  aspectRatio?: number;
};

// Haute editorial category-informed pedestal ratios
const CATEGORY_ASPECT_RATIOS: Record<ClothingCategory, number> = {
  Dresses: 3 / 4.7,
  Bottoms: 3 / 4.3,
  Tops: 3 / 3.9,
  Shoes: 3 / 3.4,
  Accessories: 1 / 1.05,
};

export const ItemCard = memo(function ItemCard({
  item,
  onPress,
  onOpenMenu,
  onToggleFavorite,
  aspectRatio,
}: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const lastTapRef = useRef<number>(0);

  // Animated heart pop on double tap
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;

  const triggerHeartAnimation = () => {
    heartScale.setValue(0);
    heartOpacity.setValue(1);

    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.25,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(heartOpacity, {
        toValue: 0,
        duration: 350,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      heartScale.setValue(0);
    });
  };

  const handleCardPress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 280;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      lastTapRef.current = 0;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      triggerHeartAnimation();
      onToggleFavorite(item.id);
    } else {
      lastTapRef.current = now;
      onPress();
    }
  };

  const handleFavoritePress = () => {
    void Haptics.selectionAsync();
    triggerHeartAnimation();
    onToggleFavorite(item.id);
  };

  const handleLongPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onOpenMenu();
  };

  const displayName = item.name && item.name !== 'Piece' ? item.name : item.category;
  const subInfo = `${item.category}  •  ${item.season && item.season !== 'All-Season' ? item.season : 'All-Season'}`;

  const resolvedAspectRatio =
    aspectRatio || CATEGORY_ASPECT_RATIOS[item.category] || 3 / 4.1;

  return (
    <Pressable
      onPress={handleCardPress}
      onLongPress={handleLongPress}
      delayLongPress={350}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={[styles.imagePedestal, { aspectRatio: resolvedAspectRatio }]}>
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />

        {/* Double-tap Pop Animated Heart */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.animatedHeartWrap,
            {
              opacity: heartOpacity,
              transform: [{ scale: heartScale }],
            },
          ]}
        >
          <Ionicons name="heart" size={64} color="#E0534C" />
        </Animated.View>

        {/* Floating Heart Button at Bottom-Right of Pedestal */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            handleFavoritePress();
          }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.cornerHeartBtn,
            pressed && styles.btnPressed,
          ]}
        >
          <Ionicons
            name={item.favorite ? 'heart' : 'heart-outline'}
            size={15}
            color={item.favorite ? '#E0534C' : c.onSurface}
          />
        </Pressable>
      </View>

      {/* Piece Info Section */}
      <View style={styles.infoArea}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.subText} numberOfLines={1}>
          {subInfo}
        </Text>
      </View>
    </Pressable>
  );
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      width: '100%',
      backgroundColor: c.cardBg,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      overflow: 'hidden',
      padding: 6,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    cardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    imagePedestal: {
      width: '100%',
      backgroundColor: c.imageBg,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      position: 'relative',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      backgroundColor: 'transparent',
    },
    animatedHeartWrap: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cornerHeartBtn: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.cardBg,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1.5 },
      elevation: 3,
      borderWidth: 0.5,
      borderColor: c.outlineVariant,
    },
    btnPressed: {
      transform: [{ scale: 0.9 }],
      opacity: 0.8,
    },
    infoArea: {
      paddingHorizontal: 6,
      paddingTop: 8,
      paddingBottom: 4,
    },
    name: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 13.5,
      letterSpacing: -0.1,
      marginBottom: 2,
    },
    subText: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 11.5,
      letterSpacing: -0.1,
    },
  });
