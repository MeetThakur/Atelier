import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { Item } from '../types';
import { useTheme, fonts, shapes, type Palette } from '../theme';

type Props = {
  item: Item | null;
  visible: boolean;
  onClose: () => void;
  onOpenDetails: (item: Item) => void;
  onToggleFavorite: (id: string) => void;
  onRemove: (item: Item) => void;
};

export function ItemActionSheet({
  item,
  visible,
  onClose,
  onOpenDetails,
  onToggleFavorite,
  onRemove,
}: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  if (!item) return null;

  const handleDetails = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    onOpenDetails(item);
  };

  const handleFavorite = () => {
    void Haptics.selectionAsync();
    onToggleFavorite(item.id);
    onClose();
  };

  const handleDelete = () => {
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
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Piece Header Preview */}
          <View style={styles.previewRow}>
            <Image source={{ uri: item.image }} style={styles.thumb} />
            <View style={styles.previewInfo}>
              <Text style={styles.pieceName} numberOfLines={1}>
                {displayName}
              </Text>
              {item.season && item.season !== 'All-Season' && (
                <View style={styles.badgeRow}>
                  <Text style={styles.pieceSeason}>{item.season}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Action Menu Rows */}
          <View style={styles.actionsList}>
            <Pressable
              onPress={handleDetails}
              style={({ pressed }) => [styles.actionRow, pressed && styles.rowPressed]}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="expand-outline" size={18} color={c.onSurface} />
              </View>
              <Text style={styles.actionLabel}>View Full Details</Text>
              <Ionicons name="chevron-forward" size={16} color={c.onSurfaceVariant} />
            </Pressable>

            <Pressable
              onPress={handleFavorite}
              style={({ pressed }) => [styles.actionRow, pressed && styles.rowPressed]}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name={item.favorite ? 'heart' : 'heart-outline'}
                  size={18}
                  color={item.favorite ? '#E0534C' : c.onSurface}
                />
              </View>
              <Text style={styles.actionLabel}>
                {item.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Text>
              {item.favorite && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>Active</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.actionRow,
                styles.deleteActionRow,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={[styles.iconCircle, styles.deleteIconCircle]}>
                <Ionicons name="trash-outline" size={18} color={c.error} />
              </View>
              <Text style={[styles.actionLabel, styles.deleteLabel]}>Delete Piece</Text>
            </Pressable>
          </View>
        </View>
      </View>
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
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    sheet: {
      backgroundColor: c.surfaceContainerLow,
      borderTopLeftRadius: shapes.xxl,
      borderTopRightRadius: shapes.xxl,
      paddingTop: 12,
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === 'ios' ? 36 : 24,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    handle: {
      alignSelf: 'center',
      width: 34,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.outlineVariant,
      marginBottom: 16,
    },
    previewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 4,
      paddingHorizontal: 4,
    },
    thumb: {
      width: 52,
      height: 64,
      borderRadius: shapes.sm,
      backgroundColor: c.surfaceContainerHighest,
    },
    previewInfo: {
      flex: 1,
    },
    pieceName: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 17,
      letterSpacing: 0.1,
      marginBottom: 3,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    pieceSeason: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 12,
    },
    divider: {
      height: 1,
      backgroundColor: c.outlineVariant,
      marginVertical: 14,
    },
    actionsList: {
      gap: 4,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 11,
      paddingHorizontal: 12,
      borderRadius: shapes.md,
      gap: 12,
    },
    rowPressed: {
      backgroundColor: c.surfaceContainerHigh,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionLabel: {
      flex: 1,
      fontFamily: fonts.semiBold,
      color: c.onSurface,
      fontSize: 14.5,
    },
    activeTag: {
      backgroundColor: c.primaryContainer,
      paddingHorizontal: 8,
      paddingVertical: 2.5,
      borderRadius: shapes.full,
    },
    activeTagText: {
      fontFamily: fonts.bold,
      color: c.onPrimaryContainer,
      fontSize: 10.5,
    },
    deleteActionRow: {
      marginTop: 2,
    },
    deleteIconCircle: {
      backgroundColor: c.errorContainer,
    },
    deleteLabel: {
      color: c.error,
    },
  });
