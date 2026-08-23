import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
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
import { SEASON_ICONS, clothingCategories, seasons } from '../constants';
import type { ClothingCategory, NewItemDraft, Season } from '../types';
import { pickImage, pickImages } from '../lib/images';
import { useTheme, fonts, shapes, type Palette } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (draft: NewItemDraft) => Promise<void>;
};

const CATEGORY_ICONS: Record<ClothingCategory, keyof typeof Ionicons.glyphMap> = {
  Tops: 'shirt-outline',
  Bottoms: 'layers-outline',
  Dresses: 'sparkles-outline',
  Shoes: 'footsteps-outline',
};

export function AddItemModal({ visible, onClose, onAdd }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('Tops');
  const [season, setSeason] = useState<Season>('All-Season');
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) {
      setName('');
      setCategory('Tops');
      setSeason('All-Season');
      setPhotoUris([]);
      setSaving(false);
    }
  }, [visible]);

  const handleCamera = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const uri = await pickImage(true);
    if (uri) {
      setPhotoUris([uri]);
    }
  };

  const handleLibrary = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const uris = await pickImages(8);
    if (uris.length > 0) {
      setPhotoUris(uris);
    }
  };

  const handleRemovePhoto = (index: number) => {
    void Haptics.selectionAsync();
    setPhotoUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCategorySelect = (cat: ClothingCategory) => {
    void Haptics.selectionAsync();
    setCategory(cat);
  };

  const handleSeasonSelect = (s: Season) => {
    void Haptics.selectionAsync();
    setSeason(s);
  };

  const handleAdd = async () => {
    if (photoUris.length === 0 || saving) return;
    setSaving(true);
    try {
      await onAdd({
        photoUris,
        name,
        category,
        season,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setName('');
      setPhotoUris([]);
      onClose();
    } catch {
      Alert.alert('Could not save', 'Something went wrong while storing the photo. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasPhotos = photoUris.length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>Add piece</Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <Ionicons name="close" size={20} color={c.onSurfaceVariant} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Photo Selection */}
            {hasPhotos ? (
              <View style={styles.photoContainer}>
                {photoUris.length === 1 ? (
                  <View style={styles.singlePhotoWrap}>
                    <Image source={{ uri: photoUris[0] }} style={styles.singlePhoto} />
                    <Pressable
                      onPress={() => handleRemovePhoto(0)}
                      style={styles.removePhotoButton}
                    >
                      <Ionicons name="close-circle" size={24} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.multiPhotoWrap}>
                    <View style={styles.multiPhotoHeader}>
                      <Text style={styles.multiPhotoCount}>
                        {photoUris.length} photos selected
                      </Text>
                      <Pressable onPress={() => setPhotoUris([])}>
                        <Text style={styles.clearAllText}>Clear all</Text>
                      </Pressable>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.thumbnailRow}
                    >
                      {photoUris.map((uri, index) => (
                        <View key={`${uri}-${index}`} style={styles.thumbWrapper}>
                          <Image source={{ uri }} style={styles.thumbnail} />
                          <Pressable
                            onPress={() => handleRemovePhoto(index)}
                            style={styles.removeThumbButton}
                          >
                            <Ionicons name="close" size={12} color="#FFFFFF" />
                          </Pressable>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.photoSourceCards}>
                <Pressable
                  onPress={handleLibrary}
                  style={({ pressed }) => [styles.sourceCard, pressed && styles.pressed]}
                >
                  <View style={styles.sourceIconCircle}>
                    <Ionicons name="images-outline" size={24} color={c.primary} />
                  </View>
                  <Text style={styles.sourceCardTitle}>Photo library</Text>
                  <Text style={styles.sourceCardHint}>Batch select up to 8</Text>
                </Pressable>

                <Pressable
                  onPress={handleCamera}
                  style={({ pressed }) => [styles.sourceCard, pressed && styles.pressed]}
                >
                  <View style={styles.sourceIconCircle}>
                    <Ionicons name="camera-outline" size={24} color={c.primary} />
                  </View>
                  <Text style={styles.sourceCardTitle}>Camera</Text>
                  <Text style={styles.sourceCardHint}>Photograph a piece</Text>
                </Pressable>
              </View>
            )}

            {/* Name Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>PIECE NAME (OPTIONAL)</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Linen shirt"
                placeholderTextColor={c.onSurfaceVariant}
                style={styles.textInput}
              />
            </View>

            {/* Category Selector */}
            <View style={styles.categorySection}>
              <Text style={styles.fieldLabel}>CATEGORY</Text>
              <View style={styles.categoryGrid}>
                {clothingCategories.map((cat) => {
                  const isSelected = cat === category;
                  const iconName = CATEGORY_ICONS[cat];

                  return (
                    <Pressable
                      key={cat}
                      onPress={() => handleCategorySelect(cat)}
                      style={({ pressed }) => [
                        styles.categoryTile,
                        isSelected ? styles.categoryTileSelected : styles.categoryTileUnselected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name={iconName}
                        size={18}
                        color={isSelected ? c.onSecondaryContainer : c.onSurfaceVariant}
                      />
                      <Text
                        style={[
                          styles.categoryTileText,
                          isSelected
                            ? styles.categoryTileTextSelected
                            : styles.categoryTileTextUnselected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Season Selector */}
            <View style={styles.formSection}>
              <Text style={styles.fieldLabel}>SEASON</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.seasonRow}
              >
                {seasons.map((s) => {
                  const isSelected = s === season;
                  const iconName = SEASON_ICONS[s];

                  return (
                    <Pressable
                      key={s}
                      onPress={() => handleSeasonSelect(s)}
                      style={({ pressed }) => [
                        styles.seasonChip,
                        isSelected ? styles.seasonChipSelected : styles.seasonChipUnselected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name={iconName}
                        size={15}
                        color={isSelected ? c.onPrimaryContainer : c.onSurfaceVariant}
                      />
                      <Text
                        style={[
                          styles.seasonChipText,
                          isSelected
                            ? styles.seasonChipTextSelected
                            : styles.seasonChipTextUnselected,
                        ]}
                      >
                        {s}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleAdd}
                disabled={!hasPhotos || saving}
                style={({ pressed }) => [
                  styles.saveButton,
                  (!hasPhotos || saving) && styles.saveButtonDisabled,
                  pressed && styles.pressed,
                ]}
              >
                {saving ? (
                  <ActivityIndicator color={c.onPrimary} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {hasPhotos && photoUris.length > 1
                      ? `Add ${photoUris.length} pieces`
                      : 'Add piece'}
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: c.scrim,
    },
    scrim: {
      flex: 1,
    },
    sheet: {
      backgroundColor: c.surfaceContainerLow,
      borderTopLeftRadius: shapes.xxl,
      borderTopRightRadius: shapes.xxl,
      paddingTop: 12,
      paddingHorizontal: 24,
      paddingBottom: Platform.OS === 'ios' ? 36 : 24,
      maxHeight: '90%',
    },
    handle: {
      alignSelf: 'center',
      width: 32,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.outlineVariant,
      marginBottom: 16,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 24,
      letterSpacing: 0.2,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContent: {
      paddingBottom: 16,
    },
    photoSourceCards: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    sourceCard: {
      flex: 1,
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: shapes.lg,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      paddingVertical: 18,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sourceIconCircle: {
      width: 48,
      height: 48,
      borderRadius: shapes.full,
      backgroundColor: c.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    sourceCardTitle: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 14,
      marginBottom: 2,
    },
    sourceCardHint: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 11.5,
    },
    photoContainer: {
      marginBottom: 20,
    },
    singlePhotoWrap: {
      height: 200,
      borderRadius: shapes.xl,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: c.surfaceContainerHighest,
    },
    singlePhoto: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    removePhotoButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 14,
    },
    multiPhotoWrap: {
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: shapes.lg,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      padding: 14,
    },
    multiPhotoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    multiPhotoCount: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 13.5,
    },
    clearAllText: {
      fontFamily: fonts.bold,
      color: c.primary,
      fontSize: 12.5,
    },
    thumbnailRow: {
      gap: 10,
    },
    thumbWrapper: {
      position: 'relative',
      width: 72,
      height: 92,
      borderRadius: shapes.md,
      overflow: 'hidden',
    },
    thumbnail: {
      width: '100%',
      height: '100%',
    },
    removeThumbButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: 'rgba(0,0,0,0.7)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputWrapper: {
      marginBottom: 18,
    },
    fieldLabel: {
      fontFamily: fonts.extraBold,
      color: c.onSurfaceVariant,
      fontSize: 10.5,
      letterSpacing: 1.1,
      marginBottom: 8,
    },
    textInput: {
      height: 52,
      borderRadius: shapes.md,
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      paddingHorizontal: 16,
      fontFamily: fonts.medium,
      color: c.onSurface,
      fontSize: 15,
    },
    categorySection: {
      marginBottom: 18,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryTile: {
      flex: 1,
      minWidth: '45%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 44,
      borderRadius: shapes.md,
      borderWidth: 1,
    },
    categoryTileSelected: {
      backgroundColor: c.secondaryContainer,
      borderColor: 'transparent',
    },
    categoryTileUnselected: {
      backgroundColor: c.surfaceContainerHigh,
      borderColor: c.outlineVariant,
    },
    categoryTileText: {
      fontSize: 13.5,
    },
    categoryTileTextSelected: {
      fontFamily: fonts.bold,
      color: c.onSecondaryContainer,
    },
    categoryTileTextUnselected: {
      fontFamily: fonts.semiBold,
      color: c.onSurfaceVariant,
    },
    formSection: {
      marginBottom: 22,
    },
    seasonRow: {
      flexDirection: 'row',
      gap: 8,
    },
    seasonChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      height: 38,
      paddingHorizontal: 12,
      borderRadius: shapes.full,
      borderWidth: 1,
    },
    seasonChipSelected: {
      backgroundColor: c.primaryContainer,
      borderColor: 'transparent',
    },
    seasonChipUnselected: {
      backgroundColor: c.surfaceContainerHigh,
      borderColor: c.outlineVariant,
    },
    seasonChipText: {
      fontSize: 12.5,
    },
    seasonChipTextSelected: {
      fontFamily: fonts.bold,
      color: c.onPrimaryContainer,
    },
    seasonChipTextUnselected: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    cancelButton: {
      flex: 1,
      height: 48,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      fontFamily: fonts.bold,
      color: c.onSurfaceVariant,
      fontSize: 14,
    },
    saveButton: {
      flex: 1.6,
      height: 48,
      borderRadius: shapes.full,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.38,
    },
    saveButtonText: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 14.5,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.97 }],
    },
  });
