import { memo, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { Item } from '../types';
import { SEASON_ICONS } from '../constants';
import { useTheme, fonts, shapes, type Palette } from '../theme';

type Props = {
  item: Item;
  onPress: () => void;
  onOpenMenu: () => void;
  onToggleFavorite: (id: string) => void;
};

export const ItemCard = memo(function ItemCard({
  item,
  onPress,
  onOpenMenu,
  onToggleFavorite,
}: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const lastTapRef = useRef<number>(0);
  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 280;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double Tap detected!
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }
      lastTapRef.current = 0;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      triggerHeartAnimation();
      onToggleFavorite(item.id);
    } else {
      // First tap, queue single tap for card expansion
      lastTapRef.current = now;
      singleTapTimeoutRef.current = setTimeout(() => {
        onPress();
        singleTapTimeoutRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleLongPress = () => {
    if (singleTapTimeoutRef.current) {
      clearTimeout(singleTapTimeoutRef.current);
      singleTapTimeoutRef.current = null;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onOpenMenu();
  };

  const displayName =
    item.name === 'Tops' ||
    item.name === 'Bottoms' ||
    item.name === 'Dresses' ||
    item.name === 'Shoes'
      ? 'Piece'
      : item.name;

  return (
    <Pressable
      onPress={handleTap}
      onLongPress={handleLongPress}
      delayLongPress={350}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

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
          <Ionicons name="heart" size={68} color="#FFFFFF" style={styles.heartShadow} />
          <Ionicons name="heart" size={64} color="#E0534C" style={styles.heartForeground} />
        </Animated.View>
      </View>

      <View style={styles.infoArea}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          {item.favorite && (
            <Ionicons name="heart" size={14} color="#E0534C" style={styles.miniHeart} />
          )}
        </View>

        {item.season && item.season !== 'All-Season' && (
          <View style={styles.metaRow}>
            <View style={styles.seasonBadge}>
              <Ionicons
                name={SEASON_ICONS[item.season] || 'sparkles-outline'}
                size={11}
                color={c.onSurfaceVariant}
              />
              <Text style={styles.seasonText}>{item.season}</Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      width: '48.5%',
      backgroundColor: c.cardBg,
      borderRadius: shapes.xl,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      overflow: 'hidden',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    cardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    imageWrap: {
      height: 215,
      width: '100%',
      backgroundColor: c.cardBg,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
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
    heartShadow: {
      position: 'absolute',
      opacity: 0.8,
    },
    heartForeground: {
      position: 'relative',
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
      gap: 6,
    },
    name: {
      flex: 1,
      fontFamily: fonts.displayMedium,
      color: c.onSurface,
      fontSize: 14.5,
      letterSpacing: 0.1,
    },
    miniHeart: {
      marginLeft: 4,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginTop: 4,
    },
    seasonBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3.5,
    },
    seasonText: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 10.5,
    },
  });
