import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ClothingCategory, Item, Season } from '../types';
import { SEASON_ICONS, clothingCategories, seasons } from '../constants';
import { useTheme, fonts, shapes, type Palette } from '../theme';

type Props = {
  item: Item | null;
  visible: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onRemove: (item: Item) => void;
  onUpdate?: (id: string, updates: Partial<Omit<Item, 'id' | 'image'>>) => void;
  onLogWorn?: (id: string) => void;
};

export function ItemDetailModal(props: Props) {
  return <ItemDetailSheet key={props.item ? `${props.item.id}-${props.visible}` : 'closed'} {...props} />;
}

function ItemDetailSheet({
  item,
  visible,
  onClose,
  onToggleFavorite,
  onRemove,
  onUpdate,
  onLogWorn,
}: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item?.name || '');
  const [editCategory, setEditCategory] = useState<ClothingCategory>(item?.category || 'Tops');
  const [editSeason, setEditSeason] = useState<Season>(item?.season || 'All-Season');

  if (!item) return null;

  const isGenericName =
    !item.name ||
    item.name === 'Piece' ||
    item.name === 'Tops' ||
    item.name === 'Bottoms' ||
    item.name === 'Dresses' ||
    item.name === 'Shoes' ||
    item.name === 'Accessories' ||
    item.name.startsWith('Piece ') ||
    item.name.startsWith('Tops ') ||
    item.name.startsWith('Bottoms ') ||
    item.name.startsWith('Dresses ') ||
    item.name.startsWith('Shoes ') ||
    item.name.startsWith('Accessories ');

  const hasCustomName = !isGenericName;
  const wearCount = item.wearCount || 0;

  const handleFavoritePress = () => {
    void Haptics.selectionAsync();
    onToggleFavorite(item.id);
  };

  const handleLogWornPress = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (onLogWorn) {
      onLogWorn(item.id);
    }
  };

  const handleSaveEdit = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (onUpdate) {
      onUpdate(item.id, {
        name: editName.trim() || item.name,
        category: editCategory,
        season: editSeason,
      });
    }
    setIsEditing(false);
  };

  const handleDeletePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Remove Piece',
      hasCustomName
        ? `"${item.name}" will be deleted from your atelier.`
        : 'This piece will be deleted from your atelier.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            onClose();
            onRemove(item);
          },
        },
      ]
    );
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
          {/* Close, Edit & Favorite Top Controls */}
          <View style={styles.topControls}>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={({ pressed }) => [styles.glassControlBtn, pressed && styles.pressed]}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </Pressable>

            <View style={styles.topRightControls}>
              <Pressable
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsEditing((prev) => !prev);
                }}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.glassControlBtn,
                  isEditing && styles.glassControlActive,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={isEditing ? 'checkmark' : 'pencil'}
                  size={18}
                  color={isEditing ? c.gold : '#FFFFFF'}
                />
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
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* Hero Image */}
            <View style={styles.heroImageWrap}>
              <Image source={{ uri: item.image }} style={styles.heroImage} resizeMode="contain" />
            </View>

            {/* Information Section */}
            <View style={styles.infoContent}>
              {isEditing ? (
                /* Edit Form */
                <View style={styles.editSection}>
                  <Text style={styles.editHeaderTitle}>Edit Piece Details</Text>

                  <Text style={styles.fieldLabel}>PIECE NAME</Text>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="e.g. Linen Blouse"
                    placeholderTextColor={c.onSurfaceVariant}
                    style={styles.editTextInput}
                  />

                  <Text style={styles.fieldLabel}>CATEGORY</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.editCategoryRow}>
                    {clothingCategories.map((cat) => (
                      <Pressable
                        key={cat}
                        onPress={() => setEditCategory(cat)}
                        style={[
                          styles.editChip,
                          editCategory === cat && styles.editChipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.editChipText,
                            editCategory === cat && styles.editChipTextSelected,
                          ]}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <Text style={styles.fieldLabel}>SEASON</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.editCategoryRow}>
                    {seasons.map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => setEditSeason(s)}
                        style={[
                          styles.editChip,
                          editSeason === s && styles.editChipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.editChipText,
                            editSeason === s && styles.editChipTextSelected,
                          ]}
                        >
                          {s}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <View style={styles.editActionRow}>
                    <Pressable
                      onPress={() => setIsEditing(false)}
                      style={[styles.editBtn, styles.editCancelBtn]}
                    >
                      <Text style={styles.editCancelText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleSaveEdit}
                      style={[styles.editBtn, styles.editSaveBtn]}
                    >
                      <Text style={styles.editSaveText}>Save Changes</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                /* View Mode */
                <>
                  {/* Pills Row */}
                  <View style={styles.pillsRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{item.category}</Text>
                    </View>

                    {item.season && item.season !== 'All-Season' && (
                      <View style={styles.seasonPill}>
                        <Ionicons
                          name={SEASON_ICONS[item.season] || 'sparkles-outline'}
                          size={12}
                          color={c.onSurfaceVariant}
                        />
                        <Text style={styles.seasonPillText}>{item.season}</Text>
                      </View>
                    )}

                    <View style={styles.wearCountPill}>
                      <Ionicons name="time-outline" size={12} color={c.gold} />
                      <Text style={styles.wearCountText}>
                        {wearCount === 1 ? 'Worn 1 time' : `Worn ${wearCount} times`}
                      </Text>
                    </View>
                  </View>

                  {hasCustomName && <Text style={styles.title}>{item.name}</Text>}

                  {/* Actions Section */}
                  <View style={[styles.actionButtons, !hasCustomName && styles.actionButtonsOnly]}>
                    <Pressable
                      onPress={handleLogWornPress}
                      style={({ pressed }) => [styles.wearTodayButton, pressed && styles.pressed]}
                    >
                      <Ionicons name="sparkles" size={16} color={c.gold} />
                      <Text style={styles.wearTodayText}>Log as Worn Today</Text>
                    </Pressable>

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
                </>
              )}
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
    topRightControls: {
      flexDirection: 'row',
      gap: 8,
    },
    glassControlBtn: {
      width: 40,
      height: 40,
      borderRadius: shapes.full,
      backgroundColor: 'rgba(18, 16, 14, 0.65)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    glassControlActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    pillsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    categoryBadge: {
      backgroundColor: c.secondaryContainer,
      borderRadius: shapes.xs,
      paddingHorizontal: 8,
      paddingVertical: 3.5,
    },
    categoryBadgeText: {
      fontFamily: fonts.bold,
      color: c.onSecondaryContainer,
      fontSize: 11,
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
    wearCountPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.goldContainer,
      borderRadius: shapes.xs,
      paddingHorizontal: 8,
      paddingVertical: 3.5,
    },
    wearCountText: {
      fontFamily: fonts.bold,
      color: c.onPrimaryContainer,
      fontSize: 11,
    },
    title: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 24,
      letterSpacing: 0.2,
      marginBottom: 16,
    },
    actionButtons: {
      gap: 10,
    },
    actionButtonsOnly: {
      marginTop: 4,
    },
    wearTodayButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 46,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.gold,
    },
    wearTodayText: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 13.5,
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
    editSection: {
      gap: 10,
    },
    editHeaderTitle: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 18,
      marginBottom: 6,
    },
    fieldLabel: {
      fontFamily: fonts.extraBold,
      color: c.onSurfaceVariant,
      fontSize: 10,
      letterSpacing: 1.1,
      marginTop: 6,
    },
    editTextInput: {
      height: 46,
      borderRadius: shapes.md,
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      paddingHorizontal: 14,
      fontFamily: fonts.medium,
      color: c.onSurface,
      fontSize: 14.5,
    },
    editCategoryRow: {
      flexDirection: 'row',
      gap: 6,
      paddingVertical: 4,
    },
    editChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      marginRight: 6,
    },
    editChipSelected: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    editChipText: {
      fontFamily: fonts.semiBold,
      color: c.onSurfaceVariant,
      fontSize: 12,
    },
    editChipTextSelected: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
    },
    editActionRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
    },
    editBtn: {
      flex: 1,
      height: 44,
      borderRadius: shapes.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editCancelBtn: {
      backgroundColor: c.surfaceContainerHigh,
    },
    editCancelText: {
      fontFamily: fonts.bold,
      color: c.onSurfaceVariant,
      fontSize: 13,
    },
    editSaveBtn: {
      backgroundColor: c.primary,
    },
    editSaveText: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 13,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.98 }],
    },
  });
