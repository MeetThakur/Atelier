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
import { formatDate, todayISO } from '../lib/format';

type Props = {
  item: Item | null;
  visible: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onToggleWornToday: (id: string) => void;
  onRemove: (item: Item) => void;
};

export function ItemDetailModal({
  item,
  visible,
  onClose,
  onToggleFavorite,
  onToggleWornToday,
  onRemove,
}: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  if (!item) return null;

  const isWornToday = item.wornOn === todayISO();

  const handleFavoritePress = () => {
    void Haptics.selectionAsync();
    onToggleFavorite(item.id);
  };

  const handleWornPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleWornToday(item.id);
  };

  const handleDeletePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Remove Piece', `"${item.name}" will be deleted from your atelier.`, [
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
              <Image source={{ uri: item.image }} style={styles.heroImage} resizeMode="cover" />
            </View>

            {/* Information Section */}
            <View style={styles.infoContent}>
              <View style={styles.categoryRow}>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryPillText}>{item.category.toUpperCase()}</Text>
                </View>
                {item.season && (
                  <View style={styles.seasonPill}>
                    <Ionicons
                      name={SEASON_ICONS[item.season] || 'sparkles-outline'}
                      size={12}
                      color={c.onSurfaceVariant}
                    />
                    <Text style={styles.seasonPillText}>{item.season}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.title}>{item.name}</Text>

              {/* History & Date Metadata */}
              <View style={styles.metaBox}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>PIECE</Text>
                  <Text style={styles.metaValue}>{item.category}</Text>
                </View>

                <View style={styles.metaDivider} />

                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>STATUS</Text>
                  <Text style={styles.metaValue}>
                    {isWornToday
                      ? 'Worn Today ✨'
                      : item.wornOn
                        ? `Worn ${formatDate(item.wornOn)}`
                        : 'Unworn'}
                  </Text>
                </View>
              </View>

              {/* Actions Section */}
              <View style={styles.actionButtons}>
                <Pressable
                  onPress={handleWornPress}
                  style={({ pressed }) => [
                    styles.wornActionButton,
                    isWornToday ? styles.wornActionActive : styles.wornActionInactive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={isWornToday ? 'sparkles' : 'sparkles-outline'}
                    size={18}
                    color={isWornToday ? '#FFFFFF' : c.onSurface}
                  />
                  <Text
                    style={[
                      styles.wornActionText,
                      isWornToday ? styles.wornActionTextActive : styles.wornActionTextInactive,
                    ]}
                  >
                    {isWornToday ? 'Worn Today' : 'Mark Worn Today'}
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
      backgroundColor: c.surfaceContainerLow,
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
      backgroundColor: c.surfaceContainerHighest,
    },
    heroImage: {
      width: '100%',
      height: '100%',
    },
    infoContent: {
      padding: 20,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    categoryPill: {
      backgroundColor: c.primary,
      borderRadius: shapes.xs,
      paddingHorizontal: 8,
      paddingVertical: 3.5,
    },
    categoryPillText: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 10,
      letterSpacing: 0.8,
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
      fontSize: 10.5,
    },
    title: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 24,
      letterSpacing: 0.2,
      marginBottom: 16,
    },
    metaBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: shapes.md,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 20,
    },
    metaItem: {
      flex: 1,
    },
    metaDivider: {
      width: 1,
      height: 28,
      backgroundColor: c.outlineVariant,
      marginHorizontal: 12,
    },
    metaLabel: {
      fontFamily: fonts.bold,
      color: c.onSurfaceVariant,
      fontSize: 9.5,
      letterSpacing: 1,
      marginBottom: 2,
    },
    metaValue: {
      fontFamily: fonts.semiBold,
      color: c.onSurface,
      fontSize: 13,
    },
    actionButtons: {
      gap: 10,
    },
    wornActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 48,
      borderRadius: shapes.full,
    },
    wornActionActive: {
      backgroundColor: c.tertiary,
    },
    wornActionInactive: {
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    wornActionText: {
      fontFamily: fonts.bold,
      fontSize: 14,
    },
    wornActionTextActive: {
      color: '#FFFFFF',
    },
    wornActionTextInactive: {
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
