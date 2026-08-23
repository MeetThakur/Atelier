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
      // Double Tap detected -> trigger animated heart!
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

  const isGenericName =
    !item.name ||
    item.name === 'Piece' ||
    item.name === 'Tops' ||
    item.name === 'Bottoms' ||
    item.name === 'Dresses' ||
    item.name === 'Shoes' ||
    item.name.startsWith('Piece ') ||
    item.name.startsWith('Tops ') ||
    item.name.startsWith('Bottoms ') ||
    item.name.startsWith('Dresses ') ||
    item.name.startsWith('Shoes ');

  const hasCustomName = !isGenericName;
  const hasSeason = item.season && item.season !== 'All-Season';

  return (
    <Pressable
      onPress={handleCardPress}
      onLongPress={handleLongPress}
      delayLongPress={350}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={[styles.imageWrap, !hasCustomName && !hasSeason && styles.imageWrapFull]}>
        <View style={styles.studioPedestal}>
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
        </View>

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

        {/* Corner Favorite Button Indicator */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            handleFavoritePress();
          }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.cornerFavoriteBtn,
            item.favorite && styles.cornerFavoriteBtnActive,
            pressed && styles.btnPressed,
          ]}
        >
          <Ionicons
            name={item.favorite ? 'heart' : 'heart-outline'}
            size={13}
            color={item.favorite ? '#E0534C' : c.onSurfaceVariant}
          />
        </Pressable>
      </View>

      {(hasCustomName || hasSeason) && (
        <View style={styles.infoArea}>
          {hasCustomName && (
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          )}

          {hasSeason && (
            <View style={styles.metaRow}>
              <View style={styles.seasonBadge}>
                <Ionicons
                  name={SEASON_ICONS[item.season!] || 'sparkles-outline'}
                  size={11}
                  color={c.gold}
                />
                <Text style={styles.seasonText}>{item.season}</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      width: '48.5%',
      backgroundColor: c.cardBg,
      borderRadius: shapes.xxl,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      overflow: 'hidden',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    cardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.97 }],
    },
    imageWrap: {
      width: '100%',
      aspectRatio: 3 / 4,
      maxHeight: 220,
      backgroundColor: c.cardBg,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
    },
    imageWrapFull: {
      aspectRatio: 3 / 4,
      maxHeight: 235,
      padding: 8,
    },
    studioPedestal: {
      width: '100%',
      height: '100%',
      backgroundColor: c.imageBg,
      borderRadius: shapes.lg,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
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
    heartShadow: {
      position: 'absolute',
      opacity: 0.8,
    },
    heartForeground: {
      position: 'relative',
    },
    cornerFavoriteBtn: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 3,
      borderWidth: 0.5,
      borderColor: 'rgba(0, 0, 0, 0.06)',
    },
    cornerFavoriteBtnActive: {
      backgroundColor: '#FFFFFF',
    },
    btnPressed: {
      transform: [{ scale: 0.9 }],
      opacity: 0.8,
    },
    infoArea: {
      paddingHorizontal: 14,
      paddingTop: 4,
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
      fontSize: 14,
      letterSpacing: 0.1,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginTop: 3,
    },
    seasonBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3.5,
    },
    seasonText: {
      fontFamily: fonts.semiBold,
      color: c.onSurfaceVariant,
      fontSize: 10.5,
      letterSpacing: 0.3,
    },
  });
