import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { Item } from '../types';
import { SEASON_ICONS } from '../constants';
import { useTheme, fonts, shapes, type Palette } from '../theme';

type Props = {
  item: Item | null;
  visible: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onRemove: (item: Item) => void;
};

export function ItemDetailModal({
  item,
  visible,
  onClose,
  onToggleFavorite,
  onRemove,
}: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  if (!item) return null;

  const handleFavoritePress = () => {
    void Haptics.selectionAsync();
    onToggleFavorite(item.id);
  };

  const handleDeletePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Remove Piece', `"${displayName}" will be deleted from your atelier.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          onClose();
          onRemove(item);
        },
      },
    ]);
  };

  const displayName =
    item.name === 'Tops' ||
    item.name === 'Bottoms' ||
    item.name === 'Dresses' ||
    item.name === 'Shoes'
      ? 'Piece'
      : item.name;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={styles.cardModal}>
          {/* Close & Favorite Top Controls */}
          <View style={styles.topControls}>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={({ pressed }) => [styles.glassControlBtn, pressed && styles.pressed]}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </Pressable>

            <Pressable
              accessibilityLabel={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
              onPress={handleFavoritePress}
              hitSlop={10}
              style={({ pressed }) => [
                styles.glassControlBtn,
                item.favorite && styles.glassFavoriteActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={item.favorite ? 'heart' : 'heart-outline'}
                size={20}
                color={item.favorite ? '#E0534C' : '#FFFFFF'}
              />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* Hero Image */}
            <View style={styles.heroImageWrap}>
              <Image source={{ uri: item.image }} style={styles.heroImage} resizeMode="contain" />
            </View>

            {/* Information Section */}
            <View style={styles.infoContent}>
              {item.season && item.season !== 'All-Season' && (
                <View style={styles.seasonRow}>
                  <View style={styles.seasonPill}>
                    <Ionicons
                      name={SEASON_ICONS[item.season] || 'sparkles-outline'}
                      size={12}
                      color={c.onSurfaceVariant}
                    />
                    <Text style={styles.seasonPillText}>{item.season}</Text>
                  </View>
                </View>
              )}

              <Text style={styles.title}>{displayName}</Text>

              {/* Actions Section */}
              <View style={styles.actionButtons}>
                <Pressable
                  onPress={handleFavoritePress}
                  style={({ pressed }) => [
                    styles.favoriteActionButton,
                    item.favorite ? styles.favoriteActionActive : styles.favoriteActionInactive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={item.favorite ? 'heart' : 'heart-outline'}
                    size={18}
                    color={item.favorite ? '#FFFFFF' : c.onSurface}
                  />
                  <Text
                    style={[
                      styles.favoriteActionText,
                      item.favorite
                        ? styles.favoriteActionTextActive
                        : styles.favoriteActionTextInactive,
                    ]}
                  >
                    {item.favorite ? 'Favorited Piece' : 'Add to Favorites'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleDeletePress}
                  style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
                >
                  <Ionicons name="trash-outline" size={17} color={c.error} />
                  <Text style={styles.deleteButtonText}>Delete Piece</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: c.scrim,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'ios' ? 48 : 24,
    },
    scrim: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    cardModal: {
      width: '100%',
      maxWidth: 420,
      maxHeight: '92%',
      backgroundColor: c.cardBg,
      borderRadius: shapes.xxl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.outlineVariant,
      position: 'relative',
    },
    topControls: {
      position: 'absolute',
      top: 14,
      left: 14,
      right: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      zIndex: 10,
    },
    glassControlBtn: {
      width: 40,
      height: 40,
      borderRadius: shapes.full,
      backgroundColor: 'rgba(18, 16, 14, 0.65)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    glassFavoriteActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    heroImageWrap: {
      width: '100%',
      height: 380,
      backgroundColor: c.cardBg,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
    },
    heroImage: {
      width: '100%',
      height: '100%',
      backgroundColor: 'transparent',
    },
    infoContent: {
      padding: 20,
    },
    seasonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    seasonPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: shapes.xs,
      paddingHorizontal: 8,
      paddingVertical: 3.5,
    },
    seasonPillText: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 11,
    },
    title: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 24,
      letterSpacing: 0.2,
      marginBottom: 20,
    },
    actionButtons: {
      gap: 10,
    },
    favoriteActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 48,
      borderRadius: shapes.full,
    },
    favoriteActionActive: {
      backgroundColor: '#E0534C',
    },
    favoriteActionInactive: {
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    favoriteActionText: {
      fontFamily: fonts.bold,
      fontSize: 14,
    },
    favoriteActionTextActive: {
      color: '#FFFFFF',
    },
    favoriteActionTextInactive: {
      color: c.onSurface,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 44,
      borderRadius: shapes.full,
    },
    deleteButtonText: {
      fontFamily: fonts.bold,
      color: c.error,
      fontSize: 13.5,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.98 }],
    },
  });
